"use client";

export function DownloadSection() {
  return (
    <section
      id="download"
      style={{
        padding: "6rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          padding: "5rem 3rem",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgb(var(--brand-primary) / 0.08) 0%, rgb(var(--brand-accent) / 0.08) 50%, rgb(var(--brand-secondary) / 0.06) 100%)",
          border: "1px solid rgb(var(--color-border))",
        }}
      >
        {/* Background orbs */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgb(var(--brand-primary) / 0.12)",
            filter: "blur(60px)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgb(var(--brand-accent) / 0.1)",
            filter: "blur(60px)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: "2.5rem",
              marginBottom: "1rem",
              lineHeight: 1,
            }}
          >
            📱
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "rgb(var(--color-text))",
              marginBottom: "1rem",
            }}
          >
            Ready to shop differently?
          </h2>
          <p
            style={{
              fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
              color: "rgb(var(--color-text-muted))",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
              lineHeight: "var(--leading-normal)",
            }}
          >
            Join thousands of shoppers, creators, and sellers already on Shopi.
            Free to download. Free to use.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "2rem",
            }}
          >
            {/* App Store button */}
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1.75rem",
                borderRadius: "var(--radius-md)",
                background: "rgb(var(--color-text))",
                color: "rgb(var(--color-bg))",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "var(--text-base)",
                transition: "opacity 0.15s ease, transform 0.1s ease",
                boxShadow: "var(--shadow-md)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.88";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "1.375rem" }}></span>
              <div style={{ textAlign: "left", lineHeight: 1.3 }}>
                <div style={{ fontSize: "var(--text-xs)", opacity: 0.7 }}>Download on the</div>
                <div>App Store</div>
              </div>
            </a>

            {/* Google Play button */}
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1.75rem",
                borderRadius: "var(--radius-md)",
                background: "rgb(var(--color-text))",
                color: "rgb(var(--color-bg))",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "var(--text-base)",
                transition: "opacity 0.15s ease, transform 0.1s ease",
                boxShadow: "var(--shadow-md)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.88";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "1.375rem" }}>▶</span>
              <div style={{ textAlign: "left", lineHeight: 1.3 }}>
                <div style={{ fontSize: "var(--text-xs)", opacity: 0.7 }}>Get it on</div>
                <div>Google Play</div>
              </div>
            </a>
          </div>

          <p style={{ fontSize: "var(--text-sm)", color: "rgb(var(--color-text-muted))" }}>
            Available on iOS 15+ and Android 8+
          </p>
        </div>
      </div>
    </section>
  );
}
