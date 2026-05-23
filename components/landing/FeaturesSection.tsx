"use client";

const features = [
  {
    icon: "🎬",
    title: "Short Video Shopping",
    description:
      "Scroll through shoppable videos from creators you love. Tap a product, see the price, add to cart — never leave the feed.",
    color: "var(--brand-primary)",
  },
  {
    icon: "⚡",
    title: "Live Drop Events",
    description:
      "Sellers and creators host live shopping drops with exclusive deals. Watch, engage, and grab limited items in real time.",
    color: "var(--brand-secondary)",
  },
  {
    icon: "🧠",
    title: "Personalised Feed",
    description:
      "Your feed learns what you love — products, styles, and creators that match your taste, not just what's trending.",
    color: "var(--brand-accent)",
  },
  {
    icon: "🛍️",
    title: "Creator Storefronts",
    description:
      "Every creator has a shop. Browse curated picks, follow your favourite sellers, and buy directly from people you trust.",
    color: "var(--brand-primary)",
  },
  {
    icon: "🔍",
    title: "Visual Search & Explore",
    description:
      "Find products by style, category, or vibe. Search visually or browse curated collections across thousands of sellers.",
    color: "var(--brand-accent)",
  },
  {
    icon: "🤝",
    title: "Community & Reviews",
    description:
      "Real reviews from real buyers. See what your network bought and loved. Shopping is better when it's social.",
    color: "var(--brand-secondary)",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        padding: "6rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(var(--brand-primary))",
            marginBottom: "0.75rem",
          }}
        >
          Everything you need
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            color: "rgb(var(--color-text))",
            maxWidth: "560px",
            margin: "0 auto",
          }}
        >
          Shopping meets social, in one place
        </h2>
      </div>

      {/* Feature grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
        }}
      >
        {features.map(({ icon, title, description, color }) => (
          <div
            key={title}
            className="card"
            style={{
              padding: "2rem",
              transition: "box-shadow 0.2s ease, transform 0.2s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-md)",
                background: `rgb(${color} / 0.12)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "1.25rem",
              }}
            >
              {icon}
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
    </section>
  );
}
