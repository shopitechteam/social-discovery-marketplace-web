"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Eye, MapPin, Play } from "lucide-react";
import { SHIMMER_PORTRAIT } from "@/lib/shimmer";
import {
  HoverVideoPreview,
  useHoverPreview,
} from "@/features/video/components/HoverVideoPreview";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

/**
 * Compact discovery tile — the RedNote-style explore card. Mirrors the profile
 * grid tile (`PostThumbnail`) but takes the discover feed's
 * `ContentCardFieldsFragment`. Every tile uses the same fixed cover ratio so the
 * two-column grid stays uniform (no staggered/masonry heights).
 */

// Uniform cover ratio for every tile — keeps the grid rows aligned. Portrait
// 3:4 on mobile; a shorter 4:5 on md+ where the denser grid suits flatter
// tiles.

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

/** "KSh 12,500" — grouped thousands, no decimals. */
function formatPrice(amount: number, currency: string) {
  return `${currency} ${Math.round(amount).toLocaleString("en-KE")}`;
}

/**
 * Readable location for a card: county first, then the more specific area, e.g.
 * "Nairobi, Westlands". De-dupes so we never show "Nairobi, Nairobi".
 */
function locationLabel(loc: {
  placeName?: string | null;
  subregion?: string | null;
  county?: string | null;
}): string | null {
  const county = loc.county?.trim() || null;
  const area = loc.placeName?.trim() || loc.subregion?.trim() || null;
  const parts = [county, area].filter(
    (p, i, arr): p is string => Boolean(p) && arr.indexOf(p) === i,
  );
  return parts.length ? parts.join(", ") : null;
}

function getThumb(post: ContentCardFieldsFragment): string | null {
  const first = post.media?.[0];
  const muxPlaybackId = first?.muxMeta?.playbackId;
  const muxDerivedThumb = muxPlaybackId
    ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?time=0&width=540&fit_mode=smartcrop`
    : null;

  return (
    first?.muxMeta?.thumbnailUrl ??
    first?.thumbnailUrl ??
    first?.r2Variants?.find((v) => v.variant === "medium")?.url ??
    first?.r2Variants?.[0]?.url ??
    first?.url ??
    first?.imageUrl ??
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

function DiscoverGridCardImpl({
  post,
  lang,
  priority,
}: {
  post: ContentCardFieldsFragment;
  lang: string;
  priority: boolean;
}) {
  const thumb = getThumb(post);
  const isVideo = post.type === "VIDEO";
  const playbackId =
    post.media?.find((m) => m.muxMeta?.playbackId)?.muxMeta?.playbackId ?? null;
  const { previewing, bind } = useHoverPreview(isVideo && !!playbackId);
  const priceText =
    !post.price || post.price.amount <= 0
      ? "Custom"
      : formatPrice(post.price.amount, post.price.currency);
  const place = post.location ? locationLabel(post.location) : null;
  const creator = post.creator;
  const creatorName = creator?.profile?.firstName
    ? `${creator.profile.firstName}${creator.profile.lastName ? " " + creator.profile.lastName : ""}`
    : (creator?.username ?? null);

  return (
    <Link
      href={`/${lang}/content/${post.id}`}
      scroll={false}
      className="group block overflow-hidden rounded-2xl border outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        borderColor: "rgb(var(--color-border))",
        backgroundColor: "rgb(var(--color-bg-elevated))",
      }}
      aria-label={post.title}
      {...bind}
    >
      {/* Cover */}
      <div className="relative aspect-3/4 w-full bg-surface md:aspect-4/5">
        {thumb ? (
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={SHIMMER_PORTRAIT}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            <MapPin size={24} aria-hidden />
          </div>
        )}

        {/* Hover preview sits over the thumbnail, which stays mounted behind
            it so there's no flash while the stream spins up. */}
        {previewing && playbackId && (
          <HoverVideoPreview playbackId={playbackId} />
        )}

        {isVideo && thumb && !previewing && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white">
              <Play
                size={18}
                fill="currentColor"
                strokeWidth={0}
                className="ml-0.5"
              />
            </span>
          </span>
        )}

        {/* Price badge — the primary marketplace signal */}
        <span
          className="absolute bottom-2 left-2 rounded-lg bg-black/70 px-2 py-1 font-bold leading-none text-white backdrop-blur-sm"
          style={{ fontSize: "var(--text-sm)" }}
        >
          {priceText}
        </span>
      </div>

      {/* Meta */}
      <div className="p-2.5">
        {post.title && (
          <p
            className="line-clamp-1 leading-snug"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text))",
              fontWeight: 600,
            }}
          >
            {post.title}
          </p>
        )}

        {place && (
          <p
            className="mt-1 flex items-center gap-1 line-clamp-1"
            style={{
              fontSize: "var(--text-xs)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            <MapPin size={12} aria-hidden className="shrink-0" />
            <span className="truncate">{place}</span>
          </p>
        )}

        <div
          className="mt-1.5 flex items-center gap-3"
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          {creatorName ? <span className="truncate">{creatorName}</span> : null}
          <span className="ml-auto flex shrink-0 items-center gap-3">
            <StatChip icon={Eye} value={post.stats?.views ?? 0} />
            <StatChip icon={Bookmark} value={post.stats?.saves ?? 0} />
          </span>
        </div>
      </div>
    </Link>
  );
}

// The Discover grid re-renders on every pagination/filter state change; memo
// keeps already-rendered tiles from re-rendering when pages append (Apollo
// cache items are referentially stable).
export const DiscoverGridCard = memo(DiscoverGridCardImpl);
