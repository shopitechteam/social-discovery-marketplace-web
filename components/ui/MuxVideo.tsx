"use client";

/**
 * MuxVideo — reusable HLS-capable video player.
 *
 * Strategy:
 *  1. If `src` is a blob/object URL  → plain <video> (already in memory, no HLS)
 *  2. If the browser supports HLS natively (iOS Safari) → plain <video> with .m3u8
 *  3. Otherwise → hls.js attaches to the <video> element
 *
 * Props mirror a subset of <video> so callers swap <video> → <MuxVideo> with no friction.
 */

import { useEffect, useRef } from "react";

interface MuxVideoProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  /** Mux playback ID  — used to build HLS + poster URLs automatically */
  muxPlaybackId?: string;
  /**
   * Raw src override (blob URL or any mp4).
   * When provided, muxPlaybackId is ignored for the video src
   * (poster still comes from muxPlaybackId if available).
   */
  src?: string;
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  poster?: string;
  objectFit?: "cover" | "contain" | "fill";
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: () => void;
  onLoadedMetadata?: () => void;
}

function canPlayHlsNatively(): boolean {
  if (typeof document === "undefined") return false;
  const v = document.createElement("video");
  return v.canPlayType("application/vnd.apple.mpegurl") !== "";
}

export function MuxVideo({
  muxPlaybackId,
  src,
  className,
  style,
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = true,
  controls = false,
  poster,
  objectFit = "cover",
  onPlay,
  onPause,
  onTimeUpdate,
  onLoadedMetadata,
  videoRef: externalRef,
}: MuxVideoProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalRef ?? internalRef;

  // Derive URLs from muxPlaybackId when no raw src is given
  const hlsUrl = muxPlaybackId
    ? `https://stream.mux.com/${muxPlaybackId}.m3u8`
    : undefined;
  const mp4Url = muxPlaybackId
    ? `https://stream.mux.com/${muxPlaybackId}/low.mp4`
    : undefined;
  const posterUrl =
    poster ??
    (muxPlaybackId
      ? `https://image.mux.com/${muxPlaybackId}/thumbnail.webp?time=0&width=720`
      : undefined);

  // The effective source to play
  const effectiveSrc = src ?? hlsUrl ?? mp4Url;
  const isBlob = effectiveSrc?.startsWith("blob:");

  // Mute changes — handled separately so they never restart the video
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
  }, [muted]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !effectiveSrc) return;

    // Blobs and native HLS — let the browser handle it
    if (isBlob || canPlayHlsNatively() || !effectiveSrc.includes(".m3u8")) {
      el.src = effectiveSrc;
      el.muted = muted;
      if (autoPlay) el.play().catch(() => {/* iOS gesture requirement — silent */});
      return;
    }

    // Non-native HLS — use hls.js (loaded dynamically to keep bundle lean)
    let destroyed = false;
    import("hls.js").then(({ default: Hls }) => {
      if (destroyed || !videoRef.current) return;
      if (!Hls.isSupported()) {
        // Absolute fallback — try mp4
        if (mp4Url) videoRef.current.src = mp4Url;
        return;
      }
      const hls = new Hls({ startLevel: -1, autoStartLoad: true });
      hls.loadSource(effectiveSrc);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay && videoRef.current) {
          videoRef.current.muted = muted;
          videoRef.current.play().catch(() => {});
        }
      });
      // Cleanup
      (videoRef.current as any).__hls = hls;
    });

    return () => {
      destroyed = true;
      const hls = (el as any).__hls as import("hls.js").default | undefined;
      if (hls) { hls.destroy(); delete (el as any).__hls; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSrc, autoPlay]); // muted excluded — handled by its own effect above

  return (
    <video
      ref={videoRef as React.RefObject<HTMLVideoElement>}
      onPlay={onPlay}
      onPause={onPause}
      onTimeUpdate={onTimeUpdate}
      onLoadedMetadata={onLoadedMetadata}
      className={className}
      style={{ ...style, objectFit }}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      controls={controls}
      poster={posterUrl}
      // src intentionally omitted here — set via ref in useEffect
      // Exception: blob URLs don't trigger the effect path on first render
      src={isBlob ? effectiveSrc : undefined}
    />
  );
}
