"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Handshake, MessageCircle } from "lucide-react";
import type { Conversation, Message, StagedMedia, UserLite } from "../types";
import {
  avatarGradient,
  conversationThumb,
  initialsForUser,
  lastSeenLabel,
  money,
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
  onComposerChange: (value: string) => void;
  onSend: () => void;
  onQuickReply: (text: string) => void;
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
  onComposerChange,
  onSend,
  onQuickReply,
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
      className={`flex h-svh min-h-0 flex-col md:h-full ${
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
            <div className="flex items-center  gap-3">
              <button
                type="button"
                onClick={onBack}
                className="md:hidden"
                aria-label="Back to inbox"
              >
                <ArrowLeft size={20} />
              </button>

              {/* While resolving from a content id the participant isn't known
                  yet — show a subtle skeleton instead of a fake "Shopi user". */}
              {pending && !otherParticipant ? (
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
                {pending && !otherParticipant ? (
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
                className="mt-3 flex items-center gap-3 rounded-2xl border p-3"
                style={{
                  backgroundColor: "rgb(var(--color-bg-subtle))",
                  borderColor: "rgb(var(--color-border))",
                }}
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                  {conversationThumb(selectedConversation) ? (
                    <Image
                      src={conversationThumb(selectedConversation)!}
                      alt={contentSummary.title}
                      fill
                      className="object-cover"
                      sizes="56px"
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
                  <p
                    className="truncate text-muted"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {money(
                      contentSummary.price?.amount,
                      contentSummary.price?.currency,
                    )}
                  </p>
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
            stagedMedia={stagedMedia}
            isUploading={isUploading}
            disabledReason={
              selectedConversation?.blockedByMe
                ? "You blocked this user"
                : selectedConversation?.blockedByOther
                  ? "This conversation is blocked"
                  : selectedConversation?.canSendMessages === false
                    ? "Messaging unavailable"
                    : null
            }
            requireAuth={requireAuth}
            onChange={onComposerChange}
            onSend={handleSend}
            onQuickReply={handleQuickReply}
            onStageMedia={onStageMedia}
            onClearStagedMedia={onClearStagedMedia}
          />
        </>
      )}
    </section>
  );
}
