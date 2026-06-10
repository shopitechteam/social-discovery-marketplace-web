"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Heart,
  Image as ImageIcon,
  Link2,
  Play,
  Share2,
  Video,
} from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { SHIMMER_AVATAR, SHIMMER_PORTRAIT } from "@/lib/shimmer";
import {
  GetUserPostsDocument,
  type ProfileUserFieldsFragment,
  type ProfilePostFieldsFragment,
} from "@/types/__generated__/graphql";
import { useFollow } from "@/features/feed/hooks/useFollow";

function formatCompact(value: number | null | undefined) {
  if (value == null) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function getThumb(post: ProfilePostFieldsFragment): string | null {
  const m = post.media?.[0];
  return (
    m?.muxMeta?.thumbnailUrl ??
    m?.thumbnailUrl ??
    m?.r2Variants?.find((v) => v.variant === "thumbnail")?.url ??
    m?.r2Variants?.[0]?.url ??
    m?.url ??
    null
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="font-bold leading-tight"
        style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-lg)" }}
      >
        {value}
      </span>
      <span style={{ color: "rgb(var(--color-text-muted))", fontSize: "var(--text-xs)" }}>
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-xl border"
      style={{
        aspectRatio: "9/16",
        backgroundColor: "rgb(var(--color-bg-subtle))",
        borderColor: "rgb(var(--color-border))",
      }}
    >
      {/* Whole tile navigates to content detail — z-10 sits above the image */}
      <Link
        href={`/${lang}/content/${post.id}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
      />

      {thumb ? (
        <Image
          src={thumb}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 32vw, 200px"
          placeholder="blur"
          blurDataURL={SHIMMER_PORTRAIT}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon size={24} style={{ color: "rgb(var(--color-text-placeholder))" }} />
        </div>
      )}

      {/* gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%, rgba(0,0,0,0.2))",
        }}
      />

      {/* type badge */}
      <div className="absolute left-2 top-2 pointer-events-none">
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-lg border text-white"
          style={{
            backgroundColor: "rgba(0,0,0,0.45)",
            borderColor: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
          }}
        >
          {isVideo ? (
            <Play size={12} fill="currentColor" strokeWidth={0} />
          ) : (
            <ImageIcon size={12} strokeWidth={2} />
          )}
        </span>
      </div>

      {/* action menu — sits above the Link overlay */}
      <div className="absolute right-2 top-2 z-20 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
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
                <span key={i} className="block h-0.5 w-0.5 rounded-full bg-white" />
              ))}
            </span>
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-xl border py-1 shadow-xl"
              style={{
                backgroundColor: "rgb(var(--color-bg-elevated))",
                borderColor: "rgb(var(--color-border))",
              }}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                href={`/${lang}/content/${post.id}`}
                className="flex items-center gap-2 px-3 py-2 font-medium transition-colors hover:bg-surface"
                style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-sm)" }}
              >
                <Eye size={14} />
                View
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); onShare(post); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 font-medium transition-colors hover:bg-surface"
                style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-sm)" }}
              >
                <Share2 size={14} />
                Share
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onCopyLink(post); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 font-medium transition-colors hover:bg-surface"
                style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-sm)" }}
              >
                <Link2 size={14} />
                Copy link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* stats */}
      <div className="absolute inset-x-0 bottom-0 z-0 p-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-white" style={{ fontSize: "var(--text-xs)" }}>
            <Eye size={11} strokeWidth={2.2} />
            {formatCompact(post.stats.views)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-white" style={{ fontSize: "var(--text-xs)" }}>
            <Heart size={11} strokeWidth={2.2} />
            {formatCompact(post.stats.likes)}
          </span>
        </div>
      </div>
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
    [firstName, lastName].filter(Boolean).join(" ") || user.username || "Creator";
  const initials =
    [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "?";
  const avatar = user.profile?.avatar;
  const hasTikTok = Boolean(user.tiktokOpenId);

  const { following, followerCount, toggle: toggleFollow, loading: followLoading } = useFollow({
    userId: user.id,
    initialFollowing: user.isFollowedByMe ?? false,
    initialFollowerCount: user.followerCount ?? 0,
    lang,
  });

  const { data, loading: postsLoading, fetchMore } = useQuery(GetUserPostsDocument, {
    variables: { userId: user.id, limit: 18 },
    notifyOnNetworkStatusChange: true,
  });

  const posts = data?.userPosts.posts ?? [];
  const hasMore = data?.userPosts.hasMore ?? false;
  const nextCursor = data?.userPosts.nextCursor ?? undefined;

  const handleShare = useCallback((post: ProfilePostFieldsFragment) => {
    const url = `${window.location.origin}/${lang}/content/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }, [lang]);

  const handleCopyLink = useCallback((post: ProfilePostFieldsFragment) => {
    const url = `${window.location.origin}/${lang}/content/${post.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }, [lang]);

  function loadMore() {
    fetchMore({
      variables: { userId: user.id, limit: 18, afterId: nextCursor },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) return prev;
        return {
          userPosts: {
            ...fetchMoreResult.userPosts,
            posts: [...prev.userPosts.posts, ...fetchMoreResult.userPosts.posts],
          },
        };
      },
    });
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "rgb(var(--color-bg))" }}>
      {/* ── Hero header ── */}
      <div
        style={{
          background: "linear-gradient(160deg, rgb(var(--brand-primary) / 0.08) 0%, rgb(var(--color-bg)) 60%)",
        }}
      >
        <div className="mx-auto max-w-2xl px-4 pb-6 pt-4 sm:px-6">

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-1.5 font-semibold transition-opacity active:opacity-60"
            style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-sm)" }}
            aria-label="Go back"
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
            Back
          </button>

          {/* Avatar + name row */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 sm:h-24 sm:w-24"
              style={{
                background: avatar
                  ? "rgb(var(--color-bg-subtle))"
                  : "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)) 60%, rgb(var(--brand-accent)))",
                borderColor: "rgb(var(--color-bg-elevated))",
                boxShadow: "0 12px 32px rgb(var(--brand-primary) / 0.18)",
              }}
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt={displayName}
                  fill
                  sizes="96px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={SHIMMER_AVATAR}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="select-none font-bold text-white" style={{ fontSize: "var(--text-xl)" }}>
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="truncate font-bold"
                  style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-xl)" }}
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
                <p className="mt-0.5" style={{ color: "rgb(var(--color-text-muted))", fontSize: "var(--text-sm)" }}>
                  @{user.username}
                </p>
              )}

              {/* CTA buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {/* Follow — hidden for own profile */}
                {!isOwnProfile && (
                  <button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={[
                      "flex items-center gap-1 text-[13px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 disabled:opacity-60",
                      following
                        ? "text-muted-foreground bg-surface"
                        : "text-primary bg-primary/10 hover:bg-primary/20",
                    ].join(" ")}
                  >
                    {following ? (
                      "Following"
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
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
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-semibold transition-opacity active:opacity-75"
                    style={{
                      backgroundColor: "rgb(var(--color-bg-elevated))",
                      borderColor: "rgb(var(--color-border))",
                      color: "rgb(var(--color-text))",
                      fontSize: "var(--text-sm)",
                    }}
                  >
                    <Video size={14} strokeWidth={2.2} />
                    TikTok
                    <ExternalLink size={12} strokeWidth={2} style={{ color: "rgb(var(--color-text-muted))" }} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.profile?.bio && (
            <p
              className="mt-4 leading-snug"
              style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-sm)", maxWidth: "36rem" }}
            >
              {user.profile.bio}
            </p>
          )}
          {user.profile?.website && (
            <a
              href={user.profile.website.startsWith("http") ? user.profile.website : `https://${user.profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 font-semibold"
              style={{ color: "rgb(var(--brand-accent))", fontSize: "var(--text-sm)" }}
            >
              <ExternalLink size={13} strokeWidth={2.2} />
              {user.profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}

          {/* Stats row */}
          <div
            className="mt-5 flex items-center justify-around rounded-2xl border px-4 py-4"
            style={{
              backgroundColor: "rgb(var(--color-bg-elevated) / 0.82)",
              borderColor: "rgb(var(--color-border))",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <StatPill label="Followers" value={formatCompact(followerCount)} />
            <div className="h-8 w-px" style={{ backgroundColor: "rgb(var(--color-border))" }} />
            <StatPill label="Following" value={formatCompact(user.followingCount)} />
            <div className="h-8 w-px" style={{ backgroundColor: "rgb(var(--color-border))" }} />
            <StatPill label="Posts" value={formatCompact(user.postCount)} />
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="mx-auto max-w-2xl px-4 pb-12 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold" style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-base)" }}>
            Posts
          </h2>
          <span style={{ color: "rgb(var(--color-text-muted))", fontSize: "var(--text-sm)" }}>
            {posts.length} shown
          </span>
        </div>

        {postsLoading && posts.length === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl"
                style={{ aspectRatio: "9/16", backgroundColor: "rgb(var(--color-bg-subtle))" }}
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border"
              style={{ backgroundColor: "rgb(var(--color-bg-elevated))", borderColor: "rgb(var(--color-border))" }}
            >
              <Play size={22} strokeWidth={1.8} style={{ color: "rgb(var(--brand-primary))" }} />
            </div>
            <p className="font-semibold" style={{ color: "rgb(var(--color-text))", fontSize: "var(--text-base)" }}>
              No posts yet
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
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

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={postsLoading}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border px-6 font-semibold transition-opacity active:opacity-75 disabled:opacity-50"
                  style={{
                    backgroundColor: "rgb(var(--color-bg-elevated))",
                    borderColor: "rgb(var(--color-border))",
                    color: "rgb(var(--color-text))",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {postsLoading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
