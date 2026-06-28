"use client";

import { useCallback, useEffect, useRef, useState, type RefCallback } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollResult {
  sentinelRef: RefCallback<HTMLDivElement>;
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
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const latest = useRef({ hasMore, loading, onLoadMore });
  const wasEnabled = useRef(enabled);

  useEffect(() => {
    latest.current = { hasMore, loading, onLoadMore };
  }, [hasMore, loading, onLoadMore]);

  const sentinelRef = useCallback<RefCallback<HTMLDivElement>>((node) => {
    setSentinelEl(node);
  }, []);

  useEffect(() => {
    const el = sentinelEl;
    const recheckOnEnable = enabled && !wasEnabled.current;
    wasEnabled.current = enabled;

    if (!el) return;
    if (!enabled) return;

    const maybeLoadMore = () => {
      const state = latest.current;
      if (state.hasMore && !state.loading) state.onLoadMore();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) maybeLoadMore();
      },
      { rootMargin },
    );

    observer.observe(el);

    let frame = 0;
    if (recheckOnEnable) {
      // When a feed returns from display:none, re-check once. Do not run this
      // after every page append; that would chain-load the whole feed.
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const margin = Number.parseFloat(rootMargin) || 0;
        if (rect.top <= window.innerHeight + margin && rect.bottom >= -margin) {
          maybeLoadMore();
        }
      });
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [enabled, rootMargin, sentinelEl]);

  return { sentinelRef };
}
