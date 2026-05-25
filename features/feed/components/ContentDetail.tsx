"use client";

/**
 * ContentDetail — full-page view of a single post.
 *
 * Video posts: full-height player with controls + product info below.
 * Image posts: scrollable gallery + product info.
 */

import { useState, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GetContentDocument } from "@/types/__generated__/graphql";
import { PriceTag } from "./PriceTag";
import { StatRow } from "./StatRow";

interface Props {
  id: string;
  lang: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function ContentDetail({ id }: Props) {
  const router = useRouter();
  const { data, loading } = useQuery(GetContentDocument, { variables: { id } });
  const [imgIdx, setImgIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const post = data?.content;
  if (!post) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">😕</div>
        <p className="text-default font-semibold">Post not found</p>
        <button
          onClick={() => router.back()}
          className="text-primary text-sm font-semibold"
        >
          Go back
        </button>
      </div>
    );
  }

  const isVideo = post.type === "VIDEO";
  const media = [...(post.media ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const primaryMedia = media[0];
  const mux = primaryMedia?.muxMeta;
  const hlsUrl = mux?.playbackId ? `https://stream.mux.com/${mux.playbackId}.m3u8` : null;

  return (
    <div className="min-h-svh flex flex-col bg-app">
      {/* ── Back button ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 h-12 bg-app/80 backdrop-blur-md border-b border-default">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 -ml-1 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
          aria-label="Back"
        >
          <svg className="w-5 h-5 text-default" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-default text-sm truncate flex-1">
          {post.title}
        </span>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors" aria-label="Share">
          <svg className="w-5 h-5 text-default" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* ── Media ───────────────────────────────────────────────────── */}
      {isVideo && hlsUrl ? (
        <div className="relative bg-black" style={{ aspectRatio: mux?.aspectRatio === "16:9" ? "16/9" : "9/16", maxHeight: "70vh" }}>
          <video
            ref={videoRef}
            src={hlsUrl}
            autoPlay
            loop
            muted={muted}
            playsInline
            controls
            className="w-full h-full object-contain"
          />
          <button
            onClick={() => setMuted((m) => !m)}
            className="absolute bottom-14 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.146 5.146a5 5 0 010 9.708v-1.717a3.001 3.001 0 000-6.274V5.146zm2.829-2.83a9 9 0 010 15.37l-.708-1.225a7 7 0 000-12.92l.708-1.225z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      ) : (
        // Image gallery
        <div>
          <div
            className="relative bg-black overflow-hidden"
            style={{ aspectRatio: "4/3", maxHeight: "60vh" }}
          >
            {media[imgIdx] && (
              <Image
                src={
                  media[imgIdx].r2Variants?.find((v) => v.variant === "large")?.url ??
                  media[imgIdx].r2Variants?.[0]?.url ??
                  media[imgIdx].imageUrl ??
                  media[imgIdx].thumbnailUrl ??
                  ""
                }
                alt={post.title}
                fill
                className="object-contain"
                priority
              />
            )}
          </div>
          {/* Dot indicators */}
          {media.length > 1 && (
            <div className="flex justify-center gap-1.5 py-2">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={[
                    "rounded-full transition-all",
                    i === imgIdx
                      ? "w-4 h-1.5 bg-primary"
                      : "w-1.5 h-1.5 bg-border",
                  ].join(" ")}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Content info ────────────────────────────────────────────── */}
      <div className="flex-1 px-4 pt-4 pb-28">
        {/* Price + stats row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {post.price && (
            <PriceTag
              amount={post.price.amount}
              currency={post.price.currency}
              negotiable={post.price.negotiable}
            />
          )}
          <StatRow
            likes={post.stats?.likes ?? 0}
            comments={post.stats?.comments ?? 0}
            views={post.stats?.views}
          />
        </div>

        {/* Title */}
        <h1 className="text-default font-bold text-base leading-snug mb-2">
          {post.title}
        </h1>

        {/* Caption */}
        {post.caption && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            {post.caption}
          </p>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.hashtags.map((tag) => (
              <span key={tag} className="text-primary text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Location + time */}
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-5">
          {post.location?.placeName && (
            <>
              <span className="flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {post.location.placeName}
              </span>
              <span>·</span>
            </>
          )}
          {post.createdAt != null && <span>{timeAgo(String(post.createdAt))}</span>}
        </div>

      </div>

      {/* ── Sticky bottom CTA ───────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-40 md:hidden"
        style={{
          maxWidth: "430px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          backgroundColor: "rgb(var(--color-bg-elevated) / 0.95)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderTop: "1px solid rgb(var(--color-border))",
        }}
      >
        <div className="px-4 pt-3 pb-1">
          <button
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-opacity active:opacity-80"
            style={{
              background: `linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary, var(--brand-primary))))`,
              boxShadow: "0 4px 20px rgb(var(--brand-primary) / 0.35)",
            }}
          >
            💬 Message Seller
          </button>
        </div>
      </div>
    </div>
  );
}
