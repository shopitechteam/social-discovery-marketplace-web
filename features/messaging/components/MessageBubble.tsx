"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Play, RotateCw, X } from "lucide-react";
import type { Message } from "../types";
import {
  imageForMessage,
  mediaStatus,
  messageKind,
  shortTime,
} from "../lib/helpers";
import { MessageTicks } from "./MessageTicks";
import { ChatMediaDialog } from "./ChatMediaDialog";

interface Props {
  message: Message;
  mine: boolean;
  onRetry?: (message: Message) => void;
  onDiscard?: (message: Message) => void;
}

// Fixed media container - no overflow, proper sizing
const MEDIA_BOX_CLASS =
  "relative w-full overflow-hidden rounded-xl bg-black/5 flex-shrink-0";
const MEDIA_BOX_STYLE = {
  height: "35svh",
  maxHeight: "420px",
  minHeight: "180px",

  maxWidth: "100%",
} as const;

export function MessageBubble({ message, mine, onRetry, onDiscard }: Props) {
  const kind = messageKind(message.type);
  const status = mediaStatus(message.mediaAsset?.status);
  const imageUrl = imageForMessage(message);

  const isFailed = message.pendingStatus === "failed";
  const isUploading =
    message.pendingStatus === "uploading" ||
    message.pendingStatus === "sending";

  const videoThumb =
    message.mediaAsset?.muxMeta?.thumbnailUrl ??
    message.mediaAsset?.thumbnailUrl ??
    null;

  // A video is playable once Mux has produced a playback id (i.e. processed).
  const playbackId = message.mediaAsset?.muxMeta?.playbackId ?? null;
  const canPlayVideo =
    kind === "video" && Boolean(playbackId) && !isUploading && !isFailed;
  // Image is viewable once we have a real (non-blob) URL and it's settled.
  const canViewImage =
    kind === "image" && Boolean(imageUrl) && !isUploading && !isFailed;
  const [dialogOpen, setDialogOpen] = useState(false);

  const mediaOverlay =
    isUploading || isFailed ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-white">
        {isFailed ? (
          <>
            <span style={{ fontSize: "var(--text-xs)" }}>Upload failed</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRetry?.(message)}
                className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-semibold text-black transition-colors hover:bg-white"
                style={{ fontSize: "var(--text-xs)" }}
              >
                <RotateCw size={13} /> Retry
              </button>
              <button
                type="button"
                onClick={() => onDiscard?.(message)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 transition-colors hover:bg-black/60"
                aria-label="Discard"
              >
                <X size={14} />
              </button>
            </div>
          </>
        ) : (
          <Loader2 size={24} className="animate-spin" />
        )}
      </div>
    ) : null;

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={`w-[75%] relative rounded-2xl px-3 py-2 ${mine ? "rounded-br-md text-white" : "rounded-bl-md"}`}
        style={{
          backgroundColor: mine
            ? "rgb(var(--brand-primary))"
            : "rgb(var(--color-bg-elevated))",
          border: mine ? "none" : "1px solid rgb(var(--color-border))",
        }}
      >
        {/* Media section - always at top */}
        {(kind === "image" || kind === "video") && (
          <div className="flex flex-col items-center w-full">
            <div className={MEDIA_BOX_CLASS} style={MEDIA_BOX_STYLE}>
              {kind === "image" ? (
                imageUrl ? (
                  <button
                    type="button"
                    onClick={() => canViewImage && setDialogOpen(true)}
                    disabled={!canViewImage}
                    aria-label="View image"
                    className="absolute inset-0 h-full w-full"
                  >
                    <Image
                      src={imageUrl}
                      alt="Attachment"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 260px"
                      unoptimized={imageUrl.startsWith("blob:")}
                    />
                  </button>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Loader2 size={22} className="animate-spin opacity-60" />
                  </div>
                )
              ) : // Video
              videoThumb ? (
                <Image
                  src={videoThumb}
                  alt="Video attachment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 260px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black/10">
                  {!isUploading && !isFailed && (
                    <Loader2 size={22} className="animate-spin opacity-60" />
                  )}
                </div>
              )}

              {kind === "video" && !isUploading && !isFailed && videoThumb && (
                <button
                  type="button"
                  onClick={() => canPlayVideo && setDialogOpen(true)}
                  disabled={!canPlayVideo}
                  aria-label="Play video"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white transition-transform hover:scale-105">
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </div>
                </button>
              )}

              {mediaOverlay}
            </div>

            {/* Server-side processing status */}
            {!isUploading && !isFailed && status !== "ready" && (
              <p
                className={`mt-2 ${mine ? "text-white/75" : "text-muted"}`}
                style={{ fontSize: "var(--text-xs)" }}
              >
                {status === "failed"
                  ? message.mediaAsset?.errorMessage || "Upload failed"
                  : status === "processing"
                    ? "Processing media..."
                    : "Uploading media..."}
              </p>
            )}
          </div>
        )}

        {/* Text section - always at bottom */}
        {message.text && (
          <div className={`${kind !== "text" ? "mt-3" : ""}`}>
            <p
              className="break-words whitespace-pre-wrap"
              style={{ fontSize: "var(--text-sm)", lineHeight: 1.45 }}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Failed text message controls */}
        {isFailed && kind === "text" && (
          <div
            className={`mt-1 flex items-center gap-2 ${mine ? "text-white/85" : "text-red-500"}`}
            style={{ fontSize: "var(--text-xs)" }}
          >
            <span>Not sent</span>
            <button
              type="button"
              onClick={() => onRetry?.(message)}
              className="flex items-center gap-1 font-semibold underline underline-offset-2 transition-opacity hover:opacity-80"
            >
              <RotateCw size={12} /> Retry
            </button>
            <button
              type="button"
              onClick={() => onDiscard?.(message)}
              aria-label="Discard"
              className="transition-opacity hover:opacity-80"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Timestamp and status */}
        <div
          className={`mt-1.5 flex items-center gap-1 ${mine ? "justify-end text-white/70" : "justify-start text-muted"}`}
          style={{ fontSize: "11px" }}
        >
          <span>{shortTime(message.createdAt)}</span>
          {mine ? <MessageTicks message={message} /> : null}
        </div>
      </div>

      {dialogOpen && canPlayVideo && playbackId ? (
        <ChatMediaDialog
          kind="video"
          playbackId={playbackId}
          poster={videoThumb}
          onClose={() => setDialogOpen(false)}
        />
      ) : null}

      {dialogOpen && canViewImage && imageUrl ? (
        <ChatMediaDialog
          kind="image"
          src={imageUrl}
          onClose={() => setDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}
