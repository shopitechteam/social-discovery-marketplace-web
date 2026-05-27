"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useRef } from "react";
import {
  ForYouFeedDocument,
  FollowingFeedDocument,
  TrendingContentDocument,
} from "@/types/__generated__/graphql";

const PAGE_SIZE = 6;

export function useForYouFeed() {
  const { data, loading, error, fetchMore, refetch } = useQuery(
    ForYouFeedDocument,
    {
      variables: { limit: PAGE_SIZE },
      // Always hit network — show cached items immediately while fresh data arrives.
      // nextFetchPolicy keeps the same policy so re-renders after pagination
      // don't silently fall back to cache-only.
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    },
  );

  // Refetch page 1 every time the user navigates back to the feed.
  // Skip the very first mount (the query above already fires a network request).
  const hasMounted = useRef(false);
  useEffect(() => {
    if (hasMounted.current) {
      refetch({ limit: PAGE_SIZE });
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

  return { items, loading, error, hasMore: pageInfo?.hasNextPage ?? false, loadMore };
}

export function useFollowingFeed() {
  const { data, loading, error, fetchMore } = useQuery(FollowingFeedDocument, {
    variables: { limit: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
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

  return { items, loading, error, hasMore: pageInfo?.hasNextPage ?? false, loadMore };
}

export function useTrending(county?: string) {
  const { data, loading } = useQuery(TrendingContentDocument, {
    variables: { county },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-and-network",
  });
  return { items: data?.trendingContent ?? [], loading };
}
