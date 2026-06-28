import type { ApolloCache } from "@apollo/client";

/**
 * Feeds and the profile post grid are read with `cache-first` so revisiting a
 * screen renders instantly from cache and preserves scroll position (see
 * features/feed/hooks/useFeed.ts). The trade-off is that newly published
 * content won't appear until the cached list is invalidated.
 *
 * Call this after a publish so the *next* mount of the feed / profile refetches
 * a fresh first page exactly once, instead of every navigation.
 */
export function invalidatePublishedContentCache(cache: ApolloCache): void {
  cache.evict({ fieldName: "forYouFeed" });
  cache.evict({ fieldName: "followingFeed" });
  cache.evict({ fieldName: "localFeed" });
  cache.evict({ fieldName: "myPosts" });
  cache.gc();
}
