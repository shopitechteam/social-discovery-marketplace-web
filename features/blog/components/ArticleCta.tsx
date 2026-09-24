import Link from "next/link";
import { resolveLink, type Article } from "@/lib/articles";
import { localeHref } from "./InlineText";

/**
 * The article's one clear next step ("See Toyota Vitz listings"), with a
 * quieter way to post for readers who have one to sell. Selling guides get
 * just their own CTA — their whole point is already the second button.
 */
export function ArticleCta({ article, lang }: { article: Article; lang: string }) {
  const target = resolveLink(article.cta.to);
  if (!target) return null;
  const sellingGuide = article.intent === "selling-guide";

  return (
    <section className="my-10 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <p className="font-display text-xl font-bold text-foreground">
        {article.cta.label}
      </p>
      {article.cta.text && (
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
          {article.cta.text}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {target.external ? (
          <a
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white no-underline"
          >
            {article.cta.label}
          </a>
        ) : (
          <Link
            href={localeHref(lang, target.href)}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white no-underline"
          >
            {article.cta.label}
          </Link>
        )}
        {!sellingGuide && (
          <Link
            href={`/${lang}/upload`}
            className="rounded-full border border-border bg-elevated px-6 py-3 text-sm font-bold text-foreground no-underline"
          >
            Have one to sell? Post it free
          </Link>
        )}
      </div>
    </section>
  );
}
