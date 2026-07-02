"use client";

/**
 * DesktopTrendingRail — vertical trending list for the desktop right rail.
 * Reuses the same `useTrending` data as the mobile TrendingStrip, but lays the
 * items out as a tappable vertical list better suited to a sidebar.
 */

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MuxPlayer from "@mux/mux-player-react";
import type { MuxCSSProperties } from "@mux/mux-player-react";
import { ArrowUpRight, Flame, Store } from "lucide-react";
import { useTrending } from "../hooks/useFeed";
import { fmtCompact as fmt } from "@/lib/format";
import { idInitials } from "@/lib/avatar";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

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
      onClick={() => router.push(`/${lang}/content/${post.id}`, { scroll: false })}
      className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface"
    >
      {/* Rank */}
      <span className="w-5 shrink-0 text-center text-sm font-black text-muted-foreground">
        {rank}
      </span>

      {/* Thumbnail */}
      <div
        className="relative shrink-0 overflow-hidden rounded-xl bg-surface"
        style={{ width: 36, height: 36 }}
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
            sizes="36px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized={thumb.endsWith(".gif")}
          />
        ) : null}
        {isHot && (
          <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
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
  // Show the skeleton until we actually have items, not only while `loading` is
  // true: with cache-and-network the loading flag can flip to false a beat
  // before the list populates, leaving the rail blank. Gating on emptiness keeps
  // the placeholder visible across that gap so the rail never renders empty.
  const showSkeleton = loading && items.length === 0;

  const sellers = items
    .filter((post) => post.creator)
    .filter(
      (post, index, all) =>
        all.findIndex((item) => item.creator?.id === post.creator?.id) === index,
    )
    .slice(0, 3);

  return (
    <div className="flex min-h-full flex-col gap-4">
      <Link
        href={`/${lang}/upload`}
        scroll={false}
        className="block rounded-2xl bg-primary p-4 text-white shadow-[0_18px_46px_rgb(var(--brand-primary)/0.28)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-black leading-tight">
              Got something to sell?
            </p>
            <p className="mt-1 text-xs font-medium leading-snug text-white/85">
              List it in seconds and reach buyers near you.
            </p>
          </div>
          <Store className="h-5 w-5 shrink-0" />
        </div>
        <span className="mt-4 flex items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-black text-primary">
          Start selling
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>

      <section className="rounded-2xl border border-default bg-elevated p-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-1.5 text-base font-black text-default">
            <Flame className="h-4 w-4 text-primary" fill="currentColor" />
            Trending now
          </h2>
          <span className="rounded-full bg-surface px-2 py-1 text-[11px] font-semibold text-muted">
            {county ?? "Today"}
          </span>
        </div>

        {showSkeleton ? (
          <div className="flex flex-col gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 p-2"
              >
                <div className="h-4 w-4 shrink-0 rounded bg-black/10 dark:bg-white/10" />
                <div
                  className="shrink-0 rounded-xl bg-black/10 dark:bg-white/10"
                  style={{ width: 36, height: 36 }}
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
            {items.slice(0, 6).map((post, i) => (
              <TrendingRow
                key={post.id}
                post={post}
                lang={lang}
                rank={i + 1}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-default bg-elevated p-4">
        <h2 className="mb-3 px-1 text-base font-black text-default">
          Sellers to follow
        </h2>

        {showSkeleton ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded-full bg-black/10 dark:bg-white/10" />
                  <div className="h-2.5 w-1/2 rounded-full bg-black/10 dark:bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted">No sellers yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sellers.map((post) => {
              const creator = post.creator!;
              const name = creator.profile?.firstName
                ? `${creator.profile.firstName}${creator.profile.lastName ? " " + creator.profile.lastName : ""}`
                : `Seller ${creator.id.slice(-4)}`;
              const location =
                post.location?.county ?? post.location?.placeName ?? "Nearby";

              return (
                <div key={creator.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-xs font-black text-default">
                    {creator.profile?.avatar ? (
                      <Image
                        src={creator.profile.avatar}
                        alt={name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      idInitials(creator.id)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold leading-tight text-default">
                      {name}
                    </p>
                    <p className="truncate text-xs leading-tight text-muted">
                      {location}
                    </p>
                  </div>
                  <Link
                    href={`/${lang}/profile/${creator.id}`}
                    scroll={false}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-black text-white"
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
