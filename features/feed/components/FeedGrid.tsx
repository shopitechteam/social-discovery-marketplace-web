"use client";

import { PostCard } from "./PostCard";
import { useForYouFeed } from "../hooks/useFeed";
import {
  FeedCardsSkeleton,
  FeedPaginationSkeleton,
} from "./FeedSkeleton";
import { TrendingStrip } from "./TrendingStrip";
import { LocationPermissionBanner } from "./LocationPermissionBanner";
//import { StoriesBar } from "@/features/stories/components/StoriesBar";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { memo, Suspense } from "react";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

interface Props {
  lang: string;
  active?: boolean;
  /**
   * The first page, fetched on the server. See the Suspense boundary below for
   * why this exists — without it the feed's HTML is a skeleton in production.
   */
  initialItems?: ContentCardFieldsFragment[];
}

/** The card list itself — the only part that differs between the server
 *  snapshot and the live, paginating feed. */
function FeedCards({
  items,
  lang,
}: {
  items: ContentCardFieldsFragment[];
  lang: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((post, i) => (
        <PostCard key={post.id} post={post} lang={lang} priority={i === 0} />
      ))}
    </div>
  );
}

/**
 * The live feed. Reads through `useForYouFeed`, which uses `useSuspenseQuery`
 * and therefore suspends until the query resolves.
 */
function LiveFeedCards({ lang, active }: { lang: string; active: boolean }) {
  const { items, loadingMore, hasMore, loadMore, loading } = useForYouFeed();

  const { sentinelRef } = useInfiniteScroll({
    enabled: active,
    hasMore,
    loading,
    onLoadMore: loadMore,
  });

  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 right-0 bottom-0  flex-col items-center justify-center py-24 px-6 text-center">
        <div className="text-5xl mb-4">🛍️</div>
        <h3 className="font-bold text-default text-base mb-2">
          Your feed is empty
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Follow sellers or explore categories to see content here.
        </p>
      </div>
    );
  }

  return (
    <>
      <FeedCards items={items} lang={lang} />

      {/* ── Infinite scroll sentinel ─────────────────────────────────── */}
      <div ref={sentinelRef} className="h-1" />

      {loadingMore && <FeedPaginationSkeleton />}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-muted-foreground text-xs py-6">
          You&apos;re all caught up ✓
        </p>
      )}
    </>
  );
}

function FeedGrid({ lang, active = true, initialItems }: Props) {
  return (
    <div className="pb-safe-area-inset-bottom pb-6 min-h-svh">
      {/* ── Stories bar ──────────────────────────────────────────────── */}
      {/* <StoriesBar lang={lang} /> */}

      {/* ── Trending strip ────────────────────────────────────────────── */}
      {/* Deliberately OUTSIDE the boundary below: it reads with useQuery (not
          useSuspenseQuery), so it never suspends and renders null until its
          data arrives — identically in both branches. Keeping it here means the
          swap from server snapshot to live feed cannot move anything above the
          cards, which is what would have shown up as layout shift. */}
      <div className="pt-2 pb-1">
        <TrendingStrip lang={lang} />
      </div>

      {/* ── Location permission nudge ────────────────────────────────── */}
      <LocationPermissionBanner />

      {/* ── Post cards ───────────────────────────────────────────────────
          `useForYouFeed` suspends. Without a boundary here, the *route's*
          boundary was the nearest one, and on the server it could only be
          completed if the feed query resolved during the render. Against the
          production API (~2.4s for one page) it never did, so React abandoned
          the whole boundary and shipped a skeleton, leaving the client to fetch
          and render every card — and leaving the LCP image out of the HTML
          entirely, where no preload or fetchpriority hint could reach it. That
          abort is React error #419.

          Giving the suspending part its own boundary whose fallback is the
          server-fetched first page means the server always has something real
          to render: the cards, and with them the LCP <img>, land in the initial
          HTML. The live feed then takes over on the client with the same items
          (same query, same cache), so the swap is invisible. */}
      <Suspense
        fallback={
          initialItems && initialItems.length > 0 ? (
            <FeedCards items={initialItems} lang={lang} />
          ) : (
            <FeedCardsSkeleton />
          )
        }
      >
        <LiveFeedCards lang={lang} active={active} />
      </Suspense>
    </div>
  );
}
export default memo(FeedGrid);
