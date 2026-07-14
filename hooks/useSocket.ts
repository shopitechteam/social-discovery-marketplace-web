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
// Once the dynamic import resolves we keep the module synchronously so later
// subscriptions can attach in the same tick. The async path (below) is only
// hit on the very first cold call before the chunk has loaded.
let socketClientModule: SocketClientModule | null = null;

function loadSocketClient() {
  socketClientPromise ??= import("@/lib/socket/socket-client").then((mod) => {
    socketClientModule = mod;
    return mod;
  });
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

      const attach = (mod: SocketClientModule) => {
        if (!active) return;
        subscribedSocket = mod.getSocket();
        subscribedSocket.on(event, handler);
      };

      // Attach synchronously when the client chunk is already loaded so we never
      // miss an event fired between render and a microtask (typing/presence are
      // edge-triggered — a missed one is a missed indicator). Fall back to the
      // async import only on the first cold subscription.
      if (socketClientModule) {
        attach(socketClientModule);
      } else {
        void loadSocketClient().then(attach);
      }

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
