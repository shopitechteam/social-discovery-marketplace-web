"use client";

import { useEffect, useRef, RefObject } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollResult {
  sentinelRef: RefObject<HTMLDivElement | null>;
}

/**
 * Generic hook that observes a sentinel element and calls onLoadMore when it
 * enters the viewport. Works with ANY cursor-based paginated list.
 *
 * Usage:
 *   const { sentinelRef } = useInfiniteScroll({ hasMore, loading, onLoadMore })
 *   // Then: <div ref={sentinelRef} />  somewhere at the bottom of your list
 */
export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  rootMargin = "400px",
  enabled = true,
}: UseInfiniteScrollOptions): UseInfiniteScrollResult {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!enabled) return;

    const maybeLoadMore = () => {
      if (hasMore && !loading) onLoadMore();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) maybeLoadMore();
      },
      { rootMargin },
    );

    observer.observe(el);

    // When a feed is hidden with display:none, the observer can be attached
    // while the sentinel has no layout box. Re-check on the next frame after
    // the feed becomes enabled so returning to Home can page immediately if
    // the sentinel is already inside the load margin.
    const frame = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const margin = Number.parseFloat(rootMargin) || 0;
      if (rect.top <= window.innerHeight + margin && rect.bottom >= -margin) {
        maybeLoadMore();
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled, hasMore, loading, onLoadMore, rootMargin]);

  return { sentinelRef };
}
