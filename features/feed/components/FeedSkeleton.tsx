"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="bg-elevated border-b border-default">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <Skeleton className="w-10 bg-gray-300 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-3.5 bg-gray-300 w-32 rounded-full" />
          <Skeleton className="h-2.5 bg-gray-300 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-20 bg-gray-300 rounded-full" />
      </div>

      {/* Title + caption */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        <Skeleton className="h-4 bg-gray-300 w-3/4 rounded-full" />
        <Skeleton className="h-3 bg-gray-300 w-full rounded-full" />
        <Skeleton className="h-3 bg-gray-300 w-2/3 rounded-full" />
      </div>

      {/* Media */}
      <Skeleton
        className="w-full rounded-none bg-gray-300"
        style={{ aspectRatio: "4/3" }}
      />

      {/* Stats row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <Skeleton className="h-3 w-28  rounded-full bg-gray-300" />
        <Skeleton className="h-4 w-20 rounded-full bg-gray-300" />
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
            <Skeleton className="w-5 h-5 rounded-full bg-gray-300" />
            <Skeleton className="h-2.5 w-8 rounded-full bg-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div>
      {/* Trending strip skeleton — must match TrendingStrip's real markup so
          the initial-load skeleton doesn't shift when content swaps in:
          same header row, mx-4 scroll spacing, and w-28 / 9:14 portrait cards. */}
      <section className="pt-2 pb-1">
        <div className="flex items-center justify-between px-4 mb-2.5">
          <h2 className="text-sm font-bold text-default flex items-center gap-1.5">
            <span>🔥</span> Trending
          </h2>
          <Skeleton className="h-3 w-16 rounded-full bg-gray-300" />
        </div>
        <div className="flex gap-2.5 mx-4 overflow-hidden pb-0.5" aria-hidden>
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="flex-none w-28 bg-gray-300 rounded-xl"
              style={{ aspectRatio: "9/14" }}
            />
          ))}
        </div>
      </section>

      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeedPaginationSkeleton() {
  return (
    <div className="pt-2" aria-hidden>
      <PostCardSkeleton />
    </div>
  );
}
