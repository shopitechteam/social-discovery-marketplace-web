"use client";

import { AlertCircle, Clock } from "lucide-react";
import type { Message } from "../types";
import { normalizeEnum } from "../lib/helpers";

/** Resolve a message's delivery state into a WhatsApp-style indicator key. */
function resolveState(message: Message): "pending" | "failed" | "sent" | "delivered" | "read" {
  if (message.pendingStatus === "failed") return "failed";
  if (message.pendingStatus === "uploading" || message.pendingStatus === "sending") return "pending";

  const status = normalizeEnum(message.deliveryStatus);
  if (status === "read" || message.readAt) return "read";
  if (status === "delivered" || message.deliveredAt) return "delivered";
  return "sent";
}

/** Single / double tick SVG (WhatsApp style). */
function Ticks({ double, color }: { double: boolean; color: string }) {
  return (
    <svg width="16" height="11" viewBox="0 0 18 12" fill="none" aria-hidden>
      {/* first tick */}
      <path
        d={double ? "M1 6.2 3.6 9 9 2.2" : "M1.5 6.2 4.4 9 11 1.6"}
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* second tick (offset) */}
      {double && (
        <path
          d="M6.4 6.2 9 9 16 1.6"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/**
 * WhatsApp-style status indicator for messages I sent:
 *   sending/uploading → clock · failed → red alert
 *   sent → 1 gray tick · delivered → 2 gray ticks · seen → 2 blue ticks
 */
export function MessageTicks({ message }: { message: Message }) {
  const state = resolveState(message);

  if (state === "failed") {
    return <AlertCircle size={13} className="text-red-300" aria-label="Failed to send" />;
  }
  if (state === "pending") {
    return <Clock size={12} className="opacity-80" aria-label="Sending" />;
  }

  // "Seen" ticks use a clear blue regardless of bubble color (matches WhatsApp).
  const blue = "#34B7F1";
  // On my (brand-colored) bubble, gray ticks read better as translucent white.
  const gray = "rgba(255,255,255,0.85)";

  if (state === "read") return <Ticks double color={blue} />;
  if (state === "delivered") return <Ticks double color={gray} />;
  return <Ticks double={false} color={gray} />;
}
