"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInbox } from "../hooks/useInbox";
import { ConversationList } from "./ConversationList";
import { ChatDetail } from "./ChatDetail";

/**
 * Inbox (direct messages). Thin orchestrator: pulls state/handlers from useInbox
 * and lays out the conversation list + chat detail. All behavior lives in the
 * hook and the two panes.
 */
export function InboxScreen({ lang }: { lang: string }) {
  const inbox = useInbox(lang);

  if (!inbox.isAuthenticated) {
    return (
      <div className="min-h-[calc(100svh-var(--nav-height)-var(--safe-bottom))] px-4 py-6">
        <div
          className="mx-auto flex max-w-md flex-col gap-4 rounded-2xl border p-5"
          style={{
            backgroundColor: "rgb(var(--color-bg-elevated))",
            borderColor: "rgb(var(--color-border))",
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <MessageCircle size={22} />
          </div>
          <div className="space-y-1">
            <h1 className="font-semibold" style={{ fontSize: "var(--text-xl)" }}>
              Inbox
            </h1>
            <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
              Sign in to chat with sellers, send photos or videos, and keep every reply in one place.
            </p>
          </div>
          <Button onClick={inbox.handleContinue} className="h-11 rounded-full">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // When a conversation is open the bottom nav is hidden, so the chat should use
  // the full viewport with no nav padding. On the list view keep the nav gap so
  // rows aren't hidden behind the bottom tab bar.
  const inConversation = Boolean(inbox.selectedConversationId);

  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col md:grid md:min-h-[calc(100svh-var(--nav-height)-var(--safe-bottom))] md:grid-cols-[360px_minmax(0,1fr)]"
      style={{
        minHeight: inConversation
          ? "100svh"
          : "calc(100svh - var(--nav-height) - var(--safe-bottom))",
        paddingBottom: inConversation ? 0 : "calc(var(--nav-height) + var(--safe-bottom))",
      }}
    >
      <ConversationList
        conversations={inbox.conversations}
        selectedConversationId={inbox.selectedConversationId}
        conversationsLoading={inbox.conversationsLoading}
        ensuringConversation={inbox.ensuringConversation}
        unreadThreads={inbox.unreadThreads}
        onSelect={inbox.navigateToConversation}
      />

      <ChatDetail
        lang={lang}
        selectedConversationId={inbox.selectedConversationId}
        selectedConversation={inbox.selectedConversation}
        messages={inbox.messages}
        currentUserId={inbox.currentUser?.id}
        typingUserId={inbox.typingUserId}
        conversationLoading={inbox.conversationLoading}
        messagesLoading={inbox.messagesLoading}
        loadingOlder={inbox.loadingOlder}
        hasMoreOlder={inbox.hasMoreOlder}
        composer={inbox.composer}
        isSending={inbox.isSending}
        isUploading={inbox.isUploading}
        requireAuth={inbox.requireAuth}
        onBack={inbox.handleBack}
        onComposerChange={inbox.handleComposerChange}
        onSendText={inbox.handleSendText}
        onPickMedia={inbox.uploadAndSendMedia}
        onRetryMessage={inbox.retryMessage}
        onDiscardMessage={inbox.discardMessage}
        onLoadOlder={inbox.loadOlderMessages}
      />
    </div>
  );
}
