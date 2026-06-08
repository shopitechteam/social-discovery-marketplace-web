"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { PostCard } from "./PostCard";
import { FeedSkeleton } from "./FeedSkeleton";
import { useFollowingFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

interface Props {
  lang: string;
}

function LoginWall({ lang }: { lang: string }) {
  // Encode the return destination so after login we come back to the following tab
  const returnTo = encodeURIComponent(`/${lang}/feed?tab=following`);

  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center px-6 text-center gap-5">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgb(var(--brand-primary) / 0.1)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="rgb(var(--brand-primary))" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div>
        <h3 className="font-bold text-base mb-1"
          style={{ color: "rgb(var(--color-text))" }}>
          Sign in to see your feed
        </h3>
        <p className="text-sm leading-relaxed max-w-xs"
          style={{ color: "rgb(var(--color-text-muted))" }}>
          Follow sellers and creators to see their latest posts here.
        </p>
      </div>
      <Link
        href={`/${lang}/auth/login?returnTo=${returnTo}`}
        className="px-7 py-3 rounded-full text-sm font-semibold text-white active:opacity-80 transition-opacity"
        style={{
          background: `linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))`,
          boxShadow: "0 4px 16px rgb(var(--brand-primary) / 0.35)",
        }}
      >
        Sign in
      </Link>
      <Link
        href={`/${lang}/auth/register?returnTo=${returnTo}`}
        className="text-sm font-medium"
        style={{ color: "rgb(var(--color-text-muted))" }}
      >
        No account? <span style={{ color: "rgb(var(--brand-primary))" }}>Create one</span>
      </Link>
    </div>
  );
}

export function FollowingGrid({ lang }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const { items, loading, hasMore, loadMore } = useFollowingFeed();

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    rootMargin: "600px",
  });

  if (!isAuthenticated) return <LoginWall lang={lang} />;

  if (loading && items.length === 0) return <FeedSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center px-6 text-center gap-4">
        <div className="text-5xl">👥</div>
        <h3 className="font-bold text-base mb-1"
          style={{ color: "rgb(var(--color-text))" }}>
          Follow sellers you love
        </h3>
        <p className="text-sm leading-relaxed"
          style={{ color: "rgb(var(--color-text-muted))" }}>
          Their latest listings will appear here once you follow someone.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-safe-area-inset-bottom pb-6">
      <div className="flex flex-col">
        {items.map((post, i) => (
          <PostCard key={post.id} post={post} lang={lang} priority={i < 3} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />

      {loading && items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "rgb(var(--brand-primary))", borderTopColor: "transparent" }} />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs py-6"
          style={{ color: "rgb(var(--color-text-muted))" }}>
          You&apos;re all caught up ✓
        </p>
      )}
    </div>
  );
}
