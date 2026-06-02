"use client";

/**
 * ContentDetail — full-page post view.
 *
 * Layout (mobile-first, max-w 430px):
 *   ┌─────────────────────────────┐
 *   │  ← Back          [share]   │  sticky header
 *   ├─────────────────────────────┤
 *   │         media               │  video / image gallery
 *   ├─────────────────────────────┤
 *   │  [avatar] Name  · Follow    │
 *   │  Title                      │
 *   │  Caption…                   │
 *   │  #tag #tag                  │
 *   │  📍 location · 2h ago       │
 *   │  KES 310,000 · negotiable   │
 *   ├─────────────────────────────┤
 *   │  ❤️ Like  💬 Comment  ↗ Share│  action bar
 *   ├─────────────────────────────┤
 *   │  Comments (inline)          │
 *   │  ────────────────────────── │
 *   │  [avatar] add comment…  [➤] │  sticky input
 *   └─────────────────────────────┘
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useFollow } from "../hooks/useFollow";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SHIMMER, SHIMMER_AVATAR, SHIMMER_PORTRAIT } from "@/lib/shimmer";
import {
  GetContentDocument,
  GetCommentsDocument,
  AddCommentDocument,
  ToggleLikeDocument,
  ShareContentDocument,
  ViewContentDocument,
} from "@/types/__generated__/graphql";
import type {
  GetContentQuery,
  GetCommentsQuery,
} from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useHlsVideo } from "@/lib/useHlsVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { BufferSpinner } from "./BufferSpinner";

type CommentItem = NonNullable<GetCommentsQuery["comments"]["items"]>[number];

// ─── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(raw: unknown): string {
  if (!raw) return "";
  const diff = Date.now() - new Date(raw as string).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function avatarColors(id: string) {
  const palette = [
    "from-primary to-secondary",
    "from-violet-500 to-purple-600",
    "from-emerald-400 to-teal-500",
    "from-orange-400 to-rose-500",
    "from-sky-400 to-blue-600",
  ];
  return palette[parseInt(id.slice(-1), 16) % palette.length];
}

function initials(id: string) {
  return id.slice(-2).toUpperCase();
}

// ─── CommentRow ────────────────────────────────────────────────────────────────

function CommentRow({
  comment,
  currentUserId,
}: {
  comment: CommentItem;
  currentUserId?: string;
}) {
  const isOwn = currentUserId && comment.creatorId === currentUserId;
  // Until comment creator profiles are fetched, show a stable short alias
  const displayName = isOwn ? "You" : `User ···${comment.creatorId.slice(-4)}`;
  return (
    <div className="flex gap-3 py-3">
      <div
        className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors(comment.creatorId)} flex items-center justify-center flex-shrink-0 mt-0.5`}
      >
        <span className="text-white text-[10px] font-bold">
          {initials(comment.creatorId)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-surface rounded-2xl rounded-tl-sm px-3 py-2">
          <span className="text-xs font-semibold text-default">
            {displayName}
          </span>
          <p className="text-sm text-default leading-snug mt-0.5">
            {comment.text}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-[11px] text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
          {(comment.likeCount ?? 0) > 0 && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              ❤️ {comment.likeCount}
            </span>
          )}
          <button className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MobileImageCarousel ──────────────────────────────────────────────────────

type MediaItem = NonNullable<
  NonNullable<
    import("@/types/__generated__/graphql").GetContentQuery["content"]
  >["media"]
>[number];

function MobileImageCarousel({
  media,
  title,
  idx,
  onIdx,
}: {
  media: MediaItem[];
  title: string;
  idx: number;
  onIdx: (i: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Snap to idx imperatively so we don't fight browser scroll-snap
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }, [idx]);

  // Update idx when user swipes natively
  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) onIdx(i);
  }

  return (
    <div
      ref={trackRef}
      onScroll={handleScroll}
      className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      style={{ height: "100svh", scrollSnapType: "x mandatory" }}
    >
      {media.map((item, i) => {
        const src =
          item.r2Variants?.find((v) => v.variant === "large")?.url ??
          item.r2Variants?.[0]?.url ??
          item.imageUrl ??
          item.thumbnailUrl ??
          "";
        return (
          <div
            key={i}
            className="relative shrink-0 w-full snap-center bg-black"
            style={{ height: "100svh" }}
          >
            {src && (
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority={i === 0}
                placeholder="blur"
                blurDataURL={SHIMMER_PORTRAIT}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  id: string;
  lang: string;
}

export function ContentDetail({ id, lang }: Props) {
  const router = useRouter();
  const { requireAuth } = useAuthGuard(lang);
  const currentUser = useAuthStore((s) => s.user);

  // ── Content query ──────────────────────────────────────────────────────────
  const { data, loading } = useQuery(GetContentDocument, {
    variables: { id },
    // Always fetch fresh data for detail view so isLikedByMe / isFollowedByMe
    // reflect the current server state rather than a potentially stale cache.
    fetchPolicy: "cache-and-network",
  });

  // ── Comments query ─────────────────────────────────────────────────────────
  const {
    data: commentsData,
    loading: commentsLoading,
    fetchMore,
  } = useQuery(GetCommentsDocument, {
    variables: { contentId: id, limit: 20 },
    fetchPolicy: "cache-and-network",
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const client = useApolloClient();
  const [toggleLikeMutation] = useMutation(ToggleLikeDocument);
  const [addCommentMutation] = useMutation(AddCommentDocument);
  const [shareMutation] = useMutation(ShareContentDocument);
  const [viewMutation] = useMutation(ViewContentDocument);

  // ── Local state ────────────────────────────────────────────────────────────
  const post = data?.content;
  const [imgIdx, setImgIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  // Read liked/count straight from the Apollo cache (post updates reactively)
  const resolvedLiked = post?.isLikedByMe ?? false;
  const resolvedLikeCount = post?.stats?.likes ?? 0;
  const [commentCountOverride, setCommentCountOverride] = useState<
    number | null
  >(null);
  const resolvedCommentCount =
    commentCountOverride ?? post?.stats?.comments ?? 0;
  const [commentText, setCommentText] = useState("");
  const [optimisticComments, setOptimisticComments] = useState<CommentItem[]>(
    [],
  );
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  const isVideo = post?.type === "VIDEO";
  const media = [...(post?.media ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const mux = media[0]?.muxMeta;
  const hlsUrl = mux?.playbackId
    ? `https://stream.mux.com/${mux.playbackId}.m3u8`
    : null;

  // hls.js — fast ABR + buffering state. Always active; paused by tap.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { videoRef, buffering: videoBuffering } = useHlsVideo(
    isVideo ? hlsUrl : null,
    true,
    paused,
  );

  // Fire view on mount
  useEffect(() => {
    viewMutation({ variables: { contentId: id } }).catch(() => {});
  }, [id, viewMutation]);

  // ── Cache writer — keeps feed cards + detail in sync ──────────────────────
  function writeLikeToCache(liked: boolean, likeCount: number) {
    client.cache.modify({
      id: client.cache.identify({ __typename: "Content", id }),
      fields: {
        isLikedByMe: () => liked,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stats: (existing: any) => ({ ...existing, likes: likeCount }),
      },
    });
  }

  // ── Like handler ───────────────────────────────────────────────────────────
  async function handleLike() {
    if (!requireAuth({ contentId: id, action: "like" })) return;
    const wasLiked = resolvedLiked;
    const newLiked = !wasLiked;
    const newCount = resolvedLikeCount + (wasLiked ? -1 : 1);

    // Optimistic update straight into the cache
    writeLikeToCache(newLiked, newCount);

    try {
      const { data: res } = await toggleLikeMutation({
        variables: { contentId: id },
      });
      if (res?.toggleLike) {
        writeLikeToCache(res.toggleLike.liked, res.toggleLike.likeCount);
      }
    } catch {
      // Rollback
      writeLikeToCache(wasLiked, resolvedLikeCount);
    }
  }

  // ── Share handler ──────────────────────────────────────────────────────────
  function handleShare() {
    shareMutation({ variables: { contentId: id } }).catch(() => {});
    if (navigator.share && post) {
      navigator
        .share({ title: post.title, url: window.location.href })
        .catch(() => {});
    }
  }

  // ── Comment submit ─────────────────────────────────────────────────────────
  async function handleSend() {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    if (!requireAuth({ contentId: id, action: "comment" })) return;

    setCommentText("");
    const tempId = `temp-${Date.now()}`;
    const optimistic: CommentItem = {
      id: tempId,
      text: trimmed,
      creatorId: currentUser?.id ?? "me",
      createdAt: new Date().toISOString() as unknown,
      parentId: null,
      likeCount: 0,
      replyCount: 0,
      isLikedByMe: false,
      author: null,
    };
    setOptimisticComments((p) => [optimistic, ...p]);
    setCommentCountOverride(resolvedCommentCount + 1);

    // Scroll to the comments heading after optimistic insert
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const { data: res } = await addCommentMutation({
        variables: { input: { contentId: id, text: trimmed } },
      });
      if (res?.addComment) {
        setOptimisticComments((p) =>
          p.map((c) =>
            c.id === tempId
              ? { ...res.addComment, parentId: res.addComment.parentId ?? null }
              : c,
          ),
        );
      }
    } catch {
      setOptimisticComments((p) => p.filter((c) => c.id !== tempId));
      setCommentCountOverride(resolvedCommentCount - 1);
    }
  }

  // ── Load more comments on scroll ───────────────────────────────────────────
  const serverComments = commentsData?.comments?.items ?? [];
  const hasMore = commentsData?.comments?.hasMore ?? false;
  const endCursor = commentsData?.comments?.endCursor;
  const serverIds = new Set(serverComments.map((c) => c.id));
  const allComments: CommentItem[] = [
    ...optimisticComments.filter((c) => !serverIds.has(c.id)),
    ...serverComments,
  ];

  const handleLoadMore = useCallback(() => {
    if (!hasMore || !endCursor) return;
    fetchMore({
      variables: { contentId: id, limit: 20, after: endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          comments: {
            ...fetchMoreResult.comments,
            items: [
              ...(prev.comments?.items ?? []),
              ...(fetchMoreResult.comments?.items ?? []),
            ],
          },
        };
      },
    });
  }, [hasMore, endCursor, fetchMore, id]);

  const { sentinelRef: commentSentinelRef } = useInfiniteScroll({
    hasMore,
    loading: commentsLoading,
    onLoadMore: handleLoadMore,
  });

  // ── Follow — must be called unconditionally before any early returns ───────
  // data?.content is typed correctly via GetContentQuery — creator includes isFollowedByMe/followerCount
  const postCreatorForFollow = (data as GetContentQuery | undefined)?.content
    ?.creator;
  const {
    following,
    toggle: handleFollow,
    loading: followLoading,
  } = useFollow({
    userId: postCreatorForFollow?.id ?? data?.content?.creatorId ?? "",
    initialFollowing: postCreatorForFollow?.isFollowedByMe ?? false,
    initialFollowerCount: postCreatorForFollow?.followerCount ?? 0,
    lang,
  });

  // ── Loading state — full-screen TikTok skeleton ───────────────────────────
  if (loading) {
    return (
      <div className="md:hidden fixed inset-0 bg-black">
        {/* Media area */}
        <Skeleton className="absolute inset-0 rounded-none bg-neutral-900" />
        {/* Back button */}
        <Skeleton
          className="absolute left-4 w-12 h-12 rounded-full bg-neutral-700"
          style={{ top: "max(env(safe-area-inset-top,0px),16px)" }}
        />
        {/* Right action column */}
        <div
          className="absolute right-4 flex flex-col items-center gap-6"
          style={{ bottom: 180 }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-[52px] h-[52px] rounded-full bg-neutral-700" />
              <Skeleton className="h-2.5 w-8 rounded-full bg-neutral-700" />
            </div>
          ))}
        </div>
        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-20 px-4 pb-10 flex flex-col gap-2.5">
          <Skeleton className="h-3 w-20 rounded-full bg-neutral-700" />
          <Skeleton className="h-5 w-3/4 rounded-full bg-neutral-700" />
          <Skeleton className="h-7 w-1/2 rounded-full bg-neutral-700" />
          <Skeleton className="h-3 w-full rounded-full bg-neutral-700" />
          <Skeleton className="h-3 w-2/3 rounded-full bg-neutral-700" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">😕</div>
        <p className="text-default font-semibold">Post not found</p>
        <button
          onClick={() => router.back()}
          className="text-primary text-sm font-semibold"
        >
          Go back
        </button>
      </div>
    );
  }

  const caption = post.caption ?? "";
  const isLongCaption = caption.length > 180;
  const displayCaption =
    isLongCaption && !captionExpanded ? caption.slice(0, 180) + "…" : caption;
  // Use the properly typed creator — GetContentQuery.content.creator has isFollowedByMe + followerCount
  const postCreator = (data as GetContentQuery).content?.creator;
  const creatorName = postCreator?.profile?.firstName
    ? `${postCreator.profile.firstName} ${postCreator.profile.lastName ?? ""}`.trim()
    : postCreator === null
      ? `Seller ${post.creatorId.slice(-6)}` // resolver returned, still no profile
      : ""; // resolver still in-flight — don't flash garbage
  const avatarUrl = postCreator?.profile?.avatar;
  // isMyContent is resolved server-side — authoritative, no client-side ID comparison
  const isOwnPost = post.isMyContent ?? false;

  const CreatorRow = (
    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
      <div
        className={`w-10 h-10 rounded-full shrink-0  relative overflow-hidden ${avatarUrl ? "bg-surface" : `bg-gradient-to-br ${avatarColors(post.creatorId)}`} flex items-center justify-center`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={creatorName}
            className="w-full h-full object-cover"
            fill
            sizes="40px"
            placeholder="blur"
            blurDataURL={SHIMMER_AVATAR}
          />
        ) : (
          <span className="text-white text-xs font-bold">
            {post.creatorId.slice(-2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {creatorName ? (
          <p className="font-semibold text-sm text-default truncate">
            {creatorName}
          </p>
        ) : (
          <div className="h-3.5 w-28 rounded-full bg-surface animate-pulse" />
        )}
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {timeAgo(post.createdAt)}
        </p>
      </div>
      {!isOwnPost && (
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={[
            "text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all disabled:opacity-60",
            following
              ? "border-border text-muted-foreground bg-surface"
              : "border-primary text-primary hover:bg-primary/5",
          ].join(" ")}
        >
          {followLoading ? "…" : following ? "Following" : "+ Follow"}
        </button>
      )}
    </div>
  );

  const PostInfo = (
    <div className="px-4 pb-4 border-b border-default">
      {post.price && (
        <div className="mb-2.5">
          <span
            className="text-xl font-bold"
            style={{ color: "rgb(var(--brand-primary))" }}
          >
            {post.price.amount === 0
              ? "Free"
              : `${post.price.currency} ${post.price.amount.toLocaleString()}`}
          </span>
          {post.price.negotiable && (
            <span className="text-xs text-muted-foreground font-normal ml-2">
              · Negotiable
            </span>
          )}
        </div>
      )}
      <h1 className="text-default font-bold text-base leading-snug mb-2">
        {post.title}
      </h1>
      {caption && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          {displayCaption}
          {isLongCaption && (
            <button
              onClick={() => setCaptionExpanded((v) => !v)}
              className="text-primary font-medium ml-1"
            >
              {captionExpanded ? " less" : " more"}
            </button>
          )}
        </p>
      )}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-primary text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}
      {post.location?.placeName && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          {post.location.placeName}
          {post.location.county && `, ${post.location.county}`}
        </div>
      )}
    </div>
  );

  // Desktop inline action row (like/comment counts + share + message buttons)
  const DesktopActions = (
    <div className="hidden md:flex items-center gap-3 px-4 py-3 border-b border-default">
      {/* Like */}
      <button
        onClick={handleLike}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all"
        style={{
          borderColor: resolvedLiked
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-border))",
          color: resolvedLiked
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-text-muted))",
          backgroundColor: resolvedLiked
            ? "rgb(var(--brand-primary) / 0.06)"
            : "transparent",
        }}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill={resolvedLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={resolvedLiked ? 0 : 1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="text-xs font-semibold">
          {resolvedLikeCount > 0 ? `${fmt(resolvedLikeCount)} Likes` : "Like"}
        </span>
      </button>
      {/* Comment count */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <svg
          className="w-4 h-4"
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
        <span className="text-xs">
          {resolvedCommentCount > 0
            ? `${fmt(resolvedCommentCount)} Comments`
            : "Comments"}
        </span>
      </div>
      {/* Spacer */}
      <div className="flex-1" />
      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-default text-muted-foreground hover:border-primary hover:text-primary transition-all text-xs font-semibold"
      >
        <svg
          className="w-4 h-4"
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
        Share
      </button>
      {/* Message */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary, var(--brand-primary))))",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        Message Seller
      </button>
    </div>
  );

  const CommentsSection = (
    <div ref={commentsRef} className="px-4 pt-4">
      <h2 className="font-bold text-default text-sm mb-1">
        {resolvedCommentCount > 0
          ? `${fmt(resolvedCommentCount)} Comments`
          : "Comments"}
      </h2>
      {commentsLoading && allComments.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!commentsLoading && allComments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="text-3xl mb-2">💬</span>
          <p className="text-sm text-muted-foreground">No comments yet.</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Be the first to comment!
          </p>
        </div>
      )}
      <div className="divide-y divide-default">
        {allComments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            currentUserId={currentUser?.id}
          />
        ))}
      </div>
      <div ref={commentSentinelRef} className="h-1" />
      <div className="h-6" />
    </div>
  );

  const CommentInput = (
    <div
      className="flex items-center gap-2.5 px-3 pt-2.5 pb-3"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold bg-gradient-to-br ${avatarColors(currentUser?.id ?? "00")}`}
      >
        {currentUser?.id ? initials(currentUser.id) : "?"}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        onFocus={() => {
          if (!requireAuth({ contentId: id, action: "comment" }))
            inputRef.current?.blur();
        }}
        placeholder="Add a comment…"
        maxLength={500}
        className="flex-1 bg-surface text-default text-sm rounded-full px-4 py-2.5 outline-none placeholder:text-muted-foreground border border-default focus:border-primary transition-colors"
      />
      <button
        onClick={handleSend}
        disabled={!commentText.trim()}
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center transition-opacity disabled:opacity-35"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary, var(--brand-primary))))",
        }}
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
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-svh flex flex-col bg-app">
      {/* ════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (md+)
          Left col: media (sticky)   Right col: info + comments
          Inspired by Facebook/Instagram post detail
      ════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {/* ── Left: media ────────────────────────────────────────────────────── */}
        <div
          className="flex-1 bg-black flex items-center justify-center overflow-hidden"
          style={{ minWidth: 0 }}
        >
          {isVideo && hlsUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                loop
                muted={muted}
                playsInline
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: "100vh" }}
                onClick={() => setPaused((p) => !p)}
              />
              <button
                onClick={() => setMuted((m) => !m)}
                className="absolute bottom-6 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white"
              >
                {muted ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.146 5.146a5 5 0 010 9.708v-1.717a3.001 3.001 0 000-6.274V5.146zm2.829-2.83a9 9 0 010 15.37l-.708-1.225a7 7 0 000-12.92l.708-1.225z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {media[imgIdx] && (
                <Image
                  src={
                    media[imgIdx].r2Variants?.find((v) => v.variant === "large")
                      ?.url ??
                    media[imgIdx].r2Variants?.[0]?.url ??
                    media[imgIdx].imageUrl ??
                    media[imgIdx].thumbnailUrl ??
                    ""
                  }
                  alt={post.title}
                  fill
                  sizes="65vw"
                  className="object-contain"
                  priority
                  placeholder="blur"
                  blurDataURL={SHIMMER}
                />
              )}
              {/* Prev/next arrows for multi-image */}
              {media.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                    disabled={imgIdx === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30"
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
                  <button
                    onClick={() =>
                      setImgIdx((i) => Math.min(media.length - 1, i + 1))
                    }
                    disabled={imgIdx === media.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30"
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
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {media.map((_, i) => (
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
            </div>
          )}
        </div>

        {/* ── Right: info + comments + input ─────────────────────────────────── */}
        <div
          className="flex flex-col border-l border-default bg-app overflow-hidden"
          style={{ width: 380, flexShrink: 0 }}
        >
          {/* Header row */}
          <div className="flex items-center gap-2  h-12 border-b border-default shrink-0">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
            >
              <svg
                className="w-5 h-5 text-default"
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
            <span className="font-semibold text-default text-sm truncate flex-1">
              {post.title}
            </span>
          </div>

          {/* Scrollable middle: creator + info + actions + comments */}
          <div className="flex-1 overflow-y-auto">
            {CreatorRow}
            {PostInfo}
            {DesktopActions}
            {CommentsSection}
          </div>

          {/* Sticky comment input at bottom of right panel */}
          <div
            className="shrink-0 border-t border-default"
            style={{ backgroundColor: "rgb(var(--color-bg-elevated))" }}
          >
            {CommentInput}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE LAYOUT  (< md) — fixed full-screen, no scroll
      ════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed inset-0 bg-black overflow-hidden">
        {/* ── Full-screen media ───────────────────────────────────────────── */}
        <div className="absolute inset-0">
          {isVideo && hlsUrl ? (
            <>
              <video
                ref={videoRef}
                loop
                muted={muted}
                playsInline
                className="absolute inset-0 w-full h-full object-contain"
                onClick={() => setPaused((p) => !p)}
              />
              {/* Tap-to-pause indicator */}
              {paused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  </div>
                </div>
              )}
              {/* Buffer spinner */}
              {videoBuffering && !paused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <BufferSpinner />
                </div>
              )}
            </>
          ) : (
            <MobileImageCarousel
              media={media}
              title={post.title}
              idx={imgIdx}
              onIdx={setImgIdx}
            />
          )}

          {/* Back — top-left */}
          <button
            onClick={() => router.back()}
            className="absolute  z-30 w-12 h-12 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white"
            style={{ top: "max(env(safe-area-inset-top, 0px), 16px)" }}
          >
            <svg
              className="w-6 h-6"
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

          {/* Video mute — top-right */}
          {isVideo && (
            <button
              onClick={() => setMuted((m) => !m)}
              className="absolute z-30 w-12 h-12 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white"
              style={{
                top: "max(env(safe-area-inset-top, 0px), 16px)",
                right: 16,
              }}
            >
              {muted ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.146 5.146a5 5 0 010 9.708v-1.717a3.001 3.001 0 000-6.274V5.146zm2.829-2.83a9 9 0 010 15.37l-.708-1.225a7 7 0 000-12.92l.708-1.225z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Right-side action column */}
          <div
            className="absolute right-4 z-30 flex flex-col items-center gap-6"
            style={{
              bottom: "max(env(safe-area-inset-bottom, 0px) + 140px, 160px)",
            }}
          >
            {/* Like */}
            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-7 h-7 transition-all"
                  viewBox="0 0 24 24"
                  fill={resolvedLiked ? "rgb(var(--brand-primary))" : "none"}
                  stroke={resolvedLiked ? "rgb(var(--brand-primary))" : "white"}
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-white text-xs font-semibold drop-shadow">
                {resolvedLikeCount > 0 ? fmt(resolvedLikeCount) : "Like"}
              </span>
            </button>

            {/* Comment — opens drawer */}
            <button
              onClick={() => {
                if (!requireAuth({ contentId: id, action: "comment" })) return;
                setShowCommentDrawer(true);
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-[52px] h-[52px] rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
              <span className="text-white text-xs font-semibold drop-shadow">
                {resolvedCommentCount > 0
                  ? fmt(resolvedCommentCount)
                  : "Comment"}
              </span>
            </button>

            {/* Repost */}
            <button className="flex flex-col items-center gap-1.5">
              <div className="w-[52px] h-[52px] rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <span className="text-white text-xs font-semibold drop-shadow">
                Repost
              </span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-[52px] h-[52px] rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
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
              </div>
              <span className="text-white text-xs font-semibold drop-shadow">
                Share
              </span>
            </button>
          </div>

          {/* Overlay: title + description + creator bottom-left */}
          <div className="absolute bottom-0 left-0 right-16 z-20 px-4 pb-8 pt-20 bg-linear-to-t from-black/85 via-black/40 to-transparent">
            {/* Creator name */}
            {creatorName ? (
              <p className="text-white/80 text-sm font-semibold mb-1 drop-shadow">
                {creatorName}
              </p>
            ) : null}

            {/* Title */}
            <h1 className="text-white font-bold text-xl leading-snug drop-shadow-md">
              {post.title}
            </h1>

            {/* Price — larger, prominent */}
            {post.price && (
              <p className="text-white font-extrabold text-xl mt-1 drop-shadow-md">
                {post.price.amount === 0
                  ? "Free"
                  : `${post.price.currency} ${post.price.amount.toLocaleString()}`}
                {post.price.negotiable && (
                  <span className="font-normal text-white/70 text-base ml-2">
                    · negeotiable
                  </span>
                )}
              </p>
            )}

            {/* Description — 2 lines, tap "more" to expand like LinkedIn */}
            {caption && (
              <p
                className="text-white/90 text-base leading-relaxed mt-2 drop-shadow"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
              >
                <span className={captionExpanded ? "" : "line-clamp-2"}>
                  {caption}
                </span>
                {isLongCaption && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCaptionExpanded((v) => !v);
                    }}
                    className="text-white/60 font-semibold ml-1 underline underline-offset-2"
                  >
                    {captionExpanded ? "less" : "more"}
                  </button>
                )}
              </p>
            )}

            {/* Dot indicators for image carousel */}
            {!isVideo && media.length > 1 && (
              <div className="flex gap-1 mt-3">
                {media.map((_, i) => (
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
            )}
          </div>
        </div>

        {/* ── Comments drawer ──────────────────────────────────────────────── */}
        <Drawer open={showCommentDrawer} onOpenChange={setShowCommentDrawer}>
          <DrawerContent className="max-h-[80svh] flex flex-col">
            <DrawerHeader className="shrink-0 pb-2">
              <DrawerTitle>
                {resolvedCommentCount > 0
                  ? `${fmt(resolvedCommentCount)} Comments`
                  : "Comments"}
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-2">
              {CommentsSection}
            </div>
            <div
              className="shrink-0 border-t border-default"
              style={{
                backgroundColor: "rgb(var(--color-bg-elevated))",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
              }}
            >
              {CommentInput}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
