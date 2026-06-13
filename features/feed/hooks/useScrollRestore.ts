"use client";

import { useLayoutEffect, useRef } from "react";
import { consumeAuthIntent } from "./useAuthGuard";

const STORAGE_KEY = "feed-scroll";
const TOLERANCE = 2; // px — close enough counts as restored
const BUDGET_MS = 3000; // give async media up to 3s to lay out

/**
 * Restores the window scroll position after a back-navigation from the post
 * detail page (or a return from auth).
 *
 * The feed re-renders instantly from the Apollo cache, but the cards grow
 * asynchronously as next/image and HLS video media lay out, so the page isn't
 * tall enough to reach the saved offset on first paint. Rather than guessing
 * with a fixed number of frames, we watch the document height with a
 * ResizeObserver and re-apply the scroll every time it grows, until we either
 * reach the target or the time budget elapses.
 *
 * `ready` should become true once the cached items are present (e.g.
 * `items.length > 0`); the restore runs exactly once per mount.
 */
export function useScrollRestore(ready: boolean) {
  const restored = useRef(false);

  useLayoutEffect(() => {
    if (restored.current || !ready) return;

    const intent = consumeAuthIntent();
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const target = intent?.scrollY
      ? intent.scrollY
      : saved
        ? parseInt(saved, 10)
        : 0;

    if (saved) sessionStorage.removeItem(STORAGE_KEY);
    if (!target) return;

    restored.current = true;

    // Stop Next.js / the browser from also managing scroll and fighting us.
    const prevRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    let done = false;
    const deadline = Date.now() + BUDGET_MS;

    function apply() {
      if (done) return;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: Math.min(target, maxScroll), behavior: "instant" });
      // Reached the target — or the page can't grow further and time's up.
      if (maxScroll >= target - TOLERANCE || Date.now() > deadline) {
        done = true;
        cleanup();
      }
    }

    const observer = new ResizeObserver(() => apply());
    observer.observe(document.documentElement);

    // Hard stop in case the body stops resizing before reaching the target.
    const timer = window.setTimeout(() => {
      done = true;
      cleanup();
    }, BUDGET_MS);

    function cleanup() {
      observer.disconnect();
      window.clearTimeout(timer);
      history.scrollRestoration = prevRestoration;
    }

    apply(); // first attempt synchronously

    return cleanup;
  }, [ready]);
}
