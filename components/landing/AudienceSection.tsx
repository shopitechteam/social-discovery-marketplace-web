"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n/getDictionary";

export function AudienceSection({ dict }: { dict: Dictionary }) {
  const cards = [
    {
      id: "buyers",
      tag: dict.audience.buyers.tag,
      heading: dict.audience.buyers.title,
      body: dict.audience.buyers.body,
      cta: dict.audience.buyers.cta,
      accent: "var(--brand-primary)",
    },
    {
      id: "sellers",
      tag: dict.audience.sellers.tag,
      heading: dict.audience.sellers.title,
      body: dict.audience.sellers.body,
      cta: dict.audience.sellers.cta,
      accent: "var(--brand-secondary)",
    },
  ];

  return (
    <section
      id="creators"
      style={{ padding: "5rem 1.25rem", maxWidth: 1100, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
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
          {dict.audience.sectionLabel}
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            letterSpacing: 0,
            lineHeight: 1.15,
            color: "rgb(var(--color-text))",
          }}
        >
          {dict.audience.headline}
        </h2>
      </div>

      <div className="audience-grid">
        {cards.map(({ id, tag, heading, body, cta, accent }) => (
          <div
            key={id}
            id={id}
            style={{
              padding: "2.5rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid rgb(var(--color-border))",
              background: "rgb(var(--color-bg-elevated))",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.3rem 0.85rem",
                borderRadius: "var(--radius-full)",
                background: `rgb(${accent} / 0.1)`,
                color: `rgb(${accent})`,
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                marginBottom: "1.25rem",
              }}
            >
              {tag}
            </div>

            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.3rem, 2.2vw, 1.75rem)",
                color: "rgb(var(--color-text))",
                marginBottom: "1rem",
                lineHeight: 1.2,
              }}
            >
              {heading}
            </h3>

            <p
              style={{
                fontSize: "var(--text-md)",
                color: "rgb(var(--color-text-muted))",
                lineHeight: 1.65,
                marginBottom: "2rem",
              }}
            >
              {body}
            </p>

            <Link
              href="/feed"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-full)",
                background: `rgb(${accent})`,
                color: "#fff",
                fontSize: "var(--text-base)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {cta} →
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .audience-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 768px) {
          .audience-grid { grid-template-columns: 1fr 1fr; gap: 1.75rem; }
        }
      `}</style>
    </section>
  );
}
