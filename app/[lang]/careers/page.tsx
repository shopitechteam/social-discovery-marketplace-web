import type { Metadata } from "next";
import { LegalNav } from "@/components/legal/LegalNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Careers — Shopi",
  description: "Join the team building Kenya's social commerce platform.",
};

type Props = { params: Promise<{ lang: string }> };

export default async function CareersPage({ params }: Props) {
  const { lang } = await params;

  return (
    <>
      <LegalNav lang={lang} />
      <main>
        {/* Hero */}
        <section
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--brand-primary) / 0.08) 0%, rgb(var(--brand-accent) / 0.06) 100%)",
            padding: "6rem 1.25rem 4rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.35rem 1rem",
                borderRadius: 9999,
                border: "1px solid rgb(var(--brand-primary) / 0.3)",
                background: "rgb(var(--brand-primary) / 0.07)",
                color: "rgb(var(--brand-primary))",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: "1.5rem",
                letterSpacing: "0.04em",
              }}
            >
              ✦ We&apos;re hiring · 1 open role
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "rgb(var(--color-text))",
                lineHeight: 1.1,
                marginBottom: "1.25rem",
              }}
            >
              Help us take care of every customer
            </h1>
            <p
              style={{
                fontSize: "1.05rem",
                color: "rgb(var(--color-text-muted))",
                lineHeight: 1.7,
              }}
            >
              We are a small remote team building Kenya&apos;s social commerce platform. Every person here matters — and right now, we need someone who will make every buyer and seller feel heard.
            </p>
          </div>
        </section>

        {/* Role card */}
        <section style={{ maxWidth: 780, margin: "0 auto", padding: "3rem 1.25rem 6rem" }}>
          <article
            style={{
              borderRadius: 20,
              border: "1px solid rgb(var(--color-border))",
              background: "rgb(var(--color-bg-elevated))",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "2rem 2rem 1.75rem",
                borderBottom: "1px solid rgb(var(--color-border))",
                background: "rgb(var(--color-bg-subtle))",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                {["Customer Service", "Full-time", "Remote — Kenya", "Salary: Negotiable"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 9999,
                      background: "rgb(var(--brand-primary) / 0.1)",
                      color: "rgb(var(--brand-primary))",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "rgb(var(--color-text))",
                  marginBottom: "0.625rem",
                }}
              >
                Customer Service Representative
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "rgb(var(--color-text-muted))",
                  lineHeight: 1.65,
                  fontStyle: "italic",
                }}
              >
                Be the friendly face (and fast fingers) behind every great Shopi experience.
              </p>
            </div>

            {/* Body */}
            <div
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
              }}
            >
              {/* About */}
              <RoleSection title="About the role">
                <p>
                  Shopi connects Kenyan buyers and sellers through short videos, live drops, and direct discovery. As our first Customer Service hire, you will be the primary point of contact for everyone on the platform — answering questions, resolving issues, and making sure every interaction leaves people feeling good about Shopi.
                </p>
                <p>
                  You will manage the live chat on our homepage, respond to queries across all our support channels, and work closely with the founding team to identify and flag recurring problems. This is a remote role — you work from wherever you are in Kenya, on your own schedule, as long as customers are covered.
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "0.875rem",
                  }}
                >
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
                      style={{
                        display: "flex",
                        gap: "1rem",
                        padding: "1.25rem",
                        borderRadius: 12,
                        border: "1px solid rgb(var(--color-border))",
                        background: "rgb(var(--color-bg-subtle))",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ fontSize: "1.5rem", flexShrink: 0, lineHeight: 1, marginTop: "0.1rem" }}>
                        {icon}
                      </span>
                      <div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "rgb(var(--color-text))",
                            marginBottom: "0.3rem",
                          }}
                        >
                          {title}
                        </div>
                        <div
                          style={{
                            fontSize: "0.825rem",
                            color: "rgb(var(--color-text-muted))",
                            lineHeight: 1.65,
                          }}
                        >
                          {body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RoleSection>

              {/* Apply CTA */}
              <div
                style={{
                  paddingTop: "1rem",
                  borderTop: "1px solid rgb(var(--color-border))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "rgb(var(--color-text))", marginBottom: "0.25rem" }}>
                    Ready to apply?
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "rgb(var(--color-text-muted))" }}>
                    Send your CV and a short note (2–3 sentences) about why this role is a good fit for you.
                  </p>
                </div>
                <a
                  href="mailto:careers@shopi.app?subject=Application: Customer Service Representative"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.75rem",
                    borderRadius: 9999,
                    background:
                      "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Apply now →
                </a>
              </div>
            </div>
          </article>

          {/* No other roles */}
          <div
            style={{
              marginTop: "2.5rem",
              padding: "2rem",
              borderRadius: 16,
              border: "1px solid rgb(var(--color-border))",
              background: "rgb(var(--color-bg-subtle))",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgb(var(--color-text-muted))",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              Don&apos;t see a role that fits? We are always open to hearing from great people.
            </p>
            <a
              href="mailto:careers@shopi.app?subject=Speculative Application"
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "rgb(var(--brand-primary))",
                textDecoration: "underline",
              }}
            >
              Send a speculative application
            </a>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}

function RoleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "rgb(var(--color-text))",
          marginBottom: "0.875rem",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontSize: "0.9rem",
          color: "rgb(var(--color-text-muted))",
          lineHeight: 1.8,
          display: "flex",
          flexDirection: "column",
          gap: "0.625rem",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: "flex",
            gap: "0.625rem",
            fontSize: "0.875rem",
            color: "rgb(var(--color-text-muted))",
            lineHeight: 1.65,
            alignItems: "flex-start",
          }}
        >
          <span style={{ color: "rgb(var(--brand-primary))", flexShrink: 0, marginTop: "0.15em" }}>→</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
