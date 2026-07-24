import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

// Compact relative-time labels (e.g. "5m", "2h", "3d", "2w", "3mo") backed by
// dayjs. The thresholds keep us in the right unit; the locale strings keep the
// output terse to match the app's existing timestamp style (not dayjs's verbose
// default).
//
// Days roll into WEEKS after 6 days, so we show Facebook-style "1w".."3w"
// instead of a hard-to-parse "29d", then months and years:
//   6d → "6d" · 7d → "1w" · 14d → "2w" · 21d → "3w" · ~25d+ → "1mo" · 365d → "1y"
//
// dayjs has no native week unit in relativeTime; we add one by giving a
// threshold `d: "week"` (dayjs computes fractional week diffs) plus custom
// "w"/"ww" locale keys below. Each singular bridge entry (no `d`) is the label
// used when the next plural unit rounds down to 1 — that's how "1w" is produced.
dayjs.extend(relativeTimePlugin, {
  thresholds: [
    { l: "s", r: 59, d: "second" },
    { l: "m", r: 1 },
    { l: "mm", r: 59, d: "minute" },
    { l: "h", r: 1 },
    { l: "hh", r: 23, d: "hour" },
    { l: "d", r: 1 },
    { l: "dd", r: 6, d: "day" },
    { l: "w", r: 1 },
    { l: "ww", r: 3, d: "week" },
    { l: "M", r: 1 },
    { l: "MM", r: 11, d: "month" },
    { l: "y", r: 1 },
    { l: "yy", d: "year" },
  ],
});
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "just now",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    w: "1w",
    ww: "%dw",
    M: "1mo",
    MM: "%dmo",
    y: "1y",
    yy: "%dy",
  },
});

/**
 * Compact relative time, e.g. "just now", "5m", "2h", "3d", "2w", "4mo", "1y".
 * No "ago" suffix. Returns "" for missing/invalid input.
 */
export function timeAgo(value?: unknown): string {
  if (!value) return "";
  const d = dayjs(value as string | number | Date);
  if (!d.isValid()) return "";
  return d.fromNow(true);
}

/**
 * Same as {@link timeAgo} but with an "ago" suffix for past times.
 * "just now" is returned as-is (no "ago").
 */
export function timeAgoLong(value?: unknown): string {
  const label = timeAgo(value);
  if (!label || label === "just now") return label;
  return `${label} ago`;
}
