"use client";

import { useEffect, useRef } from "react";

/**
 * Persists and restores the window scroll position for a feed tab across route
 * unmount/remount.
 *
 * The bottom tabs (Home / Inbox / …) are SEPARATE Next.js routes, so opening
 * Inbox unmounts the feed route entirely and returning mounts a fresh DOM. Even
 * though Apollo serves the accumulated window instantly from cache, the new DOM
 * starts scrolled to the top — which is what makes a cache-restored feed feel
 * like a "full reload". This hook saves scrollY (keyed per tab) while the user
 * scrolls and restores it once the cached items have painted.
 *
 * @param key      Unique per feed tab, e.g. "for-you" / "following" / "nearby".
 * @param ready    True once items are rendered (so there's height to scroll to).
 */
export function useScrollRestoration(key: string, ready: boolean) {
  const storageKey = `feed-scroll:${key}`;
  const restored = useRef(false);

  // Restore once the list has content to scroll within.
  useEffect(() => {
    if (!ready || restored.current) return;
    if (typeof window === "undefined") return;

    const raw = sessionStorage.getItem(storageKey);
    const y = raw ? Number(raw) : 0;
    restored.current = true;
    if (!y) return;

    // Wait a frame so the freshly-painted list has its full height before we
    // jump, otherwise the scroll clamps short.
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    });
    return () => cancelAnimationFrame(id);
  }, [ready, storageKey]);

  // Continuously record the latest scroll position (throttled to one write per
  // frame) and flush on unmount so the very last position is captured.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sessionStorage.setItem(storageKey, String(window.scrollY));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };
  }, [storageKey]);
}
