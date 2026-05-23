"use client";

import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/getDictionary";

export function LandingFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer
      style={{
        borderTop: "1px solid rgb(var(--color-border))",
        padding: "3rem 1.25rem 2rem",
        background: "rgb(var(--color-bg-subtle))",
      }}
    >
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--radius-sm)",
                background:
                  "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.875rem",
                fontFamily: "var(--font-display)",
              }}
            >
              S
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-lg)",
                color: "rgb(var(--color-text))",
              }}
            >
              {siteConfig.name}
            </span>
          </div>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
              lineHeight: "var(--leading-normal)",
              maxWidth: "260px",
            }}
          >
            Kenya&apos;s social discovery marketplace. Scroll local products.
            Connect with sellers directly. No checkout needed.
          </p>
          <div
            style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}
          >
            {["𝕏", "ig", "tk", "yt"].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--radius-full)",
                  border: "1px solid rgb(var(--color-border))",
                  background: "rgb(var(--color-bg-elevated))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "var(--text-xs)",
                  color: "rgb(var(--color-text-muted))",
                  textDecoration: "none",
                  fontWeight: 700,
                  transition: "border-color 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "rgb(var(--color-text))";
                  e.currentTarget.style.borderColor =
                    "rgb(var(--color-border-strong))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgb(var(--color-text-muted))";
                  e.currentTarget.style.borderColor =
                    "rgb(var(--color-border))";
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          {
            heading: "Product",
            links: ["Features", "How It Works", "For Creators", "For Sellers"],
          },
          {
            heading: "Company",
            links: ["About", "Blog", "Careers", "Press"],
          },
          {
            heading: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Contact",
            ],
          },
        ].map(({ heading, links }) => (
          <div key={heading}>
            <h4
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                color: "rgb(var(--color-text))",
                marginBottom: "1rem",
                letterSpacing: "0.02em",
              }}
            >
              {heading}
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
              }}
            >
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "rgb(var(--color-text-muted))",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgb(var(--color-text))")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "rgb(var(--color-text-muted))")
                    }
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgb(var(--color-border))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "var(--text-xs)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        <span>{dict.footer.copyright.replace("{year}", String(new Date().getFullYear()))}</span>
        <span>Made in Kenya</span>
      </div>

      <style>{`
        .footer-grid {
          max-width: 1200px;
          margin: 0 auto 3rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 640px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }
        @media (min-width: 1024px) {
          .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; }
        }
      `}</style>
    </footer>
  );
}
