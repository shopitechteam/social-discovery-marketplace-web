"use client";

import { useEffect, useRef, RefObject } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
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
}: UseInfiniteScrollOptions): UseInfiniteScrollResult {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, rootMargin]);

  return { sentinelRef };
}
