"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  MessageCircle,
  Plus,
  Search,
  User,
  type LucideIcon,
} from "lucide-react";
import { useInboxUnreadCount } from "@/features/messaging/hooks/useUnreadCount";
import { useUiStore } from "@/stores/ui";

type Tab = {
  key: string;
  path: string; // without leading slash, e.g. "feed"
  label: string;
  icon: LucideIcon;
};

/**
 * Icon set is deliberately uniform: one weight, one size, outline only, round
 * joins. Mixing a boxy tray with a hairline house is what made the old bar look
 * assembled rather than drawn. `MessageCircle` also matches what the Inbox tab
 * actually opens on — its Messages subtab.
 */
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
    icon: MessageCircle,
  },
  {
    key: "profile",
    path: "profile",
    label: "Profile",
    icon: User,
  },
];

/** One size and one weight for every tab icon — active differs by colour. */
const ICON_SIZE = 25;
const STROKE_INACTIVE = 1.85;
const STROKE_ACTIVE = 2.15;

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
  // Screens that own the full viewport (e.g. the create-mode chooser) set this
  // to hide the nav WITHOUT unmounting it — a class toggle, so there's no
  // remount flash when they appear or leave.
  const bottomNavHidden = useUiStore((s) => s.bottomNavHidden);

  // Hide on the full create flow, content detail, creator profile, and chat detail pages
  if (shouldHideBottomNav(pathname)) return null;

  return (
    <nav
      className={`bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 md:hidden pb-(--safe-bottom) bg-[rgb(var(--color-bg-elevated)/0.92)] backdrop-blur-[16px] backdrop-saturate-[1.8] ${
        bottomNavHidden ? "hidden" : ""
      }`}
    >
      <div className="relative flex h-(--nav-height) items-center justify-between border-t border-border">
        {tabs.map((tab) => {
          const href = `/${lang}/${tab.path}`;
          const Icon = tab.icon;

          // Center Post button — one flat brand-coloured squircle. It used to
          // carry a two-stop gradient and a 16px coloured glow, which is what
          // made the bar read as decorated rather than clean. A solid block of
          // the brand colour is louder than the glow ever was, because nothing
          // around it competes.
          if (tab.key === "upload") {
            return (
              <Link
                key={tab.key}
                href={href}
                className="flex h-9.5 w-14 shrink-0 items-center justify-center rounded-[13px] text-white [-webkit-tap-highlight-color:transparent] active:opacity-90"
                style={{ backgroundColor: "rgb(var(--brand-primary))" }}
                aria-label="Create post"
              >
                <Icon size={21} strokeWidth={2.6} />
              </Link>
            );
          }

          // Active if the pathname segment after lang matches this tab's path
          const isActive =
            tab.key === "feed"
              ? pathname === `/${lang}` ||
                pathname.startsWith(`/${lang}/feed`) ||
                pathname.startsWith(`/${lang}/collections/`)
              : tab.key === "explore"
                ? pathname.startsWith(`/${lang}/explore`) ||
                  pathname.startsWith(`/${lang}/search`)
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
                {/* Outline only. The old active state filled the glyph at 18%
                    opacity, which turned a crisp icon into a smudge — colour
                    and the label weight already say which tab you're on. */}
                <Icon
                  size={ICON_SIZE}
                  strokeWidth={isActive ? STROKE_ACTIVE : STROKE_INACTIVE}
                  fill="none"
                />
                {tab.key === "notifications" && unreadCount > 0 ? (
                  <span
                    className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-elevated bg-primary px-[3px] text-[9px] font-bold leading-none text-white"
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
