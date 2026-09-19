"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { useInboxUnreadCount } from "@/features/messaging/hooks/useUnreadCount";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { DISCOVERY_CATEGORIES } from "@/features/discover/categories";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useDiscoverFiltersStore } from "@/stores/discoverFilters";
import { useSearchStore } from "@/stores/search";
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
      <header className="fixed left-0 right-0 top-0 z-50 hidden h-(--desktop-top-nav-height,68px) border-b border-border bg-elevated/95 backdrop-blur md:block">
        <div className="flex h-full items-center">
          {/* The logo sits in its own column, the same width and padding as the
              side rail below it (w-(--side-nav-width) px-6), so it lines up
              over "Hi {name}!" and everything after it begins exactly on the
              main content's left edge — MainShell offsets that content by the
              same variable. A plain shrink-0 logo left the nav starting at
              whatever the wordmark happened to measure, which is what put it
              out of line with the column below. */}
          <Link
            href={`/${lang}`}
            scroll={false}
            className="flex h-full w-(--side-nav-width,280px) shrink-0 items-center px-6"
            aria-label="Shopi home"
          >
            {/* The full lockup, so the wordmark is the real artwork rather than
                live text set beside the badge.

                The artwork is 358 x 98.06 and its badge is 96 of that height,
                so `size` 60 paints the box 43px tall — a 42px badge, the same
                as the mark-only logo had here — and 157px wide, well inside the
                232px this column leaves after its padding. */}
            <Logo variant="lockup" size={60} />
          </Link>

          {/* Everything right of the logo column. The gap and the right padding
              live here rather than on the row, so no gap is inserted before
              this group and it starts flush on the 280px column edge. */}
          <div className="flex h-full min-w-0 flex-1 items-center gap-5 pr-6">
            <nav className="flex shrink-0 items-center gap-1 text-[13px] font-bold">
              <TopNavLink href={`/${lang}/feed`} active={homeActive}>
                For You
              </TopNavLink>
              <TopNavLink href={`/${lang}/explore`} active={browseActive}>
                Browse
              </TopNavLink>
            </nav>

            {/* The wrapper keeps the flex-1 slot at every width even though the
              field itself only appears at lg. Below lg DiscoverPage renders its
              own sticky search bar, so showing this one too would put two
              search boxes on /explore and /search — the thing it replaced. The
              slot still has to grow, or the whole right-hand cluster collapses
              back against the Browse link. */}
            <div className="flex min-w-0 flex-1 items-center">
              <NavSearch lang={lang} className="hidden w-full lg:flex" />
            </div>

            {!isFeedRoute ? (
              <Link
                href={`/${lang}/upload`}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-surface px-4 text-[13px] font-bold text-main transition-colors hover:bg-subtle"
              >
                Sell item
              </Link>
            ) : null}

            <div className="flex items-center gap-0.5">
              <IconNavButton
                href={`/${lang}/notifications?tab=messages`}
                label="Messages"
                active={
                  pathname.startsWith(`/${lang}/notifications`) &&
                  searchParams.get("tab") === "messages"
                }
              >
                <MessageCircle className="h-4.5 w-4.5" />
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
                <Bell className="h-4.5 w-4.5" />
              </IconNavButton>
              <IconNavButton
                href={`/${lang}/profile?tab=saved`}
                label="Saved"
                active={
                  pathname.startsWith(`/${lang}/profile`) &&
                  searchParams.get("tab") === "saved"
                }
              >
                <Heart className="h-4.5 w-4.5" />
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary-soft text-[13px] font-black text-primary-strong shadow-sm"
                aria-label="Sign in"
              >
                {initials.slice(0, 1)}
              </Link>
            )}
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-(--desktop-top-nav-height,68px) z-40 hidden w-(--side-nav-width,280px) flex-col border-r border-border bg-elevated px-6 py-6 md:flex">
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

/**
 * The app's one desktop search box. On /explore and /search it is a live
 * control: it writes straight into the shared draft (stores/search.ts) that
 * DiscoverPage debounces into a query, so typing filters results in place,
 * exactly as the in-page box it replaced did.
 *
 * Everywhere else nothing is listening to that draft, so submitting navigates
 * to /search?q=… and DiscoverPage seeds itself from the param on mount.
 */
