"use client";

/**
 * PostCard — Facebook/LinkedIn-style full-width post card.
 *
 * Structure:
 *   ┌────────────────────────────────────────┐
 *   │ [avatar]  Creator name · time  [···]   │  ← header
 *   │ Title + caption text                   │  ← text
 *   │ ──────────────────────────────────────  │
 *   │         media (image or video)          │  ← media
 *   │ ──────────────────────────────────────  │
 *   │ 💬 32  ❤️ 62   👁 1.2K    KSH 310,000 │  ← stats + price
 *   │ ──────────────────────────────────────  │
 *   │  👍 Like   💬 Comment   ↗ Share        │  ← actions
 *   └────────────────────────────────────────┘
 */

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { useInteractions } from "../hooks/useInteractions";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useFollow } from "../hooks/useFollow";
import { CommentsDrawer } from "./CommentsDrawer";

interface Props {
  post: ContentCardFieldsFragment;
  lang: string;
  priority?: boolean;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(raw: unknown): string {
  if (!raw) return "";
  const diff = Date.now() - new Date(raw as string).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return `${Math.floor(d / 30)}mo`;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function initials(id: string): string {
  // Until we have a user name, derive a 2-char placeholder from the id tail
  return id.slice(-2).toUpperCase();
}

// ── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  creatorId: string;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

function Avatar({ creatorId, avatarUrl, firstName, lastName }: AvatarProps) {
  const colors = [
    "from-primary to-secondary",
    "from-violet-500 to-purple-600",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-rose-500",
    "from-sky-400 to-blue-600",
  ];
  const color = colors[parseInt(creatorId.slice(-1), 16) % colors.length];
  const label = firstName
    ? `${firstName[0]}${lastName?.[0] ?? ""}`.toUpperCase()
    : initials(creatorId);

  if (avatarUrl) {
    return (
      <div className="w-10 h-10 rounded-full relative shrink-0 overflow-hidden bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          src={avatarUrl}
          alt={label}
          className="w-full h-full object-cover"
          fill
        />
      </div>
    );
  }

  return (
    <div
      className={`w-10 h-10 rounded-full bg-linear-to-br ${color} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white text-xs font-bold">{label}</span>
    </div>
  );
}

// ── Video media block ─────────────────────────────────────────────────────────

function VideoMedia({
  post,
  priority,
}: {
  post: ContentCardFieldsFragment;
  priority?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const media = post.media?.[0];
  const mux = media?.muxMeta;
  const hlsUrl = mux?.playbackId
    ? `https://stream.mux.com/${mux.playbackId}.m3u8`
    : null;
  const thumbnail =
    media?.thumbnailUrl ??
    (mux?.playbackId
      ? `https://image.mux.com/${mux.playbackId}/thumbnail.jpg?time=0&width=900&fit_mode=smartcrop`
      : null);

  // 16:9 for landscape videos, otherwise 9:16 capped to a max-height so it
  // doesn't take over the whole screen in a feed (like FB/LinkedIn does)
  const isLandscape = mux?.aspectRatio === "16:9";
  const aspectRatio = isLandscape ? "16/9" : "9/16";

  const durationFmt = mux?.duration
    ? mux.duration >= 60
      ? `${Math.floor(mux.duration / 60)}:${String(Math.round(mux.duration % 60)).padStart(2, "0")}`
      : `0:${String(Math.round(mux.duration)).padStart(2, "0")}`
    : null;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting && e.intersectionRatio >= 0.4),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (visible) vid.play().catch(() => {});
    else vid.pause();
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden"
      style={{
        aspectRatio,
        maxHeight: isLandscape ? undefined : "75vw",
      }}
    >
      {/* Thumbnail */}
      {thumbnail && !thumbError && (
        <Image
          src={thumbnail}
          alt={post.title}
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-300 ${hlsUrl && visible ? "opacity-0" : "opacity-100"}`}
          priority={priority}
          onError={() => setThumbError(true)}
        />
      )}
      {/* HLS video */}
      {hlsUrl && (
        <video
          ref={videoRef}
          src={hlsUrl}
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Duration badge */}
      {durationFmt && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-md">
          {durationFmt}
        </div>
      )}
      {/* Sound-off indicator */}
      {visible && (
        <div className="absolute bottom-2 left-2 bg-black/60 rounded-full p-1">
          <svg
            className="w-3.5 h-3.5 text-white/80"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Image media block ─────────────────────────────────────────────────────────

function ImageMedia({
  post,
  priority,
}: {
  post: ContentCardFieldsFragment;
  priority?: boolean;
}) {
  const media = [...(post.media ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState(false);

  const current = media[idx];
  const src =
    current?.r2Variants?.find((v) => v.variant === "large")?.url ??
    current?.r2Variants?.find((v) => v.variant === "medium")?.url ??
    current?.r2Variants?.[0]?.url ??
    current?.imageUrl ??
    current?.thumbnailUrl ??
    null;

  // Aspect ratio from stored dimensions, fallback 4:3
  const w = current?.displayWidth;
  const h = current?.displayHeight;
  const aspectRatio = w && h ? `${w}/${h}` : "4/3";

  if (!src || err) {
    return (
      <div
        className="w-full bg-surface flex items-center justify-center"
        style={{ aspectRatio: "4/3" }}
      >
        <svg
          className="w-12 h-12 text-muted-foreground/20"
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
    );
  }

  return (
    <div
      className="relative w-full bg-black overflow-hidden"
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={post.title}
        fill
        sizes="100vw"
        className="object-cover"
        priority={priority}
        onError={() => setErr(true)}
      />
      {/* Gallery indicator + prev/next */}
      {media.length > 1 && (
        <>
          {/* Dot strip */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={[
                  "rounded-full transition-all",
                  i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50",
                ].join(" ")}
              />
            ))}
          </div>
          {/* Count badge top-right */}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-md">
            {idx + 1} / {media.length}
          </div>
          {/* Arrow buttons */}
          {idx > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIdx((i) => i - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 text-white"
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
          {idx < media.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIdx((i) => i + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 text-white"
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
        </>
      )}
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-surface active:bg-surface transition-colors text-xs font-medium"
      style={{
        color: active
          ? "rgb(var(--brand-primary))"
          : "rgb(var(--color-text-muted))",
      }}
    >
      {icon}
      <span>{count !== undefined && count > 0 ? fmt(count) : label}</span>
    </button>
  );
}

// ── Main PostCard ─────────────────────────────────────────────────────────────

export function PostCard({ post, lang, priority }: Props) {
  const router = useRouter();
  const { requireAuth } = useAuthGuard(lang);
  const { liked, likeCount, handleLike, handleShare } = useInteractions(post, {
    requireAuth,
  });
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.stats?.comments ?? 0);

  const creator = post.creator;
  // creator is a FieldResolver — it may arrive slightly after the content item.
  // Only fall back to the "Seller …" placeholder when we're sure the resolver
  // returned and still gave us nothing (i.e. creator is explicitly null/undefined
  // but the query has finished). While creator is genuinely absent we show
  // nothing so there's no flash of raw ObjectId tail.
  const creatorName = creator?.profile?.firstName
    ? `${creator.profile.firstName}${creator.profile.lastName ? " " + creator.profile.lastName : ""}`
    : creator === null
      ? `Seller ${post.creatorId.slice(-6)}` // resolver returned, but no profile — genuine fallback
      : ""; // resolver hasn't arrived yet — render nothing
  // isMyContent is resolved server-side — no client-side ID comparison needed
  const isOwnPost = post.isMyContent ?? false;

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

  function handleCommentClick() {
    if (!requireAuth({ contentId: post.id, action: "comment" })) return;
    setShowComments(true);
  }

  const caption = post.caption ?? "";
  const isLong = caption.length > 160;
  const displayCaption =
    isLong && !expanded ? caption.slice(0, 160) + "…" : caption;

  function handleOpen() {
    router.push(`/${lang}/content/${post.id}`);
  }

  return (
    <article className="bg-elevated border-b border-default">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <button onClick={handleOpen}>
          <Avatar
            creatorId={post.creatorId}
            avatarUrl={creator?.profile?.avatar}
            firstName={creator?.profile?.firstName}
            lastName={creator?.profile?.lastName}
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {creatorName ? (
              <button
                onClick={handleOpen}
                className="font-semibold text-sm text-default leading-tight hover:underline"
              >
                {creatorName}
              </button>
            ) : (
              // creator FieldResolver hasn't arrived yet — shimmer placeholder
              <div className="h-3.5 w-24 rounded-full bg-surface animate-pulse" />
            )}
            {/* Follow button — hidden on own posts */}
            {!isOwnPost && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={[
                  "text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all disabled:opacity-60",
                  following
                    ? "border-border text-muted-foreground bg-surface"
                    : "border-primary text-primary hover:bg-primary/5",
                ].join(" ")}
              >
                {followLoading ? "…" : following ? "Following" : "+ Follow"}
              </button>
            )}
            {post.location?.county && (
              <span className="text-muted-foreground text-[11px]">
                · 📍 {post.location.county}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
            <span>{timeAgo(post.createdAt)}</span>
            {post.location?.placeName && (
              <>
                <span>·</span>
                <span className="truncate max-w-[120px]">
                  {post.location.placeName}
                </span>
              </>
            )}
          </div>
        </div>
        {/* More options button */}
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface text-muted-foreground">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      {/* ── Text content ───────────────────────────────────────────────── */}
      <div className="px-4 pb-2.5">
        <p className="font-semibold text-default text-sm leading-snug mb-1">
          {post.title}
        </p>
        {caption && (
          <p className="text-default text-sm leading-relaxed">
            {displayCaption}
            {isLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                className="text-muted-foreground font-medium ml-1"
              >
                {expanded ? " See less" : " See more"}
              </button>
            )}
          </p>
        )}
        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {post.hashtags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-primary text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Media ──────────────────────────────────────────────────────── */}
      <div className="cursor-pointer" onClick={handleOpen}>
        {post.type === "VIDEO" ? (
          <VideoMedia post={post} priority={priority} />
        ) : (
          <ImageMedia post={post} priority={priority} />
        )}
      </div>

      {/* ── Stats + price ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Engagement summary (like FB — "62 · 28 comments") */}
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          {likeCount > 0 && (
            <span className="flex items-center gap-0.5">
              <span className="text-sm">❤️</span> {fmt(likeCount)}
            </span>
          )}
          {(post.stats?.comments ?? 0) > 0 && (
            <span>{fmt(post.stats!.comments)} comments</span>
          )}
          {(post.stats?.views ?? 0) > 0 && (
            <span>· {fmt(post.stats!.views)} views</span>
          )}
        </div>
        {/* Price */}
        {post.price && (
          <span className="text-primary font-bold text-sm">
            {post.price.amount === 0
              ? "Free"
              : `${post.price.currency} ${post.price.amount.toLocaleString()}`}
            {post.price.negotiable && (
              <span className="text-muted-foreground font-normal text-xs ml-1">
                · neg
              </span>
            )}
          </span>
        )}
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="h-px mx-4 bg-border" />

      {/* ── Action bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center px-2 pb-1">
        <ActionBtn
          onClick={() => handleLike()}
          active={liked}
          icon={
            <svg
              className="w-[18px] h-[18px] transition-all"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                fill={liked ? "rgb(var(--brand-primary))" : "none"}
                stroke={liked ? "rgb(var(--brand-primary))" : "currentColor"}
                strokeWidth={liked ? 0 : 1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          label="Like"
          count={likeCount}
        />
        <ActionBtn
          onClick={handleCommentClick}
          icon={
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
          label="Comment"
          count={commentCount}
        />
        <ActionBtn
          onClick={() => handleShare()}
          icon={
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          }
          label="Share"
        />
        <ActionBtn
          onClick={handleOpen}
          icon={
            <svg
              className="w-[18px] h-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 5.943 7.523 3 12 3c4.478 0 8.268 2.943 9.542 9-1.274 6.057-5.064 9-9.542 9-4.477 0-8.268-2.943-9.542-9z"
              />
            </svg>
          }
          label="View"
        />
      </div>

      {/* ── Comments drawer ─────────────────────────────────────────────── */}
      {showComments && (
        <CommentsDrawer
          contentId={post.id}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      )}
    </article>
  );
}
