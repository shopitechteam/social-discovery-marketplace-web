"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";

const SESSION_KEY = "shopi-pwa-splash-seen";
/** Long enough for the animation to read as intentional, short enough to not annoy. */
const MINIMUM_DISPLAY_MS = 700;
/** Hard ceiling — a slow network must never trap someone on the splash. */
const MAXIMUM_WAIT_MS = 3000;
/** Matches the exit transition in globals.css. */
const EXIT_MS = 260;

/**
 * Launch screen for the installed app.
 *
 * Android paints its own splash from the manifest icon and background colour,
 * then hands over to a blank page while Next boots and the feed's first query
 * resolves. This covers exactly that gap. iOS, which paints nothing, is covered
 * from the first frame.
 *
 * Deliberately PWA-only. The previous version ran for every browser visit too,
 * which put an artificial delay in front of first-time web visitors and search
 * crawlers — the people least willing to wait. `shopi-pwa-splash-pending` is
 * stamped on <html> before first paint (see AppDocument) and the CSS keeps the
 * markup invisible without it, so a browser tab never flashes this even though
 * the element is in the server-rendered HTML.
 *
 * Shown once per session: relaunching from the home screen gets it, navigating
 * inside the app does not.
 */
export function PwaSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.matchMedia?.("(display-mode: fullscreen)").matches ||
      // iOS Safari never implemented display-mode for home-screen apps.
      (window.navigator as { standalone?: boolean }).standalone === true;

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      // Private mode can throw on access; treat it as unseen.
    }

    if (!isStandalone || seen) {
      // Nothing to show — drop the node on the next tick so React, not the
      // pre-hydration script, owns the removal.
      const t = window.setTimeout(() => setIsVisible(false), 0);
      return () => window.clearTimeout(t);
    }

    let cancelled = false;
    let unsubscribe = () => {};
    const timers: number[] = [];

    // Hold until the app can actually render something useful: the session is
    // restored (so we don't flash a logged-out feed at a logged-in user) and
    // the webfont is ready (so the first text does not swap under them).
    const authReady = new Promise<void>((resolve) => {
      if (useAuthStore.persist.hasHydrated()) return resolve();
      unsubscribe = useAuthStore.persist.onFinishHydration(() => resolve());
    });
    const fontsReady =
      document.fonts?.ready?.then(() => undefined).catch(() => undefined) ??
      Promise.resolve();
    const minimumDisplay = new Promise<void>((resolve) => {
      timers.push(window.setTimeout(resolve, MINIMUM_DISPLAY_MS));
    });
    const maximumWait = new Promise<void>((resolve) => {
      timers.push(window.setTimeout(resolve, MAXIMUM_WAIT_MS));
    });

    void Promise.race([
      Promise.all([authReady, fontsReady, minimumDisplay]),
      maximumWait,
    ]).then(() => {
      unsubscribe();
      if (cancelled) return;
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // Non-fatal: worst case the splash shows again next launch.
      }
      document.documentElement.classList.add("shopi-pwa-splash-seen");
      setIsClosing(true);
      timers.push(window.setTimeout(() => setIsVisible(false), EXIT_MS));
    });

    return () => {
      cancelled = true;
      unsubscribe();
      timers.forEach((t) => window.clearTimeout(t));
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
      <div className="shopi-splash__glow" aria-hidden="true" />

      <div className="shopi-splash__content">
        {/* A plain <img>: this is the first paint, before the Next image
            runtime hydrates, and the file is already local. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="shopi-splash__logo"
          src="/assets/shopi-logo.png"
          width="96"
          height="96"
          alt=""
        />
        <p className="shopi-splash__name">Shopi</p>
        <p className="shopi-splash__tagline">Discover what&apos;s nearby</p>

        {/* Three listing tiles rising in sequence — the feed assembling itself.
            The whole point of the animation is to say "marketplace", not
            "loading", so it is product cards rather than a spinner. */}
        <div className="shopi-splash__tiles" aria-hidden="true">
          <span className="shopi-splash__tile" />
          <span className="shopi-splash__tile" />
          <span className="shopi-splash__tile" />
        </div>
      </div>
    </div>
  );
}
