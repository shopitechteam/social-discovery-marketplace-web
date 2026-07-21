"use client";

import { useEffect, useRef, useState } from "react";
import { useOAuthMutation } from "@/features/auth/hooks/useOAuthMutation";
import { AppleIcon } from "./AuthIcons";

/** True on iOS, iPadOS and macOS — the platforms where Sign in with Apple belongs. */
function detectApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPhone / iPod / iPad (incl. iPadOS reporting as "Macintosh" but with touch)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isMac = /Macintosh|Mac OS X/.test(ua);
  return isIOS || isMac;
}

interface Props {
  lang: string;
  from?: string;
  /** Label prefix: "Continue" (default) or "Sign in" or "Sign up" */
  verb?: string;
}

export function SocialButtons({ lang, from, verb = "Continue" }: Props) {
  const { renderGoogleButton, triggerApple, loading, setLoading } =
    useOAuthMutation(lang, from);
  const [error, setError] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Sign in with Apple only renders on Apple platforms. Detection runs after
  // mount (UA isn't reliable during SSR), so the button appears post-hydration
  // on iOS/macOS — no hydration mismatch since both server and first client
  // render agree on "hidden".
  const [showApple, setShowApple] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setShowApple(detectApplePlatform()),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = googleButtonRef.current;
    if (!container) return;
    void renderGoogleButton(container, setError);
  }, [renderGoogleButton]);

  async function handleApple() {
    setError(null);
    setLoading(true);
    const err = await triggerApple();
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-xs text-center text-error">{error}</p>}

      {/* Apple — white pill. Only on Apple platforms (iOS / iPadOS / macOS). */}
      {showApple && (
        <button
          type="button"
          disabled={loading}
          onClick={handleApple}
          aria-label={`${verb} with Apple`}
          className="hidden w-full items-center justify-center gap-3 h-13 rounded-2xl bg-white text-black font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 shadow-sm"
        >
          <AppleIcon />
          <span>{verb} with Apple</span>
        </button>
      )}

      {/* This must be Google's real rendered button. Calling click() on a hidden
          GIS button loses the trusted user gesture in standalone PWAs. */}
      <div
        aria-busy={loading}
        className={`relative w-full rounded-2xl border border-border bg-elevated p-1.5 shadow-[0_8px_24px_rgb(15_15_20_/_0.06)] transition-all duration-200 ${loading ? "pointer-events-none opacity-50" : "hover:border-primary/35 hover:shadow-[0_10px_28px_rgb(216_20_112_/_0.12)]"}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-7 top-0 h-px bg-linear-to-r from-transparent via-primary/45 to-transparent"
        />
        <div
          ref={googleButtonRef}
          className="min-h-11 w-full overflow-hidden rounded-xl"
        />
      </div>
    </div>
  );
}
