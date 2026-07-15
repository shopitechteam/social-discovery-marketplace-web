"use client";

import {
  memo,
  useRef,
  useEffect,
  useState,
  useCallback,
  useId,
  useMemo,
} from "react";
import {
  Download,
  MapPin,
  Bookmark,
  Link2,
  Flag,
  Share2,
  MoreHorizontal,
  Maximize2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChatShellSkeleton } from "@/features/messaging/components/ChatShellSkeleton";
import Shimmer, {
  SHIMMER,
  SHIMMER_AVATAR,
  SHIMMER_PORTRAIT,
} from "@/lib/shimmer";
import { registerVideo, updateRatio } from "@/lib/activeVideo";
import { useHlsVideo } from "@/lib/useHlsVideo";
import { useFeedPreferencesStore } from "@/stores/feedPreferences";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";
import { VideoProgressBar } from "./VideoProgressBar";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { shouldFire, hasFired } from "@/lib/interactionDedup";
import { useFeedChat } from "./FeedChatContext";
import { fmtCompact as fmt } from "@/lib/format";
import { avatarGradient, idInitials as initials } from "@/lib/avatar";
import { useInteractions } from "../hooks/useInteractions";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useFollow } from "../hooks/useFollow";
import { BufferSpinner } from "./BufferSpinner";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { usePageFocused } from "../hooks/usePageFocused";
import toBase64, { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/time";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const CommentsDrawer = dynamic(() =>
  import("./CommentsDrawer").then((mod) => mod.CommentsDrawer),
);
const MediaCarouselDialog = dynamic(() =>
  import("./MediaCarouselDialog").then((mod) => mod.MediaCarouselDialog),
);
const TikTokEmbedMedia = dynamic(() =>
  import("./TikTokEmbedMedia").then((mod) => mod.TikTokEmbedMedia),
);

