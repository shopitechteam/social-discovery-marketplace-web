"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  Heart,
  Image as ImageIcon,
  MessageCircle,
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

  return (
    firstMedia?.muxMeta?.thumbnailUrl ??
    firstMedia?.thumbnailUrl ??
    firstMedia?.r2Variants?.find((v) => v.variant === "thumbnail")?.url ??
    firstMedia?.r2Variants?.find((v) => v.variant === "medium")?.url ??
    firstMedia?.r2Variants?.[0]?.url ??
    firstMedia?.url ??
    null
  );
}

function StatChip({ icon: Icon, value }: { icon: typeof Eye; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-white">
      <Icon size={12} strokeWidth={2.3} aria-hidden />
      <span style={{ fontSize: "var(--text-xs)" }}>{formatCompact(value)}</span>
    </span>
  );
}

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
      className="group relative block overflow-hidden rounded-lg border outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        aspectRatio: "9/16",
        backgroundColor: "rgb(var(--color-bg-subtle))",
        borderColor: "rgb(var(--color-border))",
        boxShadow: "var(--shadow-sm)",
      }}
      aria-label={post.title}
    >
      {thumb ? (
        <Image
          src={thumb}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 430px) 32vw, (max-width: 1024px) 22vw, 180px"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={SHIMMER_PORTRAIT}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon
            size={28}
            strokeWidth={1.7}
            style={{ color: "rgb(var(--color-text-placeholder))" }}
            aria-hidden
          />
        </div>
      )}

      <div
        className="absolute inset-0 opacity-95 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.76), rgba(0,0,0,0.08) 52%, rgba(0,0,0,0.32))",
        }}
      />

      <div className="absolute left-2 top-2 flex items-center gap-1.5">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-white"
          style={{
            backgroundColor: "rgba(0,0,0,0.45)",
            borderColor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          {isVideo ? (
            <Play size={14} fill="currentColor" strokeWidth={0} aria-hidden />
          ) : (
            <ImageIcon size={14} strokeWidth={2.2} aria-hidden />
          )}
        </span>
        {createdAt && (
          <span
            className="hidden rounded-lg px-2 py-1 font-semibold text-white md:inline-flex"
            style={{
              backgroundColor: "rgba(0,0,0,0.38)",
              backdropFilter: "blur(10px)",
              fontSize: "var(--text-xs)",
            }}
          >
            {createdAt}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-2.5">
        <h3
          className="mb-2 hidden font-semibold leading-snug text-white md:line-clamp-2"
          style={{ fontSize: "var(--text-sm)" }}
        >
          {post.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <StatChip icon={Eye} value={post.stats.views} />
          <StatChip icon={Heart} value={post.stats.likes} />
          <span className="hidden sm:inline-flex">
            <StatChip icon={MessageCircle} value={0} />
          </span>
        </div>
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
              color: "rgb(var(--color-text))",
              fontSize: "var(--text-lg)",
            }}
          >
            No posts yet
          </h2>
          <p
            className="mt-2 max-w-sm leading-snug"
            style={{
              color: "rgb(var(--color-text-muted))",
              fontSize: "var(--text-base)",
            }}
          >
            Create your first showcase and it will appear here.
          </p>
          <Link
            href={`/${lang}/upload`}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-semibold text-white active:opacity-80"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
              boxShadow: "0 10px 24px rgb(var(--brand-primary) / 0.24)",
              fontSize: "var(--text-sm)",
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
                color: "rgb(var(--color-text))",
                fontSize: "var(--text-base)",
              }}
            >
              Content library
            </h2>
            <p
              className="mt-1"
              style={{
                color: "rgb(var(--color-text-muted))",
                fontSize: "var(--text-sm)",
              }}
            >
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>
          <Link
            href={`/${lang}/upload`}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 font-semibold active:opacity-75"
            style={{
              backgroundColor: "rgb(var(--color-bg-elevated))",
              borderColor: "rgb(var(--color-border))",
              color: "rgb(var(--color-text))",
              fontSize: "var(--text-sm)",
            }}
          >
            <Plus size={15} strokeWidth={2.4} />
            New
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {posts.map((post, index) => (
            <PostThumbnail
              key={post.id}
              post={post}
              lang={lang}
              priority={index < 6}
            />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center py-6">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-5 font-semibold active:opacity-75 disabled:opacity-50"
              style={{
                backgroundColor: "rgb(var(--color-bg-elevated))",
                borderColor: "rgb(var(--color-border))",
                color: "rgb(var(--color-text))",
                fontSize: "var(--text-sm)",
              }}
            >
                  {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
