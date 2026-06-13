"use client";

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

  // When a conversation is open the bottom nav is hidden, so the chat should use
  // the full viewport with no nav padding. On the list view keep the nav gap so
  // rows aren't hidden behind the bottom tab bar.
  //const inConversation = Boolean(inbox.selectedConversationId);

  return (
    <div className="mx-auto flex fixed top-0 left-0 right-0 bottom-0 w-full max-w-6xl flex-col md:grid md:min-h-[calc(100svh-var(--nav-height)-var(--safe-bottom))] md:grid-cols-[360px_minmax(0,1fr)]">
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
