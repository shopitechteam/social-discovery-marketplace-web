/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useThemeStore } from "@/stores/theme";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
//import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import { ShopiLogo } from "@/features/auth/components/AuthIcons";

const NAV_HREFS = ["#features", "#how-it-works", "#creators"] as const;

export function LandingNav({ dict }: { dict?: Dictionary; lang?: Locale }) {
  const NAV_LINKS = [
    { label: dict?.nav.features ?? "Features", href: "#features" },
    { label: dict?.nav.howItWorks ?? "How It Works", href: "#how-it-works" },
    { label: dict?.nav.creators ?? "Creators", href: "#creators" },
  ];
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Base path of the landing page for the current locale (e.g. "/en").
  const localeSeg = pathname.split("/").filter(Boolean)[0] ?? "";
  const homeBase = ["en", "sw"].includes(localeSeg) ? `/${localeSeg}` : "";
  const sectionHref = (hash: string) => `${homeBase}/${hash}`;

  useEffect(() => {
    void setHydrated(true);

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
    e.preventDefault();
    setMenuOpen(false);
    const id = hash.replace("#", "");

    // If the target section is on the current page, just scroll to it.
    // (The landing page lives at /[lang], e.g. "/en", so a "/" check fails.)
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }

    // Otherwise go to the landing page (root of the current locale) with the hash.
    router.push(sectionHref(hash));
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
          height: "70px",
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
        {/* Logo → home */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <ShopiLogo height={34} />
        </Link>

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
                href={sectionHref(href)}
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
                  color: "rgb(var(--color-text))",
                }}
              >
                {resolvedTheme === "dark" ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Desktop CTA */}
          <Link
            href="/feed"
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
            {dict?.common.openFeed ?? "Open the feed"}
          </Link>

          {/* Language switcher */}
          {/* <LanguageSwitcher current={lang} /> */}

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

          {/* Primary CTA → feed */}
          <div
            style={{
              marginTop: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <Link
              href="/feed"
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.85rem 1.25rem",
                borderRadius: 9999,
                background: "rgb(var(--brand-primary))",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              {dict?.common.openFeed ?? "Open the feed"} →
            </Link>
            <p
              style={{
                textAlign: "center",
                fontSize: "0.78rem",
                color: "rgb(var(--color-text-muted))",
                margin: 0,
              }}
            >
              Free to use · No account needed to start looking
            </p>
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
