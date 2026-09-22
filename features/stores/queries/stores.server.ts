import "server-only";

import { query } from "@/lib/apollo/ApolloClient";
import {
  EMPTY_STORE_PAGE,
  STORES_QUERY,
  STORE_COUNTIES_QUERY,
  type StoreDirectoryPage,
  type StoreFilters,
} from "@/features/stores/queries/stores";

/**
 * Server-side fetchers for the Stores directory.
 *
 * Separate from the documents in ./stores because `query` comes from the
 * registered Apollo client, which only exists on the server — importing it from
 * a "use client" module pulls it into the browser bundle and the build fails on
 * a missing `registerApolloClient` export. The `server-only` import above turns
 * that mistake into an immediate, readable error rather than a confusing one.
 */

/**
 * The first page, fetched on the server so the directory is crawlable and the
 * grid is painted before hydration.
 *
 * Best-effort, like the other browse routes: if the API is unreachable the page
 * still renders its shell and the client takes over, rather than throwing the
 * whole route.
 */
export async function fetchStores(
  filters: StoreFilters = {},
): Promise<StoreDirectoryPage> {
  try {
    const { data } = await query({
      query: STORES_QUERY,
      variables: { input: filters },
    });
    return (
      (data as { stores?: StoreDirectoryPage } | undefined)?.stores ??
      EMPTY_STORE_PAGE
    );
  } catch {
    return EMPTY_STORE_PAGE;
  }
}

/** Counties with public stock, for the filter rail. Empty on failure. */
export async function fetchStoreCounties(): Promise<string[]> {
  try {
    const { data } = await query({ query: STORE_COUNTIES_QUERY });
    return (
      (data as { storeCounties?: string[] } | undefined)?.storeCounties ?? []
    );
  } catch {
    return [];
  }
}
