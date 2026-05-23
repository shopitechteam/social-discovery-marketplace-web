"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  key: string;
  path: string; // without leading slash, e.g. "feed"
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const tabs: Tab[] = [
  {
    key: "feed",
    path: "feed",
    label: "Home",
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
    label: "Post",
    icon: () => null,
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
    label: "Me",
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

export function BottomNav({ lang = "en" }: { lang: string }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-107.5 z-50"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div
        className="relative flex items-center justify-between px-2"
        style={{
          height: "var(--nav-height)",
          backgroundColor: "rgb(var(--color-bg-elevated) / 0.92)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderTop: "1px solid rgb(var(--color-border))",
        }}
      >
        {tabs.map((tab) => {
          const href = `/${lang}/${tab.path}`;

          // Center Post button — gradient pill
          if (tab.key === "upload") {
            return (
              <Link
                key={tab.key}
                href={href}
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: 52,
                  height: 36,
                  background: `linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-primary)) 60%, rgb(var(--brand-secondary)))`,
                  boxShadow: "0 4px 16px rgb(var(--brand-primary) / 0.4)",
                }}
                aria-label="Create post"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            );
          }

          // Active if the pathname segment after lang matches this tab's path
          const isActive =
            tab.key === "feed"
              ? pathname === `/${lang}` || pathname.startsWith(`/${lang}/feed`)
              : pathname.startsWith(`/${lang}/${tab.path}`);

          return (
            <Link
              key={tab.key}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 select-none"
              style={{
                color: isActive
                  ? `rgb(var(--brand-primary))`
                  : `rgb(var(--color-text-muted))`,
                transition: "color 0.15s ease",
                WebkitTapHighlightColor: "transparent",
                minHeight: 44,
              }}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.icon(isActive)}
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: isActive ? "0.01em" : "normal",
                  lineHeight: 1,
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
