"use client";

import { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { useSocket } from "@/hooks/useSocket";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/useUnreadNotificationCount";
import {
  DirectConversationRemovedPayload,
  DirectConversationUpdatedPayload,
  DirectMessageCreatedPayload,
  WS_EVENTS,
} from "@/lib/socket/socket-events";
import { MY_UNREAD_CONVERSATION_COUNT } from "../graphql/operations";

/**
 * Total unread direct-conversation count for the bottom-nav badge. Backed by the
 * myUnreadDirectConversationCount query, refetched on DM socket events so the
 * badge stays live (TikTok/WhatsApp style) without polling.
 */
export function useUnreadConversationCount(): number {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { on } = useSocket();

  // cache-first, NOT cache-and-network: the badge re-mounts on every navigation
  // (the bottom nav unmounts on chat-detail routes), and cache-and-network would
  // fire a network request each time — the "icon loading on back" flicker. The
  // count is kept live by the socket-driven refetch() handlers below instead.
  const { data, refetch } = useQuery(MY_UNREAD_CONVERSATION_COUNT, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-first",
  });

  // A new incoming message (not from me) or a conversation-updated event can
  // change the unread total — refetch the authoritative count.
  useEffect(
    () =>
      on<DirectMessageCreatedPayload>(WS_EVENTS.DM_MESSAGE_CREATED, (payload) => {
        if (payload.senderId !== currentUserId) void refetch();
      }),
    [currentUserId, on, refetch],
  );

  useEffect(
    () => on<DirectConversationUpdatedPayload>(WS_EVENTS.DM_CONVERSATION_UPDATED, () => void refetch()),
    [on, refetch],
  );

  useEffect(
    () =>
      on<DirectConversationRemovedPayload>(
        WS_EVENTS.DM_CONVERSATION_REMOVED,
        () => void refetch(),
      ),
    [on, refetch],
  );

  if (!isAuthenticated) return 0;
  return (
    (data as { myUnreadDirectConversationCount?: number } | undefined)
      ?.myUnreadDirectConversationCount ?? 0
  );
}

export function useInboxUnreadCount(): number {
  const unreadConversations = useUnreadConversationCount();
  const unreadNotifications = useUnreadNotificationCount();
  return unreadConversations + unreadNotifications;
}
