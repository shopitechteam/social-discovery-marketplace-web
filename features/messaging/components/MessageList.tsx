"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "../types";
import { dayKey, dayLabel } from "../lib/dateHeaders";
import { MessageBubble } from "./MessageBubble";

interface Props {
  messages: Message[];
  currentUserId?: string | null;
  typingUserId: string | null;
  otherParticipantId?: string | null;
  initialLoading: boolean;
  loadingOlder: boolean;
  hasMoreOlder: boolean;
  onLoadOlder: () => Promise<number>;
  onRetryMessage: (message: Message) => void;
  onDiscardMessage: (message: Message) => void;
}

/** A day-separator chip (Today / Yesterday / date). */
function DaySeparator({ label }: { label: string }) {
  return (
    <div className="my-3 flex justify-center">
      <span
        className="rounded-full px-3 py-1 font-medium"
        style={{
          fontSize: "var(--text-xs)",
          backgroundColor: "rgb(var(--color-bg-elevated))",
          color: "rgb(var(--color-text-muted))",
          border: "1px solid rgb(var(--color-border))",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * Scrollable message list with:
 *  - day separators + a floating date pill that tracks the top-most visible day
 *  - auto-scroll to bottom on new messages (only when already near the bottom)
 *  - infinite scroll: load older near the top, preserving scroll position
 */
export function MessageList({
  messages,
  currentUserId,
  typingUserId,
  otherParticipantId,
  initialLoading,
  loadingOlder,
  hasMoreOlder,
  onLoadOlder,
  onRetryMessage,
  onDiscardMessage,
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [floatingLabel, setFloatingLabel] = useState<string>("");
  const [showFloating, setShowFloating] = useState(false);

  // Track state needed to keep scroll stable when older messages are prepended.
  const prevScrollHeightRef = useRef(0);
  const loadingOlderRef = useRef(false);
  const lastCountRef = useRef(0);

  // Build render items: interleave day separators between messages.
  const items = useMemo(() => {
    const out: Array<
      | { type: "sep"; key: string; label: string }
      | { type: "msg"; message: Message }
    > = [];
    let lastDay = "";
    for (const m of messages) {
      const key = dayKey(m.createdAt);
      if (key !== lastDay) {
        out.push({
          type: "sep",
          key: `sep-${key}`,
          label: dayLabel(m.createdAt),
        });
        lastDay = key;
      }
      out.push({ type: "msg", message: m });
    }
    return out;
  }, [messages]);

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  // Auto-scroll to bottom: on first load, and on new messages when near bottom.
  useEffect(() => {
    const grew = messages.length > lastCountRef.current;
    const prependedOrSame = loadingOlderRef.current;
    lastCountRef.current = messages.length;
    if (initialLoading) return;
    if (prependedOrSame) return; // older load handles its own scroll restore
    if (grew && isNearBottom()) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages.length, initialLoading, isNearBottom]);

  // Jump to bottom when a conversation first renders its messages.
  const didInitialScrollRef = useRef(false);
  useLayoutEffect(() => {
    if (initialLoading || messages.length === 0) {
      didInitialScrollRef.current = false;
      return;
    }
    if (!didInitialScrollRef.current) {
      didInitialScrollRef.current = true;
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [initialLoading, messages.length]);

  // Preserve scroll position after older messages are prepended.
  useLayoutEffect(() => {
    if (!loadingOlderRef.current) return;
    const el = scrollRef.current;
    if (el) {
      const delta = el.scrollHeight - prevScrollHeightRef.current;
      if (delta > 0) el.scrollTop = el.scrollTop + delta;
    }
    loadingOlderRef.current = false;
  }, [messages]);

  const triggerLoadOlder = useCallback(async () => {
    const el = scrollRef.current;
    if (!el || loadingOlderRef.current || loadingOlder || !hasMoreOlder) return;
    loadingOlderRef.current = true;
    prevScrollHeightRef.current = el.scrollHeight;
    const added = await onLoadOlder();
    if (added === 0) loadingOlderRef.current = false;
  }, [hasMoreOlder, loadingOlder, onLoadOlder]);

  // IntersectionObserver on the top sentinel drives infinite scroll.
  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = topSentinelRef.current;
    if (!root || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void triggerLoadOlder();
      },
      { root, rootMargin: "120px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [triggerLoadOlder]);

  // Update the floating date pill based on the top-most visible message.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowFloating(el.scrollTop > 24);
    const dayEls = el.querySelectorAll<HTMLElement>("[data-day-label]");
    const top = el.getBoundingClientRect().top;
    let current = "";
    for (const node of Array.from(dayEls)) {
      if (node.getBoundingClientRect().top - top <= 56) {
        current = node.dataset.dayLabel ?? "";
      } else break;
    }
    if (current) setFloatingLabel(current);
  }, []);

  if (initialLoading && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-[rgb(var(--color-bg-subtle)/0.35)] px-4 py-4">
        <div className="flex h-[83vh] items-center justify-center">
          <Loader2 size={40} className="animate-spin text-primary opacity-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Floating date pill */}
      {showFloating && floatingLabel ? (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
          <span
            className="rounded-full px-3 py-1 font-medium shadow-sm"
            style={{
              fontSize: "var(--text-xs)",
              backgroundColor: "rgb(var(--color-bg-elevated))",
              color: "rgb(var(--color-text-muted))",
              border: "1px solid rgb(var(--color-border))",
            }}
          >
            {floatingLabel}
          </span>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto overscroll-contain bg-[rgb(var(--color-bg-subtle)/0.35)] px-4 py-4"
      >
        {/* Top sentinel + older-loading spinner */}
        <div ref={topSentinelRef} className="h-px" />
        {loadingOlder ? (
          <div className="flex justify-center py-2">
            <Loader2 size={18} className="animate-spin opacity-60" />
          </div>
        ) : null}

        <div className="space-y-2">
          {items.map((item) =>
            item.type === "sep" ? (
              <div key={item.key} data-day-label={item.label}>
                <DaySeparator label={item.label} />
              </div>
            ) : (
              <MessageBubble
                key={item.message.id}
                message={item.message}
                mine={Boolean(
                  item.message.isMine ??
                  item.message.senderId === currentUserId,
                )}
                onRetry={onRetryMessage}
                onDiscard={onDiscardMessage}
              />
            ),
          )}

          {typingUserId && otherParticipantId === typingUserId ? (
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-bl-md border px-3 py-2"
                style={{
                  borderColor: "rgb(var(--color-border))",
                  backgroundColor: "rgb(var(--color-bg-elevated))",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
