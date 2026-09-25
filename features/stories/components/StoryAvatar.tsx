"use client";

import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { avatarGradient } from "@/lib/avatar";

/**
 * - unseen:     Shopi-coloured ring — something new to watch
 * - seen:       no ring — everything here has been watched
 * - none:       no ring — no story (e.g. "Your story" before posting)
 * - uploading:  ring fills as the file uploads
 * - processing: spinning arc while the server finishes it
 */
export type StoryRingState = "unseen" | "seen" | "none" | "uploading" | "processing";

const STROKE = 2.5;
const GAP = 3;

interface Props {
  /** Used for the fallback gradient when there's no photo. */
  id: string;
  src?: string | null;
  name: string;
  /** Outer diameter in px, ring included. Seen and unseen are the same size. */
  size: number;
  state: StoryRingState;
  /** 0–1, while uploading. */
  progress?: number;
  /**
   * With no photo: the first letter on the person's colour, or — for the
   * viewer's own "Your story" slot, which may be a guest with no id — a plain
   * person icon.
   */
  fallback?: "initial" | "person";
}

export function StoryAvatar({
  id,
  src,
  name,
  size,
  state,
  progress = 0,
  fallback = "initial",
}: Props) {
  const center = size / 2;
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const inner = size - 2 * (STROKE + GAP);
  const brand = "rgb(var(--brand-primary))";
  // Social-login avatars expire; a dead URL falls back like a missing one
  // instead of showing a broken image in the tray.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <span className="relative block shrink-0" style={{ width: size, height: size }}>
      {state !== "seen" && state !== "none" && (
        <svg
          className={
            state === "processing"
              ? "absolute inset-0 animate-spin animation-duration-[1.2s]"
              : "absolute inset-0"
          }
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          {state === "unseen" && (
            <circle cx={center} cy={center} r={radius} fill="none" stroke={brand} strokeWidth={STROKE} />
          )}
          {state === "uploading" && (
            <>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="rgb(var(--brand-primary) / 0.18)"
                strokeWidth={STROKE}
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={brand}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - Math.min(Math.max(progress, 0.02), 1))}
                transform={`rotate(-90 ${center} ${center})`}
                style={{ transition: "stroke-dashoffset 200ms linear" }}
              />
            </>
          )}
          {state === "processing" && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={brand}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.3} ${circumference}`}
            />
          )}
        </svg>
      )}

      <span
        className="absolute overflow-hidden rounded-full bg-surface"
        style={{ inset: STROKE + GAP }}
      >
        {src && src !== failedSrc ? (
          <Image
            src={src}
            alt=""
            fill
            sizes={`${Math.ceil(inner)}px`}
            className="object-cover"
            onError={() => setFailedSrc(src)}
            // Blob previews of a photo being posted can't go through the optimizer.
            unoptimized={src.startsWith("blob:")}
          />
        ) : fallback === "person" ? (
          <span className="flex h-full w-full items-center justify-center text-muted" aria-hidden>
            <UserRound size={inner * 0.5} strokeWidth={1.75} />
          </span>
        ) : (
          <span
            className={`flex h-full w-full items-center justify-center bg-linear-to-br ${avatarGradient(id)} font-bold text-white`}
            style={{ fontSize: inner * 0.36 }}
            aria-hidden
          >
            {name.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </span>
    </span>
  );
}
