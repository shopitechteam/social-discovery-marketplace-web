"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useAppBack } from "@/lib/useAppBack";
import { DiscoverGridCard } from "@/features/discover/components/DiscoverGridCard";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Video,
} from "lucide-react";
import { useQuery, useMutation } from "@apollo/client/react";
import { SHIMMER_AVATAR } from "@/lib/shimmer";
import {
  GetUserPostsDocument,
  RecordProfileVisitDocument,
  type ContentCardFieldsFragment,
  type ProfileUserFieldsFragment,
} from "@/types/__generated__/graphql";
import { useFollow } from "@/features/feed/hooks/useFollow";
import { useAuthStore } from "@/stores/auth";
import { trackSellerEvent } from "@/lib/seller-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { appendUnique } from "../lib/appendUnique";

function formatCompact(value: number | null | undefined) {
  if (value == null) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

/** "KSh 12,500" — grouped thousands, no decimals. */
/**
 * Readable location for a card: county first, then the more specific area, e.g.
 * "Nairobi, Westlands". Falls back gracefully and de-dupes when the area and
 * county are the same (so we never show "Nairobi, Nairobi").
 */
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

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  user: ProfileUserFieldsFragment;
  lang: string;
  isOwnProfile: boolean;
  /**
   * First storefront page rendered on the server (public profile route). Shown
   * until the client query answers, so the grid — and its links to every
   * listing — is in the HTML crawlers read instead of arriving after JS.
   */
  initialPosts?: ContentCardFieldsFragment[];
}

export function CreatorProfileView({
  user,
  lang,
  isOwnProfile,
  initialPosts,
}: Props) {
  // A profile link opened from outside has no app history to return to, so
  // back would be a dead button. Send those to the feed.
  const goBack = useAppBack(`/${lang}/feed`);

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

  // Funnel analytics: every visitor, signed in or not (the visit above only
  // sees signed-in users). The API ignores sellers it isn't tracking.
  const funnelViewTrackedRef = useRef<string | null>(null);
  useEffect(() => {
    if (isOwnProfile || !user.id || funnelViewTrackedRef.current === user.id) return;
    funnelViewTrackedRef.current = user.id;
    trackSellerEvent({ type: "PROFILE_VIEW", sellerId: user.id });
  }, [user.id, isOwnProfile]);

  const {
    data,
    loading: postsLoading,
    fetchMore,
  } = useQuery(GetUserPostsDocument, {
    variables: { userId: user.id, limit: 18 },
    notifyOnNetworkStatusChange: true,
  });

  const posts = data?.userPosts.posts ?? initialPosts ?? [];
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
                  posts: appendUnique(
              prev.userPosts.posts,
              fetchMoreResult.userPosts.posts,
            ),
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
              onClick={goBack}
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

              {/* Followers and listings only. Total views is deliberately not
                  shown to shoppers: on a young marketplace a new seller's real
                  figure reads as "nobody comes here", which undercuts the
                  seller we are trying to send buyers to. The seller still sees
                  it on their own profile and in analytics — `user.totalViews`
                  is still fetched, just not surfaced here. */}
              <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:mt-6 lg:max-w-2xl">
                <StatCard
                  label="Followers"
                  value={formatCompact(followerCount)}
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
            {/* The same tile as /explore and the Saved tab, so a listing looks
                identical wherever it is browsed. */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6 xl:grid-cols-4 min-[90rem]:grid-cols-5">
              {posts.map((post, index) => (
                <DiscoverGridCard
                  key={post.id}
                  post={post}
                  lang={lang}
                  priority={index < 4}
                />
              ))}
            </div>

            {/* Infinite scroll sentinel — triggers next page fetch */}
            <div ref={sentinelRef} className="h-1" />

            {/* Skeleton tiles while fetching the next page */}
            {/* Only for a real next-page fetch — not while the client's first
                query refreshes the server-rendered page. */}
            {postsLoading && Boolean(data) && posts.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6 xl:grid-cols-4 min-[90rem]:grid-cols-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-3/4 w-full rounded-xl md:aspect-4/5" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
