"use client";

import { useEffect, useState } from "react";

/**
 * Returns the height (in px) currently covered by the on-screen keyboard,
 * derived from the VisualViewport API. 0 when the keyboard is closed or the
 * API is unavailable.
 *
 * Use this to lift a fixed bottom element (e.g. a comment composer) above the
 * keyboard WITHOUT the browser scrolling/resizing the layout — giving the
 * native-app feel where the page behind stays put.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // The keyboard occupies the gap between the layout viewport bottom and the
      // visual viewport bottom. offsetTop covers cases where the page is pinned.
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setInset(covered > 0 ? covered : 0);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
