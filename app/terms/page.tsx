import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/LandingNav";

export const metadata: Metadata = {
  title: "Terms of Service — Shopi",
  description: "The rules and agreements that govern your use of the Shopi platform.",
};

const LAST_UPDATED = "23 May 2025";

export default function TermsPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-195 px-5 pt-20 pb-24">
        <div className="mb-10">
          <p className="mb-3 text-[0.75rem] font-semibold tracking-[0.08em] uppercase text-primary">
            Legal
          </p>
          <h1 className="mb-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-[-0.03em] text-foreground">
            Terms of Service
          </h1>
          <p className="text-[0.875rem] text-muted">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        <LegalSection>
          <p>
            These Terms of Service (&quot;Terms&quot;) are a legally binding agreement between you and <strong>Shopi Limited</strong> (&quot;Shopi&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), a company incorporated in Kenya. They govern your access to and use of the Shopi website, mobile applications, and all associated services (collectively, the &quot;Service&quot;).
          </p>
          <p>
            By creating an account or using any part of the Service you confirm that you have read, understood, and agree to be bound by these Terms and our <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use Shopi.
          </p>
        </LegalSection>

        <LegalSection title="1. Eligibility">
          <ul>
            <li>You must be at least 13 years old to use Shopi. Users between 13 and 17 must have parental or guardian consent.</li>
            <li>You must provide accurate, current, and complete information when registering.</li>
            <li>You may not use Shopi if you have previously been banned or if applicable law prohibits you from receiving our services.</li>
            <li>If you are using Shopi on behalf of a business, you represent that you have authority to bind that business to these Terms.</li>
          </ul>
        </LegalSection>

        <LegalSection title="2. Your Account">
          <ul>
            <li><strong>One account per person.</strong> You may not create multiple accounts or operate accounts on behalf of others without our written permission.</li>
            <li><strong>Security.</strong> You are responsible for keeping your login credentials confidential. Notify us immediately at <a href="mailto:support@shopi.app">support@shopi.app</a> if you suspect unauthorised access to your account.</li>
            <li><strong>Accuracy.</strong> You must keep your profile information accurate and up to date.</li>
            <li><strong>No transfer.</strong> Your account is personal to you and may not be transferred or sold to anyone else.</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. The Shopi Platform">
          <p>
            Shopi is a social discovery marketplace. It enables users to discover products through short-form videos, live drops, and curated feeds; connect directly with sellers; and facilitate commerce conversations. <strong>Shopi is not a party to any transaction between buyers and sellers.</strong> We do not hold funds, guarantee product quality, or fulfil orders unless explicitly stated.
          </p>
          <p>
            All sales and purchases facilitated through Shopi are agreements directly between buyers and sellers. Shopi provides the platform, not the goods or services.
          </p>
        </LegalSection>

        <LegalSection title="4. User Content">
          <h3>4.1 Your content, your responsibility</h3>
          <p>
            You own the content you post on Shopi (photos, videos, text, product listings, etc.). By posting content you grant Shopi a worldwide, royalty-free, non-exclusive licence to host, display, distribute, and promote that content as part of the Service.
          </p>
          <p>
            You are solely responsible for your content. You represent and warrant that:
          </p>
          <ul>
            <li>You own or have the rights to post the content.</li>
            <li>The content does not infringe any third-party intellectual property, privacy, or other rights.</li>
            <li>The content complies with these Terms and all applicable Kenyan laws.</li>
          </ul>

          <h3>4.2 Prohibited content</h3>
          <p>You may not post content that:</p>
          <ul>
            <li>Is false, misleading, or deceptive.</li>
            <li>Is hateful, discriminatory, or incites violence based on race, ethnicity, religion, gender, sexual orientation, disability, or nationality.</li>
            <li>Contains nudity or sexually explicit material.</li>
            <li>Harasses, bullies, or threatens any individual.</li>
            <li>Promotes counterfeit goods, illegal products, or unlicensed services.</li>
            <li>Violates any applicable Kenyan law or regulation.</li>
            <li>Contains malware, spam, or unsolicited commercial messages.</li>
          </ul>

          <h3>4.3 Content removal</h3>
          <p>
            We reserve the right (but not the obligation) to remove any content that violates these Terms, at our sole discretion and without prior notice. Repeated violations may result in account suspension or termination.
          </p>
        </LegalSection>

        <LegalSection title="5. Seller Obligations">
          <p>If you use Shopi to sell products or services you additionally agree to:</p>
          <ul>
            <li><strong>Accuracy.</strong> All product descriptions, prices, and availability information must be truthful and kept up to date.</li>
            <li><strong>Fulfilment.</strong> You are responsible for delivering products or services as described, in accordance with the Consumer Protection Act (Kenya).</li>
            <li><strong>Taxes.</strong> You are solely responsible for collecting and remitting all applicable taxes (VAT, withholding tax, etc.) on your sales.</li>
            <li><strong>Prohibited goods.</strong> You may not list counterfeit goods, stolen property, illegal firearms, controlled substances, or any item prohibited by Kenyan law.</li>
            <li><strong>Licensing.</strong> You must hold all permits, licences, and certifications required by law to sell your products or services.</li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Intellectual Property">
          <p>
            The Shopi name, logo, product name, design, and underlying technology are the intellectual property of Shopi Limited and are protected under Kenyan and international IP law. You may not copy, reproduce, distribute, or create derivative works from any Shopi-owned content without our written permission.
          </p>
          <p>
            If you believe content on Shopi infringes your intellectual property rights, please contact us at <a href="mailto:legal@shopi.app">legal@shopi.app</a> with details of your claim.
          </p>
        </LegalSection>

        <LegalSection title="7. Privacy">
          <p>
            Your use of the Service is also governed by our <Link href="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using Shopi you consent to our processing of your personal data as described there.
          </p>
        </LegalSection>

        <LegalSection title="8. Payments and Fees">
          <ul>
            <li>Shopi may charge fees for premium features or seller tools. Any fees will be clearly disclosed before you are charged.</li>
            <li>All prices on Shopi are displayed in Kenyan Shillings (KES) unless stated otherwise.</li>
            <li>Shopi is not responsible for transaction fees charged by payment processors (e.g. M-Pesa transaction costs).</li>
            <li>We reserve the right to change our fee structure at any time with 30 days&apos; written notice.</li>
          </ul>
        </LegalSection>

        <LegalSection title="9. Disclaimers">
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            Shopi does not warrant that the Service will be uninterrupted, error-free, or free of viruses. We do not endorse, verify, or guarantee any products or sellers on the platform.
          </p>
        </LegalSection>

        <LegalSection title="10. Limitation of Liability">
          <p>
            To the fullest extent permitted by Kenyan law, Shopi shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of (or inability to use) the Service, including loss of profits, data, or goodwill.
          </p>
          <p>
            Our total aggregate liability to you for any claim arising out of or relating to these Terms or the Service shall not exceed the greater of (a) the total fees you paid to Shopi in the 12 months preceding the claim or (b) KES 5,000.
          </p>
        </LegalSection>

        <LegalSection title="11. Indemnification">
          <p>
            You agree to defend, indemnify, and hold harmless Shopi Limited, its directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising out of: (a) your use of the Service; (b) your content; (c) your violation of these Terms; or (d) your violation of any third-party rights.
          </p>
        </LegalSection>

        <LegalSection title="12. Termination">
          <p>
            You may delete your account at any time from the app settings. We may suspend or terminate your account if you breach these Terms, with or without notice, depending on the severity of the breach. Upon termination, your licence to use the Service ceases immediately.
          </p>
          <p>
            Sections 4, 6, 9, 10, 11, and 13 survive termination.
          </p>
        </LegalSection>

        <LegalSection title="13. Governing Law and Disputes">
          <p>
            These Terms are governed by the laws of the Republic of Kenya. Any dispute arising out of or in connection with these Terms shall be referred first to good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to the exclusive jurisdiction of the courts of Nairobi, Kenya.
          </p>
        </LegalSection>

        <LegalSection title="14. Changes to These Terms">
          <p>
            We may update these Terms from time to time. When we make material changes we will notify you by email or in-app notice at least 14 days before the new Terms take effect. Continued use of the Service after the effective date constitutes acceptance of the revised Terms.
          </p>
        </LegalSection>

        <LegalSection title="15. Contact">
          <address className="not-italic leading-[1.8]">
            <strong>Shopi Limited</strong><br />
            Nairobi, Kenya<br />
            Email: <a href="mailto:legal@shopi.app">legal@shopi.app</a>
          </address>
        </LegalSection>

        <div className="mt-12 flex flex-wrap gap-6 border-t border-border pt-8">
          <Link href="/privacy" className="text-[0.875rem] text-primary">Privacy Policy</Link>
          <Link href="/cookies" className="text-[0.875rem] text-primary">Cookie Policy</Link>
        </div>
      </main>
    </>
  );
}

function LegalSection({ title, children }: { title?: string; children: React.ReactNode }) {
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
