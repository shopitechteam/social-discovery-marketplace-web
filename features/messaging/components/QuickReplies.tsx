"use client";

/**
 * Canned quick-reply chips ("peels") shown above the composer. Tapping one
 * sends that message immediately — a one-tap way to ask the common buyer/seller
 * questions without typing.
 */

const QUICK_REPLIES = [
  "Is this still available?",
  "What's the last price?",
  "Location please?",
  "Please call me",
  "Can I see more photos?",
  "Can we meet up?",
] as const;

interface Props {
  /** Hidden while the conversation can't accept messages. */
  disabled?: boolean;
  onSend: (text: string) => void;
}

export function QuickReplies({ disabled, onSend }: Props) {
  if (disabled) return null;

  return (
    <div
      className="mb-2 flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {QUICK_REPLIES.map((text) => (
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
