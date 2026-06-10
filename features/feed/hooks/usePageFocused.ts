"use client";

import { useSyncExternalStore } from "react";

function getSnapshot() {
  if (typeof document === "undefined") return true;
  return document.visibilityState === "visible";
}

function subscribe(onStoreChange: () => void) {
  document.addEventListener("visibilitychange", onStoreChange);

  return () => {
    document.removeEventListener("visibilitychange", onStoreChange);
  };
}

export function usePageFocused() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
