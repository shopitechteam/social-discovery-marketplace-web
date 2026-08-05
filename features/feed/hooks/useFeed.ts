"use client";

import { useQuery, useSuspenseQuery } from "@apollo/client/react";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ForYouFeedDocument,
  FollowingFeedDocument,
  TrendingContentDocument,
  LocalFeedDocument,
} from "@/types/__generated__/graphql";
import { FEED_PAGE_SIZE } from "@/features/feed/constants";
import { useNearbyLocation } from "@/features/feed/hooks/useNearbyLocation";

const PAGE_SIZE = FEED_PAGE_SIZE;

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
  // Reuse the same permission/caching flow the Nearby tab already owns: this
  // never itself prompts for permission (no `requestLocation()` call here) —
  // it only picks up a fix the user already granted elsewhere, so ranking
  // reflects where they actually are right now instead of their saved
  // profile/listing address, without ambushing Home with a permission popup.
  const { location } = useNearbyLocation();

  const { data, error, fetchMore } = useSuspenseQuery(
    ForYouFeedDocument,
    {
      variables: {
        limit: PAGE_SIZE,
        latitude: location?.latitude,
        longitude: location?.longitude,
      },
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
  // Apollo's networkStatus === fetchMore transition is too short-lived to
  // reliably land in a React render — the request/response round trip can
  // resolve within the same tick React would use to commit the "fetchMore"
  // state, coalescing it away (verified live: items still grow, but the
  // pagination spinner never showed). Track "in flight" ourselves instead.
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    // The cache `merge` policy appends the page — no updateQuery needed.
    guard(cursor, itemCount, () => {
      setLoadingMore(true);
      let request!: Promise<unknown>;
      startTransition(() => {
        request = fetchMore({
          variables: { limit: PAGE_SIZE, after: cursor },
        }).finally(() => setLoadingMore(false));
      });
      return request;
    });
  }, [fetchMore, pageInfo, guard, itemCount]);

  return {
    items,
    // The initial request is represented by the nearest Suspense fallback.
    loading: false,
    loadingMore,
    error,
    hasMore: pageInfo?.hasNextPage ?? false,
    loadMore,
  };
}

export function useFollowingFeed() {
  const { data, loading, error, fetchMore } = useQuery(
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
  // See useForYouFeed: networkStatus === fetchMore is too short-lived to
  // reliably render, so loadingMore is tracked with local state instead.
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    guard(cursor, itemCount, () => {
      setLoadingMore(true);
      return fetchMore({
        variables: { limit: PAGE_SIZE, after: cursor },
      }).finally(() => setLoadingMore(false));
    });
  }, [fetchMore, pageInfo, guard, itemCount]);

  return {
    items,
    loading,
    loadingMore,
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
  const { data, loading, error, fetchMore } = useQuery(
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

  // Apollo's networkStatus === fetchMore transition is too short-lived to
  // reliably land in a React render here — the request/response round trip
  // (particularly on a fast/local network) can resolve within the same tick
  // React would use to commit the "fetchMore" state, so the intermediate
  // value is coalesced away and the pagination spinner never shows even
  // though the fetch genuinely happened (verified: items still grow).
  // Track "in flight" ourselves instead of relying on networkStatus.
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMore = useCallback(() => {
    if (!coordinates) return;
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    guard(cursor, itemCount, () => {
      setLoadingMore(true);
      return fetchMore({
        variables: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radiusKm,
          limit: PAGE_SIZE,
          after: cursor,
        },
      }).finally(() => setLoadingMore(false));
    });
  }, [fetchMore, pageInfo, coordinates, radiusKm, guard, itemCount]);

  return {
    items,
    loading: loading && items.length === 0,
    loadingMore,
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
