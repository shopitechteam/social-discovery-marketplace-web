"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FeedHeader } from "./FeedHeader";
import FeedGrid from "./FeedGrid";
import { FollowingGrid } from "./FollowingGrid";
import { NearbyGrid } from "./NearbyGrid";
import DesktopFeed from "./DesktopFeed";

interface Props {
  lang: string;
  visible?: boolean;
}

type Tab = "for-you" | "following" | "nearby";

const isTab = (v: string | null): v is Tab =>
  v === "for-you" || v === "following" || v === "nearby";

/** The mobile card feed is hidden on md+ (DesktopFeed owns the window scroll
 *  there), so its save/restore must not fire on desktop viewports. */
const isMobileViewport = () =>
  typeof window !== "undefined" &&
  !window.matchMedia("(min-width: 768px)").matches;

export function FeedPage({ lang, visible = true }: Props) {
  const searchParams = useSearchParams();
  const initialParam = searchParams.get("tab");
  const initialTab: Tab = isTab(initialParam) ? initialParam : "for-you";
  const [tab, setTab] = useState<Tab>(initialTab);
  // Track which tabs have ever been opened. Nearby mounts lazily (it requests
  // geolocation on mount, which we must not do until the user opens it); once
  // opened it stays mounted so switching away/back never refetches or loses
  // scroll. For-You and Following are side-effect-free, so we mount them eagerly.
  const [openedTabs, setOpenedTabs] = useState<Set<Tab>>(
    () => new Set([initialTab]),
  );
  // The page scrolls on `window` (there's no inner scroll container), so hiding
  // the inactive feed collapses the document height and the browser loses the
  // position. We remember each tab's scrollY and restore it on return.
  const scrollByTab = useRef<Record<Tab, number>>({
    "for-you": 0,
    following: 0,
    nearby: 0,
  });
  const prevTab = useRef<Tab>(initialTab);

  // Restore the incoming tab's scroll AFTER the show/hide classes apply but
  // before paint, so there's no flash at the wrong offset. Layout effects run
  // post-DOM-mutation, by which point the restored feed has its full height back.
  useLayoutEffect(() => {
    if (prevTab.current !== tab) {
      if (isMobileViewport()) {
        window.scrollTo(0, scrollByTab.current[tab] ?? 0);
      }
      prevTab.current = tab;
    }
  }, [tab]);

  // If the user returns from auth with ?tab=following, honour it. The feed
  // stays mounted while OTHER routes are shown (MainShell), and those routes
  // use ?tab= for their own sub-tabs (e.g. /notifications?tab=notifications) —
  // so only sync when the feed route is actually visible, and only for values
  // that are real feed tabs.
  useEffect(() => {
    if (!visible) return;
    const t = searchParams.get("tab");
    if (isTab(t) && t !== tab) {
      if (isMobileViewport()) scrollByTab.current[tab] = window.scrollY;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab(t);
      setOpenedTabs((prev) => (prev.has(t) ? prev : new Set(prev).add(t)));
    }
    // only re-run when the search params change, not when tab changes internally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, visible]);

  function handleTabChange(next: Tab) {
    if (next === tab) return;
    // Remember where we are on the tab we're leaving, before it gets hidden.
    if (isMobileViewport()) scrollByTab.current[tab] = window.scrollY;
    setTab(next);
    setOpenedTabs((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
  }

  return (
    <div>
      {/* ── Desktop: fullscreen TikTok-style feed — no header/tabs needed ── */}
      <div className="hidden md:block">
        <DesktopFeed lang={lang} visible={visible} />
      </div>

      {/* ── Mobile: existing card feed with tabs ── */}
      <div className="md:hidden min-h-svh">
        <FeedHeader lang={lang} activeTab={tab} onTabChange={handleTabChange} />

        {/* Once a feed has been opened it stays mounted; we only toggle
            visibility. Conditionally rendering on `tab ===` would unmount the
            inactive feed and, on switch-back, remount a fresh Apollo observer —
            re-running the page-1 fetch and discarding both the accumulated
            window and scroll position. Keeping it mounted preserves scroll +
            pagination and makes tab switches instant. A display:none feed
            reports intersection ratio 0, so its PostCard videos never win the
            active-video election. */}
        <div className="relative bg-surface">
          <div className={tab === "for-you" ? undefined : "hidden"}>
            <FeedGrid lang={lang} active={visible && tab === "for-you"} />
          </div>

          {/* Following mounts lazily too, to avoid firing its feed query on
              page load when the user may never leave For-You. */}
          {openedTabs.has("following") ? (
            <div className={tab === "following" ? undefined : "hidden"}>
              <FollowingGrid
                lang={lang}
                active={visible && tab === "following"}
              />
            </div>
          ) : null}

          {/* Nearby mounts only after first open (it requests geolocation on
              mount), then stays mounted like the others. */}
          {openedTabs.has("nearby") ? (
            <div className={tab === "nearby" ? undefined : "hidden"}>
              <NearbyGrid lang={lang} active={visible && tab === "nearby"} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
