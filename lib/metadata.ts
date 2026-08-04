import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { isValidLocale, locales } from "@/i18n/config";

/**
 * hreflang alternates for a locale-agnostic path (e.g. "/about", "/blog/x").
 *
 * Every public page exists at both /en and /sw. Without these the two copies
 * compete as near-duplicates and engines pick the language themselves, which
 * for a Kenyan marketplace means Kiswahili speakers routinely getting the
 * English page. x-default points at /en as the fallback for unmatched locales.
 */
export function localeAlternates(path: string) {
  return {
    languages: {
      ...Object.fromEntries(
        locales.map((l) => [l, `${siteConfig.url}/${l}${path}`]),
      ),
      "x-default": `${siteConfig.url}/en${path}`,
    },
  };
}

/**
 * Metadata for private, personalized, or not-yet-built pages. Keeps them out
 * of the index (thin/duplicate pages dilute crawl budget and sitelink quality)
 * while still letting crawlers follow links through them.
 */
export function privatePageMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: true } };
}

/** Consistent metadata for public, locale-prefixed informational pages. */
export function publicPageMetadata(input: {
  lang: string;
  path: `/${string}`;
  title: string;
  description: string;
}): Metadata {
  const lang = isValidLocale(input.lang) ? input.lang : "en";
  const canonical = `${siteConfig.url}/${lang}${input.path}`;
  const shareTitle = `${input.title} | ${siteConfig.name}`;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical, ...localeAlternates(input.path) },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteConfig.name,
      locale: lang === "sw" ? "sw_KE" : "en_KE",
      title: shareTitle,
      description: input.description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: shareTitle,
      description: input.description,
      images: [siteConfig.ogImage],
    },
  };
}
