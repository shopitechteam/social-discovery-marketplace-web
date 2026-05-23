import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";

const GRAPHQL_URL = `${process.env.NEXT_PUBLIC_API_URL}/graphql`;

// Used by Server Components via getClient() / query() / PreloadQuery
// Each request gets a fresh client instance (registerApolloClient handles this)
export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
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
