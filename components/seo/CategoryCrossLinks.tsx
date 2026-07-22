import Link from "next/link";

/**
 * Cross-links between the category landing pages.
 *
 * Each of these pages earns its own search traffic, so a visitor arriving on
 * Property from Google previously had no route to Cars or Phones — the pages
 * were orphans of each other. This block is the single source of truth for
 * that link set: add a page here once and every sibling picks it up.
 */
export const categoryPages = [
  {
    path: "/phones-electronics-kenya",
    title: "Phones and electronics",
    body: "Samsung, iPhone, used phones, smart TVs, laptops and speakers from sellers across Kenya.",
  },
  {
    path: "/property-for-sale-kenya",
    title: "Land, plots and property",
    body: "Land, plots, houses for sale and houses for rent, from Nairobi to Nyahururu and Nyandarua.",
  },
  {
    path: "/sell-car-kenya",
    title: "Cars for sale",
    body: "Used cars with photos or video, make, model, year, mileage, price and direct buyer chat.",
  },
  {
    path: "/beauty-cosmetics-kenya",
    title: "Beauty and cosmetics",
    body: "Skincare, makeup, perfumes, wigs and hair products from local beauty sellers.",
  },
  {
    path: "/sell-in-kenya",
    title: "Selling on Shopi",
    body: "How to post an item for free, what to include, and how buyers reach you.",
  },
] as const;

export function CategoryCrossLinks({
  lang,
  currentPath,
}: {
  lang: string;
  /** Path of the page rendering this block, so it never links to itself. */
  currentPath: string;
}) {
  const others = categoryPages.filter((page) => page.path !== currentPath);

  return (
    <section className="bg-surface px-5 py-16">
      <div className="mx-auto max-w-190">
        <h2 className="mb-7 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-normal text-foreground">
          Browse other categories on Shopi
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {others.map(({ path, title, body }) => (
            <Link
              key={path}
              href={`/${lang}${path}`}
              className="rounded-lg border border-border bg-elevated p-5 no-underline transition-colors hover:border-[rgb(var(--color-border-strong))]"
            >
              <h3 className="font-display text-[1.05rem] font-bold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-[0.9rem] leading-[1.7] text-muted">
                {body}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
