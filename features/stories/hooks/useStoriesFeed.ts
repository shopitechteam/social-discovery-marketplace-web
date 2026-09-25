"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import {
  DeleteStoryDocument,
  StoriesFeedDocument,
  ViewStoryDocument,
  type StoryCreatorFieldsFragment,
  type StoryFieldsFragment,
} from "@/types/__generated__/graphql";
import { markStorySeen, useSeenStories } from "../lib/seenStories";
import { loadSavedStoriesFeed, saveStoriesFeed } from "../lib/storiesFeedCache";
import { withStoryRemoved } from "../lib/storiesFeedUpdates";

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

export function storyExpiry(story: StoryFieldsFragment): number {
  const t = Date.parse(String(story.expiresAt));
  return Number.isNaN(t) ? Date.now() + 86_400_000 : t;
}

/** Views already sent this session, so re-opening a ring doesn't re-send them. */
const reportedViews = new Set<string>();

/**
 * Auth lives in localStorage, which the server can't read. Holding the query
 * until the store has hydrated means the server HTML and the first client
 * render agree (both show the skeleton), and the one request that goes out
 * carries the viewer's token — so their own ring and seen state are right from
 * the first paint.
 */
function useAuthHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
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

  const [viewStory] = useMutation(ViewStoryDocument);
  const [deleteStoryMutation] = useMutation(DeleteStoryDocument);

  const seenLocally = useSeenStories();

  const rings = useMemo<TrayRing[]>(() => {
    const built = (data?.storiesFeed ?? []).flatMap((ring) => {
      const stories = ring.stories
        .filter((story) => storyExpiry(story) > now)
        .map((story) => ({
          ...story,
          seen: story.isViewed || story.id in seenLocally,
        }));
      if (stories.length === 0) return [];
      return {
        user: ring.user,
        stories,
        hasUnseen: stories.some((s) => !s.seen),
        isOwn: !!userId && ring.user.id === userId,
      };
    });
    // Own ring, then unseen, then seen. The server already ranks within each
    // group (people you follow, then newest); a stable sort keeps that, and
    // re-applying the grouping here is what moves a ring you just finished to
    // the seen end — and what orders the tray at all for guests.
    const rank = (r: TrayRing) => (r.isOwn ? 0 : r.hasUnseen ? 1 : 2);
    return built.sort((a, b) => rank(a) - rank(b));
  }, [data, seenLocally, userId, now]);

  const markSeen = useCallback(
    (story: StoryItem) => {
      markStorySeen(story.id, storyExpiry(story));
      if (!isAuthed || story.isViewed || reportedViews.has(story.id)) return;
      reportedViews.add(story.id);
      viewStory({ variables: { storyId: story.id } }).catch(() => {
        // Seen locally regardless; let a later open retry.
        reportedViews.delete(story.id);
      });
    },
    [isAuthed, viewStory],
  );

  // Out of the tray the moment the server agrees — the story:deleted
  // broadcast then reaches everyone else.
  const deleteStory = useCallback(
    async (storyId: string) => {
      const { error } = await deleteStoryMutation({ variables: { storyId } });
      if (error) throw error;
      client.cache.updateQuery({ query: StoriesFeedDocument }, (current) =>
        current ? withStoryRemoved(current, storyId) : undefined,
      );
    },
    [deleteStoryMutation, client],
  );

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
