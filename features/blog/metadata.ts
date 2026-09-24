import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * Metadata for the blog's pages.
 *
 * Blog content is written in English only, but every route also exists under
 * /sw. Declaring the /sw copy as a Kiswahili alternate would tell engines
 * there is a Kiswahili version when there isn't one, so both locales
 * canonicalise to /en and the only hreflang is English (plus x-default).
 *
 * Images are left out on purpose: an article's own opengraph-image route (or
 * the site-wide card) supplies og:image, and listing one here would override
 * it with a hand-built URL that misses Next's fingerprint.
 */
export function blogCanonical(path: string, canonicalUrl?: string) {
  return canonicalUrl ?? `${siteConfig.url}/en${path}`;
}

export function blogPageMetadata(input: {
  path: `/${string}`;
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  noindex?: boolean;
  article?: {
    publishedTime: string;
    modifiedTime: string;
    authors: string[];
    section: string;
    tags: string[];
  };
}): Metadata {
  const canonical = blogCanonical(input.path, input.canonicalUrl);
  const ownCanonical = canonical === `${siteConfig.url}/en${input.path}`;

  return {
    title: input.title,
    description: input.description,
    ...(input.keywords?.length ? { keywords: input.keywords } : {}),
    alternates: {
      canonical,
      // hreflang only makes sense for a page that is its own canonical.
      ...(ownCanonical
        ? { languages: { en: canonical, "x-default": canonical } }
        : {}),
    },
    ...(input.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: input.article ? "article" : "website",
      url: canonical,
      siteName: siteConfig.name,
      locale: "en_KE",
      title: input.title,
      description: input.description,
      ...(input.article ?? {}),
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: input.title,
      description: input.description,
    },
  };
}
