/**
 * Pull a TikTok link out of whatever was pasted. TikTok's Share > Copy link
 * usually yields a bare URL, but pasted captions can carry extra words, and
 * some people drop the scheme.
 */
export function extractTiktokUrl(text: string): string | null {
  for (const token of text.split(/\s+/)) {
    const cleaned = token.replace(/^[("'<[]+/, "").replace(/[)"'>\].,;]+$/, "");
    if (!cleaned) continue;
    const candidate = /^https?:\/\//i.test(cleaned)
      ? cleaned
      : `https://${cleaned}`;
    try {
      const url = new URL(candidate);
      if (/(^|\.)tiktok\.com$/i.test(url.hostname)) return url.toString();
    } catch {
      // Not a URL - keep scanning the remaining tokens.
    }
  }
  return null;
}

/** Host + path without `www.`, query string or trailing slash. */
export function canonicalTiktokUrl(raw: string): string {
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    return `${host}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return raw;
  }
}

/** Same video, ignoring scheme, `www.`, query string and trailing slash. */
export function sameTiktokUrl(a: string, b: string): boolean {
  return canonicalTiktokUrl(a) === canonicalTiktokUrl(b);
}

export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const whole = Math.round(seconds);
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatSavedOn(savedAt: number): string {
  return new Date(savedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
