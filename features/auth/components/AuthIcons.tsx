// Static, server-safe — no "use client"

/**
 * Shared logo artwork — the Shopi mark.
 *
 * A rounded price-tag silhouette whose inner cut doubles as a play
 * triangle: one continuous shape for "scroll a feed" + "shop a tag".
 * Drawn inside a 64x64 box.
 */
function LogoArt() {
  return (
    <g transform="scale(0.6667)">
      <path
        d="M48 18 L74 34 V62 L48 78 L22 62 V34 Z"
        fill="none"
        stroke="rgb(var(--brand-primary))"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="30" r="4" fill="rgb(var(--brand-primary))" />
      <path d="M39 40 L64 48 L39 58 Z" fill="rgb(var(--brand-primary))" />
    </g>
  );
}

/**
 * Icon-only mark.
 */
export function ShopiLogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Shopi"
      style={{ overflow: "visible" }}
    >
      <LogoArt />
    </svg>
  );
}

/**
 * Full logo — mark + "shopi" wordmark.
 * `height` controls overall scale; width auto-derives unless given.
 */
export function ShopiLogo({
  height = 36,
  width,
  className,
}: {
  height?: number;
  width?: number;
  className?: string;
}) {
  // Intrinsic art is 188 x 64; keep aspect ratio off height.
  const w = width ?? Math.round((height / 64) * 188);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={height}
      viewBox="0 0 188 64"
      fill="none"
      role="img"
      aria-label="Shopi"
      className={className}
    >
      {/* Mark */}
      <LogoArt />
      {/* Wordmark */}
      <text
        x="68"
        y="42"
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontSize="34"
        fontWeight="700"
        letterSpacing="-1"
        fill="rgb(var(--color-text))"
      >
        shopi
      </text>
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export function Divider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-placeholder">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
