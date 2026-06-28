/**
 * Compact number formatting shared across the app.
 * `1_500 → "1.5K"`, `2_300_000 → "2.3M"`, anything below 1K is left as-is.
 */
export function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
