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

    const remember = () => {
      const key = currentKeyRef.current;
      const pending = pendingNavigationRef.current;
      if (pending?.fromKey === key) {
        latestYByKeyRef.current.set(key, pending.fromY);
        saveY(key, pending.fromY);
        frame = 0;
        return;
      }

      latestYRef.current = window.scrollY;
      latestYByKeyRef.current.set(key, latestYRef.current);
      saveY(key, latestYRef.current);
      frame = 0;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(remember);
    };

    const flush = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }

      const key = currentKeyRef.current;
      const pending = pendingNavigationRef.current;
      if (pending?.fromKey === key) {
        latestYByKeyRef.current.set(key, pending.fromY);
        saveY(key, pending.fromY);
        return;
      }

      latestYRef.current = window.scrollY;
      latestYByKeyRef.current.set(key, latestYRef.current);
      saveY(key, latestYRef.current);
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
