"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { listTimestamp } from "@/features/messaging/lib/helpers";
import { useTeamThread } from "../hooks/useTeamThread";
import { TEAM_DISPLAY_NAME, TEAM_THREAD_PATH } from "../types";
import { TeamAvatar } from "./TeamAvatar";

/**
 * Pinned first row of the inbox — the member's thread with the Shopi team.
 * Renders nothing until the team has sent them a message.
 */
export function TeamThreadRow({ lang }: { lang: string }) {
  const { thread } = useTeamThread();
  if (!thread) return null;

  const unread = thread.unreadCount > 0;

  return (
    <Link
      href={`/${lang}${TEAM_THREAD_PATH}`}
      className="flex w-full items-start gap-3 border-b border-[rgb(var(--color-border)/0.6)] px-4 py-3 text-left transition-colors hover:bg-primary/5 md:px-6 md:py-4"
    >
      <TeamAvatar />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1 truncate text-sm font-semibold">
            {TEAM_DISPLAY_NAME}
            <BadgeCheck size={15} className="shrink-0 text-primary" aria-label="Official" />
          </p>
          <span className="shrink-0 text-xs text-muted">{listTimestamp(thread.lastMessageAt)}</span>
        </div>
        <p
          className={`mt-1 truncate ${unread ? "font-semibold text-default" : "text-muted"}`}
          style={{ fontSize: "var(--text-sm)" }}
        >
          {thread.lastMessagePreview}
        </p>
      </div>

      {unread ? (
        <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {thread.unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
