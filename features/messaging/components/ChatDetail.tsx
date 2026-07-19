"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, Handshake, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation, Message, StagedMedia, UserLite } from "../types";
import {
  avatarGradient,
  conversationThumb,
  initialsForUser,
  lastSeenLabel,
  participantName,
} from "../lib/helpers";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { ConversationActionsDrawer } from "./ConversationActionsDrawer";

interface Props {
  lang: string;
  selectedConversationId: string | null;
  selectedConversation: Conversation | null;
  /**
   * True while we're ensuring (create-or-reuse) the conversation from a content
   * id. The thread isn't resolved yet, but we render the chat shell immediately
   * (header + composer) so opening a chat is instant — no blocking loader.
   */
  pending?: boolean;
  messages: Message[];
  currentUserId?: string | null;
  typingUserId: string | null;
  conversationLoading: boolean;
  messagesLoading: boolean;
  loadingOlder: boolean;
  hasMoreOlder: boolean;
  composer: string;
  stagedMedia: StagedMedia | null;
  isUploading: boolean;
  isConversationActionPending: boolean;
  requireAuth: () => boolean;
  onBack: () => void;
  /**
   * Embedded inside the desktop content sheet: the desktop "Back to tabs"
   * button collapses the chat column (`onBack`) instead of navigating to the
   * inbox, and the mobile back arrow is shown so the affordance is always there.
   */
  embedded?: boolean;
  /**
   * Hide the participant's avatar + name/status in the header. Used by the
   * desktop feed right rail, where the originating post card already shows the
   * seller's name and image right next to the chat — repeating them here is
   * redundant. The PDP content sheet leaves this off, so its chat keeps the
   * usual header.
   */
  hideParticipantHeader?: boolean;
  onComposerChange: (value: string) => void;
  onSend: () => void;
  onQuickReply: (text: string) => void;
  onShareLocation: (
    latitude: number,
    longitude: number,
    locationLabel?: string,
  ) => void;
  onStageMedia: (file: File, kind: "image" | "video") => void;
  onClearStagedMedia: () => void;
  onRetryMessage: (message: Message) => void;
  onDiscardMessage: (message: Message) => void;
  onLoadOlder: () => Promise<number>;
  onDeleteConversation: () => Promise<boolean>;
  onBlockConversation: () => Promise<boolean>;
  onUnblockConversation: () => Promise<boolean>;
  onReportConversation: (
    reason: "SPAM" | "SCAM" | "HARASSMENT" | "OFF_TOPIC" | "OTHER",
    details?: string,
  ) => Promise<boolean>;
  onMarkDeal: (closed: boolean) => Promise<boolean>;
}

