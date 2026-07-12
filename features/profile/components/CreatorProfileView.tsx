"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Eye,
  Link2,
  MapPin,
  Play,
  Share2,
  Video,
} from "lucide-react";
import { useQuery, useMutation } from "@apollo/client/react";
import { SHIMMER_AVATAR, SHIMMER_PORTRAIT } from "@/lib/shimmer";
import {
  GetUserPostsDocument,
  RecordProfileVisitDocument,
  type ProfileUserFieldsFragment,
  type ProfilePostFieldsFragment,
} from "@/types/__generated__/graphql";
import { useFollow } from "@/features/feed/hooks/useFollow";
import {
  HoverVideoPreview,
  useHoverPreview,
} from "@/features/video/components/HoverVideoPreview";
import { useAuthStore } from "@/stores/auth";
import { Skeleton } from "@/components/ui/skeleton";

function formatCompact(value: number | null | undefined) {
  if (value == null) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatDate(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "KSh 12,500" — grouped thousands, no decimals. */
function formatPrice(amount: number, currency: string) {
  return `${currency} ${Math.round(amount).toLocaleString("en-KE")}`;
}

/**
 * Readable location for a card: county first, then the more specific area, e.g.
 * "Nairobi, Westlands". Falls back gracefully and de-dupes when the area and
 * county are the same (so we never show "Nairobi, Nairobi").
 */
function locationLabel(loc: {
  placeName?: string | null;
  subregion?: string | null;
  county?: string | null;
}): string | null {
  const county = loc.county?.trim() || null;
  const area = loc.placeName?.trim() || loc.subregion?.trim() || null;
  const parts = [county, area].filter(
    (p, i, arr): p is string => Boolean(p) && arr.indexOf(p) === i, // drop falsy + duplicates
  );
  return parts.length ? parts.join(", ") : null;
}

function getThumb(post: ProfilePostFieldsFragment): string | null {
  const m = post.media?.[0];

  // For videos, fall back to a Mux-derived thumbnail when no stored cover exists.
  const muxPlaybackId = m?.muxMeta?.playbackId;
  const muxDerivedThumb = muxPlaybackId
    ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg?time=0&width=540&fit_mode=smartcrop`
    : null;

  return (
    m?.muxMeta?.thumbnailUrl ??
    m?.thumbnailUrl ??
    m?.r2Variants?.find((v) => v.variant === "thumbnail")?.url ??
    m?.r2Variants?.[0]?.url ??
    m?.url ??
    muxDerivedThumb ??
    null
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[rgb(229_231_235)] bg-[rgb(var(--color-bg-elevated)/0.82)] px-4 py-4 text-center shadow-sm sm:px-5">
      <span
        className="font-bold leading-tight"
        style={{ fontSize: "var(--text-lg)", color: "rgb(var(--color-text))" }}
      >
        {value}
      </span>
      <span
        className="mt-1 block"
        style={{
          fontSize: "var(--text-xs)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Post tile ─────────────────────────────────────────────────────────────────

function PostTile({
  post,
  lang,
  onShare,
  onCopyLink,
}: {
  post: ProfilePostFieldsFragment;
  lang: string;
  onShare: (post: ProfilePostFieldsFragment) => void;
  onCopyLink: (post: ProfilePostFieldsFragment) => void;
}) {
  const thumb = getThumb(post);
  const isVideo = post.type === "VIDEO";
  const playbackId = post.media?.[0]?.muxMeta?.playbackId ?? null;
  const { previewing, bind } = useHoverPreview(isVideo && !!playbackId);
  const [menuOpen, setMenuOpen] = useState(false);
  const priceText =
    post.price.amount <= 0
      ? "Custom"
      : formatPrice(post.price.amount, post.price.currency);
  const place = post.location ? locationLabel(post.location) : null;

  return (
    <div className="group overflow-hidden rounded-xl border border-[rgb(229_231_235)] bg-[rgb(var(--color-bg-elevated))]">
      {/* Thumbnail */}
      <div className="relative aspect-9/10" {...bind}>
        {/* Whole thumbnail navigates to content detail */}
        <Link
          href={`/${lang}/content/${post.id}`}
          scroll={false}
          className="absolute inset-0 z-10"
          aria-label={post.title}
        />

        {thumb && isVideo ? (
          <Image
            src={thumb}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 280px"
            placeholder="blur"
            blurDataURL={SHIMMER_PORTRAIT}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
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
              sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 280px"
              placeholder="blur"
              blurDataURL={SHIMMER_PORTRAIT}
            />
          </div>
        )}

        {/* Hover preview — under the z-10 Link overlay so clicks still
            navigate; the thumbnail stays mounted behind it. */}
        {previewing && playbackId && (
          <HoverVideoPreview playbackId={playbackId} />
        )}

        {/* Play affordance for video posts */}
        {isVideo && thumb && !previewing && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
              <Play
                size={20}
                fill="currentColor"
                strokeWidth={0}
                className="ml-0.5"
              />
            </span>
          </span>
        )}

        {/* Price badge — primary marketplace signal. pointer-events-none so the
            full-thumbnail Link overlay still handles taps. "Custom" when unpriced. */}
        <span
          className="pointer-events-none absolute bottom-2 left-2 z-20 rounded-lg bg-black/70 px-2 py-1 font-bold leading-none text-white backdrop-blur-sm"
          style={{ fontSize: "var(--text-sm)" }}
        >
          {priceText}
        </span>

        {/* action menu — sits above the Link overlay */}
        <div className="absolute right-2 top-2 z-20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen((v) => !v);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-white"
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                borderColor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
              aria-label="Post actions"
            >
              <span className="flex flex-col items-center gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block h-0.5 w-0.5 rounded-full bg-white"
                  />
                ))}
              </span>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-xl border py-1 shadow-xl"
                style={{
                  backgroundColor: "rgb(var(--color-bg-elevated))",
                  borderColor: "rgb(229 231 235)",
                }}
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  href={`/${lang}/content/${post.id}`}
                  scroll={false}
                  className="flex items-center gap-2 px-3 py-2 font-medium transition-colors hover:bg-surface"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--color-text))",
                  }}
                >
                  <Eye size={14} />
                  View
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onShare(post);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 font-medium transition-colors hover:bg-surface"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--color-text))",
                  }}
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onCopyLink(post);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 font-medium transition-colors hover:bg-surface"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--color-text))",
                  }}
                >
                  <Link2 size={14} />
                  Copy link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Meta — title / location / performance (matches /profile cards) */}
      <Link
        href={`/${lang}/content/${post.id}`}
        scroll={false}
        className="block p-2.5"
      >
        {post.title && (
          <p
            className="line-clamp-1 leading-tight"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text))",
              fontWeight: 600,
            }}
          >
            {post.title}
          </p>
        )}

        {/* Location — where the buyer would collect it */}
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

        {/* Performance — views lead (reach), saves signal buying intent */}
        <div
          className="mt-1.5 flex items-center gap-3"
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          <span className="flex items-center gap-1">
            <Eye size={12} /> {formatCompact(post.stats.views)}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark size={12} /> {formatCompact(post.stats.saves)}
          </span>
          <span className="ml-auto shrink-0">{formatDate(post.createdAt)}</span>
        </div>
      </Link>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  user: ProfileUserFieldsFragment;
  lang: string;
  isOwnProfile: boolean;
}

export function CreatorProfileView({ user, lang, isOwnProfile }: Props) {
  const router = useRouter();

  const firstName = user.profile?.firstName ?? "";
  const lastName = user.profile?.lastName ?? "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Creator";
  const initials =
    [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "?";
  const avatar = user.profile?.avatar;
  const hasTikTok = Boolean(user.tiktokOpenId);

  const {
    following,
    followerCount,
    toggle: toggleFollow,
    loading: followLoading,
  } = useFollow({
    userId: user.id,
    initialFollowing: user.isFollowedByMe ?? false,
    initialFollowerCount: user.followerCount ?? 0,
    lang,
  });

  // Record a profile visit once per mount. Requires login (so we can attribute
  // the visit to a real user) and skips the user's own profile. Fire-and-forget.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [recordProfileVisit] = useMutation(RecordProfileVisitDocument);
  const visitTrackedRef = useRef(false);
  useEffect(() => {
    if (isOwnProfile || !isAuthenticated || visitTrackedRef.current || !user.id)
      return;
    visitTrackedRef.current = true;
    recordProfileVisit({ variables: { userId: user.id } }).catch(() => {});
  }, [user.id, isOwnProfile, isAuthenticated, recordProfileVisit]);

  const {
    data,
    loading: postsLoading,
    fetchMore,
  } = useQuery(GetUserPostsDocument, {
    variables: { userId: user.id, limit: 18 },
    notifyOnNetworkStatusChange: true,
  });

  const posts = data?.userPosts.posts ?? [];
  const hasMore = data?.userPosts.hasMore ?? false;
  const nextCursor = data?.userPosts.nextCursor ?? undefined;

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fetchingMore = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !postsLoading &&
          !fetchingMore.current
        ) {
          fetchingMore.current = true;
          fetchMore({
            variables: { userId: user.id, limit: 18, afterId: nextCursor },
            updateQuery(prev, { fetchMoreResult }) {
              fetchingMore.current = false;
              if (!fetchMoreResult) return prev;
              return {
                userPosts: {
                  ...fetchMoreResult.userPosts,
                  posts: [
                    ...prev.userPosts.posts,
                    ...fetchMoreResult.userPosts.posts,
                  ],
                },
              };
            },
          });
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, postsLoading, nextCursor, fetchMore, user.id]);

  const handleShare = useCallback(
    (post: ProfilePostFieldsFragment) => {
      const url = `${window.location.origin}/${lang}/content/${post.id}`;
      if (navigator.share) {
        navigator.share({ title: post.title, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url).catch(() => {});
      }
    },
    [lang],
  );

  const handleCopyLink = useCallback(
    (post: ProfilePostFieldsFragment) => {
      const url = `${window.location.origin}/${lang}/content/${post.id}`;
      navigator.clipboard.writeText(url).catch(() => {});
    },
    [lang],
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "rgb(var(--color-bg))" }}
    >
      {/* ── Hero header — subtle brand wash (Tailwind gradient; inline-style
          gradients don't render in this build) ── */}
      <div className="border-b border-[rgb(229_231_235)] bg-linear-160 from-primary/10 from-0% to-background to-60%">
        <div className="w-full px-4 pb-6 pt-4 sm:px-6 lg:px-8 lg:pb-8 xl:px-10">
          {/* Back button */}
          <div>
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-1.5 font-semibold transition-opacity active:opacity-60 lg:mb-6"
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--color-text))",
              }}
              aria-label="Go back"
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
              Back
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:gap-6">
            <div className="flex items-start gap-4 lg:flex-col lg:items-center lg:rounded-[28px] lg:border lg:border-[rgb(229_231_235)] lg:bg-[rgb(var(--color-bg-elevated)/0.78)] lg:p-6 lg:text-center lg:shadow-sm">
              <div
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-elevated sm:h-24 sm:w-24 lg:h-32 lg:w-32 ${
                  avatar
                    ? "bg-surface"
                    : "bg-linear-135 from-primary via-secondary via-60% to-accent"
                }`}
                style={{
                  boxShadow: "0 12px 32px rgb(var(--brand-primary) / 0.18)",
                }}
              >
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName}
                    fill
                    sizes="(max-width: 1023px) 96px, 128px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={SHIMMER_AVATAR}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      className="select-none font-bold text-white"
                      style={{ fontSize: "var(--text-xl)" }}
                    >
                      {initials}
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 pt-1 lg:flex lg:w-full lg:flex-col lg:items-center lg:pt-0">
                <div className="flex flex-wrap items-center gap-2 lg:justify-center">
                  <h1
                    className="truncate font-bold"
                    style={{
                      fontSize: "var(--text-xl)",
                      color: "rgb(var(--color-text))",
                    }}
                  >
                    {displayName}
                  </h1>
                  {user.isVerified && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="shrink-0"
                      aria-label="Verified"
                    >
                      <circle cx="10" cy="10" r="10" fill="#1D9BF0" />
                      <path
                        d="M6 10.5l2.5 2.5 5.5-5.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                {user.username && (
                  <p
                    className="mt-0.5"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "rgb(var(--color-text-muted))",
                    }}
                  >
                    @{user.username}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 lg:justify-center">
                  {!isOwnProfile && (
                    <button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className={[
                        "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-60",
                        following
                          ? "bg-surface text-muted-foreground"
                          : "bg-primary/10 text-primary hover:bg-primary/20",
                      ].join(" ")}
                    >
                      {following ? (
                        "Following"
                      ) : (
                        <>
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                          </svg>
                          Follow
                        </>
                      )}
                    </button>
                  )}

                  {hasTikTok && (
                    <a
                      href={`https://www.tiktok.com/@${user.username ?? ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[rgb(229_231_235)] bg-[rgb(var(--color-bg-elevated))] px-3 font-semibold transition-opacity active:opacity-75"
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "rgb(var(--color-text))",
                      }}
                    >
                      <Video size={14} strokeWidth={2.2} />
                      TikTok
                      <ExternalLink
                        size={12}
                        strokeWidth={2}
                        style={{ color: "rgb(var(--color-text-muted))" }}
                      />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:rounded-[28px] lg:border lg:border-[rgb(229_231_235)] lg:bg-[rgb(var(--color-bg-elevated)/0.72)] lg:p-6 lg:shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Seller profile
                </span>
                {user.isVerified && (
                  <span
                    className="inline-flex items-center rounded-full border border-[rgb(229_231_235)] px-3 py-1 text-xs font-semibold"
                    style={{ color: "rgb(var(--color-text-muted))" }}
                  >
                    Verified account
                  </span>
                )}
              </div>

              {user.profile?.bio && (
                <p
                  className="mt-4 leading-snug"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--color-text))",
                    maxWidth: "42rem",
                  }}
                >
                  {user.profile.bio}
                </p>
              )}
              {user.profile?.website && (
                <a
                  href={
                    user.profile.website.startsWith("http")
                      ? user.profile.website
                      : `https://${user.profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 font-semibold"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--brand-accent))",
                  }}
                >
                  <ExternalLink size={13} strokeWidth={2.2} />
                  {user.profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3 lg:mt-6 lg:max-w-3xl">
                <StatCard
                  label="Followers"
                  value={formatCompact(followerCount)}
                />
                <StatCard
                  label="Views"
                  value={formatCompact(user.totalViews)}
                />
                <StatCard
                  label="Listings"
                  value={formatCompact(user.postCount)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="w-full px-4 pb-12 sm:px-6 lg:px-8 xl:px-10">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="font-bold"
            style={{
              fontSize: "var(--text-base)",
              color: "rgb(var(--color-text))",
            }}
          >
            Storefront
          </h2>
          <span
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {posts.length} shown
          </span>
        </div>

        {postsLoading && posts.length === 0 ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-3 xl:grid-cols-5 min-[90rem]:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-9/10 rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: "rgb(var(--color-bg-elevated))",
                borderColor: "rgb(229 231 235)",
              }}
            >
              <Play
                size={22}
                strokeWidth={1.8}
                style={{ color: "rgb(var(--brand-primary))" }}
              />
            </div>
            <p
              className="font-semibold"
              style={{
                fontSize: "var(--text-base)",
                color: "rgb(var(--color-text))",
              }}
            >
              No listings yet
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-3 xl:grid-cols-5 min-[90rem]:grid-cols-6">
              {posts.map((post) => (
                <PostTile
                  key={post.id}
                  post={post}
                  lang={lang}
                  onShare={handleShare}
                  onCopyLink={handleCopyLink}
                />
              ))}
            </div>

            {/* Infinite scroll sentinel — triggers next page fetch */}
            <div ref={sentinelRef} className="h-1" />

            {/* Skeleton tiles while fetching the next page */}
            {postsLoading && posts.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:gap-3 xl:grid-cols-5 min-[90rem]:grid-cols-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-9/10 rounded-xl" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
