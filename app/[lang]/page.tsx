import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, MessageCircle, Wallet } from "lucide-react";
import { notFound } from "next/navigation";
import { isValidLocale, locales, type Locale } from "@/i18n/config";
import { siteConfig } from "@/config/site";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { organizationSchema, websiteSchema, marketplaceSchema, faqSchema, jsonLd } from "@/lib/structured-data";

const COPY = {
  en: {
    title: "Buy and Sell Online in Kenya | Shopi",
    description: "Buy and sell online in Kenya with Shopi. Discover local products, create a post from a photo and get a suggested price with Shopi Agent.",
    heroTitle: "Buy and sell anything in Kenya",
    heroBody: "Discover products nearby. Shopi Agent finds matches, drafts your post from a photo, and suggests a price.",
    cta: "Create a post",
    free: "Free to post",
    commission: "No commission",
    direct: "Talk to buyers directly",
    howTitle: "Post it. Talk to buyers.",
    howBody: "Add a photo, set your price and share where you are. Your post appears on Shopi for people to find.",
    agentTitle: "One photo. Shopi helps with the rest.",
    agentBody: "Shopi Agent can draft your listing and suggest a price from a photo. Buyers can describe what they want to find matches.",
    agentLink: "More about Shopi Agent",
    closingTitle: "Ready to sell something?",
    closingBody: "Sign in, create a post and start hearing from buyers.",
    questions: "Good to know",
    faq: [
      { q: "What is Shopi?", a: "Shopi is a social discovery marketplace in Kenya. Browse products, post what you sell and message people directly. Shopi Agent helps you find products and create listings." },
      { q: "Does it cost anything to post?", a: "No. Posting is free, and Shopi does not take a commission when you sell." },
      { q: "How do buyers reach me?", a: "Buyers can message you on Shopi. You agree on payment and pickup or delivery directly with them." },
      { q: "Do I need an account?", a: "You can browse without signing in. To create a post, you need to sign in." },
    ],
  },
  sw: {
    title: "Nunua na Uuze Mtandaoni Kenya | Shopi",
    description: "Nunua na uuze mtandaoni Kenya kupitia Shopi. Pata bidhaa za karibu, tengeneza tangazo kwa picha na upate pendekezo la bei kutoka Shopi Agent.",
    heroTitle: "Nunua na uuze chochote Kenya",
    heroBody: "Gundua bidhaa karibu nawe. Shopi Agent hutafuta bidhaa, hukusaidia kuandika tangazo kwa picha na hupendekeza bei.",
    cta: "Weka tangazo",
    free: "Kuweka tangazo ni bure",
    commission: "Hakuna kamisheni",
    direct: "Ongea na wanunuzi moja kwa moja",
    howTitle: "Weka tangazo. Ongea na wanunuzi.",
    howBody: "Ongeza picha, weka bei na eneo lako. Tangazo lako litaonekana kwenye Shopi ili watu walipate.",
    agentTitle: "Picha moja. Shopi itakusaidia na mengine.",
    agentBody: "Shopi Agent inaweza kukuandikia tangazo na kupendekeza bei kutokana na picha. Wanunuzi wanaweza kueleza wanachotafuta ili wapate bidhaa zinazofaa.",
    agentLink: "Zaidi kuhusu Shopi Agent",
    closingTitle: "Uko tayari kuuza?",
    closingBody: "Ingia, weka tangazo na uanze kupata ujumbe kutoka kwa wanunuzi.",
    questions: "Mambo ya kujua",
    faq: [
      { q: "Shopi ni nini?", a: "Shopi ni soko la kijamii la kugundua bidhaa Kenya. Unaweza kuangalia bidhaa, kuweka tangazo na kutumiana ujumbe moja kwa moja. Shopi Agent inakusaidia kupata bidhaa na kuandika matangazo." },
      { q: "Je, kuweka tangazo kunalipiwa?", a: "Hapana. Kuweka tangazo ni bure na Shopi haichukui kamisheni ukiuza." },
      { q: "Wanunuzi watawasiliana nami vipi?", a: "Wanunuzi wanaweza kukutumia ujumbe kwenye Shopi. Mnakubaliana kuhusu malipo na jinsi ya kupata bidhaa moja kwa moja." },
      { q: "Je, ninahitaji akaunti?", a: "Unaweza kuangalia bidhaa bila kuingia. Ili kuweka tangazo, unahitaji kuingia." },
    ],
  },
} as const;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const { title, description } = COPY[locale];
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${siteConfig.url}/${locale}`, languages: { ...Object.fromEntries(locales.map((value) => [value, `${siteConfig.url}/${value}`])), "x-default": `${siteConfig.url}/en` } },
    openGraph: { type: "website", url: `${siteConfig.url}/${locale}`, siteName: siteConfig.name, title, description, locale: locale === "sw" ? "sw_KE" : "en_KE", images: [`/${locale}/opengraph-image`] },
    twitter: { card: "summary_large_image", title, description, images: [`/${locale}/opengraph-image`] },
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const t = COPY[lang];

  return <div id="top" className="bg-white text-[#172226]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema, websiteSchema, marketplaceSchema, faqSchema([...t.faq])) }} />
    <LandingNav lang={lang} />
    <main>
      <section aria-labelledby="home-title" className="px-4 pb-8 md:px-8 md:pb-14">
        <div className="relative mx-auto flex min-h-[min(700px,72vh)] max-w-[1500px] items-end overflow-hidden rounded-md bg-[#18282a] md:min-h-[min(710px,72vh)] md:items-center">
          <Image src="/assets/og/seller.jpg" alt="Kenyan seller checking his phone at work" fill priority sizes="(max-width: 768px) 100vw, 1500px" className="object-cover object-[55%_center] md:object-[center_45%]" />
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div className="relative z-10 w-full max-w-7xl px-6 py-10 text-white md:mx-auto md:px-12 md:py-16">
            <h1 id="home-title" className="max-w-3xl font-display text-[2rem] font-semibold leading-[1.1] md:text-[clamp(2.75rem,4.5vw,4.25rem)]">{t.heroTitle}</h1>
            <p className="mt-4 max-w-xl text-base leading-snug md:mt-5 md:text-lg">{t.heroBody}</p>
            <Link href="/en/upload" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white no-underline hover:opacity-90 md:mt-8">{t.cta}<ArrowUpRight size={18} aria-hidden /></Link>
          </div>
        </div>
      </section>

      <section id="features" aria-label={lang === "sw" ? "Faida za Shopi" : "Why sell on Shopi"} className="border-y border-[#e0e5e4] bg-[#f4f8f7] px-5 py-7 md:px-8 md:py-9">
        <ul className="mx-auto grid max-w-7xl gap-5 p-0 text-sm font-semibold sm:grid-cols-3 md:text-base">
          <li className="flex items-center gap-3"><Camera className="size-5 shrink-0 text-primary" aria-hidden />{t.free}</li>
          <li className="flex items-center gap-3"><Wallet className="size-5 shrink-0 text-primary" aria-hidden />{t.commission}</li>
          <li className="flex items-center gap-3"><MessageCircle className="size-5 shrink-0 text-primary" aria-hidden />{t.direct}</li>
        </ul>
      </section>

      <section id="how-it-works" className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#e8efef]">
          <Image src="/assets/blog/sofa.jpg" alt="Sofa photographed for a sale post" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
        </div>
        <div className="max-w-lg">
          <h2 className="font-display text-[2rem] font-semibold leading-tight md:text-[3.25rem]">{t.howTitle}</h2>
          <p className="mt-5 text-base leading-relaxed text-[#465458] md:text-lg">{t.howBody}</p>
          <Link href="/en/upload" className="mt-7 inline-flex items-center gap-2 border-b-2 border-primary pb-1 font-semibold text-[#172226] no-underline">{t.cta}<ArrowUpRight size={18} aria-hidden /></Link>
        </div>
      </section>

      <section id="shopi-agent" className="bg-[#f4f8f7] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 md:gap-16">
          <div className="max-w-lg md:order-1">
            <p className="mb-3 text-sm font-semibold text-primary">Shopi Agent</p>
            <h2 className="font-display text-[2rem] font-semibold leading-tight md:text-[3.25rem]">{t.agentTitle}</h2>
            <p className="mt-5 text-base leading-relaxed text-[#465458] md:text-lg">{t.agentBody}</p>
            <Link href="/en/shopi-agent" className="mt-7 inline-flex items-center gap-2 border-b-2 border-primary pb-1 font-semibold text-[#172226] no-underline">{t.agentLink}<ArrowUpRight size={18} aria-hidden /></Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#dbe7e4] md:order-2">
            <Image src="/assets/blog/iphone-13.jpg" alt="Phone shown as a product for sale" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-22">
        <h2 className="font-display text-[1.9rem] font-semibold md:text-[2.6rem]">{t.questions}</h2>
        <div className="mt-6 border-t border-[#dce3e2]">
          {t.faq.map(({ q, a }) => <details key={q} className="group border-b border-[#dce3e2] py-5"><summary className="cursor-pointer pr-5 text-base font-semibold marker:text-primary md:text-lg">{q}</summary><p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#465458] md:text-base">{a}</p></details>)}
        </div>
      </section>

      <section className="bg-[#e7f4ed] px-5 py-16 text-center md:px-8 md:py-22">
        <h2 className="font-display text-[2rem] font-semibold leading-tight md:text-[3.25rem]">{t.closingTitle}</h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-[#354746] md:text-lg">{t.closingBody}</p>
        <Link href="/en/upload" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-7 py-3 text-base font-semibold text-white no-underline hover:opacity-90">{t.cta}<ArrowUpRight size={19} aria-hidden /></Link>
      </section>
    </main>
    <LandingFooter lang={lang} homeOnly />
  </div>;
}
