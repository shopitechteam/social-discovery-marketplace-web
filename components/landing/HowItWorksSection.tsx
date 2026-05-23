import React from "react";

const EL = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "inherit", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" }}
  >
    {children}
  </a>
);

const steps: { number: string; title: string; node: React.ReactNode }[] = [
  {
    number: "01",
    title: "Sign up in 30 seconds",
    node: "No credit card. No long forms. Pick your interests — phones, fashion, food, whatever — and your local feed is ready.",
  },
  {
    number: "02",
    title: "Scroll your local feed",
    node: (
      <>
        Watch videos and photos posted by real sellers near you. Think{" "}
        <EL href="https://www.tiktok.com">TikTok</EL>, but every post is something actually for sale — with a seller you can message directly.
      </>
    ),
  },
  {
    number: "03",
    title: "Like it? Message the seller.",
    node: "Tap to open a direct chat with any seller. Negotiate, ask questions, arrange pickup or delivery — completely on your terms.",
  },
  {
    number: "04",
    title: "Sell. Post. Build your audience.",
    node: "Sellers post content, grow followers, and build trust over time. The more you post, the more people discover what you're selling.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "4rem 1.25rem",
        background: "rgb(var(--color-bg-subtle))",
        borderTop: "1px solid rgb(var(--color-border))",
        borderBottom: "1px solid rgb(var(--color-border))",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <p
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgb(var(--brand-accent))",
              marginBottom: "0.75rem",
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              color: "rgb(var(--color-text))",
            }}
          >
            Discover locally. Connect directly. No checkout needed.
          </h2>
        </div>

        {/* Steps */}
        <div className="hiw-steps">
          {steps.map(({ number, title, node }) => (
            <div key={number} style={{ textAlign: "center", padding: "0 0.5rem" }}>
              {/* Step circle */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--radius-full)",
                  background:
                    "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "var(--text-base)",
                  color: "#fff",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 0 0 6px rgb(var(--color-bg-subtle))",
                }}
              >
                {number}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "var(--text-lg)",
                  color: "rgb(var(--color-text))",
                  marginBottom: "0.625rem",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-base)",
                  color: "rgb(var(--color-text-muted))",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {node}
              </p>
            </div>
          ))}
        </div>

        <style>{`
          .hiw-steps {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
            position: relative;
          }
          @media (min-width: 640px) {
            .hiw-steps { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1024px) {
            .hiw-steps { grid-template-columns: repeat(4, 1fr); }
          }
        `}</style>
      </div>
    </section>
  );
}
