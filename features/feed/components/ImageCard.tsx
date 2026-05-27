"use client";

/**
 * ImageCard — photo / gallery post card.
 * Shows the primary image with price overlay and stats.
 * Multi-image posts show a stacked indicator.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SHIMMER } from "@/lib/shimmer";
import { PriceTag } from "./PriceTag";
import { StatRow } from "./StatRow";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

interface Props {
  post: ContentCardFieldsFragment;
  lang: string;
  priority?: boolean;
  /** "tall" = portrait 3:4 (default), "wide" = landscape 4:3 */
  variant?: "tall" | "wide" | "square";
}

export function ImageCard({ post, lang, priority, variant = "tall" }: Props) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const media = post.media ?? [];
  const primary = [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];

  // Pick best-fit variant: medium for cards, fallback to imageUrl or thumbnailUrl
  const src =
    primary?.r2Variants?.find((v) => v.variant === "medium")?.url ??
    primary?.r2Variants?.[0]?.url ??
    primary?.imageUrl ??
    primary?.thumbnailUrl ??
    null;

  const aspectRatio =
    variant === "wide" ? "4/3" : variant === "square" ? "1/1" : "3/4";

  const isGallery = media.length > 1;

  return (
    <article
      onClick={() => router.push(`/${lang}/content/${post.id}`)}
      className="relative cursor-pointer group rounded-xl overflow-hidden bg-surface select-none"
      style={{ aspectRatio }}
      aria-label={post.title}
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      {src && !imgError ? (
        <Image
          src={src}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={SHIMMER}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <svg className="w-10 h-10 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* ── Gradient ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* ── Gallery badge ─────────────────────────────────────────────── */}
      {isGallery && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
          </svg>
          {media.length}
        </div>
      )}

      {/* ── Bottom overlay ─────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-6">
        <h3 className="text-white text-xs font-semibold leading-snug line-clamp-2 mb-1.5">
          {post.title}
        </h3>
        <div className="flex items-center justify-between gap-1">
          <StatRow
            likes={post.stats?.likes ?? 0}
            comments={post.stats?.comments ?? 0}
            inverted
          />
          {post.price && (
            <PriceTag
              amount={post.price.amount}
              currency={post.price.currency}
              negotiable={post.price.negotiable}
              inverted
            />
          )}
        </div>
      </div>
    </article>
  );
}
