const steps = [
  {
    number: "01",
    title: "Download Shopi",
    description:
      "Get the app on iOS or Android. Set up your profile in under a minute — no credit card required.",
  },
  {
    number: "02",
    title: "Follow Creators & Sellers",
    description:
      "Pick interests and follow creators whose style you love. Your feed is built around real people, not algorithms alone.",
  },
  {
    number: "03",
    title: "Discover & Shop",
    description:
      "Swipe through videos, explore live drops, and tap any product to buy it instantly — all without leaving the app.",
  },
  {
    number: "04",
    title: "Share & Earn",
    description:
      "Post your hauls, review products, or become a creator yourself. Build your audience and earn commissions.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "6rem 2rem",
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
            From scroll to checkout in seconds
          </h2>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
            position: "relative",
          }}
        >
          {/* Connector line */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "2rem",
              left: "12.5%",
              right: "12.5%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, rgb(var(--color-border-strong)), rgb(var(--color-border-strong)), transparent)",
            }}
          />

          {steps.map(({ number, title, description }) => (
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
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
