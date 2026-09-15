/**
 * On-page SEO + freshness audit for blog posts (lib/blog.ts).
 *
 *   npm run seo:audit            # all checks, exits 1 on errors
 *   npm run seo:audit -- --stale-days=120
 *
 * Errors (fail the run) are rules every post must meet:
 *   - meta description present, 155 characters or fewer
 *   - primaryKeyword in the title, the lead (excerpt), the body and the
 *     meta description
 *   - titles unique across posts
 *   - internal /blog/ links point at a post that exists
 *
 * Warnings are prompts for an editor rather than hard rules:
 *   - under ~1500 words of article content (lead + sections + FAQ)
 *   - fewer than two internal links in relatedLinks
 *   - not reviewed within --stale-days (default 180): `updatedAt`, falling back
 *     to `publishedAt`, is older than that
 *
 * Content refresh process: run this monthly. For each post flagged as due for
 * review, re-check facts that date (fees, NTSA process, prices, app features),
 * update or expand the sections that have drifted, and set `updatedAt` to the
 * day of the edit. Don't bump `updatedAt` for typo fixes — the date feeds the
 * sitemap, Article schema and the visible "Updated" line, and a date that
 * changes without the content changing teaches engines to ignore it.
 *
 * Requires Node 22.18+ (imports the TypeScript source directly).
 */
import { blogPosts } from "../lib/blog.ts";

const DESCRIPTION_MAX = 155;
const WORD_TARGET = 1500;
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

const slugs = new Set(blogPosts.map((p) => p.slug));
const titleCounts = new Map();
for (const p of blogPosts) {
  const key = normalize(p.title);
  titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
}

let errorCount = 0;
let warningCount = 0;
const now = Date.now();

for (const post of blogPosts) {
  const errors = [];
  const warnings = [];
  const kw = post.primaryKeyword;

  const body = post.sections
    .map((s) => [s.heading, s.body, ...(s.list ?? [])].join(" "))
    .join(" ");
  const faq = post.faq.map((f) => `${f.q} ${f.a}`).join(" ");
  const wordCount = words(post.excerpt) + words(body) + words(faq);

  if (!post.description?.trim()) errors.push("missing meta description");
  else if (post.description.length > DESCRIPTION_MAX)
    errors.push(
      `meta description is ${post.description.length} chars (max ${DESCRIPTION_MAX})`,
    );

  if (!kw?.trim()) {
    errors.push("missing primaryKeyword");
  } else {
    if (!contains(post.title, kw)) errors.push(`"${kw}" not in title`);
    if (!contains(post.excerpt, kw)) errors.push(`"${kw}" not in lead paragraph`);
    if (!contains(body, kw)) errors.push(`"${kw}" not in body copy`);
    if (post.description && !contains(post.description, kw))
      errors.push(`"${kw}" not in meta description`);
  }

  if (titleCounts.get(normalize(post.title)) > 1)
    errors.push("title is not unique");

  const internal = (post.relatedLinks ?? []).filter((l) => l.url.startsWith("/"));
  for (const link of internal) {
    const blogSlug = link.url.match(/^\/blog\/([^/?#]+)/)?.[1];
    if (blogSlug && !slugs.has(blogSlug))
      errors.push(`relatedLinks points at missing post: ${link.url}`);
  }

  if (wordCount < WORD_TARGET)
    warnings.push(`${wordCount} words (target ~${WORD_TARGET})`);
  if (internal.length < 2)
    warnings.push(`${internal.length} internal related link(s) (want 2+)`);

  const reviewed = post.updatedAt ?? post.publishedAt;
  const ageDays = Math.floor((now - new Date(reviewed).getTime()) / 86_400_000);
  if (ageDays > STALE_DAYS)
    warnings.push(`last reviewed ${reviewed} (${ageDays} days ago) — due for a refresh`);

  errorCount += errors.length;
  warningCount += warnings.length;

  const status = errors.length ? "FAIL" : warnings.length ? "WARN" : " OK ";
  console.log(`[${status}] ${post.slug}  (${wordCount} words, reviewed ${reviewed})`);
  for (const e of errors) console.log(`         error: ${e}`);
  for (const w of warnings) console.log(`         warn:  ${w}`);
}

console.log(
  `\n${blogPosts.length} posts, ${errorCount} error(s), ${warningCount} warning(s)`,
);
process.exitCode = errorCount ? 1 : 0;
