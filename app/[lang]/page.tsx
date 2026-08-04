import type { Metadata } from "next";
//import { BlogSection } from "@/components/landing/BlogSection";
import { DeepDivesSection } from "@/components/landing/DeepDivesSection";
import { DownloadSection } from "@/components/landing/DownloadSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PillarsSection } from "@/components/landing/PillarsSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MarketplaceCategoriesSection } from "@/components/landing/MarketplaceCategoriesSection";
import { WelcomeBackBanner } from "@/components/landing/WelcomeBackBanner";
//import { SupportChat } from "@/components/landing/SupportChat";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { TiktokSaverSection } from "@/components/landing/TiktokSaverSection"; //
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
  jsonLd,
} from "@/lib/structured-data";

const HOME_META: Record<
  Locale,
  { title: string; description: string; ogLocale: string }
> = {
  // Titles lead with the commercial intent ("sell online in Kenya") rather than
  // the brand positioning — the brand term already ranks unaided, so the title
  // is spent on the query people actually type.
  en: {
    title: `${siteConfig.name} — Sell Online in Kenya | Buy & Sell Locally`,
    description:
      "Sell online in Kenya for free with Shopi. Use Shopi Agent to create listings with AI, discover local buyers, and connect directly with buyers and sellers. Zero commission.",
    ogLocale: "en_KE",
  },
  sw: {
    title: `${siteConfig.name} — Uza Mtandaoni Kenya | Nunua na Uuze Karibu Nawe`,
    description:
      "Uza mtandaoni Kenya bure ukitumia Shopi. Tumia Shopi Agent kuunda matangazo kwa AI, pata wanunuzi wa karibu, na wasiliana moja kwa moja na wanunuzi na wauzaji. Hakuna commission.",
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
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      title,
      description,
      images: [siteConfig.ogImage],
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
        className="lg:px-30 [--landing-page-max:1400px] [--landing-page-x:clamp(0.875rem,1.2vw,1.25rem)]"
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
              homepageCategorySchema,
              faqSchema(faq),
            ),
          }}
        />

        <LandingNav dict={dict} lang={lang} />
        <HeroSection dict={dict} lang={lang} />
        <PillarsSection dict={dict} />
        <MarketplaceCategoriesSection lang={lang} />
        <StatsSection dict={dict} />
        <DeepDivesSection dict={dict} lang={lang} />
        <HowItWorksSection dict={dict} />
        <TestimonialsSection dict={dict} />
        {/* Side utility, intentionally low on the page — a "by the way" tool,
            not a headline feature. */}
        <TiktokSaverSection dict={dict} />
        {/* <BlogSection dict={dict} /> */}
        {/* Visible FAQ — strong AEO signal and matches the FAQ structured data */}
        <HomeFaq items={faq} lang={lang} />
        <DownloadSection dict={dict} lang={lang} />
      </div>
      <LandingFooter dict={dict} lang={lang} />
      <WelcomeBackBanner dict={dict} lang={lang} />
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
      className="mx-auto max-w-[min(760px,var(--landing-page-max))] px-(--landing-page-x) py-20"
    >
      <div className="mb-10">
        <p className="mb-3 text-sm font-bold tracking-widest uppercase text-muted">
          {lang === "sw" ? "Maswali" : "Questions"}
        </p>
        <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.5rem)] font-bold tracking-normal leading-tight text-foreground">
          {lang === "sw"
            ? "Majibu ya mambo unayoweza kujiuliza."
            : "Everything you might be wondering."}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {items.map(({ q, a }) => (
          <details
            key={q}
            className="overflow-hidden rounded-[14px] border border-border bg-elevated"
          >
            <summary className="cursor-pointer list-none px-5 py-4 text-md font-semibold text-foreground select-none">
              {q}
            </summary>
            <div className="px-5 pb-[1.1rem] text-base leading-[1.7] text-muted">
              {a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
