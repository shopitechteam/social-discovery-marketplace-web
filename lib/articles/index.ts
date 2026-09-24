import { getAuthor } from "./authors.ts";
import { CATEGORIES, getCategory } from "./categories.ts";
import { inlineLinks, plainText } from "./inline.ts";
import { resolveLink } from "./links.ts";
import { ALL_ARTICLES } from "./registry.ts";
import type { Article, Block, LinkTarget } from "./types.ts";

/**
 * The blog's read API. Routes, the sitemap and the hub pages all go through
 * these functions, so "what is published" is decided in one place.
 */

export type * from "./types.ts";
export { articlePath, categoryPath, isKnownInternalPath, resolveLink } from "./links.ts";
export type { ResolvedLink } from "./links.ts";
export { parseInline, plainText } from "./inline.ts";
export type { InlineToken } from "./inline.ts";
export { CATEGORIES, getAuthor, getCategory };

export const lastModified = (article: Article) =>
  article.updatedAt ?? article.publishedAt;

/**
 * Published and past its publish date. A future publishedAt schedules an
 * article: it goes live on the first build or revalidation after that date.
 */
export function isLive(article: Article, now = new Date()): boolean {
  return (
    article.status === "published" &&
    new Date(article.publishedAt).getTime() <= now.getTime()
  );
}

const byNewest = (a: Article, b: Article) =>
  b.publishedAt.localeCompare(a.publishedAt) ||
  lastModified(b).localeCompare(lastModified(a));

/** Live articles, newest first. `includeDrafts` is for local previews only. */
export function getArticles({
  includeDrafts = false,
}: { includeDrafts?: boolean } = {}): Article[] {
  return ALL_ARTICLES.filter((article) => includeDrafts || isLive(article)).sort(
    byNewest,
  );
}

export function getArticle(
  slug: string,
  options: { includeDrafts?: boolean } = {},
): Article | undefined {
  return getArticles(options).find((article) => article.slug === slug);
}

export function getArticlesInCategory(slug: string): Article[] {
  return getArticles().filter((article) => article.category === slug);
}

/** Categories that have at least one live article, in display order. */
export function getActiveCategories() {
  const live = new Set(getArticles().map((article) => article.category));
  return CATEGORIES.filter((category) => live.has(category.slug)).sort(
    (a, b) => a.order - b.order,
  );
}

/**
 * Hand-picked related articles first, then the closest matches by shared
 * tags, category and intent. Never padded with unrelated articles: two good
 * links beat four where two are noise.
 */
export function getRelatedArticles(article: Article, count = 3): Article[] {
  const pool = getArticles().filter((other) => other.slug !== article.slug);
  const picked = (article.related ?? [])
    .map((slug) => pool.find((other) => other.slug === slug))
    .filter((other): other is Article => Boolean(other));

  const tags = new Set(article.tags);
  const scored = pool
    .filter((other) => !picked.includes(other))
    .map((other) => ({
      other,
      score:
        other.tags.filter((tag) => tags.has(tag)).length * 3 +
        (other.category === article.category ? 2 : 0) +
        (other.intent === article.intent ? 1 : 0),
    }))
    .filter(({ score }) => score >= 2)
    .sort(
      (a, b) =>
        b.score - a.score ||
        lastModified(b.other).localeCompare(lastModified(a.other)),
    )
    .map(({ other }) => other);

  return [...picked, ...scored].slice(0, count);
}

function blockText(block: Block): string[] {
  switch (block.type) {
    case "p":
    case "h3":
      return [block.text];
    case "callout":
      return [block.title ?? "", block.text];
    case "list":
    case "checklist":
      return block.items;
    case "table":
      return [...block.head, ...block.rows.flat(), block.caption ?? ""];
    default:
      return [];
  }
}

/** Every piece of body copy a reader sees, marks removed. */
export function articleText(article: Article): string[] {
  return [
    article.excerpt,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.blocks.flatMap(blockText),
    ]),
    ...(article.faq ?? []).flatMap(({ q, a }) => [q, a]),
  ].map(plainText);
}

export function wordCount(article: Article): number {
  return articleText(article).join(" ").split(/\s+/).filter(Boolean).length;
}

export function readingTime(article: Article): string {
  return article.readTime ?? `${Math.max(1, Math.round(wordCount(article) / 200))} min read`;
}

/** Every link target an article uses, inline links included. */
export function articleLinkTargets(article: Article): LinkTarget[] {
  // blockText returns the raw copy, marks intact, so inline links survive.
  const inline = [
    article.excerpt,
    ...article.sections.flatMap((section) => section.blocks.flatMap(blockText)),
  ]
    .flatMap(inlineLinks)
    .map((path): LinkTarget => ({ kind: "page", path, label: path }));
  return [
    ...article.marketplaceLinks,
    article.cta.to,
    ...article.sections.flatMap((section) =>
      section.blocks.flatMap((block) => (block.type === "links" ? block.links : [])),
    ),
    ...inline,
  ];
}

/**
 * Articles that link to a given page — so a marketplace page can link back
 * to the guides that point at it, without anyone maintaining that list.
 */
export function getArticlesLinkingTo(target: LinkTarget): Article[] {
  const href = resolveLink(target)?.href.split("?")[0];
  if (!href) return [];
  return getArticles().filter((article) =>
    articleLinkTargets(article).some(
      (link) => resolveLink(link)?.href.split("?")[0] === href,
    ),
  );
}
