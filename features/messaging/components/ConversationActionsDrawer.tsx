"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Flag,
  Loader2,
  MoreHorizontal,
  Trash2,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

type ReportReason = "SPAM" | "SCAM" | "HARASSMENT" | "OFF_TOPIC" | "OTHER";
type ViewMode = "menu" | "block" | "delete" | "report";

const REPORT_OPTIONS: Array<{ value: ReportReason; label: string }> = [
  { value: "SPAM", label: "Spam" },
  { value: "SCAM", label: "Scam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "OFF_TOPIC", label: "Off topic" },
  { value: "OTHER", label: "Other" },
];

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

export function ConversationActionsDrawer({
  participantName,
  blockedByMe,
  blockedByOther,
  isPending,
  onDeleteConversation,
  onBlockConversation,
  onUnblockConversation,
  onReportConversation,
}: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("menu");
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [details, setDetails] = useState("");

  const blockTitle = blockedByMe ? "Unblock user" : "Block user";
  const blockDescription = useMemo(() => {
    if (blockedByMe) {
      return `You can start messaging ${participantName} again after unblocking them.`;
    }
    return "This stops both sides from sending new messages in Shopi chat.";
  }, [blockedByMe, participantName]);

  const reset = () => {
    setView("menu");
    setReason("SPAM");
    setDetails("");
  };

  const close = () => {
    setOpen(false);
    reset();
  };

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

      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) reset();
        }}
      >
        <DrawerContent className="mx-auto max-w-107.5">
          <DrawerHeader className="pb-2 text-left">
            {view !== "menu" ? (
              <button
                type="button"
                className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border"
                style={{ borderColor: "rgb(var(--color-border))" }}
                onClick={() => setView("menu")}
                aria-label="Back"
              >
                <ChevronLeft size={16} />
              </button>
            ) : null}

            <DrawerTitle className="text-base">
              {view === "menu"
                ? participantName
                : view === "report"
                  ? "Report conversation"
                  : view === "delete"
                    ? "Delete conversation"
                    : blockTitle}
            </DrawerTitle>
            <DrawerDescription>
              {view === "menu"
                ? blockedByOther
                  ? `${participantName} has blocked this conversation.`
                  : "Manage this conversation."
                : view === "report"
                  ? "Tell us what went wrong so we can review it."
                  : view === "delete"
                    ? "This only clears the conversation from your inbox."
                    : blockDescription}
            </DrawerDescription>
          </DrawerHeader>

          {view === "menu" ? (
            <div className="px-4 pb-3">
              <button
                type="button"
                onClick={() => setView("report")}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-accent"
              >
                <Flag size={18} />
                <span className="text-sm font-semibold">
                  Report conversation
                </span>
              </button>

              <button
                type="button"
                onClick={() => setView("block")}
                className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-accent"
              >
                <UserX size={18} />
                <span className="text-sm font-semibold">{blockTitle}</span>
              </button>

              <button
                type="button"
                onClick={() => setView("delete")}
                className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-accent"
              >
                <Trash2 size={18} />
                <span className="text-sm font-semibold">
                  Delete conversation
                </span>
              </button>
            </div>
          ) : null}

          {view === "report" ? (
            <div className="space-y-4 px-4 pb-3">
              <RadioGroup
                value={reason}
                onValueChange={(value) => setReason(value as ReportReason)}
              >
                {REPORT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                    style={{ borderColor: "rgb(var(--color-border))" }}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </RadioGroup>

              <Textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Add context"
                className="min-h-28 rounded-2xl text-sm"
              />
            </div>
          ) : null}

          {view === "delete" ? (
            <div className="px-4 pb-3 text-sm text-muted">
              The other person keeps their copy. If a new message arrives later,
              the thread will appear again.
            </div>
          ) : null}

          {view === "block" ? (
            <div className="px-4 pb-3 text-sm text-muted">
              {blockedByMe
                ? "Unblocking restores messaging for both sides unless they have also blocked you."
                : "Blocking keeps the existing record but prevents any new messages from being sent."}
            </div>
          ) : null}

          {view !== "menu" ? (
            <DrawerFooter className="pt-1">
              <Button
                type="button"
                variant={view === "report" ? "default" : "destructive"}
                disabled={isPending}
                onClick={async () => {
                  const ok =
                    view === "report"
                      ? await onReportConversation(reason, details)
                      : view === "delete"
                        ? await onDeleteConversation()
                        : blockedByMe
                          ? await onUnblockConversation()
                          : await onBlockConversation();
                  if (ok) close();
                }}
                className="rounded-full text-white"
              >
                {isPending ? <Loader2 className="animate-spin" /> : null}
                {view === "report"
                  ? "Submit report"
                  : view === "delete"
                    ? "Delete for me"
                    : blockTitle}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setView("menu")}
                disabled={isPending}
              >
                Cancel
              </Button>
            </DrawerFooter>
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  );
}
