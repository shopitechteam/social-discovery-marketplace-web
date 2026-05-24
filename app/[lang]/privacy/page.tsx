import type { Metadata } from "next";
import Link from "next/link";
import { LegalNav } from "@/components/legal/LegalNav";

export const metadata: Metadata = {
  title: "Privacy Policy — Shopi",
  description: "How Shopi collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "23 May 2025";

type Props = { params: Promise<{ lang: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { lang } = await params;
  const base = `/${lang}`;
  return (
    <>
      <LegalNav lang={lang} />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 1.25rem 6rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgb(var(--brand-primary))", marginBottom: "0.75rem" }}>
            Legal
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "rgb(var(--color-text))", marginBottom: "0.75rem" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "rgb(var(--color-text-muted))", fontSize: "0.875rem" }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection>
          <p>
            Welcome to Shopi (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We operate the Shopi social commerce platform available at <strong>shopi.app</strong> and related mobile applications (collectively, the &quot;Service&quot;). This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and your rights regarding your data.
          </p>
          <p>
            By using Shopi you agree to the practices described in this policy. If you do not agree, please do not use our Service.
          </p>
        </LegalSection>

        <LegalSection title="1. Information We Collect">
          <h3>a. Information you provide directly</h3>
          <ul>
            <li><strong>Account data</strong> — name, username, email address, phone number, and password when you register.</li>
            <li><strong>Profile data</strong> — profile photo, bio, location (city/region), and links you choose to share.</li>
            <li><strong>Content</strong> — photos, videos, product listings, captions, comments, messages, and any other content you post.</li>
            <li><strong>Business data</strong> — M-Pesa or bank details, business name, and product catalogue if you register as a seller.</li>
            <li><strong>Communications</strong> — messages you send us via support, email, or in-app chat.</li>
          </ul>

          <h3>b. Information collected automatically</h3>
          <ul>
            <li><strong>Usage data</strong> — pages visited, videos watched, searches made, likes, shares, and time spent in the app.</li>
            <li><strong>Device data</strong> — device model, operating system version, unique device identifiers, and browser type.</li>
            <li><strong>Location data</strong> — approximate location derived from IP address; precise GPS location only if you grant permission.</li>
            <li><strong>Log data</strong> — IP address, access times, referring URLs, and error logs.</li>
            <li><strong>Cookies and similar trackers</strong> — see our <Link href={`${base}/cookies`}>Cookie Policy</Link>.</li>
          </ul>

          <h3>c. Information from third parties</h3>
          <ul>
            <li>Social login providers (Google, Apple) if you choose to sign in that way.</li>
            <li>Payment processors (e.g. Safaricom M-Pesa, Stripe) — we receive transaction confirmation but do not store full payment credentials.</li>
            <li>Analytics partners who help us understand aggregate usage trends.</li>
          </ul>
        </LegalSection>

        <LegalSection title="2. How We Use Your Information">
          <ul>
            <li><strong>Operate and improve the Service</strong> — deliver your feed, process posts and orders, and fix bugs.</li>
            <li><strong>Personalisation</strong> — show you relevant products, creators, and content based on your interests and location in Kenya.</li>
            <li><strong>Communications</strong> — send transaction confirmations, product updates, safety alerts, and (with your consent) marketing emails or push notifications.</li>
            <li><strong>Safety and security</strong> — detect fraud, spam, and abuse; enforce our Terms of Service.</li>
            <li><strong>Legal obligations</strong> — comply with Kenyan law, court orders, and regulatory requirements under the Kenya Data Protection Act 2019.</li>
            <li><strong>Analytics</strong> — understand how the Service is used in aggregate to make better product decisions.</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Legal Basis for Processing">
          <p>We process your data on the following bases under the Kenya Data Protection Act 2019:</p>
          <ul>
            <li><strong>Contract performance</strong> — processing necessary to provide the Service you signed up for.</li>
            <li><strong>Legitimate interests</strong> — improving our product, preventing fraud, and ensuring platform safety.</li>
            <li><strong>Consent</strong> — marketing communications and optional features (e.g. precise location). You may withdraw consent at any time.</li>
            <li><strong>Legal obligation</strong> — where we must process data to comply with applicable law.</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Sharing Your Information">
          <p>We do not sell your personal data. We share data only in these circumstances:</p>
          <ul>
            <li><strong>With sellers</strong> — when you initiate contact with a seller we share only the details needed to complete that interaction (e.g. your name and a means of contact if you choose to share).</li>
            <li><strong>Service providers</strong> — cloud hosting (AWS), analytics (Mixpanel), customer support tools, and payment processors acting as data processors under written agreements.</li>
            <li><strong>Business transfers</strong> — if Shopi merges with or is acquired by another company, your data may transfer as part of that transaction (we will notify you).</li>
            <li><strong>Legal requirements</strong> — when required by Kenyan law, a court order, or a legitimate government request.</li>
            <li><strong>Safety</strong> — to protect the rights, property, or safety of our users or the public.</li>
          </ul>
        </LegalSection>

        <LegalSection title="5. Data Retention">
          <p>
            We retain your data for as long as your account is active or as needed to provide the Service. You may delete your account at any time from Settings — we will delete or anonymise your personal data within 30 days, except where we are required by law to retain certain records.
          </p>
        </LegalSection>

        <LegalSection title="6. Your Rights">
          <p>Under the Kenya Data Protection Act 2019 you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate or incomplete data.</li>
            <li>Delete your data (&quot;right to be forgotten&quot;) where no legal obligation requires us to retain it.</li>
            <li>Object to or restrict certain types of processing.</li>
            <li>Data portability — receive your data in a machine-readable format.</li>
            <li>Withdraw consent at any time for consent-based processing.</li>
          </ul>
          <p>
            To exercise any of these rights, email us at <strong>privacy@shopi.app</strong>. We will respond within 30 days.
          </p>
        </LegalSection>

        <LegalSection title="7. Cookies">
          <p>
            We use cookies and similar technologies to operate the Service and understand usage. For full details see our <Link href={`${base}/cookies`}>Cookie Policy</Link>.
          </p>
        </LegalSection>

        <LegalSection title="8. International Transfers">
          <p>
            Our servers and some service providers are located outside Kenya (primarily in the EU and US). Where we transfer data internationally we ensure appropriate safeguards are in place, including standard contractual clauses approved by the Office of the Data Protection Commissioner of Kenya.
          </p>
        </LegalSection>

        <LegalSection title="9. Children's Privacy">
          <p>
            Shopi is not directed at children under 13. We do not knowingly collect personal data from anyone under 13. If you believe a child has provided us with their data, contact us at <strong>privacy@shopi.app</strong> and we will delete it promptly.
          </p>
        </LegalSection>

        <LegalSection title="10. Changes to This Policy">
          <p>
            We may update this policy from time to time. When we make material changes we will notify you via email or an in-app notice at least 14 days before the change takes effect. The &quot;Last updated&quot; date at the top of this page always reflects the current version.
          </p>
        </LegalSection>

        <LegalSection title="11. Contact Us">
          <p>
            Questions or concerns about this Privacy Policy? Contact our Data Protection Officer:
          </p>
          <address style={{ fontStyle: "normal", lineHeight: 1.8 }}>
            <strong>Shopi Limited</strong><br />
            Nairobi, Kenya<br />
            Email: <a href="mailto:privacy@shopi.app">privacy@shopi.app</a>
          </address>
        </LegalSection>

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgb(var(--color-border))", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Link href={`${base}/terms`} style={{ fontSize: "0.875rem", color: "rgb(var(--brand-primary))" }}>Terms of Service</Link>
          <Link href={`${base}/cookies`} style={{ fontSize: "0.875rem", color: "rgb(var(--brand-primary))" }}>Cookie Policy</Link>
        </div>
      </main>
    </>
  );
}

function LegalSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "2.25rem" }}>
      {title && (
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "rgb(var(--color-text))", marginBottom: "0.875rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgb(var(--color-border))" }}>
          {title}
        </h2>
      )}
      <div style={{ fontSize: "0.9rem", color: "rgb(var(--color-text-muted))", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {children}
      </div>
      <style>{`
        section h3 { font-size: 0.875rem; font-weight: 700; color: rgb(var(--color-text)); margin: 1rem 0 0.4rem; }
        section ul { padding-left: 1.25rem; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
        section a { color: rgb(var(--brand-primary)); text-decoration: underline; }
        address a { color: rgb(var(--brand-primary)); }
      `}</style>
    </section>
  );
}
