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

  // Phones: two equal 48px buttons side by side, in thumb reach.
  return (
    <div className="mt-5 grid grid-cols-2 gap-2.5 md:mt-10 md:flex md:flex-wrap md:items-center md:gap-3">
      <Pill
        href={`/${lang}/upload`}
        className="h-12 bg-primary px-4 py-0 text-[0.9375rem] text-white hover:opacity-90 md:h-auto md:px-7 md:py-3.5 md:text-sm"
      >
        {isAuthenticated ? ctaPostShort : ctaPost}
      </Pill>
      <Pill
        href={`/${lang}/for-you`}
        variant="outline"
        className="h-12 px-4 py-0 text-[0.9375rem] md:h-auto md:px-7 md:py-3.5 md:text-sm"
      >
        {isAuthenticated ? ctaFeedLoggedIn : ctaFeed}
      </Pill>
    </div>
  );
}
