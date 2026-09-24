import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { resolveLink, type LinkTarget } from "@/lib/articles";
import { localeHref } from "./InlineText";

/**
 * A titled box of internal links — "Find a Vitz on Shopi", "Browse on Shopi".
 * Targets are resolved against the data that owns each page, so labels stay
 * in step with their destination and a target that no longer exists is
 * simply left out (the SEO audit reports it).
 */
export function LinkList({
  title,
  links,
  lang,
  headingLevel = "h3",
}: {
  title: string;
  links: LinkTarget[];
  lang: string;
  headingLevel?: "h2" | "h3";
}) {
  const resolved = links
    .map((target) => resolveLink(target))
    .filter((link): link is NonNullable<typeof link> => Boolean(link));
  if (resolved.length === 0) return null;
  const Heading = headingLevel;

  return (
    <nav
      aria-label={title}
      className="my-6 overflow-hidden rounded-2xl border border-border bg-elevated"
    >
      <Heading className="border-b border-border px-4 py-3 text-sm font-bold text-foreground">
        {title}
      </Heading>
      <ul className="m-0 list-none p-0">
        {resolved.map((link) => (
          <li key={link.href} className="border-b border-border last:border-b-0">
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-3 text-[0.95rem] font-semibold text-foreground no-underline hover:bg-subtle"
              >
                {link.label}
                <ArrowUpRight size={16} className="shrink-0 text-muted" aria-hidden />
              </a>
            ) : (
              <Link
                href={localeHref(lang, link.href)}
                className="flex items-center justify-between gap-3 px-4 py-3 text-[0.95rem] font-semibold text-foreground no-underline hover:bg-subtle"
              >
                {link.label}
                <ArrowRight size={16} className="shrink-0 text-primary" aria-hidden />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
