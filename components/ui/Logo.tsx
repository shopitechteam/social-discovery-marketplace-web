import { cn } from "@/lib/utils";

type LogoVariant = "icon" | "lockup" | "wordmark";

type LogoProps = {
  /** icon: mark only. lockup: mark + wordmark. wordmark: text only. */
  variant?: LogoVariant;
  /** Pixel height of the mark (icon/lockup) or text (wordmark). */
  size?: number;
  /** "rose": brand-pink mark on transparent/dark. "mono": inherits currentColor. */
  tone?: "rose" | "mono";
  className?: string;
};

/**
 * Shopi's mark: a rounded price tag whose inner cut doubles as a play
 * triangle — one continuous shape for "scroll a feed" + "shop a tag".
 */
function Mark({ size, tone }: { size: number; tone: "rose" | "mono" }) {
  const stroke = tone === "rose" ? "#FF3E6C" : "currentColor";
  const fill = tone === "rose" ? "#FF3E6C" : "currentColor";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label="Shopi"
    >
      <path
        d="M48 18 L74 34 V62 L48 78 L22 62 V34 Z"
        stroke={stroke}
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="30" r="4" fill={fill} />
      <path d="M39 40 L64 48 L39 58 Z" fill={fill} />
    </svg>
  );
}

export function Logo({
  variant = "lockup",
  size = 32,
  tone = "rose",
  className,
}: LogoProps) {
  if (variant === "icon") {
    return (
      <span className={cn("inline-flex shrink-0", className)}>
        <Mark size={size} tone={tone} />
      </span>
    );
  }

  const wordmark = (
    <span
      className="font-black tracking-tight lowercase"
      style={{ fontSize: size * 0.78, color: tone === "rose" ? undefined : "currentColor" }}
    >
      shopi
    </span>
  );

  if (variant === "wordmark") {
    return (
      <span className={cn("inline-flex items-center text-default", className)}>
        {wordmark}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5 text-default", className)}>
      <Mark size={size} tone={tone} />
      {wordmark}
    </span>
  );
}
