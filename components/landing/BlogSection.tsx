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
    <section id="blog" className="mx-auto max-w-300 px-5 py-16">
      {/* Header */}
      <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-[0.8rem] font-bold tracking-widest uppercase text-primary">
            From the blog
          </p>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.03em] leading-[1.1] text-foreground">
            Guides for buying and selling locally.
          </h2>
        </div>
        <Link
          href="/blog"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-elevated px-6 py-[0.7rem] text-[0.875rem] font-semibold text-muted no-underline transition-colors duration-150"
        >
          All articles →
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {blogPosts.map((post) => {
          const catColor = categoryColors[post.category] ?? "rgb(var(--brand-primary))";
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="no-underline">
              <article className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-elevated transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-1 hover:border-[rgb(var(--color-border-strong))] hover:shadow-(--shadow-lg)">
                {/* Card visual — clean typographic header, no emoji */}
                <div
                  className="relative flex h-30 shrink-0 items-end overflow-hidden p-[0.9rem]"
                  style={{
                    background: `linear-gradient(135deg, ${catColor}1f, ${catColor}08)`,
                  }}
                >
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.02)_0px,rgba(0,0,0,0.02)_1px,transparent_1px,transparent_22px)]" />
                  <div
                    className="absolute top-0 right-0 left-0 h-[3px]"
                    style={{ background: catColor }}
                  />
                  <span
                    className="relative font-display text-[1.05rem] font-bold tracking-[-0.01em]"
                    style={{ color: catColor }}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-[1.1rem] pb-[1.35rem]">
                  {/* Meta row */}
                  <div className="mb-[0.65rem] flex items-center gap-[7px]">
                    <span className="text-[0.7rem] text-muted">
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-[0.6rem] flex-1 font-display text-[0.95rem] font-bold tracking-[-0.01em] leading-[1.3] text-foreground">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mb-4 line-clamp-3 text-[0.8rem] leading-[1.6] text-muted">
                    {post.excerpt}
                  </p>

                  {/* Author */}
                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
                    <div
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[0.58rem] font-bold text-white"
                      style={{ background: post.author.color }}
                    >
                      {post.author.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[0.75rem] font-semibold text-foreground">
                        {post.author.name}
                      </div>
                      <div className="text-[0.67rem] text-muted">
                        {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                    <span
                      className="ml-auto shrink-0 text-[1rem]"
                      style={{ color: catColor }}
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
    </section>
  );
}
