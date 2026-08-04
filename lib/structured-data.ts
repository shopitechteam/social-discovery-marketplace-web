import { siteConfig } from "@/config/site";

/**
 * JSON-LD structured data helpers.
 *
 * These power rich results in Google and answer/generative engines (AEO/GEO):
 * - Organization: who Shopi is (knowledge panel, brand entity).
 * - WebSite + SearchAction: describes Shopi's own search entry point.
 * - FAQPage: makes visible Q&A machine-readable for search and answer engines.
 */

const { url, name } = siteConfig;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "OnlineBusiness",
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
      urlTemplate: `${url}/en/search?q={search_term_string}`,
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
  operatingSystem: "Any",
  description: siteConfig.description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KES",
    description: "Free to use. No commission, no listing fees.",
  },
  publisher: { "@id": `${url}/#organization` },
};

/**
 * The AI assistant as its own application, so engines can surface Shopi Agent
 * separately from the marketplace it sits inside.
 */
export const agentSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${url}/#agent`,
  name: "Shopi Agent",
  url,
  applicationCategory: "ArtificialIntelligenceApplication",
  operatingSystem: "Any",
  description:
    "AI assistant that helps users buy and sell on Shopi by generating listings and finding products.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KES",
  },
  isPartOf: { "@id": `${url}/#app` },
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
  /** Seller's public profile URL, so the Offer links to a real entity. */
  sellerUrl?: string | null;
  locationName?: string | null;
  category?: string | null;
  createdAt?: string | null;
}) {
  // A free item is still an offer — the previous `> 0` test dropped the Offer
  // entirely for them, leaving a Product with no price signal at all.
  const hasPrice = typeof input.price === "number" && input.price >= 0;

  // Marketplace listings are overwhelmingly second-hand and Google treats a
  // missing itemCondition as "new", which misrepresents most of the inventory.
  const condition = "https://schema.org/UsedCondition";

  // Google warns on offers with no priceValidUntil. Listings have no natural
  // expiry, so declare the revalidation horizon we actually honour: a year.
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);

  const offer: Record<string, unknown> | null = hasPrice
    ? {
        "@type": "Offer",
        url: input.url,
        priceCurrency: input.currency || "KES",
        price: String(input.price),
        availability: "https://schema.org/InStock",
        itemCondition: condition,
        priceValidUntil,
        ...(input.sellerName
          ? {
              seller: {
                "@type": "Person",
                name: input.sellerName,
                // Links the offer to the seller's ProfilePage entity, which is
                // what lets engines answer "who sells X near me" with a name.
                ...(input.sellerUrl
                  ? {
                      url: input.sellerUrl,
                      "@id": `${input.sellerUrl}#profile`,
                    }
                  : {}),
              },
            }
          : {}),
        ...(input.locationName
          ? {
              areaServed: { "@type": "Place", name: input.locationName },
            }
          : {}),
      }
    : null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${input.url}#product`,
    name: input.title,
    sku: input.id,
    ...(input.description ? { description: input.description } : {}),
    ...(input.images.length ? { image: input.images } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(offer ? { offers: offer } : {}),
    isRelatedTo: { "@id": `${url}/#app` },
  };
}

/**
 * An ItemList of listings for a browse surface.
 *
 * Gives engines a machine-readable inventory snapshot of a hub page and is the
 * input Google uses for merchant-style carousels. Only emit it on pages that
 * actually render these items — schema describing content a page doesn't show
 * is a structured-data violation.
 */
export function listingItemListSchema(input: {
  id: string;
  name: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": input.id,
    name: input.name,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * A county landing page as a CollectionPage about a real Place.
 *
 * Gives engines an explicit place entity to bind local-intent queries to
 * ("furniture for sale in Nakuru") instead of inferring location from prose,
 * and connects the page back to the marketplace and organisation entities.
 */
export function countyPageSchema(input: {
  url: string;
  countyName: string;
  description: string;
  towns: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${input.url}#collection`,
    url: input.url,
    name: `Buy and sell in ${input.countyName}, Kenya`,
    description: input.description,
    isPartOf: { "@id": `${url}/#website` },
    about: {
      "@type": "Place",
      "@id": `${input.url}#place`,
      name: input.countyName,
      address: {
        "@type": "PostalAddress",
        addressRegion: input.countyName,
        addressCountry: "KE",
      },
      ...(input.towns.length
        ? {
            containsPlace: input.towns.map((town) => ({
              "@type": "Place",
              name: town,
            })),
          }
        : {}),
    },
    provider: { "@id": `${url}/#organization` },
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
