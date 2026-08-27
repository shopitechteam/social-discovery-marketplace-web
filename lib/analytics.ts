"use client";

import { track } from "@vercel/analytics";
import { attributionProps } from "@/lib/attribution";

/**
 * Custom-event wrappers over Vercel Analytics.
 *
 * Every auth event carries first-touch attribution, so the Vercel Analytics
 * dashboard can break signups down by source/medium instead of only showing
 * referrers for anonymous pageviews.
 *
 * Note: `track()` is a no-op on the Hobby plan — custom events need Web
 * Analytics Plus. Pageview referrers work on every plan regardless.
 */

type AuthMethod = "email" | "google" | "apple" | "facebook" | "tiktok";

/** Fired when a brand-new account is created. */
export function trackSignup(method: AuthMethod) {
  try {
    track("signup", { method, ...attributionProps() });
  } catch {
    // Analytics must never break an auth flow.
  }
}

/**
 * Fired when an existing account signs in. New accounts fire `signup` instead,
 * decided by the server's `isNewUser` rather than by inference. `surface`
 * records which screen the user authenticated from.
 */
export function trackAuthSuccess(
  method: AuthMethod,
  surface: "register" | "welcome" | "login" | "unknown",
) {
  try {
    track("auth_success", { method, surface, ...attributionProps() });
  } catch {
    // Analytics must never break an auth flow.
  }
}
