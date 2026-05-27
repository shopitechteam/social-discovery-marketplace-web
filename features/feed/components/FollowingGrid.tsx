"use client";

import { PostCard } from "./PostCard";
import { FeedSkeleton } from "./FeedSkeleton";
import { useFollowingFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

interface Props {
  lang: string;
}

export function FollowingGrid({ lang }: Props) {
  const { items, loading, hasMore, loadMore } = useFollowingFeed();

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    rootMargin: "600px",
  });

  if (loading && items.length === 0) return <FeedSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="font-bold text-default text-base mb-2">
          Follow sellers you love
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Their latest listings will appear here once you follow someone.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-safe-area-inset-bottom pb-6">
      <div className="flex flex-col">
        {items.map((post, i) => (
          <PostCard key={post.id} post={post} lang={lang} priority={i < 3} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />

      {loading && items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-muted-foreground text-xs py-6">
          You&apos;re all caught up ✓
        </p>
      )}
    </div>
  );
}
