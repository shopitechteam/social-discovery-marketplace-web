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
    void renderGoogleButton(container, setError).then(() => {
      setGoogleReady(container.childNodes.length > 0);
    });
  }, [renderGoogleButton]);

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-xl border border-error/20 bg-error/10 px-3 py-2 text-center text-xs font-medium text-error">
          {error}
        </p>
      )}

      {/* The real GIS button remains the click target; the visible layer gives
          Shopi a clean, consistent button without breaking popup trust. */}
      <div
        aria-busy={loading}
        className={`relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-app shadow-sm transition-colors duration-200 ${loading ? "pointer-events-none opacity-60" : "hover:border-primary/35 hover:bg-surface"}`}
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
