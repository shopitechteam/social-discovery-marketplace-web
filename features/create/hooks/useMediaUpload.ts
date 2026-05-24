"use client";

/**
 * useMediaUpload — async-first media upload hook.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Design principle: NEVER block the user waiting for upload.     │
 * │                                                                 │
 * │  Image flow                                                     │
 * │    1. Add item with localUri (blob) → status "uploading"        │
 * │    2. Get presigned URL + PUT to R2  (background)               │
 * │    3. notifyImageUploaded → Sharp worker                        │
 * │    4. WS media:ready fires → swap blob for CDN URL, "ready"     │
 * │       Fallback: poll if socket not connected                    │
 * │                                                                 │
 * │  Video flow                                                     │
 * │    1. Add item with localUri (blob) → status "uploading"        │
 * │    2. Get Mux upload URL + PUT to Mux  (background)             │
 * │    3. User CAN PROCEED immediately — blob plays in preview      │
 * │    4. WS media:ready fires → attach muxPlaybackId, "ready"      │
 * │       Fallback: poll if socket not connected                    │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * The hook returns a fire-and-forget `startUpload()` — the caller
 * advances the step immediately without awaiting completion.
 * Background resolution is tracked in the Zustand store via
 * updateMediaItem() and WebSocket events.
 */

import { useCallback } from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import {
  RequestImageUploadDocument,
  RequestVideoUploadDocument,
  NotifyImageUploadedDocument,
  NotifyVideoUploadedDocument,
  GetMediaAssetDocument,
  AttachMediaAssetDocument,
} from "@/types/__generated__/graphql";
import { useSocket } from "@/hooks/useSocket";
import {
  WS_EVENTS,
  type MediaReadyPayload,
  type MediaFailedPayload,
} from "@/lib/socket";

const WS_TIMEOUT_MS = 120_000; // 2 min max wait for WS event (Mux can be slow)
const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 40; // 40 × 3s = 120s

