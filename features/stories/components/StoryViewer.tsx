"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxCSSProperties } from "@mux/mux-player-react";
import type { StoryRing, StoryItem } from "../hooks/useStoriesFeed";

interface Props {
  rings: StoryRing[];
  initialRingIndex: number;
  onClose: () => void;
  onMarkViewed: (storyId: string) => void;
}

const STORY_DURATION_MS = 5000;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Progress Bars ─────────────────────────────────────────────────────────────

function ProgressBars({
  total,
  current,
  playing,
  onComplete,
}: {
  total: number;
  current: number;
  playing: boolean;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  // Stable ref so the RAF loop never captures a stale onComplete
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    // Reset progress whenever the current segment changes
    setProgress(0);
    startRef.current = null;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (!playing) return;

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min(elapsed / STORY_DURATION_MS, 1);
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        onCompleteRef.current();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // Only re-run when the segment index or playing state changes — NOT when onComplete changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, playing]);

  return (
    <div className="flex gap-1 px-3 pt-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/30"
        >
          <div
            className="h-full bg-white rounded-full"
            style={{
              width:
                i < current ? "100%" : i === current ? `${progress * 100}%` : "0%",
              transition: "none",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ── StoryViewer ───────────────────────────────────────────────────────────────

export function StoryViewer({
  rings,
  initialRingIndex,
  onClose,
  onMarkViewed,
}: Props) {
  const [ringIdx, setRingIdx] = useState(initialRingIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);

  const ring = rings[ringIdx];
  const story: StoryItem | undefined = ring?.stories[storyIdx];
  const totalStories = ring?.stories.length ?? 0;

  // Mark viewed whenever story changes
  useEffect(() => {
    if (story) onMarkViewed(story.id);
  }, [story?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const advance = useCallback(() => {
    setStoryIdx((si) => {
      if (si < (rings[ringIdx]?.stories.length ?? 1) - 1) return si + 1;
      // Move to next ring
      setRingIdx((ri) => {
        if (ri < rings.length - 1) {
          return ri + 1;
        }
        // End of all stories
        onClose();
        return ri;
      });
      return 0;
    });
  }, [rings, ringIdx, onClose]);

  const goBack = useCallback(() => {
    setStoryIdx((si) => {
      if (si > 0) return si - 1;
      setRingIdx((ri) => {
        if (ri > 0) {
          const prevLen = rings[ri - 1]?.stories.length ?? 1;
          setStoryIdx(prevLen - 1);
          return ri - 1;
        }
        return ri;
      });
      return si;
    });
  }, [rings]);

  // Keyboard nav — stable handler via refs
  const advanceRef = useRef(advance);
  const goBackRef = useRef(goBack);
  const onCloseRef = useRef(onClose);
  useEffect(() => { advanceRef.current = advance; }, [advance]);
  useEffect(() => { goBackRef.current = goBack; }, [goBack]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") advanceRef.current();
      if (e.key === "ArrowLeft") goBackRef.current();
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    setPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dt = Date.now() - touchStartTime.current;

    setPaused(false);

    // Swipe down to close
    if (Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }

    // Short tap → navigate
    if (dt < 250 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const x = e.changedTouches[0].clientX;
      if (x < window.innerWidth / 2) goBack();
      else advance();
    }
  };

  // Click nav on desktop
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX;
    if (x < window.innerWidth / 2) goBack();
    else advance();
  };

  if (!ring || !story) return null;

  const user = ring.user;
  const avatar = user.profile?.avatar;
  const name =
    [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ") ||
    "User";
  const isVideo = story.media.mediaType === "VIDEO";
  const playbackId = story.media.muxPlaybackId;
  const mediaReady = story.media.processingStatus === "ready";
  const mediaSrc = story.media.imageUrl ?? story.media.thumbnailUrl ?? null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-screen media area */}
      <div className="relative w-full h-full flex items-center justify-center">

        {/* ── Media ─────────────────────────────────────────────────── */}
        {isVideo && playbackId && mediaReady ? (
          <MuxPlayer
            key={playbackId}
            playbackId={playbackId}
            autoPlay
            muted={false}
            playsInline
            style={
              {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                "--controls": "none",
                "--media-object-fit": "contain",
                "--media-background-color": "#000",
              } as MuxCSSProperties
            }
            onEnded={advance}
          />
        ) : mediaSrc ? (
          <Image
            key={mediaSrc}
            src={mediaSrc}
            alt="Story"
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-white/50">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-xs">Processing…</span>
            </div>
          </div>
        )}

        {/* ── Tap zones (z-10, behind all UI) ───────────────────────── */}
        <div className="absolute inset-0 z-10 flex" onClick={handleTap}>
          <div className="w-1/2 h-full" />
          <div className="w-1/2 h-full" />
        </div>

        {/* ── Progress bars + user info (z-20, no pointer events) ───── */}
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <div className="pt-safe-area-inset-top pt-2">
            <ProgressBars
              total={totalStories}
              current={storyIdx}
              playing={!paused && (mediaReady || (!isVideo && !!mediaSrc))}
              onComplete={advance}
            />
          </div>
          <div className="flex items-center gap-2.5 px-3 pt-2 pb-1 pr-14">
            {avatar ? (
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/50 flex-none">
                <Image src={avatar} alt={name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-none">
                {name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold leading-tight truncate drop-shadow">
                {name}
              </p>
              <p className="text-white/60 text-[11px]">{timeAgo(String(story.createdAt))}</p>
            </div>
          </div>
        </div>

        {/* ── Close button — z-30, fully isolated from tap zones ─────── */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 z-30 mt-safe-area-inset-top mt-10 mr-3 p-2 rounded-full bg-black/40 text-white active:bg-black/60"
          aria-label="Close stories"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* ── Caption ───────────────────────────────────────────────── */}
        {story.caption && (
          <div className="absolute bottom-10 left-0 right-0 z-20 px-5 pointer-events-none">
            <p className="text-white text-sm text-center leading-snug drop-shadow-lg line-clamp-4 bg-black/20 rounded-xl px-3 py-2">
              {story.caption}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
