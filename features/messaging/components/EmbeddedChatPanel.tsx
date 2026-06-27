"use client";

import { useEffect } from "react";
import { useInbox } from "../hooks/useInbox";
import { ChatDetail } from "./ChatDetail";

interface Props {
  lang: string;
  /** A content/post id — the conversation is ensured (create-or-reuse) from it. */
  contentId: string;
  /** Collapse the chat column (does not navigate). */
  onClose: () => void;
}

/**
 * Chat detail embedded inside the desktop content sheet's right column.
 *
 * Mirrors {@link ChatDetailScreen} but renders in a relative, full-height
 * container (not `fixed inset-0`) so it can live as a third column, and routes
 * the back affordance to `onClose` instead of the inbox's history-based back.
 */
export function EmbeddedChatPanel({ lang, contentId, onClose }: Props) {
  const inbox = useInbox(lang);

  // Ensure the conversation for this post in place. `skipUrlSync` keeps the
  // browser URL on the post route (the sheet stays addressable / closeable).
  useEffect(() => {
    void inbox.ensureConversationByContent(contentId, { skipUrlSync: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  const resolving = !inbox.selectedConversationId;

  // Keep ChatDetail mounted across resolution so the panel doesn't flip between
  // a spinner and the thread (which caused a flicker). `pending` renders the
  // chat shell — header + composer — while the conversation is being ensured.
  return (
    <div className="flex h-full min-h-0 flex-col bg-app">
      <ChatDetail
        lang={lang}
        pending={resolving}
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
        stagedMedia={inbox.stagedMedia}
        isUploading={inbox.isUploading}
        isConversationActionPending={inbox.isConversationActionPending}
        requireAuth={inbox.requireAuth}
        embedded
        onBack={onClose}
        onComposerChange={inbox.handleComposerChange}
        onSend={inbox.handleSend}
        onQuickReply={inbox.sendQuickReply}
        onShareLocation={inbox.sendLocation}
        onStageMedia={inbox.stageMedia}
        onClearStagedMedia={inbox.clearStagedMedia}
        onRetryMessage={inbox.retryMessage}
        onDiscardMessage={inbox.discardMessage}
        onLoadOlder={inbox.loadOlderMessages}
        onDeleteConversation={inbox.deleteSelectedConversation}
        onBlockConversation={inbox.blockSelectedConversation}
        onUnblockConversation={inbox.unblockSelectedConversation}
        onReportConversation={inbox.reportSelectedConversation}
        onMarkDeal={(closed) => inbox.markDealForConversation(closed)}
      />
    </div>
  );
}
