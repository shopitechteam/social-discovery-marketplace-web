"use client";

import { useState } from "react";
import { useOAuthMutation } from "@/features/auth/hooks/useOAuthMutation";
import { AppleIcon, GoogleIcon } from "./AuthIcons";

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

      {/* Apple — white pill */}
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
