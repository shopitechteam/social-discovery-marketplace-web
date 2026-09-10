"use client";

import { useAuthSession } from "@/hooks/useAuthSession";
import { Pill } from "./Pill";

/**
 * Hero CTA pair.
 *
 * The loud CTA is posting, not browsing. Browsing needs no account (see
 * proxy.ts — only /upload, /notifications, /settings and the private profile
 * screens are gated), so a hero that led with "Open the feed" sent its highest-
 * intent traffic down the one path that never asks anyone to sign up. "/upload"
 * hits the auth wall and lands on auth-welcome, which reads the `from` param
 * and switches to seller copy.
 *
 * Signed-in visitors get the same order with softer labels: the primary still
 * points at the post flow (the action that actually needs doing), and the feed
 * moves to the quiet button.
 */
export function HeroCtas({
  lang,
  ctaPost,
  ctaPostShort,
  ctaFeed,
  ctaFeedLoggedIn,
}: {
  lang: string;
  ctaPost: string;
  ctaPostShort: string;
  ctaFeed: string;
  ctaFeedLoggedIn: string;
}) {
  const { isAuthenticated } = useAuthSession();

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
      <Pill
        href={`/${lang}/upload`}
        className="bg-primary px-7 py-3.5 text-white hover:opacity-90"
      >
        {isAuthenticated ? ctaPostShort : ctaPost}
      </Pill>
      <Pill href={`/${lang}/feed`} variant="outline" className="px-7 py-3.5">
        {isAuthenticated ? ctaFeedLoggedIn : ctaFeed}
      </Pill>
    </div>
  );
}
