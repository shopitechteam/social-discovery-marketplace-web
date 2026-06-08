"use client";

import { useEffect } from "react";
import { PostCard } from "./PostCard";
import { useForYouFeed } from "../hooks/useFeed";
import { FeedSkeleton } from "./FeedSkeleton";
import { TrendingStrip } from "./TrendingStrip";
//import { StoriesBar } from "@/features/stories/components/StoriesBar";
import { consumeAuthIntent } from "../hooks/useAuthGuard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

interface Props {
  lang: string;
}

export function FeedGrid({ lang }: Props) {
  const { items, loading, hasMore, loadMore } = useForYouFeed();

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    rootMargin: "600px",
  });

  // Restore scroll position when returning from auth (after like/comment redirect)
  useEffect(() => {
    const intent = consumeAuthIntent();
    if (!intent || intent.scrollY === 0) return;
    // Wait for feed items to render before scrolling
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: intent.scrollY, behavior: "instant" });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (loading && items.length === 0) return <FeedSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
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
