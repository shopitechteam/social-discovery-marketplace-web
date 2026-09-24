import { formatPrice, summarizePrices } from "@/lib/articles/listings";
import type { ListingSpec } from "@/lib/articles";
import type { ArticleListingsResult } from "../queries/articleListings";

/** "24 September 2026", in Kenyan time — the day the listings were read. */
export function formatCheckedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });
}

const plural = (n: number, noun: string) =>
  `${n.toLocaleString("en-KE")} ${noun} ${n === 1 ? "listing" : "listings"}`;

/**
 * The live price answer: the range of asking prices on current Shopi
 * listings. Every figure comes from listings fetched for this render, and
 * the check date is the fetch time. With too few listings it says so instead
 * of presenting two data points as "the price".
 */
export function LivePrices({
  spec,
  result,
}: {
  spec: ListingSpec;
  result: ArticleListingsResult;
}) {
  const perMonth = spec.priceUnit === "month";
  const heading = perMonth ? "Asking rent on Shopi now" : "Asking prices on Shopi now";

  if (!result.ok) {
    return (
      <div className="my-6 rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-bold text-foreground">{heading}</p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
          Live listings couldn&apos;t be loaded just now, so current asking
          prices aren&apos;t shown. Refresh in a moment, or use the search link
          below.
        </p>
      </div>
    );
  }

  const summary = summarizePrices(result.listings);
  const checked = formatCheckedDate(result.checkedAt);

  if (!summary) {
    const count = result.listings.length;
    return (
      <div className="my-6 rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-bold text-foreground">{heading}</p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
          {count === 0
            ? `There are no ${spec.label} listings on Shopi right now, so there are no current asking prices to show. Shopi only shows prices from real listings, never estimates.`
            : `Only ${plural(count, spec.label)} on Shopi right now — too few to show a reliable price range. ${count === 1 ? "It's" : "They're"} shown below.`}
        </p>
        <p className="mt-3 text-xs text-muted">Checked {checked}.</p>
      </div>
    );
  }

  const unit = perMonth ? " a month" : "";
  return (
    <div className="my-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <p className="text-sm font-bold text-foreground">{heading}</p>
      <p className="mt-2 font-display text-[clamp(1.5rem,4.5vw,2rem)] leading-tight font-bold text-foreground tabular-nums">
        {formatPrice(summary.low, summary.currency)} –{" "}
        {formatPrice(summary.high, summary.currency)}
        {unit && <span className="text-base font-semibold text-muted">{unit}</span>}
      </p>
      <p className="mt-2 text-[0.95rem] text-muted tabular-nums">
        Median {formatPrice(summary.median, summary.currency)}
        {unit} · {summary.trimmed ? "middle 80% of " : "based on "}
        {plural(summary.count, spec.label)}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Checked {checked}. These are sellers&apos; asking prices on Shopi, not
        final sale prices.
      </p>
    </div>
  );
}
