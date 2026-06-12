"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
  className?: string;
  showTime?: boolean;
}

export function VideoProgressBar({
  videoRef,
  active,
  className = "",
  showTime = false,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const syncProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const pct = Math.max(0, Math.min(100, (video.currentTime / video.duration) * 100));
    if (fillRef.current) fillRef.current.style.width = `${pct}%`;
    if (thumbRef.current) thumbRef.current.style.left = `calc(${pct}% - 5px)`;
    if (timeRef.current) timeRef.current.textContent = fmtTime(video.currentTime);
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMetadata = () => {
      setDuration(video.duration || 0);
      syncProgress();
    };
    const handleSeeked = () => syncProgress();

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("durationchange", handleMetadata);
    video.addEventListener("seeked", handleSeeked);
    return () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("durationchange", handleMetadata);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [syncProgress, videoRef]);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      syncProgress();
      return;
    }

    function tick() {
      syncProgress();
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [active, syncProgress, videoRef]);

  function seekTo(clientX: number) {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track || !video.duration) return;

    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
    syncProgress();
  }

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-40 px-0 pb-0 pt-6 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {showTime && (
        <div className="mx-3 mb-1 flex items-center justify-between text-xs font-medium tabular-nums text-white/80 drop-shadow pointer-events-none">
          <span ref={timeRef}>0:00</span>
          <span>{fmtTime(duration)}</span>
        </div>
      )}

      <div
        ref={trackRef}
        className="group relative flex h-4 cursor-pointer touch-none items-end"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setSeeking(true);
          seekTo(e.clientX);
        }}
        onPointerMove={(e) => {
          if (seeking) seekTo(e.clientX);
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setSeeking(false);
          seekTo(e.clientX);
        }}
        onPointerCancel={() => setSeeking(false)}
      >
        <div
          className="relative h-[3px] w-full overflow-visible bg-primary/25 transition-[height]"
          style={{ height: seeking ? 4 : 3 }}
        >
          <div
            ref={fillRef}
            className="absolute left-0 top-0 h-full bg-primary"
            style={{ width: "0%" }}
          />
          <div
            ref={thumbRef}
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow-[0_1px_8px_rgba(0,0,0,0.45)] transition-opacity group-hover:opacity-100"
            style={{
              left: "-5px",
              opacity: seeking ? 1 : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
