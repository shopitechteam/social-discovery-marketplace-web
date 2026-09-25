import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
//import { BlogSection } from "@/components/landing/BlogSection";
import { DeepDivesSection } from "@/components/landing/DeepDivesSection";
import { DownloadSection } from "@/components/landing/DownloadSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { PillarsSection } from "@/components/landing/PillarsSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MarketplaceCategoriesSection } from "@/components/landing/MarketplaceCategoriesSection";
import { MobileActionBar } from "@/components/landing/MobileActionBar";
import { ShopiAgentSection } from "@/components/landing/ShopiAgentSection";
import { WelcomeBackBanner } from "@/components/landing/WelcomeBackBanner";
//import { SupportChat } from "@/components/landing/SupportChat";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
//import { VideoBubble } from "@/components/landing/VideoBubble";
import { getDictionary } from "@/i18n/getDictionary";
import { isValidLocale, locales, type Locale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { HOME_FAQ, type FaqItem } from "@/lib/faq";
import {
  organizationSchema,
  websiteSchema,
  marketplaceSchema,
  agentSchema,
  faqSchema,
  marketplaceWebPageSchema,
  jsonLd,
} from "@/lib/structured-data";

// Daily: the page is static copy plus the admin-controlled featured-sellers
// section, so a seller featured in the admin appears within 24 hours (or on
// the next deploy). Keep in step with SOCIAL_PROOF_REVALIDATE_SECONDS (a
// literal is required here by Next).
export const revalidate = 86400;

const HOME_META: Record<
  Locale,
  { title: string; description: string; ogLocale: string }
> = {
  // Titles lead with commercial intent, not brand positioning — the brand term
  // already ranks unaided, so the title is spent on the query people type.
  //
  // The home page owns the two-sided "buy and sell" cluster; the seller-intent
  // "sell online in Kenya" cluster belongs to /sell-in-kenya. Both pages used to
  // carry "Sell Online in Kenya", which made them compete for one query while
  // neither fully covered "buy and sell online", where Search Console shows
  // real impressions and almost no clicks.
  // The description's job is the click, not the ranking. It leads with the
  // exact-match phrase, then spends the remaining characters on the two things
  // that actually move a Kenyan seller: the listing writes itself, and nothing
  // is deducted from the sale.
  en: {
    title: `${siteConfig.name} — Buy and Sell Online in Kenya | Free Marketplace`,
    description:
      "Buy and sell online in Kenya, free. Post a photo, Shopi Agent writes the listing and nearby buyers message you directly. No commission, no listing fees.",
    ogLocale: "en_KE",
  },
  sw: {
    title: `${siteConfig.name} — Nunua na Uuze Mtandaoni Kenya | Soko Bure`,
    description:
      "Nunua na uuze mtandaoni Kenya bure. Piga picha, Shopi Agent ikuandikie tangazo, na wanunuzi wa karibu wakutumie ujumbe. Hakuna commission wala ada.",
    ogLocale: "sw_KE",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isValidLocale(lang) ? lang : "en";
  const canonical = `${siteConfig.url}/${safeLang}`;

  const { title, description, ogLocale } = HOME_META[safeLang];
  // The share card is localised (see ./opengraph-image.tsx), so each locale
  // points at its own rather than the site-wide English default.
  const ogImage = `/${safeLang}/opengraph-image`;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [...siteConfig.keywords],
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${siteConfig.url}/${l}`]),
        ),
        "x-default": `${siteConfig.url}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      locale: ogLocale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Rootpage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const faq = HOME_FAQ[lang];
  const homepageCategorySchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteConfig.url}/${lang}#popular-categories`,
    name: "Popular Shopi marketplace categories in Kenya",
    itemListElement: [
      {
        name: "Phones and electronics for sale in Kenya",
        url: `${siteConfig.url}/${lang}/phones-electronics-kenya`,
      },
      {
        name: "Land, plots and property for sale in Kenya",
        url: `${siteConfig.url}/${lang}/property-for-sale-kenya`,
      },
      {
        name: "Cars for sale in Kenya",
        url: `${siteConfig.url}/${lang}/sell-car-kenya`,
      },
      {
        name: "Beauty and cosmetics in Kenya",
        url: `${siteConfig.url}/${lang}/beauty-cosmetics-kenya`,
      },
    ].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...item,
    })),
  };

  return (
    <>
      <div
        // The two --landing-page-* vars tune every landing section at once.
        // LandingFooter carries its own copy of this shell, so it renders
        // outside this wrapper (below) to avoid doubling the lg inset.
        // Phones get the standard 16px app gutter; tablets and up keep the
        // fluid inset.
        className="lg:px-30 [--landing-page-max:1400px] [--landing-page-x:1rem] md:[--landing-page-x:clamp(0.875rem,1.2vw,1.25rem)]"
      >
        {/* Structured data — Organization, WebSite (+search), marketplace app,
            Shopi Agent, popular categories, FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              organizationSchema,
              websiteSchema,
              marketplaceSchema,
              agentSchema,
              marketplaceWebPageSchema({
                url: `${siteConfig.url}/${lang}`,
                name: HOME_META[lang].title,
                description: HOME_META[lang].description,
                keywords: [
                  "sell online in Kenya",
                  "buy and sell locally",
                  "AI marketplace Kenya",
                  "free marketplace Kenya",
                  "Shopi Agent",
                ],
              }),
              homepageCategorySchema,
              faqSchema(faq),
            ),
          }}
        />

        <LandingNav dict={dict} lang={lang} />
        {/* Written to be understood in a few seconds of scrolling: one idea
            per section, a headline and a short line, and the UI (listings,
            mockups, icons) doing the explaining. Say each benefit once — the
            strip under the hero owns free / 0% / nearby / direct. */}
        <HeroSection dict={dict} lang={lang} />
        <PillarsSection dict={dict} />
        {/* Real featured sellers (admin-controlled) straight after the hero:
            live listings show what Shopi is faster than copy can. Renders
            nothing when no seller is featured or the API is unreachable. */}
        <SocialProofSection dict={dict} lang={lang} />
        {/* Sell → find → talk, then the Shopi Agent line. */}
        <DeepDivesSection dict={dict} lang={lang} />
        <ShopiAgentSection dict={dict} lang={lang} />
        <MarketplaceCategoriesSection dict={dict} lang={lang} />
        {/* The TikTok saver lives on /tiktok-downloader (linked from the
            footer), so the funnel runs straight from categories to the FAQ
            and the closing CTA. */}
        {/* <BlogSection dict={dict} /> */}
        {/* Visible FAQ — strong AEO signal and matches the FAQ structured data */}
        <HomeFaq items={faq} lang={lang} />
        <DownloadSection dict={dict} lang={lang} />
      </div>
      <LandingFooter dict={dict} lang={lang} />
      <WelcomeBackBanner dict={dict} lang={lang} />
      <MobileActionBar dict={dict} lang={lang} />
      {/* Landing-only floating video greeter; dismissible for the session. */}
      {/* <VideoBubble /> */}
      {/* <SupportChat dict={dict} /> */}
    </>
  );
}

