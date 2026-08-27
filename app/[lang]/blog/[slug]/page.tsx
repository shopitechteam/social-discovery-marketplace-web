import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getAllSlugs, blogPosts } from "@/lib/blog";
import { siteConfig } from "@/config/site";
import { localeAlternates } from "@/lib/metadata";
import { LegalNav } from "@/components/legal/LegalNav";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ lang: string; slug: string }> };

/* ── Static params for build-time generation ─────────────────────── */
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/* ── Per-page metadata ───────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const url = `${siteConfig.url}/${lang}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: url,
      ...localeAlternates(`/blog/${post.slug}`),
    },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      site: siteConfig.twitterHandle,
      images: [siteConfig.ogImage],
    },
  };
}

/* ── Page component ─────────────────────────────────────────────── */
export default async function BlogPostPage({ params }: Props) {
  const { lang, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  /* JSON-LD structured data — Article + FAQPage */
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    keywords: post.keywords.join(", "),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    // Posts are authored by the Shopi team, not named individuals — an
    // Organization author is the accurate schema for that.
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/${lang}/blog/${post.slug}`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const categoryColors: Record<string, string> = {
    Trends: "rgb(var(--brand-primary))",
    "Seller Guide": "#10b981",
    Industry: "#8b5cf6",
    "Success Stories": "#f59e0b",
  };
  const catColor = categoryColors[post.category] ?? "rgb(var(--brand-primary))";

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <LegalNav lang={lang} />
      <BreadcrumbJsonLd
        lang={lang}
        trail={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <main className="mx-auto max-w-[1100px] px-4 pt-16 pb-12 sm:px-5 sm:pt-20 sm:pb-16">
        <div className="grid grid-cols-1 items-start gap-8 min-[900px]:grid-cols-[1fr_300px] min-[900px]:gap-12">
          {/* ── Article body ─────────────────────────────────────── */}
          <article>
            {/* Breadcrumb */}
            <nav className="mb-8 text-[0.8rem] text-muted">
              <Link href={`/${lang}`} className="text-muted no-underline">
                Home
              </Link>
              <span className="mx-2">›</span>
              <Link href={`/${lang}/blog`} className="text-muted no-underline">
                Blog
              </Link>
              <span className="mx-2">›</span>
              <span className="text-foreground">{post.category}</span>
            </nav>

            {/* Category + meta */}
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              <span
                className="rounded-full px-3 py-[3px] text-[0.7rem] font-bold tracking-[0.05em] uppercase"
                style={{ background: `${catColor}22`, color: catColor }}
              >
                {post.category}
              </span>
              <span className="text-[0.8rem] text-muted">{post.readTime}</span>
              <span className="text-[0.8rem] text-muted">
                {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-5 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-[-0.03em] leading-[1.1] text-foreground">
              {post.title}
            </h1>

            {/* Author */}
            <div className="mb-10 flex items-center gap-3 border-b border-border pb-8">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[0.85rem] font-bold text-white"
                style={{ background: post.author.color }}
              >
                {post.author.initials}
              </div>
              <div>
                <div className="text-[0.9rem] font-bold text-foreground">
                  {post.author.name}
                </div>
                <div className="text-[0.78rem] text-muted">
                  {post.author.role} · Shopi
                </div>
              </div>
            </div>

            {/* Lead / excerpt */}
            <p
              className="mb-10 border-l-[3px] pl-4 text-[0.95rem] leading-[1.7] text-muted italic sm:text-[1.1rem]"
              style={{ borderLeftColor: catColor }}
            >
              {post.excerpt}
            </p>

            {/* Body sections */}
            {post.sections.map((section, i) => (
              <section key={i} className="mb-10">
                <h2 className="mb-3.5 font-display text-[clamp(1.1rem,2vw,1.45rem)] font-bold tracking-[-0.02em] leading-[1.25] text-foreground">
                  {section.heading}
                </h2>
                {section.body.split("\n\n").map((para, j) => (
                  <p
                    key={j}
                    className="mb-4 text-[1rem] leading-[1.8] text-muted"
                  >
                    {para}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-4 mb-0 flex list-none flex-col gap-2.5 p-0">
                    {section.list.map((item, k) => (
                      <li
                        key={k}
                        className="flex items-start gap-3 text-[0.95rem] leading-[1.65] text-muted"
                      >
                        <span
                          className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: `${catColor}22`,
                            color: catColor,
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Keywords / tags */}
            <div className="mb-12 border-t border-border pt-6">
              <div className="mb-3 text-[0.75rem] font-semibold tracking-[0.05em] uppercase text-muted">
                Topics
              </div>
              <div className="flex flex-wrap gap-2">
                {post.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full border border-border bg-surface px-3 py-1 text-[0.75rem] text-muted"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Further reading — outbound links to Jiji / TikTok where relevant */}
            {post.relatedLinks && post.relatedLinks.length > 0 && (
              <div className="mb-12 border-t border-border pt-6">
                <div className="mb-4 text-[0.75rem] font-semibold tracking-[0.05em] uppercase text-muted">
                  Further reading
                </div>
                <div className="flex flex-col gap-3">
                  {post.relatedLinks.map(
                    ({ label, url, description: desc }) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-4 rounded-[10px] border border-border bg-surface px-4 py-3.5 no-underline transition-colors duration-150"
                      >
                        <span
                          className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
                          style={{ background: catColor }}
                        />
                        <div>
                          <div className="mb-1 text-[0.875rem] font-semibold text-foreground">
                            {label} ↗
                          </div>
                          <div className="text-[0.8rem] leading-[1.5] text-muted">
                            {desc}
                          </div>
                        </div>
                      </a>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* FAQ — AEO structured section */}
            <section aria-label="Frequently asked questions" className="mb-12">
              <h2 className="mb-5 font-display text-[1.4rem] font-bold tracking-[-0.02em] text-foreground">
                Frequently asked questions
              </h2>
              <div className="flex flex-col gap-4">
                {post.faq.map(({ q, a }, i) => (
                  <details
                    key={i}
                    className="overflow-hidden rounded-md border border-border bg-elevated"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[0.95rem] font-semibold text-foreground select-none">
                      {q}
                      <span
                        className="ml-3 shrink-0 text-[1.1rem]"
                        style={{ color: catColor }}
                      >
                        +
                      </span>
                    </summary>
                    <div className="border-t border-border px-5 pt-3.5 pb-4 text-[0.9rem] leading-[1.7] text-muted">
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <h3 className="mb-2 font-display text-[1.2rem] font-bold text-foreground">
                Ready to buy and sell locally?
              </h3>
              <p className="mb-5 text-[0.875rem] text-muted">
                Open the feed, discover what is selling near you, and message
                the seller directly. Free to use.
              </p>
              <Link
                href={`/${lang}/feed`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-[0.9rem] font-bold text-white no-underline"
              >
                Open the feed →
              </Link>
            </div>
          </article>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="static min-[900px]:sticky min-[900px]:top-24">
            {/* Table of contents */}
            <div className="mb-6 rounded-[14px] border border-border bg-elevated p-5">
              <div className="mb-3.5 text-[0.7rem] font-bold tracking-[0.05em] uppercase text-muted">
                In this article
              </div>
              <nav>
                {post.sections.map((s, i) => (
                  <div
                    key={i}
                    className={`py-[0.45rem] text-[0.8rem] leading-[1.4] text-muted ${
                      i < post.sections.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <span
                      className="mr-1.5 text-[0.7rem]"
                      style={{ color: catColor }}
                    >
                      {i + 1}.
                    </span>
                    {s.heading}
                  </div>
                ))}
              </nav>
            </div>

            {/* Related posts */}
            <div className="rounded-[14px] border border-border bg-elevated p-5">
              <div className="mb-3.5 text-[0.7rem] font-bold tracking-[0.05em] uppercase text-muted">
                More from Shopi
              </div>
              <div className="flex flex-col gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/${lang}/blog/${r.slug}`}
                    className="no-underline"
                  >
                    <div className="rounded-[10px] border border-border bg-surface p-3 transition-colors duration-150">
                      <span
                        className="mb-2 inline-block rounded-full px-[7px] py-[2px] text-[0.65rem] font-bold tracking-[0.04em] uppercase"
                        style={{
                          background: `${categoryColors[r.category] ?? catColor}22`,
                          color: categoryColors[r.category] ?? catColor,
                        }}
                      >
                        {r.category}
                      </span>
                      <div className="mb-[0.4rem] text-[0.82rem] font-semibold leading-[1.35] text-foreground">
                        {r.title}
                      </div>
                      <div className="text-[0.72rem] text-muted">
                        {r.readTime}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <LandingFooter lang={lang} />
    </>
  );
}
