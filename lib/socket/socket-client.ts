/**
 * Socket.IO client singleton.
 *
 * - One connection per browser tab, created lazily on first use and kept open
 *   for the whole session — signed in or not. Logged-out visitors connect as
 *   guests; the server upgrades them when the socket re-handshakes with a JWT.
 * - Authenticates via the JWT access token from the auth store, re-read on
 *   every connection attempt (so reconnects always carry the latest token).
 * - Re-handshakes automatically when the signed-in identity changes
 *   (login / logout / account switch). JWT auth only happens at handshake
 *   time, so without this the server never re-registers the socket into the
 *   new user's private room and no DM/typing events arrive.
 * - A handshake denied by the server middleware (e.g. expired JWT) is FINAL
 *   for Socket.IO — it never retries on its own. We refresh the token and
 *   reconnect manually with backoff instead of leaving a dead socket.
 * - Export `getSocket()` wherever you need the raw Socket instance.
 * - Prefer the `useSocket()` React hook for components.
 */

import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";
import { refreshAccessToken } from "@/lib/auth/refresh-token";

// Socket.IO server is on the same host as the REST API (not the /graphql WS path)
const WS_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

let socket: Socket | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 1_000;

/**
 * JWT subject WITHOUT verification — only used to detect an identity change
 * (login/logout/account switch) so we know when a re-handshake is required.
 */
function tokenSubject(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
      sub?: string;
      id?: string;
    };
    return payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}

/** Manual reconnect with capped exponential backoff (for denied handshakes). */
function scheduleReconnect(): void {
  if (retryTimer || socket?.connected) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    if (socket && !socket.connected) socket.connect();
  }, retryDelay);
  retryDelay = Math.min(retryDelay * 2, 30_000);
}

/**
 * Return the shared Socket instance, creating it on first call.
 * Must only be called in browser context (not during SSR).
 */
export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(WS_URL, {
    // Pass JWT in handshake auth (preferred — not visible in URL/logs).
    // Re-read from the store on EVERY attempt; no token → guest connection.
    auth: (cb) => {
      const token = useAuthStore.getState().accessToken;
      cb(token ? { token } : {});
    },
    transports: ["websocket", "polling"],
    // If the websocket transport itself fails (proxy, CSP, firewall), fall
    // back to long-polling instead of retrying websocket forever.
    tryAllTransports: true,
    autoConnect: false, // We connect explicitly from useSocket()
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30_000,
  });

  socket.on("connect", () => {
    retryDelay = 1_000;
    console.debug("[WS] connected", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.debug("[WS] disconnected", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[WS] connect error", err.message);

    // `active` = Socket.IO will retry by itself (transport-level failure).
    // Inactive means the server middleware DENIED the handshake (invalid or
    // expired JWT) — Socket.IO never retries that, which used to leave the tab
    // with a permanently dead socket (no typing, no real-time) until reload.
    if (socket?.active) return;

    void (async () => {
      const { accessToken, refreshToken, clearAuth } = useAuthStore.getState();
      if (accessToken) {
        const fresh = refreshToken ? await refreshAccessToken() : null;
        // Unrecoverable session (refresh also rejected) → drop it and fall
        // back to a guest connection, mirroring the Apollo error link.
        if (!fresh) clearAuth();
      }
      scheduleReconnect();
    })();
  });

  // Re-handshake when the signed-in identity changes. The subscription lives
  // for the app's lifetime — the socket is a tab-wide singleton.
  let lastSubject = tokenSubject(useAuthStore.getState().accessToken);
  useAuthStore.subscribe((state) => {
    const subject = tokenSubject(state.accessToken);

    if (subject === lastSubject) {
      // Same user: a routine token refresh doesn't need a reconnect (auth is
      // only checked at handshake), but a socket that died while the old token
      // was expired should retry now that a fresh one exists.
      if (state.accessToken && socket && !socket.connected && !socket.active) {
        socket.connect();
      }
      return;
    }

    lastSubject = subject;
    if (!socket) return;
    // Force a fresh handshake so the server re-authenticates and joins the
    // correct `user:{id}` room (or none, after logout).
    socket.disconnect();
    socket.connect();
  });

  return socket;
}

/**
 * Connect (or reconnect) the shared socket. Safe to call repeatedly.
 * The handshake picks up the latest token (or none) from the auth store.
 */
export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

/**
 * Gracefully disconnect. Not called on logout anymore — the socket stays up
 * as a guest connection — but kept for explicit teardown needs.
 */
export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
