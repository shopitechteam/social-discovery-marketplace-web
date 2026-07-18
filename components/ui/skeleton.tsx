import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Alpha fills track the surface underneath in both themes — solid
        // bg-muted is a TEXT color and reads far too heavy, especially on the
        // near-black dark theme. Matches the hand-rolled skeletons.
        "animate-pulse rounded-md bg-black/10 dark:bg-white/10",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
