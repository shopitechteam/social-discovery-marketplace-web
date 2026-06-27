/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Bookmark,
  MessageCircle,
  Send,
  Share2,
  Heart,
  X,
  MoreHorizontal,
  Link2,
  Flag,
} from "lucide-react";
import { gql } from "@apollo/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";

import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useFollow } from "../hooks/useFollow";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SHIMMER, SHIMMER_AVATAR, SHIMMER_PORTRAIT } from "@/lib/shimmer";
import {
  GetCommentsDocument,
  AddCommentDocument,
  ShareContentDocument,
  ToggleLikeDocument,
  ToggleCommentLikeDocument,
  ViewContentDocument,
} from "@/types/__generated__/graphql";
import type {
  ContentCardFieldsFragment,
  GetCommentsQuery,
} from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useHlsVideo } from "@/lib/useHlsVideo";
import { Skeleton } from "@/components/ui/skeleton";
import { BufferSpinner } from "./BufferSpinner";
import { useFeedPreferencesStore } from "@/stores/feedPreferences";
import { InlineChatPanel } from "@/features/messaging/components/InlineChatPanel";
import { fmtCompact as fmt } from "@/lib/format";
import {
  avatarGradient as avatarColors,
  idInitials as initials,
} from "@/lib/avatar";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { VideoProgressBar } from "./VideoProgressBar";
import { usePageFocused } from "../hooks/usePageFocused";
import { shouldFire } from "@/lib/interactionDedup";
import { timeAgoLong as timeAgo } from "@/lib/time";

type CommentItem = NonNullable<GetCommentsQuery["comments"]["items"]>[number];
type DetailPost = ContentCardFieldsFragment & {
  categoryId?: string | null;
  specs?: Array<{ key: string; value: string }>;
  aiClassification?: {
    categoryId?: string | null;
    confidence?: number | null;
    level1?: string | null;
    level2?: string | null;
    level3?: string | null;
    rawLabel?: string | null;
  } | null;
  location?:
    | (ContentCardFieldsFragment["location"] & {
        country?: string | null;
      })
    | null;
};

const ContentDetailDocument = gql`
  query ContentDetailPdp($id: String!) {
    content(id: $id) {
      id
      type
      source
      isLive
      tiktokEmbed {
        videoId
        shareUrl
        coverImageUrl
        authorUsername
        authorName
        title
        duration
      }
      title
      caption
      hashtags
      creatorId
      categoryId
      allowDownload
      hdEnabled
      createdAt
      creator {
        id
        username
        isVerified
        isFollowedByMe
        followerCount
        profile {
          firstName
          lastName
          avatar
        }
      }
      media {
        mediaType
        url
        imageUrl
        thumbnailUrl
        sortOrder
        displayWidth
        displayHeight
        muxMeta {
          playbackId
          duration
          aspectRatio
          thumbnailUrl
          animatedThumbnailUrl
        }
        r2Variants {
          url
          variant
          width
          height
        }
      }
      price {
        amount
        currency
        negotiable
      }
      specs {
        key
        value
      }
      aiClassification {
        categoryId
        confidence
        level1
        level2
        level3
        rawLabel
      }
      stats {
        views
        likes
        shares
        saves
        comments
      }
      location {
        country
        county
        subregion
        placeName
        formattedAddress
      }
      ranking {
        rankScore
        trendingScore
      }
      isLikedByMe
      isSavedByMe
      isMyContent
    }
  }
`;

// ─── helpers ──────────────────────────────────────────────────────────────────
// Shared utilities (fmt, avatarColors/initials, useIsDesktop) now live in
// @/lib and @/hooks; imported above and aliased to keep call sites unchanged.

// ─── CommentRow ────────────────────────────────────────────────────────────────

