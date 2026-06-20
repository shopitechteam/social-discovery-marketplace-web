"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark,
  Eye,
  Image as ImageIcon,
  Play,
  Plus,
  Upload,
} from "lucide-react";
import { SHIMMER_PORTRAIT } from "@/lib/shimmer";
import type { ProfilePostFieldsFragment } from "@/types/__generated__/graphql";

interface Props {
  posts: ProfilePostFieldsFragment[];
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
  lang: string;
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatDate(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function getPostThumb(post: ProfilePostFieldsFragment) {
  const firstMedia = post.media?.[0];

  // For videos, fall back to a Mux-derived thumbnail when no stored cover exists
  // (some imported/older videos have a playbackId but no thumbnailUrl).
  const muxPlaybackId = firstMedia?.muxMeta?.playbackId;
  const muxDerivedThumb = muxPlaybackId
    ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?time=0&width=540&fit_mode=smartcrop`
    : null;

  return (
    firstMedia?.muxMeta?.thumbnailUrl ??
    firstMedia?.thumbnailUrl ??
    firstMedia?.r2Variants?.find((v) => v.variant === "thumbnail")?.url ??
    firstMedia?.r2Variants?.find((v) => v.variant === "medium")?.url ??
    firstMedia?.r2Variants?.[0]?.url ??
    firstMedia?.url ??
    muxDerivedThumb ??
    null
  );
}

function StatChip({ icon: Icon, value }: { icon: typeof Eye; value: number }) {
  return (
    <span className="flex items-center gap-1">
      <Icon size={12} aria-hidden /> {formatCompact(value)}
    </span>
  );
}

/**
 * Profile post tile — same card design as the TikTok tab's VideoCard:
 * thumbnail on top, then title / stats / date below the image.
 */
function PostThumbnail({
  post,
  lang,
  priority,
}: {
  post: ProfilePostFieldsFragment;
  lang: string;
  priority: boolean;
}) {
  const thumb = getPostThumb(post);
  const isVideo = post.type === "VIDEO";
  const createdAt = formatDate(post.createdAt);

  return (
    <Link
      href={`/${lang}/content/${post.id}`}
      className="group block overflow-hidden rounded-xl border outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        borderColor: "rgb(var(--color-border))",
        backgroundColor: "rgb(var(--color-bg-elevated))",
      }}
      aria-label={post.title}
    >
      {/* Thumbnail */}
      <div className="relative aspect-9/10">
        {thumb && isVideo ? (
          <Image
            src={thumb}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 430px) 50vw, 215px"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={SHIMMER_PORTRAIT}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Image
              src={
                post.media.filter((m) => m.mediaType === "IMAGE")[0]
                  ?.r2Variants?.[0]?.url ??
                thumb ??
                "/images/placeholder.png"
              }
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 430px) 50vw, 215px"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={SHIMMER_PORTRAIT}
            />
            {/* <ImageIcon
              size={28}
              strokeWidth={1.7}
              style={{ color: "rgb(var(--color-text-placeholder))" }}
              aria-hidden
            /> */}
          </div>
        )}

        {/* Play affordance for video posts */}
        {isVideo && thumb && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
              <Play
                size={20}
                fill="currentColor"
                strokeWidth={0}
                className="ml-0.5"
              />
            </span>
          </span>
        )}
      </div>

      {/* Meta — title / stats / date */}
      <div className="p-2.5">
        {post.title && (
          <p
            className="line-clamp-2 leading-tight"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text))",
              fontWeight: 500,
            }}
          >
            {post.title}
          </p>
        )}

        <div
          className="mt-1 flex items-center gap-3"
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          <StatChip icon={Eye} value={post.stats.views} />
          <StatChip icon={Bookmark} value={post.stats.saves} />
        </div>

        <p
          className="mt-1"
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          {createdAt}
        </p>
      </div>
    </Link>
  );
}

export function PostsGrid({
  posts,
  hasMore,
  onLoadMore,
  loading,
  lang,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Keep the latest onLoadMore without re-subscribing the observer each render.
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Infinite scroll: load the next page when the sentinel scrolls into view.
  // Guard against firing again while a page is in flight (the observer can keep
  // intersecting until new rows push the sentinel out of view).
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, posts.length]);

  if (posts.length === 0 && !loading) {
    return (
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border"
            style={{
              backgroundColor: "rgb(var(--color-bg-elevated))",
              borderColor: "rgb(var(--color-border))",
              color: "rgb(var(--brand-primary))",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Upload size={26} strokeWidth={2} />
          </div>
          <h2
            className="font-bold"
            style={{
              fontSize: "var(--text-lg)",
              color: "rgb(var(--color-text))",
            }}
          >
            No posts yet
          </h2>
          <p
            className="mt-2 max-w-sm leading-snug"
            style={{
              fontSize: "var(--text-base)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            Create your first showcase and it will appear here.
          </p>
          <Link
            href={`/${lang}/upload`}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-semibold text-white active:opacity-80"
            style={{
              fontSize: "var(--text-sm)",
              background:
                "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
              boxShadow: "0 10px 24px rgb(var(--brand-primary) / 0.24)",
            }}
          >
            <Plus size={16} strokeWidth={2.4} />
            New post
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2
              className="font-bold leading-tight"
              style={{
                fontSize: "var(--text-base)",
                color: "rgb(var(--color-text))",
              }}
            >
              Content library
            </h2>
            <p
              className="mt-1"
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>
          <Link
            href={`/${lang}/upload`}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 font-semibold active:opacity-75"
            style={{
              fontSize: "var(--text-sm)",
              backgroundColor: "rgb(var(--color-bg-elevated))",
              borderColor: "rgb(var(--color-border))",
              color: "rgb(var(--color-text))",
            }}
          >
            <Plus size={15} strokeWidth={2.4} />
            New
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {posts.map((post, index) => (
            <PostThumbnail
              key={post.id}
              post={post}
              lang={lang}
              priority={index < 6}
            />
          ))}
        </div>

        {/* Infinite scroll sentinel + loader */}
        <div ref={sentinelRef} className="h-px" />
        {hasMore && loading && (
          <div
            className="flex justify-center py-6"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            Loading…
          </div>
        )}
      </div>
    </section>
  );
}
