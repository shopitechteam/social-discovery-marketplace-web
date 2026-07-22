"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";

const SESSION_KEY = "shopi-pwa-splash-seen";
const MINIMUM_DISPLAY_MS = 420;
const MAXIMUM_WAIT_MS = 3000;

/**
 * A React-owned launch screen. Rendering it on the server covers the period
 * before hydration; removing it through state afterwards keeps React's DOM
 * tree in sync and avoids hydration errors.
 */
export function PwaSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // The HTML class is set before hydration (AppDocument) so a refresh does
    // not visibly flash the server-rendered splash. React still removes it
    // here, keeping DOM ownership and hydration safe.
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      const removeTimer = window.setTimeout(() => setIsVisible(false), 0);
      return () => window.clearTimeout(removeTimer);
    }

    let cancelled = false;
    let unsubscribe = () => {};
    let minimumTimer: number | undefined;
    let maximumTimer: number | undefined;
    let removeTimer: number | undefined;

    const authReady = new Promise<void>((resolve) => {
      if (useAuthStore.persist.hasHydrated()) {
        resolve();
        return;
      }
      unsubscribe = useAuthStore.persist.onFinishHydration(() => resolve());
    });
    const fontsReady = document.fonts?.ready?.then(() => undefined).catch(() => undefined)
      ?? Promise.resolve();
    const minimumDisplay = new Promise<void>((resolve) => {
      minimumTimer = window.setTimeout(resolve, MINIMUM_DISPLAY_MS);
    });
    const maximumWait = new Promise<void>((resolve) => {
      maximumTimer = window.setTimeout(resolve, MAXIMUM_WAIT_MS);
    });

    void Promise.race([
      Promise.all([authReady, fontsReady, minimumDisplay]),
      maximumWait,
    ]).then(() => {
      unsubscribe();
      if (cancelled) return;

      sessionStorage.setItem(SESSION_KEY, "true");
      document.documentElement.classList.add("shopi-pwa-splash-seen");
      setIsClosing(true);
      removeTimer = window.setTimeout(() => setIsVisible(false), 220);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (minimumTimer) window.clearTimeout(minimumTimer);
      if (maximumTimer) window.clearTimeout(maximumTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="shopi-pwa-splash"
      className={isClosing ? "shopi-splash--ready" : undefined}
      role="status"
      aria-label="Opening Shopi"
    >
      <div className="shopi-splash__glow" />
      <div className="shopi-splash__content">
        {/* A plain image is intentional: this is the first paint, before the
            Next image runtime has hydrated, and the icon is already local. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="shopi-splash__logo"
          src="/assets/shopi-logo.png"
          width="112"
          height="112"
          alt=""
        />
        <p className="shopi-splash__name">Shopi</p>
        <p className="shopi-splash__tagline">Discover what&apos;s nearby</p>
        <span className="shopi-splash__loader" aria-hidden="true" />
      </div>
    </div>
  );
}
