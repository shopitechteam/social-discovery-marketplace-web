"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useInboxUnreadCount } from "@/features/messaging/hooks/useUnreadCount";

type Tab = {
  key: string;
  path: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const tabs: Tab[] = [
  {
    key: "feed",
    path: "feed",
    label: "For you",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <path
          d="M9 21V12h6v9"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "following",
    path: "following",
    label: "Following",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="10"
          cy="8"
          r="3.5"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <path
          d="M2 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
        <path
          d="M17 11l2 2 4-4"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "explore",
    path: "explore",
    label: "Explore",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="11"
          cy="11"
          r="7.5"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.1 : 0}
        />
        <path
          d="M17.5 17.5L21 21"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "upload",
    path: "upload",
    label: "Upload",
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M12 8v8M8 12h8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "community",
    path: "community",
    label: "Community",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="9"
          cy="8"
          r="3"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <circle
          cx="17"
          cy="9"
          r="2.5"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <path
          d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
        <path
          d="M16 17c1.5-.8 3.5-.3 4.5 1.5"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "nearby",
    path: "nearby",
    label: "Near Me",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
        <circle
          cx="12"
          cy="8"
          r="2"
          stroke="currentColor"
          strokeWidth={active ? 2 : 1.5}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.4 : 0}
        />
      </svg>
    ),
  },
  {
    key: "notifications",
    path: "notifications",
    label: "Inbox",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7.414L4 19.414V5a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinejoin="round"
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
  },
  {
    key: "profile",
    path: "profile",
    label: "Profile",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8"
          r="3.5"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          fill={active ? "currentColor" : "none"}
          fillOpacity={active ? 0.15 : 0}
        />
        <path
          d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function SideNav({ lang = "en" }: { lang: string }) {
  const pathname = usePathname();
  const unreadCount = useInboxUnreadCount();

  // Hide on full create flow
  if (
    pathname.includes("/upload/create") ||
    pathname.includes("/upload/tiktok")
  )
    return null;

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40"
      style={{
        width: "var(--side-nav-width, 240px)",
        backgroundColor: "rgb(var(--color-bg-elevated))",
        borderRight: "1px solid rgb(var(--color-border))",
      }}
    >
      {/* Logo */}
      <div className="flex items-center px-6 py-5 shrink-0">
        <Link href={`/${lang}/feed`} className="flex items-center gap-2.5">
          <Image
            src="/assets/shopi-logo.png"
            height={32}
            width={32}
            alt="Shopi"
            className="rounded-lg"
          />
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: "rgb(var(--color-text))" }}
          >
            Shopi
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 px-3 flex-1">
        {tabs.map((tab) => {
          const href = `/${lang}/${tab.path}`;
          const isActive =
            tab.key === "feed"
              ? pathname === `/${lang}` || pathname.startsWith(`/${lang}/feed`)
              : pathname.startsWith(`/${lang}/${tab.path}`);

          return (
            <Link
              key={tab.key}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group"
              style={{
                color: isActive
                  ? `rgb(var(--brand-primary))`
                  : `rgb(var(--color-text))`,
                backgroundColor: isActive
                  ? `rgb(var(--brand-primary) / 0.08)`
                  : "transparent",
                fontWeight: isActive ? 600 : 400,
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.icon(isActive)}
              <span className="text-sm">{tab.label}</span>
              {tab.key === "notifications" && unreadCount > 0 ? (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle + branding */}
      <div
        className="px-4 py-4 shrink-0 flex flex-col gap-3"
        style={{ borderTop: "1px solid rgb(var(--color-border))" }}
      >
        <ThemeToggle />
        <span
          className="text-xs px-2"
          style={{ color: "rgb(var(--color-text-muted))" }}
        >
          © {new Date().getFullYear()} Shopi
        </span>
      </div>
    </aside>
  );
}

function ThemeToggle() {
  // useSyncExternalStore: server snapshot = null (unknown), client snapshot = real DOM value.
  // This guarantees server HTML and client first-render both use null, avoiding hydration mismatch.
  const isDark = useSyncExternalStore(
    (cb) => {
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => null, // SSR / first paint — render neutral placeholder
  );

  function toggle() {
    const html = document.documentElement;
    const next = !html.classList.contains("dark");
    html.classList.toggle("dark", next);
    // No setState needed — MutationObserver triggers useSyncExternalStore re-render
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }

  // Render a neutral placeholder until we know the real theme (avoids flash)
  if (isDark === null) {
    return (
      <button
        disabled
        className="flex items-center gap-3 px-3 py-3 rounded-xl w-full opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" />
        <span className="text-sm">Theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-all duration-150"
      style={{ color: "rgb(var(--color-text))" }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        /* Sun icon */
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.7" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ) : (
        /* Moon icon */
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
            stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
            fill="currentColor" fillOpacity="0.12" />
        </svg>
      )}
      <span className="text-sm">{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
