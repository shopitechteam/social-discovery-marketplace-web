"use client";

import { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { useSocket } from "@/hooks/useSocket";
import { WS_EVENTS } from "@/lib/socket/socket-events";
import { MY_UNREAD_NOTIFICATION_COUNT } from "../graphql/operations";
import type { NotificationSocketPayload } from "../types";

export function useUnreadNotificationCount(): number {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const { on } = useSocket();

  const { data, refetch } = useQuery(MY_UNREAD_NOTIFICATION_COUNT, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-first",
  });

  useEffect(
    () =>
      on<NotificationSocketPayload>(WS_EVENTS.NOTIFICATION, () => {
        void refetch();
      }),
    [on, refetch],
  );

  if (!isAuthenticated) return 0;
  return (
    (data as { myUnreadNotificationCount?: number } | undefined)
      ?.myUnreadNotificationCount ?? 0
  );
}
