"use client";

/**
 * useSocket — manages the WebSocket connection lifecycle.
 *
 * The socket connects on mount and stays up for the whole session, signed in
 * or not (guests connect anonymously; the server upgrades them after login).
 * Identity changes (login/logout/account switch) are handled inside
 * socket-client, which re-handshakes with the latest token automatically.
 * Returns stable subscription/connect helpers that auto-clean up.
 *
 * Usage:
 *   const { on } = useSocket();
 *   useEffect(() => on(WS_EVENTS.MEDIA_READY, handler), [on]);
 */

import { useEffect, useCallback } from "react";
import type { Socket } from "socket.io-client";

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

/**
 * Run `fn` once the browser is genuinely idle, with a hard deadline so it still
 * runs on browsers without requestIdleCallback (Safari) or on a page that never
 * goes idle. Returns a canceller.
 */
function whenIdle(fn: () => void, timeout = 2_000): () => void {
  if (typeof window === "undefined") return () => {};

  const ric = window.requestIdleCallback;
  if (typeof ric === "function") {
    const handle = ric(fn, { timeout });
    return () => window.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(fn, 1_000);
  return () => window.clearTimeout(handle);
}

export function useSocket() {
  // Connect once on mount, regardless of auth state. Logout no longer tears
  // the socket down — socket-client re-handshakes as a guest instead, so the
  // connection is warm the moment the user signs back in.
  //
  // The connect is deferred to the first idle period rather than fired straight
  // from the mount effect. This provider sits at the root of every authenticated
  // layout, so on the feed the handshake (chunk download → DNS → TLS → upgrade,
  // plus a polling fallback attempt when the upgrade fails) used to run head-to-
  // head with the LCP thumbnail for connections and main-thread time. Nothing on
  // first paint reads from the socket — it drives inbox/typing/presence updates —
  // so idle is early enough, and `on()` below still forces the module to load
  // immediately for any component that subscribes before then.
  useEffect(() => {
    let active = true;

    const cancel = whenIdle(() => {
      void loadSocketClient().then(({ connectSocket }) => {
        if (!active) return;
        connectSocket();
      });
    });

    return () => {
      active = false;
      cancel();
    };
  }, []);

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
        // A subscriber is proof the socket is actually wanted now, so don't
        // wait for the idle connect above — otherwise a component that mounts
        // and subscribes inside the idle window (opening a chat straight from
        // a cold load) would attach to a socket nothing had connected yet.
        // connectSocket() is a no-op once connected.
        mod.connectSocket();
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
