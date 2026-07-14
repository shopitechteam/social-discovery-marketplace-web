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

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForYouFeed, useFollowingFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAuthStore } from "@/stores/auth";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./FeedSkeleton";
import { DesktopTrendingRail } from "./DesktopTrendingRail";
import { TrendingStrip } from "./TrendingStrip";
import { DesktopNearbyColumn } from "./DesktopNearbyColumn";
import { FeedChatProvider } from "./FeedChatContext";

const InlineChatPanel = dynamic(() =>
  import("@/features/messaging/components/InlineChatPanel").then(
    (mod) => mod.InlineChatPanel,
  ),
);

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
        <DesktopPostCard
          key={post.id}
          post={post}
          lang={lang}
          priority={i === 0}
        />
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
        <DesktopPostCard
          key={post.id}
          post={post}
          lang={lang}
          priority={i === 0}
        />
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

const isTab = (v: string | null): v is Tab =>
  v === "for-you" || v === "following" || v === "nearby";

/** True when the desktop (md+) layout is the visible one. The mobile FeedPage
 *  shares the document with us; only the visible layout may drive scroll. */
const isDesktopViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches;

export default function DesktopFeed({
  lang = "en",
  visible = true,
}: {
  lang?: string;
  /** False while the persistent-mounted feed is hidden behind another route. */
  visible?: boolean;
}) {
  const searchParams = useSearchParams();
  const initialTab: Tab = (() => {
    const t = searchParams.get("tab");
    return isTab(t) ? t : "for-you";
  })();
  const [tab, setTab] = useState<Tab>(initialTab);
  // Tabs stay mounted once opened (Following/Nearby mount lazily — Nearby
  // requests geolocation on mount). Unmounting on switch would drop the Apollo
  // observer and the scroll position; hiding keeps both intact and makes
  // switching back instant.
  const [openedTabs, setOpenedTabs] = useState<Set<Tab>>(
    () => new Set([initialTab]),
  );
  // The whole page scrolls on `window`, so hiding a tab collapses the document
  // and loses the position. Remember each tab's offset and restore on return.
  const scrollByTab = useRef<Record<Tab, number>>({
    "for-you": 0,
    following: 0,
    nearby: 0,
  });
  const prevTab = useRef<Tab>(initialTab);

  // Restore the incoming tab's scroll after the show/hide classes apply but
  // before paint — the restored column has its full height back by then.
  useLayoutEffect(() => {
    if (prevTab.current !== tab) {
      if (isDesktopViewport()) {
        window.scrollTo(0, scrollByTab.current[tab] ?? 0);
      }
      prevTab.current = tab;
    }
  }, [tab]);

  const selectTab = useCallback((next: Tab) => {
    // prevTab tracks the currently *displayed* tab (set post-commit in the
    // layout effect), so the save happens outside the state updater — state
    // updaters must stay pure.
    const current = prevTab.current;
    if (next === current) return;
    if (isDesktopViewport()) {
      scrollByTab.current[current] = window.scrollY;
    }
    setTab(next);
    setOpenedTabs((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
    // Keep the tab in the URL (replace, not push) so back-navigation and
    // reloads return to the same tab without adding history entries.
    const params = new URLSearchParams(window.location.search);
    if (next === "for-you") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}`,
    );
  }, []);

  // Follow external URL changes (e.g. returning from auth with ?tab=following).
  // After selectTab's own replaceState round-trips through useSearchParams,
  // next === prevTab.current and this is a no-op.
  //
  // The feed stays mounted while other routes are shown (MainShell), and those
  // routes use ?tab= for their own sub-tabs (/notifications?tab=notifications),
  // so: only sync while the feed route is visible, and only for values that
  // are real feed tabs — a missing/foreign param keeps the current tab.
  useEffect(() => {
    if (!visible) return;
    const t = searchParams.get("tab");
    if (!isTab(t)) return;
    const current = prevTab.current;
    if (t === current) return;
    if (isDesktopViewport()) {
      scrollByTab.current[current] = window.scrollY;
    }
    setTab(t);
    setOpenedTabs((prev) => (prev.has(t) ? prev : new Set(prev).add(t)));
  }, [searchParams, visible]);
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
        {/* No bottom padding here: the sticky right rail can only stay pinned
            while the grid (its containing block) still overlaps the viewport,
            so the grid must run to the very end of the document. The feed
            column carries the bottom breathing room instead. */}
        <div className="mx-auto w-full max-w-[1680px] px-4 pt-4 md:px-6 md:pt-6 xl:px-8">
          <div
            className={[
              "grid grid-cols-1 gap-6 xl:items-start transition-[grid-template-columns] duration-300 ease-out",
              chatOpen
                ? "xl:grid-cols-[minmax(0,1fr)_minmax(420px,480px)]"
                : "xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]",
            ].join(" ")}
          >
            {/* ── Feed column ───────────────────────────────────────────── */}
            <div className="min-w-0 w-full max-w-[780px] mx-auto pb-4 md:pb-6 xl:max-w-none xl:mx-0">
              <div className="xl:hidden mb-4">
                <TrendingStrip lang={lang} />
              </div>

              <div className="sticky top-0 z-20 -mx-1 mb-4 bg-app/90 px-1 pb-2 pt-2 backdrop-blur-md">
                <div
                  aria-label="Feed"
                  className="flex min-w-0 items-center gap-8"
                >
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => selectTab(t.id)}
                      aria-current={tab === t.id ? "true" : undefined}
                      className={[
                        "relative rounded-md px-1 py-2 text-sm font-bold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        tab === t.id
                          ? "text-default after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary"
                          : "text-muted-foreground hover:text-default",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keep opened tabs mounted and just toggle visibility — see
                  openedTabs above. A hidden column's sentinel reports no
                  intersection, so it never paginates while off-screen. */}
              <div className={tab === "for-you" ? undefined : "hidden"}>
                <ForYouColumn lang={lang} />
              </div>
              {openedTabs.has("following") ? (
                <div className={tab === "following" ? undefined : "hidden"}>
                  <FollowingColumn lang={lang} />
                </div>
              ) : null}
              {openedTabs.has("nearby") ? (
                <div className={tab === "nearby" ? undefined : "hidden"}>
                  <DesktopNearbyColumn lang={lang} />
                </div>
              ) : null}
            </div>

            {/* ── Right rail: trending, or the inline chat panel ────────── */}
            <aside className="sticky top-5 hidden h-[calc(100svh-2.5rem)] self-start overflow-hidden xl:block">
              {/* Trending fades out under the chat panel when one is open. */}
              <div
                className={`h-full overflow-y-auto no-scroll-indicator transition-opacity duration-200 ${
                  chatOpen ? "opacity-0" : "opacity-100"
                }`}
                aria-hidden={chatOpen}
              >
                <DesktopTrendingRail lang={lang} />
              </div>

              {chatOpen ? (
                <InlineChatPanel
                  lang={lang}
                  contentId={chatContentId}
                  onClose={closeChat}
                  // The originating post card in the feed already shows the
                  // seller's name + avatar, so hide them in this chat header to
                  // avoid repeating the same identity right beside it.
                  hideParticipantHeader
                  className="absolute inset-0 h-full overflow-hidden rounded-2xl border border-default bg-elevated shadow-sm"
                />
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </FeedChatProvider>
  );
}
