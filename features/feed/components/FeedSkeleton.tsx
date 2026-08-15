"use client";

import { Skeleton } from "@/components/ui/skeleton";

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

export function FeedSkeleton() {
  return (
    <div>
      {/* ── Mobile skeleton — trending strip on top + full-width cards ── */}
      <div className="md:hidden">
        {/* Trending strip skeleton — must match TrendingStrip's real markup so
            the initial-load skeleton doesn't shift when content swaps in:
            same header row, mx-4 scroll spacing, and w-28 / 9:14 portrait cards. */}
        <section className="pt-2 pb-1">
          <div className="flex items-center justify-between px-4 mb-2.5">
            <h2 className="text-sm font-bold text-default flex items-center gap-1.5">
              <span>🔥</span> Trending
            </h2>
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
          <div className="flex gap-2.5 mx-4 overflow-hidden pb-0.5" aria-hidden>
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={i}
                className="flex-none w-28 rounded-xl"
                style={{ aspectRatio: "9/14" }}
              />
            ))}
          </div>
        </section>

        {[...Array(3)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>

      {/* ── Desktop skeleton — mirrors DesktopFeed's frame exactly (same
          container, grid and column widths) so nothing jumps when the real
          feed mounts: tabs + card column, trending in the RIGHT rail on xl. */}
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

            {/* Right rail — sell CTA + trending list, xl and up only */}
            <aside className="sticky top-5 hidden self-start xl:block">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-[132px] w-full rounded-2xl" />

                <section className="rounded-2xl border border-default bg-elevated p-4">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="h-4 w-5 shrink-0 rounded" />
                        <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-3/4 rounded-full" />
                          <Skeleton className="h-2.5 w-1/2 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeedPaginationSkeleton() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-40 flex justify-center px-4 md:bottom-6 md:left-[var(--sidebar-width,0px)]"
      aria-hidden
    >
      <div className="flex h-12 w-full max-w-xs items-center gap-3 rounded-full border border-default bg-elevated/95 px-4 shadow-lg shadow-black/10 backdrop-blur dark:shadow-black/30">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-2.5 w-3/4 rounded-full" />
          <Skeleton className="h-2 w-1/2 rounded-full" />
        </div>
      </div>
    </div>
  );
}
