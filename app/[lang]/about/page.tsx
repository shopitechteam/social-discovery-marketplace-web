import type { Metadata } from "next";
import Link from "next/link";
import { LegalNav } from "@/components/legal/LegalNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { siteConfig } from "@/config/site";
import {
  organizationSchema,
  breadcrumbSchema,
  jsonLd,
} from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const canonical = `${siteConfig.url}/${lang}/about`;
  const title = "About Shopi";
  const description =
    "Shopi is Kenya's social discovery marketplace, built in Nairobi to connect local buyers and sellers directly — no commission, no middleman.";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${title} — ${siteConfig.name}`,
      description,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: title }],
    },
  };
}

type Props = { params: Promise<{ lang: string }> };

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;

  const values = [
    {
      title: "Built for Kenya first",
      body: "Every product decision starts with one question: does this work for a seller in Gikomba or a buyer scrolling in Kisumu? We optimise for Kenyan internet, Kenyan prices, and Kenyan ways of doing business.",
    },
    {
      title: "Trust over transactions",
      body: "We do not process payments or take a cut of sales. We focus on the trust layer — real video, honest seller profiles, and direct messaging — so that deals follow naturally between people.",
    },
    {
      title: "Mobile-first, always",
      body: "Almost everyone in Kenya gets online through a phone. We design every screen for the thumb, every feature for low-bandwidth conditions, and every flow for first-time smartphone users.",
    },
    {
      title: "Open to everyone",
      body: "You do not need a registered business, a website, or a bank account to start selling on Shopi. If you have a product and a phone camera, you are ready.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            organizationSchema,
            breadcrumbSchema([
              { name: "Home", url: `${siteConfig.url}/${lang}` },
              { name: "About", url: `${siteConfig.url}/${lang}/about` },
            ]),
          ),
        }}
      />
      <LegalNav lang={lang} />
      <main>
        {/* Hero */}
        <section style={{ padding: "6rem 1.25rem 4rem", textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgb(var(--brand-primary))",
                marginBottom: "1rem",
              }}
            >
              Our story
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "rgb(var(--color-text))",
                lineHeight: 1.1,
                marginBottom: "1.25rem",
              }}
            >
              Commerce is social.
              <br />
              We built the proof.
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "rgb(var(--color-text-muted))",
                lineHeight: 1.7,
                maxWidth: 560,
                margin: "0 auto",
              }}
            >
              Shopi was born in Nairobi from a simple observation: Kenyans already
              discover and recommend products through WhatsApp groups, Instagram
              stories, and TikTok videos. We just built a marketplace that makes
              that natural behaviour feel at home.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "rgb(var(--color-text))",
              marginBottom: "1rem",
            }}
          >
            Our mission
          </h2>
          <p style={{ fontSize: "1rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.8 }}>
            To make every Kenyan seller discoverable and every Kenyan buyer
            confident — without needing a big marketing budget or a complicated
            checkout flow.
          </p>
          <p style={{ fontSize: "1rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.8, marginTop: "0.875rem" }}>
            We believe the future of commerce in Africa is not built on catalogues
            and shopping carts — it is built on trust, community, and authentic
            content. Shopi is where that happens. We do not take a commission or
            sit between you and the person you are dealing with.
          </p>
        </section>

        {/* Values */}
        <section style={{ background: "rgb(var(--color-bg-subtle))", padding: "4rem 1.25rem" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "rgb(var(--color-text))",
                marginBottom: "2.5rem",
                textAlign: "center",
              }}
            >
              What we stand for
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
              {values.map(({ title, body }) => (
                <div
                  key={title}
                  style={{
                    display: "flex",
                    gap: "1.25rem",
                    padding: "1.5rem",
                    borderRadius: 16,
                    border: "1px solid rgb(var(--color-border))",
                    background: "rgb(var(--color-bg-elevated))",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "rgb(var(--brand-primary))",
                      flexShrink: 0,
                      marginTop: 9,
                    }}
                  />
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "rgb(var(--color-text))",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7 }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ maxWidth: 780, margin: "0 auto", padding: "4rem 1.25rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "rgb(var(--color-text))",
              marginBottom: "0.75rem",
            }}
          >
            The team
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7, marginBottom: "2rem", maxWidth: 560 }}>
            We are a small, focused team building consumer technology and commerce
            for East Africa.
          </p>
          <div
            style={{
              padding: "2rem",
              borderRadius: 16,
              border: "1px solid rgb(var(--color-border))",
              background: "rgb(var(--color-bg-elevated))",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.95rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7 }}>
              Want to build with us? Check out our{" "}
              <Link href={`/${lang}/careers`} style={{ color: "rgb(var(--brand-primary))", textDecoration: "underline" }}>
                open roles
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Contact CTA */}
        <section style={{ background: "rgb(var(--color-bg-subtle))", padding: "4rem 1.25rem", textAlign: "center" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "rgb(var(--color-text))",
                marginBottom: "1rem",
              }}
            >
              Get in touch
            </h2>
            <p style={{ fontSize: "0.95rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              Partnership enquiries, press, or just want to say hello?
            </p>
            <a
              href="mailto:hello@shopi.co.ke"
              style={{
                display: "inline-block",
                padding: "0.75rem 2rem",
                borderRadius: 9999,
                background: "rgb(var(--brand-primary))",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              hello@shopi.co.ke
            </a>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
