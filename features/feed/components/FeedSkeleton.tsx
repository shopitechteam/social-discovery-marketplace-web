"use client";

export function PostCardSkeleton() {
  return (
    <div className="bg-elevated border-b border-default">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <div className="w-10 h-10 rounded-full bg-surface animate-pulse flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-3 w-28 rounded-full bg-surface animate-pulse" />
          <div className="h-2.5 w-16 rounded-full bg-surface animate-pulse" />
        </div>
      </div>
      {/* Caption */}
      <div className="px-4 pb-2.5 flex flex-col gap-2">
        <div className="h-3 w-3/4 rounded-full bg-surface animate-pulse" />
        <div className="h-3 w-1/2 rounded-full bg-surface animate-pulse" />
      </div>
      {/* Media */}
      <div className="w-full bg-surface animate-pulse" style={{ aspectRatio: "4/3" }} />
      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="h-2.5 w-24 rounded-full bg-surface animate-pulse" />
        <div className="h-3 w-20 rounded-full bg-surface animate-pulse" />
      </div>
      {/* Actions */}
      <div className="h-px mx-4 bg-border" />
      <div className="flex items-center px-4 py-2.5 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-7 rounded-lg bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div>
      {/* Trending strip skeleton */}
      <div className="flex gap-2.5 px-4 py-3 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-none w-24 rounded-xl bg-surface animate-pulse"
            style={{ height: 40 }}
          />
        ))}
      </div>

      {/* Post card skeletons */}
      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
