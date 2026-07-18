"use client";

import { useAuthSession } from "@/hooks/useAuthSession";
import { Pill } from "./Pill";

/**
 * Hero CTA pair that adapts to the session. Guests see "Open the feed";
 * signed-in visitors see "Continue to your feed" instead — the landing page
 * stays browsable, but the way back into the product is one obvious tap.
 */
export function HeroCtas({
  lang,
  ctaPrimary,
  ctaLoggedIn,
  ctaSecondary,
}: {
  lang: string;
  ctaPrimary: string;
  ctaLoggedIn: string;
  ctaSecondary: string;
}) {
  const { isAuthenticated } = useAuthSession();

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
      <Pill
        href={`/${lang}/feed`}
        className="bg-primary px-7 py-3.5 text-white hover:opacity-90"
      >
        {isAuthenticated ? ctaLoggedIn : ctaPrimary}
      </Pill>
      <Pill href={`/${lang}/upload`} variant="outline" className="px-7 py-3.5">
        {ctaSecondary}
      </Pill>
    </div>
  );
}
