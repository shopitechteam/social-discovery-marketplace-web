import Image from "next/image";
import Link from "next/link";
import {
  Car,
  House,
  Gamepad2,
  Smartphone,
  Sofa,
  Store,
  Tag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  articlePath,
  getCategory,
  lastModified,
  readingTime,
  type Article,
} from "@/lib/articles";

/** A plain visual for articles without a photo — no stock filler. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cars: Car,
  phones: Smartphone,
  property: House,
  electronics: Gamepad2,
  home: Sofa,
  selling: Tag,
  earn: Wallet,
  shopi: Store,
};

export function formatArticleDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ArticleCard({
  article,
  lang,
  headingLevel = "h3",
  priority = false,
}: {
  article: Article;
  lang: string;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}) {
  const category = getCategory(article.category);
  const Icon = CATEGORY_ICONS[article.category] ?? Store;
  const Heading = headingLevel;

  return (
    <Link
      href={`/${lang}${articlePath(article.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-elevated no-underline transition-colors hover:border-[rgb(var(--color-border-strong))]"
    >
      <div className="relative aspect-video overflow-hidden bg-surface">
        {article.featuredImage ? (
          <Image
            src={article.featuredImage.src}
            alt={article.featuredImage.alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 340px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon size={26} strokeWidth={1.9} aria-hidden />
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {category && (
          <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
            {category.name}
          </p>
        )}
        <Heading className="font-display text-[1.05rem] leading-snug font-bold text-foreground">
          {article.title}
        </Heading>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {article.excerpt}
        </p>
        <p className="mt-auto pt-3 text-xs text-muted">
          <time dateTime={lastModified(article)}>
            {formatArticleDate(lastModified(article))}
          </time>{" "}
          · {readingTime(article)}
        </p>
      </div>
    </Link>
  );
}
