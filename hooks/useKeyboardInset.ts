"use client";

import { useEffect, useState } from "react";

export interface ViewportState {
  /** Visible viewport height (excludes the on-screen keyboard). */
  height: number;
  /** How far the visual viewport is offset from the top of the layout viewport. */
  offsetTop: number;
  /** Height currently covered by the keyboard (0 when closed). */
  keyboardHeight: number;
}

function read(): ViewportState {
  if (typeof window === "undefined") {
    return { height: 0, offsetTop: 0, keyboardHeight: 0 };
  }
  const vv = window.visualViewport;
  if (!vv) {
    return { height: window.innerHeight, offsetTop: 0, keyboardHeight: 0 };
  }
  const keyboardHeight = Math.max(
    0,
    window.innerHeight - vv.height - vv.offsetTop,
  );
  return { height: vv.height, offsetTop: vv.offsetTop, keyboardHeight };
}

/**
 * Tracks the VisualViewport so a fixed overlay can be pinned to the *visible*
 * area above the on-screen keyboard — the basis for keyboard-avoiding views
 * (TikTok-style) where the keyboard slides over the content without the browser
 * scrolling/shifting the whole layer.
 */
export function useVisualViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(() => read());

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setState(read());
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}

/**
 * Convenience: just the keyboard height in px (0 when the keyboard is closed).
 */
export function useKeyboardInset(): number {
  return useVisualViewport().keyboardHeight;
}
