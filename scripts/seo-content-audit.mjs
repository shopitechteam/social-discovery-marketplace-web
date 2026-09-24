/**
 * On-page SEO + quality audit for the blog (lib/articles/, which also carries
 * the original lib/blog.ts posts).
 *
 *   npm run seo:audit            # all checks, exits 1 on errors
 *   npm run seo:audit -- --stale-days=120
 *
 * Errors (fail the run) are rules every article must meet:
 *   - slug is lowercase-hyphenated and unique; title, <title> and meta
 *     description are unique; meta description present, 155 characters or fewer
 *   - primaryKeyword in the title, the lead (excerpt), the body and the
 *     meta description
 *   - category, author and related articles exist
 *   - every link resolves: typed LinkTargets against the data that owns each
 *     route, inline [label](/path) links against the known routes
 *   - featured image exists in /public and has alt text
 *   - live-listing blocks have a ListingSpec; price guides show a price
 *     (live or verified); verified prices name a source and a check date
 *   - section ids unique; dates valid; canonicalUrl absolute
 *
 * Warnings are prompts for an editor rather than hard rules:
 *   - thin content: under ~350 words for search guides, ~1500 for the long
 *     selling/insight posts
 *   - a lead over 70 words (the answer should come first)
 *   - <title> over 70 characters with the " | Shopi" suffix
 *   - fewer than three internal links
 *   - not reviewed within --stale-days (default 180), or verified prices
 *     checked more than 90 days ago
 *
 * Content refresh process: run this monthly. For each article flagged as due
 * for review, re-check facts that date (fees, NTSA process, prices, model
 * ranges, app features), update what has drifted, and set `updatedAt` to the
 * day of the edit. Don't bump `updatedAt` for typo fixes — the date feeds the
 * sitemap, Article schema and the visible "Updated" line, and a date that
 * changes without the content changing teaches engines to ignore it.
 *
 * Requires Node 22.18+ (imports the TypeScript source directly).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  articleLinkTargets,
  articleText,
  CATEGORIES,
  getAuthor,
  getCategory,
  resolveLink,
  wordCount,
} from "../lib/articles/index.ts";
import { parseInline } from "../lib/articles/inline.ts";
import { ALL_ARTICLES } from "../lib/articles/registry.ts";

const DESCRIPTION_MAX = 155;
const TITLE_MAX = 70;
const LEAD_MAX_WORDS = 70;
const PRICE_CHECK_MAX_DAYS = 90;
const TITLE_SUFFIX = " | Shopi";
const LONG_FORM = new Set(["selling-guide", "insight"]);
const staleArg = process.argv.find((a) => a.startsWith("--stale-days="));
const STALE_DAYS = staleArg ? Number(staleArg.split("=")[1]) : 180;

const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const contains = (text, phrase) => normalize(text).includes(normalize(phrase));
const words = (s) => (s.match(/\S+/g) ?? []).length;
const plain = (s) => parseInline(s).map((t) => t.text).join("");
const isDate = (s) => typeof s === "string" && !Number.isNaN(Date.parse(s));
const daysSince = (iso) => Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);

function countBy(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return counts;
}
const slugCounts = countBy(ALL_ARTICLES.map((a) => a.slug));
const titleCounts = countBy(ALL_ARTICLES.map((a) => normalize(a.title)));
const seoTitleCounts = countBy(ALL_ARTICLES.map((a) => normalize(a.seoTitle ?? a.title)));
const descriptionCounts = countBy(ALL_ARTICLES.map((a) => normalize(a.seoDescription)));
const published = new Set(
  ALL_ARTICLES.filter((a) => a.status === "published").map((a) => a.slug),
);

let errorCount = 0;
let warningCount = 0;

function report(label, errors, warnings, detail = "") {
  errorCount += errors.length;
  warningCount += warnings.length;
  const status = errors.length ? "FAIL" : warnings.length ? "WARN" : " OK ";
  console.log(`[${status}] ${label}${detail ? `  (${detail})` : ""}`);
  for (const e of errors) console.log(`         error: ${e}`);
  for (const w of warnings) console.log(`         warn:  ${w}`);
}

for (const article of ALL_ARTICLES) {
  const errors = [];
  const warnings = [];
  const kw = article.primaryKeyword;
  const body = articleText(article).slice(1).join(" ");
  const count = wordCount(article);

  // ── Identity and metadata ────────────────────────────────────────────────
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(article.slug))
    errors.push("slug must be lowercase words joined by hyphens");
  if (slugCounts.get(article.slug) > 1) errors.push("slug is not unique");
  if (titleCounts.get(normalize(article.title)) > 1) errors.push("title is not unique");
  if (seoTitleCounts.get(normalize(article.seoTitle ?? article.title)) > 1)
    errors.push("<title> is not unique");

  if (!article.seoDescription?.trim()) errors.push("missing meta description");
  else {
    if (article.seoDescription.length > DESCRIPTION_MAX)
      errors.push(
        `meta description is ${article.seoDescription.length} chars (max ${DESCRIPTION_MAX})`,
      );
    if (descriptionCounts.get(normalize(article.seoDescription)) > 1)
      errors.push("meta description is not unique");
  }

  if (!kw?.trim()) errors.push("missing primaryKeyword");
  else {
    if (!contains(article.title, kw)) errors.push(`"${kw}" not in title`);
    if (!contains(article.excerpt, kw)) errors.push(`"${kw}" not in lead paragraph`);
    if (!contains(body, kw)) errors.push(`"${kw}" not in body copy`);
    if (article.seoDescription && !contains(article.seoDescription, kw))
      errors.push(`"${kw}" not in meta description`);
  }

  if (!getCategory(article.category)) errors.push(`unknown category "${article.category}"`);
  if (!getAuthor(article.author)) errors.push(`unknown author "${article.author}"`);
  if (!isDate(article.publishedAt)) errors.push("publishedAt is not a valid date");
  if (article.updatedAt !== undefined) {
    if (!isDate(article.updatedAt)) errors.push("updatedAt is not a valid date");
    else if (article.updatedAt < article.publishedAt)
      errors.push("updatedAt is before publishedAt");
  }
  if (article.canonicalUrl && !/^https:\/\//.test(article.canonicalUrl))
    errors.push("canonicalUrl must be an absolute https URL");

  // ── Body structure ───────────────────────────────────────────────────────
  const sectionIds = countBy(article.sections.map((s) => s.id));
  for (const [id, n] of sectionIds) if (n > 1) errors.push(`section id "${id}" is repeated`);
  for (const s of article.sections) if (!s.heading.trim()) errors.push(`section "${s.id}" has no heading`);

  const blocks = article.sections.flatMap((s) => s.blocks);
  const usesListings = blocks.some((b) => b.type === "livePrices" || b.type === "listings");
  if (usesListings && !article.listings)
    errors.push("uses live listing blocks but has no `listings` spec");
  if (article.listings && !article.listings.sources.length)
    errors.push("listings spec has no sources");
  if (
    article.intent === "price-guide" &&
    !blocks.some((b) => b.type === "livePrices" || b.type === "verifiedPrices")
  )
    errors.push("price guide shows no price (add a livePrices or verifiedPrices block)");

  for (const block of blocks) {
    if (block.type !== "verifiedPrices") continue;
    const { table } = block;
    if (!table.source?.trim()) errors.push(`verified prices "${table.caption}" have no source`);
    if (!isDate(table.checkedAt))
      errors.push(`verified prices "${table.caption}" have no valid checkedAt`);
    else if (daysSince(table.checkedAt) > PRICE_CHECK_MAX_DAYS)
      warnings.push(
        `verified prices "${table.caption}" checked ${table.checkedAt} — re-check them`,
      );
  }

  if (article.featuredImage) {
    const { src, alt } = article.featuredImage;
    if (!existsSync(join(process.cwd(), "public", src)))
      errors.push(`featured image not found in /public: ${src}`);
    if (!alt?.trim()) errors.push("featured image has no alt text");
  }

  // ── Links ────────────────────────────────────────────────────────────────
  const targets = articleLinkTargets(article);
  let internalLinks = 0;
  for (const target of targets) {
    const resolved = resolveLink(target);
    if (!resolved) {
      errors.push(
        target.kind === "page"
          ? `link to unknown page: ${target.path}`
          : `link target does not exist: ${JSON.stringify(target)}`,
      );
    } else if (!resolved.external) internalLinks++;
  }
  for (const slug of article.related ?? []) {
    if (!published.has(slug)) errors.push(`related article not found or not published: ${slug}`);
    else internalLinks++;
  }

  // ── Editorial warnings ───────────────────────────────────────────────────
  const minWords = LONG_FORM.has(article.intent) ? 1500 : 350;
  if (count < minWords) warnings.push(`${count} words — thin (want ${minWords}+)`);
  const leadWords = words(plain(article.excerpt));
  if (leadWords > LEAD_MAX_WORDS)
    warnings.push(`lead is ${leadWords} words — answer the query sooner (max ~${LEAD_MAX_WORDS})`);
  const fullTitle = `${article.seoTitle ?? article.title}${TITLE_SUFFIX}`;
  if (fullTitle.length > TITLE_MAX)
    warnings.push(`<title> is ${fullTitle.length} chars with suffix (aim for ${TITLE_MAX} or fewer)`);
  if (internalLinks < 3) warnings.push(`${internalLinks} internal link(s) (want 3+)`);

  const reviewed = article.updatedAt ?? article.publishedAt;
  if (isDate(reviewed) && daysSince(reviewed) > STALE_DAYS)
    warnings.push(`last reviewed ${reviewed} (${daysSince(reviewed)} days ago) — due for a refresh`);

  report(
    `${article.status === "draft" ? "(draft) " : ""}${article.slug}`,
    errors,
    warnings,
    `${article.intent}, ${count} words, reviewed ${reviewed}`,
  );
}

// ── Category hubs ──────────────────────────────────────────────────────────
const hubTitles = countBy(CATEGORIES.map((c) => normalize(c.title)));
for (const category of CATEGORIES) {
  const errors = [];
  const warnings = [];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(category.slug))
    errors.push("slug must be lowercase words joined by hyphens");
  if (category.description.length > DESCRIPTION_MAX)
    errors.push(`meta description is ${category.description.length} chars (max ${DESCRIPTION_MAX})`);
  if (hubTitles.get(normalize(category.title)) > 1) errors.push("title is not unique");
  for (const target of category.marketplace)
    if (!resolveLink(target)) errors.push(`link target does not exist: ${JSON.stringify(target)}`);
  const live = ALL_ARTICLES.filter(
    (a) => a.category === category.slug && a.status === "published",
  ).length;
  if (live === 0) warnings.push("no published articles — the hub is not generated");
  report(`category/${category.slug}`, errors, warnings, `${live} article(s)`);
}

console.log(
  `\n${ALL_ARTICLES.length} articles, ${CATEGORIES.length} categories — ${errorCount} error(s), ${warningCount} warning(s)`,
);
process.exitCode = errorCount ? 1 : 0;
