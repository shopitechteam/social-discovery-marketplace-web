const testimonials = [
  {
    quote: "I made my first sale 3 hours after posting my first video. Shopi just works for creators.",
    name: "Amara K.",
    role: "Fashion Creator, Nairobi",
    avatar: "AK",
    accent: "var(--brand-primary)",
  },
  {
    quote: "I discovered so many local brands I never knew existed. It feels like shopping with your friends.",
    name: "James O.",
    role: "Shopper, Mombasa",
    avatar: "JO",
    accent: "var(--brand-accent)",
  },
  {
    quote: "Our sales tripled in two months. The live drop feature is genuinely powerful for small sellers.",
    name: "Zara Beauty",
    role: "Seller, Kampala",
    avatar: "ZB",
    accent: "var(--brand-secondary)",
  },
];

export function TestimonialsSection() {
  return (
    <section
      style={{
        padding: "6rem 2rem",
        background: "rgb(var(--color-bg-subtle))",
        borderTop: "1px solid rgb(var(--color-border))",
        borderBottom: "1px solid rgb(var(--color-border))",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
            Real people, real results
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
              letterSpacing: "-0.025em",
              color: "rgb(var(--color-text))",
            }}
          >
            Loved by creators, sellers & shoppers
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {testimonials.map(({ quote, name, role, avatar, accent }) => (
            <div
              key={name}
              className="card"
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: "0.25rem" }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "rgb(var(--brand-secondary))", fontSize: "1rem" }}>★</span>
                ))}
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: "var(--text-md)",
                  color: "rgb(var(--color-text))",
                  lineHeight: "var(--leading-normal)",
                  flex: 1,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-full)",
                    background: `linear-gradient(135deg, rgb(${accent}), rgb(var(--brand-accent)))`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "var(--text-sm)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {avatar}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-base)",
                      fontWeight: 600,
                      color: "rgb(var(--color-text))",
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "rgb(var(--color-text-muted))",
                    }}
                  >
                    {role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