function HomeFaq({ items, lang }: { items: FaqItem[]; lang: Locale }) {
  return (
    <section
      id="faq"
      className="mx-auto max-w-[min(760px,var(--landing-page-max))] px-(--landing-page-x) py-8 md:py-20"
    >
      <div className="mb-4 md:mb-10">
        <h2 className="font-display text-[1.375rem] font-bold tracking-normal leading-tight text-foreground md:text-[clamp(1.6rem,3.2vw,2.5rem)]">
          {lang === "sw" ? "Maswali ya kawaida" : "Common questions"}
        </h2>
      </div>

      {/* Phones: one grouped list, like a settings screen. Wider screens:
          separate cards. */}
      <div className="flex flex-col max-md:divide-y max-md:divide-border max-md:overflow-hidden max-md:rounded-2xl max-md:border max-md:border-border max-md:bg-[rgb(var(--color-bg-elevated))] md:gap-3">
        {items.map(({ q, a }) => (
          <details
            key={q}
            className="group md:overflow-hidden md:rounded-[14px] md:border md:border-border md:bg-elevated"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[0.9375rem] leading-snug font-semibold text-foreground select-none md:px-5 md:py-4 md:text-md">
              {q}
              <ChevronDown
                size={18}
                aria-hidden
                className="shrink-0 text-muted transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="px-4 pb-4 text-[0.875rem] leading-relaxed text-muted md:px-5 md:pb-[1.1rem] md:text-base md:leading-[1.7]">
              {a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
