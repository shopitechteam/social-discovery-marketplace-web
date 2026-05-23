"use client";

import React from "react";

const EL = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: "inherit",
      textDecoration: "underline",
      textDecorationStyle: "dotted",
      textUnderlineOffset: "3px",
    }}
  >
    {children}
  </a>
);

const features: {
  icon: string;
  title: string;
  description?: string;
  node?: React.ReactNode;
  color: string;
}[] = [
  {
    icon: "🎬",
    title: "Scroll to discover, not search",
    description:
      "Forget boring classified listings. Sellers post short videos, product demos, and photos. You discover them the same way you'd discover content — by scrolling.",
    color: "var(--brand-primary)",
  },
  {
    icon: "💬",
    title: "Interested? Just message.",
    description:
      "No carts. No checkout. No payment forms. When you find something you want, tap to chat with the seller directly and agree on your own terms.",
    color: "var(--brand-accent)",
  },
  {
    icon: "📍",
    title: "Local products, finally discoverable",
    description:
      "That farmer selling tomatoes in Kiambu. The sneaker dealer in Eastleigh. The tailor in Kisumu. They're all on Shopi — and now you can actually find them.",
    color: "var(--brand-secondary)",
  },
  {
    icon: "🏘️",
    title: "Join communities that match you",
    description:
      '"iPhones in Embakasi." "Sneakers Kenya." "Farm Produce Nairobi." Join niche local communities where buyers and sellers already know each other.',
    color: "var(--brand-primary)",
  },
  {
    icon: "📲",
    title: "Post once. Reach thousands.",
    node: (
      <>
        Sellers post a video or photo — and it reaches people scrolling nearby.
        More visibility than a WhatsApp status. More trust than a{" "}
        <EL href="https://jiji.co.ke">Jiji</EL> listing — because buyers see the
        real product, not just a photo and a price.
      </>
    ),
    color: "var(--brand-accent)",
  },
  {
    icon: "🔗",
    title: "Already on TikTok? Just import it.",
    node: (
      <>
        Already posted a product video on{" "}
        <EL href="https://www.tiktok.com">TikTok</EL>? Import it to Shopi in one
        tap — with your consent. No re-filming. No re-editing. Your content, now
        working twice as hard.
      </>
    ),
    color: "var(--brand-secondary)",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      style={{
        padding: "4rem 1.25rem",
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
          <a
            href="https://www.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
              borderBottom: "1px solid currentColor",
            }}
          >
            TikTok
          </a>{" "}
          had discovery.{" "}
          <a
            href="https://jiji.co.ke"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "inherit",
              textDecoration: "none",
              borderBottom: "1px solid currentColor",
            }}
          >
            Jiji
          </a>{" "}
          had intent. We built both.
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
          Built so local sellers waste zero time getting started.
        </h2>
      </div>

      {/* Feature grid */}
      <div className="features-grid">
        {features.map(({ icon, title, description, node, color }) => (
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
              {node ?? description}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
        }
        @media (min-width: 1024px) {
          .features-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        }
      `}</style>
    </section>
  );
}
