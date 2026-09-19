"use client";

import { useEffect, useRef, useState } from "react";
import { useOAuthMutation } from "@/features/auth/hooks/useOAuthMutation";
import { GoogleIcon } from "./AuthIcons";

interface Props {
  lang: string;
  from?: string;
  /** Label prefix: "Continue" (default) or "Sign in" or "Sign up" */
  verb?: string;
  /** Which auth screen this is, for signup-source analytics. */
  surface?: "register" | "welcome" | "login";
}

export function SocialButtons({
  lang,
  from,
  verb = "Continue",
  surface = "welcome",
}: Props) {
  const { renderGoogleButton, loading } = useOAuthMutation(lang, from, surface);
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = googleButtonRef.current;
    if (!container) return;
    setError(null);
    setGoogleReady(false);
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    void renderGoogleButton(container, setError).then((unsub) => {
      unsubscribe = unsub;
      if (!cancelled) setGoogleReady(container.childNodes.length > 0);
    });
    // Auth pages mount this component twice at once (a mobile copy and a
    // desktop copy, CSS-toggled) — unsubscribing on unmount keeps this
    // instance's loading/error state from being written to after it's gone.
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [renderGoogleButton]);

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-xl border border-error/20 bg-error/10 px-3 py-2 text-center text-xs font-medium text-error">
          {error}
        </p>
      )}

      {/* The real GIS button remains the click target; the visible layer gives
          Shopi a clean, consistent button without breaking popup trust.
          Until Google's script has actually rendered its button into
          googleButtonRef, that overlay div is empty — but it still sits on
          top (z-20) and was still catching clicks, which silently swallowed
          the tap with no popup and no feedback. Disable pointer events on
          the whole control for that window, same as the post-click `loading`
          state, so an early click does nothing visible rather than nothing
          at all. */}
      <div
        aria-busy={loading || !googleReady}
        className={`relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-app shadow-sm transition-colors duration-200 ${loading || !googleReady ? "pointer-events-none opacity-60" : "hover:border-primary/35 hover:bg-surface"}`}
      >
        {!googleReady ? (
          <div className="absolute inset-0 animate-pulse bg-[rgb(var(--color-bg-subtle)/0.5)]" />
        ) : null}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-3 px-4 text-base font-semibold text-default">
          <GoogleIcon />
          <span>{verb} with Google</span>
        </div>
        <div
          ref={googleButtonRef}
          className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-xl opacity-0"
        />
      </div>
    </div>
  );
}
