import Link from "next/link";
import { getBlogPost } from "@/lib/blog";

/**
 * Hub → guide links. The blog guides already link up to their landing page;
 * without the link back down, the guides only get internal equity from the
 * blog index, and the landing page misses the chance to send a reader who
 * isn't ready to post yet to the long-form answer. Titles and excerpts come
 * from lib/blog.ts so a renamed post never leaves a stale anchor behind.
 */
export function GuideLinks({
  lang,
  slugs,
  eyebrow = "Guides",
  heading,
  intro,
  surface = false,
}: {
  lang: string;
  slugs: string[];
  eyebrow?: string;
  heading: string;
  intro?: string;
  surface?: boolean;
}) {
  const posts = slugs.flatMap((slug) => getBlogPost(slug) ?? []);
  if (posts.length === 0) return null;

  return (
    <section className={surface ? "bg-surface px-5 py-16" : "px-5 py-16"}>
      <div className="mx-auto max-w-190">
        <p className="mb-3 text-[0.8rem] font-bold tracking-widest uppercase text-primary">
          {eyebrow}
        </p>
        <h2 className="mb-5 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-normal text-foreground">
          {heading}
        </h2>
        {intro && (
          <p className="mb-7 max-w-150 text-[0.95rem] leading-[1.75] text-muted">
            {intro}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/${lang}/blog/${post.slug}`}
              className="rounded-lg border border-border bg-elevated p-5 no-underline transition-colors hover:border-[rgb(var(--color-border-strong))]"
            >
              <h3 className="font-display text-[1.05rem] font-bold text-foreground">
                {post.title}
              </h3>
              <p className="mt-2 text-[0.875rem] leading-[1.6] text-muted">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
