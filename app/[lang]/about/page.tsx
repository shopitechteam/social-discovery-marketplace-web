import type { Metadata } from "next";
import Link from "next/link";
import { LegalNav } from "@/components/legal/LegalNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "About — Shopi",
  description: "The story behind Shopi, Kenya's social discovery marketplace.",
};

type Props = { params: Promise<{ lang: string }> };

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;

  return (
    <>
      <LegalNav lang={lang} />
      <main>
        {/* Hero */}
        <section style={{ background: "linear-gradient(135deg, rgb(var(--brand-primary) / 0.08) 0%, rgb(var(--brand-accent) / 0.06) 100%)", padding: "6rem 1.25rem 5rem", textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.35rem 1rem", borderRadius: 9999, border: "1px solid rgb(var(--brand-primary) / 0.3)", background: "rgb(var(--brand-primary) / 0.07)", color: "rgb(var(--brand-primary))", fontSize: "0.75rem", fontWeight: 600, marginBottom: "1.5rem", letterSpacing: "0.04em" }}>
              ✦ Our Story
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "rgb(var(--color-text))", lineHeight: 1.1, marginBottom: "1.25rem" }}>
              Commerce is social.<br />We built the proof.
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
              Shopi was born in Nairobi with a simple observation: Kenyans already discover and recommend products through WhatsApp groups, Instagram stories, and TikTok videos. We just built a platform that makes that natural behaviour feel at home.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", color: "rgb(var(--color-text))", marginBottom: "1rem" }}>
                Our mission
              </h2>
              <p style={{ fontSize: "1rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.8 }}>
                To make every Kenyan seller discoverable and every Kenyan buyer confident — without needing a big marketing budget or a complicated checkout flow.
              </p>
              <p style={{ fontSize: "1rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.8, marginTop: "0.875rem" }}>
                We believe the future of commerce in Africa is not built on catalogues and shopping carts — it is built on trust, community, and authentic content. Shopi is where that happens.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {[
                { stat: "2024", label: "Founded in Nairobi" },
                { stat: "Kenya", label: "Starting local, going pan-African" },
                { stat: "0%", label: "Commission on seller revenue" },
                { stat: "Direct", label: "Buyer–seller connections, no middlemen" },
              ].map(({ stat, label }) => (
                <div key={label} style={{ padding: "1.5rem", borderRadius: 16, border: "1px solid rgb(var(--color-border))", background: "rgb(var(--color-bg-elevated))" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "rgb(var(--brand-primary))", marginBottom: "0.375rem" }}>{stat}</div>
                  <div style={{ fontSize: "0.825rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section style={{ background: "rgb(var(--color-bg-subtle))", padding: "5rem 1.25rem" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", color: "rgb(var(--color-text))", marginBottom: "2.5rem", textAlign: "center" }}>
              What we stand for
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
              {[
                {
                  icon: "🇰🇪",
                  title: "Built for Kenya first",
                  body: "Every product decision starts with one question: does this work for a seller in Gikomba or a buyer scrolling in Kisumu? We optimise for Kenyan internet, Kenyan prices, and Kenyan payment methods.",
                },
                {
                  icon: "🤝",
                  title: "Trust over transactions",
                  body: "We do not process payments or take a cut of sales. We focus on building the trust layer — authentic video, real reviews, transparent seller profiles — so that commerce follows naturally.",
                },
                {
                  icon: "📱",
                  title: "Mobile-first, always",
                  body: "Over 95% of internet access in Kenya happens on a phone. We design every pixel for the thumb, every feature for low-bandwidth conditions, and every onboarding flow for first-time smartphone users.",
                },
                {
                  icon: "🌍",
                  title: "Open to everyone",
                  body: "You do not need a registered business, a website, or a bank account to start selling on Shopi. If you have a product and a phone camera, you are ready.",
                },
              ].map(({ icon, title, body }) => (
                <div key={title} style={{ display: "flex", gap: "1.25rem", padding: "1.5rem", borderRadius: 16, border: "1px solid rgb(var(--color-border))", background: "rgb(var(--color-bg-elevated))", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "2rem", flexShrink: 0, lineHeight: 1 }}>{icon}</span>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "rgb(var(--color-text))", marginBottom: "0.5rem" }}>{title}</h3>
                    <p style={{ fontSize: "0.875rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", color: "rgb(var(--color-text))", marginBottom: "0.75rem" }}>
            The team
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 560 }}>
            We are a small, focused team of builders, designers, and operators who have spent years working on consumer technology and commerce in East Africa.
          </p>
          <div style={{ padding: "2rem", borderRadius: 16, border: "1px solid rgb(var(--color-border))", background: "rgb(var(--color-bg-elevated))", textAlign: "center" }}>
            <p style={{ fontSize: "0.95rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7 }}>
              We are growing fast. If you want to join us, check out our{" "}
              <Link href={`/${lang}/careers`} style={{ color: "rgb(var(--brand-primary))", textDecoration: "underline" }}>
                open roles
              </Link>.
            </p>
          </div>
        </section>

        {/* Contact CTA */}
        <section style={{ background: "linear-gradient(135deg, rgb(var(--brand-primary) / 0.08), rgb(var(--brand-accent) / 0.06))", padding: "5rem 1.25rem", textAlign: "center" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", color: "rgb(var(--color-text))", marginBottom: "1rem" }}>
              Get in touch
            </h2>
            <p style={{ fontSize: "0.95rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              Partnership enquiries, press, or just want to say hello?
            </p>
            <a
              href="mailto:hello@shopi.app"
              style={{ display: "inline-block", padding: "0.75rem 2rem", borderRadius: 9999, background: "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))", color: "#fff", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", letterSpacing: "0.01em" }}
            >
              hello@shopi.app
            </a>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
