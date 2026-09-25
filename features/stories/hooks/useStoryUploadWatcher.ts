"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import {
  WS_EVENTS,
  type StoryFailedPayload,
  type StoryPublishedPayload,
  type StoryReadyPayload,
} from "@/lib/socket";
import { NotifyStoryUploadedDocument } from "@/types/__generated__/graphql";
import { resetStoryUpload, useStoryUploadStore } from "../store/storyUpload";

/** Past this, stop showing progress; the story still appears when it's done. */
const GIVE_UP_MS = 3 * 60_000;

/**
 * Ends a post's "processing" phase the moment the story is live — without
 * polling.
 *
 * One call when the upload finishes tells the API to start watching (and
 * answers at once for a photo, which is live by then). From there the server
 * announces the outcome over the socket: story:published to every tray,
 * including this one, or story:failed. The only other call is a single
 * reconcile if the socket dropped while waiting, since it may have missed
 * the announcement.
 */
export function useStoryUploadWatcher(refetchFeed: () => Promise<unknown>) {
  const phase = useStoryUploadStore((s) => s.phase);
  const storyId = useStoryUploadStore((s) => s.storyId);
  const { on } = useSocket();
  const [notifyUploaded] = useMutation(NotifyStoryUploadedDocument);

  const refetchRef = useRef(refetchFeed);
  const notifyRef = useRef(notifyUploaded);
  useEffect(() => {
    refetchRef.current = refetchFeed;
    notifyRef.current = notifyUploaded;
  }, [refetchFeed, notifyUploaded]);

  useEffect(() => {
    if (phase !== "processing" || !storyId) return;
    let settled = false;

    // No toast: the story appearing on "Your story" is the confirmation.
    const live = () => {
      if (settled) return;
      settled = true;
      resetStoryUpload();
    };

    const failed = (reason?: string) => {
      if (settled) return;
      settled = true;
      resetStoryUpload();
      toast.error("Couldn't post your story", {
        description: reason || "The file couldn't be processed. Try another one.",
      });
    };

    const reconcile = async () => {
      try {
        const { data } = await notifyRef.current({ variables: { storyId } });
        if (settled) return;
        if (data?.notifyStoryUploaded === "READY") {
          // Its broadcast may have gone out before we were listening (a photo
          // is live before the upload call even returns) — make sure the tray
          // has it, then finish.
          await refetchRef.current().catch(() => {});
          live();
        } else if (data?.notifyStoryUploaded === "FAILED") {
          failed();
        }
      } catch {
        // The socket or the give-up timer settles it.
      }
    };

    const offPublished = on<StoryPublishedPayload>(WS_EVENTS.STORY_PUBLISHED, (p) => {
      if (p.story.id === storyId) live();
    });
    const offReady = on<StoryReadyPayload>(WS_EVENTS.STORY_READY, (p) => {
      if (p.storyId === storyId) live();
    });
    const offFailed = on<StoryFailedPayload>(WS_EVENTS.STORY_FAILED, (p) => {
      if (p.storyId === storyId) failed(p.reason);
    });

    let dropped = false;
    const offDisconnect = on("disconnect", () => {
      dropped = true;
    });
    const offConnect = on("connect", () => {
      if (!dropped) return;
      dropped = false;
      void reconcile();
    });

    const giveUp = setTimeout(() => {
      if (settled) return;
      settled = true;
      resetStoryUpload();
      toast("Your story is still processing", {
        description: "It will appear here as soon as it's ready.",
      });
    }, GIVE_UP_MS);

    void reconcile();

    return () => {
      settled = true;
      clearTimeout(giveUp);
      offPublished();
      offReady();
      offFailed();
      offDisconnect();
      offConnect();
    };
  }, [phase, storyId, on]);
}
