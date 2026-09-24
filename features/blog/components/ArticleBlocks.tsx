import { Check, Info, TriangleAlert } from "lucide-react";
import type { Article, Block, VerifiedPriceTable } from "@/lib/articles";
import type { ArticleListingsResult } from "../queries/articleListings";
import { ArticleTable } from "./ArticleTable";
import { InlineText } from "./InlineText";
import { LinkList } from "./LinkList";
import { ListingGrid } from "./ListingGrid";
import { LivePrices, formatCheckedDate } from "./LivePrices";

function VerifiedPrices({ table, lang }: { table: VerifiedPriceTable; lang: string }) {
  // "September 2026": a month is as precise as a manual price check deserves.
  const checked = formatCheckedDate(table.checkedAt).split(" ").slice(1).join(" ");
  const notes = table.rows.some((row) => row.note);
  return (
    <div className="my-6">
      <ArticleTable
        caption={table.caption}
        head={notes ? ["Item", "Price", "Note"] : ["Item", "Price"]}
        rows={table.rows.map((row) =>
          notes ? [row.item, row.price, row.note ?? ""] : [row.item, row.price],
        )}
        lang={lang}
      />
      <p className="text-xs text-muted">
        Prices checked {checked}. Source: {table.source}.
      </p>
    </div>
  );
}

export function ArticleBlocks({
  blocks,
  article,
  listings,
  lang,
}: {
  blocks: Block[];
  article: Article;
  /** Null when the article has no ListingSpec. */
  listings: ArticleListingsResult | null;
  lang: string;
}) {
  return blocks.map((block, i) => {
    switch (block.type) {
      case "p":
        return (
          <p key={i} className="my-4 text-[1.0625rem] leading-[1.75] text-muted">
            <InlineText text={block.text} lang={lang} />
          </p>
        );
      case "h3":
        return (
          <h3 key={i} className="mt-7 mb-2 font-display text-lg font-bold text-foreground">
            {block.text}
          </h3>
        );
      case "list": {
        const List = block.ordered ? "ol" : "ul";
        return (
          <List
            key={i}
            className={`my-4 flex flex-col gap-2.5 pl-5 text-[1.0625rem] leading-[1.7] text-muted ${
              block.ordered ? "list-decimal" : "list-disc marker:text-primary"
            }`}
          >
            {block.items.map((item, j) => (
              <li key={j} className="pl-1">
                <InlineText text={item} lang={lang} />
              </li>
            ))}
          </List>
        );
      }
      case "checklist":
        return (
          <ul key={i} className="my-5 flex list-none flex-col gap-3 p-0">
            {block.items.map((item, j) => (
              <li
                key={j}
                className="flex items-start gap-3 text-[1.0625rem] leading-[1.65] text-muted"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check size={13} strokeWidth={3} aria-hidden />
                </span>
                <span>
                  <InlineText text={item} lang={lang} />
                </span>
              </li>
            ))}
          </ul>
        );
      case "table":
        return (
          <ArticleTable
            key={i}
            head={block.head}
            rows={block.rows}
            caption={block.caption}
            lang={lang}
          />
        );
      case "callout": {
        const warning = block.tone === "warning";
        const Icon = warning ? TriangleAlert : Info;
        return (
          <aside
            key={i}
            className={`my-6 flex gap-3 rounded-2xl border p-4 ${
              warning ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-surface"
            }`}
          >
            <Icon
              size={20}
              className={`mt-0.5 shrink-0 ${warning ? "text-amber-600" : "text-primary"}`}
              aria-hidden
            />
            <div className="text-[0.975rem] leading-relaxed text-muted">
              {block.title && (
                <p className="mb-1 font-bold text-foreground">{block.title}</p>
              )}
              <p>
                <InlineText text={block.text} lang={lang} />
              </p>
            </div>
          </aside>
        );
      }
      case "livePrices":
        return article.listings && listings ? (
          <LivePrices key={i} spec={article.listings} result={listings} />
        ) : null;
      case "listings":
        return listings ? (
          <ListingGrid key={i} article={article} result={listings} lang={lang} />
        ) : null;
      case "verifiedPrices":
        return <VerifiedPrices key={i} table={block.table} lang={lang} />;
      case "links":
        return <LinkList key={i} title={block.title} links={block.links} lang={lang} />;
    }
  });
}
