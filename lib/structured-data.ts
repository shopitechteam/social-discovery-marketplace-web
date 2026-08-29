import { siteConfig } from "@/config/site";

/**
 * JSON-LD structured data helpers.
 *
 * These power rich results in Google and answer/generative engines (AEO/GEO):
 * - Organization: who Shopi is (knowledge panel, brand entity).
 * - WebSite + SearchAction: describes Shopi's own search entry point.
 * - FAQPage: makes visible Q&A machine-readable for search and answer engines.
 */

const { url, name, supportEmail } = siteConfig;
const marketplaceTopics = [
  "Kenya classifieds",
  "social commerce in Kenya",
  "local marketplace Kenya",
  "buy and sell locally",
  "AI shopping assistant",
  "AI listing assistant",
  "photo and video product discovery",
  "cars for sale Kenya",
  "phones for sale Kenya",
  "beauty products Kenya",
  "property for sale Kenya",
];

/**
 * Shopi's founder as a distinct entity.
 *
 * Answer engines weigh who is behind a product heavily when judging whether a
 * young marketplace is trustworthy — "who founded Shopi?" previously had no
 * answer anywhere on the site, and an unanswerable question reads as a red flag.
 * Giving the person a real @id, a LinkedIn `sameAs` and a work history lets
 * engines resolve him to a verifiable identity rather than guessing.
 *
 * Deliberately no `alumniOf`: schema.org treats it as a completed affiliation,
 * and the degree was not completed, so claiming it here would be a false
 * machine-readable credential.
 *
 * This is an answer-engine-only surface by choice — the founder bio is NOT
 * rendered anywhere on the site. Note the trade-off: Google asks that
 * structured data reflect content visible on the page, so this node is unlikely
 * to earn a rich result and could in principle be flagged. It stays because its
 * job is entity resolution for LLMs and knowledge panels, not rich snippets.
 * The same facts are served at /llms.txt and /llms-full.txt.
 */
export const founderSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${url}/#founder`,
  name: "Mwangi Maina",
  jobTitle: "Founder, Shopi · Senior Software Engineer, Ooodles",
  description:
    "Kenyan software engineer and founder of Shopi. Studied computer science at Maseno University before moving into industry in 2021, working with the US startup Playback, then Bettercoach in Germany, and now Ooodles, where he was one of the pioneer engineers who built the platform from scratch.",
  nationality: { "@type": "Country", name: "Kenya" },
  // City-level only, deliberately. It answers "is Shopi actually run from
  // Kenya?" — the question that matters for a local marketplace — without
  // publishing anything more precise about a private individual.
  homeLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
  },
  worksFor: {
    "@type": "Organization",
    name: "Ooodles",
    url: "https://www.ooodles.com",
  },
  knowsAbout: [
    "software engineering",
    "social commerce",
    "marketplace platforms",
    "Kenyan e-commerce",
  ],
  sameAs: [
    "https://www.linkedin.com/in/mwangi-maina-6463281ab/",
    "https://www.ooodles.com",
  ],
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "OnlineBusiness",
  "@id": `${url}/#organization`,
  name,
  alternateName: ["Shopi Kenya", "Shopi Marketplace", "Shopi Agent"],
  url,
  logo: `${url}/assets/shopi-logo.png`,
  description: siteConfig.description,
  slogan: siteConfig.tagline,
  keywords: siteConfig.keywords.join(", "),
  knowsAbout: marketplaceTopics,
  foundingDate: "2025",
  foundingLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
  },
  // City-level, no street address: Shopi is remote-run and has no public
  // walk-in office, and inventing a postal address to fill the field would be
  // worse than leaving it at the city.
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  // Linked by @id rather than inlined, so the Person entity is defined once and
  // both the Organization and the /about page reference the same node.
  founder: { "@id": `${url}/#founder` },
  areaServed: {
    "@type": "Country",
    name: "Kenya",
  },
  sameAs: [
    "https://www.tiktok.com/@shopiapp",
    "https://twitter.com/shopiapp",
    "https://www.instagram.com/shopiapp",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: supportEmail,
    url: `${url}/en/contact`,
    areaServed: "KE",
    availableLanguage: ["English", "Kiswahili"],
  },
};

/**
 * ContactPage schema for /[lang]/contact. Lets answer engines quote a real
 * address when asked "how do I contact Shopi?" instead of guessing one.
 */
