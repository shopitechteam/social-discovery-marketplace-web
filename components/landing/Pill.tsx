import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Landing-page CTA pill. "solid" inverts with the theme (near-black on
 * light, near-white on dark); "outline" stays quiet.
 */
export function Pill({
  href,
  variant = "solid",
  children,
  className,
}: {
  href: string;
  variant?: "solid" | "outline";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-opacity",
        variant === "solid"
          ? "bg-foreground text-background hover:opacity-85"
          : "border border-default bg-elevated text-default hover:bg-subtle",
        className,
      )}
    >
      {children}
    </Link>
  );
}
