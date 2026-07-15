"use client";

import { ApolloLink, HttpLink, Observable } from "@apollo/client";
import type { Reference } from "@apollo/client/cache";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import { SetContextLink } from "@apollo/client/link/context";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { useAuthStore } from "@/stores/auth";
import { refreshAccessToken } from "@/lib/auth/refresh-token";

let clientSingleton: ReturnType<typeof createClient> | undefined;

function makeClient() {
  if (typeof window !== "undefined") {
    if (!clientSingleton) clientSingleton = createClient();
    return clientSingleton;
  }
  return createClient();
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
type FeedItem = Reference | { __ref?: string; id?: string };
type FeedPage = { items?: FeedItem[] } & Record<string, unknown>;
type ReadField = <T = unknown>(fieldName: string, from?: FeedItem) => T | undefined;

function itemKey(it: FeedItem, readField: ReadField) {
  if ("__ref" in it && it.__ref) return it.__ref;
  const id = readField<string>("id", it);
  if (id) return id;
  return "id" in it ? it.id : undefined;
}

function keyedSet(items: FeedItem[], readField: ReadField) {
  const keys = new Set<string>();
  for (const item of items) {
    const key = itemKey(item, readField);
    if (key) keys.add(key);
  }
  return keys;
}

function mergeFeedPage(
  existing: FeedPage | undefined,
  incoming: FeedPage,
  {
    args,
    readField,
  }: { args: Record<string, unknown> | null; readField: ReadField },
): FeedPage {
  const incomingItems = incoming?.items ?? [];
  const prevItems = existing?.items ?? [];

  // Pagination (fetchMore): append, deduped against everything we already have.
  if (args?.after) {
    const seen = keyedSet(prevItems, readField);
    const deduped = incomingItems.filter((it) => {
      const key = itemKey(it, readField);
      return !key || !seen.has(key);
    });
    return { ...incoming, items: [...prevItems, ...deduped] };
  }

  // First page on a fresh cache → nothing to preserve, take it as-is.
  if (prevItems.length === 0) return { ...incoming, items: incomingItems };

  // First page on a populated cache (background refresh). Keep the accumulated
  // window intact: put the refreshed page-1 items first, then everything from
  // the old window that isn't in page-1 (i.e. the scrolled-past tail).
  const incomingKeys = keyedSet(incomingItems, readField);
  const tail = prevItems.filter((it) => {
    const key = itemKey(it, readField);
    return !key || !incomingKeys.has(key);
  });
  // pageInfo: if the user had scrolled past page 1 (there's a tail), keep the
  // EXISTING cursor — it points at the end of the accumulated window, so the
  // next `loadMore` continues forward instead of re-requesting page 2 (which
  // would refetch posts already shown and stall pagination). If there's NO tail
  // (the window was just page 1), take the fresh incoming pageInfo so a shifted
  // page-1 cursor stays valid.
  return {
    ...incoming,
    pageInfo:
      tail.length > 0 ? (existing?.pageInfo ?? incoming.pageInfo) : incoming.pageInfo,
    items: [...incomingItems, ...tail],
  };
}

function createClient() {
  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  });

  // Attach Authorization header from store on every request
  const authLink = new SetContextLink(({ headers }) => {
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
      // Deduped in the shared helper: all concurrent expired requests (and the
      // socket client's reconnect path) share one refresh call.
      refreshAccessToken()
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
            discoveryFacets: {
              // Facets vary with the active filters, so key on them. Two
              // separate queries share this field with disjoint selections
              // (categories vs counties/subCounties/wards) — merge:true unions
              // them instead of letting one wipe the other's cached fields.
              keyArgs: [
                "query",
                "categoryId",
                "countyId",
                "subCountyId",
                "wardId",
                "minPrice",
                "maxPrice",
                "negotiableOnly",
              ],
              merge: true,
            },
            discoveryFeed: {
              // Each search/filter/sort combination is its own list; `limit`
              // and `after` only paginate within it. Sharing mergeFeedPage
              // means revisiting Explore restores the accumulated window
              // instead of collapsing back to page 1.
              keyArgs: [
                "query",
                "categoryId",
                "countyId",
                "subCountyId",
                "wardId",
                "minPrice",
                "maxPrice",
                "negotiableOnly",
                "sort",
              ],
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
            // EngagementStats / ContentLocation have no IDs of their own and
            // different queries select different subsets of their fields.
            // Without merge:true an incoming subset REPLACES the cached object
            // and silently drops fields (e.g. a feed query without
            // stats.comments wiping the comment count a detail query loaded).
            stats: { merge: true },
            location: { merge: true },
            price: { merge: true },
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
