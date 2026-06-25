import { siteConfig } from "@/config/site";

/**
 * JSON-LD structured data helpers.
 *
 * These power rich results in Google and answer/generative engines (AEO/GEO):
 * - Organization: who Shopi is (knowledge panel, brand entity).
 * - WebSite + SearchAction: enables the sitelinks search box and tells engines
 *   how to search the site.
 * - FAQPage: surfaces Q&A directly in search and AI answers.
 */

const { url, name } = siteConfig;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${url}/#organization`,
  name,
  url,
  logo: `${url}/assets/shopi-logo.png`,
  description: siteConfig.description,
  foundingDate: "2025",
  areaServed: {
    "@type": "Country",
    name: "Kenya",
  },
  sameAs: [
    "https://www.tiktok.com/@shopiapp",
    "https://twitter.com/shopiapp",
    "https://www.instagram.com/shopiapp",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${url}/#website`,
  name,
  url,
  description: siteConfig.description,
  inLanguage: "en-KE",
  publisher: { "@id": `${url}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${url}/explore?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

/**
 * The marketplace as a service/application — communicates to engines that Shopi
 * is a place to buy and sell, free of charge, across Kenya.
 */
export const marketplaceSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${url}/#app`,
  name,
  url,
  applicationCategory: "ShoppingApplication",
  operatingSystem: "Web, iOS, Android",
  description: siteConfig.description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KES",
    description: "Free to use. No commission, no listing fees.",
  },
  publisher: { "@id": `${url}/#organization` },
};

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Renders one or more schema objects as a single JSON-LD script payload. */
export function jsonLd(...schemas: object[]): string {
  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas).replace(
    /</g,
    "\\u003c",
  );
}
