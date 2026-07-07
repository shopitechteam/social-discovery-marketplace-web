"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/getDictionary";

export function LandingFooter({ dict }: { dict?: Dictionary }) {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "en";
  return (
    <footer
      style={{
        borderTop: "1px solid rgb(var(--color-border))",
        padding: "3rem var(--landing-page-x) 2rem",
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
            {dict?.footer.tagline ??
              "Kenya's social marketplace. Discover it, message the seller, done."}
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
            links: [
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "For Buyers", href: "#creators" },
              { label: "For Sellers", href: "#sellers" },
            ],
          },
          {
            heading: "Company",
            links: [
              { label: "About", href: `/${lang}/about` },
              { label: "Blog", href: `/${lang}/blog` },
              { label: "Careers", href: `/${lang}/careers` },
            ],
          },
          {
            heading: "Legal",
            links: [
              { label: "Privacy Policy", href: `/${lang}/privacy` },
              { label: "Terms of Service", href: `/${lang}/terms` },
              { label: "Cookie Policy", href: `/${lang}/cookies` },
              { label: "Contact", href: "mailto:hello@shopi.co.ke" },
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
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
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
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: "var(--landing-page-max)",
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
        <span>
          {dict?.footer.copyright.replace(
            "{year}",
            String(new Date().getFullYear()),
          ) ??
            `© ${new Date().getFullYear()} Shopi Limited. All rights reserved.`}
        </span>
        <span>Made in Kenya</span>
      </div>

      <style>{`
        .footer-grid {
          max-width: var(--landing-page-max);
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
