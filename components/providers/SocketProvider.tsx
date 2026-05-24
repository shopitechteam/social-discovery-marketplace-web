"use client";

/**
 * SocketProvider — mounts at the root of authenticated layouts.
 *
 * Calls useSocket() which:
 *   - Connects the Socket.IO client when the user has a valid access token
 *   - Disconnects automatically on logout
 *
 * Renders nothing — purely a side-effect component.
 */

import { useSocket } from "@/hooks/useSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Side-effect: connect/disconnect based on auth state
  useSocket();
  return <>{children}</>;
}
