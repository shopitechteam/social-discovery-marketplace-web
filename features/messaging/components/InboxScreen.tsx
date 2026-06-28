"use client";

import { useState } from "react";
import { useInbox } from "../hooks/useInbox";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { participantName } from "../lib/helpers";
import type { Conversation } from "../types";
import { ConversationList } from "./ConversationList";
import { ConversationActionsSheet } from "./ConversationActionsSheet";

/**
 * Inbox list page (/notifications). Shows conversations only.
 * Selecting a conversation navigates to /notifications/[id].
 */
export function InboxScreen({ lang }: { lang: string }) {
  const inbox = useInbox(lang);
  const pushNotifications = usePushNotifications(lang);

  // Conversation whose actions sheet is open from a list long-press.
  const [actionsTarget, setActionsTarget] = useState<Conversation | null>(null);
  const actionsTargetId = actionsTarget?.id ?? null;

  return (
    <div className="min-h-svh bg-app">
      <ConversationList
        conversations={inbox.conversations}
        selectedConversationId={inbox.selectedConversationId}
        conversationsLoading={inbox.conversationsLoading}
        unreadThreads={inbox.unreadThreads}
        pushSupported={pushNotifications.isSupported}
        pushAvailable={pushNotifications.isAvailable}
        pushEnabled={pushNotifications.isEnabled}
        pushUpdating={pushNotifications.isUpdating}
        onTogglePush={() => {
          void pushNotifications.toggle();
        }}
        onSelect={inbox.navigateToConversation}
        onLongPress={setActionsTarget}
      />

      <ConversationActionsSheet
        open={actionsTarget !== null}
        onOpenChange={(open) => {
          if (!open) setActionsTarget(null);
        }}
        participantName={participantName(actionsTarget?.otherParticipant)}
        blockedByMe={actionsTarget?.blockedByMe}
        blockedByOther={actionsTarget?.blockedByOther}
        dealClosed={Boolean(actionsTarget?.dealClosedAt)}
        isPending={inbox.isConversationActionPending}
        onDeleteConversation={() =>
          inbox.deleteSelectedConversation(actionsTargetId ?? undefined)
        }
        onBlockConversation={() =>
          inbox.blockSelectedConversation(actionsTargetId ?? undefined)
        }
        onUnblockConversation={() =>
          inbox.unblockSelectedConversation(actionsTargetId ?? undefined)
        }
        onReportConversation={(reason, details) =>
          inbox.reportSelectedConversation(
            reason,
            details,
            actionsTargetId ?? undefined,
          )
        }
        onMarkDeal={(closed) =>
          inbox.markDealForConversation(closed, actionsTargetId ?? undefined)
        }
      />
    </div>
  );
}
