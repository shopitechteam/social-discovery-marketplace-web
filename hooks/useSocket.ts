"use client";

/**
 * useSocket — manages the WebSocket connection lifecycle.
 *
 * Connect when the user is authenticated, disconnect on logout.
 * Returns the socket instance and a stable `on` helper that auto-cleans up.
 *
 * Usage:
 *   const { on } = useSocket();
 *   useEffect(() => on(WS_EVENTS.MEDIA_READY, handler), [on]);
 */

import { useEffect, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";
import { getSocket, connectSocket, disconnectSocket } from "@/lib/socket";

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef = useRef<Socket | null>(null);

  // Connect when authenticated, disconnect when logged out
  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    const s = getSocket();
    socketRef.current = s;
    connectSocket();

    return () => {
      // Don't disconnect on unmount — keep the single connection alive.
      // Only disconnect on logout (accessToken becomes null above).
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
      const s = getSocket();
      s.on(event, handler);
      return () => {
        s.off(event, handler);
      };
    },
    [],
  );

  return {
    socket: socketRef.current,
    on,
    connectSocket,
    disconnectSocket,
  };
}
