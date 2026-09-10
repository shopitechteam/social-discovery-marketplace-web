import React from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/getDictionary";

/**
 * Honest use cases — not fabricated reviews, and deliberately not a wall of
 * five-star quotes from people who do not exist. Each card describes a kind of
 * seller the product is built for and the exact steps they take, so the reader
 * can place themselves in one.
 *
 * Every card ends on an internal link to a real category page. The section used
 * to close with an outbound link to a competing marketplace, which handed link
 * equity away from the homepage — the comparison argument now lives on
 * /marketplace-alternatives-kenya, where it belongs.
 */
const useCases: {
  node: React.ReactNode;
  who: string;
  href: string;
  linkLabel: string;
  accentBar: string;
  accentText: string;
}[] = [
  {
    node: (
      <>
        A farmer in Kiambu films the animals in the shamba, adds a price and a
        location, and posts. Buyers see it in the local feed and message
        directly, so no broker sets the price or the conversation.
      </>
    ),
    who: "Farm produce & livestock",
    href: "/feed",
    linkLabel: "See what's in the feed",
    accentBar: "bg-primary",
    accentText: "text-primary",
  },
  {
    node: (
      <>
        A phone dealer in town photographs a clean iPhone. Shopi Agent drafts
        the title, the storage, the condition and the description, the dealer
        fixes the price, and it is live before the next customer walks in.
      </>
    ),
    who: "Phones & electronics",
    href: "/phones-electronics-kenya",
    linkLabel: "Sell phones and electronics",
    accentBar: "bg-secondary",
    // secondary-strong (dark amber): base #ff9f40 is only 2.04:1 on white.
    accentText: "text-secondary-strong",
  },
  {
    node: (
      <>
        Someone selling skincare and wigs from home posts each product with
        shades, sizes and delivery options. No website to build, no shopfront to
        rent, and no commission taken off what a customer pays.
      </>
    ),
    who: "Beauty, fashion & home",
    href: "/beauty-cosmetics-kenya",
    linkLabel: "Sell beauty products",
    accentBar: "bg-accent",
    accentText: "text-accent",
  },
];

export function TestimonialsSection({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: string;
}) {
  return (
    <section className="border-y border-border bg-surface px-(--landing-page-x) py-20">
      <div className="mx-auto max-w-(--landing-page-max)">
        <div className="mb-12">
          <p className="mb-3 text-sm font-bold tracking-widest uppercase text-muted">
            {dict.testimonials.sectionLabel}
          </p>
          <h2 className="max-w-2xl font-display text-[clamp(1.6rem,3.2vw,2.5rem)] font-bold tracking-normal leading-tight text-foreground">
            {dict.testimonials.headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {useCases.map(
            ({ node, who, href, linkLabel, accentBar, accentText }) => (
              <div
                key={who}
                className="flex flex-col gap-5 rounded-lg border border-border bg-elevated p-8"
              >
                <div className={`h-1 w-9 rounded-sm ${accentBar}`} />
                <p className="flex-1 text-md leading-[1.6] text-foreground">
                  {node}
                </p>
                <div>
                  <div className={`text-sm font-bold ${accentText}`}>{who}</div>
                  <Link
                    href={`/${lang}${href}`}
                    className="mt-1 inline-block text-sm font-semibold text-muted underline decoration-dotted underline-offset-4 hover:text-foreground"
                  >
                    {linkLabel}
                  </Link>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
