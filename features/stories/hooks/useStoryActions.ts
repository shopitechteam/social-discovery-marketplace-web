"use client";

import { useCallback } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import {
  DeleteStoryDocument,
  StoriesFeedDocument,
  ViewStoryDocument,
  type StoryFieldsFragment,
} from "@/types/__generated__/graphql";
import { markStorySeen } from "../lib/seenStories";
import { withStoryRemoved } from "../lib/storiesFeedUpdates";

/** Views already sent this session, so re-opening a ring doesn't re-send them. */
const reportedViews = new Set<string>();

export function storyExpiry(story: StoryFieldsFragment): number {
  const t = Date.parse(String(story.expiresAt));
  return Number.isNaN(t) ? Date.now() + 86_400_000 : t;
}

/**
 * What a story viewer does to stories, wherever it was opened from — the
 * tray, a post's avatar, a seller's profile.
 */
export function useStoryActions() {
  const client = useApolloClient();
  const isAuthed = useAuthStore((s) => !!s.accessToken);
  const [viewStory] = useMutation(ViewStoryDocument);
  const [deleteStoryMutation] = useMutation(DeleteStoryDocument);

  /** Seen at once on this device (ring greys out), then recorded server-side. */
  const markSeen = useCallback(
    (story: StoryFieldsFragment) => {
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

  return { markSeen, deleteStory };
}
