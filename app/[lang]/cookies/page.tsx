import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";

export const metadata: Metadata = {
  title: "Cookie Policy — Shopi",
  description: "How Shopi uses cookies and similar tracking technologies.",
};

const LAST_UPDATED = "23 May 2025";

const cookies = [
  {
    name: "shopi_session",
    type: "Strictly necessary",
    purpose: "Maintains your login session so you stay signed in as you navigate the app.",
    expiry: "Session",
  },
  {
    name: "shopi_csrf",
    type: "Strictly necessary",
    purpose: "Protects against cross-site request forgery attacks.",
    expiry: "Session",
  },
  {
    name: "shopi_prefs",
    type: "Functional",
    purpose: "Remembers your preferences such as language and theme.",
    expiry: "1 year",
  },
  {
    name: "_ga, _gid",
    type: "Analytics",
    purpose: "Google Analytics — measures how users interact with the Service in aggregate.",
    expiry: "2 years / 24 hrs",
  },
  {
    name: "mp_*",
    type: "Analytics",
    purpose: "Mixpanel — tracks in-app events to help us understand feature usage.",
    expiry: "1 year",
  },
];

type Props = { params: Promise<{ lang: string }> };

export default async function CookiesPage({ params }: Props) {
  const { lang } = await params;
  const base = `/${lang}`;
  return (
    <>
      <LandingNav />
      <main style={{ maxWidth: 780, margin: "0 auto", padding: "5rem 1.25rem 6rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgb(var(--brand-primary))", marginBottom: "0.75rem" }}>
            Legal
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "rgb(var(--color-text))", marginBottom: "0.75rem" }}>
            Cookie Policy
          </h1>
          <p style={{ color: "rgb(var(--color-text-muted))", fontSize: "0.875rem" }}>
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection>
          <p>
            This Cookie Policy explains what cookies and similar technologies Shopi uses, why we use them, and the choices available to you. It should be read alongside our <Link href={`${base}/privacy`}>Privacy Policy</Link>.
          </p>
        </LegalSection>

        <LegalSection title="1. What Are Cookies?">
          <p>
            Cookies are small text files placed on your device by a website or app you visit. They are widely used to make websites work efficiently and to provide information to website owners.
          </p>
          <p>
            We also use similar technologies such as <strong>local storage</strong>, <strong>session storage</strong>, and <strong>pixels</strong> (tiny invisible images) that serve similar purposes to cookies. When we say &quot;cookies&quot; in this policy we mean all of these technologies.
          </p>
        </LegalSection>

        <LegalSection title="2. Types of Cookies We Use">
          <h3>Strictly Necessary</h3>
          <p>
            These cookies are essential for the Service to function. They enable core features like authentication and security. You cannot opt out of these without stopping use of the Service.
          </p>

          <h3>Functional</h3>
          <p>
            These cookies remember choices you make (like your preferred theme) to personalise your experience. Disabling them may reduce convenience but will not prevent you from using the Service.
          </p>

          <h3>Analytics</h3>
          <p>
            These cookies help us understand how users interact with Shopi — which features are popular, where users drop off, and how to improve the product. Data is aggregated and cannot identify you individually. You may opt out (see Section 4).
          </p>

          <h3>Marketing / Advertising</h3>
          <p>
            We currently do not serve third-party advertising on Shopi and do not place advertising cookies. If this changes we will update this policy and seek your consent where required.
          </p>
        </LegalSection>

        <LegalSection title="3. Cookie Details">
          <div style={{ overflowX: "auto", marginTop: "0.5rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid rgb(var(--color-border))", textAlign: "left" }}>
                  <Th>Cookie name</Th>
                  <Th>Type</Th>
                  <Th>Purpose</Th>
                  <Th>Expiry</Th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c, i) => (
                  <tr key={c.name} style={{ borderBottom: "1px solid rgb(var(--color-border))", background: i % 2 === 0 ? "transparent" : "rgb(var(--color-bg-subtle))" }}>
                    <Td><code style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{c.name}</code></Td>
                    <Td>{c.type}</Td>
                    <Td>{c.purpose}</Td>
                    <Td style={{ whiteSpace: "nowrap" }}>{c.expiry}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegalSection>

        <LegalSection title="4. Your Choices">
          <h3>Browser settings</h3>
          <p>
            Most browsers allow you to view, manage, delete, and block cookies through their settings. Blocking all cookies will affect the functionality of many websites, including Shopi. For guidance on managing cookies in common browsers:
          </p>
          <ul>
            <li><strong>Chrome:</strong> Settings &rarr; Privacy and security &rarr; Cookies and other site data</li>
            <li><strong>Safari:</strong> Settings &rarr; Safari &rarr; Privacy &amp; Security</li>
            <li><strong>Firefox:</strong> Settings &rarr; Privacy &amp; Security</li>
          </ul>

          <h3>Opting out of analytics</h3>
          <p>
            You can opt out of Google Analytics across all sites by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.
          </p>
          <p>
            To opt out of Mixpanel tracking, email us at <a href="mailto:privacy@shopi.app">privacy@shopi.app</a> with the subject &quot;Opt out of analytics&quot;.
          </p>

          <h3>In-app settings</h3>
          <p>
            We are building an in-app cookie preferences panel. Until it is available, the browser settings and opt-out links above are the primary controls.
          </p>
        </LegalSection>

        <LegalSection title="5. Third-Party Cookies">
          <p>
            Some cookies on Shopi are set by third-party services we use:
          </p>
          <ul>
            <li><strong>Google Analytics</strong> — <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
            <li><strong>Mixpanel</strong> — <a href="https://mixpanel.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">Mixpanel Privacy Policy</a></li>
          </ul>
          <p>
            These third parties have their own privacy and cookie policies, which we encourage you to review. We do not control how these third parties use the data they collect.
          </p>
        </LegalSection>

        <LegalSection title="6. Changes to This Policy">
          <p>
            We may update this Cookie Policy when we add or remove cookies or change how we use them. The &quot;Last updated&quot; date at the top of this page reflects the most recent version. Material changes will be notified via the Service.
          </p>
        </LegalSection>

        <LegalSection title="7. Contact">
          <p>Questions about our use of cookies?</p>
          <address style={{ fontStyle: "normal", lineHeight: 1.8 }}>
            <strong>Shopi Limited</strong><br />
            Nairobi, Kenya<br />
            Email: <a href="mailto:privacy@shopi.app">privacy@shopi.app</a>
          </address>
        </LegalSection>

        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgb(var(--color-border))", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Link href={`${base}/privacy`} style={{ fontSize: "0.875rem", color: "rgb(var(--brand-primary))" }}>Privacy Policy</Link>
          <Link href={`${base}/terms`} style={{ fontSize: "0.875rem", color: "rgb(var(--brand-primary))" }}>Terms of Service</Link>
        </div>
      </main>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 700, color: "rgb(var(--color-text))", whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: "0.6rem 0.75rem", verticalAlign: "top", color: "rgb(var(--color-text-muted))", ...style }}>
      {children}
    </td>
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
