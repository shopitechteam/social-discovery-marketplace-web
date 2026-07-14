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
      urlTemplate: `${url}/search?q={search_term_string}`,
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

/**
 * A single marketplace listing as a schema.org Product with an Offer. This is
 * what powers rich product results in Google and lets answer/generative engines
 * (AEO/GEO) understand the item — what it is, its price, where it's sold, and by
 * whom. `price` of 0 is treated as "contact for price" (no Offer price emitted).
 */
export function productSchema(input: {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  images: string[];
  price?: number | null;
  currency?: string | null;
  negotiable?: boolean | null;
  sellerName?: string | null;
  locationName?: string | null;
  category?: string | null;
  createdAt?: string | null;
}) {
  const hasPrice = typeof input.price === "number" && input.price > 0;

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: input.url,
    priceCurrency: input.currency || "KES",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/UsedCondition",
    ...(hasPrice
      ? { price: String(input.price) }
      : { price: "0", description: "Contact seller for price" }),
    ...(input.sellerName
      ? {
          seller: { "@type": "Person", name: input.sellerName },
        }
      : {}),
    ...(input.locationName
      ? {
          areaServed: { "@type": "Place", name: input.locationName },
        }
      : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${input.url}#product`,
    name: input.title,
    ...(input.description ? { description: input.description } : {}),
    ...(input.images.length ? { image: input.images } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.createdAt ? { releaseDate: input.createdAt } : {}),
    brand: { "@type": "Brand", name },
    offers: offer,
    isRelatedTo: { "@id": `${url}/#app` },
  };
}

/**
 * A creator/seller profile as a schema.org ProfilePage wrapping a Person. Helps
 * search + answer engines (AEO/GEO) understand who the seller is and surface
 * their entity (name, handle, follower/post counts) in results and AI answers.
 */
export function profilePageSchema(input: {
  url: string;
  displayName: string;
  username?: string | null;
  bio?: string | null;
  avatar?: string | null;
  website?: string | null;
  followerCount?: number | null;
  postCount?: number | null;
}) {
  const sameAs = [input.website].filter(Boolean) as string[];

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${input.url}#profile`,
    url: input.url,
    mainEntity: {
      "@type": "Person",
      name: input.displayName,
      ...(input.username ? { alternateName: `@${input.username}` } : {}),
      ...(input.bio ? { description: input.bio } : {}),
      ...(input.avatar ? { image: input.avatar } : {}),
      ...(sameAs.length ? { sameAs } : {}),
      url: input.url,
      memberOf: { "@id": `${url}/#organization` },
      ...(typeof input.followerCount === "number" ||
      typeof input.postCount === "number"
        ? {
            interactionStatistic: [
              ...(typeof input.followerCount === "number"
                ? [
                    {
                      "@type": "InteractionCounter",
                      interactionType: "https://schema.org/FollowAction",
                      userInteractionCount: input.followerCount,
                    },
                  ]
                : []),
              ...(typeof input.postCount === "number"
                ? [
                    {
                      "@type": "InteractionCounter",
                      interactionType: "https://schema.org/WriteAction",
                      userInteractionCount: input.postCount,
                    },
                  ]
                : []),
            ],
          }
        : {}),
    },
  };
}

/** Renders one or more schema objects as a single JSON-LD script payload. */
export function jsonLd(...schemas: object[]): string {
  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas).replace(
    /</g,
    "\\u003c",
  );
}
