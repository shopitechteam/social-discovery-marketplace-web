"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import {
  DeleteStoryDocument,
  StoriesFeedDocument,
  ViewStoryDocument,
  type StoryCreatorFieldsFragment,
  type StoryFieldsFragment,
} from "@/types/__generated__/graphql";
import { markStorySeen, useSeenStories } from "../lib/seenStories";

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

export function useStoriesFeed() {
  const hydrated = useAuthHydrated();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const isAuthed = useAuthStore((s) => !!s.accessToken);

  const { data, loading, refetch } = useQuery(StoriesFeedDocument, {
    skip: !hydrated,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  // The feed is per-viewer (own ring, seen state): refetch on sign-in/out.
  const lastUserId = useRef(userId);
  useEffect(() => {
    if (lastUserId.current === userId) return;
    lastUserId.current = userId;
    if (hydrated) void refetch();
  }, [userId, hydrated, refetch]);

  const [viewStory] = useMutation(ViewStoryDocument);
  const [deleteStoryMutation] = useMutation(DeleteStoryDocument);

  const seenLocally = useSeenStories();

  const rings = useMemo<TrayRing[]>(() => {
    const built = (data?.storiesFeed ?? []).map((ring) => {
      const stories = ring.stories.map((story) => ({
        ...story,
        seen: story.isViewed || story.id in seenLocally,
      }));
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
  }, [data, seenLocally, userId]);

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

  const deleteStory = useCallback(
    async (storyId: string) => {
      await deleteStoryMutation({ variables: { storyId } });
      await refetch();
    },
    [deleteStoryMutation, refetch],
  );

  return {
    rings,
    /** True until the first response — the tray shows its skeleton meanwhile. */
    loading: !hydrated || (loading && !data),
    isAuthed,
    userId,
    refetch,
    markSeen,
    deleteStory,
  };
}
