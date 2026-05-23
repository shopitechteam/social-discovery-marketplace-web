"use client";

import { useThemeStore } from "@/stores/theme";
import { siteConfig } from "@/config/site";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Creators", href: "#creators" },
  { label: "Sellers", href: "#sellers" },
];

export function LandingNav() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  // Track hydration only for the theme button — not the whole nav.
  const hydrated = useRef(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    hydrated.current = true;
    forceUpdate((n) => n + 1);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "0 2.5rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: scrolled
          ? "rgb(var(--color-bg) / 0.88)"
          : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgb(var(--color-border))"
          : "1px solid transparent",
        transition:
          "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-sm)",
            background:
              "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-accent)))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1rem",
            fontFamily: "var(--font-display)",
            flexShrink: 0,
          }}
        >
          S
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.125rem",
            color: "rgb(var(--color-text))",
            letterSpacing: "-0.01em",
          }}
        >
          {siteConfig.name}
        </span>
      </div>

      {/* Nav links — no mount gate, render immediately, no layout shift */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          fontSize: "var(--text-base)",
          fontWeight: 500,
          color: "rgb(var(--color-text-muted))",
        }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              textDecoration: "none",
              color: "inherit",
              transition: "color 0.15s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgb(var(--color-text))")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgb(var(--color-text-muted))")
            }
          >
            {label}
          </a>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Theme button — reserve its space even before hydration to prevent shift */}
        <div style={{ width: 36, height: 36 }}>
          {hydrated.current && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-full)",
                border: "1px solid rgb(var(--color-border))",
                background: "rgb(var(--color-bg-elevated))",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
              }}
            >
              {resolvedTheme === "dark" ? "☀️" : "🌙"}
            </button>
          )}
        </div>

        <a
          href="#download"
          className="btn-primary"
          style={{
            padding: "0.5rem 1.25rem",
            fontSize: "var(--text-sm)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          Download App
        </a>
      </div>
    </nav>
  );
}
