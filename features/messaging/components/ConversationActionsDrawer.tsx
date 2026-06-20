"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  ConversationActionsSheet,
  type ReportReason,
} from "./ConversationActionsSheet";

interface Props {
  participantName: string;
  blockedByMe?: boolean | null;
  blockedByOther?: boolean | null;
  isPending: boolean;
  onDeleteConversation: () => Promise<boolean>;
  onBlockConversation: () => Promise<boolean>;
  onUnblockConversation: () => Promise<boolean>;
  onReportConversation: (
    reason: ReportReason,
    details?: string,
  ) => Promise<boolean>;
}

/**
 * Chat-detail header entry point: a 3-dot button that opens the shared
 * conversation actions sheet for the currently open thread.
 */
export function ConversationActionsDrawer(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full border"
        style={{ borderColor: "rgb(var(--color-border))" }}
        aria-label="Conversation options"
      >
        <MoreHorizontal size={18} />
      </button>

      <ConversationActionsSheet open={open} onOpenChange={setOpen} {...props} />
    </>
  );
}
