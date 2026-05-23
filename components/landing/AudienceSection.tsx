"use client";

const audiences = [
  {
    id: "creators",
    emoji: "🎥",
    label: "For Creators",
    heading: "Turn your content into a shop",
    bullets: [
      "Monetise your following with shoppable videos",
      "Earn commissions every time a follower buys through your link",
      "Host live drops and exclusive product reveals",
      "Access analytics — views, clicks, and revenue in one dashboard",
    ],
    accent: "var(--brand-primary)",
  },
  {
    id: "sellers",
    emoji: "🏪",
    label: "For Sellers",
    heading: "Reach buyers who are ready to shop",
    bullets: [
      "List products and go live in minutes — no website needed",
      "Partner with creators to run video-first campaigns",
      "Track orders, inventory, and payouts inside the app",
      "Built-in audience of socially-engaged shoppers in Kenya & beyond",
    ],
    accent: "var(--brand-secondary)",
  },
];

export function AudienceSection() {
  return (
    <section
      id="creators"
      style={{
        padding: "6rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(var(--brand-secondary))",
            marginBottom: "0.75rem",
          }}
        >
          Built for everyone
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
          Whether you sell, create, or shop
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {audiences.map(({ id, emoji, label, heading, bullets, accent }) => (
          <div
            key={id}
            id={id}
            style={{
              padding: "2.5rem",
              borderRadius: "var(--radius-lg)",
              border: `1px solid rgb(${accent} / 0.25)`,
              background: `linear-gradient(135deg, rgb(${accent} / 0.05), transparent)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background accent */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: "-40px",
                right: "-40px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: `rgb(${accent} / 0.06)`,
                filter: "blur(30px)",
              }}
            />

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 0.875rem",
                borderRadius: "var(--radius-full)",
                background: `rgb(${accent} / 0.12)`,
                color: `rgb(${accent})`,
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                marginBottom: "1.5rem",
              }}
            >
              <span>{emoji}</span>
              {label}
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
                color: "rgb(var(--color-text))",
                marginBottom: "1.5rem",
                lineHeight: 1.25,
              }}
            >
              {heading}
            </h3>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {bullets.map((b) => (
                <li
                  key={b}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.625rem",
                    fontSize: "var(--text-base)",
                    color: "rgb(var(--color-text-muted))",
                    lineHeight: "var(--leading-snug)",
                  }}
                >
                  <span style={{ color: `rgb(${accent})`, flexShrink: 0, marginTop: 2 }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <a
              href="#download"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-full)",
                background: `rgb(${accent})`,
                color: "#fff",
                fontSize: "var(--text-base)",
                fontWeight: 600,
                textDecoration: "none",
                transition: "opacity 0.15s ease, transform 0.1s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.88";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Start for free →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
