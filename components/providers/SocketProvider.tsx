"use client";

/**
 * SocketProvider — mounts at the root of authenticated layouts.
 *
 * Calls useSocket() which connects the Socket.IO client for the whole session,
 * signed in or not — guests connect anonymously and the socket re-handshakes
 * with the JWT when the user logs in (handled inside socket-client).
 *
 * Renders nothing — purely a side-effect component.
 */

import { useSocket } from "@/hooks/useSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Side-effect: connect/disconnect based on auth state
  useSocket();
  return <>{children}</>;
}
