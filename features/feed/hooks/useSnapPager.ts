"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * How long to distrust scroll-derived indices after a programmatic jump.
 * Longer than a smooth scroll takes, short enough that a cancelled animation
 * doesn't leave the pager deaf for a noticeable beat.
 */
const PROGRAMMATIC_SETTLE_MS = 400;
/** When to check a smooth scroll actually arrived. See `goTo`. */
const LANDING_CHECK_MS = 500;
/** Quiet period after the last scroll event that counts as "the fling ended". */
const SETTLE_DEBOUNCE_MS = 120;

interface Options {
  /** Total slides. Used to clamp `goTo`. */
  count: number;
  /** Fires once per settled index change, after the scroll stops moving. */
  onSettle?: (index: number) => void;
}

/**
 * Drives a vertical one-slide-per-viewport snap scroller.
 *
 * The active slide is derived arithmetically from scrollTop rather than from
 * IntersectionObserver. That is not just cheaper — a global observer registry
 * would also be contested by the feed cards still mounted behind a full-screen
 * viewer, which report their own real viewport ratios. Arithmetic on this
 * scroller cannot be fooled that way, and it yields the single index that the
 * URL rewrite, the preload window and the pagination trigger all need.
 *
 * One gesture moves exactly one slide. `scroll-snap-stop: always` is supposed
 * to guarantee that, but it only holds when every child is a full-height snap
 * target and the geometry is stable; where it slips (older iOS especially) the
 * overshoot guard below pulls the fling back to a single step.
 */
export function useSnapPager({ count, onSettle }: Options) {
  // The scroller is exposed two ways on purpose. `scrollerRef` is a callback
  // ref for the JSX; `scrollerEl` is the same node in state, so effects that
  // need to attach listeners can DEPEND on it. A plain ref would not work
  // here: the viewer renders a loading tree first, so the element does not
  // exist on the first commit and an effect keyed on [] would never re-run
  // once it appeared.
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [scrollerEl, setScrollerEl] = useState<HTMLDivElement | null>(null);
  const scrollerRef = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
    setScrollerEl(node);
  }, []);
  const [index, setIndex] = useState(0);

  // Set while a programmatic scroll is in flight, so the intermediate scroll
  // events it generates don't drag the index through every slide it passes.
  const programmaticRef = useRef(false);
  const programmaticTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef(0);
  const indexRef = useRef(0);
  const onSettleRef = useRef(onSettle);

  // Index when the current touch gesture began, and the timer that decides the
  // gesture is over. Together they enforce the one-slide-per-swipe rule.
  const gestureStartRef = useRef<number | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onSettleRef.current = onSettle;
  }, [onSettle]);

  const commitIndex = useCallback((next: number) => {
    if (next === indexRef.current) return;
    indexRef.current = next;
    setIndex(next);
    onSettleRef.current?.(next);
  }, []);

  const goTo = useCallback(
    (target: number, behavior: ScrollBehavior = "smooth") => {
      const el = nodeRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(count - 1, target));
      const height = el.clientHeight;
      if (height <= 0) return;

      programmaticRef.current = true;
      // This jump supersedes whatever the finger was doing.
      gestureStartRef.current = null;
      if (programmaticTimer.current) clearTimeout(programmaticTimer.current);

      // Never scrollIntoView: it walks ancestors and can scroll the feed still
      // mounted behind the viewer.
      el.scrollTo({ top: clamped * height, behavior });
      commitIndex(clamped);

      programmaticTimer.current = setTimeout(() => {
        programmaticRef.current = false;
      }, PROGRAMMATIC_SETTLE_MS);

      if (behavior === "smooth") {
        // Safari cancels smooth scroll animations inside a mandatory snap
        // container, leaving the scroller parked between slides. Check where
        // it actually landed and hard-assign if it fell short.
        setTimeout(() => {
          const scroller = nodeRef.current;
          if (!scroller) return;
          const h = scroller.clientHeight;
          if (h <= 0) return;
          if (Math.round(scroller.scrollTop / h) !== clamped) {
            scroller.scrollTop = clamped * h;
          }
        }, LANDING_CHECK_MS);
      }
    },
    [count, commitIndex],
  );

  /**
   * Once the fling stops, refuse to have travelled more than one slide from
   * where the finger went down. A hard flick that carried four videos gets
   * pulled back to the next one, which is the TikTok contract.
   */
  const enforceSingleStep = useCallback(() => {
    const start = gestureStartRef.current;
    gestureStartRef.current = null;
    if (start === null) return;

    const landed = indexRef.current;
    const delta = landed - start;
    if (Math.abs(delta) <= 1) return;

    goTo(start + Math.sign(delta));
  }, [goTo]);

  // rAF-throttled, and it only commits when the ROUNDED index actually
  // changes. Re-rendering mid-scroll is what makes a snap scroller feel
  // sticky; the CSS is rarely the problem.
  const handleScroll = useCallback(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(enforceSingleStep, SETTLE_DEBOUNCE_MS);

    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const el = nodeRef.current;
      if (!el || programmaticRef.current) return;
      const height = el.clientHeight;
      if (height <= 0) return;
      commitIndex(Math.round(el.scrollTop / height));
    });
  }, [commitIndex, enforceSingleStep]);

  // Where the gesture started, which is what the overshoot guard measures
  // against. Passive: this only observes, it never blocks the scroll.
  useEffect(() => {
    if (!scrollerEl) return;
    const onTouchStart = () => {
      gestureStartRef.current = indexRef.current;
    };
    scrollerEl.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => scrollerEl.removeEventListener("touchstart", onTouchStart);
  }, [scrollerEl]);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (programmaticTimer.current) clearTimeout(programmaticTimer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    [],
  );

  return { scrollerRef, scrollerEl, index, goTo, handleScroll };
}
