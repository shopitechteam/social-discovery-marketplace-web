"use client";

/**
 * TrendingStrip — horizontal scrolling strip of 5-6 trending posts.
 * Shown at the top of the feed. Hot items get a fire badge.
 * Videos autoplay muted via MuxPlayer when scrolled into view.
 */

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxCSSProperties } from "@mux/mux-player-react";
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
  const containerRef = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(false);

  const media = post.media?.[0];
  const playbackId = media?.muxMeta?.playbackId ?? null;
  const isVideo = !!playbackId;

  const thumb =
    media?.thumbnailUrl ??
    (playbackId
      ? `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=320&fit_mode=smartcrop`
      : (media?.r2Variants?.find((v) => v.variant === "thumb")?.url ?? null));

  const isHot = (post.ranking?.trendingScore ?? 0) > 5;

  // Observe when the card enters / leaves the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isVideo) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideo]);

  return (
    <button
      ref={containerRef}
      onClick={() => router.push(`/${lang}/content/${post.id}`)}
      className="relative flex-none w-28 bg-gray-200 rounded-xl overflow-hidden group"
      style={{ aspectRatio: "9/14" }}
      aria-label={post.title}
    >
      {/* ── Video: MuxPlayer when in view, thumbnail otherwise ── */}
      {isVideo && inView ? (
        <MuxPlayer
          playbackId={playbackId!}
          autoPlay="muted"
          muted
          loop
          playsInline
          preload="metadata"
          thumbnailTime={0}
          style={
            {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              "--controls": "none",
              "--media-object-fit": "cover",
            } as MuxCSSProperties
          }
        />
      ) : thumb ? (
        <Image
          src={thumb}
          alt={post.title}
          fill
          sizes="112px"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          unoptimized={thumb.endsWith(".gif")}
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}

      {/* Gradient overlay — always on top */}
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

      {/* Rank number */}
      <div className="absolute top-1.5 left-2 text-white/90 font-black text-lg leading-none pointer-events-none">
        {rank}
      </div>

      {/* Hot badge */}
      {isHot && (
        <div className="absolute top-1.5 right-1.5 text-base leading-none pointer-events-none">
          🔥
        </div>
      )}

      {/* Video indicator */}
      {isVideo && !inView && (
        <div className="absolute top-1.5 right-1.5 pointer-events-none">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="white"
            opacity={0.8}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      {/* Title */}
      {/*   */}
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
            className="flex-none w-28  rounded-xl bg-black/10 dark:bg-white/10 animate-pulse"
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
        <span className="text-xs text-muted-foreground">
          {county ?? "Nationwide"}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2.5 mx-4 overflow-x-auto scrollbar-none pb-0.5"
        style={{ scrollSnapType: "x proximity" }}
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
