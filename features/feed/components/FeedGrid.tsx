"use client";

import { useEffect, useRef, useCallback } from "react";
import { PostCard } from "./PostCard";
import { useForYouFeed } from "../hooks/useFeed";
import { FeedSkeleton } from "./FeedSkeleton";
import { TrendingStrip } from "./TrendingStrip";

interface Props {
  lang: string;
}

export function FeedGrid({ lang }: Props) {
  const { items, loading, hasMore, loadMore } = useForYouFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) loadMore();
    },
    [hasMore, loading, loadMore],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(handleObserver, { rootMargin: "600px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleObserver]);

  if (loading && items.length === 0) return <FeedSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="text-5xl mb-4">🛍️</div>
        <h3 className="font-bold text-default text-base mb-2">Your feed is empty</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Follow sellers or explore categories to see content here.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-safe-area-inset-bottom pb-6">
      {/* ── Trending / Stories strip ─────────────────────────────────── */}
      <div className="pt-2 pb-1">
        <TrendingStrip lang={lang} />
      </div>

      {/* ── Post cards ───────────────────────────────────────────────── */}
      <div className="flex flex-col">
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
