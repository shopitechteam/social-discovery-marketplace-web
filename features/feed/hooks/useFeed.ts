"use client";

import { useQuery } from "@apollo/client/react";
import { NetworkStatus } from "@apollo/client";
import { useCallback } from "react";
import {
  ForYouFeedDocument,
  FollowingFeedDocument,
  TrendingContentDocument,
  LocalFeedDocument,
} from "@/types/__generated__/graphql";

const PAGE_SIZE = 10;

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

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    // Guard against a second fetchMore firing while one is in flight (fast scroll).
    if (networkStatus === NetworkStatus.fetchMore) return;
    // The cache `merge` policy appends the page — no updateQuery needed.
    fetchMore({ variables: { limit: PAGE_SIZE, after: pageInfo.endCursor } });
  }, [fetchMore, pageInfo, networkStatus]);

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

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    if (networkStatus === NetworkStatus.fetchMore) return;
    fetchMore({ variables: { limit: PAGE_SIZE, after: pageInfo.endCursor } });
  }, [fetchMore, pageInfo, networkStatus]);

  return {
    items,
    loading: loading,
    loadingMore: networkStatus === NetworkStatus.fetchMore,
    error,
    hasMore: pageInfo?.hasNextPage ?? false,
    loadMore,
  };
}

export function useNearbyFeed(
  county: string | null,
  subregion?: string | null,
) {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(
    LocalFeedDocument,
    {
      variables: {
        county: county ?? "",
        subregion: subregion ?? undefined,
        limit: PAGE_SIZE,
      },
      skip: !county,
      // See useForYouFeed: cache-and-network restores instantly + refreshes in
      // the background; mergeFeedPage keeps the accumulated window stable.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  const items = data?.localFeed?.items ?? [];
  const pageInfo = data?.localFeed?.pageInfo;

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    if (networkStatus === NetworkStatus.fetchMore) return;
    fetchMore({
      variables: {
        county: county ?? "",
        subregion: subregion ?? undefined,
        limit: PAGE_SIZE,
        after: pageInfo.endCursor,
      },
    });
  }, [fetchMore, pageInfo, county, subregion, networkStatus]);

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
