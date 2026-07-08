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
import { Menu, Moon, Sun, X } from "lucide-react";

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
        className={`fixed top-0 right-0 left-0 z-50 h-19 border-b bg-[rgb(var(--color-bg)/0.95)] px-4 backdrop-blur-[18px] transition-[background-color,border-color] duration-250 lg:px-30 ${
          scrolled ? "border-border" : "border-transparent"
        }`}
      >
        {/* Inner container — same width as the page content so the logo
            lines up with the hero headline, Tolstoy-style */}
        <div className="mx-auto flex h-full max-w-(--landing-page-max) items-center justify-between">
          {/* Left cluster — logo + section links, Tolstoy-style */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 no-underline">
              <ShopiLogo height={32} />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = activeHash === href;
                return (
                  <a
                    key={label}
                    href={sectionHref(href)}
                    onClick={(e) => handleHashLink(e, href)}
                    className={`whitespace-nowrap no-underline transition-colors duration-150 hover:text-foreground ${
                      isActive ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-[0.65rem]">
            {/* Sign in — quiet text link */}
            {/* Theme toggle */}
            <div className="h-9 w-9">
              {hydrated && (
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-elevated text-foreground"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun size={17} />
                  ) : (
                    <Moon size={17} />
                  )}
                </button>
              )}
            </div>

            {/* Sign in — quiet text link */}
            <Link
              href={`${homeBase}/auth/login`}
              className="hidden px-3 py-2 text-sm font-medium whitespace-nowrap text-muted no-underline md:inline-flex"
            >
              {dict?.auth.login.submit ?? "Sign in"}
            </Link>

            {/* Desktop CTA pair — outline + solid, Tolstoy-style */}
            <Link
              href={`${homeBase}/feed`}
              className="hidden items-center rounded-full border border-border bg-elevated px-[1.1rem] py-2 text-sm font-semibold whitespace-nowrap text-foreground no-underline md:inline-flex"
            >
              {dict?.common.openFeed ?? "Open the feed"}
            </Link>
            <Link
              href={`${homeBase}/upload`}
              className="hidden items-center rounded-full bg-foreground px-[1.1rem] py-2 text-sm font-semibold whitespace-nowrap text-background no-underline md:inline-flex"
            >
              {dict?.landing.hero.ctaSecondary ?? "Start selling"}
            </Link>

            {/* Language switcher */}
            {/* <LanguageSwitcher current={lang} /> */}

            {/* Hamburger — mobile only */}
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-border bg-elevated p-0 md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed top-19 right-0 bottom-0 left-0 z-49 flex flex-col overflow-y-auto bg-[rgb(var(--color-bg)/0.97)] px-(--landing-page-x) py-5 backdrop-blur-[18px]">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={sectionHref(href)}
              onClick={(e) => handleHashLink(e, href)}
              className="border-b border-border py-[0.65rem] text-[0.85rem] font-semibold text-foreground no-underline"
            >
              {label}
            </a>
          ))}

          {/* Primary CTA → feed */}
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href={`${homeBase}/feed`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-[0.85rem] text-[0.9rem] font-bold text-white no-underline"
            >
              {dict?.common.openFeed ?? "Open the feed"} →
            </Link>
            <p className="text-center text-[0.78rem] text-muted">
              Free to use · No account needed to start looking
            </p>
          </div>
        </div>
      )}
    </>
  );
}
