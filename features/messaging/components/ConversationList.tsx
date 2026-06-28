"use client";

import { useRef } from "react";
import Image from "next/image";
import { Bell, BellOff, Loader2, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Conversation } from "../types";
import {
  avatarGradient,
  conversationThumb,
  initialsForUser,
  participantName,
  previewLabel,
  shortTime,
} from "../lib/helpers";

interface Props {
  conversations: Conversation[];
  selectedConversationId: string | null;
  conversationsLoading: boolean;
  unreadThreads: number;
  pushSupported: boolean;
  pushAvailable: boolean;
  pushEnabled: boolean;
  pushUpdating: boolean;
  onTogglePush: () => void;
  onSelect: (conversationId: string) => void;
  /** Long-press (mobile) / right-click (desktop) on a row → open its actions. */
  onLongPress: (conversation: Conversation) => void;
}

const LONG_PRESS_MS = 450;

/** Left-hand inbox: header + scrollable conversation rows. */
export function ConversationList({
  conversations,
  selectedConversationId,
  conversationsLoading,
  unreadThreads,
  pushSupported,
  pushAvailable,
  pushEnabled,
  pushUpdating,
  onTogglePush,
  onSelect,
  onLongPress,
}: Props) {
  // Long-press detection: a timer armed on press, cleared on release/move. When
  // it fires we open the row's actions and flag the press so the following
  // click (tap-to-open) is suppressed.
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = (conversation: Conversation) => {
    longPressFired.current = false;
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onLongPress(conversation);
    }, LONG_PRESS_MS);
  };

  return (
    <section
      className="flex flex-col"
      style={{ borderColor: "rgb(var(--color-border))" }}
    >
      <div
        className="border-b px-4 py-4 md:px-6 md:py-5"
        style={{ borderColor: "rgb(var(--color-border))" }}
      >
        <div className="flex sticky top-0 left-0 right-0 items-center justify-between">
          <div>
            <h1
              className="font-semibold"
              style={{ fontSize: "var(--text-xl)" }}
            >
              Inbox
            </h1>
            <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
              {unreadThreads > 0
                ? `${unreadThreads} unread thread${unreadThreads === 1 ? "" : "s"}`
                : "Your conversations"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pushSupported ? (
              <button
                type="button"
                onClick={onTogglePush}
                className="flex h-9 w-9 items-center justify-center rounded-full border"
                style={{ borderColor: "rgb(var(--color-border))" }}
                aria-label={
                  pushEnabled
                    ? "Disable message alerts"
                    : "Enable message alerts"
                }
                title={
                  pushAvailable
                    ? pushEnabled
                      ? "Disable message alerts"
                      : "Enable message alerts"
                    : "Push alerts are not configured yet"
                }
              >
                {pushUpdating ? (
                  <Loader2 className="animate-spin text-muted" size={16} />
                ) : pushEnabled ? (
                  <Bell size={16} />
                ) : (
                  <BellOff size={16} className="text-muted" />
                )}
              </button>
            ) : null}

            {/* {(conversationsLoading) && (
              <Loader2 className="animate-spin text-muted" size={18} />
            )} */}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-14 md:pb-6">
        {conversationsLoading && conversations.length === 0 ? (
          <div className="space-y-3 px-4 py-4 md:px-6 md:py-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="flex-1 w-full space-y-2 py-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-full mt-12 flex-col items-center justify-center gap-3 px-6 text-center md:min-h-[36svh] md:px-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageCircle size={24} />
            </div>
            <div className="space-y-1">
              <h2
                className="font-semibold"
                style={{ fontSize: "var(--text-lg)" }}
              >
                No chats yet
              </h2>
              <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
                Tap Message on any post and the thread will appear here
                instantly.
              </p>
            </div>
          </div>
        ) : (
          conversations.map((conversation) => {
            const selected = conversation.id === selectedConversationId;
            const thumb = conversationThumb(conversation);
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => {
                  // Suppress the click that follows a long-press release.
                  if (longPressFired.current) {
                    longPressFired.current = false;
                    return;
                  }
                  onSelect(conversation.id);
                }}
                onContextMenu={(event) => {
                  // Desktop: right-click opens the actions instead of the menu.
                  event.preventDefault();
                  onLongPress(conversation);
                }}
                onTouchStart={() => startLongPress(conversation)}
                onTouchEnd={clearLongPress}
                onTouchMove={clearLongPress}
                onPointerDown={(event) => {
                  // Mouse/pen long-press (touch is handled above). Skip touch
                  // pointers to avoid double-arming the timer.
                  if (event.pointerType !== "touch")
                    startLongPress(conversation);
                }}
                onPointerUp={clearLongPress}
                onPointerLeave={clearLongPress}
                className={cn(
                  "flex w-full lg:cursor-pointer select-none items-start gap-3 border-b border-[rgb(var(--color-border)/0.6)] px-4 py-3 text-left transition-colors md:px-6 md:py-4",
                  selected &&
                    "bg-primary/10 shadow-[inset_3px_0_0_0_rgb(var(--brand-primary)/0.8),inset_0_0_0_1px_rgb(var(--brand-primary)/0.14)]",
                )}
              >
                <div className="relative h-12 w-12 shrink-0">
                  {/* Square post image */}
                  <div className="h-full w-full overflow-hidden rounded-2xl bg-surface">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={conversation.content?.title || "Listing"}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <MessageCircle size={18} />
                      </div>
                    )}
                  </div>

                  {/* Sender avatar overlaid bottom-left (WhatsApp-style) */}
                  {conversation.otherParticipant?.profile?.avatar ? (
                    <div
                      className="absolute -bottom-2 -right-1 h-7 w-7 overflow-hidden rounded-full border-2"
                      style={{ borderColor: "rgb(var(--color-bg))" }}
                    >
                      <Image
                        src={conversation.otherParticipant.profile.avatar}
                        alt={participantName(conversation.otherParticipant)}
                        fill
                        className="h-full w-full object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div
                      className={`absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-gradient-to-br ${avatarGradient(
                        conversation.otherParticipant?.id ?? "0",
                      )} text-white`}
                      style={{
                        borderColor: "rgb(var(--color-bg))",
                        fontSize: "9px",
                        fontWeight: 700,
                      }}
                    >
                      {initialsForUser(conversation.otherParticipant)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-muted text-sm">
                      {participantName(conversation.otherParticipant)}
                    </p>
                    <span className="shrink-0 text-muted text-xs">
                      {shortTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="truncate text-sm font-semibold">
                    {conversation.content?.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <p
                      className={`min-w-0 truncate ${
                        (conversation.myUnreadCount ?? 0) > 0
                          ? "font-semibold text-default"
                          : "text-muted"
                      }`}
                      style={{ fontSize: "var(--text-sm)" }}
                    >
                      {previewLabel(
                        conversation.lastMessageType,
                        conversation.lastMessageText,
                      )}
                    </p>
                    {conversation.otherParticipantOnline ? (
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    ) : null}
                  </div>
                </div>

                {(conversation.myUnreadCount ?? 0) > 0 ? (
                  <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {conversation.myUnreadCount}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
