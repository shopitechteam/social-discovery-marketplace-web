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

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useId,
  useMemo,
} from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Shimmer, {
  SHIMMER,
  SHIMMER_AVATAR,
  SHIMMER_PORTRAIT,
} from "@/lib/shimmer";
import { registerVideo, updateRatio } from "@/lib/activeVideo";
import { useHlsVideo } from "@/lib/useHlsVideo";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { useInteractions } from "../hooks/useInteractions";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useFollow } from "../hooks/useFollow";
import { CommentsDrawer } from "./CommentsDrawer";
import { BufferSpinner } from "./BufferSpinner";
import toBase64 from "@/lib/utils";

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
          sizes="40px"
          placeholder="blur"
          blurDataURL={SHIMMER_AVATAR}
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
  const [active, setActive] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [muted, setMuted] = useState(true);
  const onThumbLoad = useCallback(() => setThumbLoaded(true), []);
  const id = useId();

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

  const isLandscape = mux?.aspectRatio === "16:9";
  const aspectRatio = isLandscape ? "16/9" : "9/16";

  const durationFmt = mux?.duration
    ? mux.duration >= 60
      ? `${Math.floor(mux.duration / 60)}:${String(Math.round(mux.duration % 60)).padStart(2, "0")}`
      : `0:${String(Math.round(mux.duration)).padStart(2, "0")}`
    : null;

  // hls.js — fast ABR + buffering state
  const { videoRef, buffering } = useHlsVideo(hlsUrl, active);

  // Register with the global video coordinator and report ratio changes.
  useEffect(() => {
    const unregister = registerVideo(id, setActive);
    const el = containerRef.current;
    if (!el) return unregister;
    const obs = new IntersectionObserver(
      ([e]) => updateRatio(id, e.intersectionRatio),
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      unregister();
    };
  }, [id]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden"
      style={{
        aspectRatio,
        maxHeight: isLandscape ? undefined : "75vw",
      }}
    >
      {/* Thumbnail — fades out once video is playing */}
      {thumbnail && (
        <FeedImage
          src={thumbnail}
          alt={post.title}
          sizes="100vw"
          className={`object-cover transition-opacity duration-500 ${
            hlsUrl && active && !buffering
              ? "opacity-0"
              : thumbLoaded
                ? "opacity-100"
                : "opacity-0"
          }`}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          blurDataURL={SHIMMER_PORTRAIT}
          onLoad={onThumbLoad}
        />
      )}
      {/* HLS video — src managed by useHlsVideo hook */}
      {hlsUrl && (
        <video
          ref={videoRef}
          muted={muted}
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* TikTok-style buffer spinner */}
      {active && buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <BufferSpinner />
        </div>
      )}
      {/* Duration badge */}
      {durationFmt && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-md">
          {durationFmt}
        </div>
      )}
      {/* Mute / unmute button — absolute, stops propagation so it doesn't navigate */}
      {active && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5 text-white/90 active:scale-95 transition-transform"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            // Muted — speaker with X
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            // Unmuted — speaker with sound waves
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.146 5.146a5 5 0 010 9.708v-1.717a3.001 3.001 0 000-6.274V5.146zm2.829-2.83a9 9 0 010 15.37l-.708-1.225a7 7 0 000-12.92l.708-1.225z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

// ── FeedImage — Next.js Image with error fallback + one auto-retry ───────────

function FeedImageInner({
  src,
  alt,
  sizes,
  className,
  priority,
  loading: loadingProp,
  blurDataURL,
  onLoad,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  blurDataURL?: string;
  onLoad?: () => void;
}) {
  const [retrySrc, setRetrySrc] = useState(src);
  const [errored, setErrored] = useState(false);
  const retried = useRef(false);

  function handleError() {
    if (!retried.current) {
      retried.current = true;
      setTimeout(() => setRetrySrc(`${src}?r=${Date.now()}`), 1500);
    } else {
      setErrored(true);
    }
  }

  if (errored) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface">
        <svg className="w-10 h-10 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={retrySrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      loading={loadingProp}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={handleError}
    />
  );
}

