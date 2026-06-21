"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessagingShell } from "@/features/messaging/components/MessagingShell";
import { useUnreadConversationCount } from "@/features/messaging/hooks/useUnreadCount";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationItem } from "../types";
import { NotificationList } from "./NotificationList";

type SubTab = "messages" | "notifications";

interface Props {
  lang: string;
}

/**
 * Inbox screen with two subtabs — Messages and Notifications — sharing one
 * sticky header at the top. Messages renders the existing MessagingShell;
 * Notifications is an empty placeholder until the notifications API lands.
 *
 * The active subtab is mirrored to the URL (?tab=notifications) so a reload or
 * back-navigation lands on the same tab. Defaults to Messages.
 */
export function NotificationsScreen({ lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab: SubTab =
    searchParams.get("tab") === "notifications" ? "notifications" : "messages";
  const [tab, setTab] = useState<SubTab>(initialTab);
  const unreadThreads = useUnreadConversationCount();
  const notifications = useNotifications();

  // Always land at the top on mount. Returning from a chat detail otherwise
  // restores the previous scroll position, leaving the inbox scrolled down.
  // Deferred to the next frame so it wins over the router's scroll restoration.
  useEffect(() => {
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleTabChange(next: SubTab) {
    if (next === tab) return;
    setTab(next);
    // Shallow URL sync — don't add history noise, replace the current entry.
    const params = new URLSearchParams(searchParams.toString());
    if (next === "messages") params.delete("tab");
    else params.set("tab", next);
    const query = params.toString();
    router.replace(`/${lang}/notifications${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }

  async function handleNotificationSelect(notification: NotificationItem) {
    if (!notification.isRead) {
      await notifications.markRead(notification.id);
    }
    // Follow notifications open the Followers list with the actors from THIS
    // notification flagged as "New" (via ?new=), so you can see exactly who
    // just followed — not just one profile or the whole list unmarked.
    if (notification.type === "FOLLOW") {
      const newIds = notification.actors.map((a) => a.id).join(",");
      const query = newIds ? `?new=${encodeURIComponent(newIds)}` : "";
      router.push(`/${lang}/profile/followers${query}`);
      return;
    }
    if (notification.actionPath) {
      router.push(`/${lang}${notification.actionPath}`);
    }
  }

  const subtabs: { id: SubTab; label: string; badge?: number }[] = [
    { id: "messages", label: "Messages", badge: unreadThreads },
    { id: "notifications", label: "Notifications", badge: notifications.unreadCount },
  ];

  return (
    <div className="min-h-svh bg-app">
      {/* ── Sticky subtab header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-app/80 backdrop-blur-md border-b border-default">
        <div className="flex gap-0 px-4">
          {subtabs.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleTabChange(sub.id)}
              className={`relative flex-1 border-b-2 pt-3 pb-2.5 text-[14.5px] font-semibold transition-colors ${
                tab === sub.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                {sub.label}
                {sub.badge && sub.badge > 0 ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
                    {sub.badge > 99 ? "99+" : sub.badge}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Tab panels ────────────────────────────────────────────────── */}
      {tab === "messages" ? (
        <MessagingShell lang={lang} />
      ) : (
        <NotificationList
          notifications={notifications.notifications}
          loading={notifications.loading}
          unreadCount={notifications.unreadCount}
          hasMore={notifications.hasMore}
          markingAllRead={notifications.markingAllRead}
          onSelect={(notification) => {
            void handleNotificationSelect(notification);
          }}
          onMarkAllRead={() => {
            void notifications.markAllRead();
          }}
          onLoadMore={() => {
            void notifications.loadMore();
          }}
        />
      )}
    </div>
  );
}
