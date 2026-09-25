"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import {
  WS_EVENTS,
  type StoryFailedPayload,
  type StoryReadyPayload,
} from "@/lib/socket";
import { SyncStoryDocument } from "@/types/__generated__/graphql";
import { resetStoryUpload, useStoryUploadStore } from "../store/storyUpload";

/** Quick checks while a short video is likely just about done… */
const FAST_POLL_MS = 2_000;
/** …then easier on Mux for a long encode. */
const SLOW_POLL_MS = 4_000;
const SLOW_AFTER_MS = 30_000;
/** Past this, stop showing progress; the story still appears when it's done. */
const GIVE_UP_MS = 3 * 60_000;

/**
 * Ends a post's "processing" phase as soon as the story is live.
 *
 * It asks the API directly (syncStory), which for a video checks Mux there and
 * then and publishes the moment the encode is done — so the wait is Mux's, not
 * a webhook's or a queue's. The socket's story:ready / story:failed still land
 * first when they can.
 */
export function useStoryUploadWatcher(refetchFeed: () => Promise<unknown>) {
  const phase = useStoryUploadStore((s) => s.phase);
  const storyId = useStoryUploadStore((s) => s.storyId);
  const { on } = useSocket();
  const [syncStory] = useMutation(SyncStoryDocument);

  const refetchRef = useRef(refetchFeed);
  const syncRef = useRef(syncStory);
  useEffect(() => {
    refetchRef.current = refetchFeed;
    syncRef.current = syncStory;
  }, [refetchFeed, syncStory]);

  useEffect(() => {
    if (phase !== "processing" || !storyId) return;
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const live = async () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      await refetchRef.current().catch(() => undefined);
      resetStoryUpload();
      toast.success("Your story is live");
    };

    const failed = (reason?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resetStoryUpload();
      toast.error("Couldn't post your story", {
        description: reason || "The file couldn't be processed. Try another one.",
      });
    };

    const check = async () => {
      if (settled) return;
      if (Date.now() - startedAt > GIVE_UP_MS) {
        settled = true;
        resetStoryUpload();
        toast("Your story is still processing", {
          description: "It will appear here as soon as it's ready.",
        });
        return;
      }
      try {
        const { data } = await syncRef.current({ variables: { storyId } });
        if (data?.syncStory === "READY") return void live();
        if (data?.syncStory === "FAILED") return failed();
      } catch {
        // A blip — keep checking.
      }
      if (settled) return;
      const elapsed = Date.now() - startedAt;
      timer = setTimeout(check, elapsed < SLOW_AFTER_MS ? FAST_POLL_MS : SLOW_POLL_MS);
    };

    const offReady = on<StoryReadyPayload>(WS_EVENTS.STORY_READY, (p) => {
      if (p.storyId === storyId) void live();
    });
    const offFailed = on<StoryFailedPayload>(WS_EVENTS.STORY_FAILED, (p) => {
      if (p.storyId === storyId) failed(p.reason);
    });

    // First check right away: a photo is already live.
    void check();

    return () => {
      settled = true;
      clearTimeout(timer);
      offReady();
      offFailed();
    };
  }, [phase, storyId, on]);
}
