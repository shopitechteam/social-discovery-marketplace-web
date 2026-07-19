"use client";

/**
 * MuxVideo — thin wrapper around @mux/mux-player-react.
 * Handles iOS Safari, HLS, autoplay-muted out of the box.
 */

import MuxPlayer from "@mux/mux-player-react";

interface MuxVideoProps {
  /** Mux playback ID */
  muxPlaybackId?: string;
  /** Raw blob/mp4 src — used when no playbackId yet */
  src?: string;
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
  objectFit?: "cover" | "contain" | "fill";
  controls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: () => void;
  onLoadedMetadata?: () => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

export function MuxVideo({
  muxPlaybackId,
  src,
  className,
  style,
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
  poster,
  objectFit = "cover",
  controls = false,
  onPlay,
  onPause,
  onTimeUpdate,
  onLoadedMetadata,
}: MuxVideoProps) {
  // If no Mux playback ID, fall back to a plain <video> (blob / local file)
  if (!muxPlaybackId) {
    return (
      <video
        src={src}
        className={className}
        style={{ ...style, objectFit }}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        poster={poster}
        controls={controls}
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        preload="metadata"
      />
    );
  }

  return (
    <MuxPlayer
      playbackId={muxPlaybackId}
      className={className}
      style={{
        ...style,
        "--media-object-fit": objectFit,
        "--media-object-position": "center",
        width: "100%",
        height: "100%",
      } as never}
      autoPlay={autoPlay ? "muted" : false}
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      poster={poster ?? `https://image.mux.com/${muxPlaybackId}/thumbnail.webp?time=0&width=720`}
      streamType="on-demand"
      preload="auto"
      onPlay={onPlay}
      onPause={onPause}
      onTimeUpdate={onTimeUpdate}
      onLoadedMetadata={onLoadedMetadata}
    />
  );
}
