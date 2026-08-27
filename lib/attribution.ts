/**
 * First-touch attribution.
 *
 * Answers "where did this signup come from?" — Vercel Analytics shows referrers
 * per pageview, but a pageview on `/en` tells you nothing about who then walked
 * all the way to a completed registration. So we snapshot the *first* landing
 * (referrer + UTM + landing path) once per browser and keep it until the user
 * signs up, then attach it to the signup event.
 *
 * First-touch (not last-touch) on purpose: a user who finds Shopi via Google,
 * leaves, and comes back by typing the URL was still acquired by Google.
 */

import type { AttributionInput } from "@/types/__generated__/graphql";

const STORAGE_KEY = "shopi_attribution_v1";

export interface Attribution {
  /** Coarse bucket: "google", "facebook", "tiktok", "instagram", "direct", … */
  source: string;
  /** "organic" | "social" | "paid" | "referral" | "direct" | "internal" */
  medium: string;
  /** utm_campaign, when present */
  campaign?: string;
  /** utm_term, or utm_content when only that is present */
  term?: string;
  /** Google Ads click id */
  gclid?: string;
  /** Meta Ads click id */
  fbclid?: string;
  /** Raw document.referrer at first landing ("" for direct) */
  referrer: string;
  /** Path the user first landed on, e.g. "/en/sell-in-kenya" */
  landingPath: string;
  /** ISO timestamp of first landing */
  firstSeenAt: string;
}

/** Hosts we classify without a UTM tag. Ordered longest-match-first at lookup. */
const REFERRER_RULES: Array<[RegExp, { source: string; medium: string }]> = [
  [/(^|\.)google\./, { source: "google", medium: "organic" }],
  [/(^|\.)bing\./, { source: "bing", medium: "organic" }],
  [/(^|\.)duckduckgo\./, { source: "duckduckgo", medium: "organic" }],
  [/(^|\.)yahoo\./, { source: "yahoo", medium: "organic" }],
  [/(^|\.)(facebook|fb)\./, { source: "facebook", medium: "social" }],
  [/(^|\.)instagram\./, { source: "instagram", medium: "social" }],
  [/(^|\.)tiktok\./, { source: "tiktok", medium: "social" }],
  [/(^|\.)(twitter|x)\.com$/, { source: "twitter", medium: "social" }],
  [/(^|\.)linkedin\./, { source: "linkedin", medium: "social" }],
  [/(^|\.)(youtube|youtu)\./, { source: "youtube", medium: "social" }],
  [/(^|\.)pinterest\./, { source: "pinterest", medium: "social" }],
  [/(^|\.)reddit\./, { source: "reddit", medium: "social" }],
  // WhatsApp/Messenger strip the referrer on most clients, but when it survives
  // it looks like this. Worth catching — it's a big share of Kenyan traffic.
  [/(^|\.)(whatsapp|wa\.me)/, { source: "whatsapp", medium: "social" }],
  [/(^|\.)(messenger|l\.facebook)\./, { source: "messenger", medium: "social" }],
  [/(^|\.)t\.co$/, { source: "twitter", medium: "social" }],
];

function classifyReferrer(referrer: string): { source: string; medium: string } {
  if (!referrer) return { source: "direct", medium: "direct" };

  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return { source: "unknown", medium: "referral" };
  }

  // Same-site navigation isn't an acquisition source.
  if (typeof window !== "undefined" && host === window.location.hostname) {
    return { source: "internal", medium: "internal" };
  }
  // www.shopi.co.ke ↔ shopi.co.ke counts as internal too.
  if (host.replace(/^www\./, "") === "shopi.co.ke") {
    return { source: "internal", medium: "internal" };
  }

  for (const [pattern, result] of REFERRER_RULES) {
    if (pattern.test(host)) return result;
  }
  return { source: host.replace(/^www\./, ""), medium: "referral" };
}

function readStored(): Attribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Attribution).source === "string"
    ) {
      return parsed as Attribution;
    }
  } catch {
    // Private mode / storage disabled / corrupt value — treat as no attribution.
  }
  return null;
}

/**
 * Snapshot the current landing as first-touch attribution, unless one is
 * already stored. Safe to call on every page load; only the first one sticks.
 *
 * Exception: a stored `internal`/`direct` record is upgraded if this load has a
 * real source — that covers the case where the very first stored hit was a
 * same-site bounce we couldn't attribute.
 */
export function captureAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  const existing = readStored();
  const params = new URLSearchParams(window.location.search);

  const utmSource = params.get("utm_source")?.trim().toLowerCase() || undefined;
  const utmMedium = params.get("utm_medium")?.trim().toLowerCase() || undefined;
  const campaign = params.get("utm_campaign")?.trim() || undefined;
  const term =
    params.get("utm_term")?.trim() || params.get("utm_content")?.trim() || undefined;
  // Ad-platform click ids imply paid traffic even without utm_medium.
  const gclid = params.get("gclid")?.trim() || undefined;
  const fbclid = params.get("fbclid")?.trim() || undefined;

  const referrer = document.referrer || "";
  const classified = classifyReferrer(referrer);

  let source = utmSource ?? classified.source;
  let medium = utmMedium ?? classified.medium;

  if (!utmSource && gclid) {
    source = "google";
    medium = "paid";
  } else if (!utmSource && fbclid) {
    source = "facebook";
    medium = "paid";
  }

  const isWeak = (a: Attribution) =>
    a.medium === "internal" || a.source === "direct" || a.source === "unknown";
  const isStrong = medium !== "internal" && source !== "direct" && source !== "unknown";

  if (existing && !(isWeak(existing) && isStrong)) return existing;

  const attribution: Attribution = {
    source,
    medium,
    ...(campaign ? { campaign } : {}),
    ...(term ? { term } : {}),
    ...(gclid ? { gclid } : {}),
    ...(fbclid ? { fbclid } : {}),
    referrer,
    landingPath: window.location.pathname,
    firstSeenAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Non-fatal: we still return it so the current session can report it.
  }
  return attribution;
}

/** Read stored first-touch attribution, falling back to the current load. */
export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  return readStored() ?? captureAttribution();
}

/**
 * Stored attribution shaped for the API's `AttributionInput`.
 *
 * Sent with every register and social-login mutation; the server persists it
 * only when the call actually creates an account, so a returning user's
 * first-touch source is never overwritten.
 *
 * Returns undefined when nothing was captured (storage blocked, first load in a
 * private window) — the field is optional, and sending an empty object would
 * record a meaningless "unknown" over a source the server might otherwise infer
 * from the request's own Referer header.
 */
export function attributionInput(
  surface?: "register" | "welcome" | "login",
): AttributionInput | undefined {
  const a = getAttribution();
  if (!a) return undefined;
  return {
    source: a.source,
    medium: a.medium,
    campaign: a.campaign,
    term: a.term,
    gclid: a.gclid,
    fbclid: a.fbclid,
    referrer: a.referrer || undefined,
    landingPath: a.landingPath,
    firstSeenAt: a.firstSeenAt,
    surface,
  };
}

/** Flatten to primitives for analytics event properties. */
export function attributionProps(): Record<string, string> {
  const a = getAttribution();
  if (!a) return { source: "unknown", medium: "unknown" };
  return {
    source: a.source,
    medium: a.medium,
    campaign: a.campaign ?? "none",
    referrer: a.referrer || "direct",
    landingPath: a.landingPath,
    // Hours between first landing and this event — separates "signed up
    // immediately" from "came back days later".
    hoursToConvert: String(
      Math.round(
        (Date.now() - new Date(a.firstSeenAt).getTime()) / 3_600_000,
      ),
    ),
  };
}
