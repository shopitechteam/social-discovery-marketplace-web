"use client";

import { useSyncExternalStore } from "react";

/**
 * Stories this browser has opened.
 *
 * The server records views for signed-in users, but a ring has to go grey the
 * moment its last story is watched — not after a round-trip and a refetch — and
 * guests have no server-side views at all. So every opened story is also noted
 * here, and the tray treats a story as seen if either side says so.
 *
 * Each entry carries its story's expiry and is dropped once that passes, so the
 * list never holds more than a day of stories.
 */

const STORAGE_KEY = "shopi-seen-stories";

/** storyId → the story's expiry, epoch ms. */
type SeenMap = Readonly<Record<string, number>>;

const EMPTY: SeenMap = Object.freeze({});
const listeners = new Set<() => void>();
let cache: SeenMap | null = null;

function load(): SeenMap {
  if (cache) return cache;
  let stored: Record<string, unknown> = {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Private mode or corrupt JSON — start empty.
  }
  const now = Date.now();
  const live: Record<string, number> = {};
  for (const [id, expiresAt] of Object.entries(stored)) {
    if (typeof expiresAt === "number" && expiresAt > now) live[id] = expiresAt;
  }
  cache = live;
  return cache;
}

function emit() {
  for (const listener of listeners) listener();
}

export function markStorySeen(storyId: string, expiresAt: number): void {
  const current = load();
  if (current[storyId]) return;
  cache = { ...current, [storyId]: expiresAt };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Quota or private mode — still seen for this session.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab watched a story.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = null;
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSeenStories(): SeenMap {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}
