import React from "react";
import type { Dictionary } from "@/i18n/getDictionary";

const EL = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "inherit", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" }}
  >
    {children}
  </a>
);

const testimonials: { node: React.ReactNode; name: string; role: string; avatar: string; accent: string }[] = [
  {
    node: (
      <>
        I used to post on <EL href="https://jiji.co.ke">Jiji</EL> and wait days for a reply. On Shopi, someone messaged me 20 minutes after I posted a video of my phones. We met, they bought two.
      </>
    ),
    name: "Brian M.",
    role: "Electronics Seller, Nairobi",
    avatar: "BM",
    accent: "var(--brand-primary)",
  },
  {
    node: "I was just scrolling and saw a video of this lady selling handmade bags from her house in Westlands. I DM'd her. Now I have three of them.",
    name: "Wanjiku A.",
    role: "Buyer, Nairobi",
    avatar: "WA",
    accent: "var(--brand-accent)",
  },
  {
    node: "Shopi feels like Facebook Groups but actually useful. I joined the Farm Produce Nairobi community and I get fresh orders every week now.",
    name: "Peter K.",
    role: "Farmer & Seller, Kiambu",
    avatar: "PK",
    accent: "var(--brand-secondary)",
  },
];

export function TestimonialsSection({ dict }: { dict: Dictionary }) {
  return (
    <section
      style={{
        padding: "4rem 1.25rem",
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
            {dict.testimonials.sectionLabel}
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
            {dict.testimonials.headline}
          </h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map(({ node, name, role, avatar, accent }) => (
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
                &ldquo;{node}&rdquo;
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

        <style>{`
          .testimonials-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          @media (min-width: 640px) {
            .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (min-width: 1024px) {
            .testimonials-grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
          }
        `}</style>
      </div>
    </section>
  );
}
