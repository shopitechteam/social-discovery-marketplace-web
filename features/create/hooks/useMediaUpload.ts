"use client";

/**
 * useMediaUpload — async-first media upload hook.
 *
 * Image flow
 *   1. Add item with localUri (blob) → status "uploading"
 *   2. POST multipart to /upload/image — server runs Sharp → R2, returns CDN URLs
 *   3. Response includes mediaAssetId + CDN URLs → swap blob, "ready" immediately
 *
 * Video flow
 *   1. Add item with localUri (blob) → status "uploading"
 *   2. Get Mux upload URL + PUT to Mux (background)
 *   3. User CAN PROCEED immediately — blob plays in preview
 *   4. WS media:ready fires → attach muxPlaybackId, "ready"
 *      Fallback: poll if socket not connected
 */

import { useCallback } from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import {
  RequestVideoUploadDocument,
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
import { useAuthStore } from "@/stores/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const WS_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 40;

export function useMediaUpload() {
  const { addMediaItem, updateMediaItem } = useCreateStore();
  const { on } = useSocket();

  const [requestVideoUpload] = useMutation(RequestVideoUploadDocument);
  const [notifyVideoUploaded] = useMutation(NotifyVideoUploadedDocument);
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

  // ── Image: POST multipart to /upload/image — server processes + stores ──────
  const startImageUpload = useCallback(
    (file: File, did: string): string => {
      const localUri = URL.createObjectURL(file);
      const tempId = `temp-img-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      addMediaItem({ id: tempId, localUri, type: "image", status: "uploading" });

      (async () => {
        let mediaAssetId: string | null = null;
        try {
          const form = new FormData();
          form.append("file", file);
          form.append("draftId", did);

          const token = useAuthStore.getState().accessToken;
          const res = await fetch(`${API_BASE}/upload/image`, {
            method: "POST",
            body: form,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`Upload failed (${res.status}): ${body}`);
          }

          const json = await res.json() as {
            mediaAssetId: string;
            imageUrl: string;
            thumbnailUrl: string;
          };
          mediaAssetId = json.mediaAssetId;

          // Attach to draft
          await attachMediaAsset({
            variables: { draftId: did, mediaAssetId, sortOrder: 0 },
          });

          // Swap temp → real, show CDN URL immediately (no WS wait needed)
          useCreateStore.getState().removeMediaItem(tempId);
          addMediaItem({
            id: mediaAssetId,
            localUri: json.imageUrl,
            type: "image",
            status: "ready",
            thumbnailUrl: json.thumbnailUrl,
          });
        } catch (err) {
          const id = mediaAssetId ?? tempId;
          updateMediaItem(id, { status: "error", errorMessage: String(err) });
          if (mediaAssetId && mediaAssetId !== tempId) {
            useCreateStore.getState().removeMediaItem(tempId);
          }
        }
      })();

      return tempId;
    },
    [addMediaItem, updateMediaItem, attachMediaAsset],
  );

  // ── Video: fire-and-forget — user gets preview IMMEDIATELY from blob ────────
  const startVideoUpload = useCallback(
    (file: File, did: string): string => {
      const localUri = URL.createObjectURL(file);
      const tempId = `temp-vid-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      addMediaItem({ id: tempId, localUri, type: "video", status: "uploading" });

      (async () => {
        let mediaAssetId: string | null = null;
        try {
          const { data, error } = await requestVideoUpload({
            variables: { draftId: did },
          });
          if (error || !data?.requestVideoUpload) throw new Error(error?.message ?? "Upload URL failed");
          mediaAssetId = data.requestVideoUpload.mediaAssetId;
          const { uploadUrl } = data.requestVideoUpload;

          useCreateStore.getState().removeMediaItem(tempId);
          addMediaItem({ id: mediaAssetId, localUri, type: "video", status: "processing" });

          await attachMediaAsset({
            variables: { draftId: did, mediaAssetId, sortOrder: 0 },
          });

          const res = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || "video/mp4" },
          });
          if (!res.ok) throw new Error(`Mux upload failed: ${res.status}`);

          await notifyVideoUploaded({ variables: { mediaAssetId } });

          const ready = await waitForAsset(mediaAssetId);
          updateMediaItem(mediaAssetId, {
            status: "ready",
            thumbnailUrl: ready.thumbnailUrl ?? localUri,
            muxPlaybackId: ready.muxPlaybackId,
          });
        } catch (err) {
          const id = mediaAssetId ?? tempId;
          updateMediaItem(id, { status: "error", errorMessage: String(err) });
          if (mediaAssetId && mediaAssetId !== tempId) {
            useCreateStore.getState().removeMediaItem(tempId);
          }
        }
      })();

      return tempId;
    },
    [addMediaItem, updateMediaItem, requestVideoUpload, notifyVideoUploaded, attachMediaAsset, waitForAsset],
  );

  return { startImageUpload, startVideoUpload };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
