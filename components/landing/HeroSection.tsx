import { siteConfig } from "@/config/site";

export function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "7rem 2rem 4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow blobs */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "600px",
            background:
              "radial-gradient(ellipse at center, rgb(var(--brand-primary) / 0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgb(var(--brand-accent) / 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgb(var(--brand-secondary) / 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.375rem 1rem",
          borderRadius: "var(--radius-full)",
          border: "1px solid rgb(var(--brand-primary) / 0.3)",
          background: "rgb(var(--brand-primary) / 0.08)",
          color: "rgb(var(--brand-primary))",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          marginBottom: "2rem",
          letterSpacing: "0.02em",
        }}
      >
        <span>✦</span>
        Social Commerce, Reimagined
      </div>

      {/* Headline */}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          color: "rgb(var(--color-text))",
          maxWidth: "860px",
          marginBottom: "1.5rem",
        }}
      >
        Discover Products
        <br />
        <span
          style={{
            background:
              "linear-gradient(90deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Through People You Trust
        </span>
      </h1>

      {/* Subheadline */}
      <p
        style={{
          fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
          color: "rgb(var(--color-text-muted))",
          maxWidth: "580px",
          lineHeight: 1.65,
          marginBottom: "2.5rem",
        }}
      >
        {siteConfig.description}
      </p>

      {/* CTAs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "4rem",
        }}
      >
        <a
          href="#download"
          className="btn-primary"
          style={{
            padding: "0.875rem 2rem",
            fontSize: "var(--text-md)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>↓</span> Get the App — It&apos;s Free
        </a>
        <a
          href="#how-it-works"
          style={{
            padding: "0.875rem 2rem",
            fontSize: "var(--text-md)",
            fontWeight: 600,
            textDecoration: "none",
            color: "rgb(var(--color-text-muted))",
            border: "1px solid rgb(var(--color-border))",
            borderRadius: "var(--radius-full)",
            background: "rgb(var(--color-bg-elevated))",
            transition: "border-color 0.15s ease, color 0.15s ease",
          }}
        >
          See How It Works →
        </a>
      </div>

      {/* Social proof */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          fontSize: "var(--text-sm)",
          color: "rgb(var(--color-text-muted))",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { stat: "50K+", label: "Active Creators" },
          { stat: "200K+", label: "Products Listed" },
          { stat: "4.9★", label: "App Store Rating" },
        ].map(({ stat, label }) => (
          <div
            key={stat}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-lg)",
                color: "rgb(var(--color-text))",
              }}
            >
              {stat}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Mock phone preview */}
      <div
        style={{
          marginTop: "4rem",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          perspective: "1000px",
        }}
      >
        {[
          { rotate: "-8deg", translateY: "20px", label: "Feed" },
          { rotate: "0deg", translateY: "0px", label: "Product" },
          { rotate: "8deg", translateY: "20px", label: "Profile" },
        ].map(({ rotate, translateY, label }) => (
          <div
            key={label}
            style={{
              width: 160,
              height: 300,
              borderRadius: 28,
              border: "1px solid rgb(var(--color-border-strong))",
              background: "rgb(var(--color-bg-elevated))",
              boxShadow: "var(--shadow-lg)",
              transform: `rotate(${rotate}) translateY(${translateY})`,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Phone notch */}
            <div
              style={{
                height: 28,
                background: "rgb(var(--color-bg-subtle))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 8,
                  borderRadius: 4,
                  background: "rgb(var(--color-border-strong))",
                }}
              />
            </div>
            {/* Screen content */}
            <div style={{ flex: 1, padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {label === "Feed" && (
                <>
                  <div style={{ height: 120, borderRadius: 12, background: "linear-gradient(135deg, rgb(var(--brand-primary) / 0.3), rgb(var(--brand-accent) / 0.3))" }} />
                  <div style={{ height: 8, borderRadius: 4, background: "rgb(var(--color-border))", width: "80%" }} />
                  <div style={{ height: 8, borderRadius: 4, background: "rgb(var(--color-border))", width: "60%" }} />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <div style={{ height: 24, flex: 1, borderRadius: 8, background: "rgb(var(--brand-primary) / 0.2)" }} />
                    <div style={{ height: 24, flex: 1, borderRadius: 8, background: "rgb(var(--color-border))" }} />
                  </div>
                </>
              )}
              {label === "Product" && (
                <>
                  <div style={{ height: 100, borderRadius: 12, background: "linear-gradient(135deg, rgb(var(--brand-secondary) / 0.3), rgb(var(--brand-primary) / 0.2))" }} />
                  <div style={{ height: 8, borderRadius: 4, background: "rgb(var(--color-border))", width: "90%" }} />
                  <div style={{ height: 8, borderRadius: 4, background: "rgb(var(--color-border))", width: "50%" }} />
                  <div style={{ height: 16, borderRadius: 4, background: "rgb(var(--brand-primary) / 0.8)", marginTop: "auto" }} />
                </>
              )}
              {label === "Profile" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, rgb(var(--brand-accent)), rgb(var(--brand-primary)))" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 7, borderRadius: 4, background: "rgb(var(--color-border))", width: "70%", marginBottom: 4 }} />
                      <div style={{ height: 6, borderRadius: 4, background: "rgb(var(--color-border))", width: "50%" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem", marginTop: "0.5rem" }}>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} style={{ height: 60, borderRadius: 8, background: `rgb(var(--brand-${i % 2 === 0 ? "primary" : "accent"}) / 0.15)` }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
