import { cn } from "@/lib/utils";

type LogoVariant = "icon" | "lockup" | "wordmark";

type LogoProps = {
  /** Kept for API compatibility; all variants render the same primary badge. */
  variant?: LogoVariant;
  /** Pixel height of the logo. Width auto-derives from the square artwork. */
  size?: number;
  /** Kept for API compatibility. */
  tone?: "rose" | "mono";
  className?: string;
};

// Intrinsic artwork is 96 x 96 (1:1).
const LOGO_SRC = "/assets/shopi-logo.svg";
const ASPECT = 1;
const LOGO_VISUAL_SCALE = 0.72;

/**
 * Shopi's primary brand mark — the simple square S badge.
 * Rendered from the exported artwork at /assets/shopi-logo.svg.
 */
export function Logo({ size = 32, className }: LogoProps) {
  const scaledSize = Math.round(size * LOGO_VISUAL_SCALE);
  const width = Math.round(scaledSize * ASPECT);
  return (
    // Local SVG asset — served directly (next/image would need dangerouslyAllowSVG).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt="Shopi"
      width={width}
      height={scaledSize}
      className={cn("inline-block shrink-0", className)}
      style={{ height: scaledSize, width: "auto" }}
    />
  );
}
