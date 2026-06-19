import React from "react";
import type { Dictionary } from "@/i18n/getDictionary";

const EL = ({ href, children }: { href: string; children: React.ReactNode }) => (
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

/* Honest, real use cases — not fabricated reviews. */
const useCases: { node: React.ReactNode; who: string; accent: string }[] = [
  {
    node: (
      <>
        A farmer in Kiambu films the cows, adds a price and the location, and
        posts. Buyers across the country see it and message directly — no broker
        deciding the price for them.
      </>
    ),
    who: "Farm produce & livestock",
    accent: "var(--brand-primary)",
  },
  {
    node: (
      <>
        A phone dealer in town posts a short video of a clean iPhone. Someone
        scrolling nearby sees it, asks a question, and they agree to meet — the
        same day, no listing fees.
      </>
    ),
    who: "Electronics & phones",
    accent: "var(--brand-secondary)",
  },
  {
    node: (
      <>
        Used to post on <EL href="https://jiji.co.ke">Jiji</EL> and wait? On
        Shopi the product finds the buyer while they scroll, like{" "}
        <EL href="https://www.tiktok.com">TikTok</EL> — but everything in the
        feed is for sale, near you.
      </>
    ),
    who: "Fashion, furniture & more",
    accent: "var(--brand-accent)",
  },
];

export function TestimonialsSection({ dict }: { dict: Dictionary }) {
  return (
    <section
      style={{
        padding: "5rem 1.25rem",
        background: "rgb(var(--color-bg-subtle))",
        borderTop: "1px solid rgb(var(--color-border))",
        borderBottom: "1px solid rgb(var(--color-border))",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
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
            {dict.testimonials.sectionLabel}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              letterSpacing: "-0.025em",
              color: "rgb(var(--color-text))",
            }}
          >
            {dict.testimonials.headline}
          </h2>
        </div>

        <div className="usecase-grid">
          {useCases.map(({ node, who, accent }) => (
            <div
              key={who}
              style={{
                padding: "2rem",
                borderRadius: "var(--radius-lg)",
                background: "rgb(var(--color-bg-elevated))",
                border: "1px solid rgb(var(--color-border))",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 4,
                  background: `rgb(${accent})`,
                }}
              />
              <p
                style={{
                  fontSize: "var(--text-md)",
                  color: "rgb(var(--color-text))",
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {node}
              </p>
              <div
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  color: `rgb(${accent})`,
                }}
              >
                {who}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .usecase-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          @media (min-width: 640px) {
            .usecase-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1024px) {
            .usecase-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
          }
        `}</style>
      </div>
    </section>
  );
}
