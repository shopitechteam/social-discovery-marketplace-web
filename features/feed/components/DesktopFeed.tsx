"use client";

/**
 * DesktopFeed — desktop (md+) feed experience.
 *
 * Layout: a centered feed column (the same PostCards used on mobile, so every
 * interaction keeps working) with a sticky right rail showing Trending. Tabs
 * (For You / Following / Nearby) sit at the top of the column. The SideNav
 * (rendered by the main layout) sits to the left.
 *
 *   ┌──────────┬──────────────────────┬──────────────┐
 *   │ SideNav  │  [tabs]              │  Trending     │
 *   │ (layout) │  PostCard            │  (sticky)     │
 *   │          │  PostCard            │               │
 *   └──────────┴──────────────────────┴──────────────┘
 */

import { useState } from "react";
import Link from "next/link";
import { useForYouFeed, useFollowingFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAuthStore } from "@/stores/auth";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./FeedSkeleton";
import { DesktopTrendingRail } from "./DesktopTrendingRail";
import { DesktopNearbyColumn } from "./DesktopNearbyColumn";

type Tab = "for-you" | "following" | "nearby";

const TABS: { id: Tab; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "nearby", label: "Nearby" },
];

// ── Shared column chrome ─────────────────────────────────────────────────────

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-3xl border border-default bg-elevated"
        >
          <PostCardSkeleton />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  body,
  action,
}: {
  emoji: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-default bg-elevated px-6 py-20 text-center">
      <div className="text-5xl">{emoji}</div>
      <div>
        <h3 className="mb-1 text-lg font-bold text-default">{title}</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
      {action}
    </div>
  );
}

/** A PostCard wrapped in the desktop card chrome (rounded, bordered). */
function DesktopPostCard({
  post,
  lang,
  priority,
}: {
  post: Parameters<typeof PostCard>[0]["post"];
  lang: string;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-default bg-elevated shadow-sm">
      <PostCard post={post} lang={lang} priority={priority} />
    </div>
  );
}

// ── For You column ───────────────────────────────────────────────────────────

function ForYouColumn({ lang }: { lang: string }) {
  const { items, loading, hasMore, loadMore } = useForYouFeed();
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    rootMargin: "1400px",
  });

  if (loading && items.length === 0) return <ColumnSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        emoji="🛍️"
        title="Your feed is empty"
        body="Follow sellers or explore categories to see content here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((post, i) => (
        <DesktopPostCard key={post.id} post={post} lang={lang} priority={i < 2} />
      ))}
      <div ref={sentinelRef} className="h-1" />
      {loading && items.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-default bg-elevated">
          <PostCardSkeleton />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          You&apos;re all caught up ✓
        </p>
      )}
    </div>
  );
}

// ── Following column ─────────────────────────────────────────────────────────

function FollowingColumn({ lang }: { lang: string }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const { items, loading, hasMore, loadMore } = useFollowingFeed();
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    rootMargin: "1400px",
  });

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(`/${lang}/feed?tab=following`);
    return (
      <EmptyState
        emoji="👥"
        title="Sign in to see your feed"
        body="Follow sellers and creators to see their latest posts here."
        action={
          <div className="flex flex-col items-center gap-3">
            <Link
              href={`/${lang}/auth/login?returnTo=${returnTo}`}
              className="rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity active:opacity-80"
              style={{
                background:
                  "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
                boxShadow: "0 4px 16px rgb(var(--brand-primary) / 0.35)",
              }}
            >
              Sign in
            </Link>
            <Link
              href={`/${lang}/auth/register?returnTo=${returnTo}`}
              className="text-sm font-medium text-muted-foreground"
            >
              No account?{" "}
              <span style={{ color: "rgb(var(--brand-primary))" }}>
                Create one
              </span>
            </Link>
          </div>
        }
      />
    );
  }

  if (loading && items.length === 0) return <ColumnSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        emoji="👥"
        title="Follow sellers you love"
        body="Their latest listings will appear here once you follow someone."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((post, i) => (
        <DesktopPostCard key={post.id} post={post} lang={lang} priority={i < 2} />
      ))}
      <div ref={sentinelRef} className="h-1" />
      {loading && items.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-default bg-elevated">
          <PostCardSkeleton />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          You&apos;re all caught up ✓
        </p>
      )}
    </div>
  );
}

// ── Main DesktopFeed ─────────────────────────────────────────────────────────

export default function DesktopFeed({ lang = "en" }: { lang?: string }) {
  const [tab, setTab] = useState<Tab>("for-you");

  return (
    <div className="min-h-svh bg-app">
      <div className="mx-auto grid w-full max-w-275 grid-cols-1 gap-8 px-6 py-6 lg:grid-cols-[minmax(0,640px)_minmax(280px,1fr)]">
        {/* ── Feed column ───────────────────────────────────────────── */}
        <div className="min-w-0">
          {/* Tabs — sticky so they stay reachable while scrolling */}
          <div className="sticky top-0 z-20 -mx-1 mb-4 bg-app/80 px-1 pb-2 pt-1 backdrop-blur-md">
            <div className="flex items-center gap-1 rounded-full border border-default bg-elevated p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                  className={[
                    "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                    tab === t.id
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-default",
                  ].join(" ")}
                  style={
                    tab === t.id
                      ? { backgroundColor: "rgb(var(--brand-primary))" }
                      : undefined
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "for-you" && <ForYouColumn lang={lang} />}
          {tab === "following" && <FollowingColumn lang={lang} />}
          {tab === "nearby" && <DesktopNearbyColumn lang={lang} />}
        </div>

        {/* ── Right rail ────────────────────────────────────────────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <DesktopTrendingRail lang={lang} />
          </div>
        </aside>
      </div>
    </div>
  );
}
