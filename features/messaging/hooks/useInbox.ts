"use client";

/**
 * useInbox — the messaging feature's stateful core. Holds all queries, socket
 * subscriptions, local thread state, and the send/upload/read handlers.
 *
 * Extracted from the original InboxScreen monolith with NO behavior change
 * (Phase 0 refactor). The component layer is now purely presentational.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import {
  DirectConversationUpdatedPayload,
  DirectMessageCreatedPayload,
  DirectMessageUpdatedPayload,
  DirectPresenceUpdatedPayload,
  DirectTypingUpdatedPayload,
  WS_CLIENT_EVENTS,
  WS_EVENTS,
} from "@/lib/socket/socket-events";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/auth";
import { useAuthGuard } from "@/features/feed/hooks/useAuthGuard";
import type { Conversation, Message } from "../types";
import {
  applyMessageUpdate,
  fromSocketMessage,
  upsertConversation,
  upsertMessage,
} from "../lib/helpers";
import {
  DIRECT_CONVERSATION,
  DIRECT_MESSAGES,
  ENSURE_DIRECT_CONVERSATION,
  MARK_DIRECT_CONVERSATION_READ,
  MY_DIRECT_CONVERSATIONS,
  MY_UNREAD_CONVERSATION_COUNT,
  NOTIFY_IMAGE_UPLOADED,
  NOTIFY_VIDEO_UPLOADED,
  REQUEST_IMAGE_UPLOAD,
  REQUEST_VIDEO_UPLOAD,
  SEND_DIRECT_MESSAGE,
} from "../graphql/operations";

export function useInbox(lang: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { requireAuth } = useAuthGuard(lang);
  const { on } = useSocket();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [composer, setComposer] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);

  const ensureKeyRef = useRef<string | null>(null);
  const readKeyRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingPulseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contentIdParam = searchParams.get("contentId");
  const conversationIdParam = searchParams.get("conversationId");

  const {
    data: conversationsData,
    loading: conversationsLoading,
    refetch: refetchConversations,
  } = useQuery(MY_DIRECT_CONVERSATIONS, {
    variables: { limit: 40 },
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
  });

  const { data: unreadData } = useQuery(MY_UNREAD_CONVERSATION_COUNT, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
  });

  const { data: conversationData, loading: conversationLoading } = useQuery(DIRECT_CONVERSATION, {
    variables: { conversationId: selectedConversationId ?? "" },
    skip: !isAuthenticated || !selectedConversationId,
    fetchPolicy: "cache-and-network",
  });

  const PAGE_SIZE = 40;
  const apolloClient = useApolloClient();
  const [loadingOlder, setLoadingOlder] = useState(false);
  // hasMoreOlder is true until a fetch returns fewer than a full page.
  const [hasMoreOlder, setHasMoreOlder] = useState(true);

  const { data: messagesData, loading: messagesLoading } = useQuery(DIRECT_MESSAGES, {
    variables: {
      input: {
        conversationId: selectedConversationId ?? "",
        limit: PAGE_SIZE,
      },
    },
    skip: !isAuthenticated || !selectedConversationId,
    fetchPolicy: "cache-and-network",
  });

  const [ensureConversation, { loading: ensuringConversation }] = useMutation(ENSURE_DIRECT_CONVERSATION);
  const [sendDirectMessage] = useMutation(SEND_DIRECT_MESSAGE);
  const [markDirectConversationRead] = useMutation(MARK_DIRECT_CONVERSATION_READ);
  const [requestImageUpload] = useMutation(REQUEST_IMAGE_UPLOAD);
  const [notifyImageUploaded] = useMutation(NOTIFY_IMAGE_UPLOADED);
  const [requestVideoUpload] = useMutation(REQUEST_VIDEO_UPLOAD);
  const [notifyVideoUploaded] = useMutation(NOTIFY_VIDEO_UPLOADED);

  useEffect(() => {
    if (!isAuthenticated) {
      // Local thread state is reset on logout so socket-driven UI does not leak across sessions.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setSelectedConversationId(null);
      return;
    }
    if (conversationIdParam) {
      setSelectedConversationId(conversationIdParam);
    }
  }, [conversationIdParam, isAuthenticated]);

  useEffect(() => {
    // Keep the local list in sync with the latest query baseline; socket events layer on top afterward.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConversations(
      ((conversationsData as { myDirectConversations?: Conversation[] } | undefined)
        ?.myDirectConversations ?? []) as Conversation[],
    );
  }, [conversationsData]);

  useEffect(() => {
    const directConversation = (conversationData as { directConversation?: Conversation | null } | undefined)
      ?.directConversation;
    if (!directConversation) return;
    // Selected-thread detail is owned locally so presence and socket deltas can patch it immediately.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveConversation(directConversation as Conversation);
    setConversations((prev) => {
      const withoutCurrent = prev.filter((item) => item.id !== directConversation.id);
      return [directConversation as Conversation, ...withoutCurrent];
    });
  }, [conversationData]);

  useEffect(() => {
    const base =
      ((messagesData as { directConversationMessages?: Message[] } | undefined)
        ?.directConversationMessages ?? []) as Message[];
    // The base query returns the most recent page. If it's a full page there may
    // be older messages to lazy-load above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMoreOlder(base.length >= PAGE_SIZE);
    // Merge the baseline with whatever we already hold (older pages we prepended,
    // optimistic rows, socket-delivered messages) so a baseline refetch doesn't
    // drop them. Dedupe by id, keep chronological order.
    setMessages((prev) => {
      if (prev.length === 0) return base;
      const byId = new Map<string, Message>();
      for (const m of prev) byId.set(m.id, m);
      for (const m of base) byId.set(m.id, { ...byId.get(m.id), ...m });
      return Array.from(byId.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    });
  }, [messagesData]);

  // Reset thread-local message state whenever the open conversation changes, so
  // the per-conversation merge above never mixes two threads.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
    setHasMoreOlder(true);
    setLoadingOlder(false);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!contentIdParam || !isAuthenticated) return;
    if (ensureKeyRef.current === contentIdParam) return;

    ensureKeyRef.current = contentIdParam;
    ensureConversation({ variables: { input: { contentId: contentIdParam } } })
      .then((result) => {
        const conversation = (result.data as { ensureDirectConversation?: Conversation } | undefined)
          ?.ensureDirectConversation;
        if (!conversation) return;
        setSelectedConversationId(conversation.id);
        setActiveConversation(conversation);
        setConversations((prev) => {
          const withoutCurrent = prev.filter((item) => item.id !== conversation.id);
          return [conversation, ...withoutCurrent];
        });
        router.replace(`/${lang}/notifications?conversationId=${conversation.id}`);
        void refetchConversations();
      })
      .catch((error) => {
        ensureKeyRef.current = null;
        toast.error(error.message ?? "Could not open the conversation");
      });
  }, [contentIdParam, ensureConversation, isAuthenticated, lang, refetchConversations, router]);

  useEffect(() => {
    if (!selectedConversationId || !isAuthenticated) return;
    const socket = getSocket();
    socket.emit(WS_CLIENT_EVENTS.JOIN_CONVERSATION, selectedConversationId);
    return () => {
      socket.emit(WS_CLIENT_EVENTS.LEAVE_CONVERSATION, selectedConversationId);
    };
  }, [isAuthenticated, selectedConversationId]);

  useEffect(
    () =>
      on<DirectMessageCreatedPayload>(WS_EVENTS.DM_MESSAGE_CREATED, (payload) => {
        if (payload.conversationId === selectedConversationId) {
          setMessages((prev) => upsertMessage(prev, fromSocketMessage(payload, currentUser?.id)));
        }
      }),
    [currentUser?.id, on, selectedConversationId],
  );

  useEffect(
    () =>
      on<DirectMessageUpdatedPayload>(WS_EVENTS.DM_MESSAGE_UPDATED, (payload) => {
        if (payload.conversationId !== selectedConversationId) return;
        setMessages((prev) => applyMessageUpdate(prev, payload));
      }),
    [on, selectedConversationId],
  );

  useEffect(
    () =>
      on<DirectConversationUpdatedPayload>(WS_EVENTS.DM_CONVERSATION_UPDATED, (payload) => {
        setConversations((prev) => upsertConversation(prev, payload));
        if (activeConversation?.id === payload.conversationId) {
          setActiveConversation((prev) =>
            prev
              ? {
                  ...prev,
                  lastMessageId: payload.lastMessageId,
                  lastMessageText: payload.lastMessageText,
                  lastMessageType: payload.lastMessageType,
                  lastMessageSenderId: payload.lastMessageSenderId,
                  lastMessageAt: payload.lastMessageAt,
                  myUnreadCount: payload.myUnreadCount,
                }
              : prev,
          );
        }
        if (!conversations.some((item) => item.id === payload.conversationId)) {
          void refetchConversations();
        }
      }),
    [activeConversation?.id, conversations, on, refetchConversations],
  );

  useEffect(
    () =>
      on<DirectPresenceUpdatedPayload>(WS_EVENTS.DM_PRESENCE_UPDATED, (payload) => {
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.otherParticipant?.id === payload.userId
              ? {
                  ...conversation,
                  otherParticipantOnline: payload.isOnline,
                  otherParticipantLastSeenAt: payload.lastSeenAt ?? conversation.otherParticipantLastSeenAt,
                }
              : conversation,
          ),
        );
        setActiveConversation((prev) =>
          prev?.otherParticipant?.id === payload.userId
            ? {
                ...prev,
                otherParticipantOnline: payload.isOnline,
                otherParticipantLastSeenAt: payload.lastSeenAt ?? prev.otherParticipantLastSeenAt,
              }
            : prev,
        );
      }),
    [on],
  );

  useEffect(
    () =>
      on<DirectTypingUpdatedPayload>(WS_EVENTS.DM_TYPING_UPDATED, (payload) => {
        if (payload.conversationId !== selectedConversationId) return;
        if (payload.userId === currentUser?.id) return;

        if (!payload.isTyping) {
          setTypingUserId(null);
          if (typingPulseRef.current) clearTimeout(typingPulseRef.current);
          return;
        }

        setTypingUserId(payload.userId);
        if (typingPulseRef.current) clearTimeout(typingPulseRef.current);
        typingPulseRef.current = setTimeout(() => setTypingUserId(null), 1800);
      }),
    [currentUser?.id, on, selectedConversationId],
  );

  useEffect(() => {
    if (!selectedConversationId || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.senderId === currentUser?.id) return;

    const readKey = `${selectedConversationId}:${lastMessage.id}`;
    if (readKeyRef.current === readKey) return;
    readKeyRef.current = readKey;

    markDirectConversationRead({
      variables: {
        input: {
          conversationId: selectedConversationId,
          upToMessageId: lastMessage.id,
        },
      },
    }).catch(() => {
      readKeyRef.current = null;
    });
  }, [currentUser?.id, markDirectConversationRead, messages, selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      activeConversation
      ?? conversations.find((conversation) => conversation.id === selectedConversationId)
      ?? null,
    [activeConversation, conversations, selectedConversationId],
  );

  const unreadThreads =
    (unreadData as { myUnreadDirectConversationCount?: number } | undefined)
      ?.myUnreadDirectConversationCount ?? 0;

  const navigateToConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      router.replace(`/${lang}/notifications?conversationId=${conversationId}`);
    },
    [lang, router],
  );

  const handleBack = useCallback(() => {
    setSelectedConversationId(null);
    setActiveConversation(null);
    setMessages([]);
    router.replace(`/${lang}/notifications`);
  }, [lang, router]);

  const sendTypingPulse = useCallback(() => {
    if (!selectedConversationId) return;
    const socket = getSocket();
    socket.emit(WS_CLIENT_EVENTS.START_TYPING, selectedConversationId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(WS_CLIENT_EVENTS.STOP_TYPING, selectedConversationId);
    }, 1200);
  }, [selectedConversationId]);

  const handleComposerChange = useCallback(
    (value: string) => {
      setComposer(value);
      if (value.trim()) sendTypingPulse();
    },
    [sendTypingPulse],
  );

  const handleSendText = useCallback(async () => {
    if (!selectedConversationId || !composer.trim()) return;
    setIsSending(true);
    try {
      const { data } = await sendDirectMessage({
        variables: {
          input: {
            conversationId: selectedConversationId,
            text: composer.trim(),
            clientMessageId: crypto.randomUUID(),
          },
        },
      });

      const message = (data as { sendDirectMessage?: Message } | undefined)?.sendDirectMessage;
      if (message) {
        setMessages((prev) => upsertMessage(prev, message));
        setComposer("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message failed to send");
    } finally {
      setIsSending(false);
    }
  }, [composer, selectedConversationId, sendDirectMessage]);

  // Hold the File for each optimistic media message so a failed upload can be
  // retried without the user re-picking the file.
  const pendingFilesRef = useRef<Map<string, { file: File; kind: "image" | "video"; text?: string }>>(
    new Map(),
  );

  /**
   * Runs the actual upload→notify→send for a media message that's already shown
   * optimistically (keyed by clientMessageId). On success, upsertMessage swaps
   * the optimistic row for the server message via clientMessageId. On failure,
   * the optimistic row is flagged failed so the user can retry.
   */
  const runMediaUpload = useCallback(
    async (
      clientMessageId: string,
      conversationId: string,
      file: File,
      kind: "image" | "video",
      text?: string,
    ) => {
      const markFailed = () =>
        setMessages((prev) =>
          prev.map((m) => (m.clientMessageId === clientMessageId ? { ...m, pendingStatus: "failed" } : m)),
        );

      setIsUploading(true);
      try {
        let mediaAssetId: string | undefined;
        let uploadUrl: string | undefined;

        if (kind === "image") {
          const { data } = await requestImageUpload({ variables: { mimeType: file.type || "image/jpeg" } });
          const r = (data as { requestImageUpload?: { mediaAssetId?: string; uploadUrl?: string } } | undefined)
            ?.requestImageUpload;
          mediaAssetId = r?.mediaAssetId;
          uploadUrl = r?.uploadUrl;
        } else {
          const { data } = await requestVideoUpload({ variables: { corsOrigin: window.location.origin } });
          const r = (data as { requestVideoUpload?: { mediaAssetId?: string; uploadUrl?: string } } | undefined)
            ?.requestVideoUpload;
          mediaAssetId = r?.mediaAssetId;
          uploadUrl = r?.uploadUrl;
        }
        if (!mediaAssetId || !uploadUrl) throw new Error("Could not start upload");

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || (kind === "video" ? "video/mp4" : "image/jpeg") },
        });
        if (!uploadResponse.ok) throw new Error(`Upload failed: ${uploadResponse.status}`);

        // Flip the optimistic row from "uploading" to "sending" once bytes land.
        setMessages((prev) =>
          prev.map((m) => (m.clientMessageId === clientMessageId ? { ...m, pendingStatus: "sending" } : m)),
        );

        if (kind === "image") await notifyImageUploaded({ variables: { mediaAssetId } });
        else await notifyVideoUploaded({ variables: { mediaAssetId } });

        const result = await sendDirectMessage({
          variables: {
            input: { conversationId, text, mediaAssetId, clientMessageId },
          },
        });
        const message = (result.data as { sendDirectMessage?: Message } | undefined)?.sendDirectMessage;
        if (message) {
          // Carry the local preview onto the confirmed row so the image doesn't
          // flicker to a spinner while the processed variant is still rendering.
          const preview = pendingFilesRef.current.get(clientMessageId);
          setMessages((prev) =>
            upsertMessage(prev, {
              ...message,
              clientMessageId,
              localPreviewUrl:
                preview?.kind === "image"
                  ? (prev.find((m) => m.clientMessageId === clientMessageId)?.localPreviewUrl ?? null)
                  : null,
            }),
          );
          pendingFilesRef.current.delete(clientMessageId);
        }
      } catch (error) {
        markFailed();
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [notifyImageUploaded, notifyVideoUploaded, requestImageUpload, requestVideoUpload, sendDirectMessage],
  );

  const uploadAndSendMedia = useCallback(
    async (file: File, kind: "image" | "video") => {
      const myId = currentUser?.id;
      if (!selectedConversationId || !myId) return;
      const textToSend = composer.trim() || undefined;
      const clientMessageId = crypto.randomUUID();
      const localPreviewUrl = URL.createObjectURL(file);
      pendingFilesRef.current.set(clientMessageId, { file, kind, text: textToSend });

      // Insert the optimistic message immediately so the user sees their media.
      const optimistic: Message = {
        id: `optimistic:${clientMessageId}`,
        conversationId: selectedConversationId,
        contentId: selectedConversation?.contentId ?? "",
        senderId: myId,
        recipientId: selectedConversation?.otherParticipant?.id ?? "",
        type: kind === "video" ? "VIDEO" : "IMAGE",
        text: textToSend ?? null,
        createdAt: new Date().toISOString(),
        isMine: true,
        deliveryStatus: "sent",
        clientMessageId,
        localPreviewUrl,
        pendingStatus: "uploading",
        mediaAsset: {
          id: `optimistic-media:${clientMessageId}`,
          type: kind === "video" ? "VIDEO" : "IMAGE",
          status: "PENDING",
          thumbnailUrl: kind === "video" ? localPreviewUrl : null,
        },
      };
      setMessages((prev) => [...prev, optimistic]);
      setComposer("");

      await runMediaUpload(clientMessageId, selectedConversationId, file, kind, textToSend);
    },
    [composer, currentUser?.id, runMediaUpload, selectedConversation?.contentId, selectedConversation?.otherParticipant?.id, selectedConversationId],
  );

  /** Retry a previously-failed optimistic media message. */
  const retryMessage = useCallback(
    async (message: Message) => {
      const cid = message.clientMessageId;
      if (!cid) return;
      const pending = pendingFilesRef.current.get(cid);
      if (!pending) return;
      setMessages((prev) =>
        prev.map((m) => (m.clientMessageId === cid ? { ...m, pendingStatus: "uploading" } : m)),
      );
      await runMediaUpload(cid, message.conversationId, pending.file, pending.kind, pending.text);
    },
    [runMediaUpload],
  );

  /** Remove a failed optimistic message (discard). */
  const discardMessage = useCallback((message: Message) => {
    const cid = message.clientMessageId;
    setMessages((prev) => prev.filter((m) => m.id !== message.id));
    if (cid) pendingFilesRef.current.delete(cid);
  }, []);

  /**
   * Load the page of messages older than the ones currently shown, using the
   * oldest loaded id as the `beforeId` cursor. Prepends (deduped). Returns the
   * number of new messages so the UI can preserve scroll position.
   */
  const loadOlderMessages = useCallback(async (): Promise<number> => {
    if (!selectedConversationId || loadingOlder || !hasMoreOlder) return 0;
    const oldest = messages[0];
    if (!oldest || oldest.id.startsWith("optimistic:")) return 0;

    setLoadingOlder(true);
    try {
      const { data } = await apolloClient.query({
        query: DIRECT_MESSAGES,
        variables: {
          input: { conversationId: selectedConversationId, limit: PAGE_SIZE, beforeId: oldest.id },
        },
        fetchPolicy: "network-only",
      });
      const older = (data as { directConversationMessages?: Message[] } | undefined)
        ?.directConversationMessages ?? [];

      setHasMoreOlder(older.length >= PAGE_SIZE);
      if (older.length === 0) return 0;

      let added = 0;
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const fresh = older.filter((m) => !ids.has(m.id));
        added = fresh.length;
        if (fresh.length === 0) return prev;
        return [...fresh, ...prev].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
      return added;
    } catch {
      return 0;
    } finally {
      setLoadingOlder(false);
    }
  }, [apolloClient, hasMoreOlder, loadingOlder, messages, selectedConversationId]);

  const handleContinue = useCallback(() => {
    if (!requireAuth()) return;
    if (conversations[0]) navigateToConversation(conversations[0].id);
  }, [conversations, navigateToConversation, requireAuth]);

  return {
    // identity / auth
    currentUser,
    isAuthenticated,
    requireAuth,
    // data
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    composer,
    typingUserId,
    unreadThreads,
    // loading flags
    conversationsLoading,
    conversationLoading,
    messagesLoading,
    ensuringConversation,
    isSending,
    isUploading,
    loadingOlder,
    hasMoreOlder,
    // actions
    navigateToConversation,
    handleBack,
    handleComposerChange,
    handleSendText,
    uploadAndSendMedia,
    retryMessage,
    discardMessage,
    loadOlderMessages,
    handleContinue,
  };
}

export type UseInbox = ReturnType<typeof useInbox>;