// Wrap with key=src so state resets automatically when the image URL changes
function FeedImage(props: Parameters<typeof FeedImageInner>[0]) {
  return <FeedImageInner key={props.src} {...props} />;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function mediaSrc(
  item: NonNullable<ContentCardFieldsFragment["media"]>[number] | undefined,
  variant: "large" | "medium" = "large",
): string | null {
  if (!item) return null;
  return (
    item.r2Variants?.find((v) => v.variant === variant)?.url ??
    item.r2Variants?.find((v) => v.variant === "medium")?.url ??
    item.r2Variants?.[0]?.url ??
    item.imageUrl ??
    item.thumbnailUrl ??
    null
  );
}

// ── Image media block ─────────────────────────────────────────────────────────

function ImageMedia({
  post,
  priority,
  onNavigate,
}: {
  post: ContentCardFieldsFragment;
  priority?: boolean;
  onNavigate: () => void;
}) {
  const media = useMemo(
    () =>
      [...(post.media ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      ),
    [post.media],
  );

  const nav = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate();
  };

  const GRID_H = "min(72vw, 380px)";
  const first = media[0];
  const firstSrc = mediaSrc(first, "large");

  if (!firstSrc) {
    return (
      <div
        className="w-full bg-surface flex items-center justify-center"
        style={{ height: GRID_H }}
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

  const count = media.length;

  if (count === 1) {
    return (
      <div
        className="relative w-full overflow-hidden bg-black cursor-pointer"
        style={{ height: GRID_H }}
        onClick={nav}
      >
        <FeedImage
          src={firstSrc}
          alt={post.title}
          sizes="100vw"
          className="object-cover"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          blurDataURL={`data:image/svg+xml;base64,${toBase64(Shimmer(700, 700))}`}
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="flex gap-0.5 overflow-hidden" style={{ height: GRID_H }}>
        {media.map((item, i) => {
          const src = mediaSrc(item, "large");
          return (
            <div key={i} className="relative flex-1 bg-black cursor-pointer" onClick={nav}>
              {src && (
                <FeedImage
                  src={src}
                  alt={post.title}
                  sizes="50vw"
                  className="object-cover"
                  priority={priority && i === 0}
                  loading={priority && i === 0 ? "eager" : "lazy"}
                  blurDataURL={SHIMMER}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="flex gap-0.5 overflow-hidden" style={{ height: GRID_H }}>
        <div className="relative flex-2 bg-black cursor-pointer" onClick={nav}>
          <FeedImage
            src={firstSrc}
            alt={post.title}
            sizes="66vw"
            className="object-cover"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            blurDataURL={SHIMMER}
          />
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          {media.slice(1, 3).map((item, i) => {
            const src = mediaSrc(item, "medium");
            return (
              <div key={i} className="relative flex-1 bg-black cursor-pointer" onClick={nav}>
                {src && (
                  <FeedImage
                    src={src}
                    alt={post.title}
                    sizes="33vw"
                    className="object-cover"
                    blurDataURL={SHIMMER}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const visible = media.slice(0, 4);
  const overflow = count - 4;

  return (
    <div className="grid grid-cols-2 gap-0.5 overflow-hidden" style={{ height: GRID_H }}>
      {visible.map((item, i) => {
        const src = mediaSrc(item, i === 0 ? "large" : "medium");
        const isLast = i === 3 && overflow > 0;
        return (
          <div key={i} className="relative bg-black cursor-pointer overflow-hidden" onClick={nav}>
            {src && (
              <FeedImage
                src={src}
                alt={post.title}
                sizes="50vw"
                className="object-cover"
                priority={priority && i === 0}
                loading={priority && i === 0 ? "eager" : "lazy"}
                blurDataURL={SHIMMER}
              />
            )}
            {isLast && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{overflow}</span>
              </div>
            )}
          </div>
        );
      })}
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
                className="font-semibold text-base text-default leading-tight hover:underline"
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
              <span className="flex items-center gap-0.5 text-muted-foreground text-[11px]">
                · <MapPin className="w-3 h-3" /> {post.location.county}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <span>{timeAgo(post.createdAt)}</span>
            {post.location?.placeName && (
              <>
                <span>·</span>
                <span className="truncate max-w-50">
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
        <p className="font-semibold text-default text-[15px] leading-snug mb-1">
          {post.title}
        </p>
        {caption && (
          <p className="text-default text-[14.5px] leading-7">
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
              <span key={tag} className="text-primary text-sm font-medium">
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
          <ImageMedia post={post} priority={priority} onNavigate={handleOpen} />
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
          contentCreatorId={post.creatorId}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentCount((c) => c + 1)}
        />
      )}
    </article>
  );
}
