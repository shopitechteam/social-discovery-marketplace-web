import type { Metadata } from "next";
import Link from "next/link";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LegalNav } from "@/components/legal/LegalNav";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { siteConfig } from "@/config/site";
import { isValidLocale } from "@/i18n/config";
import { publicPageMetadata } from "@/lib/metadata";
import { faqSchema, jsonLd, marketplaceSchema } from "@/lib/structured-data";

type Props = { params: Promise<{ lang: string }> };

const faq = [
  {
    q: "Can I sell a car on Shopi in Kenya?",
    a: "Yes. You can post a car for sale on Shopi with photos or video, price, location, make, model, condition and other important details, then interested buyers message you directly.",
  },
  {
    q: "Does Shopi charge commission when I sell my car?",
    a: "No. Shopi does not take commission or process payment. You and the buyer negotiate and complete the sale directly.",
  },
  {
    q: "What should I include in a car listing?",
    a: "Include clear photos or video, make, model, year, mileage, price in Kenyan Shillings, location, ownership documents status, service history and any known issues.",
  },
  {
    q: "How do I avoid unsafe car deals?",
    a: "Meet in a public place, verify documents, avoid sending money before inspection, and complete ownership transfer through the proper official process.",
  },
];

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { lang } = await params;
  return publicPageMetadata({
    lang,
    path: "/sell-car-kenya",
    title: "Sell Your Car in Kenya",
    description:
      "Need to sell a car in Kenya? Create a free Shopi listing with photos, price and location, then chat directly with interested buyers.",
  });
}

export default async function SellCarKenyaPage({ params }: Props) {
  const { lang } = await params;
  const safeLang = isValidLocale(lang) ? lang : "en";
  const pageUrl = `${siteConfig.url}/${safeLang}/sell-car-kenya`;
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    name: "How to sell a car in Kenya on Shopi",
    description:
      "Post your car on Shopi for free, show price and location, then chat directly with buyers.",
    step: [
      {
        "@type": "HowToStep",
        name: "Prepare your car details",
        text: "Collect make, model, year, mileage, condition, location, price and ownership details.",
      },
      {
        "@type": "HowToStep",
        name: "Create your Shopi listing",
        text: "Upload clear photos or video and write a direct description of the car.",
      },
      {
        "@type": "HowToStep",
        name: "Chat with buyers",
        text: "Answer questions, share extra details and arrange inspection directly.",
      },
      {
        "@type": "HowToStep",
        name: "Complete the sale safely",
        text: "Meet safely, verify payment and documents, then complete transfer through the official process.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(marketplaceSchema, howToSchema, faqSchema(faq)),
        }}
      />
      <LegalNav lang={safeLang} />
      <BreadcrumbJsonLd
        lang={safeLang}
        trail={[{ name: "Sell a Car in Kenya", path: "/sell-car-kenya" }]}
      />

      <main>
        <section className="px-5 pt-24 pb-14">
          <div className="mx-auto max-w-190">
            <p className="mb-4 text-[0.8rem] font-bold tracking-widest uppercase text-primary">
              Sell your car in Kenya
            </p>
            <h1 className="max-w-165 font-display text-[clamp(2rem,5vw,3.6rem)] font-bold tracking-normal leading-[1.08] text-foreground">
              Need to sell a car? Post it on Shopi and talk to buyers directly.
            </h1>
            <p className="mt-5 max-w-145 text-[1.05rem] leading-[1.75] text-muted">
              Create a free car listing with photos or video, price, location
              and key details. Buyers looking for cars for sale in Kenya can
              discover your post and message you inside Shopi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${safeLang}/upload`}
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white no-underline"
              >
                Post your car free
              </Link>
              <Link
                href={`/${safeLang}/search?q=cars`}
                className="rounded-full border border-border px-6 py-3 text-sm font-bold text-foreground no-underline"
              >
                Browse cars
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-surface px-5 py-14">
          <div className="mx-auto grid max-w-190 gap-5 md:grid-cols-3">
            {[
              {
                title: "Show the real condition",
                body: "Use clear photos or video of the exterior, interior, engine bay, tyres and dashboard so serious buyers know what they are seeing.",
              },
              {
                title: "Add the details buyers search for",
                body: "Mention make, model, year, mileage, transmission, fuel type, price, location and whether the price is negotiable.",
              },
              {
                title: "Keep the deal direct",
                body: "Shopi connects you to buyers. You arrange inspection, negotiation, payment and transfer directly with the buyer.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-border bg-elevated p-6"
              >
                <h2 className="font-display text-[1.15rem] font-bold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-3 text-[0.95rem] leading-[1.7] text-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-190 px-5 py-16">
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-3 text-[0.8rem] font-bold tracking-widest uppercase text-primary">
                Car listing checklist
              </p>
              <h2 className="font-display text-[clamp(1.55rem,3vw,2.25rem)] font-bold tracking-normal leading-tight text-foreground">
                Give buyers enough information to decide whether to message.
              </h2>
            </div>
            <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
              {[
                "Make, model and year",
                "Mileage and condition",
                "Price in KES",
                "Town or estate location",
                "Clear photos or walkaround video",
                "Logbook and transfer readiness",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-border bg-elevated px-4 py-3 text-sm font-semibold text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-surface px-5 py-16">
          <div className="mx-auto max-w-170">
            <h2 className="mb-7 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-normal text-foreground">
              How to sell a car on Shopi
            </h2>
            <ol className="grid gap-4 p-0 md:grid-cols-4">
              {[
                "Clean the car and take clear photos or video.",
                "Post the listing with price, location and specs.",
                "Reply to interested buyers inside Shopi chat.",
                "Arrange inspection, payment and transfer directly.",
              ].map((step, index) => (
                <li
                  key={step}
                  className="list-none rounded-lg border border-border bg-elevated p-5"
                >
                  <span className="text-xs font-bold uppercase text-primary">
                    Step {index + 1}
                  </span>
                  <p className="mt-3 text-sm leading-[1.65] text-muted">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-170 px-5 py-16">
          <h2 className="mb-8 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-normal text-foreground">
            Questions about selling a car
          </h2>
          <div className="flex flex-col gap-3">
            {faq.map(({ q, a }) => (
              <details
                key={q}
                className="rounded-lg border border-border bg-elevated p-5"
              >
                <summary className="cursor-pointer text-base font-bold text-foreground">
                  {q}
                </summary>
                <p className="mt-3 text-[0.95rem] leading-[1.7] text-muted">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <LandingFooter lang={safeLang} />
    </>
  );
}
