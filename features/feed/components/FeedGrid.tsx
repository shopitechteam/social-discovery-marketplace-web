"use client";

import { useLayoutEffect, useRef } from "react";
import { PostCard } from "./PostCard";
import { useForYouFeed } from "../hooks/useFeed";
import { FeedPaginationSkeleton, FeedSkeleton } from "./FeedSkeleton";
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
    rootMargin: "1400px",
  });

  // Restore scroll when returning from PDP or auth — wait until DOM has enough height
  const scrollRestored = useRef(false);
  useLayoutEffect(() => {
    if (scrollRestored.current || items.length === 0) return;

    const intent = consumeAuthIntent();
    const savedScroll = sessionStorage.getItem("feed-scroll");
    const target = intent?.scrollY
      ? intent.scrollY
      : savedScroll
        ? parseInt(savedScroll, 10)
        : 0;

    if (savedScroll) sessionStorage.removeItem("feed-scroll");
    if (!target) return;

    scrollRestored.current = true;

    // Retry until page is tall enough to scroll to the target position
    let attempts = 0;
    function tryScroll() {
      if (document.body.scrollHeight >= target || attempts > 20) {
        window.scrollTo({ top: target, behavior: "instant" });
        return;
      }
      attempts++;
      requestAnimationFrame(tryScroll);
    }
    requestAnimationFrame(tryScroll);
  }, [items.length]);

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
        <FeedPaginationSkeleton />
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-muted-foreground text-xs py-6">
          You&apos;re all caught up ✓
        </p>
      )}
    </div>
  );
}
