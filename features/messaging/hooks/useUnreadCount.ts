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
import {
  MY_UNREAD_CONVERSATION_COUNT,
  MY_UNREAD_MESSAGE_COUNT,
} from "../graphql/unread";

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
  useEffect(() => {
    if (!isAuthenticated) return;
    return on<DirectMessageCreatedPayload>(
      WS_EVENTS.DM_MESSAGE_CREATED,
      (payload) => {
        if (payload.senderId !== currentUserId) void refetch();
      },
    );
  }, [currentUserId, isAuthenticated, on, refetch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    return on<DirectConversationUpdatedPayload>(
      WS_EVENTS.DM_CONVERSATION_UPDATED,
      () => void refetch(),
    );
  }, [isAuthenticated, on, refetch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    return on<DirectConversationRemovedPayload>(
      WS_EVENTS.DM_CONVERSATION_REMOVED,
      () => void refetch(),
    );
  }, [isAuthenticated, on, refetch]);

  if (!isAuthenticated) return 0;
  return (
    (data as { myUnreadDirectConversationCount?: number } | undefined)
      ?.myUnreadDirectConversationCount ?? 0
  );
}

/**
 * Unread *messages* across every thread — the number a badge should show.
 *
 * {@link useUnreadConversationCount} counts threads, which reads as wrong on a
 * badge: four new messages from one person showed as "1". Kept live by the same
 * socket events, for the same reason.
 */
export function useUnreadMessageCount(): number {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { on } = useSocket();

  const { data, refetch } = useQuery(MY_UNREAD_MESSAGE_COUNT, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-first",
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    return on<DirectMessageCreatedPayload>(
      WS_EVENTS.DM_MESSAGE_CREATED,
      (payload) => {
        if (payload.senderId !== currentUserId) void refetch();
      },
    );
  }, [currentUserId, isAuthenticated, on, refetch]);

  // Reading or removing a thread clears its messages from the total, so the
  // badge has to re-read on the same events the thread count does.
  useEffect(() => {
    if (!isAuthenticated) return;
    return on<DirectConversationUpdatedPayload>(
      WS_EVENTS.DM_CONVERSATION_UPDATED,
      () => void refetch(),
    );
  }, [isAuthenticated, on, refetch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    return on<DirectConversationRemovedPayload>(
      WS_EVENTS.DM_CONVERSATION_REMOVED,
      () => void refetch(),
    );
  }, [isAuthenticated, on, refetch]);

  if (!isAuthenticated) return 0;
  return (
    (data as { myUnreadDirectMessageCount?: number } | undefined)
      ?.myUnreadDirectMessageCount ?? 0
  );
}

export function useInboxUnreadCount(): number {
  const unreadMessages = useUnreadMessageCount();
  const unreadNotifications = useUnreadNotificationCount();
  return unreadMessages + unreadNotifications;
}
