"use client";

import { memo, useCallback, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Flame, ImageIcon, Images, MapPin, Play } from "lucide-react";
import { SHIMMER_PORTRAIT } from "@/lib/shimmer";
import { contentPath } from "@/lib/content-url";
import { cn } from "@/lib/utils";
import { useAuthGuard } from "@/features/feed/hooks/useAuthGuard";
import { useSaveToggle } from "@/features/feed/hooks/useSaveToggle";
import {
  HoverVideoPreview,
  useHoverPreview,
} from "@/features/video/components/HoverVideoPreview";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

/**
 * Discovery tile for /explore.
 *
 * Design intent — this is a *discovery* surface, not a catalogue listing, and
 * 98% of the traffic is a thumb on a phone holding two columns. So:
 *
 *   · The photo is the product. It gets the whole tile, edge to edge, with no
 *     card border or panel behind it — chrome around 40 small tiles reads as a
 *     spreadsheet, not a feed.
 *   · Everything painted on the photo is a *reason to tap*: one context signal
 *     (live / popular / new / promoted, never more than one), where it is, and
 *     what kind of media it is. Nothing decorative.
 *   · Everything under the photo is the *decision*: price first (it aligns
 *     down the column so prices compare at a glance), then the title.
 *   · Vanity counters (views, raw save counts) and the seller name are gone.
 *     A "3 views" label is noise at best and discouraging at worst; the seller
 *     matters on the detail screen, not while scanning.
 *   · Save is reachable without leaving the grid — a 36px target in the corner,
 *     optimistic, so building a shortlist never costs a page load.
 *
 * The cover ratio stays uniform (3:4 phone, 4:5 md+) so rows align and the
 * infinite scroll never reflows under the thumb.
 */

/** Saves at or above this read as genuine traction, so the tile says so. */
const POPULAR_SAVES = 10;
/** Posts newer than this wear the "New" chip. */
const FRESH_HOURS = 24;

/** "KSh 12,500" — grouped thousands, no decimals. */
function formatPrice(amount: number, currency: string) {
  return `${currency} ${Math.round(amount).toLocaleString("en-KE")}`;
}

