"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FeedHeader } from "./FeedHeader";
import FeedGrid from "./FeedGrid";
import { FeedSkeleton } from "./FeedSkeleton";

const FollowingGrid = dynamic(() =>
  import("./FollowingGrid").then((mod) => mod.FollowingGrid),
);
const NearbyGrid = dynamic(() =>
  import("./NearbyGrid").then((mod) => mod.NearbyGrid),
);
const AskShopiGrid = dynamic(() =>
  import("./AskShopiGrid").then((mod) => mod.AskShopiGrid),
);
const DesktopFeed = dynamic(() => import("./DesktopFeed"), {
  // Show the desktop-shaped skeleton while the chunk downloads, so the
  // dashboard frame (tabs, column, right rail) is stable from the first paint.
  loading: () => <FeedSkeleton />,
});

interface Props {
  lang: string;
  visible?: boolean;
}

type Tab = "for-you" | "following" | "nearby" | "ask-shopi";

const isTab = (v: string | null): v is Tab =>
  v === "for-you" || v === "following" || v === "nearby" || v === "ask-shopi";

/** The mobile card feed is hidden on md+ (DesktopFeed owns the window scroll
 *  there), so its save/restore must not fire on desktop viewports. */
const isMobileViewport = () =>
  typeof window !== "undefined" &&
  !window.matchMedia("(min-width: 768px)").matches;

export function FeedPage({ lang, visible = true }: Props) {
  const searchParams = useSearchParams();
  // Only mount the feed tree that can actually be displayed. CSS-hidden client
  // components still execute, query, observe layout, and download all of their
  // dependencies; mounting both variants made mobile load the desktop Mux/HLS
  // and chat bundles as well as a duplicate set of PostCards.
  //
  // The server snapshot stays mobile-first so the PageSpeed/Lighthouse viewport
  // receives useful HTML immediately. Desktop swaps to its dedicated tree just
  // after hydration and gets a lightweight reserved-height fallback meanwhile.
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const syncViewport = () => setDesktop(media.matches);
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  const initialParam = searchParams.get("tab");
  const initialTab: Tab = isTab(initialParam) ? initialParam : "for-you";
  const [tab, setTab] = useState<Tab>(initialTab);
  // Track which tabs have ever been opened. Nearby mounts lazily (it requests
  // geolocation on mount, which we must not do until the user opens it); once
  // opened it stays mounted so switching away/back never refetches or loses
  // scroll. Only the initial tab mounts eagerly; the others load on first use.
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
    "ask-shopi": 0,
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
      {/* ── Desktop: loaded only on a desktop viewport. Until the media query
          resolves, desktop viewports see the desktop-shaped skeleton (inside
          `hidden md:block` so it never shows on phones) instead of a blank
          reserved area. ── */}
      {desktop ? (
        <DesktopFeed lang={lang} visible={visible} />
      ) : (
        <div className="hidden md:block" aria-hidden>
          <FeedSkeleton />
        </div>
      )}

      {/* ── Mobile: existing card feed with tabs ── */}
      {!desktop ? (
        <div className="md:hidden min-h-svh">
          <FeedHeader
            activeTab={tab}
            onTabChange={handleTabChange}
          />

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

            {/* Ask Shopi — conversational buyer search. Mounts on first open. */}
            {openedTabs.has("ask-shopi") ? (
              <div className={tab === "ask-shopi" ? undefined : "hidden"}>
                <AskShopiGrid lang={lang} active={visible && tab === "ask-shopi"} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
