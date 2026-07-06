"use client";

import { useQuery } from "@apollo/client/react";
import { NetworkStatus } from "@apollo/client";
import { useCallback, useEffect, useRef } from "react";
import {
  ForYouFeedDocument,
  FollowingFeedDocument,
  TrendingContentDocument,
  LocalFeedDocument,
} from "@/types/__generated__/graphql";

const PAGE_SIZE = 10;

/**
 * Guards cursor-based pagination against a page that returns only duplicates
 * (server overlap): the merge appends nothing yet `hasNextPage` stays true, so
 * the same `endCursor` would otherwise be requested forever.
 *
 * `run(cursor, currentCount, fetch)` fires `fetch` UNLESS the exact same cursor
 * was already requested AND the item count hasn't changed since (a genuine
 * dedupe-empty page). A cursor that later corresponds to more items — e.g. after
 * the accumulated window is restored on revisit — passes, so pagination never
 * gets permanently stuck on a stale cursor.
 *
 * In-flight concurrency is handled by the caller (the infinite-scroll sentinel
 * is gated on `loadingMore`, i.e. Apollo's own `networkStatus === fetchMore`),
 * so we deliberately don't keep an `inFlight` ref here — a ref that failed to
 * clear would silently freeze pagination forever, which is exactly the failure
 * we're fixing.
 */
export function usePaginationGuard(currentCount: number) {
  // The cursor of the last request and the item count at that time.
  const lastCursor = useRef<string | null>(null);
  const lastCount = useRef<number>(-1);
  const maxCountSeen = useRef(currentCount);

  useEffect(() => {
    if (currentCount < maxCountSeen.current) {
      lastCursor.current = null;
      lastCount.current = -1;
    }
    maxCountSeen.current = Math.max(maxCountSeen.current, currentCount);
  }, [currentCount]);

  const run = useCallback(
    (cursor: string, currentCount: number, fetch: () => Promise<unknown>) => {
      if (lastCursor.current === cursor && lastCount.current === currentCount) {
        return;
      }
      lastCursor.current = cursor;
      lastCount.current = currentCount;
      void fetch();
    },
    [],
  );

  return run;
}

export function useForYouFeed() {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(
    ForYouFeedDocument,
    {
      variables: { limit: PAGE_SIZE },
      // Preserve the accumulated window on bottom-tab navigation. Freshly
      // published content invalidates this field explicitly (see feedCache.ts);
      // otherwise revisiting Home should show the same 30+ cached items, not a
      // page-1 background refresh.
      fetchPolicy: "cache-first",
      // Apollo's default refetch write mode is "overwrite", which can replace
      // an exhausted 33-item window with the refreshed first page while leaving
      // pageInfo stale. We need the field policy merge to receive `existing`.
      refetchWritePolicy: "merge",
      notifyOnNetworkStatusChange: true,
    },
  );

  const items = data?.forYouFeed?.items ?? [];
  const pageInfo = data?.forYouFeed?.pageInfo;

  const itemCount = items.length;
  const guard = usePaginationGuard(itemCount);
  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    // The cache `merge` policy appends the page — no updateQuery needed.
    guard(cursor, itemCount, () =>
      fetchMore({ variables: { limit: PAGE_SIZE, after: cursor } }),
    );
  }, [fetchMore, pageInfo, guard, itemCount]);

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
      // See useForYouFeed: bottom-tab navigation should restore the cached
      // accumulated window without a page-1 background refresh.
      fetchPolicy: "cache-first",
      refetchWritePolicy: "merge",
      notifyOnNetworkStatusChange: true,
    },
  );

  const items = data?.followingFeed?.items ?? [];
  const pageInfo = data?.followingFeed?.pageInfo;

  const itemCount = items.length;
  const guard = usePaginationGuard(itemCount);
  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    guard(cursor, itemCount, () =>
      fetchMore({ variables: { limit: PAGE_SIZE, after: cursor } }),
    );
  }, [fetchMore, pageInfo, guard, itemCount]);

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
      // See useForYouFeed: bottom-tab navigation should restore the cached
      // accumulated window without a page-1 background refresh.
      fetchPolicy: "cache-first",
      refetchWritePolicy: "merge",
      notifyOnNetworkStatusChange: true,
    },
  );

  const items = data?.localFeed?.items ?? [];
  const pageInfo = data?.localFeed?.pageInfo;

  const itemCount = items.length;
  const guard = usePaginationGuard(itemCount);
  const loadMore = useCallback(() => {
    if (!coordinates) return;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    guard(cursor, itemCount, () =>
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
  }, [fetchMore, pageInfo, coordinates, radiusKm, guard, itemCount]);

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
