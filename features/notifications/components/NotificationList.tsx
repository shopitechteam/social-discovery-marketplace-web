"use client";

import Image from "next/image";
import {
  Bell,
  Bookmark,
  CheckCheck,
  Loader2,
  PlayCircle,
  UserPlus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { shortTime } from "@/features/messaging/lib/helpers";
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
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S";
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
  return (
    <section className="flex min-h-[calc(100svh-48px)] flex-col">
      <div
        className="flex items-center justify-between border-b px-4 py-4"
        style={{ borderColor: "rgb(var(--color-border))" }}
      >
        <div>
          <h1 className="font-semibold" style={{ fontSize: "var(--text-xl)" }}>
            Notifications
          </h1>
          <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
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
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:opacity-60"
            style={{ borderColor: "rgb(var(--color-border))" }}
            aria-label="Mark all notifications as read"
            title="Mark all as read"
          >
            {markingAllRead ? (
              <Loader2 className="animate-spin text-muted" size={16} />
            ) : (
              <CheckCheck size={16} />
            )}
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto pb-14">
        {loading && notifications.length === 0 ? (
          <div className="space-y-3 px-4 py-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex min-h-[52svh] flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bell size={28} />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-semibold text-default" style={{ fontSize: "var(--text-lg)" }}>
                No notifications yet
              </h2>
              <p className="mx-auto max-w-[18rem] text-muted leading-relaxed" style={{ fontSize: "var(--text-sm)" }}>
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
                  className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor: "rgb(var(--color-border) / 0.6)",
                    // LinkedIn-style: unread rows get a subtle blue wash.
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "rgb(59 130 246 / 0.10)",
                  }}
                >
                  <div className="relative h-12 w-12 shrink-0">
                    {actor?.avatar ? (
                      <Image
                        src={actor.avatar}
                        alt={actor.displayName}
                        fill
                        className="rounded-full object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {actorInitials(notification)}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white ring-2 ring-[rgb(var(--color-bg))]">
                      {notification.type === "SAVE" ? (
                        <Bookmark size={13} />
                      ) : notification.type === "POST_LIVE" ? (
                        <PlayCircle size={13} />
                      ) : (
                        <UserPlus size={13} />
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`min-w-0 leading-snug ${
                          notification.isRead ? "text-default" : "font-semibold text-default"
                        }`}
                        style={{ fontSize: "var(--text-sm)" }}
                      >
                        {notification.body}
                      </p>
                      <span className="shrink-0 text-xs text-muted">
                        {shortTime(notification.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {notification.title}
                    </p>
                  </div>

                  {!notification.isRead ? (
                    <span
                      className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: "rgb(59 130 246)" }}
                    />
                  ) : null}
                </button>
              );
            })}

            {hasMore ? (
              <div className="px-4 py-4">
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="h-10 w-full rounded-full border text-sm font-semibold"
                  style={{ borderColor: "rgb(var(--color-border))" }}
                >
                  Load more
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
