"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ErrorLink } from "@apollo/client/link/error";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

let clientSingleton: ReturnType<typeof createClient> | undefined;

function makeClient() {
  if (typeof window !== "undefined") {
    if (!clientSingleton) clientSingleton = createClient();
    return clientSingleton;
  }
  return createClient();
}

function createClient() {
  const httpLink = new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
    // Browser-side: skip Next.js fetch cache — Apollo InMemoryCache is
    // the only cache layer on the client
    fetchOptions: { cache: "no-store" },
  });

  // Apollo 4: ErrorLink class replaces the deprecated onError function.
  // { error } is CombinedGraphQLErrors for GQL errors, plain Error for network.
  const errorLink = new ErrorLink(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(({ message, path }) =>
        console.error(
          `[GraphQL] ${operation.operationName} → ${String(path)}: ${message}`,
        ),
      );
    } else {
      console.error(`[Network] ${operation.operationName}:`, error);
    }
  });

  return new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),

    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Feed: separate cache per filter/sort, append on cursor
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
        // Instant UI from cache, refresh in background
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
      },
      query: {
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
