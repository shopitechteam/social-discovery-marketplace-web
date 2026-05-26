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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
      {
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
      },
    );

    const json = (await res.json()) as {
      data?: RefreshTokenMutation;
      errors?: unknown[];
    };

    if (json.errors || !json.data?.refreshToken) return null;

    const { accessToken, refreshToken: newRefreshToken, user } = json.data.refreshToken;
    useAuthStore.getState().setAuth({ accessToken, refreshToken: newRefreshToken, user });
    return accessToken;
  } catch {
    return null;
  }
}

function createClient() {
  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
    fetchOptions: { cache: "no-store" },
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
              merge(existing, incoming, { args }) {
                const prevItems = existing?.items ?? [];
                const nextItems = incoming?.items ?? [];
                if (!args?.after) return { ...incoming, items: nextItems };
                return { ...incoming, items: [...prevItems, ...nextItems] };
              },
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
            isLikedByMe:  { merge: false },
            isMyContent:  { merge: false },
            creator:      { merge: false },
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
        // Always hit network + show cached data while fresh arrives.
        // No nextFetchPolicy — keep cache-and-network on every re-render
        // so revisiting the feed never shows stale data.
        fetchPolicy: "cache-and-network",
      },
      query: {
        fetchPolicy: "network-only",
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
