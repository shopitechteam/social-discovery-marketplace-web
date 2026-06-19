import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";
import { siteConfig } from "@/config/site";
import { LegalNav } from "@/components/legal/LegalNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Blog — Social Commerce Insights for Kenya",
  description:
    "Guides, trends, and success stories for Kenyan sellers and buyers. Learn how social discovery and video commerce are reshaping retail across East Africa.",
  keywords: [
    "Shopi blog",
    "Kenya e-commerce blog",
    "social commerce tips",
    "sell online Kenya guide",
    "video commerce Africa",
  ],
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    title: "Shopi Blog — Social Commerce Insights for Kenya",
    description:
      "Guides, trends, and success stories for Kenyan sellers and buyers discovering the power of social commerce.",
    url: `${siteConfig.url}/blog`,
    type: "website",
  },
};

const categoryColors: Record<string, string> = {
  Trends: "rgb(var(--brand-primary))",
  "Seller Guide": "#10b981",
  Industry: "#8b5cf6",
  "Success Stories": "#f59e0b",
};

export default function BlogIndexPage() {
  const [featured, ...rest] = blogPosts;
  const lang = "en"; // static fallback — blog has no dynamic lang param here

  return (
    <>
      <LegalNav lang={lang} />
      <main className="blog-main-wrap">
        {/* Header */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgb(var(--brand-primary))",
              marginBottom: "1rem",
            }}
          >
            Shopi Blog
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "rgb(var(--color-text))",
              marginBottom: "1rem",
            }}
          >
            Insights for Kenya&apos;s social sellers
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "rgb(var(--color-text-muted))",
              maxWidth: 540,
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            Guides, trends, and real seller stories — everything you need to grow
            your business through video and social discovery.
          </p>
        </div>

        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          style={{ textDecoration: "none", display: "block", marginBottom: "2rem" }}
        >
          <article className="blog-featured-card blog-card-hover">
            {/* Visual — clean typographic header, no emoji */}
            <div className="blog-featured-visual">
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(45deg, rgb(var(--brand-primary) / 0.04) 0px, rgb(var(--brand-primary) / 0.04) 1px, transparent 1px, transparent 22px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: categoryColors[featured.category],
                }}
              />
              <span
                style={{
                  position: "relative",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.25rem, 3vw, 1.9rem)",
                  letterSpacing: "-0.02em",
                  color: categoryColors[featured.category],
                  textAlign: "center",
                }}
              >
                {featured.category}
              </span>
            </div>
            {/* Content */}
            <div style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 9999,
                    background: `${categoryColors[featured.category]}22`,
                    color: categoryColors[featured.category],
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {featured.category}
                </span>
                <span style={{ fontSize: "0.75rem", color: "rgb(var(--color-text-muted))" }}>
                  {featured.readTime}
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "rgb(var(--color-text))",
                  marginBottom: "0.875rem",
                  lineHeight: 1.2,
                }}
              >
                {featured.title}
              </h2>
              <p
                style={{
                  color: "rgb(var(--color-text-muted))",
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  marginBottom: "1.5rem",
                }}
              >
                {featured.excerpt}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: featured.author.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {featured.author.initials}
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgb(var(--color-text))" }}>
                    {featured.author.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "rgb(var(--color-text-muted))" }}>
                    {new Date(featured.publishedAt).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </Link>

        {/* Grid of remaining posts */}
        <div className="blog-cards-grid">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article
                style={{
                  borderRadius: 16,
                  border: "1px solid rgb(var(--color-border))",
                  background: "rgb(var(--color-bg-elevated))",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
                className="blog-card-hover"
              >
                {/* Card visual — clean typographic header, no emoji */}
                <div
                  style={{
                    height: 120,
                    background: `linear-gradient(135deg, ${categoryColors[post.category]}1f, ${categoryColors[post.category]}08)`,
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "0.9rem",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, transparent 1px, transparent 22px)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: categoryColors[post.category],
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      letterSpacing: "-0.01em",
                      color: categoryColors[post.category],
                    }}
                  >
                    {post.category}
                  </span>
                </div>
                <div style={{ padding: "1.25rem 1.25rem 1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 9999,
                        background: `${categoryColors[post.category]}22`,
                        color: categoryColors[post.category],
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {post.category}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "rgb(var(--color-text-muted))" }}>
                      {post.readTime}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      color: "rgb(var(--color-text))",
                      marginBottom: "0.6rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {post.title}
                  </h3>
                  <p
                    style={{
                      color: "rgb(var(--color-text-muted))",
                      fontSize: "0.825rem",
                      lineHeight: 1.6,
                      flex: 1,
                      marginBottom: "1rem",
                    }}
                  >
                    {post.excerpt}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: post.author.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {post.author.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgb(var(--color-text))" }}>
                        {post.author.name}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "rgb(var(--color-text-muted))" }}>
                        {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <style>{`
          .blog-main-wrap {
            max-width: 1100px;
            margin: 0 auto;
            padding: 4rem 1rem 3rem;
          }
          @media (min-width: 640px) {
            .blog-main-wrap { padding: 5rem 1.25rem 4rem; }
          }
          .blog-featured-card {
            border-radius: 20px;
            border: 1px solid rgb(var(--color-border));
            background: rgb(var(--color-bg-elevated));
            overflow: hidden;
            display: grid;
            grid-template-columns: 1fr;
            gap: 0;
            transition: box-shadow 0.2s ease, transform 0.2s ease;
          }
          .blog-featured-visual {
            min-height: 200px;
            background: linear-gradient(135deg, rgb(var(--brand-primary) / 0.15) 0%, rgb(var(--brand-accent) / 0.15) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            position: relative;
            overflow: hidden;
          }
          .blog-cards-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          @media (min-width: 640px) {
            .blog-cards-grid { grid-template-columns: repeat(2, 1fr); }
            .blog-featured-visual { min-height: 240px; }
          }
          @media (min-width: 900px) {
            .blog-featured-card { grid-template-columns: 1fr 1fr; }
            .blog-featured-visual { min-height: 280px; }
            .blog-cards-grid { grid-template-columns: repeat(3, 1fr); }
          }
          .blog-card-hover:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-3px);
          }
        `}</style>
      </main>
      <LandingFooter />
    </>
  );
}
