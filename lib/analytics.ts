"use client";

import { track } from "@vercel/analytics";
import { attributionProps } from "@/lib/attribution";

/**
 * Custom-event wrappers. Each event fans out to three sinks:
 *
 * - Vercel Analytics, with first-touch attribution, so the dashboard can break
 *   signups down by source/medium instead of only showing referrers for
 *   anonymous pageviews. `track()` is a no-op on the Hobby plan — custom events
 *   need Web Analytics Plus. Pageview referrers work on every plan regardless.
 * - The GTM dataLayer, where a GA4 event tag forwards it so it can be marked as
 *   a key event. Without this GA4 only ever sees pageviews and scrolls.
 * - The Meta Pixel, so Meta ads optimise for sign-ups and published posts
 *   rather than clicks. Inert until the pixel is configured (see MetaPixel).
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

type AuthMethod = "email" | "google" | "apple" | "facebook" | "tiktok";

function pushDataLayer(event: string, params: Record<string, string> = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch {
    // Analytics must never break the flow that fired it.
  }
}

function metaPixel(...args: unknown[]) {
  try {
    window.fbq?.(...args);
  } catch {
    // Analytics must never break the flow that fired it.
  }
}

/** Fired when a brand-new account is created. */
export function trackSignup(method: AuthMethod) {
  try {
    track("signup", { method, ...attributionProps() });
  } catch {
    // Analytics must never break an auth flow.
  }
  // GA4's recommended name, so the key-event reports label it correctly.
  pushDataLayer("sign_up", { method });
  metaPixel("track", "CompleteRegistration", { method });
}

/**
 * Fired when an existing account signs in. New accounts fire `signup` instead,
 * decided by the server's `isNewUser` rather than by inference. `surface`
 * records which screen the user authenticated from.
 */
export function trackAuthSuccess(
  method: AuthMethod,
  surface: "register" | "welcome" | "login" | "one_tap" | "unknown",
) {
  try {
    track("auth_success", { method, surface, ...attributionProps() });
  } catch {
    // Analytics must never break an auth flow.
  }
}

/**
 * Fired when a post goes live — the seller-side conversion. `surface` separates
 * the create flow from publishing a saved draft off the profile.
 */
export function trackPostPublished(surface: "create" | "drafts") {
  try {
    track("post_published", { surface, ...attributionProps() });
  } catch {
    // Analytics must never break a publish.
  }
  pushDataLayer("post_published", { surface });
  metaPixel("trackCustom", "PostPublished", { surface });
}
