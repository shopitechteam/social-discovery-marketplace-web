"use client";

/**
 * DesktopFeed — TikTok-style fullscreen vertical feed for desktop (md+).
 *
 * Layout:
 *  - Left zone: media card + overlaid action buttons (TikTok-style right rail)
 *  - Right zone: comments panel always open, 420px wide
 *  - Chevron up/down navigation buttons between media and comments
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { useInteractions } from "../hooks/useInteractions";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useFollow } from "../hooks/useFollow";
import { CommentsDrawer } from "./CommentsDrawer";
import { useForYouFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useFeedPreferencesStore } from "@/stores/feedPreferences";
import { usePageFocused } from "../hooks/usePageFocused";

const COMMENTS_WIDTH = 420;

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function timeAgo(raw: unknown): string {
  if (!raw) return "";
  const diff = Date.now() - new Date(raw as string).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Action button (TikTok right-rail style) ───────────────────────────────────

function SideBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group select-none"
    >
      <div
        className={[
          "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150",
          active
            ? "bg-primary/20 ring-1 ring-primary/40"
            : "bg-black/30 hover:bg-black/50 ring-1 ring-white/10",
        ].join(" ")}
      >
        {icon}
      </div>
      <span className="text-[11px] font-semibold text-white drop-shadow-sm leading-none">
        {label}
      </span>
    </button>
  );
}

// ── Video player with play/pause + mute ───────────────────────────────────────

function VideoPlayer({
  playbackId,
  isActive,
}: {
  playbackId: string;
  isActive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const muted = useFeedPreferencesStore((s) => s.videoMuted);
  const toggleVideoMuted = useFeedPreferencesStore((s) => s.toggleVideoMuted);
  const [thumbError, setThumbError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const pageFocused = usePageFocused();

  const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const thumb = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=720&fit_mode=smartcrop`;

  // Play/pause driven by isActive
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive && pageFocused) {
      vid
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      vid.pause();
      if (!isActive) vid.currentTime = 0;
    }
  }, [isActive, pageFocused]);

  // RAF loop to update progress bar width
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    function tick() {
      const vid = videoRef.current;
      const bar = progressRef.current;
      const dot = dotRef.current;
      const time = timeRef.current;
      if (vid && vid.duration) {
        const pct = (vid.currentTime / vid.duration) * 100;
        if (bar) bar.style.width = `${pct}%`;
        if (dot) dot.style.left = `calc(${pct}% - 7px)`;
        if (time) time.textContent = fmtTime(vid.currentTime);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  function togglePlay() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      vid.pause();
      setPlaying(false);
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    toggleVideoMuted();
  }

  // Seek on progress bar click/drag
  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    const vid = videoRef.current;
    const bar = barRef.current;
    if (!vid || !bar || !vid.duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    vid.currentTime = pct * vid.duration;
    if (progressRef.current) progressRef.current.style.width = `${pct * 100}%`;
  }

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={togglePlay}>
      {/* Thumbnail until video loads */}
      {!thumbError && (
        <img
          src={thumb}
          alt=""
          className={[
            "absolute inset-0 w-full h-full object-contain transition-opacity duration-300",
            playing ? "opacity-0" : "opacity-100",
          ].join(" ")}
          onError={() => setThumbError(true)}
        />
      )}

      <video
        ref={videoRef}
        src={hlsUrl}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) =>
          setDuration((e.target as HTMLVideoElement).duration)
        }
      />

      {/* Pause indicator */}
      {!playing && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Mute toggle — top-right */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity hover:opacity-80"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <svg
            className="w-4 h-4 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.146 5.146a5 5 0 010 9.708v-1.717a3.001 3.001 0 000-6.274V5.146zm2.829-2.83a9 9 0 010 15.37l-.708-1.225a7 7 0 000-12.92l.708-1.225z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* ── TikTok-style progress bar + time — bottom of video ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 group/prog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Current / total time */}
        <div className="flex items-center justify-between px-3 pb-1 pointer-events-none select-none">
          <span
            ref={timeRef}
            className="text-white text-[11px] font-medium tabular-nums drop-shadow"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
          >
            0:00
          </span>
          {duration > 0 && (
            <span
              className="text-white/70 text-[11px] font-medium tabular-nums"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              {fmtTime(duration)}
            </span>
          )}
        </div>
        {/* Seek track — tall hit area so it's easy to click */}
        <div
          ref={barRef}
          className="relative w-full cursor-pointer flex items-end"
          style={{ height: 24 }}
          onClick={seekTo}
          onMouseDown={(e) => {
            setSeeking(true);
            seekTo(e);
          }}
          onMouseMove={(e) => {
            if (seeking) seekTo(e);
          }}
          onMouseUp={() => setSeeking(false)}
          onMouseLeave={() => setSeeking(false)}
        >
          {/* Track background */}
          <div
            className="w-full rounded-full overflow-visible relative"
            style={{
              height: seeking ? 4 : 3,
              transition: "height 0.15s",
              backgroundColor: "rgba(255,255,255,0.30)",
            }}
          >
            {/* Filled portion */}
            <div
              ref={progressRef}
              className="h-full rounded-full absolute top-0 left-0"
              style={{
                width: "0%",
                backgroundColor: "rgba(255,255,255,0.95)",
              }}
            />
          </div>

          {/* Scrubber dot — appears on hover / while seeking */}
          <div
            ref={dotRef}
            className="absolute rounded-full bg-white pointer-events-none opacity-0 group-hover/prog:opacity-100 transition-opacity duration-150"
            style={{
              width: 14,
              height: 14,
              bottom: 5,
              left: "-7px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.55)",
              opacity: seeking ? 1 : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Single post slide ─────────────────────────────────────────────────────────

function PostSlide({
  post,
  lang,
  isActive,
  onVisible,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  post: ContentCardFieldsFragment;
  lang: string;
  isActive: boolean;
  onVisible: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const slideRef = useRef<HTMLDivElement>(null);
  const [commentCount, setCommentCount] = useState(post.stats?.comments ?? 0);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const { requireAuth } = useAuthGuard(lang);
  const { liked, likeCount, handleLike, handleShare } = useInteractions(post, {
    requireAuth,
  });

  const creator = post.creator;
  const creatorName = creator?.profile?.firstName
    ? `${creator.profile.firstName}${creator.profile.lastName ? " " + creator.profile.lastName : ""}`
    : creator === null
      ? `Seller ${post.creatorId.slice(-6)}`
      : "...";

  const {
    following,
    toggle: handleFollow,
    loading: followLoading,
  } = useFollow({
    userId: creator?.id ?? post.creatorId,
    initialFollowing: creator?.isFollowedByMe ?? false,
    initialFollowerCount: creator?.followerCount ?? 0,
    lang,
  });

  const media = post.media?.[0];
  const mux = media?.muxMeta;
  const isVideo = post.type === "VIDEO" && !!mux?.playbackId;

  const imageMedia = [...(post.media ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const [imgIdx, setImgIdx] = useState(0);
  const imgSrc =
    imageMedia[imgIdx]?.r2Variants?.find((v) => v.variant === "large")?.url ??
    imageMedia[imgIdx]?.r2Variants?.[0]?.url ??
    imageMedia[imgIdx]?.imageUrl ??
    imageMedia[imgIdx]?.thumbnailUrl ??
    "";

  const caption = post.caption ?? "";
  const isLongCaption = caption.length > 100;
  const displayCaption =
    isLongCaption && !captionExpanded ? caption.slice(0, 100) + "…" : caption;

  // Notify parent when this slide is 60% in view → becomes active
  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          onVisible(post.id);
        }
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [post.id, onVisible]);

  return (
    <div
      ref={slideRef}
      className="relative flex h-screen w-full snap-start snap-always overflow-hidden"
      style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
    >
      {/* ── Left zone: media + action buttons ─────────────────────────────── */}
      {/* Takes up the space left of the comments panel */}
      <div
        className="relative flex items-center justify-center flex-1 h-full py-6"
        style={{ marginRight: COMMENTS_WIDTH }}
      >
        {/* Card + action buttons as a row */}
        <div className="flex items-end gap-3">
          {/* Card */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              height: "calc(100vh - 48px)",
              aspectRatio: isVideo
                ? mux?.aspectRatio === "16:9"
                  ? "16/9"
                  : "9/16"
                : "9/16",
              maxWidth: "min(68vh, 560px)",
              width: "100%",
              backgroundColor: "rgb(var(--color-bg))",
            }}
          >
            {isVideo ? (
              <VideoPlayer playbackId={mux!.playbackId!} isActive={isActive} />
            ) : imgSrc ? (
              <Image
                src={imgSrc}
                alt={post.title}
                fill
                sizes="65vw"
                className="object-contain"
                priority={isActive}
              />
            ) : (
              <div className="absolute inset-0 bg-surface flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-muted-foreground/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Multi-image navigation */}
            {!isVideo && imageMedia.length > 1 && (
              <>
                {imgIdx > 0 && (
                  <button
                    onClick={() => setImgIdx((i) => i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white z-10 hover:bg-black/70 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}
                {imgIdx < imageMedia.length - 1 && (
                  <button
                    onClick={() => setImgIdx((i) => i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white z-10 hover:bg-black/70 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {imageMedia.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={[
                        "rounded-full transition-all",
                        i === imgIdx
                          ? "w-4 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/50",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Bottom overlay: creator info + text */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-20 bg-linear-to-t from-black/80 via-black/25 to-transparent pointer-events-none z-10 rounded-b-2xl">
              {/* Creator row */}
              <div className="flex items-center gap-2 mb-2 pointer-events-auto">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 shrink-0 ring-2 ring-white/30">
                  {creator?.profile?.avatar ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={creator.profile.avatar}
                        alt={creatorName}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary to-secondary">
                      <span className="text-white text-[10px] font-bold">
                        {post.creatorId.slice(-2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-white font-semibold text-xs drop-shadow">
                  {creatorName}
                </span>
                <span className="text-white/60 text-[11px]">
                  · {timeAgo(post.createdAt)}
                </span>
              </div>
              {/* Title */}
              <p className="text-white font-bold text-sm leading-snug mb-1 drop-shadow">
                {post.title}
              </p>
              {/* Caption */}
              {caption && (
                <p className="text-white/80 text-xs leading-relaxed pointer-events-auto">
                  {displayCaption}
                  {isLongCaption && (
                    <button
                      onClick={() => setCaptionExpanded((v) => !v)}
                      className="text-white font-bold ml-1 underline-offset-2"
                    >
                      {captionExpanded ? "less" : "more"}
                    </button>
                  )}
                </p>
              )}
              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {post.hashtags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-white/70 text-[11px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {/* Price */}
              {post.price && (
                <p className="text-primary font-bold text-sm mt-2 drop-shadow">
                  {post.price.amount === 0
                    ? "Free"
                    : `${post.price.currency} ${post.price.amount.toLocaleString()}`}
                  {post.price.negotiable && (
                    <span className="text-white/60 font-normal text-xs ml-1">
                      · neg
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* ── Action buttons — flex sibling, right of card ── */}
          <div className="flex flex-col items-center gap-5 pb-14 self-end">
            {/* Avatar + follow */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative mb-1">
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/20">
                  {creator?.profile?.avatar ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={creator.profile.avatar}
                        alt={creatorName}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary to-secondary">
                      <span className="text-white text-xs font-bold">
                        {post.creatorId.slice(-2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {!(post.isMyContent ?? false) && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all disabled:opacity-60 shadow-md"
                    style={{
                      background: following
                        ? "rgb(var(--color-bg-elevated))"
                        : "rgb(var(--brand-primary))",
                      color: following
                        ? "rgb(var(--color-text-muted))"
                        : "white",
                      border: following
                        ? "1px solid rgb(var(--color-border))"
                        : "none",
                    }}
                  >
                    {followLoading ? "·" : following ? "✓" : "+"}
                  </button>
                )}
              </div>
            </div>

            {/* Like */}
            <SideBtn
              onClick={() => handleLike()}
              active={liked}
              label={likeCount > 0 ? fmt(likeCount) : "Like"}
              icon={
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill={liked ? "rgb(var(--brand-primary))" : "white"}
                  stroke={liked ? "none" : "white"}
                  strokeWidth={liked ? 0 : 1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              }
            />

            {/* Comment */}
            <SideBtn
              active
              label={commentCount > 0 ? fmt(commentCount) : "Comment"}
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
            />

            {/* Share */}
            <SideBtn
              onClick={() => handleShare()}
              label="Share"
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              }
            />

            {/* Message */}
            <SideBtn
              label="Message"
              icon={
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />
          </div>
          {/* end row wrapper */}
        </div>
      </div>

      {/* ── Chevron nav — floating between card and comments panel ─────────── */}
      <div
        className="absolute top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3"
        style={{ right: COMMENTS_WIDTH + 16 }}
      >
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgb(var(--color-border))",
          }}
          aria-label="Previous post"
        >
          <svg
            className="w-4 h-4"
            style={{ color: "rgb(var(--color-text))" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgb(var(--color-border))",
          }}
          aria-label="Next post"
        >
          <svg
            className="w-4 h-4"
            style={{ color: "rgb(var(--color-text))" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* ── Right zone: comments panel (always open) ─────────────────────── */}
      <div
        className="absolute top-0 right-0 h-full flex flex-col z-20"
        style={{
          width: COMMENTS_WIDTH,
          backgroundColor: "rgb(var(--color-bg-elevated))",
          borderLeft: "1px solid rgb(var(--color-border))",
        }}
      >
        {/* Header */}
        <div className="flex items-center px-5 py-4 border-b border-default shrink-0">
          <span className="font-semibold text-default text-sm">
            Comments
            {commentCount > 0 && (
              <span className="text-muted-foreground font-normal ml-1.5">
                ({fmt(commentCount)})
              </span>
            )}
          </span>
        </div>

        <CommentsDrawer
          contentId={post.id}
          contentCreatorId={post.creatorId}
          onClose={() => {}}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
          desktopInline
        />
      </div>
    </div>
  );
}

// ── Main DesktopFeed ──────────────────────────────────────────────────────────

export function DesktopFeed({ lang }: { lang: string }) {
  const { items, loading, hasMore, loadMore } = useForYouFeed();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    rootMargin: "1600px",
  });

  // Update URL when active post changes
  useEffect(() => {
    if (!activeId) return;
    const url = `/${lang}/content/${activeId}`;
    if (window.location.pathname !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [activeId, lang]);

  // Jump to post on direct /content/:id navigation
  useEffect(() => {
    const match = pathname.match(/\/content\/([^/]+)$/);
    if (!match || !items.length) return;
    const idx = items.findIndex((p) => p.id === match[1]);
    if (idx < 0) return;
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = idx * container.clientHeight;
  }, [pathname, items]);

  const handleVisible = useCallback((id: string) => setActiveId(id), []);

  const activeIdx = activeId ? items.findIndex((p) => p.id === activeId) : 0;

  function goTo(idx: number) {
    const container = containerRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    container.scrollTo({
      top: clamped * container.clientHeight,
      behavior: "instant",
    });
  }

  if (loading && items.length === 0) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
      >
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{
        backgroundColor: "rgb(var(--color-bg-subtle))",
        scrollbarWidth: "none",
      }}
    >
      {items.map((post, idx) => (
        <PostSlide
          key={post.id}
          post={post}
          lang={lang}
          isActive={activeId === post.id}
          onVisible={handleVisible}
          hasPrev={idx > 0}
          hasNext={idx < items.length - 1}
          onPrev={() => goTo(idx - 1)}
          onNext={() => goTo(idx + 1)}
        />
      ))}

      <div ref={sentinelRef} className="h-1" />

      {loading && items.length > 0 && (
        <div
          className="h-screen snap-start animate-pulse"
          style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
        >
          <div
            className="flex h-full items-center justify-center"
            style={{ marginRight: COMMENTS_WIDTH }}
          >
            <div className="h-[calc(100vh-48px)] w-[min(68vh,560px)] rounded-2xl bg-muted" />
          </div>
        </div>
      )}
    </div>
  );
}
