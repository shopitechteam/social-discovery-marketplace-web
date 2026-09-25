"use client";

import { create } from "zustand";
import { toast } from "sonner";
import type { useApolloClient } from "@apollo/client/react";
import {
  CreateStoryDocument,
  RequestStoryImageUploadDocument,
  RequestStoryVideoUploadDocument,
} from "@/types/__generated__/graphql";
import { captureVideoFrames } from "@/features/create/utils/captureVideoFrames";
import { prepareStoryImage } from "../lib/prepareStoryImage";

type Client = ReturnType<typeof useApolloClient>;

/**
 * One story being posted, from file pick to live. It lives outside React so a
 * post survives the tray unmounting (switching feed tabs, a desktop↔mobile
 * resize) and so the "Your story" avatar can show its progress anywhere.
 *
 * - uploading:  bytes going to R2 (photo) or Mux (video); `progress` is 0–1
 * - processing: uploaded; the server is resizing / encoding (and, for a video
 *               over 60s, cutting it). useStoryUploadWatcher ends this phase.
 */
export type StoryUploadPhase = "idle" | "uploading" | "processing";

interface StoryUploadState {
  phase: StoryUploadPhase;
  progress: number;
  storyId: string | null;
  /** Local preview of a photo being posted, for the avatar while it uploads. */
  previewUrl: string | null;
  set: (patch: Partial<Omit<StoryUploadState, "set">>) => void;
}

export const useStoryUploadStore = create<StoryUploadState>((set) => ({
  phase: "idle",
  progress: 0,
  storyId: null,
  previewUrl: null,
  set: (patch) => set(patch),
}));

export function resetStoryUpload() {
  const { previewUrl, set } = useStoryUploadStore.getState();
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  set({ phase: "idle", progress: 0, storyId: null, previewUrl: null });
}

/** Identifies the post in flight, so a late frame can't land on the next one. */
let postToken = 0;

/**
 * Give "Your story" a still of the video being posted, like the photo path
 * gets for free. Grabbed locally in the background — the upload never waits
 * on it, and a video the browser can't decode just keeps the plain avatar.
 */
async function showVideoFrame(file: File, token: number) {
  try {
    const [frame] = await captureVideoFrames(file, { fractions: [0.1], maxDimension: 240 });
    const { phase, previewUrl, set } = useStoryUploadStore.getState();
    if (!frame || token !== postToken || phase === "idle" || previewUrl) return;
    set({ previewUrl: URL.createObjectURL(frame) });
  } catch {
    // No preview — the progress ring still shows.
  }
}

/**
 * PUT a file with upload progress — fetch can't report it, and on a phone
 * network a silent 30s upload reads as a hang.
 */
function putFile(
  url: string,
  file: File,
  contentType: string | undefined,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    if (contentType) xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

/**
 * Upload a photo or video and create the story, then hand over to
 * useStoryUploadWatcher for the "processing" phase. A photo is already live by
 * then (the API processes it inside createStory), so the watcher's first check
 * confirms it; a video goes live as soon as Mux has encoded it.
 */
export async function postStory(client: Client, file: File, caption: string): Promise<void> {
  const store = useStoryUploadStore.getState();
  if (store.phase !== "idle") return;

  const isVideo = file.type.startsWith("video/");
  const trimmedCaption = caption.trim() || null;
  store.set({
    phase: "uploading",
    progress: 0,
    storyId: null,
    previewUrl: isVideo ? null : URL.createObjectURL(file),
  });
  if (isVideo) void showVideoFrame(file, ++postToken);
  const onProgress = (progress: number) => useStoryUploadStore.getState().set({ progress });

  try {
    let storyId: string;

    if (isVideo) {
      // The story row exists before the upload; the server publishes it (or
      // cuts it to 60s first) once Mux has encoded it.
      const { data } = await client.mutate({
        mutation: RequestStoryVideoUploadDocument,
        variables: { caption: trimmedCaption },
      });
      if (!data) throw new Error("Could not start the upload");
      const session = data.requestStoryVideoUpload;
      storyId = session.storyId;
      await putFile(session.uploadUrl, file, file.type || undefined, onProgress);
    } else {
      const photo = await prepareStoryImage(file);
      const { data } = await client.mutate({
        mutation: RequestStoryImageUploadDocument,
        variables: { mimeType: photo.type || null },
      });
      if (!data) throw new Error("Could not start the upload");
      const session = data.requestStoryImageUpload;
      // The URL is signed for this exact content type.
      await putFile(session.uploadUrl, photo, photo.type || undefined, onProgress);
      const created = await client.mutate({
        mutation: CreateStoryDocument,
        variables: {
          input: {
            type: "IMAGE",
            imageMedia: { tempKey: session.tempKey },
            caption: trimmedCaption,
          },
        },
      });
      if (!created.data) throw new Error("Could not create the story");
      storyId = created.data.createStory.id;
    }

    useStoryUploadStore.getState().set({ phase: "processing", progress: 1, storyId });
  } catch (err) {
    resetStoryUpload();
    toast.error("Couldn't post your story", {
      description: err instanceof Error ? err.message : "Please try again.",
    });
  }
}
