import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";

const GRAPHQL_URL = `${process.env.NEXT_PUBLIC_API_URL}/graphql`;

/**
 * Field policy shared by every cursor-paginated feed (forYouFeed,
 * followingFeed, localFeed). Without this, Apollo keys each page by its
 * `after`/`limit` args and stores them as separate entries, so `fetchMore`
 * never merges and pagination appears stuck/duplicated. We drop the cursor
 * args from the cache key and concatenate incoming items onto the existing
 * window.
 */
const feedFieldPolicy = {
  // `limit` and `after` only paginate — they don't identify a distinct list.
  // localFeed additionally keys on county/subregion so each location is its
  // own cached list. Apollo ignores key names that the field doesn't accept.
  keyArgs: ["county", "subregion"] as const,
  merge(
    existing: { items?: unknown[] } | undefined,
    incoming: { items?: unknown[] },
    { args }: { args: Record<string, unknown> | null },
  ) {
    const incomingItems = incoming.items ?? [];
    // No cursor → first page (or a refetch): replace the window entirely.
    if (!args?.after) return incoming;
    return {
      ...incoming,
      items: [...(existing?.items ?? []), ...incomingItems],
    };
  },
};

// Used by Server Components via getClient() / query() / PreloadQuery
// Each request gets a fresh client instance (registerApolloClient handles this)
export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            forYouFeed: feedFieldPolicy,
            followingFeed: feedFieldPolicy,
            localFeed: feedFieldPolicy,
          },
        },
      },
    }),
    defaultOptions: {
      query: { errorPolicy: "all" },
      mutate: { errorPolicy: "all" },
    },
    link: new HttpLink({
      uri: GRAPHQL_URL,
      fetchOptions: {
        // Default: revalidate every 30s for RSC fetches.
        // Override per-call: query(MY_QUERY, { context: { fetchOptions: { next: { revalidate: 0 } } } })
        next: { revalidate: 30 },
      },
    }),
  });
});
