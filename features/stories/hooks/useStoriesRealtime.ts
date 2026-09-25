"use client";

import { useEffect, useRef } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useSocket } from "@/hooks/useSocket";
import {
  WS_EVENTS,
  type StoryDeletedPayload,
  type StoryPublishedPayload,
  type StoryViewedPayload,
} from "@/lib/socket";
import { StoriesFeedDocument, StoryViewersDocument } from "@/types/__generated__/graphql";
import {
  withStoryAdded,
  withStoryRemoved,
  withViewerAdded,
} from "../lib/storiesFeedUpdates";

/**
 * Keeps the story tray live over the socket — no polling, no refetching.
 *
 * - story:published (everyone): the new story joins the tray in place
 * - story:deleted   (everyone): it leaves
 * - story:viewed    (creator):  "Seen by" count and list move on the spot
 *
 * Events are applied to Apollo's cache, so the tray, an open viewer and the
 * "Seen by" sheet all update from the one source. A dropped connection can miss
 * events; the one refetch when it comes back is the whole recovery.
 *
 * Mount once, alongside the tray.
 */
export function useStoriesRealtime(refetchFeed: () => Promise<unknown>) {
  const client = useApolloClient();
  const { on } = useSocket();
  const refetchRef = useRef(refetchFeed);
  useEffect(() => {
    refetchRef.current = refetchFeed;
  }, [refetchFeed]);

  useEffect(() => {
    const { cache } = client;

    const offPublished = on<StoryPublishedPayload>(WS_EVENTS.STORY_PUBLISHED, ({ story, creator }) => {
      cache.updateQuery({ query: StoriesFeedDocument }, (data) =>
        data ? withStoryAdded(data, story, creator) : undefined,
      );
    });

    const offDeleted = on<StoryDeletedPayload>(WS_EVENTS.STORY_DELETED, ({ storyId }) => {
      cache.updateQuery({ query: StoriesFeedDocument }, (data) =>
        data ? withStoryRemoved(data, storyId) : undefined,
      );
    });

    const offViewed = on<StoryViewedPayload>(WS_EVENTS.STORY_VIEWED, (view) => {
      cache.modify({
        id: cache.identify({ __typename: "Story", id: view.storyId }),
        fields: { viewCount: () => view.viewCount },
      });
      cache.updateQuery(
        { query: StoryViewersDocument, variables: { storyId: view.storyId } },
        (data) => (data ? withViewerAdded(data, view) : undefined),
      );
    });

    let dropped = false;
    const offDisconnect = on("disconnect", () => {
      dropped = true;
    });
    const offConnect = on("connect", () => {
      if (!dropped) return;
      dropped = false;
      void refetchRef.current().catch(() => {});
    });

    return () => {
      offPublished();
      offDeleted();
      offViewed();
      offDisconnect();
      offConnect();
    };
  }, [client, on]);
}
