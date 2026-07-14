"use client";

import { useCallback, useEffect, useRef } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import {
  MY_DIRECT_CONVERSATIONS,
  MY_WEB_PUSH_STATUS,
} from "@/features/messaging/graphql/operations";
import { MY_NOTIFICATIONS } from "../graphql/operations";

const CONVERSATION_PAGE_SIZE = 40;
const NOTIFICATION_PAGE_SIZE = 30;

/**
 * Warms the private inbox cache after authentication, while the browser is
 * idle. RSC PreloadQuery cannot do this because Shopi's JWT is intentionally
 * stored only in the client auth store and is unavailable to the server.
 */
export function usePreloadInbox() {
  const client = useApolloClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const preloadedTokenRef = useRef<string | null>(null);

  const preload = useCallback(() => {
    if (!accessToken || preloadedTokenRef.current === accessToken) return;
    preloadedTokenRef.current = accessToken;

    void Promise.allSettled([
      client.query({
        query: MY_DIRECT_CONVERSATIONS,
        variables: { limit: CONVERSATION_PAGE_SIZE },
        // Private data must be populated for this exact token. The app's Apollo
        // cache survives logout today, so cache-first could expose a previous
        // session's inbox briefly before the route refreshes.
        fetchPolicy: "network-only",
      }),
      client.query({
        query: MY_NOTIFICATIONS,
        variables: { limit: NOTIFICATION_PAGE_SIZE },
        fetchPolicy: "network-only",
      }),
      client.query({
        query: MY_WEB_PUSH_STATUS,
        fetchPolicy: "network-only",
      }),
    ]);
  }, [accessToken, client]);

  useEffect(() => {
    if (!accessToken) {
      preloadedTokenRef.current = null;
      return;
    }

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(preload, 250);
    return () => clearTimeout(timeoutId);
  }, [accessToken, preload]);
}
