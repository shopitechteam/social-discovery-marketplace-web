import { cn } from "@/lib/utils";

/**
 * Infinite-scroll loader for feed and discovery grids.
 *
 * This replaces the floating glass pill that used to hover over the bottom of
 * the viewport with skeleton bars inside it. Two problems with that: a fixed
 * overlay covers the very content the user is scrolling toward, and a skeleton
 * promises a shape — an avatar and two lines of text — that the next page does
 * not necessarily deliver.
 *
 * So: three quiet dots, in the flow at the end of the list, cresting in
 * sequence. It occupies the space the next row is about to fill, says "more is
 * coming", and says nothing else.
 */
export function FeedLoader({
  className,
  label = "Loading more",
}: {
  className?: string;
  /** Announced to screen readers; never shown. */
  label?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center py-8", className)}
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="shopi-loader-dot h-2 w-2 rounded-full"
            style={{
              backgroundColor: "rgb(var(--color-text-muted))",
              // Staggered so the three read as one travelling wave rather than
              // three things blinking at once.
              animationDelay: `${i * 160}ms`,
            }}
            aria-hidden
          />
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
