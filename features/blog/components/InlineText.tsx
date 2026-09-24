import { Fragment } from "react";
import Link from "next/link";
import { parseInline } from "@/lib/articles";

/** Internal paths are stored locale-free; this adds the reader's locale. */
export function localeHref(lang: string, href: string): string {
  if (!href.startsWith("/")) return href;
  return href === "/" ? `/${lang}` : `/${lang}${href}`;
}

/** Article copy with its `[label](/path)` links and `**bold**` rendered. */
export function InlineText({ text, lang }: { text: string; lang: string }) {
  return (
    <>
      {parseInline(text).map((token, i) => {
        if (token.type === "bold") {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {token.text}
            </strong>
          );
        }
        if (token.type === "link") {
          return (
            <Link
              key={i}
              href={localeHref(lang, token.href)}
              className="font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
            >
              {token.text}
            </Link>
          );
        }
        return <Fragment key={i}>{token.text}</Fragment>;
      })}
    </>
  );
}
