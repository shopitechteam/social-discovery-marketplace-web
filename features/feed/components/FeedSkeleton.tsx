"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FeedLoader } from "@/components/ui/feed-loader";

/**
 * Skeletons must occupy EXACTLY the space of the content that replaces them —
 * any difference is a layout shift (CLS) when data swaps in. The media box
 * mirrors PostCard's real media sizing: portrait media renders at
 * min(177.78vw, 70svh) (see PostCard.tsx), so the placeholder does too.
 * Colors come from the base Skeleton (bg-muted) so both themes look right —
 * no hardcoded grays.
 */
export function PostCardSkeleton() {
  return (
    <div className="bg-elevated border-b border-default">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3.5 w-32 rounded-full" />
          <Skeleton className="h-2.5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      {/* Title + caption */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3 w-2/3 rounded-full" />
      </div>

      {/* Media — same height budget as PostCard portrait media (the dominant
          case in the feed), so the card doesn't grow/shrink when it loads. */}
      <Skeleton
        className="w-full rounded-none"
        style={{ height: "min(177.78vw, 70svh)" }}
      />

      {/* Stats row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>

      {/* Divider */}
      <div className="h-px mx-4 bg-border" />

      {/* Action bar */}
      <div className="flex items-center px-2 py-1 gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1.5 py-2.5"
          >
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-2.5 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedCardsSkeleton() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </>
  );
}

/**
 * The mobile stories tray while the page loads. Must match StoriesBar's
 * mobile markup (padding, 72px items, 66px circles, label row) so nothing
 * shifts when the real tray takes over.
 */
function StoriesTraySkeleton() {
  return (
    <section className="border-b border-default bg-elevated px-3 pb-2.5 pt-3" aria-hidden>
      <div className="flex gap-2.5 overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex w-18 shrink-0 flex-col items-center gap-1.5">
            <Skeleton className="size-16.5 rounded-full" />
            <Skeleton className="h-3 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeedSkeleton() {
  return (
    <div>
      {/* ── Mobile skeleton — stories tray on top + full-width cards ── */}
      <div className="md:hidden">
        <StoriesTraySkeleton />
        <FeedCardsSkeleton />
      </div>

      {/* ── Desktop skeleton — mirrors DesktopFeed's frame exactly (same
          container, grid and column widths) so nothing jumps when the real
          feed mounts: tabs + stories + card column, sellers in the RIGHT rail
          on xl. */}
      <div className="hidden min-h-svh bg-app md:block" aria-hidden>
        <div className="mx-auto w-full max-w-[1680px] px-4 pt-4 md:px-6 md:pt-6 xl:px-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)] xl:items-start">
            <div className="mx-auto w-full min-w-0 max-w-[780px] pb-4 md:pb-6 xl:mx-0 xl:max-w-none">
              {/* Tab bar placeholder — same height as the sticky tab row */}
              <div className="mb-4 flex items-center gap-8 px-1 pb-2 pt-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-16 rounded-full" />
                ))}
              </div>

              {/* Stories card — StoriesBar's desktop variant */}
              <div className="mb-4 flex gap-2.5 overflow-hidden rounded-xl border border-border bg-elevated p-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex w-18 shrink-0 flex-col items-center gap-1.5">
                    <Skeleton className="size-16.5 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-default bg-elevated"
                  >
                    <PostCardSkeleton />
                  </div>
                ))}
              </div>
            </div>

            {/* Right rail — sellers to follow, xl and up only */}
            <aside className="sticky top-5 hidden self-start xl:block">
              <section className="rounded-2xl border border-default bg-elevated p-4">
                <Skeleton className="mb-3 ml-1 h-4 w-32 rounded-full" />
                <div className="flex flex-col gap-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-2/3 rounded-full" />
                        <Skeleton className="h-2.5 w-1/2 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Kept under its original name so the four grids importing it don't churn, but
 * it is no longer a skeleton: see {@link FeedLoader} for why the floating glass
 * pill went away.
 */
export function FeedPaginationSkeleton() {
  return <FeedLoader />;
}
