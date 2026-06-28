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
    a: "Shopi is a social discovery classifieds marketplace for Kenya. Sellers post what they are selling, buyers discover items in a nearby feed, and both sides message each other directly to agree on price, pickup, delivery and payment.",
  },
  {
    q: "Does Shopi handle payments or delivery?",
    a: "No. Shopi does not process payments, hold money, arrange delivery or take commission. The app helps buyers and sellers find each other, then they agree on the deal directly.",
  },
  {
    q: "How is Shopi different from normal classified ads sites?",
    a: "Most classifieds start with search filters. Shopi starts with discovery: short posts from nearby sellers appear in a feed, so buyers can find useful items even when they did not know exactly what to search for.",
  },
  {
    q: "How does Shopi personalize my feed?",
    a: "Shopi learns from what you open, like, save and message about. If you keep engaging with cars, your feed can show more cars. If your interest moves to fashion, furniture, phones or farm produce, the feed can adjust.",
  },
  {
    q: "What can I buy and sell on Shopi?",
    a: "Shopi is built for everyday local selling: cars, phones, electronics, fashion, furniture, home items, farm produce, livestock and other goods that people in Kenya already buy and sell.",
  },
  {
    q: "Does Shopi work across Kenya?",
    a: "Yes. Shopi is built for local discovery across Kenya, including Nairobi, Mombasa, Kisumu, Nakuru, Meru and smaller towns. Nearby posts are prioritized, but buyers and sellers can still connect across locations.",
  },
];

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isValidLocale(lang) ? lang : "en";
  const canonical = `${siteConfig.url}/${safeLang}`;

  const title = `${siteConfig.name} | Kenya Local Marketplace & Classified Ads Feed`;
  const description = siteConfig.description;

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
            letterSpacing: 0,
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