export function useMediaUpload() {
  const { addMediaItem, updateMediaItem } = useCreateStore();
  const { on } = useSocket();

  const [requestImageUpload] = useMutation(RequestImageUploadDocument);
  const [requestVideoUpload] = useMutation(RequestVideoUploadDocument);
  const [notifyVideoUploaded] = useMutation(NotifyVideoUploadedDocument);
  const [notifyImageUploaded] = useMutation(NotifyImageUploadedDocument);
  const [attachMediaAsset] = useMutation(AttachMediaAssetDocument);
  const [getMediaAsset] = useLazyQuery(GetMediaAssetDocument, {
    fetchPolicy: "network-only",
  });

  // ── Wait for WS media:ready for a specific asset ───────────────────────────
  const waitForReady = useCallback(
    (mediaAssetId: string): Promise<MediaReadyPayload> => {
      return new Promise<MediaReadyPayload>((resolve, reject) => {
        let done = false;

        const finish = (fn: () => void) => {
          if (done) return;
          done = true;
          fn();
        };

        const offReady = on<MediaReadyPayload>(WS_EVENTS.MEDIA_READY, (p) => {
          if (p.mediaAssetId !== mediaAssetId) return;
          offReady(); offFailed(); clearTimeout(timer);
          finish(() => resolve(p));
        });

        const offFailed = on<MediaFailedPayload>(WS_EVENTS.MEDIA_FAILED, (p) => {
          if (p.mediaAssetId !== mediaAssetId) return;
          offReady(); offFailed(); clearTimeout(timer);
          finish(() => reject(new Error(p.errorMessage || "Processing failed")));
        });

        // Timeout: fall back to one HTTP poll
        const timer = setTimeout(async () => {
          offReady(); offFailed();
          if (done) return;
          try {
            const { data } = await getMediaAsset({ variables: { id: mediaAssetId } });
            const a = data?.mediaAsset;
            if (a?.status === "READY") {
              finish(() => resolve({
                mediaAssetId,
                type: a.type === "VIDEO" ? "video" : "image",
                thumbnailUrl: a.thumbnailUrl ?? undefined,
                url: a.r2Variants?.find((v) => v.variant === "medium")?.url ?? a.thumbnailUrl ?? undefined,
                muxPlaybackId: a.muxMeta?.playbackId ?? undefined,
                aspectRatio: a.muxMeta?.aspectRatio ?? undefined,
                duration: a.muxMeta?.duration ?? undefined,
              }));
            } else {
              finish(() => reject(new Error("Timed out waiting for media processing")));
            }
          } catch {
            finish(() => reject(new Error("Timed out waiting for media processing")));
          }
        }, WS_TIMEOUT_MS);
      });
    },
    [on, getMediaAsset],
  );

  // ── Poll fallback (no socket) ──────────────────────────────────────────────
  const pollUntilReady = useCallback(
    async (mediaAssetId: string): Promise<MediaReadyPayload> => {
      for (let i = 0; i < MAX_POLLS; i++) {
        await sleep(POLL_INTERVAL_MS);
        const { data } = await getMediaAsset({ variables: { id: mediaAssetId } });
        const a = data?.mediaAsset;
        if (!a) continue;
        if (a.status === "READY") {
          return {
            mediaAssetId,
            type: a.type === "VIDEO" ? "video" : "image",
            thumbnailUrl: a.thumbnailUrl ?? undefined,
            url: a.r2Variants?.find((v) => v.variant === "medium")?.url ?? a.thumbnailUrl ?? undefined,
            muxPlaybackId: a.muxMeta?.playbackId ?? undefined,
            aspectRatio: a.muxMeta?.aspectRatio ?? undefined,
            duration: a.muxMeta?.duration ?? undefined,
          };
        }
        if (a.status === "FAILED") throw new Error(a.errorMessage ?? "Processing failed");
      }
      throw new Error("Timed out waiting for media processing");
    },
    [getMediaAsset],
  );

  const waitForAsset = useCallback(
    async (mediaAssetId: string): Promise<MediaReadyPayload> => {
      const { getSocket } = await import("@/lib/socket");
      return getSocket().connected
        ? waitForReady(mediaAssetId)
        : pollUntilReady(mediaAssetId);
    },
    [waitForReady, pollUntilReady],
  );

  // ── Image: fire-and-forget background upload ───────────────────────────────
  /**
   * Adds media item immediately (localUri blob for instant preview),
   * uploads in background, resolves via WebSocket.
   * Returns the tempId so the caller can track it.
   */
  const startImageUpload = useCallback(
    (file: File, did: string): string => {
      const localUri = URL.createObjectURL(file);
      const tempId = `temp-img-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Instant optimistic add
      addMediaItem({ id: tempId, localUri, type: "image", status: "uploading" });

      // Background work — doesn't block the caller
      (async () => {
        let mediaAssetId: string | null = null;
        try {
          // 1. Presigned URL
          const { data, error } = await requestImageUpload({
            variables: { draftId: did, mimeType: file.type || "image/jpeg" },
          });
          if (error || !data?.requestImageUpload) throw new Error(error?.message ?? "Upload URL failed");
          mediaAssetId = data.requestImageUpload.mediaAssetId;
          const { uploadUrl } = data.requestImageUpload;

          // 2. PUT to R2
          const res = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || "image/jpeg" },
          });
          if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`);

          // Swap temp → real id, keep blob uri for now
          useCreateStore.getState().removeMediaItem(tempId);
          addMediaItem({ id: mediaAssetId, localUri, type: "image", status: "processing" });

          // 3. Attach to draft
          await attachMediaAsset({
            variables: { draftId: did, mediaAssetId, sortOrder: 0 },
          });

          // 4. Notify API → Sharp worker
          await notifyImageUploaded({ variables: { mediaAssetId } });

          // 5. Wait for WS/poll — swap blob for CDN URL
          const ready = await waitForAsset(mediaAssetId);
          updateMediaItem(mediaAssetId, {
            status: "ready",
            thumbnailUrl: ready.url ?? ready.thumbnailUrl ?? localUri,
          });
        } catch (err) {
          const id = mediaAssetId ?? tempId;
          updateMediaItem(id, { status: "error", errorMessage: String(err) });
          // Also clean up temp if real id was obtained
          if (mediaAssetId && id !== tempId) {
            useCreateStore.getState().removeMediaItem(tempId);
          }
        }
      })();

      return tempId;
    },
    [
      addMediaItem, updateMediaItem, requestImageUpload,
      notifyImageUploaded, attachMediaAsset, waitForAsset,
    ],
  );

  // ── Video: fire-and-forget — user gets preview IMMEDIATELY from blob ────────
  /**
   * Adds the video with local blob URI right away.
   * User can watch preview and proceed through all steps.
   * When Mux finishes, WebSocket fires media:ready → muxPlaybackId is attached.
   * Publish is gated server-side on READY status.
   */
  const startVideoUpload = useCallback(
    (file: File, did: string): string => {
      const localUri = URL.createObjectURL(file);
      const tempId = `temp-vid-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Instant add with blob — video is playable immediately
      addMediaItem({ id: tempId, localUri, type: "video", status: "uploading" });

      (async () => {
        let mediaAssetId: string | null = null;
        try {
          // 1. Get Mux upload URL
          const { data, error } = await requestVideoUpload({
            variables: { draftId: did },
          });
          if (error || !data?.requestVideoUpload) throw new Error(error?.message ?? "Upload URL failed");
          mediaAssetId = data.requestVideoUpload.mediaAssetId;
          const { uploadUrl } = data.requestVideoUpload;

          // Swap temp → real id, keep blob playing
          useCreateStore.getState().removeMediaItem(tempId);
          addMediaItem({ id: mediaAssetId, localUri, type: "video", status: "processing" });

          // 2. Attach to draft while still uploading (backend allows PROCESSING status)
          await attachMediaAsset({
            variables: { draftId: did, mediaAssetId, sortOrder: 0 },
          });

          // 3. PUT to Mux (can take seconds to minutes for large files)
          const res = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || "video/mp4" },
          });
          if (!res.ok) throw new Error(`Mux upload failed: ${res.status}`);

          // 4. Notify backend — triggers MuxSync polling worker so status advances
          //    even when Mux webhooks can't reach the server (local dev)
          await notifyVideoUploaded({ variables: { mediaAssetId } });

          // 5. Wait for Mux to process — resolves via WebSocket or poll fallback
          const ready = await waitForAsset(mediaAssetId);

          // Mux is ready — attach the playback ID, keep blob as thumbnail fallback
          updateMediaItem(mediaAssetId, {
            status: "ready",
            thumbnailUrl: ready.thumbnailUrl ?? localUri,
            muxPlaybackId: ready.muxPlaybackId,
          });
        } catch (err) {
          const id = mediaAssetId ?? tempId;
          updateMediaItem(id, { status: "error", errorMessage: String(err) });
          if (mediaAssetId && id !== tempId) {
            useCreateStore.getState().removeMediaItem(tempId);
          }
        }
      })();

      return tempId;
    },
    [
      addMediaItem, updateMediaItem, requestVideoUpload,
      notifyVideoUploaded, attachMediaAsset, waitForAsset,
    ],
  );

  return { startImageUpload, startVideoUpload };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