/** Seconds → "0:42" / "12:05". */
function formatDuration(seconds: number) {
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * "Nyandarua, Mairo-Inya" — county first, then the more specific area, both
 * spelled out in full. County leads because it is the unit a buyer actually
 * recognises and filters on; the area after it answers "where exactly".
 *
 * The pill truncates with an ellipsis when the pair is too wide for half a
 * phone screen, so a long chain degrades to the county rather than to nothing.
 * De-duped, so a listing whose area equals its county reads "Nairobi", never
 * "Nairobi, Nairobi".
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

type TileSignal = {
  label: string;
  icon?: typeof Flame;
  /** Live is the one signal urgent enough to break the glass-chip pattern. */
  urgent?: boolean;
  /** Promoted is disclosure, not a hook — it sits back. */
  quiet?: boolean;
};

/**
 * At most one chip, chosen by how much it should change the user's next tap.
 * Stacking badges is how a clean grid turns into a noticeboard.
 */
function tileSignal(post: ContentCardFieldsFragment): TileSignal | null {
  if (post.isLive) return { label: "Live", urgent: true };

  if ((post.stats?.saves ?? 0) >= POPULAR_SAVES)
    return { label: "Popular", icon: Flame };

  // `createdAt` is an opaque GraphQL scalar in the generated types.
  const created = post.createdAt
    ? new Date(post.createdAt as unknown as string).getTime()
    : NaN;
  if (
    Number.isFinite(created) &&
    Date.now() - created < FRESH_HOURS * 60 * 60 * 1000
  )
    return { label: "New" };

  if (post.boost?.isBoosted) return { label: "Promoted", quiet: true };

  return null;
}

/** Shared glass treatment for everything that floats over the photo. */
const GLASS =
  "inline-flex items-center gap-1 rounded-full bg-black/55 text-white backdrop-blur-[2px]";

function DiscoverGridCardImpl({
  post,
  lang,
  priority,
}: {
  post: ContentCardFieldsFragment;
  lang: string;
  priority: boolean;
}) {
  // Some legacy listings point at media that 404s. Without this the tile shows
  // the browser's broken-image chrome plus raw alt text — a dead tile in the
  // middle of a discovery grid. Fall back to the same neutral block we use when
  // there was never a thumbnail.
  const [imageFailed, setImageFailed] = useState(false);
  const thumb = getThumb(post);
  const isVideo = post.type === "VIDEO";
  const playbackId =
    post.media?.find((m) => m.muxMeta?.playbackId)?.muxMeta?.playbackId ?? null;
  const { previewing, bind } = useHoverPreview(isVideo && !!playbackId);
  const { requireAuth } = useAuthGuard(lang);
  const { saved, toggle } = useSaveToggle({
    contentId: post.id,
    initialSaved: post.isSavedByMe ?? false,
    initialCount: post.stats?.saves ?? 0,
  });

  const hasPrice = !!post.price && post.price.amount > 0;
  const priceText = hasPrice
    ? formatPrice(post.price.amount, post.price.currency)
    : "Ask price";
  const place = post.location ? locationLabel(post.location) : null;
  const signal = tileSignal(post);

  const durationSeconds =
    post.media?.find((m) => m.muxMeta?.duration)?.muxMeta?.duration ??
    post.tiktokEmbed?.duration ??
    null;
  const photoCount =
    post.media?.filter((m) => m.mediaType === "IMAGE").length ?? 0;
  const hasBottomRow = !!place || isVideo || photoCount > 1;

  // Screen readers get the whole decision in one label — the visual hierarchy
  // (price, then title, then place) doesn't survive being read tile by tile.
  const ariaLabel = [
    post.title,
    priceText,
    place,
  ]
    .filter(Boolean)
    .join(", ");

  const onSaveTap = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      // The tile is a Link; saving must not navigate.
      e.preventDefault();
      e.stopPropagation();
      if (!requireAuth({ contentId: post.id, action: "save" })) return;
      void toggle();
    },
    [post.id, requireAuth, toggle],
  );

  return (
    <Link
      href={contentPath(lang, post)}
      scroll={false}
      className="group block outline-none"
      aria-label={ariaLabel}
      {...bind}
    >
      {/* ---- Cover ---------------------------------------------------- */}
      <div
        className="relative aspect-3/4 w-full overflow-hidden rounded-xl transition-transform duration-200 group-focus-visible:ring-2 group-focus-visible:ring-primary group-active:scale-[0.98] md:aspect-4/5"
        style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
      >
        {thumb && !imageFailed ? (
          <Image
            src={
              post.media.filter((m) => m.mediaType === "IMAGE")[0]
                ?.r2Variants?.[0]?.url ??
              thumb ??
              "/images/placeholder.png"
            }
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={SHIMMER_PORTRAIT}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ color: "rgb(var(--color-text-placeholder))" }}
          >
            <ImageIcon size={22} strokeWidth={1.6} aria-hidden />
          </div>
        )}

        {/* Hover preview sits over the thumbnail, which stays mounted behind
            it so there's no flash while the stream spins up. Desktop only. */}
        {previewing && playbackId && (
          <HoverVideoPreview playbackId={playbackId} />
        )}

        {/* Scrim — just enough to keep the bottom row legible over a bright
            photo, and short enough that it never dims the product itself. Only
            drawn when there's actually something down there to read. */}
        {hasBottomRow && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
            aria-hidden
          />
        )}

        {/* Top-left: the one context signal. */}
        {signal && (
          <span
            className={cn(
              GLASS,
              "absolute left-1.5 top-1.5 h-6 px-2 text-[11px] font-semibold leading-none",
              signal.urgent && "bg-[#EF4444] backdrop-blur-none",
              signal.quiet && "font-medium text-white/80",
            )}
          >
            {signal.urgent && (
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"
                aria-hidden
              />
            )}
            {signal.icon && <signal.icon size={11} aria-hidden />}
            {signal.label}
          </span>
        )}

        {/* Top-right: save, without leaving the grid. */}
        <button
          type="button"
          onClick={onSaveTap}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : `Save ${post.title}`}
          className={cn(
            "absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-[2px] transition active:scale-90",
            saved ? "bg-white text-primary" : "bg-black/40 text-white",
          )}
        >
          <Bookmark
            size={16}
            strokeWidth={2.2}
            fill={saved ? "currentColor" : "none"}
            aria-hidden
          />
        </button>

        {/* Bottom row: where it is, and what kind of media it is. */}
        <div className="pointer-events-none absolute inset-x-1.5 bottom-1.5 flex items-end justify-between gap-1.5">
          {place ? (
            <span
              className={cn(
                GLASS,
                "h-6 min-w-0 max-w-full px-2 text-[11px] font-medium leading-none",
              )}
            >
              <MapPin size={11} strokeWidth={2.2} className="shrink-0" aria-hidden />
              <span className="truncate">{place}</span>
            </span>
          ) : (
            <span />
          )}

          {isVideo ? (
            <span
              className={cn(
                GLASS,
                "h-6 shrink-0 px-2 text-[11px] font-semibold leading-none tabular-nums",
              )}
            >
              <Play size={10} fill="currentColor" strokeWidth={0} aria-hidden />
              {durationSeconds ? formatDuration(durationSeconds) : "Video"}
            </span>
          ) : photoCount > 1 ? (
            <span
              className={cn(
                GLASS,
                "h-6 shrink-0 px-2 text-[11px] font-semibold leading-none tabular-nums",
              )}
            >
              <Images size={11} strokeWidth={2.2} aria-hidden />
              {photoCount}
            </span>
          ) : null}
        </div>
      </div>

      {/* ---- Decision ------------------------------------------------- */}
      <div className="px-0.5 pt-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className="truncate"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "rgb(var(--color-text-main))",
              letterSpacing: "-0.01em",
            }}
          >
            {priceText}
          </span>
          {post.price?.negotiable && hasPrice && (
            <span
              className="shrink-0 leading-none"
              style={{
                fontSize: "11px",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              Negotiable
            </span>
          )}
        </div>

        {post.title && (
          <p
            className="mt-0.5 line-clamp-2 leading-snug"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {post.title}
          </p>
        )}
      </div>
    </Link>
  );
}

// The Discover grid re-renders on every pagination/filter state change; memo
// keeps already-rendered tiles from re-rendering when pages append (Apollo
// cache items are referentially stable).
export const DiscoverGridCard = memo(DiscoverGridCardImpl);
