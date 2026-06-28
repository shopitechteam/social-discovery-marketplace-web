"use client";

import { usePathname } from "next/navigation";
import { Suspense, useState, type ReactNode } from "react";
import { BottomNav, shouldHideBottomNav } from "@/components/layout/BottomNav";
import { RouteScrollRestoration } from "@/components/layout/RouteScrollRestoration";
import { FeedPage } from "@/features/feed/components/FeedPage";

/** True when the path is the Home feed route (any locale). */
function isFeedRoute(pathname: string) {
  return /^\/[^/]+\/feed(\/|$)/.test(pathname);
}

export function MainShell({
  children,
  lang,
}: {
  children: ReactNode;
  lang: string;
}) {
  const pathname = usePathname();
  const hideBottomNav = shouldHideBottomNav(pathname);
  const onFeed = isFeedRoute(pathname);

  // The Home feed is mounted ONCE here in the persistent layout (not in
  // feed/page.tsx) so navigating between bottom-nav tabs — Home ⇄ Explore ⇄
  // Inbox … — never unmounts it. Rebuilding it on every return would refetch
  // page 1, drop the accumulated window (e.g. 33 items across 3 pages) and lose
  // scroll. Instead it stays alive and we just toggle its visibility.
  //
  // It mounts lazily on the first visit to /feed (so the heavy PostCard tree and
  // its feed query don't load for users who land elsewhere), then persists. When
  // off the feed route it's display:none — its PostCard videos report
  // intersection ratio 0 and stop, so the cost is idle DOM, not playback.
  //
  // Scroll restoration is left to RouteScrollRestoration (per-URL, sessionStorage
  // backed): because the feed now stays mounted, its full document height is
  // already present the instant we return to /feed, so that component's restore
  // succeeds instead of racing an empty, still-fetching feed.
  // Latch: once /feed has been visited, keep the feed mounted forever. Updating
  // state during render (React's supported derived-state pattern) latches it on
  // the first feed render — no effect, so the feed is present on the very first
  // feed paint rather than a frame late.
  const [feedMounted, setFeedMounted] = useState(onFeed);
  if (onFeed && !feedMounted) setFeedMounted(true);

  return (
    <>
      {/* Wrapped in Suspense: RouteScrollRestoration reads useSearchParams(),
          which otherwise opts the whole route into a client-render bail and can
          thrash dynamic routes (e.g. /content/[id]) — remounting the page and
          reflashing its skeleton. The boundary contains that de-opt here. */}
      <Suspense fallback={null}>
        <RouteScrollRestoration />
      </Suspense>

      <div
        className={[
          "flex min-h-svh flex-col bg-app",
          "mx-auto max-w-107.5",
          "md:mx-0 md:ml-60 md:max-w-none",
        ].join(" ")}
      >
        <main
          className="flex-1"
          style={{
            paddingBottom: hideBottomNav
              ? 0
              : "calc(var(--nav-height, 0px) + var(--safe-bottom, 0px))",
          }}
        >
          {/* Persistent Home feed — hidden (not unmounted) when off /feed.
              Wrapped in Suspense because FeedPage reads useSearchParams(): on a
              client-render bail that boundary keeps FeedPage (and its mounted
              feed window) alive instead of blanking/remounting it. */}
          {feedMounted ? (
            <div className={onFeed ? undefined : "hidden"}>
              <Suspense fallback={null}>
                <FeedPage lang={lang} visible={onFeed} />
              </Suspense>
            </div>
          ) : null}

          {/* Route content. On /feed this is the lightweight marker page, so
              the feed isn't rendered twice. */}
          {onFeed ? null : children}
        </main>
      </div>

      <BottomNav lang={lang} />
    </>
  );
}
