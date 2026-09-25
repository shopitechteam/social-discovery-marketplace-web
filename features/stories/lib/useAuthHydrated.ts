"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/stores/auth";

/**
 * Auth lives in localStorage, which the server can't read. Holding story
 * queries until the store has hydrated means the server HTML and the first
 * client render agree, and the one request that goes out carries the viewer's
 * token — so their own ring and seen state are right from the first paint.
 */
export function useAuthHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
