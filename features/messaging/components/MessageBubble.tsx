"use client";

import Image from "next/image";
import { Loader2, Play, RotateCw, X } from "lucide-react";
import type { Message } from "../types";
import { imageForMessage, mediaStatus, messageKind, shortTime } from "../lib/helpers";
import { MessageTicks } from "./MessageTicks";

interface Props {
  message: Message;
  mine: boolean;
  onRetry?: (message: Message) => void;
  onDiscard?: (message: Message) => void;
}

/** A single chat bubble — text and/or media, timestamp, and (for mine) status. */
export function MessageBubble({ message, mine, onRetry, onDiscard }: Props) {
  const kind = messageKind(message.type);
  const status = mediaStatus(message.mediaAsset?.status);
  const imageUrl = imageForMessage(message);
  const videoThumb =
    message.localPreviewUrl ??
    message.mediaAsset?.muxMeta?.thumbnailUrl ??
    message.mediaAsset?.thumbnailUrl ??
    null;

  // Optimistic lifecycle (only set on messages I just sent locally)
  const isFailed = message.pendingStatus === "failed";
  const isUploading = message.pendingStatus === "uploading" || message.pendingStatus === "sending";

  // Media overlay shown while the local upload is in flight or has failed.
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
                className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-semibold text-black"
                style={{ fontSize: "var(--text-xs)" }}
              >
                <RotateCw size={13} /> Retry
              </button>
              <button
                type="button"
                onClick={() => onDiscard?.(message)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40"
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
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 ${mine ? "rounded-br-md text-white" : "rounded-bl-md"}`}
        style={{
          backgroundColor: mine ? "rgb(var(--brand-primary))" : "rgb(var(--color-bg-elevated))",
          border: mine ? "none" : "1px solid rgb(var(--color-border))",
        }}
      >
        {kind === "image" && (
          <div className="relative mb-2 overflow-hidden rounded-xl bg-black/5">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Attachment"
                width={320}
                height={320}
                className="h-auto w-full object-cover"
                unoptimized={imageUrl.startsWith("blob:")}
              />
            ) : (
              <div className="flex h-40 items-center justify-center">
                <Loader2 size={22} className="animate-spin opacity-60" />
              </div>
            )}
            {mediaOverlay}
          </div>
        )}

        {kind === "video" && (
          <div className="relative mb-2 overflow-hidden rounded-xl bg-black/10">
            {videoThumb ? (
              <Image
                src={videoThumb}
                alt="Video attachment"
                width={320}
                height={200}
                className="h-auto w-full object-cover"
                unoptimized={videoThumb.startsWith("blob:")}
              />
            ) : (
              <div className="flex h-40 items-center justify-center">
                <Loader2 size={22} className="animate-spin opacity-60" />
              </div>
            )}
            {!isUploading && !isFailed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
                  <Play size={16} fill="currentColor" />
                </div>
              </div>
            )}
            {mediaOverlay}
          </div>
        )}

        {message.text ? (
          <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.45 }}>{message.text}</p>
        ) : null}

        {/* Server-side processing note (after upload, not for optimistic states) */}
        {kind !== "text" && !isUploading && !isFailed && status !== "ready" ? (
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
        ) : null}

        <div
          className={`mt-1 flex items-center gap-1 ${mine ? "justify-end text-white/70" : "justify-start text-muted"}`}
          style={{ fontSize: "11px" }}
        >
          <span>{shortTime(message.createdAt)}</span>
          {mine ? <MessageTicks message={message} /> : null}
        </div>
      </div>
    </div>
  );
}
