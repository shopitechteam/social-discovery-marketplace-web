"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import {
  StoriesFeedDocument,
  ViewStoryDocument,
  DeleteStoryDocument,
  type StoryRingFieldsFragment,
  type StoryFieldsFragment,
  type StoryCreatorFieldsFragment,
} from "@/types/__generated__/graphql";

export type StoryRing = StoryRingFieldsFragment;
export type StoryItem = StoryFieldsFragment;
export type StoryUser = StoryCreatorFieldsFragment;

export function useStoriesFeed() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthed = !!accessToken;

  const { data, loading, refetch } = useQuery(StoriesFeedDocument, {
    skip: !isAuthed,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const [viewStory] = useMutation(ViewStoryDocument);
  const [deleteStory] = useMutation(DeleteStoryDocument, {
    refetchQueries: ["StoriesFeed"],
  });

  const markViewed = async (storyId: string) => {
    try {
      await viewStory({ variables: { storyId } });
    } catch {
      // non-critical
    }
  };

  const removeStory = async (storyId: string) => {
    await deleteStory({ variables: { storyId } });
  };

  return {
    rings: (data?.storiesFeed ?? []) as StoryRing[],
    loading,
    refetch,
    markViewed,
    removeStory,
  };
}
