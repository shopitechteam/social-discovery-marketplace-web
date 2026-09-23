"use client";

import { useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { useSocket } from "@/hooks/useSocket";
import { WS_EVENTS } from "@/lib/socket/socket-events";
import { MY_TEAM_THREAD } from "../graphql/operations";
import type { MyTeamThread } from "../types";

/**
 * Summary of the member's Shopi team thread for the inbox row. Null until the
 * team has messaged them; refreshes live when a team message arrives.
 */
export function useTeamThread() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const { on } = useSocket();

  const { data, loading, refetch } = useQuery(MY_TEAM_THREAD, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    return on(WS_EVENTS.TEAM_MESSAGE_CREATED, () => {
      void refetch();
    });
  }, [isAuthenticated, on, refetch]);

  const thread = (data as { myTeamThread?: MyTeamThread | null } | undefined)?.myTeamThread ?? null;

  return { thread, loading, refetch };
}
