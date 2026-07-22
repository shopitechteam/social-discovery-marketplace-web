import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Pill } from "./Pill";

/**
 * Seller-side pitch for the four category landing pages.
 *
 * A marketplace is only as good as its supply, so this section talks to the
 * person with something to sell, not the browser. Every claim here is one the
 * product actually keeps — free to post, no commission, buyers message you
 * directly — and every `href` is a real route (the four /*-kenya pages,
 * /sell-in-kenya and /upload). Nothing links to a page we haven't built.
 */
const categories = [
  {
    title: "Phones and electronics",
    body: "Sell the Samsung or iPhone you upgraded from, a spare laptop, a smart TV or speakers. Post the condition and price, and buyers message you about it.",
    items: ["Samsung", "iPhone", "Used phones", "Smart TVs", "Laptops"],
    href: "/phones-electronics-kenya",
    cta: "Sell phones and electronics",
  },
  {
    title: "Land, plots and property",
    body: "Put plots, land, and houses for sale or rent in front of local buyers — from Nairobi to Nyahururu and Nyandarua — with photos, price and location.",
    items: ["Plots", "Land", "Houses for sale", "Houses for rent"],
    href: "/property-for-sale-kenya",
    cta: "List land and property",
  },
  {
    title: "Cars for sale",
    body: "Post your car with real photos or a walkaround video, plus make, model, year, mileage and price. Serious buyers chat with you inside Shopi.",
    items: ["Used cars", "Saloons", "SUVs", "Pickups"],
    href: "/sell-car-kenya",
    cta: "Sell your car",
  },
  {
    title: "Beauty and cosmetics",
    body: "Turn a beauty hustle into a shopfront. Post skincare, makeup, perfumes, wigs and hair products with shades, sizes and delivery options.",
    items: ["Skincare", "Makeup", "Perfumes", "Wigs", "Hair products"],
    href: "/beauty-cosmetics-kenya",
    cta: "Sell beauty products",
  },
];

export function MarketplaceCategoriesSection({ lang }: { lang: string }) {
  return (
    <section
      id="marketplace-categories"
      className="border-y border-default bg-surface px-(--landing-page-x) py-14 md:py-20"
    >
      <div className="mx-auto max-w-(--landing-page-max)">
        <div className="mb-9 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-normal text-primary md:text-sm">
            Start selling
          </p>
          <h2 className="font-display text-[clamp(1.65rem,2.8vw,2.5rem)] font-bold leading-tight tracking-normal text-foreground">
            Whatever you have to sell, post it today.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-normal text-muted">
            Posting on Shopi is free and we take no commission. You do not need
            a shop, a website or a bank account — photos or a short video, a
            price in shillings and your location are enough. Buyers message you
            directly and you agree on payment and delivery between yourselves.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {categories.map(({ title, body, items, href, cta }) => (
            <Link
              key={title}
              href={`/${lang}${href}`}
              className="group flex flex-col rounded-lg border border-border bg-elevated p-5 no-underline transition-colors hover:border-[rgb(var(--color-border-strong))]"
            >
              <article className="flex h-full flex-col">
                <h3 className="font-display text-[1.1rem] font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-[1.7] text-muted">
                  {body}
                </p>
                <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                {/* Not a nested <a> — the whole card is the link. */}
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  {cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </span>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Pill
            href={`/${lang}/upload`}
            className="bg-primary px-7 py-3.5 text-white hover:opacity-90"
          >
            Post your first item
          </Pill>
          <Pill href={`/${lang}/sell-in-kenya`} variant="outline">
            How selling works
          </Pill>
        </div>
      </div>
    </section>
  );
}
