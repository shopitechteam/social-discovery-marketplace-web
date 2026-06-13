"use client";

import Image from "next/image";
import { Bell, BellOff, Loader2, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  ensuringConversation: boolean;
  unreadThreads: number;
  pushSupported: boolean;
  pushAvailable: boolean;
  pushEnabled: boolean;
  pushUpdating: boolean;
  onTogglePush: () => void;
  onSelect: (conversationId: string) => void;
}

/** Left-hand inbox: header + scrollable conversation rows. */
export function ConversationList({
  conversations,
  selectedConversationId,
  conversationsLoading,
  ensuringConversation,
  unreadThreads,
  pushSupported,
  pushAvailable,
  pushEnabled,
  pushUpdating,
  onTogglePush,
  onSelect,
}: Props) {
  return (
    <section
      className={`flex flex-col border-r md:min-h-[calc(100svh-var(--nav-height)-var(--safe-bottom))] ${
        selectedConversationId ? "hidden md:flex" : "flex"
      }`}
      style={{ borderColor: "rgb(var(--color-border))" }}
    >
      <div
        className="border-b px-4 py-4"
        style={{ borderColor: "rgb(var(--color-border))" }}
      >
        <div className="flex items-center justify-between">
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
                : "Your conversations with sellers and buyers"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pushSupported ? (
              <button
                type="button"
                onClick={onTogglePush}
                className="flex h-9 w-9 items-center justify-center rounded-full border"
                style={{ borderColor: "rgb(var(--color-border))" }}
                aria-label={pushEnabled ? "Disable message alerts" : "Enable message alerts"}
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

            {(conversationsLoading || ensuringConversation) && (
              <Loader2 className="animate-spin text-muted" size={18} />
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversationsLoading && conversations.length === 0 ? (
          <div className="space-y-3 px-4 py-4">
            {Array.from({ length: 6 }).map((_, index) => (
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
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
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
                onClick={() => onSelect(conversation.id)}
                className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors"
                style={{
                  borderColor: "rgb(var(--color-border) / 0.6)",
                  backgroundColor: selected
                    ? "rgb(var(--brand-primary) / 0.06)"
                    : "transparent",
                }}
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
                      className={`absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-gradient-to-br ${avatarGradient(
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
