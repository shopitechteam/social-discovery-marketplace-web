import type { Metadata } from "next";
import Link from "next/link";
import { LegalNav } from "@/components/legal/LegalNav";

export const metadata: Metadata = {
  title: "Contact Us — Shopi",
  description: "How to reach Shopi for support, business, legal, privacy, and abuse-report enquiries.",
};

const LAST_UPDATED = "14 July 2026";

type Props = { params: Promise<{ lang: string }> };

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  const base = `/${lang}`;
  return (
    <>
      <LegalNav lang={lang} />
      <main className="mx-auto max-w-215 px-5 pt-20 pb-24">
        <div className="mb-10">
          <p className="mb-3 text-[0.8rem] md:text-[0.875rem] font-semibold tracking-[0.08em] uppercase text-primary">
            Legal
          </p>
          <h1 className="mb-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-foreground">
            Contact Us
          </h1>
          <p className="text-[0.875rem] md:text-[1rem] text-muted">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection>
          <p>
            We&apos;re here to help. Depending on what you need, please reach out through the right channel below so we can get back to you faster.
          </p>
        </LegalSection>

        <LegalSection title="Customer Support">
          <p>Questions about using Shopi, your account, or how a feature works.</p>
          <address className="not-italic">Email: <a href="mailto:support@shopi.co.ke">support@shopi.co.ke</a></address>
        </LegalSection>

        <LegalSection title="Business Enquiries">
          <p>Partnerships, press, or general business questions.</p>
          <address className="not-italic">Email: <a href="mailto:hello@shopi.co.ke">hello@shopi.co.ke</a></address>
        </LegalSection>

        <LegalSection title="Legal Requests">
          <p>Questions about our <Link href={`${base}/terms`}>Terms of Service</Link>, legal notices, or law enforcement requests.</p>
          <address className="not-italic">Email: <a href="mailto:legal@shopi.co.ke">legal@shopi.co.ke</a></address>
        </LegalSection>

        <LegalSection title="Privacy Requests">
          <p>To ask what personal data we hold about you, request a correction, or request deletion under Kenya&apos;s Data Protection Act, 2019.</p>
          <address className="not-italic">Email: <a href="mailto:privacy@shopi.co.ke">privacy@shopi.co.ke</a></address>
        </LegalSection>

        <LegalSection title="Copyright Complaints">
          <p>If you believe content on Shopi infringes your copyright or intellectual property rights, tell us:</p>
          <ul>
            <li>The content you believe infringes your rights (a link or description)</li>
            <li>Proof or explanation of your ownership</li>
            <li>Your contact details</li>
          </ul>
          <address className="not-italic">Email: <a href="mailto:legal@shopi.co.ke">legal@shopi.co.ke</a></address>
        </LegalSection>

        <LegalSection title="Report Abuse">
          <p>
            For scams, harassment, prohibited listings, or safety concerns, please use the in-app block and report tools in messaging first — this gets reviewed fastest. For anything that needs additional attention:
          </p>
          <address className="not-italic">Email: <a href="mailto:support@shopi.co.ke">support@shopi.co.ke</a></address>
        </LegalSection>

        <p className="mt-8 text-[0.8rem] text-muted italic">
          Note: some email addresses above are placeholders and should be replaced with real, monitored inboxes before publishing this page. The hello@shopi.co.ke address is already in use in the site footer.
        </p>

        <div className="mt-12 flex flex-wrap gap-6 border-t border-border pt-8">
          <Link href={`${base}/safety-centre`} className="text-[0.875rem] text-primary">Safety Centre</Link>
          <Link href={`${base}/community-guidelines`} className="text-[0.875rem] text-primary">Community Guidelines</Link>
        </div>
      </main>
    </>
  );
}

function LegalSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      {title && (
        <h2 className="mb-3.5 border-b border-border pb-2 font-display text-[1.15rem] md:text-[1.4rem] font-bold text-foreground">
          {title}
        </h2>
      )}
      <div className="flex flex-col gap-3 text-[0.9rem] md:text-[1.0625rem] leading-[1.8] md:leading-[1.85] text-muted [&_a]:text-primary [&_a]:underline [&_address]:not-italic [&_ul]:m-0 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[0.4rem] [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