interface Props {
  post: ContentCardFieldsFragment;
  lang: string;
  priority?: boolean;
  /**
   * Desktop feed: open the chat inline in the right rail instead of navigating
   * to the full-screen chat screen. When omitted (mobile / elsewhere) the
   * Message button keeps its default navigation behaviour. The card element is
   * passed so the host can auto-close the chat when the post scrolls away.
   */
  onMessage?: (contentId: string, anchor: HTMLElement | null) => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────
// fmt, initials, and the avatar gradient palette are shared from @/lib
// (imported above) so they don't drift across the feed components.

/**
 * Strip Google plus-codes (Open Location Codes) like "PVR+ER" or
 * "X3W4+H9G" out of a place string — they're machine codes, not human place
 * names, and can appear standalone OR prefixed to a real name (e.g.
 * "X3W4+H9G Baraka Shopping Center" → "Baraka Shopping Center"). Returns the
 * cleaned, trimmed remainder (empty string if the whole value was a code).
 */
function stripPlusCode(value: string): string {
  return value
    .replace(/\b[0-9A-Z]{2,}\+[0-9A-Z]+\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Broad → specific location trail for a card, e.g. "Nyandarua › Nyahururu ›
 * Sudav Apartments": county, then the town (first segment of formattedAddress,
 * dropping the trailing country), then the place name. Blanks, duplicates, and
 * embedded plus-codes (e.g. "X3W4+H9G Baraka …") are removed so we never repeat,
 * show empty separators, or surface a machine code.
 */
function locationTrail(loc: {
  county?: string | null;
  placeName?: string | null;
  formattedAddress?: string | null;
}): string | null {
  // "Nyahururu, Kenya" → "Nyahururu" (first part, minus the country tail).
  const town = loc.formattedAddress?.split(",")[0]?.trim() || null;
  const seen = new Set<string>();
  const parts = [loc.county, town, loc.placeName]
    .map((p) => stripPlusCode(p?.trim() || ""))
    .filter((p) => {
      const key = p.toLowerCase();
      if (!p || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return parts.length ? parts.join(" › ") : null;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  creatorId: string;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isVerified?: boolean | null;
}

/** Blue verified check — same mark shown on the creator's profile page. */
function VerifiedBadge() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-[rgb(var(--color-bg-elevated))]"
      aria-label="Verified"
    >
      <circle cx="10" cy="10" r="10" fill="#1D9BF0" />
      <path
        d="M6 10.5l2.5 2.5 5.5-5.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Avatar({
  creatorId,
  avatarUrl,
  firstName,
  lastName,
  isVerified,
}: AvatarProps) {
  const color = avatarGradient(creatorId);
  const label = firstName
    ? `${firstName[0]}${lastName?.[0] ?? ""}`.toUpperCase()
    : initials(creatorId);

  if (avatarUrl) {
    return (
      <div className="w-10 h-10 rounded-full relative shrink-0 bg-surface">
        <div className="w-full h-full rounded-full overflow-hidden">
          <Image
            src={avatarUrl}
            alt={label}
            className="w-full h-full overflow-hidden rounded-full object-cover"
            fill
            sizes="40px"
            placeholder="blur"
            blurDataURL={SHIMMER_AVATAR}
          />
        </div>
        {isVerified ? <VerifiedBadge /> : null}
      </div>
    );
  }

  return (
    <div
      className={`w-10 h-10 rounded-full relative bg-linear-to-br ${color} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white text-xs font-bold">{label}</span>
      {isVerified ? <VerifiedBadge /> : null}
    </div>
  );
}

// ── Video media block ─────────────────────────────────────────────────────────

function VideoMedia({
  post,
  priority,
  fullscreenOpen,
  resumeTime,
  onFullscreen,
}: {
  post: ContentCardFieldsFragment;
  priority?: boolean;
  fullscreenOpen: boolean;
  resumeTime: number;
  onFullscreen: (time: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const muted = useFeedPreferencesStore((s) => s.videoMuted);
  const setVideoMuted = useFeedPreferencesStore((s) => s.setVideoMuted);
  const onThumbLoad = useCallback(() => setThumbLoaded(true), []);
  const pageFocused = usePageFocused();
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

  const durationFmt = mux?.duration
    ? mux.duration >= 60
      ? `${Math.floor(mux.duration / 60)}:${String(Math.round(mux.duration % 60)).padStart(2, "0")}`
      : `0:${String(Math.round(mux.duration)).padStart(2, "0")}`
    : null;

  const [ended, setEnded] = useState(false);
  // Manual play/pause: tapping the video toggles this. It overrides autoplay
  // until the video scrolls away (reset in the inactive effect below).
  const [userPaused, setUserPaused] = useState(false);

  // hls.js — fast ABR + buffering state
  // Pause when the video ended OR the user tapped to pause, so useHlsVideo
  // doesn't resume on its own.
  const shouldPlay = active && pageFocused && !fullscreenOpen;
  // When the browser blocks unmuted autoplay, useHlsVideo forces the element
  // muted to keep it playing. Reconcile the store so the speaker icon reflects
  // the video's REAL muted state — otherwise it shows "unmuted" over a silent
  // video and the user has to tap twice to actually get sound.
  const onMutedChange = useCallback(
    (forcedMuted: boolean) => setVideoMuted(forcedMuted),
    [setVideoMuted],
  );
  // Only the PRIORITY (first / LCP) card waits for its poster before starting
  // playback work — there the poster is the LCP candidate and we don't want the
  // video manifest/hls.js competing with that critical image. Every other card
  // is scrolled to (its poster isn't the LCP), so gating it just adds latency to
  // first frame; those start HLS immediately, in parallel with the poster.
  const posterReady = !priority || !thumbnail || thumbLoaded;
  const { videoRef, buffering, playing } = useHlsVideo(
    hlsUrl,
    active && posterReady,
    ended || userPaused || !pageFocused || fullscreenOpen,
    onMutedChange,
  );

  // Single, authoritative mute toggle. Apply directly to the element AND the
  // store so one tap always takes effect — never relying on a store→effect round
  // trip that could lag a frame behind reality.
  const toggleMuted = useCallback(() => {
    const next = !muted;
    const video = videoRef.current;
    if (video) {
      video.muted = next;
      // Unmuting needs the click's user activation to actually produce sound;
      // re-issue play so an autoplay-muted video starts emitting audio now.
      if (!next) video.play().catch(() => {});
    }
    setVideoMuted(next);
  }, [muted, videoRef, setVideoMuted]);

  // Tap to play/pause. Base the decision on the video's ACTUAL state, not a
  // blind boolean toggle — otherwise, when the video is already not playing
  // (autoplay blocked, buffering, just entered view), the first tap would only
  // flip the flag and a second tap would be needed to actually start it.
  const toggleUserPaused = useCallback(() => {
    const video = videoRef.current;
    // If it finished, let the dedicated replay control handle it.
    if (ended) return;
    const isPaused = video ? video.paused : userPaused;
    if (isPaused) {
      setUserPaused(false);
      video?.play().catch(() => {});
    } else {
      setUserPaused(true);
      video?.pause();
    }
  }, [videoRef, ended, userPaused]);

  const [trackInteractionMutation] = useMutation(gql`
    mutation TrackInteractionFeed(
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
  const endedCountRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () => {
      const duration = video.duration || 0;
      const watched = video.currentTime || duration;
      const completionRate = duration > 0 ? Math.min(watched / duration, 1) : 1;
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        // Metadata not yet loaded — completionRate falls back to 1 and won't
        // reflect real watch ratio. Surface it so it's catchable in dev.
        console.warn(
          `[PostCard] video 'ended' fired without a valid duration for content ${post.id} ` +
            `(duration=${video.duration}); completionRate defaulted to ${completionRate}.`,
        );
      }
      endedCountRef.current += 1;
      const type =
        endedCountRef.current === 1 ? "VIDEO_COMPLETED" : "VIDEO_REPLAYED";
      if (shouldFire(post.id, type)) {
        trackInteractionMutation({
          variables: {
            contentId: post.id,
            type,
            completionRate,
            watchDuration: watched,
          },
        }).catch(() => {});
      }
      setEnded(true);
    };
    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [videoRef, post.id, trackInteractionMutation]);

  // Keep the element's muted property in sync with the global preference. The
  // `muted` JSX prop alone is unreliable (React doesn't always push it to the DOM
  // after mount), and useHlsVideo may toggle muted imperatively when recovering
  // from a blocked unmuted autoplay — this effect makes the store authoritative.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || fullscreenOpen || resumeTime <= 0) return;
    video.currentTime = resumeTime;
  }, [fullscreenOpen, resumeTime, videoRef]);

  // Reset ended state and check for skip when video scrolls away
  useEffect(() => {
    if (!active) {
      // Defer resetting ended to avoid synchronous setState inside the effect
      const t = setTimeout(() => {
        setEnded(false);
        // Clear any manual pause so the video autoplays again when re-entered
        setUserPaused(false);
      }, 0);
      const video = videoRef.current;
      if (!video) {
        clearTimeout(t);
        return;
      }
      const duration = video.duration || 0;
      const watched = video.currentTime || 0;
      // Skip = watched at least 1s but less than 50% of video length,
      // and the video was never completed this session (completed > skipped)
      if (
        duration > 0 &&
        watched >= 1 &&
        watched < duration * 0.5 &&
        !hasFired(post.id, "VIDEO_COMPLETED") &&
        shouldFire(post.id, "SKIPPED")
      ) {
        trackInteractionMutation({
          variables: {
            contentId: post.id,
            type: "SKIPPED",
            watchDuration: watched,
            completionRate: watched / duration,
          },
        }).catch(() => {});
      }
      return () => clearTimeout(t);
    }
  }, [active, videoRef, post.id, trackInteractionMutation]);

  function handleReplay() {
    const video = videoRef.current;
    if (!video) return;
    endedCountRef.current += 1;
    setEnded(false);
    video.currentTime = 0;
    video.play().catch(() => {});
    // VIDEO_REPLAYED is always allowed through (not in SESSION_ONCE)
    trackInteractionMutation({
      variables: { contentId: post.id, type: "VIDEO_REPLAYED" },
    }).catch(() => {});
  }

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

    // Force an initial election after (re)mount. On a route return the tree can
    // be kept alive and the observer won't re-fire on its own (nothing scrolls),
    // so the in-view video would never be elected active → tap-to-play dead.
    // Re-measure on next frame and whenever the page is shown again.
    const remeasure = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      const ratio = r.height > 0 ? visible / r.height : 0;
      updateRatio(id, ratio);
    };
    const raf = requestAnimationFrame(remeasure);
    window.addEventListener("pageshow", remeasure);
    document.addEventListener("visibilitychange", remeasure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pageshow", remeasure);
      document.removeEventListener("visibilitychange", remeasure);
      obs.disconnect();
      unregister();
    };
  }, [id]);

  return (
    <div
      ref={containerRef}
      onClick={toggleUserPaused}
      className="relative w-full bg-black overflow-hidden"
      style={{
        // Portrait videos get a taller budget (70svh) so they aren't squeezed;
        // landscape keep their natural 16:9 box. `object-contain` below then
        // shows the WHOLE frame letterboxed rather than cropping it.
        // NB: use svh (small viewport height), NOT dvh. dvh changes as iOS
        // Safari's toolbar collapses/expands during scroll, which resizes every
        // media box mid-scroll and makes the feed jump. svh is fixed.
        height: `min(${isLandscape ? "56.25vw" : "177.78vw"}, ${
          isLandscape ? "53svh" : "70svh"
        })`,
      }}
    >
      {/* Thumbnail — fades out once video is playing */}
      {thumbnail && (
        <FeedImage
          src={thumbnail}
          alt={post.title}
          sizes="100vw"
          className={`object-contain transition-opacity duration-500 ${
            hlsUrl && shouldPlay && playing && !buffering
              ? "opacity-0"
              : priority || thumbLoaded
                ? "opacity-100"
                : "opacity-0"
          }`}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          blurDataURL={SHIMMER_PORTRAIT}
          onLoad={onThumbLoad}
        />
      )}
      {/* HLS video — src managed by useHlsVideo hook, no loop so ended fires */}
      {hlsUrl && (
        <video
          ref={videoRef}
          muted={muted}
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}
      {/* Replay button — shown when video finishes */}
      {ended && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleReplay();
          }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40"
          aria-label="Replay video"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
            </svg>
          </span>
        </button>
      )}
      {/* Paused indicator — shown when the user tapped to pause (not ended).
          Pointer-events-none so the tap falls through to the container toggle. */}
      {active && userPaused && !ended && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <svg
              className="h-7 w-7 translate-x-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      )}
      {/* TikTok-style buffer spinner */}
      {active && buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <BufferSpinner />
        </div>
      )}
      {/* Duration badge */}
      {durationFmt && (
        <div className="absolute bottom-5 right-2 bg-black/70 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-md">
          {durationFmt}
        </div>
      )}
      {hlsUrl && (
        <VideoProgressBar
          videoRef={videoRef}
          active={shouldPlay}
          className="opacity-90"
        />
      )}
      {hlsUrl && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFullscreen(videoRef.current?.currentTime ?? 0);
          }}
          aria-label="Open video fullscreen"
          className="absolute left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm transition-transform active:scale-95"
        >
          <Maximize2 className="h-4.5 w-4.5" strokeWidth={2.2} />
        </button>
      )}
      {/* Mute / unmute button — absolute, stops propagation so it doesn't navigate */}
      {active && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMuted();
          }}
          className="absolute bottom-5 left-2 z-50 bg-black/60 backdrop-blur-sm rounded-full p-1.5 text-white/90 active:scale-95 transition-transform"
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
  const [loaded, setLoaded] = useState(false);
  const retried = useRef(false);

  function handleLoad() {
    setLoaded(true);
    onLoad?.();
  }

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
        <svg
          className="w-10 h-10 text-muted-foreground/20"
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
    <Image
      src={retrySrc}
      alt={alt}
      fill
      sizes={sizes}
      className={cn("w-full mx-0 px-0", className)}
      preload={priority}
      loading={priority ? undefined : loadingProp}
      quality={priority ? 75 : 55}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      onLoad={handleLoad}
      onError={handleError}
      // Fade the decoded bitmap in over the blur placeholder. Inline transition
      // so the global `transition: none` on <img> doesn't suppress it.
      style={{
        opacity: priority || loaded ? 1 : 0,
        transition: priority ? undefined : "opacity 0.3s ease",
      }}
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

