"use client";

import { useState } from "react";
import { useOAuthMutation } from "@/features/auth/hooks/useOAuthMutation";
import { AppleIcon, GoogleIcon, FacebookIcon } from "./AuthIcons";

/** True only on iOS / macOS — the platforms where Apple Sign In makes sense */
function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
}

interface Props {
  lang: string;
  from?: string;
}

export function SocialButtons({ lang, from }: Props) {
  const { triggerGoogle, triggerApple, triggerFacebook, loading, setLoading } =
    useOAuthMutation(lang, from);
  const [error, setError] = useState<string | null>(null);
  const showApple = isApplePlatform();

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

  async function handleFacebook() {
    setError(null);
    setLoading(true);
    const err = await triggerFacebook();
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-xs text-center text-error">{error}</p>}
      <div className="flex gap-3">
        {showApple && (
          <button
            type="button"
            disabled={loading}
            onClick={handleApple}
            aria-label="Continue with Apple"
            className="flex-1 flex items-center justify-center h-12 rounded-2xl bg-black text-white active:opacity-75 transition-opacity disabled:opacity-50"
          >
            <AppleIcon />
          </button>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogle}
          aria-label="Continue with Google"
          className="flex-1 flex items-center justify-center h-12 rounded-2xl border border-border bg-elevated active:opacity-75 transition-opacity disabled:opacity-50"
        >
          <GoogleIcon />
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleFacebook}
          aria-label="Continue with Facebook"
          className="flex-1 flex items-center justify-center h-12 rounded-2xl bg-[#1877F2] text-white active:opacity-75 transition-opacity disabled:opacity-50"
        >
          <FacebookIcon />
        </button>
      </div>
    </div>
  );
}