export function contactPageSchema(lang: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${url}/${lang}/contact#page`,
    url: `${url}/${lang}/contact`,
    name: `Contact ${name}`,
    description: `Reach ${name} for support, business, legal, privacy, copyright, and abuse-report enquiries in Kenya.`,
    inLanguage: lang === "sw" ? "sw-KE" : "en-KE",
    isPartOf: { "@id": `${url}/#website` },
    about: { "@id": `${url}/#organization` },
    mainEntity: {
      "@type": "Organization",
      "@id": `${url}/#organization`,
      name,
      email: supportEmail,
      url,
      areaServed: { "@type": "Country", name: "Kenya" },
    },
  };
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${url}/#website`,
  name,
  alternateName: ["Shopi Kenya marketplace", "Shopi social marketplace"],
  url,
  description: siteConfig.description,
  inLanguage: ["en-KE", "sw-KE"],
  keywords: siteConfig.keywords.join(", "),
  about: marketplaceTopics.map((topic) => ({
    "@type": "Thing",
    name: topic,
  })),
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
  keywords: siteConfig.keywords.join(", "),
  featureList: [
    "Free product listing creation",
    "Photo and video marketplace posts",
    "Built-in buyer and seller messaging",
    "AI-assisted listing creation",
    "AI-assisted product discovery",
    "Local discovery across Kenya",
  ],
  areaServed: {
    "@type": "Country",
    name: "Kenya",
  },
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
  featureList: [
    "Turns product photos into listing drafts",
    "Suggests titles, descriptions, categories and specifications",
    "Helps buyers find products from plain-language requests",
    "Uses product photos to understand buyer searches",
  ],
  keywords:
    "Shopi Agent, AI marketplace Kenya, AI shopping assistant, AI listing assistant, photo to listing AI",
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
  specs?: { key?: string | null; value?: string | null }[];
  createdAt?: string | null;
  updatedAt?: string | null;
}) {
  // A free item is still an offer — the previous `> 0` test dropped the Offer
  // entirely for them, leaving a Product with no price signal at all.
  const hasPrice = typeof input.price === "number" && input.price >= 0;

  const normalizedSpecs = new Map(
    (input.specs ?? [])
      .filter((spec) => spec.key?.trim() && spec.value?.trim())
      .map((spec) => [spec.key!.trim().toLowerCase(), spec.value!.trim()]),
  );
  const spec = (...keys: string[]) => {
    for (const key of keys) {
      const value = normalizedSpecs.get(key.toLowerCase());
      if (value) return value;
    }
    return undefined;
  };
  const conditionLabel = spec("condition", "item condition");
  const normalizedCondition = conditionLabel?.toLowerCase() ?? "";
  const condition = normalizedCondition
    ? normalizedCondition.includes("refurb") ||
      normalizedCondition.includes("recondition")
      ? "https://schema.org/RefurbishedCondition"
      : normalizedCondition.includes("damag") ||
          normalizedCondition.includes("for parts")
        ? "https://schema.org/DamagedCondition"
        : normalizedCondition.includes("used") ||
            normalizedCondition.includes("pre-owned") ||
            normalizedCondition.includes("second hand")
          ? "https://schema.org/UsedCondition"
          : normalizedCondition.includes("new") ||
              normalizedCondition.includes("sealed")
            ? "https://schema.org/NewCondition"
            : undefined
    : undefined;

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
        ...(condition ? { itemCondition: condition } : {}),
        priceValidUntil,
        ...(input.createdAt ? { validFrom: input.createdAt } : {}),
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
              availableAtOrFrom: {
                "@type": "Place",
                name: input.locationName,
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "KE",
                },
              },
            }
          : {}),
        ...(input.negotiable
          ? {
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: String(input.price),
                priceCurrency: input.currency || "KES",
                description:
                  "Seller states that the asking price is negotiable.",
              },
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
    mainEntityOfPage: input.url,
    ...(input.description ? { description: input.description } : {}),
    ...(input.images.length ? { image: input.images } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(spec("brand", "make", "manufacturer")
      ? {
          brand: {
            "@type": "Brand",
            name: spec("brand", "make", "manufacturer"),
          },
        }
      : {}),
    ...(spec("model") ? { model: spec("model") } : {}),
    ...(spec("colour", "color") ? { color: spec("colour", "color") } : {}),
    ...(spec("material") ? { material: spec("material") } : {}),
    ...(spec("size", "dimensions") ? { size: spec("size", "dimensions") } : {}),
    ...(spec("mpn") ? { mpn: spec("mpn") } : {}),
    ...(spec("gtin", "barcode") ? { gtin: spec("gtin", "barcode") } : {}),
    keywords: [
      input.title,
      input.category,
      input.locationName,
      "for sale in Kenya",
      "Shopi Kenya",
    ]
      .filter(Boolean)
      .join(", "),
    ...(input.specs?.length
      ? {
          additionalProperty: input.specs
            .filter((spec) => spec.key?.trim() && spec.value?.trim())
            .slice(0, 20)
            .map((spec) => ({
              "@type": "PropertyValue",
              name: spec.key!.trim(),
              value: spec.value!.trim(),
            })),
        }
      : {}),
    ...(offer ? { offers: offer } : {}),
    isRelatedTo: { "@id": `${url}/#app` },
  };
}

export function productWebPageSchema(input: {
  url: string;
  name: string;
  description: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "@id": `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: "en-KE",
    isPartOf: { "@id": `${url}/#website` },
    mainEntity: { "@id": `${input.url}#product` },
    publisher: { "@id": `${url}/#organization` },
    ...(input.createdAt ? { datePublished: input.createdAt } : {}),
    ...(input.updatedAt ? { dateModified: input.updatedAt } : {}),
  };
}

export function marketplaceWebPageSchema(input: {
  url: string;
  name: string;
  description: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: "en-KE",
    isPartOf: { "@id": `${url}/#website` },
    about: [
      { "@id": `${url}/#app` },
      ...(input.keywords ?? []).map((keyword) => ({
        "@type": "Thing",
        name: keyword,
      })),
    ],
    publisher: { "@id": `${url}/#organization` },
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
