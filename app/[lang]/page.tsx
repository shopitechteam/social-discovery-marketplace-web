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
import {
  organizationSchema,
  websiteSchema,
  marketplaceSchema,
  agentSchema,
  faqSchema,
  jsonLd,
} from "@/lib/structured-data";

type FaqItem = { q: string; a: string };

const HOME_FAQ_EN: FaqItem[] = [
  {
    q: "What is Shopi?",
    a: "Shopi is Kenya's free social marketplace where people discover, buy and sell locally. Browse a personalized feed of nearby products, chat directly with buyers and sellers, or use Shopi Agent to make buying and selling faster and easier.",
  },
  {
    q: "What is Shopi Agent?",
    a: "Shopi Agent is your AI buying and selling assistant. It can turn a photo into a complete listing by generating titles, descriptions, categories and product details. It can also help buyers find products by understanding natural conversations instead of relying on exact search terms.",
  },
  {
    q: "Does Shopi handle payments or delivery?",
    a: "No. Shopi does not process payments, arrange delivery or take commission. Buyers and sellers agree directly on the price, payment method and delivery or pickup that works for them.",
  },
  {
    q: "How is Shopi different from other marketplaces?",
    a: "Shopi combines a personalized social feed with AI-powered assistance. Instead of only searching or filling long forms, you can discover products naturally, use Shopi Agent to create listings or find products, and connect directly with nearby buyers and sellers.",
  },
  {
    q: "How does Shopi personalize my feed?",
    a: "Your feed learns from what you view, save and message about. The more you use Shopi, the better it becomes at showing nearby products and categories that match your interests.",
  },
  {
    q: "What can I buy and sell on Shopi?",
    a: "Almost anything that can be bought and sold locally in Kenya, including cars, phones, electronics, fashion, furniture, home items, farm produce, livestock and much more.",
  },
  {
    q: "How do I post something for sale?",
    a: "You can post manually by adding photos or videos, or let Shopi Agent guide you through the process. Upload a photo, answer a few simple questions and Shopi Agent generates the title, description, category and other listing details for you.",
  },
  {
    q: "How do buyers and sellers communicate?",
    a: "Every listing includes built-in messaging so buyers and sellers can chat directly, ask questions, negotiate and agree on payment and delivery without leaving Shopi.",
  },
  {
    q: "Is Shopi free to use?",
    a: "Yes. It's free to browse, free to post and Shopi takes 0% commission on your sales. You keep every shilling you earn.",
  },
  {
    q: "Does Shopi work across Kenya?",
    a: "Yes. Shopi is built for local discovery across all 47 counties. Nearby listings are prioritized so you can find products close to you, while still being able to discover listings from other parts of Kenya.",
  },
];

const HOME_FAQ: Record<Locale, FaqItem[]> = {
  en: HOME_FAQ_EN,
  sw: [
    {
      q: "Shopi ni nini?",
      a: "Shopi ni soko la kijamii la bure nchini Kenya ambapo unaweza kugundua, kununua na kuuza bidhaa karibu nawe. Vinjari feed iliyobinafsishwa ya bidhaa za karibu, wasiliana moja kwa moja na wanunuzi au wauzaji, au tumia Shopi Agent kufanya kununua na kuuza kuwa rahisi zaidi.",
    },
    {
      q: "Shopi Agent ni nini?",
      a: "Shopi Agent ni msaidizi wako wa AI wa kununua na kuuza. Inaweza kubadilisha picha kuwa tangazo kamili kwa kutengeneza kichwa, maelezo, kategoria na taarifa za bidhaa. Pia huwasaidia wanunuzi kupata bidhaa kwa kuelewa wanachotafuta kupitia mazungumzo ya kawaida.",
    },
    {
      q: "Je, Shopi inashughulikia malipo au usafirishaji?",
      a: "Hapana. Shopi haichakati malipo, haipangi usafirishaji wala haichukui commission. Mnunuzi na muuzaji hukubaliana moja kwa moja kuhusu bei, njia ya malipo na jinsi ya kuchukua au kusafirisha bidhaa.",
    },
    {
      q: "Shopi ni tofauti vipi na masoko mengine mtandaoni?",
      a: "Shopi inaunganisha feed ya kijamii na Shopi Agent. Badala ya kutegemea utafutaji pekee au kujaza fomu ndefu, unaweza kugundua bidhaa kwa urahisi, kutumia Shopi Agent kuunda tangazo au kutafuta bidhaa, na kuwasiliana moja kwa moja na watu walio karibu nawe.",
    },
    {
      q: "Shopi hupangaje feed yangu?",
      a: "Feed yako hujifunza kutokana na bidhaa unazofungua, kuhifadhi na kutuma ujumbe kuzihusu. Kadri unavyoendelea kutumia Shopi, ndivyo inavyoonyesha bidhaa za karibu zinazolingana zaidi na mambo unayopenda.",
    },
    {
      q: "Ninaweza kununua na kuuza nini kwenye Shopi?",
      a: "Unaweza kununua au kuuza karibu kila kitu kinachouzwa nchini Kenya, ikiwemo magari, simu, vifaa vya elektroniki, nguo, samani, bidhaa za nyumbani, mazao, mifugo na bidhaa nyingine nyingi.",
    },
    {
      q: "Je, Shopi inafanya kazi kote Kenya?",
      a: "Ndiyo. Shopi imejengwa kwa biashara za karibu katika kaunti zote 47 nchini Kenya. Bidhaa zilizo karibu nawe hupewa kipaumbele, lakini bado unaweza kugundua na kuwasiliana na wauzaji kutoka maeneo mengine nchini.",
    },
    {
      q: "Ninafunguaje akaunti ya Shopi?",
      a: "Nenda shopi.co.ke, gusa Sign in, kisha ujisajili kwa Google, Apple au barua pepe na nenosiri. Ni bure kujiunga na huhitaji biashara iliyosajiliwa ili kuanza kutumia Shopi.",
    },
    {
      q: "Ninawezaje kuweka bidhaa ya kuuza kwenye Shopi?",
      a: "Unaweza kutengeneza tangazo mwenyewe au kutumia Shopi Agent ikuongoze. Pakia picha au video, au zungumza na Shopi Agent, ambayo itakutengenezea kichwa, maelezo, kategoria na taarifa nyingine za bidhaa. Kuchapisha ni bure kabisa.",
    },
    {
      q: "Wanunuzi na wauzaji huwasilianaje kwenye Shopi?",
      a: "Kupitia mfumo wa chat uliopo ndani ya Shopi. Fungua tangazo na ugonge Message ili kuzungumza moja kwa moja na muuzaji au mnunuzi, kujadiliana bei na kukubaliana kuhusu malipo na usafirishaji bila kutoka kwenye Shopi.",
    },
    {
      q: "Je, kutumia Shopi ni bure?",
      a: "Ndiyo. Ni bure kuvinjari bidhaa, ni bure kuweka matangazo, na Shopi haichukui commission yoyote kwenye mauzo yako. Unabaki na kila shilingi unayopata.",
    },
  ],
};

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
