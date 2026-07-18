/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth";

/**
 * Hydration-safe view of the auth store for components that also render
 * server-side (e.g. the landing page). Auth lives in localStorage, so on the
 * server — and on the client's very first paint — we must render the guest
 * version. `isAuthenticated` only flips to true after the persisted store has
 * rehydrated, which avoids a hydration mismatch.
 */
export function useAuthSession() {
  const [hydrated, setHydrated] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return {
    hydrated,
    isAuthenticated: hydrated && !!accessToken,
    user: hydrated ? user : null,
  };
}
