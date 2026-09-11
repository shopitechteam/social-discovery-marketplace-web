"use client";

import {
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PREFIX = "shopi-scroll:";
const MAX_RESTORE_FRAMES = 45;
/** How often a scroll in progress is allowed to reach sessionStorage. */
const SCROLL_SAVE_INTERVAL_MS = 200;

type PendingNavigation = {
  fromKey: string;
  fromY: number;
};

function scrollKey(pathname: string, search: string) {
  // `tab` switches an in-page view whose scroll the page itself remembers
  // per-tab (FeedPage / DesktopFeed). Keying on it would make this component
  // fight that logic: the scroll-to-top of a tab switch gets saved under the
  // previous tab's URL and then stomps the page's own restore.
  const params = new URLSearchParams(search);
  params.delete("tab");
  const s = params.toString();
  return `${PREFIX}${pathname}${s ? `?${s}` : ""}`;
}

function readSavedY(key: string) {
  const value = sessionStorage.getItem(key);
  if (!value) return 0;

  const y = Number(value);
  return Number.isFinite(y) && y > 0 ? y : 0;
}

function saveY(key: string, y: number) {
  sessionStorage.setItem(key, String(Math.max(0, Math.round(y))));
}

function currentWindowScrollKey() {
  return scrollKey(window.location.pathname, window.location.search);
}

export function rememberScrollBeforeNavigation() {
  if (typeof window === "undefined") return;

  const key = currentWindowScrollKey();
  saveY(key, window.scrollY);
  window.dispatchEvent(
    new CustomEvent<PendingNavigation>("shopi:navigation-start", {
      detail: { fromKey: key, fromY: window.scrollY },
    }),
  );
}

export function RouteScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = useMemo(
    () => scrollKey(pathname, searchParams.toString()),
    [pathname, searchParams],
  );
  const currentKeyRef = useRef(key);
  const latestYRef = useRef(0);
  const latestYByKeyRef = useRef(new Map<string, number>());
  const pendingNavigationRef = useRef<PendingNavigation | null>(null);

  useInsertionEffect(() => {
    // Route commits can synchronously change document height. If a short route
    // like /profile clamps scroll before layout effects run, any scroll event
    // should belong to the incoming route, not overwrite /feed's saved position.
    currentKeyRef.current = key;
  }, [key]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";

      return () => {
        window.history.scrollRestoration = previous;
      };
    }
  }, []);

  useLayoutEffect(() => {
    const latestYByKey = latestYByKeyRef.current;
    const pending = pendingNavigationRef.current;
    if (pending && pending.fromKey !== key) {
      latestYByKey.set(pending.fromKey, pending.fromY);
      saveY(pending.fromKey, pending.fromY);
      pendingNavigationRef.current = null;
    }

    currentKeyRef.current = key;
    latestYRef.current = readSavedY(key);
    latestYByKey.set(key, latestYRef.current);

    const targetY = latestYRef.current;
    let frame = 0;
    let attempts = 0;

    const restore = () => {
      const maxY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      if (targetY === 0 || maxY >= targetY || attempts >= MAX_RESTORE_FRAMES) {
        window.scrollTo({
          top: Math.min(targetY, maxY),
          behavior: "instant" as ScrollBehavior,
        });
        return;
      }

      attempts += 1;
      frame = requestAnimationFrame(restore);
    };

    restore();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      saveY(key, latestYByKey.get(key) ?? latestYRef.current);
    };
  }, [key]);

  useEffect(() => {
    let frame = 0;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let lastSavedAt = 0;

    const writeNow = (key: string, y: number) => {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = undefined;
      }
      lastSavedAt = Date.now();
      saveY(key, y);
    };

    // sessionStorage.setItem is synchronous, and this used to run once per
    // animation frame for the whole length of a scroll. The in-memory refs are
    // what every reader here actually consults, so they keep updating per
    // frame; only the storage write is throttled. The trailing timer means the
    // resting position still lands when a scroll simply stops — nothing has to
    // navigate or hide the page for the last value to be persisted.
    const scheduleSave = (key: string, y: number) => {
      const elapsed = Date.now() - lastSavedAt;
      if (elapsed >= SCROLL_SAVE_INTERVAL_MS) {
        writeNow(key, y);
        return;
      }
      if (saveTimer) return;
      saveTimer = setTimeout(() => {
        saveTimer = undefined;
        lastSavedAt = Date.now();
        saveY(key, latestYByKeyRef.current.get(key) ?? y);
      }, SCROLL_SAVE_INTERVAL_MS - elapsed);
    };

    const remember = () => {
      frame = 0;

      const key = currentKeyRef.current;
      const pending = pendingNavigationRef.current;
      if (pending?.fromKey === key) {
        latestYByKeyRef.current.set(key, pending.fromY);
        scheduleSave(key, pending.fromY);
        return;
      }

      latestYRef.current = window.scrollY;
      latestYByKeyRef.current.set(key, latestYRef.current);
      scheduleSave(key, latestYRef.current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(remember);
    };

    // Leaving the page is the one moment the value MUST already be in storage,
    // so this bypasses the throttle rather than scheduling.
    const flush = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }

      const key = currentKeyRef.current;
      const pending = pendingNavigationRef.current;
      if (pending?.fromKey === key) {
        latestYByKeyRef.current.set(key, pending.fromY);
        writeNow(key, pending.fromY);
        return;
      }

      latestYRef.current = window.scrollY;
      latestYByKeyRef.current.set(key, latestYRef.current);
      writeNow(key, latestYRef.current);
    };

    const onNavigationStart = (event: Event) => {
      const detail = (event as CustomEvent<PendingNavigation>).detail;
      if (!detail?.fromKey) return;
      pendingNavigationRef.current = detail;
      latestYByKeyRef.current.set(detail.fromKey, detail.fromY);
      saveY(detail.fromKey, detail.fromY);
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      rememberScrollBeforeNavigation();
    };

    window.addEventListener("shopi:navigation-start", onNavigationStart);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flush);
    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener("visibilitychange", flush);

    return () => {
      window.removeEventListener("shopi:navigation-start", onNavigationStart);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("click", onDocumentClick, true);
      document.removeEventListener("visibilitychange", flush);
      flush();
    };
  }, []);

  return null;
}
