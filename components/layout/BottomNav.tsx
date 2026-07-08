"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Inbox,
  Plus,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useInboxUnreadCount } from "@/features/messaging/hooks/useUnreadCount";

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
    icon: Search,
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
    icon: Inbox,
  },
  {
    key: "profile",
    path: "profile",
    label: "Me",
    icon: UserRound,
  },
];

export function shouldHideBottomNav(pathname: string) {
  return (
    pathname.includes("/upload/create") ||
    pathname.includes("/upload/tiktok") ||
    pathname.includes("/content/") ||
    /\/profile\/[^/]+$/.test(pathname) ||
    /\/notifications\/[^/]+/.test(pathname)
  );
}

export function BottomNav({ lang = "en" }: { lang: string }) {
  const pathname = usePathname();
  const unreadCount = useInboxUnreadCount();

  // Hide on the full create flow, content detail, creator profile, and chat detail pages
  if (shouldHideBottomNav(pathname)) return null;

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 md:hidden pb-(--safe-bottom) bg-[rgb(var(--color-bg-elevated)/0.92)] backdrop-blur-[16px] backdrop-saturate-[1.8]"
    >
      <div
        className="relative flex h-(--nav-height) items-center justify-between border-t border-border"
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
                className="flex h-9 w-13 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgb(var(--brand-primary)),rgb(var(--brand-primary))_60%,rgb(var(--brand-secondary)))] shadow-[0_4px_16px_rgb(var(--brand-primary)/0.4)]"
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
              scroll={false}
              className={`flex min-h-11 flex-1 select-none flex-col items-center justify-center gap-0.5 py-1 transition-colors duration-150 [-webkit-tap-highlight-color:transparent] ${
                isActive ? "text-primary" : "text-muted"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.45 : 1.9}
                  fill={isActive ? "currentColor" : "none"}
                  fillOpacity={isActive ? 0.18 : 0}
                />
                {tab.key === "notifications" && unreadCount > 0 ? (
                  <span
                    className="absolute -right-2 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full border-[1.5px] border-elevated bg-primary px-1 text-[10px] leading-none font-bold text-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
                    aria-label={`${unreadCount} unread`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </span>
              <p
                className={`text-xs leading-none ${
                  isActive
                    ? "font-semibold tracking-[0.01em]"
                    : "font-normal tracking-normal"
                }`}
              >
                {tab.label}
              </p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
