"use client";

import { useEffect } from "react";
import { useInbox } from "../hooks/useInbox";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { ConversationList } from "./ConversationList";
import { ChatDetail } from "./ChatDetail";

interface Props {
  lang: string;
  /**
   * Route param when mounted at /notifications/[id]. A conversation id, or a
   * content id when `mode === "content"`. Omitted at the inbox root.
   */
  conversationId?: string;
  /**
   * "content" → the route param is a post/content id; ensure (create-or-reuse)
   * the conversation directly here (no inbox-list redirect/flicker).
   */
  mode?: "conversation" | "content";
}

/**
 * Unified messaging screen for both /notifications and /notifications/[id].
 *
 * Desktop (md+): a two-pane split — conversation list on the left, the open
 * chat on the right (WhatsApp Web / Messenger style). A single useInbox drives
 * both panes, so selecting a thread updates the right pane in place.
 *
 * Mobile: single pane. At the inbox root the list fills the screen; on a
 * conversation route the chat fills the screen (the list is hidden, the chat's
 * own back button returns to the list). This preserves the existing mobile UX.
 */
export function MessagingShell({ lang, conversationId, mode = "conversation" }: Props) {
  const inbox = useInbox(lang);
  const pushNotifications = usePushNotifications(lang);

  // Resolve the route param into the open conversation. For a content id we
  // ensure the thread in place (URL is swapped to the real id without remount).
  useEffect(() => {
    if (!conversationId) return;
    if (mode === "content") {
      void inbox.ensureConversationByContent(conversationId);
    } else {
      inbox.navigateToConversation(conversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, mode]);

  // While ensuring a conversation from a content id, the thread isn't selected
  // yet. Rather than block on a full-screen loader (bad UX — the chat felt slow
  // to open), we render the chat shell immediately and let the conversation
  // resolve in the background. This `pending` flag tells ChatDetail to show the
  // chat shell (header skeleton + composer) right away.
  const resolvingFromContent =
    mode === "content" && !inbox.selectedConversationId;

  // On a conversation route the mobile view should show only the chat; at the
  // inbox root it should show only the list. On desktop both are always visible.
  // Content mode counts as having an open chat even before the id resolves.
  const hasRouteConversation = Boolean(conversationId);

  // The desktop main area has no top nav; its height is the viewport minus the
  // mobile bottom-nav padding MainShell reserves — which it only reserves at the
  // inbox root (not on a conversation route). Mirror that so the split fills the
  // pane exactly with no phantom gap or overflow.
  const desktopHeight = hasRouteConversation
    ? "100svh"
    : "calc(100svh - var(--nav-height, 0px) - var(--safe-bottom, 0px))";

  return (
    <div className="bg-app md:overflow-hidden" style={{ ["--ms-h" as string]: desktopHeight }}>
      <div className="md:grid md:h-(--ms-h) md:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        {/* ── Conversation list (left pane) ──────────────────────────── */}
        <div
          className={[
            "min-h-svh md:min-h-0 md:h-full md:overflow-y-auto md:border-r",
            // Mobile: hide the list when a conversation route is active
            hasRouteConversation ? "hidden md:block" : "block",
          ].join(" ")}
          style={{ borderColor: "rgb(var(--color-border))" }}
        >
          <ConversationList
            conversations={inbox.conversations}
            selectedConversationId={inbox.selectedConversationId}
            conversationsLoading={inbox.conversationsLoading}
            ensuringConversation={inbox.ensuringConversation}
            unreadThreads={inbox.unreadThreads}
            pushSupported={pushNotifications.isSupported}
            pushAvailable={pushNotifications.isAvailable}
            pushEnabled={pushNotifications.isEnabled}
            pushUpdating={pushNotifications.isUpdating}
            onTogglePush={() => {
              void pushNotifications.toggle();
            }}
            onSelect={inbox.navigateToConversation}
          />
        </div>

        {/* ── Chat detail (right pane) ───────────────────────────────── */}
        <div className="min-w-0">
          <ChatDetail
            lang={lang}
            selectedConversationId={inbox.selectedConversationId}
            selectedConversation={inbox.selectedConversation}
            pending={resolvingFromContent}
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
            isConversationActionPending={inbox.isConversationActionPending}
            requireAuth={inbox.requireAuth}
            onBack={inbox.handleBack}
            onComposerChange={inbox.handleComposerChange}
            onSendText={inbox.handleSendText}
            onPickMedia={inbox.uploadAndSendMedia}
            onRetryMessage={inbox.retryMessage}
            onDiscardMessage={inbox.discardMessage}
            onLoadOlder={inbox.loadOlderMessages}
            onDeleteConversation={inbox.deleteSelectedConversation}
            onBlockConversation={inbox.blockSelectedConversation}
            onUnblockConversation={inbox.unblockSelectedConversation}
            onReportConversation={inbox.reportSelectedConversation}
          />
        </div>
      </div>
    </div>
  );
}
