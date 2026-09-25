"use client";

import type { StoriesFeedQuery } from "@/types/__generated__/graphql";

/**
 * The last story tray this browser saw, kept across reloads.
 *
 * Apollo's cache lives in memory, so every reload used to start the tray from
 * a skeleton and wait on the network. The tray is small and changes slowly,
 * so the last copy is saved here and put back into the cache before the first
 * paint: the tray appears at once, and the network answer (plus live socket
 * updates) takes over from there — stale-while-revalidate.
 *
 * Keyed to the viewer — the tray carries their own ring and what they've
 * seen — and pruned on the way out of storage, so an expired story is never
 * shown even briefly.
 */

const STORAGE_KEY = "shopi-stories-feed";
/** Older than this, a saved tray is mostly expired stories — not worth showing. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface Saved {
  viewer: string;
  savedAt: number;
  data: StoriesFeedQuery;
}

export function loadSavedStoriesFeed(viewer: string): StoriesFeedQuery | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    if (saved.viewer !== viewer || Date.now() - saved.savedAt > MAX_AGE_MS) return null;
    return withoutExpired(saved.data);
  } catch {
    return null;
  }
}

export function saveStoriesFeed(viewer: string, data: StoriesFeedQuery): void {
  try {
    const saved: Saved = { viewer, savedAt: Date.now(), data };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Quota or private mode — the tray still works, just not instantly on reload.
  }
}

/** Drop expired stories, and rings they leave empty. */
export function withoutExpired(data: StoriesFeedQuery, now = Date.now()): StoriesFeedQuery {
  const storiesFeed = data.storiesFeed
    .map((ring) => {
      const stories = ring.stories.filter((s) => Date.parse(String(s.expiresAt)) > now);
      return stories.length === ring.stories.length
        ? ring
        : {
            ...ring,
            stories,
            totalCount: stories.length,
            hasUnviewed: stories.some((s) => !s.isViewed),
          };
    })
    .filter((ring) => ring.stories.length > 0);
  return { ...data, storiesFeed };
}
