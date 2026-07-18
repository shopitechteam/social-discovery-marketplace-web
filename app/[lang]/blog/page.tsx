import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";
import { siteConfig } from "@/config/site";
import { LegalNav } from "@/components/legal/LegalNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `${siteConfig.url}/${lang}/blog`;
  const title = "Blog — Social Commerce Insights for Kenya";
  const description =
    "Guides, trends, and success stories for Kenyan sellers and buyers. Learn how social discovery and video commerce are reshaping retail across East Africa.";

  return {
    title,
    description,
    keywords: [
      "Shopi blog",
      "Kenya e-commerce blog",
      "social commerce tips",
      "sell online Kenya guide",
      "video commerce Africa",
    ],
    alternates: { canonical },
    openGraph: {
      title: `Shopi ${title}`,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [
        { url: siteConfig.ogImage, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title: `Shopi ${title}`,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

const categoryColors: Record<string, string> = {
  Trends: "rgb(var(--brand-primary))",
  "Seller Guide": "#10b981",
  Industry: "#8b5cf6",
  "Success Stories": "#f59e0b",
};

const cardHover =
  "transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-(--shadow-lg)";

export default async function BlogIndexPage({ params }: Props) {
  const [featured, ...rest] = blogPosts;
  const { lang } = await params;

  return (
    <>
      <LegalNav lang={lang} />
      <main className="mx-auto max-w-[1100px] px-4 pt-16 pb-12 sm:px-5 sm:pt-20 sm:pb-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-4 text-[0.8rem] font-bold tracking-widest uppercase text-primary">
            Shopi Blog
          </p>
          <h1 className="mb-4 font-display text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-[-0.03em] text-foreground">
            Insights for Kenya&apos;s social sellers
          </h1>
          <p className="mx-auto max-w-135 text-[1.05rem] leading-[1.65] text-muted">
            Guides, trends, and real seller stories — everything you need to
            grow your business through video and social discovery.
          </p>
        </div>

        {/* Featured post */}
        <Link
          href={`/${lang}/blog/${featured.slug}`}
          className="mb-8 block no-underline"
        >
          <article
            className={`grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-elevated min-[900px]:grid-cols-2 ${cardHover}`}
          >
            {/* Visual — clean typographic header, no emoji */}
            <div className="relative flex min-h-50 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgb(var(--brand-primary)/0.15)_0%,rgb(var(--brand-accent)/0.15)_100%)] p-8 sm:min-h-60 min-[900px]:min-h-70">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgb(var(--brand-primary)/0.04)_0px,rgb(var(--brand-primary)/0.04)_1px,transparent_1px,transparent_22px)]" />
              <div
                className="absolute top-0 right-0 left-0 h-1"
                style={{ background: categoryColors[featured.category] }}
              />
              <span
                className="relative text-center font-display text-[clamp(1.25rem,3vw,1.9rem)] font-bold tracking-[-0.02em]"
                style={{ color: categoryColors[featured.category] }}
              >
                {featured.category}
              </span>
            </div>
            {/* Content */}
            <div className="p-7">
              <div className="mb-4 flex flex-wrap gap-2">
                <span
                  className="rounded-full px-[10px] py-[3px] text-[0.7rem] font-bold tracking-[0.04em] uppercase"
                  style={{
                    background: `${categoryColors[featured.category]}22`,
                    color: categoryColors[featured.category],
                  }}
                >
                  {featured.category}
                </span>
                <span className="text-[0.75rem] text-muted">
                  {featured.readTime}
                </span>
              </div>
              <h2 className="mb-3.5 font-display text-[clamp(1.1rem,2vw,1.6rem)] font-bold tracking-[-0.02em] leading-[1.2] text-foreground">
                {featured.title}
              </h2>
              <p className="mb-6 text-[0.9rem] leading-[1.65] text-muted">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold text-white"
                  style={{ background: featured.author.color }}
                >
                  {featured.author.initials}
                </div>
                <div>
                  <div className="text-[0.8rem] font-semibold text-foreground">
                    {featured.author.name}
                  </div>
                  <div className="text-[0.72rem] text-muted">
                    {new Date(featured.publishedAt).toLocaleDateString(
                      "en-KE",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </Link>

        {/* Grid of remaining posts */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 min-[900px]:grid-cols-3">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/${lang}/blog/${post.slug}`}
              className="no-underline"
            >
              <article
                className={`flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-elevated ${cardHover}`}
              >
                {/* Card visual — clean typographic header, no emoji */}
                <div
                  className="relative flex h-30 items-end overflow-hidden p-[0.9rem]"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColors[post.category]}1f, ${categoryColors[post.category]}08)`,
                  }}
                >
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.02)_0px,rgba(0,0,0,0.02)_1px,transparent_1px,transparent_22px)]" />
                  <div
                    className="absolute top-0 right-0 left-0 h-[3px]"
                    style={{ background: categoryColors[post.category] }}
                  />
                  <span
                    className="relative font-display text-[1.05rem] font-bold tracking-[-0.01em]"
                    style={{ color: categoryColors[post.category] }}
                  >
                    {post.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 pb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-[2px] text-[0.65rem] font-bold tracking-[0.04em] uppercase"
                      style={{
                        background: `${categoryColors[post.category]}22`,
                        color: categoryColors[post.category],
                      }}
                    >
                      {post.category}
                    </span>
                    <span className="text-[0.7rem] text-muted">
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mb-[0.6rem] font-display text-[1rem] font-bold tracking-[-0.01em] leading-[1.3] text-foreground">
                    {post.title}
                  </h3>
                  <p className="mb-4 flex-1 text-[0.825rem] leading-[1.6] text-muted">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-white"
                      style={{ background: post.author.color }}
                    >
                      {post.author.initials}
                    </div>
                    <div>
                      <div className="text-[0.75rem] font-semibold text-foreground">
                        {post.author.name}
                      </div>
                      <div className="text-[0.68rem] text-muted">
                        {new Date(post.publishedAt).toLocaleDateString(
                          "en-KE",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
      <div className="mt-6 lg:mt-12" />
      <LandingFooter lang={lang} />
    </>
  );
}
