"use client";

import { useCallback, useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

/**
 * Save-only interaction hook for grid tiles.
 *
 * `useInteractions` mounts five `useMutation` hooks per post, which is fine for
 * one detail view but wasteful in a discovery grid that holds 40+ tiles at
 * once. This calls `client.mutate` on tap instead, so a tile costs a single
 * context read until the user actually saves something.
 */

const TOGGLE_SAVE = gql`
  mutation ToggleSaveTile($contentId: String!) {
    toggleSave(contentId: $contentId) {
      saved
      saveCount
    }
  }
`;

type ToggleSaveResult = {
  toggleSave?: { saved: boolean; saveCount: number } | null;
};

export function useSaveToggle({
  contentId,
  initialSaved,
  initialCount,
}: {
  contentId: string;
  initialSaved: boolean;
  initialCount: number;
}) {
  const client = useApolloClient();
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(initialCount);

  // Re-sync when the cache changes underneath us (e.g. the post was saved from
  // its detail sheet and the user came back to the grid).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(initialSaved);
    setSaveCount(initialCount);
  }, [initialSaved, initialCount]);

  const toggle = useCallback(async () => {
    const wasSaved = saved;
    const wasCount = saveCount;
    const nextSaved = !wasSaved;
    const nextCount = Math.max(0, wasCount + (wasSaved ? -1 : 1));

    const write = (isSaved: boolean, count: number) =>
      client.cache.modify({
        id: client.cache.identify({ __typename: "Content", id: contentId }),
        fields: {
          isSavedByMe: () => isSaved,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          stats: (existing: any) => ({ ...existing, saves: count }),
        },
      });

    setSaved(nextSaved);
    setSaveCount(nextCount);
    write(nextSaved, nextCount);

    try {
      // Apollo 4's `mutate` generics take all four params or none; the shape is
      // pinned by the cast instead.
      const { data } = (await client.mutate({
        mutation: TOGGLE_SAVE,
        variables: { contentId },
      })) as { data?: ToggleSaveResult | null };
      if (data?.toggleSave) {
        setSaved(data.toggleSave.saved);
        setSaveCount(data.toggleSave.saveCount);
        write(data.toggleSave.saved, data.toggleSave.saveCount);
      }
    } catch {
      setSaved(wasSaved);
      setSaveCount(wasCount);
      write(wasSaved, wasCount);
    }
  }, [client, contentId, saved, saveCount]);

  return { saved, saveCount, toggle };
}
