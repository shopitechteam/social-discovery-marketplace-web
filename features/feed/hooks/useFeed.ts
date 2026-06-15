"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback } from "react";
import {
  ForYouFeedDocument,
  FollowingFeedDocument,
  TrendingContentDocument,
  LocalFeedDocument,
} from "@/types/__generated__/graphql";

const PAGE_SIZE = 10;

export function useForYouFeed() {
  const { data, loading, error, fetchMore } = useQuery(ForYouFeedDocument, {
    variables: { limit: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const items = data?.forYouFeed?.items ?? [];
  const pageInfo = data?.forYouFeed?.pageInfo;

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    // The cache `merge` policy appends the page — no updateQuery needed.
    fetchMore({ variables: { limit: PAGE_SIZE, after: pageInfo.endCursor } });
  }, [fetchMore, pageInfo]);

  return {
    items,
    loading,
    error,
    hasMore: pageInfo?.hasNextPage ?? false,
    loadMore,
  };
}

export function useFollowingFeed() {
  const { data, loading, error, fetchMore } = useQuery(FollowingFeedDocument, {
    variables: { limit: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const items = data?.followingFeed?.items ?? [];
  const pageInfo = data?.followingFeed?.pageInfo;

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    fetchMore({ variables: { limit: PAGE_SIZE, after: pageInfo.endCursor } });
  }, [fetchMore, pageInfo]);

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
  const { data, loading, error, fetchMore } = useQuery(LocalFeedDocument, {
    variables: {
      county: county ?? "",
      subregion: subregion ?? undefined,
      limit: PAGE_SIZE,
    },
    skip: !county,
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const items = data?.localFeed?.items ?? [];
  const pageInfo = data?.localFeed?.pageInfo;

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    fetchMore({
      variables: {
        county: county ?? "",
        subregion: subregion ?? undefined,
        limit: PAGE_SIZE,
        after: pageInfo.endCursor,
      },
    });
  }, [fetchMore, pageInfo, county, subregion]);

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
