"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PREFIX = "shopi-scroll:";
const MAX_RESTORE_FRAMES = 45;

function scrollKey(pathname: string, search: string) {
  return `${PREFIX}${pathname}${search ? `?${search}` : ""}`;
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

export function RouteScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = useMemo(
    () => scrollKey(pathname, searchParams.toString()),
    [pathname, searchParams],
  );
  const currentKeyRef = useRef(key);
  const latestYRef = useRef(0);

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
    currentKeyRef.current = key;
    latestYRef.current = readSavedY(key);

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
      saveY(key, latestYRef.current);
    };
  }, [key]);

  useEffect(() => {
    let frame = 0;

    const remember = () => {
      latestYRef.current = window.scrollY;
      saveY(currentKeyRef.current, latestYRef.current);
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
      latestYRef.current = window.scrollY;
      saveY(currentKeyRef.current, latestYRef.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
      flush();
    };
  }, []);

  return null;
}
