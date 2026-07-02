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

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForYouFeed, useFollowingFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAuthStore } from "@/stores/auth";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./FeedSkeleton";
import { DesktopTrendingRail } from "./DesktopTrendingRail";
import { TrendingStrip } from "./TrendingStrip";
import { DesktopNearbyColumn } from "./DesktopNearbyColumn";
import { FeedChatProvider } from "./FeedChatContext";
import { InlineChatPanel } from "@/features/messaging/components/InlineChatPanel";

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
          className="overflow-hidden rounded-2xl border border-default bg-elevated"
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
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-default bg-elevated px-6 py-20 text-center">
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
    <div className="overflow-hidden rounded-2xl border border-default bg-elevated shadow-sm shadow-black/5 dark:shadow-black/25">
      <PostCard post={post} lang={lang} priority={priority} />
    </div>
  );
}

// ── For You column ───────────────────────────────────────────────────────────

function ForYouColumn({ lang }: { lang: string }) {
  const { items, loading, loadingMore, hasMore, loadMore } = useForYouFeed();
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    // Block the sentinel during the initial load AND while a page is in flight,
    // otherwise it re-fires repeatedly and pagination spins without loading.
    loading: loading || loadingMore,
    onLoadMore: loadMore,
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
      {loadingMore && (
        <div className="overflow-hidden rounded-2xl border border-default bg-elevated">
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
  const { items, loading, loadingMore, hasMore, loadMore } = useFollowingFeed();
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMore,
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
      {loadingMore && (
        <div className="overflow-hidden rounded-2xl border border-default bg-elevated">
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
  // When set, the right rail shows the inline chat for this post instead of the
  // trending rail, and widens to give the conversation more room.
  const [chatContentId, setChatContentId] = useState<string | null>(null);
  // The originating post card — watched so the chat auto-closes once that post
  // scrolls out of view.
  const anchorRef = useRef<HTMLElement | null>(null);

  const closeChat = useCallback(() => {
    anchorRef.current = null;
    setChatContentId(null);
  }, []);

  const openChat = useCallback(
    (contentId: string, anchor: HTMLElement | null) => {
      anchorRef.current = anchor;
      setChatContentId(contentId);
    },
    [],
  );

  const chatOpen = chatContentId !== null;

  // Close the chat when the post it was opened from scrolls out of view.
  useEffect(() => {
    const anchor = anchorRef.current;
    if (!chatOpen || !anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) closeChat();
      },
      // A little negative margin so it closes as the card clears the viewport,
      // not the instant its last pixel leaves.
      { rootMargin: "-10% 0px -10% 0px", threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [chatOpen, chatContentId, closeChat]);

  return (
    <FeedChatProvider value={openChat}>
      <div className="min-h-svh bg-app">
        <div className="mx-auto w-full max-w-[1680px] px-4 py-4 md:px-6 md:py-6 xl:px-8">
          <div
            className={[
              "grid grid-cols-1 gap-6 xl:items-start transition-[grid-template-columns] duration-300 ease-out",
              chatOpen
                ? "xl:grid-cols-[minmax(0,1fr)_minmax(420px,480px)]"
                : "xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]",
            ].join(" ")}
          >
            {/* ── Feed column ───────────────────────────────────────────── */}
            <div className="min-w-0 w-full max-w-[780px] mx-auto xl:max-w-none xl:mx-0">
              <div className="xl:hidden mb-4">
                <TrendingStrip lang={lang} />
              </div>

              <div className="sticky top-0 z-20 -mx-1 mb-4 bg-app/90 px-1 pb-3 pt-1 backdrop-blur-md">
                <div className="flex min-w-0 items-center gap-6">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTab(t.id);
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      className={[
                        "relative py-1 text-sm font-bold transition-colors",
                        tab === t.id
                          ? "text-default after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                          : "text-muted-foreground hover:text-default",
                      ].join(" ")}
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

            {/* ── Right rail: trending, or the inline chat panel ────────── */}
            <aside className="sticky top-5 hidden h-[calc(100svh-2.5rem)] self-start overflow-hidden xl:block">
              {/* Trending fades out under the chat panel when one is open. */}
              <motion.div
                animate={{ opacity: chatOpen ? 0 : 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full overflow-y-auto no-scroll-indicator"
                aria-hidden={chatOpen}
              >
                <DesktopTrendingRail lang={lang} />
              </motion.div>

              <InlineChatPanel
                lang={lang}
                contentId={chatContentId}
                onClose={closeChat}
                className="absolute inset-0 h-full overflow-hidden rounded-2xl border border-default bg-elevated shadow-sm"
              />
            </aside>
          </div>
        </div>
      </div>
    </FeedChatProvider>
  );
}
