"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import {
  ExtractDraftDetailsFromFramesDocument,
  type ExtractDraftDetailsFromFramesMutation,
} from "@/types/__generated__/graphql";
import { captureVideoFrames } from "@/features/create/utils/captureVideoFrames";

/** The extracted listing details — same shape the image path returns. */
export type ExtractedDetails =
  NonNullable<ExtractDraftDetailsFromFramesMutation["extractDraftDetailsFromFrames"]>;

/** Convert a frame Blob to a base64 data URL for the GraphQL `frames` arg. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read frame"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Instant AI auto-fill for video posts — uses the SAME GraphQL API as the image
 * flow (extractDraftDetailsFromFrames), so the result is handled identically.
 *
 * Frames are captured from the local video File in the browser (no upload, no
 * Mux wait), encoded as base64 data URLs, and sent to the mutation. Returns the
 * extracted listing details immediately.
 */
export function useVideoFrameExtract() {
  const [extractMutation] = useMutation(ExtractDraftDetailsFromFramesDocument);

  /** Extract from already-captured frame Blobs (the instant path). */
  const extractFromFrames = useCallback(
    async (draftId: string, frames: Blob[]): Promise<ExtractedDetails | null> => {
      if (frames.length === 0) return null;
      const dataUrls = await Promise.all(frames.map(blobToDataUrl));
      const { data } = await extractMutation({
        variables: { id: draftId, frames: dataUrls },
      });
      return data?.extractDraftDetailsFromFrames ?? null;
    },
    [extractMutation],
  );

  /** Capture frames from a video File then extract (used when no cache exists). */
  const extractFromVideo = useCallback(
    async (draftId: string, file: File): Promise<ExtractedDetails | null> => {
      const frames = await captureVideoFrames(file);
      return extractFromFrames(draftId, frames);
    },
    [extractFromFrames],
  );

  return { extractFromFrames, extractFromVideo };
}
