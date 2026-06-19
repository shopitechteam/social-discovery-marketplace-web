import type { Metadata } from "next";
import { AudienceSection } from "@/components/landing/AudienceSection";
//import { BlogSection } from "@/components/landing/BlogSection";
import { DownloadSection } from "@/components/landing/DownloadSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
//import { SupportChat } from "@/components/landing/SupportChat";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { getDictionary } from "@/i18n/getDictionary";
import { isValidLocale, locales } from "@/i18n/config";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import {
  organizationSchema,
  websiteSchema,
  marketplaceSchema,
  faqSchema,
  jsonLd,
} from "@/lib/structured-data";

const HOME_FAQ = [
  {
    q: "What is Shopi?",
    a: "Shopi is Kenya's social discovery marketplace. Sellers post short videos and photos of what they're selling, and buyers find products by scrolling a local feed — then message the seller directly to agree on price and pickup. It works like TikTok for things that are actually for sale near you.",
  },
  {
    q: "Is Shopi free to use?",
    a: "Yes. Posting products and messaging sellers is completely free. Shopi does not charge listing fees, take a commission on sales, or hold your money. Buyers and sellers deal directly with each other.",
  },
  {
    q: "What can I buy and sell on Shopi?",
    a: "Almost anything — cars, phones, electronics, fashion, furniture, home items, and farm produce or livestock like cows and goats. If you have a product and a phone camera, you can post it.",
  },
  {
    q: "How is Shopi different from Jiji?",
    a: "Jiji is search-based: you type what you want and browse listings. Shopi is discovery-based: real products from sellers near you appear in your feed as short videos, like TikTok — combining social discovery with local classifieds in one place.",
  },
  {
    q: "Does Shopi work across Kenya?",
    a: "Yes. Shopi surfaces sellers near you first using location tags, so a buyer in Meru, Nairobi, Kisumu or anywhere in Kenya sees relevant local products. Sellers and buyers arrange delivery or pickup directly.",
  },
];

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isValidLocale(lang) ? lang : "en";
  const canonical = `${siteConfig.url}/${safeLang}`;

  const title = `${siteConfig.name} — ${siteConfig.tagline}`;
  const description = siteConfig.description;

  return {
    title,
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
      locale: siteConfig.locale,
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

  return (
    <div>
      {/* Structured data — Organization, WebSite (+search), marketplace app, FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            organizationSchema,
            websiteSchema,
            marketplaceSchema,
            faqSchema(HOME_FAQ),
          ),
        }}
      />

      <LandingNav dict={dict} lang={lang} />
      <HeroSection dict={dict} />
      <FeaturesSection dict={dict} />
      <HowItWorksSection dict={dict} />
      <AudienceSection dict={dict} />
      <TestimonialsSection dict={dict} />
      {/* <BlogSection dict={dict} /> */}
      {/* Visible FAQ — strong AEO signal and matches the FAQ structured data */}
      <HomeFaq />
      <DownloadSection dict={dict} />
      <LandingFooter dict={dict} />
      {/* <SupportChat dict={dict} /> */}
    </div>
  );
}

function HomeFaq() {
  return (
    <section
      id="faq"
      style={{ padding: "5rem 1.25rem", maxWidth: 760, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <p
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(var(--brand-primary))",
            marginBottom: "0.75rem",
          }}
        >
          Questions
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            letterSpacing: "-0.025em",
            color: "rgb(var(--color-text))",
          }}
        >
          Everything you might be wondering.
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {HOME_FAQ.map(({ q, a }) => (
          <details
            key={q}
            style={{
              border: "1px solid rgb(var(--color-border))",
              borderRadius: 14,
              background: "rgb(var(--color-bg-elevated))",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                padding: "1rem 1.25rem",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "var(--text-md)",
                color: "rgb(var(--color-text))",
                listStyle: "none",
                userSelect: "none",
              }}
            >
              {q}
            </summary>
            <div
              style={{
                padding: "0 1.25rem 1.1rem",
                fontSize: "var(--text-base)",
                lineHeight: 1.7,
                color: "rgb(var(--color-text-muted))",
              }}
            >
              {a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
