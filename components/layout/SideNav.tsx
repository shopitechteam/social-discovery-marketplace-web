"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  LogOut,
  MessageCircle,
  Moon,
  Search,
  Sun,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FOOTER_LINKS = ["Blog", "Careers", "FAQ", "Contact"];

export function SideNav({ lang = "en" }: { lang: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop({ ssrDefault: false });
  const { user } = useAuthSession();
  const unreadCount = useInboxUnreadCount();

  if (
    pathname.includes("/upload/create") ||
    pathname.includes("/upload/tiktok")
  ) {
    return null;
  }

  const displayName =
    user?.profile?.firstName ||
    user?.email?.split("@")[0] ||
    (user ? "Seller" : "shopisho");
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S";
  const homeActive =
    pathname === `/${lang}` || pathname.startsWith(`/${lang}/feed`);
  const isFeedRoute =
    pathname === `/${lang}` || pathname.startsWith(`/${lang}/feed`);
  const browseActive =
    pathname.startsWith(`/${lang}/explore`) ||
    pathname.startsWith(`/${lang}/search`);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 hidden h-(--desktop-top-nav-height,80px) border-b border-border bg-elevated/95 backdrop-blur md:block">
        <div className="flex h-full items-center gap-6 px-8">
          <Link
            href={`/${lang}`}
            scroll={false}
            className="flex min-w-[230px] items-center gap-2.5 text-3xl font-black tracking-normal text-main"
            aria-label="Shopi home"
          >
            <Logo size={58} />
            <span>shopi</span>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-bold">
            <TopNavLink href={`/${lang}/feed`} active={homeActive}>
              For You
            </TopNavLink>
            <TopNavLink href={`/${lang}/explore`} active={browseActive}>
              Browse
            </TopNavLink>
          </nav>

          <Link
            href={`/${lang}/search`}
            scroll={false}
            className="flex h-10 min-w-[280px] flex-1 items-center gap-3 rounded-full border border-border bg-surface px-5 text-sm font-medium text-muted shadow-inner shadow-black/[0.02] transition-colors hover:border-border-strong hover:text-default"
          >
            <Search className="h-5 w-5 shrink-0" />
            <span className="truncate">Search Shopi</span>
          </Link>

          {!isFeedRoute ? (
            <Link
              href={`/${lang}/upload`}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-surface px-5 text-sm font-black text-main transition-colors hover:bg-subtle"
            >
              Sell item
            </Link>
          ) : null}

          <div className="flex items-center gap-1.5">
            <IconNavButton
              href={`/${lang}/notifications?tab=messages`}
              label="Messages"
              active={
                pathname.startsWith(`/${lang}/notifications`) &&
                searchParams.get("tab") === "messages"
              }
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 ? <UnreadDot count={unreadCount} /> : null}
            </IconNavButton>
            <IconNavButton
              href={`/${lang}/notifications`}
              label="Inbox"
              active={
                pathname.startsWith(`/${lang}/notifications`) &&
                searchParams.get("tab") !== "messages"
              }
            >
              <Bell className="h-5 w-5" />
            </IconNavButton>
            <IconNavButton
              href={`/${lang}/profile?tab=saved`}
              label="Saved"
              active={
                pathname.startsWith(`/${lang}/profile`) &&
                searchParams.get("tab") === "saved"
              }
            >
              <Heart className="h-5 w-5" />
            </IconNavButton>
          </div>

          {user ? (
            <AccountMenu
              lang={lang}
              displayName={displayName}
              email={user.email}
              initials={initials}
            />
          ) : (
            <Link
              href={`/${lang}/auth/login`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary-soft text-sm font-black text-primary-strong shadow-sm"
              aria-label="Sign in"
            >
              {initials.slice(0, 1)}
            </Link>
          )}
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-(--desktop-top-nav-height,80px) z-40 hidden w-(--side-nav-width,280px) flex-col border-r border-border bg-elevated px-6 py-6 md:flex">
        <div className="border-b border-border pb-4">
          <h2 className="text-base font-black tracking-normal text-main">
            Hi {displayName}!
          </h2>
        </div>

        {isDesktop ? <BrowseCategories lang={lang} /> : null}

        <div className="mt-auto space-y-6 text-xs font-medium text-muted">
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {FOOTER_LINKS.map((label) => (
              <Link
                key={label}
                href={`/${lang}/${label.toLowerCase() === "faq" ? "faq" : label.toLowerCase()}`}
                className="hover:text-default"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            <Link href={`/${lang}/privacy`} className="hover:text-default">
              Privacy
            </Link>
            <Link href={`/${lang}/terms`} className="hover:text-default">
              Terms
            </Link>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>© 2026 Shopi Inc.</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}

function TopNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={[
        "inline-flex h-10 min-w-22 items-center justify-center rounded-full px-5 text-sm transition-colors",
        active ? "bg-primary text-white" : "text-main hover:bg-surface",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

function IconNavButton({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={label}
      title={label}
      className={[
        "relative flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-main hover:bg-surface",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

function UnreadDot({ count }: { count: number }) {
  return (
    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function BrowseCategories({ lang }: { lang: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const { data } = useQuery(DISCOVERY_CATEGORIES, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  const liveCategories = (data?.discoveryFacets.categories ?? [])
    .filter((category) => category.count > 0)
    .slice(0, 8)
    .map((category) => ({ name: category.name, slug: category.slug }));
  const categories = [{ name: "For You", slug: "for-you" }, ...liveCategories];

  return (
    <nav className="mt-4 flex flex-col gap-0.5" aria-label="Browse categories">
      {categories.map((category, index) => {
        const href =
          index === 0
            ? `/${lang}/feed`
            : `/${lang}/explore?category=${encodeURIComponent(category.slug)}`;
        const active =
          index === 0
            ? pathname === `/${lang}` || pathname.startsWith(`/${lang}/feed`)
            : activeCategory === category.slug;

        return (
          <Link
            key={`${category.slug}-${index}`}
            href={href}
            scroll={false}
            className={[
              "block rounded-md py-2 text-sm font-semibold tracking-normal transition-colors",
              active
                ? "text-primary"
                : "text-muted hover:text-main dark:hover:text-foreground",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountMenu({
  lang,
  displayName,
  email,
  initials,
}: {
  lang: string;
  displayName: string;
  email?: string | null;
  initials: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { logout, loading } = useLogout(lang);

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary-soft text-sm font-black text-primary-strong shadow-sm transition-colors hover:bg-primary/15"
            aria-label="Open account menu"
          >
            {initials.slice(0, 1)}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={10}
          className="w-72 rounded-2xl border border-border bg-elevated p-2 shadow-xl"
        >
          <div className="px-3 py-3">
            <p className="truncate text-sm font-black text-main">
              {displayName}
            </p>
            {email ? (
              <p className="mt-0.5 truncate text-xs text-muted">{email}</p>
            ) : null}
          </div>
          <div className="border-t border-border py-1">
            <Link
              href={`/${lang}/profile`}
              scroll={false}
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-main transition-colors hover:bg-surface"
            >
              View profile
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-error transition-colors hover:bg-error/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-border bg-elevated p-0 shadow-2xl">
          <DialogHeader className="px-6 pb-2 pt-6 text-left">
            <DialogTitle className="text-lg font-black text-main">
              Sign out?
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-muted">
              You&apos;ll need to sign in again to post items, message buyers,
              or manage your profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 border-t border-border px-6 py-4 sm:space-x-0">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="h-10 rounded-full border border-border px-5 text-sm font-bold text-main transition-colors hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={logout}
              disabled={loading}
              className="h-10 rounded-full bg-primary px-5 text-sm font-bold text-white transition-opacity disabled:opacity-60"
            >
              {loading ? "Signing out..." : "Sign out"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span aria-hidden className="h-6 w-12" />;

  const isDark = resolvedTheme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <label className="flex items-center gap-2" title="Toggle theme">
      <Icon className="h-4 w-4" />
      <Switch
        checked={isDark}
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
      />
    </label>
  );
}
