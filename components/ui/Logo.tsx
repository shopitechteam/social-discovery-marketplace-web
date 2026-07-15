import { cn } from "@/lib/utils";

type LogoVariant = "icon" | "lockup" | "wordmark";

type LogoProps = {
  /** Kept for API compatibility; all variants render the same brush artwork. */
  variant?: LogoVariant;
  /** Pixel height of the logo. Width auto-derives from the 3:2 artwork. */
  size?: number;
  /** Kept for API compatibility. */
  tone?: "rose" | "mono";
  className?: string;
};

// Intrinsic artwork is 1536 x 1024 (3:2).
const LOGO_SRC = "/assets/logo.svg";
const ASPECT = 1536 / 1024;

/**
 * Shopi's brand mark — the hand-painted brush lockup.
 * Rendered from the exported artwork at /assets/logo.svg.
 */
export function Logo({ size = 32, className }: LogoProps) {
  const width = Math.round(size * ASPECT);
  return (
    // Local SVG asset — served directly (next/image would need dangerouslyAllowSVG).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt="Shopi"
      width={width}
      height={size}
      className={cn("inline-block shrink-0", className)}
      style={{ height: size, width: "auto" }}
    />
  );
}
