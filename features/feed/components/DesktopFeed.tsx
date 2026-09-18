"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ShoppingBag } from "lucide-react";
import { useForYouFeed, useFollowingFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAuthStore } from "@/stores/auth";
import {
  FeedPaginationSkeleton,
  PostCardSkeleton,
} from "./FeedSkeleton";
import { LocationPermissionBanner } from "./LocationPermissionBanner";
import { PostCard } from "./PostCard";
import { DesktopTrendingRail } from "./DesktopTrendingRail";
import { SHOW_ASK_SHOPI } from "@/features/feed/utils/askShopiAvailability";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

type Tab = "for-you" | "following" | "nearby" | "ask-shopi";

const TABS: { id: Tab; label: string }[] = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "nearby", label: "Nearby" },
  ...(SHOW_ASK_SHOPI
    ? [{ id: "ask-shopi" as const, label: "Ask Shopi" }]
    : []),
];

const DesktopNearbyColumn = dynamic(() =>
  import("./DesktopNearbyColumn").then((mod) => mod.DesktopNearbyColumn),
);
const AskShopiGrid = dynamic(() =>
  import("./AskShopiGrid").then((mod) => mod.AskShopiGrid),
);

const isTab = (v: string | null): v is Tab =>
  v === "for-you" ||
  v === "following" ||
  v === "nearby" ||
  (SHOW_ASK_SHOPI && v === "ask-shopi");

const isDesktopViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches;

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-elevated"
        >
          <PostCardSkeleton />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-main">
        <ShoppingBag className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-black text-main">{title}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
          {body}
        </p>
      </div>
      {action}
    </div>
  );
}

function DesktopPostCard({
  post,
  lang,
  priority,
}: {
  post: ContentCardFieldsFragment;
  lang: string;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-elevated shadow-sm shadow-black/[0.03]">
      <PostCard post={post} lang={lang} priority={priority} />
    </div>
  );
}

function ForYouColumn({ lang }: { lang: string }) {
  const { items, loading, loadingMore, hasMore, loadMore } = useForYouFeed();
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMore,
  });

  if (loading && items.length === 0) return <ColumnSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        title="Your feed is empty"
        body="Follow sellers or explore categories to see content here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <LocationPermissionBanner />
      {items.map((post, i) => (
        <DesktopPostCard
          key={post.id}
          post={post}
          lang={lang}
          priority={i === 0}
        />
      ))}
      <div ref={sentinelRef} className="h-1" />
      {loadingMore && <FeedPaginationSkeleton />}
      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-xs text-muted">
          You&apos;re all caught up
        </p>
      )}
    </div>
  );
}

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
        title="Sign in to see your feed"
        body="Follow sellers and creators to see their latest items here."
        action={
          <Link
            href={`/${lang}/auth/login?returnTo=${returnTo}`}
            className="rounded-full bg-main px-6 py-3 text-sm font-black text-elevated"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  if (loading && items.length === 0) return <ColumnSkeleton />;

  if (!loading && items.length === 0) {
    return (
      <EmptyState
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
      {loadingMore && <FeedPaginationSkeleton />}
      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-xs text-muted">
          You&apos;re all caught up
        </p>
      )}
    </div>
  );
}

export default function DesktopFeed({
  lang = "en",
  visible = true,
}: {
  lang?: string;
  visible?: boolean;
}) {
  const searchParams = useSearchParams();
  const initialTab: Tab = (() => {
    const t = searchParams.get("tab");
    return isTab(t) ? t : "for-you";
  })();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [openedTabs, setOpenedTabs] = useState<Set<Tab>>(
    () => new Set([initialTab]),
  );
  const scrollByTab = useRef<Record<Tab, number>>({
    "for-you": 0,
    following: 0,
    nearby: 0,
    "ask-shopi": 0,
  });
  const prevTab = useRef<Tab>(initialTab);

  useLayoutEffect(() => {
    if (prevTab.current !== tab) {
      if (isDesktopViewport()) window.scrollTo(0, scrollByTab.current[tab] ?? 0);
      prevTab.current = tab;
    }
  }, [tab]);

  const selectTab = useCallback((next: Tab) => {
    const current = prevTab.current;
    if (next === current) return;
    if (isDesktopViewport()) scrollByTab.current[current] = window.scrollY;
    setTab(next);
    setOpenedTabs((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
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

  useEffect(() => {
    if (!visible) return;
    const t = searchParams.get("tab");
    if (!isTab(t)) return;
    const current = prevTab.current;
    if (t === current) return;
    if (isDesktopViewport()) scrollByTab.current[current] = window.scrollY;
    setTab(t);
    setOpenedTabs((prev) => (prev.has(t) ? prev : new Set(prev).add(t)));
  }, [searchParams, visible]);

  return (
    <div className="min-h-svh bg-app">
      <div className="grid w-full grid-cols-1 gap-7 px-4 py-5 lg:px-8 xl:grid-cols-[minmax(760px,1fr)_420px] 2xl:grid-cols-[minmax(860px,1fr)_460px] xl:items-start">
        <section className="min-w-0">
          <div className="sticky top-(--desktop-top-nav-height,80px) z-20 -mx-2 mb-4 bg-app/92 px-2 py-3 backdrop-blur">
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-elevated p-1 shadow-sm shadow-black/[0.03]">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  aria-current={tab === t.id ? "true" : undefined}
                  className={[
                    "h-8 rounded-full px-3.5 text-xs font-bold tracking-normal transition-colors",
                    tab === t.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:bg-surface hover:text-main",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

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
              <DesktopNearbyColumn
                lang={lang}
                active={visible && tab === "nearby"}
              />
            </div>
          ) : null}
          {SHOW_ASK_SHOPI && openedTabs.has("ask-shopi") ? (
            <div className={tab === "ask-shopi" ? undefined : "hidden"}>
              <AskShopiGrid lang={lang} active={tab === "ask-shopi"} />
            </div>
          ) : null}
        </section>

        <aside className="sticky top-[calc(var(--desktop-top-nav-height,80px)+1.25rem)] hidden max-h-[calc(100svh-var(--desktop-top-nav-height,80px)-2.5rem)] overflow-y-auto xl:block">
          <DesktopTrendingRail lang={lang} />
        </aside>
      </div>
    </div>
  );
}