function CommentRow({
  comment,
  currentUserId,
  onToggleLike,
}: {
  comment: CommentItem;
  currentUserId?: string;
  onToggleLike?: (commentId: string) => void;
}) {
  const isOwn = currentUserId && comment.creatorId === currentUserId;
  const authorName = [
    comment.author?.profile?.firstName,
    comment.author?.profile?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName =
    authorName || (isOwn ? "You" : `User ···${comment.creatorId.slice(-4)}`);
  const avatarUrl = comment.author?.profile?.avatar;
  return (
    <div className="flex gap-3 py-3">
      <div
        className={`relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br ${avatarColors(comment.creatorId)}`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName || "Comment author"}
            fill
            sizes="32px"
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-white text-xs font-bold">
            {initials(comment.creatorId)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-surface rounded-2xl rounded-tl-sm px-3 py-2">
          <span className="text-xs font-semibold text-default">
            <span className="break-words">{displayName}</span>
          </span>
          <p className="mt-0.5 break-words text-sm leading-snug text-default">
            {comment.text}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
          <button
            type="button"
            onClick={() => onToggleLike?.(comment.id)}
            className={[
              "flex items-center gap-1 text-xs font-semibold transition-colors",
              comment.isLikedByMe ? "text-rose-500" : "text-muted-foreground",
            ].join(" ")}
          >
            <Heart
              className="h-3.5 w-3.5"
              fill={comment.isLikedByMe ? "currentColor" : "none"}
              strokeWidth={2}
            />
            {comment.likeCount > 0 ? comment.likeCount : "Like"}
          </button>
          <button className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MobileImageCarousel ──────────────────────────────────────────────────────

type MediaItem = NonNullable<DetailPost["media"]>[number];

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
      className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      style={{ scrollSnapType: "x mandatory" }}
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
            className="relative h-full shrink-0 w-full snap-center bg-black"
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

function downloadSrc(post: DetailPost): string | null {
  const first = post.media?.[0];
  if (!first) return null;

  if (post.type === "VIDEO") {
    const playbackId = first.muxMeta?.playbackId;
    return (
      first.url ??
      (playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null)
    );
  }

  const preferredVariant = post.hdEnabled ? "original" : "large";
  return (
    first.r2Variants?.find((v) => v.variant === preferredVariant)?.url ??
    first.r2Variants?.find((v) => v.variant === "large")?.url ??
    first.r2Variants?.find((v) => v.variant === "medium")?.url ??
    first.r2Variants?.[0]?.url ??
    first.imageUrl ??
    first.thumbnailUrl ??
    null
  );
}

function ContentVideo({
  hlsUrl,
  thumbnailUrl,
  muted,
  setMuted,
  fill = false,
  showMuteButton = false,
  showSpinner = false,
  onVideoCompleted,
  onVideoReplayed,
}: {
  hlsUrl: string;
  thumbnailUrl?: string | null;
  muted: boolean;
  setMuted?: (muted: boolean) => void;
  fill?: boolean;
  showMuteButton?: boolean;
  showSpinner?: boolean;
  onVideoCompleted?: (completionRate: number, watchDuration: number) => void;
  onVideoReplayed?: () => void;
}) {
  const pageFocused = usePageFocused();
  const [manualPaused, setManualPaused] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const shouldPlay = pageFocused && !manualPaused;
  // Reconcile mute state when the browser forces the element muted to satisfy
  // autoplay policy, so the speaker icon matches the video's real audio state.
  const onMutedChange = useCallback(
    (forcedMuted: boolean) => setMuted?.(forcedMuted),
    [setMuted],
  );
  const { videoRef, buffering } = useHlsVideo(
    hlsUrl,
    shouldPlay,
    videoEnded,
    onMutedChange,
  );

  // Authoritative mute toggle — apply to the element AND the store in one tap.
  const toggleMuted = useCallback(() => {
    const next = !muted;
    const video = videoRef.current;
    if (video) {
      video.muted = next;
      if (!next) video.play().catch(() => {});
    }
    setMuted?.(next);
  }, [muted, videoRef, setMuted]);
  const [playing, setPlaying] = useState(false);
  const endedCountRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
    video.defaultMuted = muted;
    video.playsInline = true;
    // Unmuting requires the user gesture's activation to actually emit audio;
    // re-issue play so a video that autoplayed muted starts sounding on one tap
    // (covers the parent-chrome mute button which only flips the store).
    if (!muted && shouldPlay) video.play().catch(() => {});

    const markPlaying = () => setPlaying(true);
    const markStopped = () => setPlaying(false);
    const handleEnded = () => {
      setPlaying(false);
      setVideoEnded(true);
      const duration = video.duration || 0;
      const watched = video.currentTime || duration;
      const completionRate = duration > 0 ? Math.min(watched / duration, 1) : 1;
      endedCountRef.current += 1;
      if (endedCountRef.current === 1) {
        onVideoCompleted?.(completionRate, watched);
      } else {
        onVideoReplayed?.();
      }
    };

    video.addEventListener("playing", markPlaying);
    video.addEventListener("pause", markStopped);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("playing", markPlaying);
      video.removeEventListener("pause", markStopped);
      video.removeEventListener("ended", handleEnded);
    };
  }, [hlsUrl, muted, shouldPlay, videoRef, onVideoCompleted, onVideoReplayed]);

  function handleReplay() {
    const video = videoRef.current;
    if (!video) return;
    endedCountRef.current += 1;
    setVideoEnded(false);
    setManualPaused(false);
    video.currentTime = 0;
    video.play().catch(() => {});
    onVideoReplayed?.();
  }

  const objectClass = "object-contain";
  const videoClassName = fill
    ? `absolute inset-0 w-full h-full ${objectClass}`
    : `max-w-full max-h-full ${objectClass}`;
  const showPlayOverlay =
    manualPaused || (!playing && !buffering && pageFocused);

  function togglePlayback() {
    const video = videoRef.current;

    if (manualPaused || video?.paused) {
      setManualPaused(false);
      video?.play().catch(() => {});
      return;
    }

    setManualPaused(true);
    video?.pause();
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full ${objectClass} transition-opacity duration-500 pointer-events-none z-10 ${playing && !buffering ? "opacity-0" : "opacity-100"}`}
        />
      )}

      <video
        ref={videoRef}
        muted={muted}
        playsInline
        preload="auto"
        poster={thumbnailUrl ?? undefined}
        className={videoClassName}
        style={fill ? undefined : { maxHeight: "100vh" }}
      />

      {/* Replay overlay — shown when video finishes */}
      {videoEnded ? (
        <button
          type="button"
          onClick={handleReplay}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40"
          aria-label="Replay video"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute inset-0 z-20 flex items-center justify-center"
          aria-label={manualPaused || !playing ? "Play video" : "Pause video"}
        >
          <span
            className={[
              "flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-opacity duration-200",
              showPlayOverlay ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            {manualPaused || !playing ? (
              <svg
                className="ml-1 h-7 w-7"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              </svg>
            )}
          </span>
        </button>
      )}

      {showSpinner && buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <BufferSpinner />
        </div>
      )}

      <VideoProgressBar videoRef={videoRef} active={playing} showTime={!fill} />

      {showMuteButton && setMuted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMuted();
          }}
          className="absolute bottom-12 right-4 z-50 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white"
        >
          {muted ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  id: string;
  lang: string;
  desktopMode?: "page" | "sheet";
  onRequestClose?: () => void;
  /** Sheet mode: notifies the host so it can widen the panel for the chat column. */
  onChatOpenChange?: (open: boolean) => void;
}

export function ContentDetail({
  id,
  lang,
  desktopMode = "page",
  onRequestClose,
  onChatOpenChange,
}: Props) {
  const router = useRouter();
  const goBack = onRequestClose ?? (() => router.back());
  const { requireAuth } = useAuthGuard(lang);
  const currentUser = useAuthStore((s) => s.user);
  const isSheet = desktopMode === "sheet";
  // Stored in state (not a ref) so the Popover portal target is stable across
  // renders and available the first time the menu opens.
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const openChat = useCallback(() => {
    if (!requireAuth({ contentId: id })) return;
    setChatOpen(true);
    onChatOpenChange?.(true);
  }, [requireAuth, id, onChatOpenChange]);

  const closeChat = useCallback(() => {
    setChatOpen(false);
    onChatOpenChange?.(false);
  }, [onChatOpenChange]);

  // ── Content query ──────────────────────────────────────────────────────────
  const { data, loading } = useQuery(ContentDetailDocument as any, {
    variables: { id },
    // Always fetch fresh data for detail view so isLikedByMe / isFollowedByMe
    // reflect the current server state rather than a potentially stale cache.
    fetchPolicy: "cache-and-network",
  }) as {
    data?: { content?: DetailPost | null };
    loading: boolean;
  };

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
  const [addCommentMutation] = useMutation(AddCommentDocument);
  const [toggleLikeMutation] = useMutation(ToggleLikeDocument);
  const [toggleCommentLikeMutation] = useMutation(ToggleCommentLikeDocument);
  const [trackInteractionMutation] = useMutation(gql`
    mutation TrackInteractionDetail(
      $contentId: String!
      $type: InteractionType!
      $watchDuration: Float
      $completionRate: Float
    ) {
      trackInteraction(
        input: {
          contentId: $contentId
          type: $type
          watchDuration: $watchDuration
          completionRate: $completionRate
        }
      )
    }
  `);
  const [shareMutation] = useMutation(ShareContentDocument);
  const [viewMutation] = useMutation(ViewContentDocument);
  const [toggleSaveMutation] = useMutation(gql`
    mutation ToggleSaveDetail($contentId: String!, $collectionId: String) {
      toggleSave(contentId: $contentId, collectionId: $collectionId) {
        saved
        saveCount
        collectionId
      }
    }
  `) as any;
  const [reportMutation] = useMutation(gql`
    mutation ReportContentDetail($contentId: String!) {
      reportContent(contentId: $contentId)
    }
  `);

  // ── Local state ────────────────────────────────────────────────────────────
  const post = data?.content;
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const muted = useFeedPreferencesStore((s) => s.videoMuted);
  const setVideoMuted = useFeedPreferencesStore((s) => s.setVideoMuted);
  const isDesktop = useIsDesktop();
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const keyboardInset = useKeyboardInset();
  const resolvedLiked = post?.isLikedByMe ?? false;
  const resolvedLikeCount = post?.stats?.likes ?? 0;
  const resolvedSaved =
    (post as typeof post & { isSavedByMe?: boolean })?.isSavedByMe ?? false;
  const resolvedSaveCount = post?.stats?.saves ?? 0;
  const [commentCountOverride, setCommentCountOverride] = useState<
    number | null
  >(null);
  const resolvedCommentCount =
    commentCountOverride ?? post?.stats?.comments ?? 0;
  const [commentText, setCommentText] = useState("");
  const [optimisticComments, setOptimisticComments] = useState<CommentItem[]>(
    [],
  );
  const [commentLikeOverrides, setCommentLikeOverrides] = useState<
    Record<string, { liked: boolean; likeCount: number }>
  >({});
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
  const videoThumbnail =
    media[0]?.thumbnailUrl ??
    (mux?.playbackId
      ? `https://image.mux.com/${mux.playbackId}/thumbnail.jpg?time=0&width=900&fit_mode=smartcrop`
      : null);

  // Fire view on mount
  useEffect(() => {
    viewMutation({ variables: { contentId: id } }).catch(() => {});
  }, [id, viewMutation]);

  // ── Video completion / replay tracking ────────────────────────────────────
  const handleVideoCompleted = useCallback(
    (completionRate: number, watchDuration: number) => {
      if (shouldFire(id, "VIDEO_COMPLETED")) {
        trackInteractionMutation({
          variables: {
            contentId: id,
            type: "VIDEO_COMPLETED",
            completionRate,
            watchDuration,
          },
        }).catch(() => {});
      }
    },
    [id, trackInteractionMutation],
  );

  const handleVideoReplayed = useCallback(() => {
    // VIDEO_REPLAYED is always allowed (not in SESSION_ONCE)
    trackInteractionMutation({
      variables: { contentId: id, type: "VIDEO_REPLAYED" },
    }).catch(() => {});
  }, [id, trackInteractionMutation]);

  // ── Cache writer — keeps feed cards + detail in sync ─────────────────────
  function writeSaveToCache(saved: boolean, saveCount: number) {
    client.cache.modify({
      id: client.cache.identify({ __typename: "Content", id }),
      fields: {
        isSavedByMe: () => saved,
        stats: (existing: any) => ({ ...existing, saves: saveCount }),
      },
    });
  }

  function writeLikeToCache(liked: boolean, likeCount: number) {
    client.cache.modify({
      id: client.cache.identify({ __typename: "Content", id }),
      fields: {
        isLikedByMe: () => liked,
        stats: (existing: any) => ({ ...existing, likes: likeCount }),
      },
    });
  }

  // ── Save handler ───────────────────────────────────────────────────────────
  async function handleLike() {
    if (!requireAuth({ contentId: id, action: "like" })) return;

    const wasLiked = resolvedLiked;
    const nextLiked = !wasLiked;
    const nextCount = resolvedLikeCount + (wasLiked ? -1 : 1);
    writeLikeToCache(nextLiked, nextCount);

    try {
      const { data: res } = await toggleLikeMutation({
        variables: { contentId: id },
      });
      if (res?.toggleLike) {
        writeLikeToCache(res.toggleLike.liked, res.toggleLike.likeCount);
      }
    } catch {
      writeLikeToCache(wasLiked, resolvedLikeCount);
    }
  }

  async function handleSave(collectionId?: string) {
    if (!requireAuth({ contentId: id, action: "save" })) return;
    const wasSaved = resolvedSaved;
    const newSaved = !wasSaved;
    const newCount = resolvedSaveCount + (wasSaved ? -1 : 1);
    writeSaveToCache(newSaved, newCount);
    try {
      const { data: res } = await toggleSaveMutation({
        variables: { contentId: id, collectionId: collectionId ?? null },
      });
      if (res?.toggleSave)
        writeSaveToCache(res.toggleSave.saved, res.toggleSave.saveCount);
    } catch {
      writeSaveToCache(wasSaved, resolvedSaveCount);
    }
  }

  async function handleCommentLike(commentId: string) {
    if (!requireAuth({ contentId: id, action: "like" })) return;

    const existingComment =
      optimisticComments.find((comment) => comment.id === commentId) ??
      serverComments.find((comment) => comment.id === commentId);
    if (!existingComment) return;

    const currentLiked =
      commentLikeOverrides[commentId]?.liked ??
      existingComment.isLikedByMe ??
      false;
    const currentLikeCount =
      commentLikeOverrides[commentId]?.likeCount ?? existingComment.likeCount ?? 0;
    const nextLiked = !currentLiked;
    const nextLikeCount = Math.max(0, currentLikeCount + (currentLiked ? -1 : 1));

    setCommentLikeOverrides((prev) => ({
      ...prev,
      [commentId]: { liked: nextLiked, likeCount: nextLikeCount },
    }));

    try {
      const { data: res } = await toggleCommentLikeMutation({
        variables: { commentId },
      });
      const result = res?.toggleCommentLike;
      if (result) {
        setCommentLikeOverrides((prev) => ({
          ...prev,
          [commentId]: {
            liked: result.liked,
            likeCount: result.likeCount,
          },
        }));
      }
    } catch {
      setCommentLikeOverrides((prev) => ({
        ...prev,
        [commentId]: {
          liked: currentLiked,
          likeCount: currentLikeCount,
        },
      }));
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

  async function handleCopyLink() {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/${lang}/content/${id}`
          : "";
      await navigator.clipboard?.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  async function handleReport() {
    await reportMutation({ variables: { contentId: id } });
  }

  async function handleDownload() {
    if (!post || typeof document === "undefined") return;
    const src = downloadSrc(post);
    if (!src) return;

    setIsDownloading(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = post.title || "shopi-post";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement("a");
      a.href = src;
      a.download = post.title || "shopi-post";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setIsDownloading(false);
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
      author: currentUser
        ? {
            id: currentUser.id,
            profile: {
              firstName: currentUser.profile?.firstName ?? null,
              lastName: currentUser.profile?.lastName ?? null,
              avatar: currentUser.profile?.avatar ?? null,
            },
          }
        : null,
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
  // Creator includes follow state when the detail query resolves.
  const postCreatorForFollow = data?.content?.creator;
  const {
    following,
    toggle: handleFollow,
  } = useFollow({
    userId: postCreatorForFollow?.id ?? data?.content?.creatorId ?? "",
    initialFollowing: postCreatorForFollow?.isFollowedByMe ?? false,
    initialFollowerCount: postCreatorForFollow?.followerCount ?? 0,
    lang,
  });

  // ── Loading state — full-screen TikTok skeleton ───────────────────────────
  if (loading) {
    return (
      <>
        <div
          className={[
            "hidden md:flex overflow-hidden bg-app",
            isSheet ? "h-full" : "h-screen",
          ].join(" ")}
        >
          <div className="flex-1 bg-surface p-8">
            <Skeleton className="h-full w-full rounded-2xl bg-default/8" />
          </div>
          <div
            className="flex shrink-0 flex-col border-l border-default bg-app"
            style={{ width: isSheet ? 420 : 380 }}
          >
            <div className="flex h-12 items-center gap-2 border-b border-default px-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3.5 w-40 rounded-full" />
            </div>
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32 rounded-full" />
                  <Skeleton className="h-3 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-7 w-36 rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-4/5 rounded-full" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-app md:hidden">
          <div
            className="sticky top-0 z-10 flex items-center gap-2 border-b border-default bg-app px-3 pb-2.5"
            style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 10px)" }}
          >
            <Skeleton className="h-10 w-10 rounded-full bg-default/8" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-36 rounded-full bg-default/8" />
              <Skeleton className="h-3 w-24 rounded-full bg-default/8" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full bg-default/8" />
          </div>

          <div className="h-[56svh] min-h-[340px] max-h-[620px] bg-surface p-4">
            <Skeleton className="h-full w-full rounded-3xl bg-default/8" />
          </div>

          <div className="space-y-4 px-4 py-4 pb-28">
            <div className="space-y-3">
              <Skeleton className="h-8 w-32 rounded-full bg-default/8" />
              <Skeleton className="h-6 w-4/5 rounded-full bg-default/8" />
              <Skeleton className="h-4 w-full rounded-full bg-default/8" />
              <Skeleton className="h-4 w-3/4 rounded-full bg-default/8" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-16 rounded-xl border border-default bg-default/8"
                />
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-default px-3 py-3">
              <Skeleton className="h-10 w-10 rounded-full bg-default/8" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-28 rounded-full bg-default/8" />
                <Skeleton className="h-3 w-20 rounded-full bg-default/8" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full bg-default/8" />
            </div>

            <div className="space-y-3 rounded-2xl border border-default px-4 py-4">
              <Skeleton className="h-3 w-16 rounded-full bg-default/8" />
              <Skeleton className="h-12 w-full rounded-xl bg-default/8" />
              <Skeleton className="h-12 w-full rounded-xl bg-default/8" />
            </div>
          </div>

          <div
            className="fixed inset-x-0 bottom-0 border-t border-default bg-app px-3 pt-2.5"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
            }}
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-11 w-11 rounded-full bg-default/8" />
              <Skeleton className="h-11 w-11 rounded-full bg-default/8" />
              <Skeleton className="h-11 w-11 rounded-full bg-default/8" />
              <Skeleton className="h-11 flex-1 rounded-full bg-default/8" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">😕</div>
        <p className="text-default font-semibold">Post not found</p>
        <button onClick={goBack} className="text-primary text-sm font-semibold">
          Go back
        </button>
      </div>
    );
  }

  const caption = post.caption ?? "";
  const isLongCaption = caption.length > 180;
  const displayCaption =
    isLongCaption && !captionExpanded ? caption.slice(0, 180) + "…" : caption;
  // Use the creator returned with the post; it includes follow state.
  const postCreator = data?.content?.creator;
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
        <p className="text-xs text-muted-foreground mt-0.5">
          {timeAgo(post.createdAt)}
        </p>
      </div>
      {!isOwnPost && (
        <button
          onClick={handleFollow}
          className={[
            "text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all",
            following
              ? "border-border text-muted-foreground bg-surface"
              : "border-primary text-primary hover:bg-primary/5",
          ].join(" ")}
        >
          {following ? "Following" : "+ Follow"}
        </button>
      )}

      {/* More options — matches PostCard's 3-dot menu beside Follow */}
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-8 h-8 lg:cursor-pointer flex items-center justify-center rounded-full hover:bg-surface text-muted-foreground transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={2.6} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          container={isSheet ? rootEl : undefined}
          className="w-52 p-1.5 rounded-2xl border border-border bg-elevated shadow-lg z-[80]"
        >
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              void handleCopyLink();
            }}
            className="flex lg:cursor-pointer w-full text-sm items-center gap-3 px-4 py-3 rounded-xl font-semibold text-default hover:bg-surface transition-colors"
          >
            <Link2
              className="w-4 h-4 shrink-0 text-muted-foreground"
              strokeWidth={2.2}
            />
            Copy link
          </button>

          {post.allowDownload && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex lg:cursor-pointer w-full text-sm items-center gap-3 px-4 py-3 rounded-xl font-semibold text-default hover:bg-surface transition-colors disabled:opacity-60"
            >
              <Download className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              {isDownloading ? "Downloading…" : "Download"}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              handleShare();
            }}
            className="flex lg:cursor-pointer w-full text-sm items-center gap-3 px-4 py-3 rounded-xl font-semibold text-default hover:bg-surface transition-colors"
          >
            <Share2
              className="w-4 h-4 shrink-0 text-muted-foreground"
              strokeWidth={2.2}
            />
            Share content
          </button>

          <button
            type="button"
            onClick={() => {
              if (!requireAuth({ contentId: id })) return;
              setMenuOpen(false);
              void handleReport().then(() => toast.success("Report submitted"));
            }}
            className="flex lg:cursor-pointer w-full text-sm items-center gap-3 px-4 py-3 rounded-xl font-semibold text-default hover:bg-surface transition-colors"
          >
            <Flag
              className="w-4 h-4 shrink-0 text-muted-foreground"
              strokeWidth={2.2}
            />
            Report listing
          </button>
        </PopoverContent>
      </Popover>
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
            <span
              key={tag}
              className="text-muted-foreground text-xs font-medium"
            >
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

  const categoryPath = [
    post.aiClassification?.level1,
    post.aiClassification?.level2,
    post.aiClassification?.level3,
  ]
    .filter(Boolean)
    .join(" / ");
  const specs = (post.specs ?? []).filter((spec) => spec.key && spec.value);
  const fullLocation = [
    post.location?.placeName,
    post.location?.subregion,
    post.location?.county,
    post.location?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const DetailMeta = (categoryPath ||
    post.categoryId ||
    fullLocation ||
    specs.length > 0) && (
    <div className="border-b border-default px-4 py-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-normal text-muted-foreground">
        Details
      </h2>
      <div className="grid gap-3 text-sm">
        {(categoryPath || post.categoryId) && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              Category
            </p>
            <p className="mt-0.5 text-default">
              {categoryPath || post.categoryId}
            </p>
          </div>
        )}
        {fullLocation && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              Location
            </p>
            <p className="mt-0.5 text-default">{fullLocation}</p>
          </div>
        )}
        {specs.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Specs</p>
            <dl className="mt-2 grid grid-cols-2 gap-2">
              {specs.slice(0, 8).map((spec) => (
                <div
                  key={`${spec.key}-${spec.value}`}
                  className="rounded-lg border border-default bg-surface px-3 py-2"
                >
                  <dt className="truncate text-[11px] font-semibold text-muted-foreground">
                    {spec.key}
                  </dt>
                  <dd className="mt-0.5 truncate text-xs font-semibold text-default">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop inline action row
  const DesktopActions = (
    <div className="hidden md:flex items-center gap-2 px-4 py-3 border-b border-default">
      <button
        onClick={handleLike}
        className="flex lg:cursor-pointer items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all active:scale-95"
        style={{
          borderColor: resolvedLiked
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-border))",
          color: resolvedLiked
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-text-default))",
          backgroundColor: resolvedLiked
            ? "rgb(var(--brand-primary) / 0.08)"
            : "transparent",
        }}
      >
        <Heart
          className="w-4 h-4"
          fill={resolvedLiked ? "rgb(var(--brand-primary))" : "none"}
          strokeWidth={1.8}
        />
        <span>{resolvedLikeCount > 0 ? fmt(resolvedLikeCount) : "Like"}</span>
      </button>

      {/* Save pill — outlined, active = filled primary (matches PostCard) */}
      <button
        onClick={() => handleSave()}
        className="flex lg:cursor-pointer items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all active:scale-95"
        style={{
          borderColor: resolvedSaved
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-border))",
          color: resolvedSaved
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-text-default))",
          backgroundColor: resolvedSaved
            ? "rgb(var(--brand-primary) / 0.08)"
            : "transparent",
        }}
      >
        <Bookmark
          className="w-4 h-4"
          fill={resolvedSaved ? "rgb(var(--brand-primary))" : "none"}
          strokeWidth={1.8}
        />
        <span>{resolvedSaveCount > 0 ? fmt(resolvedSaveCount) : "Save"}</span>
      </button>

      {/* Comment pill — scrolls to the comments section below */}
      <button
        onClick={() =>
          commentsRef.current?.scrollIntoView({ behavior: "smooth" })
        }
        className="flex lg:cursor-pointer items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-xs font-semibold text-default transition-all active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
        {resolvedCommentCount > 0 ? (
          <span>{fmt(resolvedCommentCount)}</span>
        ) : (
          <span>Comment</span>
        )}
      </button>

      {/* Message — primary, takes remaining width (matches PostCard).
          In the desktop sheet this opens an in-place chat column instead of
          navigating away; on mobile/page it routes to the full chat screen. */}
      {!isOwnPost && (
        <button
          onClick={() => {
            if (isSheet) {
              openChat();
              return;
            }
            if (!requireAuth({ contentId: id })) return;
            router.push(`/${lang}/notifications/${id}?source=content`);
          }}
          className="flex-1 lg:cursor-pointer flex items-center justify-center gap-1.5 px-8 py-2.5 rounded-full bg-primary/90 text-xs font-semibold text-[#f1f1f1] transition-all active:scale-95"
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Message
        </button>
      )}
    </div>
  );

  const renderCommentsSection = (attachRef = true) => (
    <div ref={attachRef ? commentsRef : undefined} className="px-4 pt-4">
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
      <div className="divide-y divide-border/70">
        {allComments.map((comment) => {
          const override = commentLikeOverrides[comment.id];
          const resolvedComment = override
            ? {
                ...comment,
                isLikedByMe: override.liked,
                likeCount: override.likeCount,
              }
            : comment;
          return (
            <CommentRow
              key={comment.id}
              comment={resolvedComment}
              currentUserId={currentUser?.id}
              onToggleLike={handleCommentLike}
            />
          );
        })}
      </div>
      <div ref={attachRef ? commentSentinelRef : undefined} className="h-1" />
      <div className="h-6" />
    </div>
  );

  const CommentInput = (
    <div
      className="flex items-center gap-2.5 px-3 pt-2.5 pb-3"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${avatarColors(currentUser?.id ?? "00")}`}
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
    <div
      ref={setRootEl}
      className={[
        "flex flex-col bg-app",
        isSheet ? "h-full min-h-0" : "min-h-svh",
      ].join(" ")}
    >
      {/* ════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (md+)
          Left col: media (sticky)   Right col: info + comments
          Inspired by Facebook/Instagram post detail
      ════════════════════════════════════════════════════════ */}
      {isDesktop === true && (
        <div
          className={[
            "flex overflow-hidden",
            isSheet ? "h-full min-h-0" : "h-screen",
          ].join(" ")}
        >
          {/* ── Left: media ────────────────────────────────────────────────────── */}
          <div
            className="flex-1 bg-black flex items-center justify-center overflow-hidden"
            style={{ minWidth: 0 }}
          >
            {isVideo && hlsUrl ? (
              <ContentVideo
                hlsUrl={hlsUrl}
                thumbnailUrl={videoThumbnail}
                muted={muted}
                setMuted={setVideoMuted}
                showMuteButton
                onVideoCompleted={handleVideoCompleted}
                onVideoReplayed={handleVideoReplayed}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {media[imgIdx] && (
                  <Image
                    src={
                      media[imgIdx].r2Variants?.find(
                        (v) => v.variant === "large",
                      )?.url ??
                      media[imgIdx].r2Variants?.[0]?.url ??
                      media[imgIdx].imageUrl ??
                      media[imgIdx].thumbnailUrl ??
                      ""
                    }
                    alt={post.title}
                    fill
                    sizes={isSheet ? "58vw" : "65vw"}
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
            style={{ width: isSheet ? 420 : 380, flexShrink: 0 }}
          >
            {/* Header row */}
            <div className="flex items-center gap-2 h-12 border-b border-default shrink-0 px-2">
              <button
                onClick={goBack}
                aria-label={isSheet ? "Close post" : "Go back"}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
              >
                {isSheet ? (
                  <X className="h-5 w-5 text-default" strokeWidth={2.2} />
                ) : (
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
                )}
              </button>
              <span className="font-semibold text-default text-sm truncate flex-1">
                {post.title}
              </span>
            </div>

            {/* Scrollable middle: creator + info + actions + comments */}
            <div className="flex-1 overflow-y-auto">
              {CreatorRow}
              {PostInfo}
              {DetailMeta}
              {DesktopActions}
              {renderCommentsSection()}
            </div>

            {/* Sticky comment input at bottom of right panel */}
            <div
              className="shrink-0 border-t border-default"
              style={{ backgroundColor: "rgb(var(--color-bg-elevated))" }}
            >
              {CommentInput}
            </div>
          </div>

          {/* ── Chat column (sheet only) — in-place messaging, no navigation.
              Rendered unconditionally so InlineChatPanel can animate its exit;
              contentId=null keeps it collapsed. ─── */}
          {isSheet && (
            <InlineChatPanel
              lang={lang}
              contentId={chatOpen ? id : null}
              onClose={closeChat}
              className="flex flex-col border-l border-default bg-app overflow-hidden h-full w-[400px] shrink-0"
            />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MOBILE LAYOUT  (< md) — full PDP in the intercepted route
      ════════════════════════════════════════════════════════ */}
      {isDesktop === false && (
        <div className="fixed inset-0 z-70 overflow-y-auto overscroll-contain bg-app">
          <header
            className="sticky top-0 z-40 flex items-center gap-2 bg-app/95 px-3 pb-2.5 backdrop-blur-md"
            style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 10px)" }}
          >
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-default transition-colors active:bg-surface"
            >
              <svg
                className="h-5 w-5"
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
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-default">
                {post.title}
              </p>
              {/* {creatorName ? (
                <p className="truncate text-xs text-muted-foreground">
                  {creatorName}
                </p>
              ) : null} */}
            </div>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share post"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-default transition-colors active:bg-surface"
            >
              <Share2 className="h-5 w-5" strokeWidth={2} />
            </button>
          </header>

          <section className="relative h-[56svh] min-h-85 max-h-155 bg-black">
            {isVideo && hlsUrl ? (
              <ContentVideo
                hlsUrl={hlsUrl}
                thumbnailUrl={videoThumbnail}
                muted={muted}
                setMuted={setVideoMuted}
                fill
                showSpinner
                onVideoCompleted={handleVideoCompleted}
                onVideoReplayed={handleVideoReplayed}
              />
            ) : (
              <MobileImageCarousel
                media={media}
                title={post.title}
                idx={imgIdx}
                onIdx={setImgIdx}
              />
            )}

            {isVideo && (
              <button
                type="button"
                onClick={() => setVideoMuted(!muted)}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm"
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

            {!isVideo && media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2.5 py-2 backdrop-blur-sm">
                {media.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImgIdx(i)}
                    aria-label={`Show media ${i + 1}`}
                    className={[
                      "rounded-full transition-all",
                      i === imgIdx
                        ? "h-1.5 w-4 bg-white"
                        : "h-1.5 w-1.5 bg-white/50",
                    ].join(" ")}
                  />
                ))}
              </div>
            )}
          </section>

          <main className="pb-32">
            <section className="border-b border-default px-4 py-4">
              {post.price && (
                <div className="mb-2">
                  <span
                    className="text-2xl font-extrabold tracking-normal"
                    style={{ color: "rgb(var(--brand-primary))" }}
                  >
                    {post.price.amount === 0
                      ? "Free"
                      : `${post.price.currency} ${post.price.amount.toLocaleString()}`}
                  </span>
                  {post.price.negotiable && (
                    <span className="ml-2 text-sm font-semibold text-muted-foreground">
                      Negotiable
                    </span>
                  )}
                </div>
              )}

              <h1 className="text-xl font-bold leading-snug text-default">
                {post.title}
              </h1>

              {fullLocation && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {fullLocation && (
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {fullLocation}
                    </span>
                  )}
                </div>
              )}

              {caption && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {displayCaption}
                  {isLongCaption && (
                    <button
                      type="button"
                      onClick={() => setCaptionExpanded((v) => !v)}
                      className="ml-1 font-semibold text-primary"
                    >
                      {captionExpanded ? "less" : "more"}
                    </button>
                  )}
                </p>
              )}

              {post.hashtags && post.hashtags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 divide-x divide-default rounded-lg border border-default bg-surface">
                <div className="px-2 py-3 text-center">
                  <p className="text-sm font-bold text-default">
                    {fmt(post.stats.views)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                    Views
                  </p>
                </div>
                <div className="px-2 py-3 text-center">
                  <p className="text-sm font-bold text-default">
                    {fmt(resolvedLikeCount)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                    Likes
                  </p>
                </div>
                <div className="px-2 py-3 text-center">
                  <p className="text-sm font-bold text-default">
                    {fmt(resolvedCommentCount)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
                    Comments
                  </p>
                </div>
              </div>
            </section>

            <section className="border-b border-default">{CreatorRow}</section>
            {DetailMeta}
            {renderCommentsSection()}
          </main>

          <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-app/95 px-3 pt-2.5 backdrop-blur-md"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
            }}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave()}
                aria-label={resolvedSaved ? "Unsave post" : "Save post"}
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
                  resolvedSaved
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-default text-default",
                ].join(" ")}
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={resolvedSaved ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                onClick={handleLike}
                aria-label={resolvedLiked ? "Unlike post" : "Like post"}
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors",
                  resolvedLiked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-default text-default",
                ].join(" ")}
              >
                <Heart
                  className="h-5 w-5"
                  fill={resolvedLiked ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                onClick={() => setShowCommentDrawer(true)}
                aria-label="Open comments"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-default text-default transition-colors active:bg-surface"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={2} />
              </button>
              {!isOwnPost ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth({ contentId: id })) return;
                    router.push(`/${lang}/notifications/${id}?source=content`);
                  }}
                  className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" strokeWidth={2.2} />
                  Message seller
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
                >
                  <Share2 className="h-4 w-4" strokeWidth={2.2} />
                  Share
                </button>
              )}
            </div>
          </div>

          {/* ── Comments sheet (custom, keyboard-aware) ────────────────────── */}
          <CommentsSheet
            open={showCommentDrawer}
            onClose={() => setShowCommentDrawer(false)}
            keyboardInset={keyboardInset}
            title={
              resolvedCommentCount > 0
                ? `${fmt(resolvedCommentCount)} Comments`
                : "Comments"
            }
            input={CommentInput}
          >
            {renderCommentsSection(false)}
          </CommentsSheet>
        </div>
      )}
    </div>
  );
}