type MediaEntry = NonNullable<ContentCardFieldsFragment["media"]>[number];

/**
 * Best-effort intrinsic aspect ratio (width / height) for an image media item.
 * Falls back to the largest r2 variant's dimensions, then to a sensible 4:5
 * portrait default when nothing is known — so the layout reserves space and
 * never collapses to zero height while the bitmap loads.
 */
function aspectRatioOf(item: MediaEntry | undefined): number {
  const w = item?.displayWidth ?? item?.r2Variants?.[0]?.width ?? 0;
  const h = item?.displayHeight ?? item?.r2Variants?.[0]?.height ?? 0;
  if (w > 0 && h > 0) return w / h;
  return 4 / 5; // unknown → portrait-ish placeholder
}

function downloadSrc(post: ContentCardFieldsFragment): string | null {
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

// ── Image media block ─────────────────────────────────────────────────────────

function ImageMedia({
  post,
  priority,
  onNavigate,
}: {
  post: ContentCardFieldsFragment;
  priority?: boolean;
  /** Tap handler for the media. When omitted, tapping does nothing. */
  onNavigate?: () => void;
}) {
  const media = useMemo(
    () =>
      [...(post.media ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      ),
    [post.media],
  );

  const nav = (e: React.MouseEvent) => {
    if (!onNavigate) return;
    e.stopPropagation();
    onNavigate();
  };

  // svh (not dvh): dvh changes as iOS Safari's toolbar shows/hides during
  // scroll, resizing every media box mid-scroll and making the feed jump.
  const GRID_H = "clamp(40svh, 72vw, 60svh)";
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
    // Reserve the box from the known intrinsic ratio so the height is correct
    // on first paint — no blank gap, no jump when the bitmap loads. The ratio
    // is clamped so very wide images keep a usable minimum height and very tall
    // ones don't exceed the viewport budget.
    const ratio = aspectRatioOf(first); // width / height
    // clamp displayed ratio between 4:5 (tall) and 16:9 (wide)
    const clamped = Math.min(Math.max(ratio, 9 / 16), 16 / 9);
    return (
      <div
        className="relative w-full cursor-pointer overflow-hidden bg-surface"
        style={{
          aspectRatio: String(clamped),
          maxHeight: "60dvh",
          minHeight: "40dvh",
        }}
        onClick={nav}
      >
        <FeedImage
          src={firstSrc}
          alt={post.title}
          sizes="100vw"
          className="object-contain h-auto"
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
            <div
              key={i}
              className="relative flex-1 bg-black cursor-pointer"
              onClick={nav}
            >
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
              <div
                key={i}
                className="relative flex-1 bg-black cursor-pointer"
                onClick={nav}
              >
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

  // Exactly 4 → clean 2×2 grid.
  if (count === 4) {
    return (
      <div
        className="grid grid-cols-2 gap-0.5 overflow-hidden"
        style={{ height: GRID_H }}
      >
        {media.slice(0, 4).map((item, i) => {
          const src = mediaSrc(item, i === 0 ? "large" : "medium");
          return (
            <div
              key={i}
              className="relative bg-black cursor-pointer overflow-hidden"
              onClick={nav}
            >
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

  // 5+ → Facebook-style stack: 2 large tiles on top, 3 smaller below, with a
  // "+N" overlay on the final tile. Tapping any tile opens the full carousel.
  const top = media.slice(0, 2);
  const bottom = media.slice(2, 5);
  const overflow = count - 5;

  return (
    <div
      className="flex flex-col gap-0.5 overflow-hidden"
      style={{ height: GRID_H }}
    >
      <div className="flex gap-0.5 flex-3">
        {top.map((item, i) => {
          const src = mediaSrc(item, i === 0 ? "large" : "medium");
          return (
            <div
              key={i}
              className="relative flex-1 bg-black cursor-pointer overflow-hidden"
              onClick={nav}
            >
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
      <div className="flex gap-0.5 flex-2">
        {bottom.map((item, i) => {
          const src = mediaSrc(item, "medium");
          const isLast = i === bottom.length - 1 && overflow > 0;
          return (
            <div
              key={i}
              className="relative flex-1 bg-black cursor-pointer overflow-hidden"
              onClick={nav}
            >
              {src && (
                <FeedImage
                  src={src}
                  alt={post.title}
                  sizes="33vw"
                  className="object-cover"
                  blurDataURL={SHIMMER}
                />
              )}
              {isLast && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="text-white text-2xl font-bold">
                    +{overflow}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main PostCard ─────────────────────────────────────────────────────────────

function PostCardImpl({ post, lang, priority, onMessage }: Props) {
  const router = useRouter();
  // Desktop feed provides an inline-chat opener via context; an explicit
  // `onMessage` prop still wins if passed directly.
  const feedChatOpen = useFeedChat();
  const openMessage = onMessage ?? feedChatOpen ?? undefined;
  const { requireAuth } = useAuthGuard(lang);
  const { saved, saveCount, handleSave, handleShare, fireView, handleReport } =
    useInteractions(post, {
      requireAuth,
    });
  const cardRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [fullscreenVideoTime, setFullscreenVideoTime] = useState(0);
  // Paints the chat shell instantly when "Message" is tapped, covering the
  // route-transition gap so opening a chat never flashes a blank page. The
  // overlay unmounts with the PostCard once the conversation route takes over.
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  const mediaCount = post.media?.length ?? 0;

  const [trackDetailViewed] = useMutation(gql`
    mutation TrackDetailViewed($contentId: String!) {
      trackInteraction(input: { contentId: $contentId, type: DETAIL_VIEWED })
    }
  `);
  const [trackCopyLink] = useMutation(gql`
    mutation CopyLinkPostCard($contentId: String!) {
      copyLink(contentId: $contentId)
    }
  `);
  // Fire viewContent only when the card is at least 50% visible
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5) fireView();
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
    // fireView is stable (ref-based) — no need to list it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const { following, toggle: handleFollow } = useFollow({
    userId: creator?.id ?? post.creatorId,
    initialFollowing: creator?.isFollowedByMe ?? false,
    initialFollowerCount: creator?.followerCount ?? 0,
    lang,
  });

  const caption = post.caption ?? "";
  const isLong = caption.length > 100;
  const displayCaption =
    isLong && !expanded ? caption.slice(0, 93) + "…" : caption;

  function handleOpen() {
    if (shouldFire(post.id, "DETAIL_VIEWED")) {
      trackDetailViewed({ variables: { contentId: post.id } }).catch(() => {});
    }
    router.push(`/${lang}/content/${post.id}`, { scroll: false });
  }

  async function handleCopyLink() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/${lang}/content/${post.id}`;
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setMenuOpen(false);
    toast.success("Link copied");
    if (shouldFire(post.id, "LINK_COPIED")) {
      trackCopyLink({ variables: { contentId: post.id } }).catch(() => {});
    }
  }

  async function handleDownload() {
    const src = downloadSrc(post);
    if (!src || typeof document === "undefined") return;

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

  return (
    <article ref={cardRef} className="bg-elevated overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <button
          className="lg:cursor-pointer"
          onClick={() =>
            creator?.id
              ? router.push(`/${lang}/profile/${creator.id}`)
              : handleOpen()
          }
        >
          <Avatar
            creatorId={post.creatorId}
            avatarUrl={creator?.profile?.avatar}
            firstName={creator?.profile?.firstName}
            lastName={creator?.profile?.lastName}
            isVerified={creator?.isVerified}
          />
        </button>

        {/* Name / location / time stack */}
        <div className="flex-1 min-w-0">
          {creatorName ? (
            <button
              onClick={() =>
                creator?.id
                  ? router.push(`/${lang}/profile/${creator.id}`)
                  : handleOpen()
              }
              className="font-bold text-base leading-tight hover:underline block"
            >
              {creatorName}
            </button>
          ) : (
            <div className="h-3.5 w-24 rounded-full bg-surface animate-pulse" />
          )}
          {post.location && locationTrail(post.location) && (
            <p className="flex items-center gap-0.5 text-muted-foreground text-[11px] mt-0.5 leading-tight">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{locationTrail(post.location)}</span>
            </p>
          )}
          <p className="text-muted-foreground text-[11px] mt-0.5">
            {timeAgo(post.createdAt)}
          </p>
        </div>

        {/* Follow button — hidden on own posts, optimistic (no disabled/spinner) */}
        {!isOwnPost && (
          <button
            onClick={handleFollow}
            className={[
              "flex items-center lg:cursor-pointer gap-1 text-[13px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95",
              following
                ? "text-muted-foreground bg-surface"
                : "text-primary-strong dark:text-primary bg-primary-soft hover:bg-primary/20",
            ].join(" ")}
          >
            {following ? (
              "Following"
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                Follow
              </>
            )}
          </button>
        )}

        {/* More options */}
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 lg:cursor-pointer flex items-center justify-center rounded-full hover:bg-surface text-muted-foreground"
              aria-label="Post options"
            >
              <MoreHorizontal className="w-5 h-5" strokeWidth={2.6} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-52 p-1.5 rounded-2xl border border-border bg-elevated shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleCopyLink();
              }}
              className="flex lg:cursor-pointer w-full text-sm items-center gap-3 px-4 py-3 rounded-xl  font-semibold text-default hover:bg-surface transition-colors"
            >
              <Link2
                className="w-4 h-4 shrink-0 text-muted-foreground"
                strokeWidth={2.2}
              />
              Copy link
            </button>

            {post.allowDownload && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex text-sm lg:cursor-pointer w-full items-center gap-3 px-4 py-3 rounded-xl  font-semibold text-default hover:bg-surface transition-colors"
              >
                {isDownloading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span>Down.…</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" strokeWidth={1.8} />
                    <span>Download</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                handleShare();
              }}
              className="flex lg:cursor-pointer w-full text-sm items-center gap-3 px-4 py-3 rounded-xl  font-semibold text-default hover:bg-surface transition-colors"
            >
              <Share2
                className="w-4 h-4 shrink-0 text-muted-foreground"
                strokeWidth={2.2}
              />
              Share content
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!requireAuth({ contentId: post.id })) return;
                setMenuOpen(false);
                void handleReport().then(() =>
                  toast.success("Report submitted"),
                );
              }}
              className="flex lg:cursor-pointer text-sm w-full items-center gap-3 px-4 py-3 rounded-xl  font-semibold text-default hover:bg-surface transition-colors"
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

      {/* ── Text content ───────────────────────────────────────────────── */}
      <div className="px-4 pb-2.5">
        <p className="font-semibold text-default text-[15px] leading-snug mb-1">
          {post.title}
        </p>
        {caption && (
          <p
            className={`text-sm leading-5 ${isLong && !expanded ? "line-clamp-2" : ""}`}
          >
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
              <span
                key={tag}
                className="text-muted-foreground text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Media ──────────────────────────────────────────────────────── */}
      {/* No PDP navigation: videos toggle play/pause; images (single or
          multiple) open the in-place full-screen carousel dialog on tap. */}
      <div className="relative">
        {/* TikTok posts render native once the background re-host has populated
            `media` (the post is then live). Until then we fall back to the live
            embed — though pre-live posts are normally hidden from the feed, so
            this branch is mainly a safety net. */}
        {post.source === "TIKTOK_EMBED" && !post.media?.length ? (
          <TikTokEmbedMedia post={post} />
        ) : post.type === "VIDEO" ? (
          <VideoMedia
            post={post}
            priority={priority}
            fullscreenOpen={showCarousel}
            resumeTime={fullscreenVideoTime}
            onFullscreen={(time) => {
              setFullscreenVideoTime(time);
              setShowCarousel(true);
            }}
          />
        ) : (
          <ImageMedia
            post={post}
            priority={priority}
            onNavigate={
              mediaCount >= 1 ? () => setShowCarousel(true) : undefined
            }
          />
        )}

        {/* Attribution badge for native (re-hosted) TikTok posts. The embed
            block draws its own badge, so only add it for the native case. */}
        {post.source === "TIKTOK_EMBED" &&
          !!post.media?.length &&
          post.tiktokEmbed?.shareUrl && (
            <a
              href={post.tiktokEmbed.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-3 lg:cursor-pointer top-3 z-20 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm"
            >
              <TikTokIcon size={14} className="h-3.5 w-3.5" />
              View on TikTok
            </a>
          )}
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
        <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
          {/* {saveCount > 0 && <span>{fmt(saveCount)} saved</span>} */}
          {/* {(post.stats?.comments ?? 0) > 0 && (
            <span>
              · {fmt(post.stats!.comments!)} comment
              {post.stats.comments == 1 ? "" : "s"}
            </span>
          )} */}
          {(post.stats?.shares ?? 0) > 0 && (
            <span>
              {saveCount > 0 ? " " : ""}
              {fmt(post.stats!.shares!)} share
              {post.stats.shares == 1 ? "" : "s"}
            </span>
          )}
          {(post.stats?.views ?? 0) > 0 && (
            <span>
              · {fmt(post.stats!.views!)} view
              {post.stats.views == 1 ? "" : "s"}
            </span>
          )}
        </div>
        {post.price && post.price.amount > 0 && (
          <span
            className="text-base font-bold"
            style={{ color: "rgb(var(--color-text))" }}
          >
            {post.price.currency} {post.price.amount.toLocaleString()}
          </span>
        )}
      </div>

      {/* ── Action bar — 4 pill buttons matching design ─────────────────── */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        {/* Save pill — outlined, active = filled primary */}
        <button
          onClick={() => handleSave()}
          className="flex lg:cursor-pointer items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all active:scale-95"
          style={{
            borderColor: saved
              ? "rgb(var(--brand-primary))"
              : "rgb(var(--color-border))",
            color: saved
              ? "rgb(var(--brand-primary))"
              : "rgb(var(--color-text-default))",
            backgroundColor: saved
              ? "rgb(var(--brand-primary) / 0.08)"
              : "transparent",
          }}
        >
          <Bookmark
            className="w-4 h-4"
            fill={saved ? "rgb(var(--brand-primary))" : "none"}
            strokeWidth={1.8}
          />
          <span>{saveCount > 0 ? fmt(saveCount) : "Save"}</span>
        </button>

        {/* Comment pill — opens the lazy-loaded comments sheet */}
        <button
          onClick={() => setShowComments(true)}
          className="flex lg:cursor-pointer items-center gap-1.5  px-4 py-2.5 rounded-full border border-border text-xs font-semibold text-default transition-all active:scale-95"
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

          {post?.stats.comments > 0 ? (
            <span>{post?.stats.comments}</span>
          ) : (
            <span>Comment</span>
          )}
        </button>

        {!isOwnPost && (
          <Button
            // Warm the conversation route's JS so the transition paints the chat
            // shell (loading.tsx) instantly instead of a blank frame on tap.
            onPointerEnter={() =>
              router.prefetch(`/${lang}/notifications/${post.id}`)
            }
            onClick={(e) => {
              e.stopPropagation();
              if (!requireAuth({ contentId: post.id })) return;
              // Desktop feed: open the chat inline in the right rail.
              if (openMessage) {
                openMessage(post.id, cardRef.current);
                return;
              }
              // Paint the chat shell immediately, before the navigation, so the
              // transition shows the chat (not a blank frame). Auto-clear in case
              // the user returns to the feed while this card stays mounted.
              setIsOpeningChat(true);
              window.setTimeout(() => setIsOpeningChat(false), 2500);
              // Go straight to the full-screen chat. `source=content` tells the
              // chat screen to ensure (create-or-reuse) the conversation in place,
              // so we never flash the inbox list.
              router.push(`/${lang}/notifications/${post.id}?source=content`);
            }}
            className="flex-1 lg:flex-0 bg-primary lg:w-fit lg:px-8 lg:cursor-pointer flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-white transition-all hover:bg-primary/90 active:scale-95"
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
          </Button>
        )}
      </div>

      {/* ── Lazy comments sheet — mounted (and queried) only when opened ── */}
      {showComments && (
        <CommentsDrawer
          contentId={post.id}
          contentCreatorId={creator?.id ?? post.creatorId}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* ── Full-screen media viewer — images swipe as a carousel and Mux
          videos retain the same dialog/back-button behaviour. ── */}

      <MediaCarouselDialog
        open={showCarousel}
        onOpenChange={setShowCarousel}
        media={[...(post.media ?? [])].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        )}
        title={post.title}
        videoStartTime={fullscreenVideoTime}
        onVideoTimeChange={setFullscreenVideoTime}
      />

      {/* ── Instant chat-shell overlay while the conversation route loads ── */}
      {isOpeningChat &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-60">
            <ChatShellSkeleton />
          </div>,
          document.body,
        )}
    </article>
  );
}

// Feed lists re-render on every pagination/loading-state change; memo keeps
// the (heavy: video, observers, portals) cards from re-rendering unless their
// own post changes. Apollo cache results are referentially stable per item,
// so the shallow compare holds across page appends.
export const PostCard = memo(PostCardImpl);
