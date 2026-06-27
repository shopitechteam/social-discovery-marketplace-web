"use client";

import { ApolloLink, HttpLink, Observable } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import type { RefreshTokenMutation } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";

let clientSingleton: ReturnType<typeof createClient> | undefined;

function makeClient() {
  if (typeof window !== "undefined") {
    if (!clientSingleton) clientSingleton = createClient();
    return clientSingleton;
  }
  return createClient();
}

// Tracks an in-flight refresh so concurrent requests don't trigger multiple refreshes
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(
  httpLink: HttpLink,
  refreshToken: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
            mutation RefreshToken($input: RefreshTokenInput!) {
              refreshToken(input: $input) {
                accessToken
                refreshToken
                user {
                  id
                  email
                  role
                  isVerified
                  profile { firstName lastName avatar }
                }
              }
            }
          `,
        variables: { input: { refreshToken } },
      }),
    });

    const json = (await res.json()) as {
      data?: RefreshTokenMutation;
      errors?: unknown[];
    };

    if (json.errors || !json.data?.refreshToken) return null;

    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = json.data.refreshToken;
    useAuthStore
      .getState()
      .setAuth({ accessToken, refreshToken: newRefreshToken, user });
    return accessToken;
  } catch {
    return null;
  }
}

/**
 * Shared merge for cursor-paginated feeds (forYouFeed/followingFeed/localFeed).
 *
 * - Paginating (`after` present): append, deduped by normalized ref/id so an
 *   overlapping cursor window can't insert a post twice. A duplicate key makes
 *   React remount that subtree → flicker / scroll jump when paging back/forth.
 *
 * - First page (no `after`): this fires both on the very first load AND on every
 *   background `cache-and-network` refetch when revisiting the screen (tab away →
 *   back). We must NOT blindly replace the window here: if we did, a single
 *   page-1 refetch would collapse an accumulated 200-item window down to 10 and
 *   snap scroll to the top. Instead we splice the fresh page-1 over the head of
 *   the existing list (so newly-published posts appear at the top and updated
 *   fields refresh) while KEEPING the accumulated tail the user already scrolled
 *   through. Only when there is no existing window do we take the incoming page
 *   verbatim.
 */
type FeedItem = { __ref?: string; id?: string };
type FeedPage = { items?: FeedItem[] } & Record<string, unknown>;

const itemKey = (it: FeedItem) => it.__ref ?? it.id;

function mergeFeedPage(
  existing: FeedPage | undefined,
  incoming: FeedPage,
  { args }: { args: Record<string, unknown> | null },
): FeedPage {
  const incomingItems = incoming?.items ?? [];
  const prevItems = existing?.items ?? [];

  // Pagination (fetchMore): append, deduped against everything we already have.
  if (args?.after) {
    const seen = new Set(prevItems.map(itemKey));
    const deduped = incomingItems.filter((it) => !seen.has(itemKey(it)));
    return { ...incoming, items: [...prevItems, ...deduped] };
  }

  // First page on a fresh cache → nothing to preserve, take it as-is.
  if (prevItems.length === 0) return { ...incoming, items: incomingItems };

  // First page on a populated cache (background refresh). Keep the accumulated
  // window intact: put the refreshed page-1 items first, then everything from
  // the old window that isn't in page-1 (i.e. the scrolled-past tail).
  const incomingKeys = new Set(incomingItems.map(itemKey));
  const tail = prevItems.filter((it) => !incomingKeys.has(itemKey(it)));
  return { ...incoming, items: [...incomingItems, ...tail] };
}

function createClient() {
  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  });

  // Attach Authorization header from store on every request
  const authLink = setContext((_, { headers }) => {
    const token = useAuthStore.getState().accessToken;
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  // Intercept UNAUTHENTICATED errors → refresh → retry once, invisibly
  const refreshLink = new ErrorLink(({ error, operation, forward }) => {
    if (!CombinedGraphQLErrors.is(error)) return;

    const isUnauth = error.errors.some(
      (e) =>
        e.extensions?.["code"] === "UNAUTHENTICATED" ||
        e.message?.toLowerCase().includes("unauthorized") ||
        e.message?.toLowerCase().includes("unauthenticated"),
    );

    if (!isUnauth) return;

    const { refreshToken, clearAuth } = useAuthStore.getState();
    if (!refreshToken) {
      clearAuth();
      return;
    }

    return new Observable((observer) => {
      // Deduplicate: all concurrent expired requests share one refresh call
      if (!refreshPromise) {
        refreshPromise = doRefresh(httpLink, refreshToken).finally(() => {
          refreshPromise = null;
        });
      }

      refreshPromise
        .then((newToken) => {
          if (!newToken) {
            useAuthStore.getState().clearAuth();
            observer.error(error);
            return;
          }

          // Retry original operation with new token in context
          operation.setContext(({ headers = {} }: Record<string, unknown>) => ({
            headers: {
              ...(headers as Record<string, string>),
              Authorization: `Bearer ${newToken}`,
            },
          }));

          const sub = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });

          return () => sub.unsubscribe();
        })
        .catch((err) => observer.error(err));
    });
  });

  return new ApolloClient({
    link: ApolloLink.from([refreshLink, authLink, httpLink]),

    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            forYouFeed: {
              keyArgs: [],
              merge: mergeFeedPage,
            },
            followingFeed: {
              keyArgs: [],
              merge: mergeFeedPage,
            },
            localFeed: {
              // Each location/radius is its own list; cursor args don't key it.
              keyArgs: ["latitude", "longitude", "radiusKm", "county", "subregion"],
              merge: mergeFeedPage,
            },
            comments: {
              keyArgs: ["contentId"],
              merge(existing, incoming, { args }) {
                const prevItems = existing?.items ?? [];
                const nextItems = incoming?.items ?? [];
                if (!args?.after) return { ...incoming, items: nextItems };
                return { ...incoming, items: [...prevItems, ...nextItems] };
              },
            },
            feed: {
              keyArgs: ["filter", "sortBy"],
              merge(existing, incoming, { args }) {
                const prev = existing?.edges ?? [];
                const next = incoming?.edges ?? [];
                if (!args?.after) return { ...incoming, edges: next };
                return { ...incoming, edges: [...prev, ...next] };
              },
            },
            searchProducts: {
              keyArgs: ["query", "filters"],
              merge(existing, incoming, { args }) {
                if (!args?.after) return incoming;
                return {
                  ...incoming,
                  edges: [...(existing?.edges ?? []), ...incoming.edges],
                };
              },
            },
          },
        },

        // Content is the real type returned by the API (not Post).
        // Without keyFields Apollo can't normalise content objects by ID,
        // so a stale cache entry without `creator` (e.g. a guest fetch)
        // won't be updated when the same item is later fetched as an
        // authenticated user — causing the "Seller bb58bd" flash.
        Content: {
          keyFields: ["id"],
          fields: {
            // These are FieldResolver values that differ per-viewer.
            // merge: false tells Apollo to always take the incoming value
            // rather than trying to deep-merge, which prevents stale data.
            isLikedByMe: { merge: false },
            isMyContent: { merge: false },
            creator: { merge: false },
          },
        },

        Post: {
          keyFields: ["id"],
          fields: {
            likeCount: { merge: false },
            isLikedByMe: { merge: false },
            comments: {
              keyArgs: ["first", "after"],
              merge(existing, incoming, { args }) {
                if (!args?.after) return incoming;
                return {
                  ...incoming,
                  edges: [...(existing?.edges ?? []), ...incoming.edges],
                };
              },
            },
          },
        },

        User: {
          keyFields: ["id"],
          fields: {
            isFollowedByMe: { merge: false },
            followerCount: { merge: false },
            posts: {
              keyArgs: ["first", "after"],
              merge(existing, incoming, { args }) {
                if (!args?.after) return incoming;
                return {
                  ...incoming,
                  edges: [...(existing?.edges ?? []), ...incoming.edges],
                };
              },
            },
          },
        },

        Product: {
          keyFields: ["id"],
          fields: {
            price: { merge: false },
            stockCount: { merge: false },
          },
        },
      },
    }),

    defaultOptions: {
      watchQuery: {
        // Default to cache-first so revisiting a screen (tab away → back)
        // renders instantly from the normalized cache and preserves scroll.
        // Screens that genuinely need freshness opt into a one-time background
        // refresh via per-hook fetchPolicy / manual refetch.
        fetchPolicy: "cache-first",
      },
      query: {
        // One-shot reads should still prefer the cache; callers that need
        // a forced network read can override per-call.
        fetchPolicy: "cache-first",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