function NavSearch({ lang, className }: { lang: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const draft = useSearchStore((s) => s.draft);
  const setDraft = useSearchStore((s) => s.setDraft);

  const isDiscoverRoute =
    pathname.startsWith(`/${lang}/explore`) ||
    pathname.startsWith(`/${lang}/search`);

  // Leaving the discover pages drops the term, so the box is not still holding
  // last visit's search when it reappears over the feed. On the discover pages
  // DiscoverPage owns the seeding instead, including from a ?q= deep link.
  useEffect(() => {
    if (!isDiscoverRoute) setDraft("");
  }, [isDiscoverRoute, setDraft]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const term = draft.trim();
    // On a discover route the store already filtered as they typed, so there is
    // nothing left to do and navigating would only throw away scroll position.
    if (isDiscoverRoute) return;
    router.push(
      term
        ? `/${lang}/search?q=${encodeURIComponent(term)}`
        : `/${lang}/search`,
    );
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={[
        // Hairline border over the nav's own surface rather than a grey fill,
        // so it reads as an outline rather than a well. No inset shadow, for
        // the same reason. Height is a touch over the reference's ~34px.
        "h-9.5 min-w-0 items-center gap-2.5 rounded-full border border-border bg-transparent px-4 transition-colors focus-within:border-border-strong hover:border-border-strong",
        className ?? "flex",
      ].join(" ")}
    >
      <Search className="h-4.25 w-4.25 shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search anything on Shopi"
        aria-label="Search Shopi"
        // Safari paints its own clear affordance on type=search, which would
        // sit next to ours.
        className="min-w-0 flex-1 bg-transparent placeholder:text-xs text-sm font-medium text-default outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none"
      />
      {draft ? (
        <button
          type="button"
          onClick={() => setDraft("")}
          className="shrink-0 text-muted transition-colors hover:text-default"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </form>
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
        "inline-flex h-8 min-w-20 items-center justify-center rounded-full px-4 transition-colors",
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
        "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        active ? "bg-primary/10 text-primary" : "text-main hover:bg-surface",
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
  const isDiscoverRoute =
    pathname.startsWith(`/${lang}/explore`) ||
    pathname.startsWith(`/${lang}/search`);
  const activeCategory = searchParams.get("category");
  const { data } = useQuery(DISCOVERY_CATEGORIES, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  const liveCategories = (data?.discoveryFacets.categories ?? [])
    .filter((category) => category.count > 0)
    .slice(0, 8)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
  const categories = [{ name: "For You", slug: "for-you" }, ...liveCategories];

  return (
    <div className="mt-4 min-h-0 overflow-y-auto pr-1">
      <nav className="flex flex-col gap-0.5" aria-label="Browse categories">
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

      {isDiscoverRoute ? <DiscoverSidebarFilters /> : null}
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "RELEVANCE", label: "Best match" },
  { value: "NEWEST", label: "Newest" },
  { value: "PRICE_LOW_TO_HIGH", label: "Price: low to high" },
  { value: "PRICE_HIGH_TO_LOW", label: "Price: high to low" },
] as const;

function DiscoverSidebarFilters() {
  const selectedCategory = useDiscoverFiltersStore((s) => s.selectedCategory);
  const selectedSubcategory = useDiscoverFiltersStore(
    (s) => s.selectedSubcategory,
  );
  const selectedCounty = useDiscoverFiltersStore((s) => s.selectedCounty);
  const selectedSubCounty = useDiscoverFiltersStore((s) => s.selectedSubCounty);
  const selectedWard = useDiscoverFiltersStore((s) => s.selectedWard);
  const sort = useDiscoverFiltersStore((s) => s.sort);
  const minPrice = useDiscoverFiltersStore((s) => s.minPrice);
  const maxPrice = useDiscoverFiltersStore((s) => s.maxPrice);
  const negotiableOnly = useDiscoverFiltersStore((s) => s.negotiableOnly);
  const subcategories = useDiscoverFiltersStore((s) => s.subcategories);
  const setSelectedSubcategory = useDiscoverFiltersStore(
    (s) => s.setSelectedSubcategory,
  );
  const setSort = useDiscoverFiltersStore((s) => s.setSort);
  const setMinPrice = useDiscoverFiltersStore((s) => s.setMinPrice);
  const setMaxPrice = useDiscoverFiltersStore((s) => s.setMaxPrice);
  const setNegotiableOnly = useDiscoverFiltersStore(
    (s) => s.setNegotiableOnly,
  );
  const openLocationPicker = useDiscoverFiltersStore(
    (s) => s.openLocationPicker,
  );
  const clearLocation = useDiscoverFiltersStore((s) => s.clearLocation);
  const clearAll = useDiscoverFiltersStore((s) => s.clearAll);

  const locationLabel =
    selectedWard?.name ??
    selectedSubCounty?.name ??
    selectedCounty?.name ??
    "All Kenya";
  const hasActiveFilters = Boolean(
    selectedCategory ||
      selectedSubcategory ||
      selectedCounty ||
      selectedSubCounty ||
      selectedWard ||
      minPrice ||
      maxPrice ||
      negotiableOnly ||
      sort !== "RELEVANCE",
  );

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wide text-main">
          Filters
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-bold text-primary hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="divide-y divide-border">
        <details open className="group py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-main">
            Location
            <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={openLocationPicker}
              className="flex w-full items-center justify-between rounded-lg border border-border px-2.5 py-2 text-left text-xs font-semibold text-main transition-colors hover:bg-surface"
            >
              <span className="truncate">{locationLabel}</span>
              <MapPin className="h-4 w-4 shrink-0 text-muted" />
            </button>
            {locationLabel !== "All Kenya" ? (
              <button
                type="button"
                onClick={clearLocation}
                className="text-xs font-semibold text-muted hover:text-main"
              >
                Clear location
              </button>
            ) : null}
          </div>
        </details>

        <details open className="group py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-main">
            Sort by
            <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 space-y-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSort(option.value)}
                className={[
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  sort === option.value
                    ? "bg-primary/10 font-black text-primary"
                    : "font-semibold text-muted hover:bg-surface hover:text-main",
                ].join(" ")}
              >
                {option.label}
                {sort === option.value ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            ))}
          </div>
        </details>

        {selectedCategory && subcategories.length > 0 ? (
          <details open className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-main">
              Product types
              <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => setSelectedSubcategory(null)}
                className={[
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  !selectedSubcategory
                    ? "bg-primary/10 font-black text-primary"
                    : "font-semibold text-muted hover:bg-surface hover:text-main",
                ].join(" ")}
              >
                All
                {!selectedSubcategory ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
              {subcategories.slice(0, 10).map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    setSelectedSubcategory(
                      selectedSubcategory === item.name ? null : item.name,
                    )
                  }
                  className={[
                    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                    selectedSubcategory === item.name
                      ? "bg-primary/10 font-black text-primary"
                      : "font-semibold text-muted hover:bg-surface hover:text-main",
                  ].join(" ")}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="shrink-0 text-[11px] text-muted">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </details>
        ) : null}

        <details className="group py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-main">
            Price
            <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Min"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="h-9 min-w-0 rounded-lg border border-border bg-transparent px-2 text-xs font-semibold outline-none focus:border-primary"
            />
            <input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Max"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="h-9 min-w-0 rounded-lg border border-border bg-transparent px-2 text-xs font-semibold outline-none focus:border-primary"
            />
          </div>
        </details>

        <details className="group py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-main">
            Listing options
            <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <label className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold text-main">
            Negotiable only
            <Switch
              checked={negotiableOnly}
              onCheckedChange={setNegotiableOnly}
              aria-label="Toggle negotiable only"
            />
          </label>
        </details>
      </div>
    </div>
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary-soft text-[13px] font-black text-primary-strong shadow-sm transition-colors hover:bg-primary/15"
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
