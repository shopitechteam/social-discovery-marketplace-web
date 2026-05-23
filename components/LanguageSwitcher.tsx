"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: Locale) {
    if (next === current) return;
    // Replace the locale segment at the start of the path
    const segments = pathname.split("/");
    segments[1] = next; // segments[0] is "" (before leading slash)
    const newPath = segments.join("/") || "/";
    document.cookie = `shopi_locale=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    router.push(newPath);
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-default px-1 py-0.5" style={{ background: "rgb(var(--color-bg-elevated))" }}>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          aria-label={localeLabels[locale]}
          className={`rounded-full px-2.5 py-1 text-(length:--text-xs) font-semibold transition-colors ${
            locale === current
              ? "text-white"
              : "text-muted hover:text-foreground"
          }`}
          style={
            locale === current
              ? { background: "rgb(var(--brand-primary))" }
              : {}
          }
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
