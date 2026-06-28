"use client";

import { useQuery } from "@apollo/client/react";
import { NetworkStatus } from "@apollo/client";
import { useCallback, useRef } from "react";
import {
  ForYouFeedDocument,
  FollowingFeedDocument,
  TrendingContentDocument,
  LocalFeedDocument,
} from "@/types/__generated__/graphql";

const PAGE_SIZE = 10;

/**
 * Guards cursor-based pagination against the two ways infinite scroll can spin
 * without loading anything:
 *   1. A `fetchMore` already in flight (the IntersectionObserver can re-fire
 *      before `networkStatus` flips, especially with a large rootMargin).
 *   2. A page that returns only duplicates (server overlap) — the merge appends
 *      nothing yet `hasNextPage` stays true, so the same `endCursor` would be
 *      requested forever. We remember the last cursor we asked for and refuse to
 *      ask again until it actually advances.
 *
 * Returns `run(cursor, fetch)` — call it from `loadMore`; it invokes `fetch`
 * only when the cursor is new and nothing is in flight.
 */
function usePaginationGuard() {
  const inFlight = useRef(false);
  const lastCursor = useRef<string | null>(null);

  const run = useCallback((cursor: string, fetch: () => Promise<unknown>) => {
    if (inFlight.current) return;
    if (lastCursor.current === cursor) return;
    inFlight.current = true;
    lastCursor.current = cursor;
    void fetch().finally(() => {
      inFlight.current = false;
    });
  }, []);

  return run;
}

export function useForYouFeed() {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(
    ForYouFeedDocument,
    {
      variables: { limit: PAGE_SIZE },
      // cache-and-network: on revisit (tab away → back) the full accumulated
      // window renders INSTANTLY from cache, then a single background page-1
      // refetch runs to pull in newly-published posts / fresh fields. This is
      // only safe because mergeFeedPage() now splices page-1 over the head of
      // the existing window instead of replacing it — so the background refresh
      // can't collapse the accumulated pages or snap scroll to the top.
      // nextFetchPolicy keeps later re-renders on cache-first so fetchMore
      // pagination doesn't re-trigger a page-1 network read.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  const items = data?.forYouFeed?.items ?? [];
  const pageInfo = data?.forYouFeed?.pageInfo;

  const guard = usePaginationGuard();
  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    // The cache `merge` policy appends the page — no updateQuery needed.
    guard(cursor, () =>
      fetchMore({ variables: { limit: PAGE_SIZE, after: cursor } }),
    );
  }, [fetchMore, pageInfo, guard]);

  return {
    items,
    // Only an initial, dataless load should drive the full-screen skeleton.
    loading: loading,
    // True only while a fetchMore page is in flight — drives the pagination
    // spinner WITHOUT firing during the silent cache-and-network refresh.
    loadingMore: networkStatus === NetworkStatus.fetchMore,
    error,
    hasMore: pageInfo?.hasNextPage ?? false,
    loadMore,
  };
}

export function useFollowingFeed() {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(
    FollowingFeedDocument,
    {
      variables: { limit: PAGE_SIZE },
      // See useForYouFeed: cache-and-network restores instantly + refreshes in
      // the background; mergeFeedPage keeps the accumulated window stable.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  const items = data?.followingFeed?.items ?? [];
  const pageInfo = data?.followingFeed?.pageInfo;

  const guard = usePaginationGuard();
  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    guard(cursor, () =>
      fetchMore({ variables: { limit: PAGE_SIZE, after: cursor } }),
    );
  }, [fetchMore, pageInfo, guard]);

  return {
    items,
    loading: loading,
    loadingMore: networkStatus === NetworkStatus.fetchMore,
    error,
    hasMore: pageInfo?.hasNextPage ?? false,
    loadMore,
  };
}

type NearbyCoordinates = {
  latitude: number;
  longitude: number;
};

export function useNearbyFeed(
  coordinates: NearbyCoordinates | null,
  radiusKm: number,
) {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(
    LocalFeedDocument,
    {
      variables: {
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        radiusKm,
        limit: PAGE_SIZE,
      },
      skip: !coordinates,
      // See useForYouFeed: cache-and-network restores instantly + refreshes in
      // the background; mergeFeedPage keeps the accumulated window stable.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  const items = data?.localFeed?.items ?? [];
  const pageInfo = data?.localFeed?.pageInfo;

  const guard = usePaginationGuard();
  const loadMore = useCallback(() => {
    if (!coordinates) return;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    guard(cursor, () =>
      fetchMore({
        variables: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radiusKm,
          limit: PAGE_SIZE,
          after: cursor,
        },
      }),
    );
  }, [fetchMore, pageInfo, coordinates, radiusKm, guard]);

  return {
    items,
    loading: loading && items.length === 0,
    loadingMore: networkStatus === NetworkStatus.fetchMore,
    error,
    hasMore: pageInfo?.hasNextPage ?? false,
    loadMore,
  };
}

export function useTrending(county?: string) {
  const { data, loading } = useQuery(TrendingContentDocument, {
    variables: { county },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  return { items: data?.trendingContent ?? [], loading };
}
