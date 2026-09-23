"use client";

import { useQuery } from "@apollo/client/react";
import { startTransition, useCallback, useState } from "react";
import { VideoFeedDocument } from "@/types/__generated__/graphql";
import {
  VIDEO_FEED_PAGE_SIZE,
  VIDEO_FEED_LOAD_MORE_SIZE,
} from "@/features/feed/constants";
import { useNearbyLocation } from "@/features/feed/hooks/useNearbyLocation";
import { usePaginationGuard } from "@/features/feed/hooks/useFeed";

/**
 * The immersive viewer's list: every playable video on the platform, ranked,
 * with the seed pinned first by the server.
 *
 * `seed` is the URL segment — normally a slug, though the server's
 * findByIdOrSlug accepts a raw id or a `title-id` form too, so a link of any
 * vintage opens on the right video.
 *
 * Mirrors useForYouFeed, with two deliberate differences:
 *
 *  - Plain useQuery, not useSuspenseQuery. The viewer renders inside the
 *    @modal parallel-route slot; suspending there would suspend the slot and
 *    can flash the feed underneath.
 *  - `loadingMore` is tracked locally for the reason documented in useFeed:
 *    Apollo's fetchMore networkStatus transition is too short-lived to
 *    reliably land in a render.
 */
export function useVideoFeed(seed: string) {
  // Passive only — same as the For You feed, this never prompts for location,
  // it just uses a fix the user already granted so ranking matches where they
  // actually are.
  const { location } = useNearbyLocation();

  const { data, loading, error, fetchMore } = useQuery(VideoFeedDocument, {
    variables: {
      limit: VIDEO_FEED_PAGE_SIZE,
      seedId: seed,
      latitude: location?.latitude,
      longitude: location?.longitude,
    },
    // The tapped video is almost always already in the feed's cache, so the
    // first slide paints from cache while the rest of the page is in flight.
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  const items = data?.videoFeed?.items ?? [];
  const pageInfo = data?.videoFeed?.pageInfo;

  const itemCount = items.length;
  const guard = usePaginationGuard(itemCount);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    const cursor = pageInfo.endCursor;
    // The cache `merge` policy appends and de-duplicates the page, which is
    // also what drops the pinned seed if the ranked stream reaches it.
    guard(cursor, itemCount, () => {
      setLoadingMore(true);
      let request!: Promise<unknown>;
      startTransition(() => {
        request = fetchMore({
          variables: { limit: VIDEO_FEED_LOAD_MORE_SIZE, after: cursor },
        }).finally(() => setLoadingMore(false));
      });
      return request;
    });
  }, [fetchMore, pageInfo, guard, itemCount]);

  return {
    items,
    loading: loading && itemCount === 0,
    loadingMore,
    error,
    hasMore: pageInfo?.hasNextPage ?? false,
    loadMore,
  };
}
