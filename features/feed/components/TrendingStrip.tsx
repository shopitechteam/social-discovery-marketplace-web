"use client";

/**
 * TrendingStrip — horizontal scrolling strip of 5-6 trending posts.
 * Shown at the top of the feed. Hot items get a fire badge.
 */

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTrending } from "../hooks/useFeed";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

interface Props {
  lang: string;
  county?: string;
}

function TrendingItem({
  post,
  lang,
  rank,
}: {
  post: ContentCardFieldsFragment;
  lang: string;
  rank: number;
}) {
  const router = useRouter();
  const media = post.media?.[0];
  const thumb =
    media?.thumbnailUrl ??
    (media?.muxMeta?.playbackId
      ? `https://image.mux.com/${media.muxMeta.playbackId}/thumbnail.jpg?time=0&width=320&fit_mode=smartcrop`
      : media?.r2Variants?.find((v) => v.variant === "thumb")?.url ?? null);

  const isHot = (post.ranking?.trendingScore ?? 0) > 5;

  return (
    <button
      onClick={() => router.push(`/${lang}/content/${post.id}`)}
      className="relative flex-none w-28 rounded-xl overflow-hidden group"
      style={{ aspectRatio: "9/14" }}
      aria-label={post.title}
    >
      {thumb ? (
        <Image
          src={thumb}
          alt={post.title}
          fill
          sizes="112px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={thumb.endsWith(".gif")}
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Rank number */}
      <div className="absolute top-1.5 left-2 text-white/90 font-black text-lg leading-none">
        {rank}
      </div>

      {/* Hot badge */}
      {isHot && (
        <div className="absolute top-1.5 right-1.5 text-base leading-none">🔥</div>
      )}

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
        <p className="text-white text-[10px] font-semibold leading-tight line-clamp-2">
          {post.title}
        </p>
        {post.price && (
          <p className="text-primary text-[10px] font-bold mt-0.5">
            {post.price.amount === 0
              ? "Free"
              : `${post.price.currency} ${post.price.amount.toLocaleString()}`}
          </p>
        )}
      </div>
    </button>
  );
}

export function TrendingStrip({ lang, county }: Props) {
  const { items, loading } = useTrending(county);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="flex gap-2.5 px-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex-none w-28 rounded-xl bg-surface animate-pulse"
            style={{ aspectRatio: "9/14" }}
          />
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-2.5">
        <h2 className="text-sm font-bold text-default flex items-center gap-1.5">
          <span>🔥</span> Trending
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {county ?? "Nationwide"}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2.5 px-4 overflow-x-auto scrollbar-none pb-0.5"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.slice(0, 8).map((post, i) => (
          <div key={post.id} style={{ scrollSnapAlign: "start" }}>
            <TrendingItem post={post} lang={lang} rank={i + 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
