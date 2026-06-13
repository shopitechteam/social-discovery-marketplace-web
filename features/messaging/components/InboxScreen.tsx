"use client";

import { useInbox } from "../hooks/useInbox";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { ConversationList } from "./ConversationList";

/**
 * Inbox list page (/notifications). Shows conversations only.
 * Selecting a conversation navigates to /notifications/[id].
 */
export function InboxScreen({ lang }: { lang: string }) {
  const inbox = useInbox(lang);
  const pushNotifications = usePushNotifications(lang);

  return (
    <div className="min-h-svh bg-app">
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
  );
}
