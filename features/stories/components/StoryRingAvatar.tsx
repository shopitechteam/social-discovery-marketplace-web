"use client";

import Image from "next/image";
import type { StoryRing, StoryUser } from "../hooks/useStoriesFeed";

interface Props {
  ring?: StoryRing;
  user?: StoryUser;
  /** Own avatar add-story button (no ring, just "+" badge) */
  isOwn?: boolean;
  isUploading?: boolean;
  hasOwnStory?: boolean;
  onClick: () => void;
  size?: number;
}

function getInitials(user?: StoryUser): string {
  const first = user?.profile?.firstName?.[0] ?? "";
  const last = user?.profile?.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

export function StoryRingAvatar({
  ring,
  user,
  isOwn,
  isUploading,
  hasOwnStory,
  onClick,
  size = 56,
}: Props) {
  const displayUser = ring?.user ?? user;
  const avatar = displayUser?.profile?.avatar;
  const hasUnviewed = ring?.hasUnviewed ?? false;
  const label = ring
    ? `${displayUser?.profile?.firstName ?? "User"}'s story`
    : "Add story";

  // Ring state: unviewed = primary red, viewed = gray, none = gray dashed
  const ringClass = (() => {
    if (isUploading) return "ring-primary/60 ring-2 animate-pulse";
    if (isOwn && !hasOwnStory) return "ring-dashed ring-2 ring-muted-foreground/40";
    if (isOwn && hasOwnStory) return "ring-2 ring-primary";
    if (hasUnviewed) return "ring-2 ring-primary";
    return "ring-2 ring-muted-foreground/30";
  })();

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-none"
      style={{ minWidth: size + 16 }}
      aria-label={label}
    >
      {/* Avatar with ring */}
      <div
        className={`relative rounded-full ring-offset-2 ring-offset-background ${ringClass}`}
        style={{ width: size, height: size }}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={label}
            fill
            className="rounded-full object-cover"
            sizes={`${size}px`}
          />
        ) : (
          <div
            className="w-full h-full rounded-full bg-surface flex items-center justify-center text-muted-foreground font-semibold text-sm"
            style={{ fontSize: size * 0.28 }}
          >
            {getInitials(displayUser)}
          </div>
        )}

        {/* Own user: "+" add button */}
        {isOwn && !isUploading && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
              <path d="M5 1v8M1 5h8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Own user: uploading spinner */}
        {isOwn && isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Username label */}
      <span className="text-[10px] text-default text-center leading-tight max-w-[56px] truncate">
        {isOwn
          ? "Your story"
          : displayUser?.profile?.firstName ?? "User"}
      </span>
    </button>
  );
}
