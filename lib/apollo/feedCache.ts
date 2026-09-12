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
  cache.evict({ fieldName: "videoFeed" });
  cache.evict({ fieldName: "myPosts" });
  cache.gc();
}

/**
 * Drops the immersive viewer's cached lists.
 *
 * `videoFeed` keys on `seedId`, so every video the user taps mints its own
 * entry — without this they accumulate one list per tap for the whole session.
 * The viewer is transient, so nothing is lost by refetching on the next open.
 *
 * The underlying `Content` entities survive: gc only collects what nothing
 * references, and the feed's own lists still point at them.
 */
export function invalidateVideoFeedCache(cache: ApolloCache): void {
  cache.evict({ fieldName: "videoFeed" });
  cache.gc();
}
