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
import { Download, MapPin, Bookmark, Plus } from "lucide-react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { useInteractions } from "../hooks/useInteractions";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { useFollow } from "../hooks/useFollow";
import { BufferSpinner } from "./BufferSpinner";
import { usePageFocused } from "../hooks/usePageFocused";
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
  const muted = useFeedPreferencesStore((s) => s.videoMuted);
  const toggleVideoMuted = useFeedPreferencesStore((s) => s.toggleVideoMuted);
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
  const aspectRatio = isLandscape ? "16/9" : "9/16";

  const durationFmt = mux?.duration
    ? mux.duration >= 60
      ? `${Math.floor(mux.duration / 60)}:${String(Math.round(mux.duration % 60)).padStart(2, "0")}`
      : `0:${String(Math.round(mux.duration)).padStart(2, "0")}`
    : null;

  // hls.js — fast ABR + buffering state
  const shouldPlay = active && pageFocused;
  const { videoRef, buffering } = useHlsVideo(hlsUrl, shouldPlay);

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
        minHeight: "40dvh",
        maxHeight: "65dvh",
      }}
    >
      {/* Thumbnail — fades out once video is playing */}
      {thumbnail && (
        <FeedImage
          src={thumbnail}
          alt={post.title}
          sizes="100vw"
          className={`object-cover transition-opacity duration-500 ${
            hlsUrl && shouldPlay && !buffering
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
      {/* Mute / unmute button — absolute, stops propagation so it doesn't navigate */}
      {active && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleVideoMuted();
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

  const GRID_H = "clamp(40dvh, 72vw, 60dvh)";
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

  const visible = media.slice(0, 4);
  const overflow = count - 4;

  return (
    <div
      className="grid grid-cols-2 gap-0.5 overflow-hidden"
      style={{ height: GRID_H }}
    >
      {visible.map((item, i) => {
        const src = mediaSrc(item, i === 0 ? "large" : "medium");
        const isLast = i === 3 && overflow > 0;
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
            {isLast && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  +{overflow}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── GraphQL for collections ───────────────────────────────────────────────────

const GET_MY_COLLECTIONS = gql`
  query GetMyCollectionsSheet {
    myCollections {
      id
      name
      color
      itemCount
    }
  }
`;

const CREATE_COLLECTION = gql`
  mutation CreateCollectionSheet($name: String!, $color: String) {
    createCollection(name: $name, color: $color) {
      id
      name
      color
      itemCount
    }
  }
`;

const ADD_SAVE_TO_COLLECTION = gql`
  mutation AddSaveToCollectionSheet(
    $contentId: String!
    $collectionId: String!
  ) {
    addSaveToCollection(contentId: $contentId, collectionId: $collectionId)
  }
`;

type CollectionItem = {
  id: string;
  name: string;
  color?: string | null;
  itemCount: number;
};

// ── SaveCollectionSheet (shadcn Drawer) ───────────────────────────────────────

function SaveCollectionSheet({
  open,
  contentId,
  saved,
  onSave,
  onClose,
}: {
  open: boolean;
  contentId: string;
  saved: boolean;
  onSave: (collectionId?: string) => void;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, refetch } = (useQuery as any)(GET_MY_COLLECTIONS, {
    fetchPolicy: "cache-and-network",
    skip: !open,
  }) as {
    data?: { myCollections: CollectionItem[] };
    refetch: () => Promise<unknown>;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createCollection] = useMutation(CREATE_COLLECTION) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addSaveToCollection] = useMutation(ADD_SAVE_TO_COLLECTION) as any;

  const collections: CollectionItem[] = data?.myCollections ?? [];

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const { data: res } = await createCollection({
      variables: { name: trimmed },
    });
    const newCol = res?.createCollection as CollectionItem | undefined;
    setNewName("");
    setCreating(false);
    await refetch();
    if (newCol) onSave(newCol.id);
  }

  async function handlePickCollection(col: CollectionItem) {
    setAddingTo(col.id);
    try {
      if (saved) {
        await addSaveToCollection({
          variables: { contentId, collectionId: col.id },
        });
        onClose();
      } else {
        onSave(col.id);
      }
    } finally {
      setAddingTo(null);
    }
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left px-5 pt-2 pb-3">
          <DrawerTitle className="text-base font-semibold">
            Save to collection
          </DrawerTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep what you love, organised
          </p>
        </DrawerHeader>

        <div className="px-4 max-h-[60dvh] overflow-y-auto pb-2 space-y-1">
          {/* New collection */}
          {creating ? (
            <div className="flex items-center gap-2 py-2">
              <input
                autoFocus
                className="flex-1 bg-surface rounded-xl px-3 py-2.5 text-sm text-default placeholder:text-muted-foreground outline-none border border-border focus:border-primary"
                placeholder="Collection name…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: "rgb(var(--brand-primary))" }}
              >
                Create
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-3 w-full py-3 text-left"
            >
              <div
                className="w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center flex-shrink-0"
                style={{ borderColor: "rgb(var(--brand-primary) / 0.5)" }}
              >
                <Plus
                  className="w-5 h-5"
                  style={{ color: "rgb(var(--brand-primary))" }}
                />
              </div>
              <span
                className="font-medium text-sm"
                style={{ color: "rgb(var(--brand-primary))" }}
              >
                New collection
              </span>
            </button>
          )}

          {/* Existing collections */}
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => handlePickCollection(col)}
              disabled={addingTo === col.id}
              className="flex items-center gap-3 w-full py-2.5 text-left rounded-xl hover:bg-surface transition-colors"
            >
              {/* Icon: first letter on primary or black bg */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                style={{
                  backgroundColor: col.color ?? "rgb(var(--brand-primary))",
                }}
              >
                {(col.name ?? "").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-default truncate">
                  {col.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {col.itemCount} items
                </p>
              </div>
              {addingTo === col.id ? (
                <div
                  className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "rgb(var(--brand-primary))" }}
                />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-border" />
              )}
            </button>
          ))}
        </div>

        {/* Done */}
        <div className="px-4 pt-3 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white"
            style={{ backgroundColor: "rgb(var(--brand-primary))" }}
          >
            Done
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ── Main PostCard ─────────────────────────────────────────────────────────────

export function PostCard({ post, lang, priority }: Props) {
  const router = useRouter();
  const { requireAuth } = useAuthGuard(lang);
  const { saved, saveCount, handleSave, handleShare } = useInteractions(post, {
    requireAuth,
  });
  const [expanded, setExpanded] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);

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
  const isLong = caption.length > 160;
  const displayCaption =
    isLong && !expanded ? caption.slice(0, 160) + "…" : caption;

  function handleOpen() {
    router.push(`/${lang}/content/${post.id}`);
  }

  function handleDownload() {
    const src = downloadSrc(post);
    if (!src || typeof document === "undefined") return;

    const a = document.createElement("a");
    a.href = src;
    a.download = `${post.title || "shopi-post"}`;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <article className="bg-elevated overflow-hidden">
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

        {/* Name / location / time stack */}
        <div className="flex-1 min-w-0">
          {creatorName ? (
            <button
              onClick={handleOpen}
              className="font-semibold text-base text-default leading-tight hover:underline block"
            >
              {creatorName}
            </button>
          ) : (
            <div className="h-3.5 w-24 rounded-full bg-surface animate-pulse" />
          )}
          {(post.location?.placeName || post.location?.county) && (
            <p className="flex items-center gap-0.5 text-muted-foreground text-[11px] mt-0.5 leading-tight">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {[post.location.placeName, post.location.county]
                  .filter(Boolean)
                  .join(", ")}
              </span>
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
              "flex items-center gap-1 text-[13px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95",
              following
                ? "text-muted-foreground bg-surface"
                : "text-primary bg-primary/10 hover:bg-primary/20",
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
      <div className="cursor-pointer" onClick={handleOpen}>
        {post.type === "VIDEO" ? (
          <VideoMedia post={post} priority={priority} />
        ) : (
          <ImageMedia post={post} priority={priority} onNavigate={handleOpen} />
        )}
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
        <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
          {saveCount > 0 && <span>{fmt(saveCount)} saved</span>}
          {(post.stats?.views ?? 0) > 0 && (
            <span>· Trending in {post.location?.county ?? "your area"}</span>
          )}
        </div>
        {post.price && (
          <span
            className="text-xs font-bold"
            style={{ color: "rgb(var(--color-text))" }}
          >
            {post.price.currency}{" "}
            {post.price.amount === 0
              ? "Free"
              : post.price.amount.toLocaleString()}
          </span>
        )}
      </div>

      {/* ── Action bar — 4 pill buttons matching design ─────────────────── */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        {/* Save pill — outlined, active = filled primary */}
        <button
          onClick={() => {
            if (!requireAuth({ contentId: post.id, action: "save" })) return;
            setShowSaveSheet(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-xs font-semibold transition-all active:scale-95"
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

        {/* Download pill — outlined like Save */}
        {post.allowDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-border text-xs font-semibold transition-all active:scale-95"
          >
            <Download className="w-4 h-4" strokeWidth={1.8} />
            <span>Download</span>
          </button>
        )}

        {/* Share pill — outlined */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-border text-xs font-semibold text-default transition-all active:scale-95"
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
          <span>
            {(post.stats?.shares ?? 0) > 0
              ? fmt(post.stats!.shares ?? 0)
              : "Share"}
          </span>
        </button>

        {/* Message pill — soft gray, grows to fill remaining space */}
        <button
          onClick={handleOpen}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold text-white transition-all active:scale-95"
          style={{ backgroundColor: "rgb(150 150 150)" }}
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
      </div>

      {/* ── Save collection sheet ───────────────────────────────────────── */}
      <SaveCollectionSheet
        open={showSaveSheet}
        contentId={post.id}
        saved={saved}
        onSave={(collectionId) => {
          handleSave(collectionId);
          setShowSaveSheet(false);
        }}
        onClose={() => setShowSaveSheet(false)}
      />
    </article>
  );
}
