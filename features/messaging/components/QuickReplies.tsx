"use client";

/**
 * Canned quick-reply chips ("peels") shown above the composer. Tapping one
 * sends that message immediately — a one-tap way to ask the common buyer/seller
 * questions without typing.
 */

import type { Conversation } from "../types";

interface Props {
  /** Hidden while the conversation can't accept messages. */
  disabled?: boolean;
  conversation?: Conversation | null;
  currentUserId?: string | null;
  onSend: (text: string) => void;
}

function buildQuickReplies(
  conversation?: Conversation | null,
  currentUserId?: string | null,
) {
  const isSeller = Boolean(
    conversation && currentUserId && conversation.sellerId === currentUserId,
  );
  const lifecycle = conversation?.lifecycleStatus;

  if (isSeller) {
    if (lifecycle === "ready_to_close") {
      return [
        "Yes, let's close this today.",
        "I'll share the exact location now.",
        "Pickup works for me.",
        "What time can you come?",
        "Cash on pickup is okay.",
      ];
    }

    return [
      "Yes, it's still available.",
      "Here's my best price.",
      "I'll share the location now.",
      "I can send more photos.",
      "Pickup is possible.",
      "What time works for you?",
    ];
  }

  if (lifecycle === "ready_to_close") {
    return [
      "I'm ready to buy.",
      "Please share the exact location.",
      "Can we meet today?",
      "What's your final price?",
      "I'll confirm shortly.",
    ];
  }

  return [
    "Is this still available?",
    "What's the last price?",
    "Location please?",
    "Can I see more photos?",
    "Can we meet up?",
    "I'm interested.",
  ];
}

export function QuickReplies({ disabled, conversation, currentUserId, onSend }: Props) {
  if (disabled) return null;
  const quickReplies = buildQuickReplies(conversation, currentUserId);

  return (
    <div
      className="mb-2 flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {quickReplies.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSend(text)}
          className="shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
          style={{ borderColor: "rgb(var(--color-border))" }}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
