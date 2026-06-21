"use client";

import { useEffect, useState } from "react";
import { useOAuthMutation } from "@/features/auth/hooks/useOAuthMutation";
import { AppleIcon, GoogleIcon } from "./AuthIcons";

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
  const { triggerGoogle, triggerApple, loading, setLoading } =
    useOAuthMutation(lang, from);
  const [error, setError] = useState<string | null>(null);

  // Sign in with Apple only renders on Apple platforms. Detection runs after
  // mount (UA isn't reliable during SSR), so the button appears post-hydration
  // on iOS/macOS — no hydration mismatch since both server and first client
  // render agree on "hidden".
  const [showApple, setShowApple] = useState(false);
  useEffect(() => {
    setShowApple(detectApplePlatform());
  }, []);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const err = await triggerGoogle();
    setLoading(false);
    if (err) setError(err);
  }

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
          className="w-full flex items-center justify-center gap-3 h-13 rounded-2xl bg-white text-black font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50 shadow-sm"
        >
          <AppleIcon />
          <span>{verb} with Apple</span>
        </button>
      )}

      {/* Google — dark pill */}
      <button
        type="button"
        disabled={loading}
        onClick={handleGoogle}
        aria-label={`${verb} with Google`}
        className="w-full flex items-center justify-center gap-3 h-13 rounded-2xl bg-elevated border border-border text-default font-semibold text-base active:opacity-80 transition-opacity disabled:opacity-50"
      >
        <GoogleIcon />
        <span>{verb} with Google</span>
      </button>
    </div>
  );
}
