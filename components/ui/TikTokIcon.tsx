import type { SVGProps } from "react";

interface TikTokIconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number;
  /** Accepted for API parity with lucide icons; harmless on this filled glyph. */
  strokeWidth?: number;
}

// strokeWidth is a valid SVG attribute, so it can flow straight through to the
// <svg> with the rest of the props — no special handling needed.

/**
 * TikTok logo glyph. Lucide has no brand icon for TikTok, so this is a small
 * inline SVG that follows the same `size` / `className` API as lucide-react
 * icons (currentColor fill) so it drops into icon slots cleanly.
 */
export function TikTokIcon({
  size = 26,
  className = "h-8 mt-1 w-8",
  ...props
}: TikTokIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M16.5 5.82a4.78 4.78 0 0 1-2.9-3.32.5.5 0 0 0-.49-.42h-2.4a.5.5 0 0 0-.5.5v10.94a2.12 2.12 0 1 1-2.95-1.95.5.5 0 0 0 .3-.46V8.2a.5.5 0 0 0-.6-.49 5.52 5.52 0 1 0 6.7 5.4V8.93a7.6 7.6 0 0 0 3.43.94.5.5 0 0 0 .51-.5V6.4a.5.5 0 0 0-.42-.49 4.8 4.8 0 0 1-.18-.04Z" />
    </svg>
  );
}
