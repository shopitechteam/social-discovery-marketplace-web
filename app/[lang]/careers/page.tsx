import { LegalNav } from "@/components/legal/LegalNav";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { publicPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  return publicPageMetadata({
    lang,
    path: "/careers",
    title: "Careers",
    description: "Join the team building Kenya's social commerce platform.",
  });
}

type Props = { params: Promise<{ lang: string }> };

export default async function CareersPage({ params }: Props) {
  const { lang } = await params;

  return (
    <>
      <LegalNav lang={lang} />
      <BreadcrumbJsonLd
        lang={lang}
        trail={[{ name: "Careers", path: "/careers" }]}
      />
      <main>
        {/* Hero */}
        <section className="bg-[linear-gradient(135deg,rgb(var(--brand-primary)/0.08)_0%,rgb(var(--brand-accent)/0.06)_100%)] px-5 pt-24 pb-16 text-center">
          <div className="mx-auto max-w-160">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--brand-primary)/0.3)] bg-[rgb(var(--brand-primary)/0.07)] px-4 py-[0.35rem] text-[0.75rem] font-semibold tracking-[0.04em] text-primary">
              ✦ We&apos;re hiring · 1 open role
            </div>
            <h1 className="mb-5 font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold tracking-[-0.03em] leading-[1.1] text-foreground">
              Help us take care of every customer
            </h1>
            <p className="text-[1.05rem] leading-[1.7] text-muted">
              We are a small remote team building Kenya&apos;s social commerce
              platform. Every person here matters — and right now, we need
              someone who will make every buyer and seller feel heard.
            </p>
          </div>
        </section>

        {/* Role card */}
        <section className="mx-auto max-w-195 px-5 pt-12 pb-24">
          <article className="overflow-hidden rounded-lg border border-border bg-elevated">
            {/* Header */}
            <div className="border-b border-border bg-surface p-8 pb-7">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  "Customer Service",
                  "Full-time",
                  "Remote — Kenya",
                  "Salary: Negotiable",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[rgb(var(--brand-primary)/0.1)] px-[10px] py-[3px] text-[0.7rem] font-bold tracking-[0.04em] uppercase text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mb-2.5 font-display text-[clamp(1.4rem,3vw,2rem)] font-extrabold tracking-[-0.02em] text-foreground">
                Customer Service Representative
              </h2>
              <p className="text-[0.95rem] leading-[1.65] text-muted italic">
                Be the friendly face (and fast fingers) behind every great Shopi
                experience.
              </p>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-8 p-8">
              {/* About */}
              <RoleSection title="About the role">
                <p>
                  Shopi connects Kenyan buyers and sellers through short videos,
                  direct messaging, and local discovery. As our first Customer
                  Service hire, you will be the primary point of contact for
                  everyone on the platform — answering questions, resolving
                  issues, and making sure every interaction leaves people
                  feeling good about Shopi.
                </p>
                <p>
                  You will manage the live chat on our homepage, respond to
                  queries across all our support channels, and work closely with
                  the founding team to identify and flag recurring problems.
                  This is a remote role — you work from wherever you are in
                  Kenya, on your own schedule, as long as customers are covered.
                </p>
              </RoleSection>

              {/* Responsibilities */}
              <RoleSection title="What you'll do">
                <BulletList
                  items={[
                    "Monitor and respond to the live chat on the Shopi website in real time — this is your primary responsibility.",
                    "Answer buyer and seller queries sent via email, WhatsApp, and any other support channels.",
                    "Help sellers troubleshoot posting, profile, and listing issues.",
                    "Guide buyers through finding products and connecting with sellers.",
                    "Log recurring issues and escalate anything that needs a product or technical fix.",
                    "Keep response times fast and customer satisfaction high.",
                    "Contribute to building our FAQ and help documentation over time.",
                  ]}
                />
              </RoleSection>

              {/* Requirements */}
              <RoleSection title="What we're looking for">
                <BulletList
                  items={[
                    "Excellent written communication in English and Swahili — clear, warm, and professional.",
                    "Patient and empathetic — you genuinely enjoy helping people.",
                    "Reliable internet connection and a smartphone or laptop to work from.",
                    "Able to stay organised and manage multiple conversations at once.",
                    "Comfortable with WhatsApp, social media, and basic tech tools.",
                    "Previous customer service or support experience is a plus, but not required — attitude matters more.",
                  ]}
                />
              </RoleSection>

              {/* Benefits */}
              <RoleSection title="What you get">
                <div className="grid grid-cols-1 gap-3.5">
                  {[
                    {
                      icon: "🚀",
                      title: "Join a high-growth startup early",
                      body: "Get in at the ground floor of one of Kenya's most exciting new platforms. Your work has real, immediate impact.",
                    },
                    {
                      icon: "📚",
                      title: "Learn fast",
                      body: "Working directly with a small founding team means you'll gain experience across product, ops, and business — not just support.",
                    },
                    {
                      icon: "🏠",
                      title: "Fully remote",
                      body: "Work from home, a café, or anywhere in Kenya. We care about results, not where you sit.",
                    },
                    {
                      icon: "💬",
                      title: "Your voice shapes the product",
                      body: "The patterns you spot in customer feedback directly influence what we build next. You are not just support — you are research.",
                    },
                    {
                      icon: "💰",
                      title: "Salary negotiable",
                      body: "We will have an honest conversation about compensation based on your experience and what you bring to the team.",
                    },
                  ].map(({ icon, title, body }) => (
                    <div
                      key={title}
                      className="flex items-start gap-4 rounded-md border border-border bg-surface p-5"
                    >
                      <span className="mt-[0.1rem] shrink-0 text-[1.5rem] leading-none">
                        {icon}
                      </span>
                      <div>
                        <div className="mb-[0.3rem] text-[0.875rem] font-bold text-foreground">
                          {title}
                        </div>
                        <div className="text-[0.825rem] leading-[1.65] text-muted">
                          {body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RoleSection>

              {/* Apply CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                <div>
                  <p className="mb-1 text-[0.875rem] font-semibold text-foreground">
                    Ready to apply?
                  </p>
                  <p className="text-[0.8rem] text-muted">
                    Send your CV and a short note (2–3 sentences) about why this
                    role is a good fit for you.
                  </p>
                </div>
                <a
                  href="mailto:careers@shopi.app?subject=Application: Customer Service Representative"
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,rgb(var(--brand-primary)),rgb(var(--brand-accent)))] px-7 py-3 text-[0.875rem] font-bold whitespace-nowrap text-white no-underline"
                >
                  Apply now →
                </a>
              </div>
            </div>
          </article>

          {/* No other roles */}
          <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="mb-4 text-[0.9rem] leading-[1.7] text-muted">
              Don&apos;t see a role that fits? We are always open to hearing
              from great people.
            </p>
            <a
              href="mailto:careers@shopi.app?subject=Speculative Application"
              className="text-[0.875rem] font-semibold text-primary underline"
            >
              Send a speculative application
            </a>
          </div>
        </section>
      </main>
      <div className="mt-6 lg:mt-12" />
      <LandingFooter lang={lang} />
    </>
  );
}

function RoleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3.5 text-[0.75rem] font-bold tracking-[0.07em] uppercase text-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-2.5 text-[0.9rem] leading-[1.8] text-muted">
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-[0.875rem] leading-[1.65] text-muted"
        >
          <span className="mt-[0.15em] shrink-0 text-primary">→</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
