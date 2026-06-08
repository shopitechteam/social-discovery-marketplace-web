"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { useSocket } from "@/hooks/useSocket";
import { WS_EVENTS, type StoryReadyPayload } from "@/lib/socket";
import {
  RequestImageUploadDocument,
  CreateImageStoryDocument,
  RequestStoryVideoUploadDocument,
} from "@/types/__generated__/graphql";

export type StoryUploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "ready"
  | "error";

export interface UploadedStory {
  storyId: string;
  thumbnailUrl?: string;
  type: "IMAGE" | "VIDEO";
}

export function useStoryUpload() {
  const [status, setStatus] = useState<StoryUploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const { on } = useSocket();

  const [requestImageUpload] = useMutation(RequestImageUploadDocument);
  const [createImageStory] = useMutation(CreateImageStoryDocument, {
    refetchQueries: ["StoriesFeed"],
  });
  const [requestVideoUpload] = useMutation(RequestStoryVideoUploadDocument, {
    refetchQueries: ["StoriesFeed"],
  });

  const uploadImage = useCallback(
    async (file: File, caption?: string): Promise<UploadedStory | null> => {
      setError(null);
      setStatus("uploading");

      try {
        // 1. Get presigned R2 URL
        const { data: uploadData } = await requestImageUpload();
        const { uploadUrl, tempKey } = uploadData!.requestImageUpload;

        // 2. Upload directly to R2
        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error("Image upload to R2 failed");

        setStatus("processing");

        // 3. Create story — backend enqueues image processing
        const { data: storyData } = await createImageStory({
          variables: {
            input: {
              type: "IMAGE",
              imageMedia: { tempKey },
              caption,
            },
          },
        });

        const story = storyData!.createStory;

        // 4. Wait for story:ready WS event
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 30_000);
          const off = on<StoryReadyPayload>(WS_EVENTS.STORY_READY, (p) => {
            if (p.storyId !== story.id) return;
            off();
            clearTimeout(timeout);
            resolve();
          });
        });

        setStatus("ready");
        return {
          storyId: story.id,
          thumbnailUrl: story.media.thumbnailUrl ?? undefined,
          type: "IMAGE",
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setStatus("error");
        return null;
      }
    },
    [requestImageUpload, createImageStory, on],
  );

  const uploadVideo = useCallback(
    async (file: File, caption?: string): Promise<UploadedStory | null> => {
      setError(null);
      setStatus("uploading");

      try {
        // 1. Create story + get Mux upload session
        const { data } = await requestVideoUpload({ variables: { caption } });
        const { storyId, uploadUrl } = data!.requestStoryVideoUpload;

        // 2. Upload directly to Mux
        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error("Video upload to Mux failed");

        setStatus("processing");

        // 3. Wait for story:ready WS event (Mux webhook fires it)
        const readyPayload = await new Promise<StoryReadyPayload>((resolve) => {
          const timeout = setTimeout(
            () => resolve({ storyId, type: "video" }),
            60_000,
          );
          const off = on<StoryReadyPayload>(WS_EVENTS.STORY_READY, (p) => {
            if (p.storyId !== storyId) return;
            off();
            clearTimeout(timeout);
            resolve(p);
          });
        });

        setStatus("ready");
        return {
          storyId,
          thumbnailUrl: readyPayload.thumbnailUrl,
          type: "VIDEO",
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setStatus("error");
        return null;
      }
    },
    [requestVideoUpload, on],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { uploadImage, uploadVideo, status, error, reset };
}
