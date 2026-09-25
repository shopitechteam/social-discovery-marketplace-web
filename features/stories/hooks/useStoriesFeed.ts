"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import {
  StoriesFeedDocument,
  type StoriesFeedQuery,
  type StoryCreatorFieldsFragment,
  type StoryFieldsFragment,
} from "@/types/__generated__/graphql";
import { useSeenStories } from "../lib/seenStories";
import { loadSavedStoriesFeed, saveStoriesFeed } from "../lib/storiesFeedCache";
import { useAuthHydrated } from "../lib/useAuthHydrated";
import { storyExpiry, useStoryActions } from "./useStoryActions";

export { storyExpiry };

export type StoryUser = StoryCreatorFieldsFragment;

export type StoryItem = StoryFieldsFragment & {
  /** Opened by this viewer — on the server, or in this browser. */
  seen: boolean;
};

export interface TrayRing {
  user: StoryUser;
  /** Oldest first — the order they play in. */
  stories: StoryItem[];
  hasUnseen: boolean;
  isOwn: boolean;
}

/** Where a ring opens: its first unseen story, or the start once all are seen. */
export function openingStoryIndex(ring: TrayRing): number {
  const i = ring.stories.findIndex((s) => !s.seen);
  return i === -1 ? 0 : i;
}

/**
 * A cached ring as this viewer sees it: live stories only, each marked seen if
 * the server or this device says so. Null once nothing in it is live.
 */
export function toTrayRing(
  ring: StoriesFeedQuery["storiesFeed"][number],
  seenLocally: Readonly<Record<string, number>>,
  viewerId: string | null,
  now: number,
): TrayRing | null {
  const stories = ring.stories
    .filter((story) => storyExpiry(story) > now)
    .map((story) => ({ ...story, seen: story.isViewed || story.id in seenLocally }));
  if (stories.length === 0) return null;
  return {
    user: ring.user,
    stories,
    hasUnseen: stories.some((s) => !s.seen),
    isOwn: !!viewerId && ring.user.id === viewerId,
  };
}

/**
 * The story tray: cached, then live.
 *
 * - First paint: the last tray this browser saw (storiesFeedCache), put into
 *   Apollo's cache before the browser paints — no skeleton for a returning
 *   visitor. The network answer replaces it moments later.
 * - After that: socket events edit the cache in place (useStoriesRealtime),
 *   and expired stories drop off at the second they expire.
 *
 * Sign-in / sign-out refetches through RefetchOnAuthChange, like every other
 * viewer-scoped query.
 */
export function useStoriesFeed() {
  const client = useApolloClient();
  const hydrated = useAuthHydrated();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const isAuthed = useAuthStore((s) => !!s.accessToken);
  const viewer = userId ?? "guest";

  // Seed the cache from the saved tray *before* the query first runs: a query
  // that has already missed the cache waits for the network and ignores later
  // cache writes. A layout effect, so the seeded tray renders before paint.
  const [seeded, setSeeded] = useState(false);
  useLayoutEffect(() => {
    if (!hydrated || seeded) return;
    if (!client.cache.readQuery({ query: StoriesFeedDocument })) {
      const saved = loadSavedStoriesFeed(viewer);
      if (saved) client.cache.writeQuery({ query: StoriesFeedDocument, data: saved });
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time gate, before paint
    setSeeded(true);
  }, [hydrated, seeded, client, viewer]);

  const { data, loading, refetch } = useQuery(StoriesFeedDocument, {
    skip: !seeded,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  // Save once an answer has settled — never mid-refetch, when the cache may
  // still hold the previous viewer's tray.
  useEffect(() => {
    if (seeded && data && !loading) saveStoriesFeed(viewer, data);
  }, [seeded, data, loading, viewer]);

  // Wake exactly when the next story expires, and drop it.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const upcoming = (data?.storiesFeed ?? [])
      .flatMap((ring) => ring.stories.map(storyExpiry))
      .filter((t) => t > now);
    if (upcoming.length === 0) return;
    const wait = Math.min(...upcoming) - Date.now() + 250;
    const timer = setTimeout(() => setNow(Date.now()), Math.max(wait, 0));
    return () => clearTimeout(timer);
  }, [data, now]);

  const { markSeen, deleteStory } = useStoryActions();
  const seenLocally = useSeenStories();

  const rings = useMemo<TrayRing[]>(() => {
    const built = (data?.storiesFeed ?? []).flatMap((ring) => {
      const tray = toTrayRing(ring, seenLocally, userId, now);
      return tray ? [tray] : [];
    });
    // Own ring, then unseen, then seen. The server already ranks within each
    // group (people you follow, then newest); a stable sort keeps that, and
    // re-applying the grouping here is what moves a ring you just finished to
    // the seen end — and what orders the tray at all for guests.
    const rank = (r: TrayRing) => (r.isOwn ? 0 : r.hasUnseen ? 1 : 2);
    return built.sort((a, b) => rank(a) - rank(b));
  }, [data, seenLocally, userId, now]);

  return {
    rings,
    /** True until the first response — the tray shows its skeleton meanwhile. */
    loading: !seeded || (loading && !data),
    isAuthed,
    userId,
    refetch,
    markSeen,
    deleteStory,
  };
}
