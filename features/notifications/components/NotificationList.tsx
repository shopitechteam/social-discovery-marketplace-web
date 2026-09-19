"use client";

import Image from "next/image";
import {
  AlertCircle,
  Bell,
  Bookmark,
  CheckCheck,
  Loader2,
  Megaphone,
  MessageSquareText,
  PlayCircle,
  Store,
  UserPlus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { listTimestamp } from "@/features/messaging/lib/helpers";
import { useInfiniteScroll } from "@/features/feed/hooks/useInfiniteScroll";
import { TeamAvatar } from "@/features/team-messages/components/TeamAvatar";
import type { NotificationItem } from "../types";

interface Props {
  notifications: NotificationItem[];
  loading: boolean;
  unreadCount: number;
  hasMore: boolean;
  markingAllRead: boolean;
  onSelect: (notification: NotificationItem) => void;
  onMarkAllRead: () => void;
  onLoadMore: () => void;
}

function actorInitials(notification: NotificationItem): string {
  const name = notification.actors[0]?.displayName ?? "S";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "S"
  );
}

export function NotificationList({
  notifications,
  loading,
  unreadCount,
  hasMore,
  markingAllRead,
  onSelect,
  onMarkAllRead,
  onLoadMore,
}: Props) {
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore,
  });

  return (
    <section className="flex min-h-[calc(100svh-48px)] flex-col md:mx-auto md:h-full md:w-full md:max-w-[1600px] md:bg-app">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 md:px-0 md:py-5">
        <div>
          <h1 className="text-base font-black text-main md:text-lg">
            Notifications
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {unreadCount > 0
              ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={markingAllRead}
            className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
            aria-label="Mark all notifications as read"
            title="Mark all as read"
          >
            {markingAllRead ? (
              <Loader2 className="animate-spin text-muted" size={16} />
            ) : (
              <CheckCheck size={16} />
            )}
            <span className="hidden sm:inline">Mark all read</span>
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto pb-14 md:pb-6">
        {loading && notifications.length === 0 ? (
          <div className="space-y-4 px-4 py-5 md:px-0">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-[52svh] flex-col items-center justify-center gap-4 px-6 text-center md:min-h-[42svh] md:px-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted">
              <Bell size={22} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-black text-main">
                No notifications yet
              </h2>
              <p className="mx-auto max-w-[18rem] text-sm leading-6 text-muted">
                New followers and account updates will appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {notifications.map((notification) => {
              const actor = notification.actors[0];
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onSelect(notification)}
                  className={`flex w-full items-start gap-3 border-b border-border/70 px-4 py-3.5 text-left transition-colors md:px-0 md:py-4 ${
                    notification.isRead
                      ? "hover:bg-surface/60"
                      : "bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0">
                    {notification.type === "TEAM_MESSAGE" ? (
                      <TeamAvatar size={40} />
                    ) : actor?.avatar ? (
                      <Image
                        src={actor.avatar}
                        alt={actor.displayName}
                        fill
                        className="rounded-full object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-main text-xs font-black text-elevated">
                        {actorInitials(notification)}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-elevated text-muted">
                      {notification.type === "SAVE" ? (
                        <Bookmark size={11} />
                      ) : notification.type === "POST_REJECTED" ? (
                        <AlertCircle size={11} />
                      ) : notification.type === "POST_LIVE" ? (
                        <PlayCircle size={11} />
                      ) : notification.type === "POST_BOOSTED" ? (
                        <Megaphone size={11} />
                      ) : notification.type === "NEW_POST" ? (
                        <Store size={11} />
                      ) : notification.type === "TEAM_MESSAGE" ? (
                        <MessageSquareText size={11} />
                      ) : (
                        <UserPlus size={11} />
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`min-w-0 text-sm leading-5 text-main ${notification.isRead ? "font-medium" : "font-black"}`}>
                        {notification.body}
                      </p>
                      <span className="shrink-0 text-xs text-muted">
                        {listTimestamp(notification.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-muted">
                      {notification.title}
                    </p>
                  </div>

                  {!notification.isRead ? (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  ) : null}
                </button>
              );
            })}

            <div ref={sentinelRef} className="h-1" />

            {hasMore && loading ? (
              <div className="flex justify-center py-4" aria-hidden>
                <div className="rounded-full border border-border px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
