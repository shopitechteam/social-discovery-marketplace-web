"use client";

/**
 * VideoCard — muted autoplay preview in feed.
 * Tapping navigates to the full video page.
 * Uses IntersectionObserver to play only when visible (battery-friendly).
 */

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PriceTag } from "./PriceTag";
import { StatRow } from "./StatRow";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

interface Props {
  post: ContentCardFieldsFragment;
  lang: string;
  priority?: boolean;
}

export function VideoCard({ post, lang, priority }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const media = post.media?.[0];
  const mux = media?.muxMeta;
  const hlsUrl = mux?.playbackId
    ? `https://stream.mux.com/${mux.playbackId}.m3u8`
    : null;
  const thumbnail =
    media?.thumbnailUrl ??
    (mux?.playbackId
      ? `https://image.mux.com/${mux.playbackId}/thumbnail.jpg?time=0&width=720&fit_mode=smartcrop`
      : null);
  const animThumb =
    mux?.playbackId
      ? `https://image.mux.com/${mux.playbackId}/animated.gif?width=480&fps=12`
      : null;

  // Aspect ratio — default 9:16 portrait (social standard)
  const aspectRatio =
    mux?.aspectRatio === "16:9" ? "16/9" : "9/16";

  // IntersectionObserver: play when ≥60% visible, pause otherwise
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5),
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (visible) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [visible]);

  const durationFmt = mux?.duration
    ? mux.duration >= 60
      ? `${Math.floor(mux.duration / 60)}:${String(Math.round(mux.duration % 60)).padStart(2, "0")}`
      : `0:${String(Math.round(mux.duration)).padStart(2, "0")}`
    : null;

  return (
    <article
      ref={containerRef}
      onClick={() => router.push(`/${lang}/content/${post.id}`)}
      className="relative cursor-pointer group select-none"
      style={{ aspectRatio }}
      aria-label={post.title}
    >
      {/* ── Thumbnail / video ─────────────────────────────────────────── */}
      <div className="absolute inset-0 rounded-xl overflow-hidden bg-black">
        {/* Static thumbnail — shows until video loads or on error */}
        {thumbnail && !thumbError && (
          <Image
            src={animThumb && visible ? animThumb : thumbnail}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover transition-opacity duration-300 ${hlsUrl && visible ? "opacity-0" : "opacity-100"}`}
            priority={priority}
            onError={() => setThumbError(true)}
            unoptimized={!!animThumb && visible}
          />
        )}

        {/* HLS video — autoplay muted loop */}
        {hlsUrl && (
          <video
            ref={videoRef}
            src={hlsUrl}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* ── Gradient overlay ─────────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* ── Duration badge ────────────────────────────────────────── */}
        {durationFmt && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
            {durationFmt}
          </div>
        )}

        {/* ── Play indicator — fades on hover/tap ───────────────────── */}
        {!visible && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}

        {/* ── Bottom content overlay ────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-6">
          <h3 className="text-white text-xs font-semibold leading-snug line-clamp-2 mb-1.5">
            {post.title}
          </h3>
          <div className="flex items-center justify-between gap-1">
            <StatRow
              likes={post.stats?.likes ?? 0}
              comments={post.stats?.comments ?? 0}
              views={post.stats?.views}
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
      </div>
    </article>
  );
}
