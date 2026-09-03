"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Home,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { useInboxUnreadCount } from "@/features/messaging/hooks/useUnreadCount";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { DISCOVERY_CATEGORIES } from "@/features/discover/categories";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useThemeStore } from "@/stores/theme";
import { Logo } from "@/components/ui/Logo";
import { Switch } from "@/components/ui/switch";

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

// Own-profile subroutes — anything else under /profile/* is someone else's
// public profile ([username]) and shouldn't light up the sidenav tab.
const OWN_PROFILE_SUBPATHS = ["edit", "followers", "visitors"];

// Bullet colors cycled across the Browse categories, in this order.
const browseDots = ["bg-primary", "bg-[#38A8FF]", "bg-secondary", "bg-success"];

const MAX_BROWSE_CATEGORIES = 6;

export function SideNav({ lang = "en" }: { lang: string }) {
  const pathname = usePathname();
  // The aside itself is server-rendered so the desktop frame is stable from the
  // first paint. Data widgets (unread badge, categories) are gated on the
  // desktop media query so a CSS-hidden sidenav on phones never fires queries.
  const isDesktop = useIsDesktop({ ssrDefault: false });
  // Hydration-safe user — SSR and first client paint show the guest card, the
  // real identity swaps in right after the auth store rehydrates.
  const { user } = useAuthSession();

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
      className="fixed left-0 top-0 z-40 hidden h-full w-(--side-nav-width,220px) flex-col border-r border-default bg-elevated md:flex"
    >
      <div className="flex shrink-0 items-center px-5 pb-4 pt-5">
        <Link href={`/${lang}`} scroll={false}>
          <Logo size={60} />
        </Link>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {tabs.map((tab) => {
          const href = `/${lang}/${tab.path}`;
          const isActive =
            tab.key === "feed"
              ? pathname === `/${lang}` || pathname.startsWith(`/${lang}/feed`)
              : tab.key === "profile"
                ? pathname === `/${lang}/profile` ||
                  OWN_PROFILE_SUBPATHS.some((p) =>
                    pathname.startsWith(`/${lang}/profile/${p}`),
                  )
                : tab.key === "explore"
                  ? pathname.startsWith(`/${lang}/explore`) ||
                    pathname.startsWith(`/${lang}/search`)
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
              {tab.key === "notifications" && isDesktop ? (
                <InboxUnreadBadge isActive={isActive} />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Explore has its own full category UI, so Browse is redundant there. */}
      {isDesktop &&
      !pathname.startsWith(`/${lang}/explore`) &&
      !pathname.startsWith(`/${lang}/search`) ? (
        <BrowseCategories lang={lang} />
      ) : null}

      <div className="mt-auto flex shrink-0 flex-col gap-3 p-3">
        <div className="flex items-center gap-3 rounded-xl border border-default bg-surface px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-black text-default">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight text-default">
              {displayName}
            </p>
            <p className="truncate text-xs leading-tight text-muted">{handle}</p>
          </div>
          {user ? <LogoutIconButton lang={lang} /> : null}
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}

/** Mounted only on desktop so the unread-count query and socket listeners
 *  never run while the sidenav is CSS-hidden on phones. */
function InboxUnreadBadge({ isActive }: { isActive: boolean }) {
  const unreadCount = useInboxUnreadCount();
  if (unreadCount <= 0) return null;

  return (
    <span
      className={[
        "ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold",
        isActive ? "bg-white text-primary" : "bg-primary text-white",
      ].join(" ")}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

/** Real explore categories (only those with items) — clicking one opens the
 *  explore page with that category preselected via ?category=<slug>. Shares
 *  the DISCOVERY_CATEGORIES cache entry with the explore page. */
function BrowseCategories({ lang }: { lang: string }) {
  const { data } = useQuery(DISCOVERY_CATEGORIES, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  const categories = (data?.discoveryFacets.categories ?? [])
    .filter((category) => category.count > 0)
    .slice(0, MAX_BROWSE_CATEGORIES);

  if (categories.length === 0) return null;

  return (
    <div className="mt-5 px-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
        Browse
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {categories.map((category, i) => (
          <Link
            key={category.id}
            href={`/${lang}/explore?category=${encodeURIComponent(category.slug)}`}
            scroll={false}
            className="flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-default"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${browseDots[i % browseDots.length]}`}
            />
            <span className="truncate">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function LogoutIconButton({ lang }: { lang: string }) {
  const { logout, loading } = useLogout(lang);

  return (
    <button
      onClick={logout}
      disabled={loading}
      title="Sign out"
      aria-label="Sign out"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-error disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useThemeStore();
  // Render the switch only after mount — the persisted store value isn't
  // available during SSR, so this avoids a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden className="h-9 w-full" />;
  }

  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <div className="flex h-9 w-full items-center justify-between rounded-xl px-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-default">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {isDark ? "Light mode" : "Dark mode"}
      </span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
