"use client";

/**
 * useSocket — manages the WebSocket connection lifecycle.
 *
 * Connect when the user is authenticated, disconnect on logout.
 * Returns stable subscription/connect helpers that auto-clean up.
 *
 * Usage:
 *   const { on } = useSocket();
 *   useEffect(() => on(WS_EVENTS.MEDIA_READY, handler), [on]);
 */

import { useEffect, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";

type SocketClientModule = typeof import("@/lib/socket/socket-client");

let socketClientPromise: Promise<SocketClientModule> | null = null;

function loadSocketClient() {
  socketClientPromise ??= import("@/lib/socket/socket-client");
  return socketClientPromise;
}

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);

  // Connect when authenticated, disconnect when logged out
  useEffect(() => {
    if (!accessToken) {
      // Do not download Socket.IO for anonymous visitors. If this tab had an
      // authenticated connection earlier, the already-loaded module is reused
      // to close it on logout.
      if (socketClientPromise) {
        void socketClientPromise.then(({ disconnectSocket }) =>
          disconnectSocket(),
        );
      }
      return;
    }

    let active = true;
    void loadSocketClient().then(({ connectSocket, getSocket }) => {
      if (!active) return;
      getSocket();
      connectSocket();
    });

    return () => {
      active = false;
    };
  }, [accessToken]);

  /**
   * Subscribe to a WebSocket event.
   * Returns an unsubscribe function — pass directly to useEffect's cleanup.
   *
   * @example
   * useEffect(() => on("media:ready", handler), [on]);
   */
  const on = useCallback(
    <T = unknown>(event: string, handler: (data: T) => void): (() => void) => {
      let active = true;
      let subscribedSocket: Socket | null = null;

      void loadSocketClient().then(({ getSocket }) => {
        if (!active) return;
        subscribedSocket = getSocket();
        subscribedSocket.on(event, handler);
      });

      return () => {
        active = false;
        subscribedSocket?.off(event, handler);
      };
    },
    [],
  );

  const connectSocket = useCallback(() => {
    void loadSocketClient().then((client) => client.connectSocket());
  }, []);

  const disconnectSocket = useCallback(() => {
    if (socketClientPromise) {
      void socketClientPromise.then((client) => client.disconnectSocket());
    }
  }, []);

  return {
    on,
    connectSocket,
    disconnectSocket,
  };
}
