import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getAllSlugs, blogPosts } from "@/lib/blog";
import { siteConfig } from "@/config/site";
import { LegalNav } from "@/components/legal/LegalNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ lang: string; slug: string }> };

/* ── Static params for build-time generation ─────────────────────── */
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/* ── Per-page metadata ───────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // lang unused in metadata
  const post = getBlogPost(slug);
  if (!post) return {};

  const url = `${siteConfig.url}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    alternates: { canonical: url },
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
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}/blog/${post.slug}` },
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

      <main className="blog-post-main">
        <div className="blog-post-layout">

          {/* ── Article body ─────────────────────────────────────── */}
          <article>
            {/* Breadcrumb */}
            <nav style={{ marginBottom: "2rem", fontSize: "0.8rem", color: "rgb(var(--color-text-muted))" }}>
              <Link href="/" style={{ color: "rgb(var(--color-text-muted))", textDecoration: "none" }}>Home</Link>
              <span style={{ margin: "0 0.5rem" }}>›</span>
              <Link href="/blog" style={{ color: "rgb(var(--color-text-muted))", textDecoration: "none" }}>Blog</Link>
              <span style={{ margin: "0 0.5rem" }}>›</span>
              <span style={{ color: "rgb(var(--color-text))" }}>{post.category}</span>
            </nav>

            {/* Category + meta */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: 9999,
                  background: `${catColor}22`,
                  color: catColor,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {post.category}
              </span>
              <span style={{ fontSize: "0.8rem", color: "rgb(var(--color-text-muted))" }}>{post.readTime}</span>
              <span style={{ fontSize: "0.8rem", color: "rgb(var(--color-text-muted))" }}>
                {new Date(post.publishedAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "rgb(var(--color-text))",
                marginBottom: "1.25rem",
              }}
            >
              {post.title}
            </h1>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid rgb(var(--color-border))" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: post.author.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {post.author.initials}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgb(var(--color-text))" }}>
                  {post.author.name}
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgb(var(--color-text-muted))" }}>
                  {post.author.role} · Shopi
                </div>
              </div>
            </div>

            {/* Lead / excerpt */}
            <p
              className="blog-lead-excerpt"
              style={{
                lineHeight: 1.7,
                color: "rgb(var(--color-text-muted))",
                fontStyle: "italic",
                marginBottom: "2.5rem",
                paddingLeft: "1rem",
                borderLeft: `3px solid ${catColor}`,
              }}
            >
              {post.excerpt}
            </p>

            {/* Body sections */}
            {post.sections.map((section, i) => (
              <section key={i} style={{ marginBottom: "2.5rem" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.1rem, 2vw, 1.45rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "rgb(var(--color-text))",
                    marginBottom: "0.875rem",
                    lineHeight: 1.25,
                  }}
                >
                  {section.heading}
                </h2>
                {section.body.split("\n\n").map((para, j) => (
                  <p
                    key={j}
                    style={{
                      fontSize: "1rem",
                      lineHeight: 1.8,
                      color: "rgb(var(--color-text-muted))",
                      marginBottom: "1rem",
                    }}
                  >
                    {para}
                  </p>
                ))}
                {section.list && (
                  <ul style={{ margin: "1rem 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {section.list.map((item, k) => (
                      <li
                        key={k}
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          alignItems: "flex-start",
                          fontSize: "0.95rem",
                          lineHeight: 1.65,
                          color: "rgb(var(--color-text-muted))",
                        }}
                      >
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: `${catColor}22`,
                            color: catColor,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Keywords / tags */}
            <div style={{ marginBottom: "3rem", paddingTop: "1.5rem", borderTop: "1px solid rgb(var(--color-border))" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgb(var(--color-text-muted))", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Topics</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {post.keywords.map((kw) => (
                  <span
                    key={kw}
                    style={{
                      fontSize: "0.75rem",
                      padding: "4px 12px",
                      borderRadius: 9999,
                      border: "1px solid rgb(var(--color-border))",
                      background: "rgb(var(--color-bg-subtle))",
                      color: "rgb(var(--color-text-muted))",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Further reading — outbound links to Jiji / TikTok where relevant */}
            {post.relatedLinks && post.relatedLinks.length > 0 && (
              <div style={{ marginBottom: "3rem", paddingTop: "1.5rem", borderTop: "1px solid rgb(var(--color-border))" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgb(var(--color-text-muted))", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Further reading
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {post.relatedLinks.map(({ label, url, description: desc }) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "flex-start",
                        padding: "0.875rem 1rem",
                        borderRadius: 10,
                        border: "1px solid rgb(var(--color-border))",
                        background: "rgb(var(--color-bg-subtle))",
                        textDecoration: "none",
                        transition: "border-color 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: 1 }}>
                        {url.includes("tiktok") ? "🎬" : "🛒"}
                      </span>
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgb(var(--color-text))", marginBottom: "0.25rem" }}>
                          {label} ↗
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}>
                          {desc}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ — AEO structured section */}
            <section aria-label="Frequently asked questions" style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "rgb(var(--color-text))",
                  marginBottom: "1.25rem",
                }}
              >
                Frequently asked questions
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {post.faq.map(({ q, a }, i) => (
                  <details
                    key={i}
                    style={{
                      border: "1px solid rgb(var(--color-border))",
                      borderRadius: 12,
                      background: "rgb(var(--color-bg-elevated))",
                      overflow: "hidden",
                    }}
                  >
                    <summary
                      style={{
                        padding: "1rem 1.25rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: "rgb(var(--color-text))",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        listStyle: "none",
                        userSelect: "none",
                      }}
                    >
                      {q}
                      <span style={{ color: catColor, fontSize: "1.1rem", flexShrink: 0, marginLeft: 12 }}>+</span>
                    </summary>
                    <div
                      style={{
                        padding: "0 1.25rem 1rem",
                        fontSize: "0.9rem",
                        lineHeight: 1.7,
                        color: "rgb(var(--color-text-muted))",
                        borderTop: "1px solid rgb(var(--color-border))",
                        paddingTop: "0.875rem",
                        marginTop: 0,
                      }}
                    >
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div
              style={{
                borderRadius: 16,
                background: `linear-gradient(135deg, rgb(var(--brand-primary) / 0.1), rgb(var(--brand-accent) / 0.08))`,
                border: "1px solid rgb(var(--brand-primary) / 0.2)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🚀</div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "rgb(var(--color-text))",
                  marginBottom: "0.5rem",
                }}
              >
                Ready to start selling on Shopi?
              </h3>
              <p style={{ fontSize: "0.875rem", color: "rgb(var(--color-text-muted))", marginBottom: "1.25rem" }}>
                Join thousands of Kenyan sellers building their business through social discovery.
              </p>
              <Link
                href="/#download"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.75rem",
                  borderRadius: 9999,
                  background: "rgb(var(--brand-primary))",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                Download Shopi →
              </Link>
            </div>
          </article>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="blog-post-sidebar">
            {/* Table of contents */}
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgb(var(--color-border))",
                background: "rgb(var(--color-bg-elevated))",
                padding: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "rgb(var(--color-text-muted))",
                  marginBottom: "0.875rem",
                }}
              >
                In this article
              </div>
              <nav>
                {post.sections.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "0.45rem 0",
                      borderBottom: i < post.sections.length - 1 ? "1px solid rgb(var(--color-border))" : "none",
                      fontSize: "0.8rem",
                      lineHeight: 1.4,
                      color: "rgb(var(--color-text-muted))",
                    }}
                  >
                    <span style={{ color: catColor, marginRight: 6, fontSize: "0.7rem" }}>{i + 1}.</span>
                    {s.heading}
                  </div>
                ))}
              </nav>
            </div>

            {/* Related posts */}
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgb(var(--color-border))",
                background: "rgb(var(--color-bg-elevated))",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "rgb(var(--color-text-muted))",
                  marginBottom: "0.875rem",
                }}
              >
                More from Shopi
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        padding: "0.75rem",
                        borderRadius: 10,
                        border: "1px solid rgb(var(--color-border))",
                        background: "rgb(var(--color-bg-subtle))",
                        transition: "border-color 0.15s ease",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 9999,
                          background: `${categoryColors[r.category] ?? catColor}22`,
                          color: categoryColors[r.category] ?? catColor,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          display: "inline-block",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {r.category}
                      </span>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "rgb(var(--color-text))",
                          lineHeight: 1.35,
                          marginBottom: "0.4rem",
                        }}
                      >
                        {r.title}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "rgb(var(--color-text-muted))" }}>
                        {r.readTime}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

        </div>

        <style>{`
          .blog-post-main {
            max-width: 1100px;
            margin: 0 auto;
            padding: 4rem 1rem 3rem;
          }
          @media (min-width: 640px) {
            .blog-post-main { padding: 5rem 1.25rem 4rem; }
          }
          .blog-lead-excerpt { font-size: 0.95rem; }
          @media (min-width: 640px) {
            .blog-lead-excerpt { font-size: 1.1rem; }
          }
          .blog-post-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            align-items: start;
          }
          .blog-post-sidebar {
            position: static;
          }
          @media (min-width: 900px) {
            .blog-post-layout { grid-template-columns: 1fr 300px; gap: 3rem; }
            .blog-post-sidebar { position: sticky; top: 6rem; }
          }
        `}</style>
      </main>

      <LandingFooter />
    </>
  );
}
