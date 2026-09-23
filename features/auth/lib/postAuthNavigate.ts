"use client";

import type { useRouter } from "next/navigation";
import { markScrollRestore } from "@/components/layout/RouteScrollRestoration";
import { locales } from "@/i18n/config";

type Router = ReturnType<typeof useRouter>;

/** The cookie the proxy reads to decide whether a session exists. */
const AUTH_HINT = "shopi-auth-hint=1";

function isLandingPath(path: string, lang: string): boolean {
  const localizedRoots = new Set(["/", `/${lang}`, ...locales.map((l) => `/${l}`)]);
  return localizedRoots.has(path);
}

function canonicalAppPath(path: string): string {
  for (const locale of locales) {
    if (path === `/${locale}/feed`) return `/${locale}/for-you`;
    if (path.startsWith(`/${locale}/feed?`)) {
      return path.replace(`/${locale}/feed`, `/${locale}/for-you`);
    }
    if (path.startsWith(`/${locale}/feed/`)) {
      return path.replace(`/${locale}/feed`, `/${locale}/for-you`);
    }
  }
  return path;
}

/**
 * Where to land after signing in.
 *
 * `from` is recorded by the auth guard and is the page the user was ON when
 * they were interrupted, not the action they were attempting — so sending them
 * back to it returns them where they were rather than bouncing them into
 * another guard.
 *
 * Only same-origin paths are honoured; `from` comes off the query string, and
 * following it blindly is an open redirect.
 */
export function authDestination(from: string | undefined, lang: string): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    return isLandingPath(from, lang)
      ? `/${lang}/for-you`
      : canonicalAppPath(from);
  }

  return `/${lang}/for-you`;
}

/**
 * Leave the auth screen after a successful sign-in.
 *
 * This used to be `window.location.assign`, a full document load. It was there
 * for a real reason — the proxy gates protected routes on the `shopi-auth-hint`
 * cookie, and a soft navigation that raced the cookie write got bounced
 * straight back to auth, the bug people worked around by reloading. But a full
 * load also empties the Apollo cache, and the feed's accumulated pages live
 * there. Signing in from the two-hundredth post returned you to the first one.
 *
 * So: navigate client-side, but only once the cookie is actually readable.
 * `document.cookie` is synchronous, so by this point the write has landed and
 * the check passes; if it somehow has not, we fall back to the old hard
 * navigation rather than risk the bounce. The cache survives either way it
 * matters, and viewer-scoped fields are refreshed separately by
 * RefetchOnAuthChange.
 *
 * `refresh()` is what stops Next serving a Router Cache entry that was
 * prefetched while signed out — the other half of the "it only works after a
 * reload" symptom.
 */
export function navigateAfterAuth(router: Router, destination: string): void {
  if (typeof window === "undefined") {
    router.replace(destination);
    return;
  }

  if (!document.cookie.includes(AUTH_HINT)) {
    window.location.assign(destination);
    return;
  }

  // The guard interrupted them mid-scroll, so arriving back is a return, not a
  // fresh visit. Without this the feed comes back with every page it had —
  // the cache survived — but pinned to the top, which is most of the problem
  // the reload caused in the first place.
  markScrollRestore(destination);

  router.replace(destination);
  router.refresh();
}
