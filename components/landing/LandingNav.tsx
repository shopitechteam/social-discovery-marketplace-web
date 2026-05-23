/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
"use client";

import { useThemeStore } from "@/stores/theme";
import { siteConfig } from "@/config/site";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

const NAV_HREFS = ["#features", "#how-it-works", "#creators"] as const;

export function LandingNav({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const NAV_LINKS = [
    { label: dict.nav.features, href: "#features" },
    { label: dict.nav.howItWorks, href: "#how-it-works" },
    { label: dict.nav.creators, href: "#creators" },
  ];
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const platformRef = useRef<"ios" | "android" | "other">("other");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    void setHydrated(true);

    const ua = navigator.userAgent;
    platformRef.current = /iphone|ipad|ipod/i.test(ua)
      ? "ios"
      : /android/i.test(ua)
        ? "android"
        : "other";

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    const sectionIds = NAV_HREFS.map((h) => h.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHash(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleHashLink(
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string,
  ) {
    setMenuOpen(false);
    if (pathname === "/") return;
    e.preventDefault();
    router.push(`/${hash}`);
  }

  return (
    <>
      <nav
        className="z-50"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "0 1.25rem",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgb(var(--color-bg) / 0.95)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: scrolled
            ? "1px solid rgb(var(--color-border))"
            : "1px solid transparent",
          transition: "background-color 0.25s ease, border-color 0.25s ease",
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

        {/* Desktop nav links */}
        <div
          className="landing-nav-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            fontSize: "var(--text-base)",
            fontWeight: 500,
            color: "rgb(var(--color-text-muted))",
          }}
        >
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activeHash === href;
            return (
              <a
                key={label}
                href={pathname === "/" ? href : `/${href}`}
                onClick={(e) => handleHashLink(e, href)}
                style={{
                  textDecoration: "none",
                  color: isActive
                    ? "rgb(var(--color-text))"
                    : "rgb(var(--color-text-muted))",
                  transition: "color 0.15s ease",
                  whiteSpace: "nowrap",
                  paddingBottom: "4px",
                  borderBottom: isActive
                    ? "2px solid rgb(var(--brand-primary))"
                    : "2px solid transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgb(var(--color-text))")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isActive
                    ? "rgb(var(--color-text))"
                    : "rgb(var(--color-text-muted))")
                }
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Theme toggle */}
          <div style={{ width: 36, height: 36 }}>
            {hydrated && (
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

          {/* Desktop CTA */}
          <a
            href={pathname === "/" ? "#download" : "/#download"}
            onClick={(e) => handleHashLink(e, "#download")}
            className="btn-primary landing-nav-cta"
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "var(--text-sm)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            {dict.common.downloadApp}
          </a>

          {/* Language switcher */}
          <LanguageSwitcher current={lang} />

          {/* Hamburger — mobile only */}
          <button
            className="landing-hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgb(var(--color-border))",
              background: "rgb(var(--color-bg-elevated))",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: 0,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                display: "block",
                width: 16,
                height: 2,
                borderRadius: 1,
                background: "rgb(var(--color-text))",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: 16,
                height: 2,
                borderRadius: 1,
                background: "rgb(var(--color-text))",
                opacity: menuOpen ? 0 : 1,
                transition: "opacity 0.2s ease",
              }}
            />
            <span
              style={{
                display: "block",
                width: 16,
                height: 2,
                borderRadius: 1,
                background: "rgb(var(--color-text))",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                transform: menuOpen
                  ? "translateY(-6px) rotate(-45deg)"
                  : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
            background: "rgb(var(--color-bg) / 0.97)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            display: "flex",
            flexDirection: "column",
            padding: "1.25rem 1.25rem",
            gap: "0",
            overflowY: "auto",
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={pathname === "/" ? href : `/${href}`}
              onClick={(e) => handleHashLink(e, href)}
              style={{
                padding: "0.65rem 0",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "rgb(var(--color-text))",
                textDecoration: "none",
                borderBottom: "1px solid rgb(var(--color-border))",
              }}
            >
              {label}
            </a>
          ))}

          {/* Download buttons */}
          <div
            style={{
              marginTop: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {(platformRef.current === "ios" ||
              platformRef.current === "other") && (
              <a
                href="#download"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.625rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: 9999,
                  background: "rgb(var(--color-text))",
                  color: "rgb(var(--color-bg))",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Download on the App Store
              </a>
            )}
            {(platformRef.current === "android" ||
              platformRef.current === "other") && (
              <a
                href="#download"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.625rem",
                  padding: "0.75rem 1.25rem",
                  borderRadius: 9999,
                  background: "rgb(var(--brand-primary))",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.18 23.76c.3.17.64.19.96.08l11.29-6.52-2.5-2.5-9.75 8.94zM.96 1.1C.36 1.45 0 2.1 0 2.88v18.24c0 .78.36 1.43.96 1.78l.1.06 10.22-10.22v-.24L1.06 1.04l-.1.06zM20.38 10.06l-2.9-1.68-2.8 2.8 2.8 2.8 2.92-1.69c.83-.48.83-1.26-.02-1.23zM4.14.24l11.29 6.52-2.5 2.5L3.18.32C3.5.21 3.84.23 4.14.24z" />
                </svg>
                Get it on Google Play
              </a>
            )}

            {/* Continue in web */}
            <Link
              href="/feed"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.7rem 1.25rem",
                borderRadius: 9999,
                border: "1px solid rgb(var(--color-border))",
                background: "transparent",
                color: "rgb(var(--color-text-muted))",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Continue in web →
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .landing-nav-links { display: flex !important; }
          .landing-nav-cta { display: inline-flex !important; }
          .landing-hamburger { display: none !important; }
        }
        @media (max-width: 767px) {
          .landing-nav-links { display: none !important; }
          .landing-nav-cta { display: none !important; }
          .landing-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
