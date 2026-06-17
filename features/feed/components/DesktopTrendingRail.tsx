"use client";

/**
 * DesktopTrendingRail — vertical trending list for the desktop right rail.
 * Reuses the same `useTrending` data as the mobile TrendingStrip, but lays the
 * items out as a tappable vertical list better suited to a sidebar.
 */

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxCSSProperties } from "@mux/mux-player-react";
import { useTrending } from "../hooks/useFeed";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function TrendingRow({
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
      ? `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0&width=200&fit_mode=smartcrop`
      : (media?.r2Variants?.find((v) => v.variant === "thumb")?.url ??
        media?.r2Variants?.[0]?.url ??
        media?.imageUrl ??
        null));

  const isHot = (post.ranking?.trendingScore ?? 0) > 5;

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
      className="group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-surface"
    >
      {/* Rank */}
      <span className="w-5 shrink-0 text-center text-base font-black text-muted-foreground">
        {rank}
      </span>

      {/* Thumbnail */}
      <div
        className="relative shrink-0 overflow-hidden rounded-xl bg-surface"
        style={{ width: 52, height: 64 }}
      >
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
            sizes="52px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={thumb.endsWith(".gif")}
          />
        ) : null}
        {isHot && (
          <span className="absolute right-0.5 top-0.5 text-xs leading-none">
            🔥
          </span>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-snug text-default">
          {post.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {(post.stats?.views ?? 0) > 0
            ? `${fmt(post.stats!.views!)} views`
            : "Trending now"}
        </p>
      </div>
    </button>
  );
}

export function DesktopTrendingRail({
  lang,
  county,
}: {
  lang: string;
  county?: string;
}) {
  const { items, loading } = useTrending(county);

  return (
    <div className="rounded-3xl border border-default bg-elevated p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-base font-bold text-default">
          <span>🔥</span> Trending
        </h2>
        <span className="text-xs text-muted-foreground">
          {county ?? "Nationwide"}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="h-4 w-4 shrink-0 rounded bg-black/10 dark:bg-white/10" />
              <div
                className="shrink-0 rounded-xl bg-black/10 dark:bg-white/10"
                style={{ width: 52, height: 64 }}
              />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="h-2.5 w-1/2 rounded-full bg-black/10 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="px-1 py-4 text-sm text-muted-foreground">
          Nothing trending yet.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {items.slice(0, 8).map((post, i) => (
            <TrendingRow key={post.id} post={post} lang={lang} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
