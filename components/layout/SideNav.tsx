"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  Bell,
  Home,
  Moon,
  Plus,
  Search,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { useInboxUnreadCount } from "@/features/messaging/hooks/useUnreadCount";
import { useAuthStore } from "@/stores/auth";
import { Logo } from "@/components/ui/Logo";

type Tab = {
  key: string;
  path: string;
  label: string;
  icon: LucideIcon;
};

const tabs: Tab[] = [
  { key: "feed", path: "feed", label: "Feed", icon: Home },
  { key: "explore", path: "explore", label: "Explore", icon: Search },
  { key: "upload", path: "upload", label: "Upload & sell", icon: Plus },
  { key: "notifications", path: "notifications", label: "Inbox", icon: Bell },
  { key: "profile", path: "profile", label: "Profile", icon: User },
];

const browse = [
  { label: "Beauty & Skincare", color: "rgb(var(--brand-primary))" },
  { label: "Electronics", color: "#38A8FF" },
  { label: "Automotive", color: "rgb(var(--brand-secondary))" },
  { label: "Food & Fresh", color: "rgb(var(--color-success))" },
];

export function SideNav({ lang = "en" }: { lang: string }) {
  const pathname = usePathname();
  const unreadCount = useInboxUnreadCount();
  const user = useAuthStore((s) => s.user);

  if (
    pathname.includes("/upload/create") ||
    pathname.includes("/upload/tiktok")
  ) {
    return null;
  }

  const displayName =
    user?.profile?.firstName ||
    user?.email?.split("@")[0] ||
    (user ? "Seller" : "Guest");
  const handle = user?.email ?? "Sign in to sell";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S";

  return (
    <aside
      className="fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-default bg-elevated md:flex"
      style={{ width: "var(--side-nav-width, 220px)" }}
    >
      <div className="flex shrink-0 items-center px-5 pb-4 pt-5">
        <Link href={`/${lang}/feed`} scroll={false}>
          <Logo variant="lockup" size={32} />
        </Link>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {tabs.map((tab) => {
          const href = `/${lang}/${tab.path}`;
          const isActive =
            tab.key === "feed"
              ? pathname === `/${lang}` || pathname.startsWith(`/${lang}/feed`)
              : pathname.startsWith(`/${lang}/${tab.path}`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.key}
              href={href}
              scroll={false}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all",
                isActive
                  ? "bg-primary text-white shadow-[0_14px_34px_rgb(var(--brand-primary)/0.32)]"
                  : "text-muted hover:bg-surface hover:text-default",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
              <span>{tab.label}</span>
              {tab.key === "notifications" && unreadCount > 0 ? (
                <span
                  className={[
                    "ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                    isActive ? "bg-white text-primary" : "bg-primary text-white",
                  ].join(" ")}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 px-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
          Browse
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {browse.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-xs font-medium text-muted"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-3 p-3">
        <div className="flex items-center gap-3 rounded-xl border border-default bg-surface px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-black text-default">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-default">
              {displayName}
            </p>
            <p className="truncate text-xs leading-tight text-muted">{handle}</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

function ThemeToggle() {
  const isDark = useSyncExternalStore(
    (cb) => {
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => null,
  );

  function toggle() {
    const html = document.documentElement;
    const next = !html.classList.contains("dark");
    html.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  }

  if (isDark === null) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 opacity-0"
        aria-hidden="true"
      />
    );
  }

  const Icon = isDark ? Sun : Moon;

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-default"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {isDark ? "Light mode" : "Dark mode"}
      </span>
      <span
        className={[
          "relative h-5 w-9 rounded-full border border-default bg-surface",
          "after:absolute after:top-0.5 after:h-3.5 after:w-3.5 after:rounded-full after:bg-primary after:transition-transform",
          isDark ? "after:translate-x-4" : "after:translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
