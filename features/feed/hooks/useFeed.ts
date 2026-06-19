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
      // IMPORTANT: do NOT use cache-and-network here. That policy refetches the
      // first page on every re-render, and our merge() replaces the whole window
      // for a cursor-less response — collapsing everything we've paginated and
      // snapping the scroll position. cache-first keeps the accumulated window
      // stable across re-renders; fetchMore still appends new pages.
      fetchPolicy: "cache-and-network",
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
    loading,
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
      // See useForYouFeed: cache-first keeps the paginated window stable.
      //  fetchPolicy: "cache-first",
      fetchPolicy: "cache-and-network",
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
    loading,
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
      // See useForYouFeed: cache-first keeps the paginated window stable.
      fetchPolicy: "cache-and-network",
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
    loading,
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
