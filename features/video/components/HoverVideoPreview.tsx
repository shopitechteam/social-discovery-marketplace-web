"use client";

/**
 * YouTube-style hover preview for video tiles: after a short hover delay the
 * tile's thumbnail is covered by a muted, looping, controls-free player;
 * moving the pointer away restores the thumbnail.
 *
 * Desktop-only by construction — the hover only arms on hover-capable,
 * fine-pointer devices, so touch taps never trigger a preview.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxCSSProperties } from "@mux/mux-player-react";

// Long enough to ignore the cursor merely passing across the grid, short
// enough to feel immediate on an intentional hover.
const HOVER_DELAY_MS = 250;

const canHoverPreview = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Arms a delayed hover flag. Spread `bind` onto the tile's cover element. */
export function useHoverPreview(enabled: boolean) {
  const [previewing, setPreviewing] = useState(false);
  const timer = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    setPreviewing(false);
  }, []);

  const onMouseEnter = useCallback(() => {
    if (!enabled || !canHoverPreview()) return;
    timer.current = window.setTimeout(() => setPreviewing(true), HOVER_DELAY_MS);
  }, [enabled]);

  useEffect(() => cancel, [cancel]);

  return { previewing, bind: { onMouseEnter, onMouseLeave: cancel } };
}

/** The player overlay itself — absolutely fills the (relative) cover box. */
export function HoverVideoPreview({ playbackId }: { playbackId: string }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      autoPlay="muted"
      muted
      loop
      playsInline
      preload="metadata"
      thumbnailTime={0}
      style={
        {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // Purely visual — clicks must fall through to the tile's link.
          pointerEvents: "none",
          "--controls": "none",
          "--media-object-fit": "cover",
        } as MuxCSSProperties
      }
    />
  );
}
