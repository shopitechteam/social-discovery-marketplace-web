"use client";

import { useEffect } from "react";

export function HowItWorksDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const steps = [
    {
      number: "01",
      emoji: "📲",
      title: "Sign up in 30 seconds",
      body: "No credit card. No long forms. Pick your interests — phones, fashion, food, whatever — and your local feed is ready instantly.",
    },
    {
      number: "02",
      emoji: "🎬",
      title: "Scroll your local feed",
      body: "Watch videos and photos posted by real sellers near you. Think TikTok, but every post is something actually for sale — with a seller you can message directly.",
    },
    {
      number: "03",
      emoji: "💬",
      title: "Like it? Message the seller.",
      body: "Tap to open a direct chat with any seller. Negotiate, ask questions, arrange pickup or delivery — completely on your terms. No checkout, no middleman.",
    },
    {
      number: "04",
      emoji: "📦",
      title: "Sell. Post. Build your audience.",
      body: "Sellers post content, grow followers, and build trust over time. The more you post, the more people discover what you're selling — even while you sleep.",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How Shopi works"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 20,
          background: "rgb(var(--color-bg-elevated))",
          border: "1px solid rgb(var(--color-border))",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
          animation: "slideUp 0.22s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 1.5rem 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgb(var(--brand-accent))",
                marginBottom: "0.25rem",
              }}
            >
              How it works
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "rgb(var(--color-text))",
                lineHeight: 1.2,
              }}
            >
              Discover locally. Connect directly.
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1px solid rgb(var(--color-border))",
              background: "rgb(var(--color-bg-subtle))",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              color: "rgb(var(--color-text-muted))",
              flexShrink: 0,
              marginLeft: "1rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {steps.map(({ number, emoji, title, body }) => (
            <div
              key={number}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "flex-start",
                padding: "1.25rem",
                borderRadius: 14,
                background: "rgb(var(--color-bg-subtle))",
                border: "1px solid rgb(var(--color-border))",
              }}
            >
              {/* Number badge */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {number}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>{emoji}</span>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "rgb(var(--color-text))",
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgb(var(--color-text-muted))",
                    lineHeight: 1.65,
                  }}
                >
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div
          style={{
            padding: "0 1.5rem 1.5rem",
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <a
            href="#download"
            onClick={onClose}
            className="btn-primary"
            style={{
              flex: 1,
              minWidth: 160,
              padding: "0.8rem 1.25rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            Download Shopi →
          </a>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              minWidth: 120,
              padding: "0.8rem 1.25rem",
              borderRadius: "var(--radius-full)",
              border: "1px solid rgb(var(--color-border))",
              background: "rgb(var(--color-bg-elevated))",
              color: "rgb(var(--color-text-muted))",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
