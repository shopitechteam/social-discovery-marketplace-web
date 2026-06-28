"use client";

import { PostCard } from "./PostCard";
import { useForYouFeed } from "../hooks/useFeed";
import { FeedPaginationSkeleton, FeedSkeleton } from "./FeedSkeleton";
import { TrendingStrip } from "./TrendingStrip";
//import { StoriesBar } from "@/features/stories/components/StoriesBar";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { memo } from "react";

interface Props {
  lang: string;
  active?: boolean;
}

function FeedGrid({ lang, active = true }: Props) {
  const { items, loading, loadingMore, hasMore, loadMore } = useForYouFeed();

  const { sentinelRef } = useInfiniteScroll({
    enabled: active,
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMore,
    rootMargin: "1400px",
  });

  if (loading && items.length === 0) return <FeedSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 right-0 bottom-0  flex-col items-center justify-center py-24 px-6 text-center">
        <div className="text-5xl mb-4">🛍️</div>
        <h3 className="font-bold text-default text-base mb-2">
          Your feed is empty
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Follow sellers or explore categories to see content here.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-safe-area-inset-bottom pb-6 min-h-svh">
      {/* ── Stories bar ──────────────────────────────────────────────── */}
      {/* <StoriesBar lang={lang} /> */}

      {/* ── Trending strip ────────────────────────────────────────────── */}
      <div className="pt-2 pb-1">
        <TrendingStrip lang={lang} />
      </div>

      {/* ── Post cards ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {items.map((post, i) => (
          <PostCard key={post.id} post={post} lang={lang} priority={i < 3} />
        ))}
      </div>

      {/* ── Infinite scroll sentinel ─────────────────────────────────── */}
      <div ref={sentinelRef} className="h-1" />

      {loadingMore && <FeedPaginationSkeleton />}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-muted-foreground text-xs py-6">
          You&apos;re all caught up ✓
        </p>
      )}
    </div>
  );
}
export default memo(FeedGrid);
