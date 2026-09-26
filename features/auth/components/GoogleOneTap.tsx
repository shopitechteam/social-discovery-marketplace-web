"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";
import { useAuthHydrated } from "@/lib/auth/useAuthHydrated";
import { useOAuthMutation } from "@/features/auth/hooks/useOAuthMutation";
import {
  allowGoogleAutoSelect,
  initializeGoogleIdentity,
  loadGoogleIdentity,
  promptOneTap,
  registerCredentialHandler,
} from "@/features/auth/lib/googleIdentity";

/**
 * Wait this long after the feed appears before offering One Tap: the first
 * screen is the feed, not a sign-in prompt, and the GIS script (~90 KB) never
 * competes with the feed's own first load on a phone.
 */
const ONE_TAP_DELAY_MS = 3_000;

function whenIdle(run: () => void): () => void {
  // Safari has no requestIdleCallback.
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout: 2_000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, 0);
  return () => window.clearTimeout(id);
}

/**
 * Google One Tap for logged-out visitors on the feed.
 *
 * Offers the visitor's Google account in a single tap — or, for someone who
 * has signed in with Google before, signs them in without one — and keeps
 * them right where they were: the feed just refetches as signed-in.
 *
 * Someone who signed out on purpose still sees it, but not automatically:
 * auto-select stays off (see disableGoogleAutoSelect) until they next sign in
 * with Google — otherwise signing out would land on the feed and sign them
 * straight back in. Dismissals are rate-limited by Google and the browser, so
 * it doesn't nag. Renders nothing itself — Google draws the prompt.
 */
export function GoogleOneTap({ lang, active }: { lang: string; active: boolean }) {
  const hydrated = useAuthHydrated();
  const isAuthed = useAuthStore((s) => !!s.accessToken);
  const { loginWithGoogle } = useOAuthMutation(lang, undefined, "one_tap", {
    stayOnPage: true,
  });

  useEffect(() => {
    if (!hydrated || isAuthed || !active) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;
    const unregister = registerCredentialHandler(async (response) => {
      if (!response.credential) return;
      const error = await loginWithGoogle(response.credential);
      if (error) toast.error("Couldn't sign you in with Google", { description: error });
      else allowGoogleAutoSelect();
    });

    let cancelIdle: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      cancelIdle = whenIdle(() => {
        loadGoogleIdentity()
          .then((id) => {
            if (cancelled) return;
            initializeGoogleIdentity(id, clientId);
            promptOneTap(id);
          })
          // No script, no prompt — the sign-in pages still have the button.
          .catch(() => {});
      });
    }, ONE_TAP_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelIdle?.();
      unregister();
    };
    // loginWithGoogle closes over the locale; re-running on it would re-prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAuthed, active]);

  return null;
}
