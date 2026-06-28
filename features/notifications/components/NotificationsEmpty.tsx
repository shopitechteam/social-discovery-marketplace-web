"use client";

import { Bell } from "lucide-react";

/**
 * Placeholder UI for the Notifications subtab. There is no notifications API
 * yet, so this renders a friendly empty state in the meantime. When the feed
 * lands, swap this for the real list (keep the same outer padding/scroll).
 */
export function NotificationsEmpty() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bell size={28} />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-semibold text-default" style={{ fontSize: "var(--text-lg)" }}>
          No notifications yet
        </h2>
        <p
          className="mx-auto max-w-[18rem] text-muted leading-relaxed"
          style={{ fontSize: "var(--text-sm)" }}
        >
          Likes, comments, follows and order updates will show up here. We&apos;ll
          let you know the moment something happens.
        </p>
      </div>
    </div>
  );
}
