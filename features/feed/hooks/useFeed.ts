"use client";

import { useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
import {
  ForYouFeedDocument,
  TrendingContentDocument,
} from "@/types/__generated__/graphql";

const PAGE_SIZE = 12;

export function useForYouFeed() {
  const { data, loading, error, fetchMore } = useQuery(ForYouFeedDocument, {
    variables: { limit: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  });

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

export function useTrending(county?: string) {
  const { data, loading } = useQuery(TrendingContentDocument, {
    variables: { county },
  });
  return { items: data?.trendingContent ?? [], loading };
}
