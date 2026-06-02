"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wires hls.js to a <video> element with feed-optimised settings.
 *
 * @param hlsUrl   - m3u8 URL (null = no-op)
 * @param active   - controlled by the feed coordinator (feed cards) OR
 *                   pass `true` permanently for detail page auto-play
 * @param paused   - optional manual pause toggle (detail page tap-to-pause)
 */
export function useHlsVideo(
  hlsUrl: string | null,
  active: boolean,
  paused = false,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buffering, setBuffering] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !hlsUrl) return;

    let hls: import("hls.js").default | null = null;
    let destroyed = false;

    async function init() {
      const Hls = (await import("hls.js")).default;
      if (destroyed) return;

      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 8,
          maxMaxBufferLength: 30,
          maxBufferSize: 20 * 1024 * 1024,
          backBufferLength: 4,
          startLevel: -1,
          abrEwmaFastLive: 3,
          abrEwmaSlowLive: 9,
          abrBandWidthFactor: 0.8,
          manifestLoadingTimeOut: 6000,
          manifestLoadingMaxRetry: 3,
          manifestLoadingRetryDelay: 500,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 3,
          nudgeMaxRetry: 5,
          nudgeOffset: 0.2,
        });
        hls.loadSource(hlsUrl!);
        hls.attachMedia(vid!);
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (!destroyed) setBuffering(false);
        });
      } else if (vid!.canPlayType("application/vnd.apple.mpegurl")) {
        vid!.src = hlsUrl!;
      }

      const onWaiting = () => setBuffering(true);
      const onPlaying = () => setBuffering(false);
      const onCanPlay = () => setBuffering(false);
      vid!.addEventListener("waiting", onWaiting);
      vid!.addEventListener("playing", onPlaying);
      vid!.addEventListener("canplay", onCanPlay);

      return () => {
        vid!.removeEventListener("waiting", onWaiting);
        vid!.removeEventListener("playing", onPlaying);
        vid!.removeEventListener("canplay", onCanPlay);
      };
    }

    const cleanupListeners = init();
    return () => {
      destroyed = true;
      cleanupListeners.then((fn) => fn?.());
      hls?.destroy();
    };
  }, [hlsUrl]);

  // Play / pause — driven by both the coordinator flag and manual paused toggle
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (active && !paused) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
      // Clear buffering indicator when inactive via a microtask so we
      // don't call setState synchronously inside an effect body.
      if (!active) Promise.resolve().then(() => setBuffering(false));
    }
  }, [active, paused]);

  return { videoRef, buffering };
}
