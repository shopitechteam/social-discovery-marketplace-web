import Link from "next/link";
import { blogPosts } from "@/lib/blog";
import type { Dictionary } from "@/i18n/getDictionary";

const categoryColors: Record<string, string> = {
  Trends: "rgb(var(--brand-primary))",
  "Seller Guide": "#10b981",
  Industry: "#8b5cf6",
  "Success Stories": "#f59e0b",
};

export function BlogSection({ dict: _dict }: { dict: Dictionary }) {
  return (
    <section
      id="blog"
      style={{
        padding: "4rem 1.25rem",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "3rem",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgb(var(--brand-primary))",
              marginBottom: "0.75rem",
            }}
          >
            From the blog
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "rgb(var(--color-text))",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Guides for buying and selling locally.
          </h2>
        </div>
        <Link
          href="/blog"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.7rem 1.5rem",
            borderRadius: 9999,
            border: "1px solid rgb(var(--color-border))",
            background: "rgb(var(--color-bg-elevated))",
            color: "rgb(var(--color-text-muted))",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
            flexShrink: 0,
            transition: "border-color 0.15s ease, color 0.15s ease",
          }}
        >
          All articles →
        </Link>
      </div>

      {/* Cards grid */}
      <div className="blog-landing-grid">
        {blogPosts.map((post) => {
          const catColor = categoryColors[post.category] ?? "rgb(var(--brand-primary))";
          return (
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
                  transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                  cursor: "pointer",
                }}
                className="blog-landing-card"
              >
                {/* Card visual — clean typographic header, no emoji */}
                <div
                  style={{
                    height: 120,
                    background: `linear-gradient(135deg, ${catColor}1f, ${catColor}08)`,
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "0.9rem",
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
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
                      background: catColor,
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      letterSpacing: "-0.01em",
                      color: catColor,
                    }}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div
                  style={{
                    padding: "1.1rem 1.1rem 1.35rem",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Meta row */}
                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      alignItems: "center",
                      marginBottom: "0.65rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "rgb(var(--color-text-muted))",
                      }}
                    >
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      color: "rgb(var(--color-text))",
                      lineHeight: 1.3,
                      marginBottom: "0.6rem",
                      flex: 1,
                    }}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "rgb(var(--color-text-muted))",
                      lineHeight: 1.6,
                      marginBottom: "1rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.excerpt}
                  </p>

                  {/* Author */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingTop: "0.75rem",
                      borderTop: "1px solid rgb(var(--color-border))",
                      marginTop: "auto",
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: post.author.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {post.author.initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgb(var(--color-text))",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {post.author.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.67rem",
                          color: "rgb(var(--color-text-muted))",
                        }}
                      >
                        {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                    <span
                      style={{
                        marginLeft: "auto",
                        color: catColor,
                        fontSize: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      <style>{`
        .blog-landing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .blog-landing-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .blog-landing-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .blog-landing-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
          border-color: rgb(var(--color-border-strong));
        }
      `}</style>
    </section>
  );
}
