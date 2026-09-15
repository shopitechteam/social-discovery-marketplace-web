"use client";

import { track } from "@vercel/analytics";

/**
 * Seller funnel tracking (API: `trackSellerEvent`), read in the admin under
 * Social proof → performance.
 *
 *   homepage impression → homepage click → profile / listing view →
 *   message · phone reveal · call
 *
 * Anonymous by design: a random per-tab session id in sessionStorage, no user
 * id. Most buyers who reach a featured seller from Google or the homepage are
 * signed out, which is precisely the traffic a signed-in-only counter misses.
 *
 * Every call is fire-and-forget. `keepalive` lets an event sent on a link click
 * survive the navigation it triggers, and nothing here may throw into the UI.
 */

export type SellerEventType =
  | "SOCIAL_PROOF_IMPRESSION"
  | "SOCIAL_PROOF_CLICK"
  | "PROFILE_VIEW"
  | "LISTING_VIEW"
  | "MESSAGE_CLICK"
  | "CONTACT_REVEAL"
  | "CALL_CLICK";

export type TrafficSource =
  | "SOCIAL_PROOF"
  | "SEARCH"
  | "AI"
  | "SOCIAL"
  | "INTERNAL"
  | "DIRECT"
  | "OTHER";

const SESSION_KEY = "shopi:seller-analytics:session";
const LANDING_SOURCE_KEY = "shopi:seller-analytics:landing-source";
const SOCIAL_PROOF_KEY = "shopi:seller-analytics:social-proof";
/** A homepage click attributes the rest of the visit for this long. */
const SOCIAL_PROOF_ATTRIBUTION_MS = 30 * 60 * 1000;

const TRACK_MUTATION = `mutation TrackSellerEvent($input: TrackSellerEventInput!) {
  trackSellerEvent(input: $input)
}`;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function sellerAnalyticsSession(): string {
  const store = storage();
  const existing = store?.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = `s_${(crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^A-Za-z0-9]/g, "").slice(0, 32)}`;
  store?.setItem(SESSION_KEY, id);
  return id;
}

/** Bucket a referrer host. Exported for the homepage/profile/listing callers' tests. */
export function classifyReferrer(referrer: string, ownHost: string): TrafficSource {
  if (!referrer) return "DIRECT";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "OTHER";
  }
  if (host === ownHost || host.endsWith(`.${ownHost.replace(/^www\./, "")}`)) return "INTERNAL";
  if (/(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|brave|startpage)\./.test(host)) {
    // Gemini lives on a google.com subdomain but is an answer engine, not search.
    return /^gemini\.google\./.test(host) ? "AI" : "SEARCH";
  }
  if (/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|copilot\.microsoft\.com|you\.com|phind\.com|meta\.ai|deepseek\.com)$/.test(host)) {
    return "AI";
  }
  if (/(^|\.)(facebook|instagram|tiktok|twitter|x|t|linkedin|whatsapp|wa|youtube|reddit|telegram|snapchat|pinterest)\.(com|co|me|net|org)$/.test(host) || host === "t.co" || host === "lm.facebook.com") {
    return "SOCIAL";
  }
  return "OTHER";
}

/**
 * The session's source: a recent homepage social-proof click wins; otherwise
 * how the visitor landed on the site this session (captured once, so later
 * in-app navigation doesn't turn every page into "internal").
 */
export function currentTrafficSource(): TrafficSource {
  const store = storage();
  const clickedAt = Number(store?.getItem(SOCIAL_PROOF_KEY) ?? 0);
  if (clickedAt && Date.now() - clickedAt < SOCIAL_PROOF_ATTRIBUTION_MS) return "SOCIAL_PROOF";

  const landed = store?.getItem(LANDING_SOURCE_KEY) as TrafficSource | null;
  if (landed) return landed;
  const utm = new URLSearchParams(window.location.search).get("utm_medium")?.toLowerCase();
  const source: TrafficSource =
    utm === "social" ? "SOCIAL" : utm === "organic" ? "SEARCH" : classifyReferrer(document.referrer, window.location.hostname);
  store?.setItem(LANDING_SOURCE_KEY, source);
  return source;
}

/** Called on a click inside the homepage featured-seller section. */
export function markSocialProofVisit(): void {
  storage()?.setItem(SOCIAL_PROOF_KEY, String(Date.now()));
}

export function trackSellerEvent(event: {
  type: SellerEventType;
  sellerId?: string | null;
  contentId?: string | null;
}): void {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || (!event.sellerId && !event.contentId)) return;
    const source = currentTrafficSource();

    void fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      keepalive: true,
      body: JSON.stringify({
        query: TRACK_MUTATION,
        variables: {
          input: {
            type: event.type,
            source,
            sessionId: sellerAnalyticsSession(),
            ...(event.contentId ? { contentId: event.contentId } : { sellerId: event.sellerId }),
          },
        },
      }),
    }).catch(() => {});

    // Mirrors into Vercel Analytics custom events where the plan supports them.
    track(`seller_${event.type.toLowerCase()}`, { source });
  } catch {
    // Analytics must never break a page.
  }
}
