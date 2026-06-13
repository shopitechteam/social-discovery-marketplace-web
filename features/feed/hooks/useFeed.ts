"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useRef } from "react";
import {
  ForYouFeedDocument,
  FollowingFeedDocument,
  TrendingContentDocument,
  LocalFeedDocument,
} from "@/types/__generated__/graphql";

const PAGE_SIZE = 10;

// How long (ms) before a cached feed is considered stale and worth re-fetching.
const STALE_MS = 3 * 60_000; // 3 minutes before background refresh

export function useForYouFeed() {
  const { data, loading, error, fetchMore, refetch } = useQuery(
    ForYouFeedDocument,
    {
      variables: { limit: PAGE_SIZE },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );

  // Background refresh only after STALE_MS — keeps back-nav instant with no flicker.
  const lastFetchedAt = useRef<number>(0);
  const hasMounted = useRef(false);
  useEffect(() => {
    if (hasMounted.current) {
      const age = Date.now() - lastFetchedAt.current;
      if (age > STALE_MS) {
        lastFetchedAt.current = Date.now();
        refetch({ limit: PAGE_SIZE });
      }
    } else {
      lastFetchedAt.current = Date.now();
    }
    hasMounted.current = true;
  }, [refetch]);

  const items = data?.forYouFeed?.items ?? [];
  const pageInfo = data?.forYouFeed?.pageInfo;

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    fetchMore({
      variables: { limit: PAGE_SIZE, after: pageInfo.endCursor },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          forYouFeed: {
            ...fetchMoreResult.forYouFeed,
            items: [
              ...(prev.forYouFeed?.items ?? []),
              ...fetchMoreResult.forYouFeed.items,
            ],
          },
        };
      },
    });
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
    nextFetchPolicy: "cache-first",
  });

  const items = data?.followingFeed?.items ?? [];
  const pageInfo = data?.followingFeed?.pageInfo;

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    fetchMore({
      variables: { limit: PAGE_SIZE, after: pageInfo.endCursor },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          followingFeed: {
            ...fetchMoreResult.followingFeed,
            items: [
              ...(prev.followingFeed?.items ?? []),
              ...fetchMoreResult.followingFeed.items,
            ],
          },
        };
      },
    });
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
    nextFetchPolicy: "cache-first",
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
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          localFeed: {
            ...fetchMoreResult.localFeed,
            items: [
              ...(prev.localFeed?.items ?? []),
              ...fetchMoreResult.localFeed.items,
            ],
          },
        };
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