/** Right-hand chat pane: header, listing summary, messages, typing, composer. */
export function ChatDetail({
  lang,
  selectedConversationId,
  selectedConversation,
  pending = false,
  messages,
  currentUserId,
  typingUserId,
  conversationLoading,
  messagesLoading,
  loadingOlder,
  hasMoreOlder,
  composer,
  stagedMedia,
  isUploading,
  isConversationActionPending,
  requireAuth,
  onBack,
  embedded = false,
  hideParticipantHeader = false,
  onComposerChange,
  onSend,
  onQuickReply,
  onShareLocation,
  onStageMedia,
  onClearStagedMedia,
  onRetryMessage,
  onDiscardMessage,
  onLoadOlder,
  onDeleteConversation,
  onBlockConversation,
  onUnblockConversation,
  onReportConversation,
  onMarkDeal,
}: Props) {
  const router = useRouter();
  const contentSummary = selectedConversation?.content;
  const otherParticipant: UserLite | null | undefined =
    selectedConversation?.otherParticipant;
  const isSeller = Boolean(
    selectedConversation && currentUserId && selectedConversation.sellerId === currentUserId,
  );
  const myReplyIsPending =
    Boolean(selectedConversation?.myUnreadCount) &&
    selectedConversation?.lastMessageSenderId !== currentUserId;
  const lastMessageAgeMinutes = selectedConversation?.lastMessageAt
    ? Math.floor(
        (Date.now() - new Date(selectedConversation.lastMessageAt).getTime()) /
          (60 * 1000),
      )
    : 0;

  const conversationNudge = (() => {
    if (!selectedConversation || selectedConversation.dealClosedAt) {
      return selectedConversation?.dealClosedAt
        ? {
            tone: "success" as const,
            title: "Deal marked as closed",
            body: "Nice work. You can still keep chatting if you need to confirm pickup, payment, or follow-up details.",
          }
        : null;
    }
    if (selectedConversation.canSendMessages === false) return null;

    if (myReplyIsPending && lastMessageAgeMinutes >= 24 * 60) {
      return {
        tone: "warning" as const,
        title: "This conversation is going stale",
        body: isSeller
          ? "Reply now to keep this buyer engaged. Once a thread sits too long, conversion drops fast."
          : "The seller already replied. Send a quick response if you still want the item so the thread stays active.",
      };
    }

    if (myReplyIsPending && lastMessageAgeMinutes >= 15) {
      return {
        tone: "warning" as const,
        title: isSeller ? "A buyer is waiting on you" : "The seller is waiting on you",
        body: isSeller
          ? "Fast replies help buyers stay warm and improve your chances of closing the deal."
          : "A quick reply keeps the negotiation moving and makes it easier to secure the item.",
      };
    }

    if (!myReplyIsPending && selectedConversation.lastMessageSenderId === currentUserId && lastMessageAgeMinutes >= 6 * 60) {
      return {
        tone: "default" as const,
        title: "A polite follow-up could help",
        body: isSeller
          ? "You sent the last message a while ago. A short follow-up or clearer next step can revive the conversation."
          : "If you are still interested, a gentle follow-up can restart the thread without feeling pushy.",
      };
    }

    return null;
  })();

  // Bumped on every send so the message list force-scrolls to the bottom even if
  // the user had scrolled up — sending always reveals your new message.
  const [scrollSignal, setScrollSignal] = useState(0);
  const handleSend = useCallback(() => {
    onSend();
    setScrollSignal((n) => n + 1);
  }, [onSend]);

  // Quick replies send immediately too, so they must also reveal the new
  // message — bump the same scroll signal the normal send path uses.
  const handleQuickReply = useCallback(
    (text: string) => {
      onQuickReply(text);
      setScrollSignal((n) => n + 1);
    },
    [onQuickReply],
  );

  // Sharing a location inserts a message too — reveal it like any other send.
  const handleShareLocation = useCallback(
    (latitude: number, longitude: number, locationLabel?: string) => {
      onShareLocation(latitude, longitude, locationLabel);
      setScrollSignal((n) => n + 1);
    },
    [onShareLocation],
  );

  // The chat is "open" once a conversation is selected OR while we're resolving
  // one from a content id. In the pending case we render the shell immediately
  // (header skeleton + composer) so opening a chat is instant.
  const isOpen = Boolean(selectedConversationId) || pending;

  // Suppress the message-loading spinner when there's nothing to load: while
  // resolving from a content id (the conversation creation must be invisible),
  // or when the resolved conversation is brand-new/empty. This avoids the
  // double-loader flash when opening a chat straight from a post.
  const suppressInitialLoader =
    pending || selectedConversation?.messageCount === 0;

  return (
    <section
      className={`flex h-dvh min-h-0 flex-col md:h-full ${
        isOpen ? "flex" : "hidden md:flex"
      }`}
    >
      {!isOpen ? (
        <div className="hidden h-full items-center justify-center md:flex">
          <div className="max-w-sm space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageCircle size={24} />
            </div>
            <h2
              className="font-semibold"
              style={{ fontSize: "var(--text-lg)" }}
            >
              Pick a conversation
            </h2>
            <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
              Open a thread to reply, share media, and see when the other person
              is online.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            className="shrink-0 border-b px-4 pb-3"
            style={{
              borderColor: "rgb(var(--color-border))",
              backgroundColor: "rgb(var(--color-bg))",
              paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
            }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className={embedded ? "" : "md:hidden"}
                aria-label={embedded ? "Close chat" : "Back to inbox"}
              >
                <ArrowLeft size={20} />
              </button>

              {!embedded && (
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/${lang}/notifications`);
                  }}
                  className="hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors md:inline-flex"
                  style={{ borderColor: "rgb(var(--color-border))" }}
                  aria-label="Back to inbox tabs"
                  title="Back to inbox tabs"
                >
                  <ChevronLeft size={16} />
                  Back to tabs
                </button>
              )}

              {/* While resolving from a content id the participant isn't known
                  yet — show a subtle skeleton instead of a fake "Shopi user".
                  Skipped entirely when the host already shows the seller
                  (desktop feed right rail) to avoid repeating name + avatar. */}
              {hideParticipantHeader ? null : pending && !otherParticipant ? (
                <div className="h-10 w-10 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
              ) : otherParticipant?.profile?.avatar ? (
                <div
                  onClick={() => {
                    router.push(`/profile/${otherParticipant?.id}`);
                  }}
                  className="relative h-10 w-10 overflow-hidden rounded-full"
                >
                  <Image
                    src={otherParticipant.profile.avatar}
                    alt={participantName(otherParticipant)}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div
                  onClick={() => {
                    router.push(`/profile/${otherParticipant?.id}`);
                  }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br ${avatarGradient(
                    otherParticipant?.id ?? "0",
                  )} text-sm font-semibold text-white`}
                >
                  {initialsForUser(otherParticipant)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                {hideParticipantHeader ? null : pending && !otherParticipant ? (
                  <>
                    <div className="h-3.5 w-28 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                    <div className="mt-1.5 h-2.5 w-16 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <p
                        className="truncate font-semibold"
                        style={{ fontSize: "var(--text-base)" }}
                      >
                        {participantName(otherParticipant)}
                      </p>
                      {selectedConversation?.dealClosedAt ? (
                        <span
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400"
                          style={{ fontSize: "var(--text-xs)" }}
                        >
                          <Handshake size={12} />
                          Deal closed
                        </span>
                      ) : null}
                    </div>
                    <p
                      className="truncate text-muted"
                      style={{ fontSize: "var(--text-xs)" }}
                    >
                      {lastSeenLabel(selectedConversation)}
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {contentSummary ? (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/${lang}/content/${contentSummary.id}`)
                    }
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{ borderColor: "rgb(var(--color-border))" }}
                  >
                    View post
                  </button>
                ) : null}

                <ConversationActionsDrawer
                  participantName={participantName(otherParticipant)}
                  blockedByMe={selectedConversation?.blockedByMe}
                  blockedByOther={selectedConversation?.blockedByOther}
                  dealClosed={Boolean(selectedConversation?.dealClosedAt)}
                  isPending={isConversationActionPending}
                  onDeleteConversation={onDeleteConversation}
                  onBlockConversation={onBlockConversation}
                  onUnblockConversation={onUnblockConversation}
                  onReportConversation={onReportConversation}
                  onMarkDeal={onMarkDeal}
                />
              </div>
            </div>

            {contentSummary ? (
              <div
                onClick={() =>
                  router.push(`/${lang}/content/${contentSummary.id}`)
                }
                className="mt-3 flex items-center gap-3 rounded-2xl border p-1"
                style={{
                  backgroundColor: "rgb(var(--color-bg-subtle))",
                  borderColor: "rgb(var(--color-border))",
                }}
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white">
                  {conversationThumb(selectedConversation) ? (
                    <Image
                      src={conversationThumb(selectedConversation)!}
                      alt={contentSummary.title}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-semibold"
                    style={{ fontSize: "var(--text-sm)" }}
                  >
                    {contentSummary.title}
                  </p>
                  {/* <p
                    className="truncate text-muted"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {money(
                      contentSummary.price?.amount,
                      contentSummary.price?.currency,
                    )}
                  </p> */}
                  <p
                    className="truncate text-muted"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {contentSummary.location?.placeName ||
                      contentSummary.location?.subregion ||
                      contentSummary.location?.county}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {conversationNudge ? (
            <div
              className={cn(
                "mx-4 mt-3 rounded-2xl border px-4 py-3",
                conversationNudge.tone === "success"
                  ? "border-emerald-500/20 bg-emerald-500/10"
                  : conversationNudge.tone === "warning"
                    ? "border-amber-500/20 bg-amber-500/10"
                    : "border-border bg-elevated",
              )}
            >
              <p className="text-sm font-semibold text-foreground">
                {conversationNudge.title}
              </p>
              <p className="mt-1 text-sm text-muted">{conversationNudge.body}</p>
            </div>
          ) : null}

          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            typingUserId={typingUserId}
            otherParticipantId={otherParticipant?.id}
            initialLoading={
              !suppressInitialLoader &&
              (conversationLoading || messagesLoading) &&
              messages.length === 0
            }
            loadingOlder={loadingOlder}
            hasMoreOlder={hasMoreOlder}
            scrollToBottomSignal={scrollSignal}
            onLoadOlder={onLoadOlder}
            onRetryMessage={onRetryMessage}
            onDiscardMessage={onDiscardMessage}
          />

          <Composer
            composer={composer}
            conversation={selectedConversation}
            currentUserId={currentUserId}
            stagedMedia={stagedMedia}
            isUploading={isUploading}
            disabledReason={
              selectedConversation?.blockedByMe
                ? "You blocked this user"
                : selectedConversation?.blockedByOther
                  ? "This user blocked you"
                  : selectedConversation?.canSendMessages === false
                    ? "Messaging unavailable"
                    : null
            }
            requireAuth={requireAuth}
            onChange={onComposerChange}
            onSend={handleSend}
            onQuickReply={handleQuickReply}
            onShareLocation={handleShareLocation}
            onStageMedia={onStageMedia}
            onClearStagedMedia={onClearStagedMedia}
          />
        </>
      )}
    </section>
  );
}
