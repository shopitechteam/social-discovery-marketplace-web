"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for every visitor.
 *
 * The worker was only ever registered from inside the push-notification flow,
 * which needs a signed-in user who has granted permission. Chrome will not
 * offer the install icon until a worker with a fetch handler controls the page,
 * so installability was gated behind an account — hidden from exactly the
 * logged-out visitors most worth converting into installs.
 *
 * Registration is idempotent: the push bootstrap calls `register` with the same
 * script and scope later, and the browser hands back this same registration.
 *
 * Deliberately deferred to the load event. Registration competes with the first
 * paint's own requests, and nothing on screen depends on it.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let cancelled = false;

    const register = () => {
      if (cancelled) return;
      navigator.serviceWorker.register("/shopi-push-sw.js").catch(() => {
        // A failed registration costs the install prompt and offline page, and
        // nothing else — never surface it to the user.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
