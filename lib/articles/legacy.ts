import { blogPosts } from "../blog.ts";
import type { BlogPost } from "../blog.ts";
import type {
  Article,
  ArticleIntent,
  ArticleSection,
  LinkTarget,
} from "./types.ts";

/**
 * The original blog posts (lib/blog.ts), mapped onto the article model so they
 * render through the same template, keep their URLs, and join the related-
 * article pool. Their content is untouched; only the placement below is new.
 */
const PLACEMENT: Record<
  string,
  {
    category: "selling" | "shopi";
    intent: ArticleIntent;
    tags: string[];
    cta: Article["cta"];
  }
> = {
  "how-shopi-agent-helps-kenyan-buyers-and-sellers-every-day": {
    category: "shopi",
    intent: "insight",
    tags: ["shopi-agent", "selling"],
    cta: {
      label: "See what Shopi Agent does",
      to: { kind: "page", path: "/shopi-agent", label: "Shopi Agent" },
    },
  },
  "why-social-discovery-is-the-future-of-shopping-in-kenya": {
    category: "shopi",
    intent: "insight",
    tags: ["social-commerce"],
    cta: {
      label: "Browse Shopi",
      to: { kind: "page", path: "/for-you", label: "For You" },
    },
  },
  "how-to-sell-on-shopi-complete-guide-for-kenyan-sellers": {
    category: "selling",
    intent: "selling-guide",
    tags: ["selling", "shopi-agent"],
    cta: {
      label: "Sell for Free",
      to: { kind: "page", path: "/upload", label: "Post an item" },
    },
  },
  "video-commerce-vs-traditional-e-commerce-which-wins-in-africa": {
    category: "shopi",
    intent: "insight",
    tags: ["social-commerce", "video"],
    cta: {
      label: "Browse Shopi",
      to: { kind: "page", path: "/for-you", label: "For You" },
    },
  },
  "how-nairobi-local-sellers-are-winning-online-with-short-videos": {
    category: "selling",
    intent: "selling-guide",
    tags: ["selling", "video"],
    cta: {
      label: "Sell for Free",
      to: { kind: "page", path: "/upload", label: "Post an item" },
    },
  },
  "where-to-sell-used-items-in-kenya": {
    category: "selling",
    intent: "selling-guide",
    tags: ["selling", "second-hand"],
    cta: {
      label: "Sell for Free",
      to: { kind: "page", path: "/upload", label: "Post an item" },
    },
  },
  "how-to-sell-your-car-in-kenya-without-a-broker": {
    category: "selling",
    intent: "selling-guide",
    tags: ["selling", "cars", "used-cars"],
    cta: { label: "Sell your car", to: { kind: "hub", path: "/sell-car-kenya" } },
  },
  "how-much-is-my-car-worth-in-kenya": {
    category: "selling",
    intent: "selling-guide",
    tags: ["selling", "cars", "used-cars", "car-prices"],
    cta: { label: "Sell your car", to: { kind: "hub", path: "/sell-car-kenya" } },
  },
  "where-to-sell-your-car-in-kenya-city-by-city": {
    category: "selling",
    intent: "selling-guide",
    tags: ["selling", "cars"],
    cta: { label: "Sell your car", to: { kind: "hub", path: "/sell-car-kenya" } },
  },
};

const FALLBACK_PLACEMENT = {
  category: "shopi" as const,
  intent: "insight" as const,
  tags: [] as string[],
  cta: {
    label: "Browse Shopi",
    to: { kind: "page", path: "/for-you", label: "For You" } as LinkTarget,
  },
};

function slugifyHeading(heading: string): string {
  return (
    heading
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

function toSections(post: BlogPost): ArticleSection[] {
  const used = new Set<string>();
  const sections: ArticleSection[] = post.sections.map((section) => {
    let id = slugifyHeading(section.heading);
    for (let n = 2; used.has(id); n++) id = `${slugifyHeading(section.heading)}-${n}`;
    used.add(id);
    return {
      id,
      heading: section.heading,
      blocks: [
        ...section.body
          .split("\n\n")
          .filter((text) => text.trim())
          .map((text) => ({ type: "p" as const, text })),
        ...(section.list ? [{ type: "list" as const, items: section.list }] : []),
      ],
    };
  });

  // The old "Further reading" box, kept where the author put it: after the
  // body. Blog links become article targets so they are validated like any
  // other; the rest stay as the pages the author chose.
  if (post.relatedLinks?.length) {
    sections.push({
      id: "further-reading",
      heading: "Further reading",
      blocks: [
        {
          type: "links",
          title: "Further reading",
          links: post.relatedLinks.map(({ label, url, description }): LinkTarget => {
            if (/^https?:\/\//.test(url)) {
              return { kind: "external", url, label, description };
            }
            if (url.startsWith("/blog/")) {
              return { kind: "article", slug: url.slice("/blog/".length) };
            }
            return { kind: "page", path: url, label, description };
          }),
        },
      ],
    });
  }
  return sections;
}

export const LEGACY_ARTICLES: Article[] = blogPosts.map((post) => {
  const placement = PLACEMENT[post.slug] ?? FALLBACK_PLACEMENT;
  return {
    slug: post.slug,
    status: "published",
    intent: placement.intent,
    title: post.title,
    seoDescription: post.description,
    excerpt: post.excerpt,
    primaryKeyword: post.primaryKeyword,
    keywords: post.keywords,
    category: placement.category,
    tags: placement.tags,
    author: "shopi-team",
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    sections: toSections(post),
    faq: post.faq,
    marketplaceLinks: [],
    cta: placement.cta,
    readTime: post.readTime,
  };
});
