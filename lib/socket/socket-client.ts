/**
 * Socket.IO client singleton.
 *
 * - One connection per browser tab, created lazily on first use.
 * - Authenticates via JWT access token from the auth store (re-attached on reconnect).
 * - Auto-reconnects with exponential back-off (Socket.IO default).
 * - Export `getSocket()` wherever you need the raw Socket instance.
 * - Prefer the `useSocket()` React hook for components.
 */

import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";

// Socket.IO server is on the same host as the REST API (not the /graphql WS path)
const WS_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

let socket: Socket | null = null;

/**
 * Return the shared Socket instance, creating it on first call.
 * Must only be called in browser context (not during SSR).
 */
export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(WS_URL, {
    // Pass JWT in handshake auth (preferred — not visible in URL/logs)
    auth: (cb) => {
      const token = useAuthStore.getState().accessToken;
      cb({ token });
    },
    transports: ["websocket", "polling"],
    autoConnect: false, // We connect explicitly after auth is confirmed
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30_000,
  });

  socket.on("connect", () => {
    console.debug("[WS] connected", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.debug("[WS] disconnected", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[WS] connect error", err.message);
  });

  return socket;
}

/**
 * Connect (or reconnect) the shared socket.
 * Refreshes the auth token before reconnecting so the handshake uses the latest token.
 */
export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

/**
 * Gracefully disconnect. Called on logout.
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
