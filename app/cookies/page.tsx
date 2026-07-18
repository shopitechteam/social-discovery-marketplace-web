import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";

export const metadata: Metadata = {
  title: "Cookie Policy — Shopi",
  description: "How Shopi uses cookies and similar tracking technologies.",
  // Same document is served under /[lang]/cookies; canonicalize to the EN version
  // so engines index one copy.
  alternates: { canonical: "/en/cookies" },
};

const LAST_UPDATED = "23 May 2025";

const cookies = [
  {
    name: "shopi_session",
    type: "Strictly necessary",
    purpose:
      "Maintains your login session so you stay signed in as you navigate the app.",
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
    purpose:
      "Google Analytics — measures how users interact with the Service in aggregate.",
    expiry: "2 years / 24 hrs",
  },
  {
    name: "mp_*",
    type: "Analytics",
    purpose:
      "Mixpanel — tracks in-app events to help us understand feature usage.",
    expiry: "1 year",
  },
];

export default function CookiesPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-195 px-5 pt-20 pb-24">
        <div className="mb-10">
          <p className="mb-3 text-[0.75rem] font-semibold tracking-[0.08em] uppercase text-primary">
            Legal
          </p>
          <h1 className="mb-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-foreground">
            Cookie Policy
          </h1>
          <p className="text-[0.875rem] text-muted">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection>
          <p>
            This Cookie Policy explains what cookies and similar technologies
            Shopi uses, why we use them, and the choices available to you. It
            should be read alongside our{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </LegalSection>

        <LegalSection title="1. What Are Cookies?">
          <p>
            Cookies are small text files placed on your device by a website or
            app you visit. They are widely used to make websites work
            efficiently and to provide information to website owners.
          </p>
          <p>
            We also use similar technologies such as{" "}
            <strong>local storage</strong>, <strong>session storage</strong>,
            and <strong>pixels</strong> (tiny invisible images) that serve
            similar purposes to cookies. When we say &quot;cookies&quot; in this
            policy we mean all of these technologies.
          </p>
        </LegalSection>

        <LegalSection title="2. Types of Cookies We Use">
          <h3>Strictly Necessary</h3>
          <p>
            These cookies are essential for the Service to function. They enable
            core features like authentication and security. You cannot opt out
            of these without stopping use of the Service.
          </p>

          <h3>Functional</h3>
          <p>
            These cookies remember choices you make (like your preferred theme)
            to personalise your experience. Disabling them may reduce
            convenience but will not prevent you from using the Service.
          </p>

          <h3>Analytics</h3>
          <p>
            These cookies help us understand how users interact with Shopi —
            which features are popular, where users drop off, and how to improve
            the product. Data is aggregated and cannot identify you
            individually. You may opt out (see Section 4).
          </p>

          <h3>Marketing / Advertising</h3>
          <p>
            We currently do not serve third-party advertising on Shopi and do
            not place advertising cookies. If this changes we will update this
            policy and seek your consent where required.
          </p>
        </LegalSection>

        <LegalSection title="3. Cookie Details">
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-[0.825rem]">
              <thead>
                <tr className="border-b-2 border-border text-left">
                  <Th>Cookie name</Th>
                  <Th>Type</Th>
                  <Th>Purpose</Th>
                  <Th>Expiry</Th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c, i) => (
                  <tr
                    key={c.name}
                    className={`border-b border-border ${i % 2 === 0 ? "bg-transparent" : "bg-surface"}`}
                  >
                    <Td>
                      <code className="font-mono text-[0.8rem]">{c.name}</code>
                    </Td>
                    <Td>{c.type}</Td>
                    <Td>{c.purpose}</Td>
                    <Td className="whitespace-nowrap">{c.expiry}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegalSection>

        <LegalSection title="4. Your Choices">
          <h3>Browser settings</h3>
          <p>
            Most browsers allow you to view, manage, delete, and block cookies
            through their settings. Blocking all cookies will affect the
            functionality of many websites, including Shopi. For guidance on
            managing cookies in common browsers:
          </p>
          <ul>
            <li>
              <strong>Chrome:</strong> Settings &rarr; Privacy and security
              &rarr; Cookies and other site data
            </li>
            <li>
              <strong>Safari:</strong> Settings &rarr; Safari &rarr; Privacy
              &amp; Security
            </li>
            <li>
              <strong>Firefox:</strong> Settings &rarr; Privacy &amp; Security
            </li>
          </ul>

          <h3>Opting out of analytics</h3>
          <p>
            You can opt out of Google Analytics across all sites by installing
            the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
          <p>
            To opt out of Mixpanel tracking, email us at{" "}
            <a href="mailto:privacy@shopi.app">privacy@shopi.app</a> with the
            subject &quot;Opt out of analytics&quot;.
          </p>

          <h3>In-app settings</h3>
          <p>
            We are building an in-app cookie preferences panel. Until it is
            available, the browser settings and opt-out links above are the
            primary controls.
          </p>
        </LegalSection>

        <LegalSection title="5. Third-Party Cookies">
          <p>Some cookies on Shopi are set by third-party services we use:</p>
          <ul>
            <li>
              <strong>Google Analytics</strong> —{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>Mixpanel</strong> —{" "}
              <a
                href="https://mixpanel.com/legal/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mixpanel Privacy Policy
              </a>
            </li>
          </ul>
          <p>
            These third parties have their own privacy and cookie policies,
            which we encourage you to review. We do not control how these third
            parties use the data they collect.
          </p>
        </LegalSection>

        <LegalSection title="6. Changes to This Policy">
          <p>
            We may update this Cookie Policy when we add or remove cookies or
            change how we use them. The &quot;Last updated&quot; date at the top
            of this page reflects the most recent version. Material changes will
            be notified via the Service.
          </p>
        </LegalSection>

        <LegalSection title="7. Contact">
          <p>Questions about our use of cookies?</p>
          <address className="not-italic leading-[1.8]">
            <strong>Shopi Limited</strong>
            <br />
            Nairobi, Kenya
            <br />
            Email: <a href="mailto:privacy@shopi.app">privacy@shopi.app</a>
          </address>
        </LegalSection>

        <div className="mt-12 flex flex-wrap gap-6 border-t border-border pt-8">
          <Link href="/privacy" className="text-[0.875rem] text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-[0.875rem] text-primary">
            Terms of Service
          </Link>
        </div>
      </main>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-[0.6rem] font-bold whitespace-nowrap text-foreground">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-[0.6rem] align-top text-muted ${className}`}>
      {children}
    </td>
  );
}

function LegalSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-9">
      {title && (
        <h2 className="mb-3.5 border-b border-border pb-2 font-display text-[1.15rem] font-bold text-foreground">
          {title}
        </h2>
      )}
      <div className="flex flex-col gap-3 text-[0.9rem] leading-[1.8] text-muted [&_a]:text-primary [&_a]:underline [&_h3]:mt-4 [&_h3]:mb-[0.4rem] [&_h3]:text-[0.875rem] [&_h3]:font-bold [&_h3]:text-foreground [&_ul]:m-0 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[0.4rem] [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