// ─── CommentsSheet — fixed bottom sheet whose input rises with the keyboard ──────

function CommentsSheet({
  open,
  onClose,
  keyboardInset,
  title,
  input,
  children,
}: {
  open: boolean;
  onClose: () => void;
  keyboardInset: number;
  title: string;
  input: React.ReactNode;
  children: React.ReactNode;
}) {
  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close comments"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sheet — its bottom rides above the keyboard so the input is always
          visible and the comment list shrinks instead of being covered. */}
      <div
        className={`absolute inset-x-0 flex max-h-[82svh] flex-col rounded-t-3xl bg-app shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          bottom: keyboardInset,
          transition: "transform 0.3s ease-out, bottom 0.15s ease-out",
        }}
      >
        {/* Grabber + header */}
        <div className="shrink-0 border-b border-default">
          <div className="flex justify-center pt-3 pb-1.5">
            <div className="h-1.5 w-11 rounded-full bg-muted-foreground/35" />
          </div>
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <h2 className="text-sm font-bold text-default">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable comments — leaves room so the last rows clear the input */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
          {children}
        </div>

        {/* Pinned input — always sits just above the sheet bottom (which itself
            rides above the keyboard), so nothing shifts and there's no gap. */}
        <div
          className="shrink-0 border-t border-default"
          style={{
            backgroundColor: "rgb(var(--color-bg-elevated))",
            paddingBottom:
              keyboardInset > 0 ? 0 : "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {input}
        </div>
      </div>
    </div>
  );
}
