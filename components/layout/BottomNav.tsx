"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  House,
  MessageCircle,
  Plus,
  UserRound,
  type LucideIcon,
} from "lucide-react";

type Tab = {
  key: string;
  path: string; // without leading slash, e.g. "feed"
  label: string;
  icon: LucideIcon;
};

const tabs: Tab[] = [
  {
    key: "feed",
    path: "feed",
    label: "Home",
    icon: House,
  },
  {
    key: "explore",
    path: "explore",
    label: "Explore",
    icon: Compass,
  },
  {
    key: "upload",
    path: "upload",
    label: "Post",
    icon: Plus,
  },
  {
    key: "notifications",
    path: "notifications",
    label: "Inbox",
    icon: MessageCircle,
  },
  {
    key: "profile",
    path: "profile",
    label: "Me",
    icon: UserRound,
  },
];

export function BottomNav({ lang = "en" }: { lang: string }) {
  const pathname = usePathname();

  // Hide on the full create flow, content detail, and creator profile pages
  if (
    pathname.includes("/upload/create") ||
    pathname.includes("/upload/tiktok") ||
    pathname.includes("/content/") ||
    /\/profile\/[^/]+$/.test(pathname)
  )
    return null;

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 md:hidden"
      style={{
        paddingBottom: "var(--safe-bottom)",
        backgroundColor: "rgb(var(--color-bg-elevated) / 0.92)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
      }}
    >
      <div
        className="relative flex items-center justify-between"
        style={{
          height: "var(--nav-height)",
          borderTop: "1px solid rgb(var(--color-border))",
        }}
      >
        {tabs.map((tab) => {
          const href = `/${lang}/${tab.path}`;
          const Icon = tab.icon;

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
                <Icon size={22} strokeWidth={2.8} color="white" />
              </Link>
            );
          }

          // Active if the pathname segment after lang matches this tab's path
          const isActive =
            tab.key === "feed"
              ? pathname === `/${lang}` ||
                pathname.startsWith(`/${lang}/feed`) ||
                pathname.startsWith(`/${lang}/collections/`)
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
              <Icon
                size={24}
                strokeWidth={isActive ? 2.45 : 1.9}
                fill={isActive ? "currentColor" : "none"}
                fillOpacity={isActive ? 0.18 : 0}
              />
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
