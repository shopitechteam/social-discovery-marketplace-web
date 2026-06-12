"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  MessageCircle,
  Play,
  Send,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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

const MY_DIRECT_CONVERSATIONS = gql`
  query MyDirectConversationsInbox($limit: Int!) {
    myDirectConversations(limit: $limit) {
      id
      contentId
      lastMessageId
      lastMessageText
      lastMessageType
      lastMessageSenderId
      lastMessageAt
      messageCount
      myUnreadCount
      otherParticipantOnline
      otherParticipantLastSeenAt
      otherParticipant {
        id
        username
        profile {
          firstName
          lastName
          avatar
        }
      }
      content {
        id
        title
        price {
          amount
          currency
        }
        location {
          placeName
          county
          subregion
        }
        media {
          thumbnailUrl
          imageUrl
          muxMeta {
            thumbnailUrl
            playbackId
          }
          r2Variants {
            url
            variant
          }
        }
      }
    }
  }
`;

const DIRECT_CONVERSATION = gql`
  query DirectConversationInbox($conversationId: String!) {
    directConversation(conversationId: $conversationId) {
      id
      contentId
      lastMessageId
      lastMessageText
      lastMessageType
      lastMessageSenderId
      lastMessageAt
      messageCount
      myUnreadCount
      otherParticipantOnline
      otherParticipantLastSeenAt
      otherParticipant {
        id
        username
        profile {
          firstName
          lastName
          avatar
        }
      }
      content {
        id
        title
        price {
          amount
          currency
        }
        location {
          placeName
          county
          subregion
        }
        media {
          thumbnailUrl
          imageUrl
          muxMeta {
            thumbnailUrl
            playbackId
          }
          r2Variants {
            url
            variant
          }
        }
      }
    }
  }
`;

const DIRECT_MESSAGES = gql`
  query DirectConversationMessagesInbox($input: DirectConversationMessagesInput!) {
    directConversationMessages(input: $input) {
      id
      conversationId
      contentId
      senderId
      recipientId
      type
      text
      mediaAssetId
      deliveredAt
      readAt
      createdAt
      isMine
      deliveryStatus
      mediaAsset {
        id
        type
        status
        thumbnailUrl
        displayWidth
        displayHeight
        errorMessage
        r2Variants {
          url
          variant
          width
          height
        }
        muxMeta {
          playbackId
          duration
          thumbnailUrl
          animatedThumbnailUrl
          aspectRatio
        }
      }
    }
  }
`;

const MY_UNREAD_CONVERSATION_COUNT = gql`
  query MyUnreadDirectConversationCountInbox {
    myUnreadDirectConversationCount
  }
`;

const ENSURE_DIRECT_CONVERSATION = gql`
  mutation EnsureDirectConversationInbox($input: EnsureDirectConversationInput!) {
    ensureDirectConversation(input: $input) {
      id
      contentId
      messageCount
      myUnreadCount
      otherParticipant {
        id
        username
        profile {
          firstName
          lastName
          avatar
        }
      }
      otherParticipantOnline
      otherParticipantLastSeenAt
      content {
        id
        title
        price {
          amount
          currency
        }
        location {
          placeName
          county
          subregion
        }
        media {
          thumbnailUrl
          imageUrl
          muxMeta {
            thumbnailUrl
            playbackId
          }
          r2Variants {
            url
            variant
          }
        }
      }
    }
  }
`;

const SEND_DIRECT_MESSAGE = gql`
  mutation SendDirectMessageInbox($input: SendDirectMessageInput!) {
    sendDirectMessage(input: $input) {
      id
      conversationId
      contentId
      senderId
      recipientId
      type
      text
      mediaAssetId
      deliveredAt
      readAt
      createdAt
      isMine
      deliveryStatus
      mediaAsset {
        id
        type
        status
        thumbnailUrl
        displayWidth
        displayHeight
        errorMessage
        r2Variants {
          url
          variant
          width
          height
        }
        muxMeta {
          playbackId
          duration
          thumbnailUrl
          animatedThumbnailUrl
          aspectRatio
        }
      }
    }
  }
`;

const MARK_DIRECT_CONVERSATION_READ = gql`
  mutation MarkDirectConversationReadInbox($input: MarkDirectConversationReadInput!) {
    markDirectConversationRead(input: $input)
  }
`;

const REQUEST_IMAGE_UPLOAD = gql`
  mutation RequestImageUploadInbox($mimeType: String) {
    requestImageUpload(mimeType: $mimeType) {
      uploadUrl
      mediaAssetId
    }
  }
`;

const NOTIFY_IMAGE_UPLOADED = gql`
  mutation NotifyImageUploadedInbox($mediaAssetId: String!) {
    notifyImageUploaded(mediaAssetId: $mediaAssetId) {
      id
      status
    }
  }
`;

const REQUEST_VIDEO_UPLOAD = gql`
  mutation RequestVideoUploadInbox($corsOrigin: String) {
    requestVideoUpload(corsOrigin: $corsOrigin) {
      uploadUrl
      mediaAssetId
    }
  }
`;

const NOTIFY_VIDEO_UPLOADED = gql`
  mutation NotifyVideoUploadedInbox($mediaAssetId: String!) {
    notifyVideoUploaded(mediaAssetId: $mediaAssetId) {
      id
      status
    }
  }
`;

type UserProfile = {
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
};

type UserLite = {
  id: string;
  username?: string | null;
  profile?: UserProfile | null;
};

type ContentMedia = {
  thumbnailUrl?: string | null;
  imageUrl?: string | null;
  muxMeta?: {
    thumbnailUrl?: string | null;
    playbackId?: string | null;
  } | null;
  r2Variants?: Array<{
    url: string;
    variant?: string | null;
  }> | null;
};

type ContentLite = {
  id: string;
  title: string;
  price?: {
    amount?: number | null;
    currency?: string | null;
  } | null;
  location?: {
    placeName?: string | null;
    county?: string | null;
    subregion?: string | null;
  } | null;
  media?: ContentMedia[] | null;
};

type Conversation = {
  id: string;
  contentId: string;
  lastMessageId?: string | null;
  lastMessageText?: string | null;
  lastMessageType?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAt?: string | null;
  messageCount: number;
  myUnreadCount?: number | null;
  otherParticipant?: UserLite | null;
  otherParticipantOnline?: boolean | null;
  otherParticipantLastSeenAt?: string | null;
  content?: ContentLite | null;
};

type MessageMedia = {
  id: string;
  type?: string | null;
  status?: string | null;
  thumbnailUrl?: string | null;
  displayWidth?: number | null;
  displayHeight?: number | null;
  errorMessage?: string | null;
  r2Variants?: Array<{
    url: string;
    variant?: string | null;
    width?: number | null;
    height?: number | null;
  }> | null;
  muxMeta?: {
    playbackId?: string | null;
    duration?: number | null;
    thumbnailUrl?: string | null;
    animatedThumbnailUrl?: string | null;
    aspectRatio?: string | null;
  } | null;
};

type Message = {
  id: string;
  conversationId: string;
  contentId: string;
  senderId: string;
  recipientId: string;
  type: string;
  text?: string | null;
  mediaAssetId?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  isMine?: boolean | null;
  deliveryStatus?: string | null;
  mediaAsset?: MessageMedia | null;
};

function normalizeEnum(value?: string | null): string {
  return (value ?? "").toLowerCase();
}

function messageKind(value?: string | null): "text" | "image" | "video" {
  const normalized = normalizeEnum(value);
  if (normalized.includes("video")) return "video";
  if (normalized.includes("image")) return "image";
  return "text";
}

function mediaStatus(value?: string | null): string {
  return normalizeEnum(value) || "pending";
}

function participantName(user?: UserLite | null): string {
  const first = user?.profile?.firstName?.trim();
  const last = user?.profile?.lastName?.trim();
  const full = [first, last].filter(Boolean).join(" ");
  return full || user?.username || "Shopi user";
}

function initialsForUser(user?: UserLite | null): string {
  return participantName(user)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarGradient(id: string) {
  const palette = [
    "from-primary to-secondary",
    "from-violet-500 to-fuchsia-500",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-rose-500",
  ];
  const index = parseInt(id.slice(-1), 16) % palette.length;
  return palette[index];
}

function conversationThumb(conversation?: Conversation | null): string | null {
  const media = conversation?.content?.media?.[0];
  return (
    media?.thumbnailUrl ??
    media?.muxMeta?.thumbnailUrl ??
    media?.imageUrl ??
    media?.r2Variants?.find((variant) => variant.variant === "medium")?.url ??
    media?.r2Variants?.[0]?.url ??
    null
  );
}

function imageForMessage(message: Message): string | null {
  return (
    message.mediaAsset?.r2Variants?.find((variant) => variant.variant === "medium")?.url ??
    message.mediaAsset?.thumbnailUrl ??
    null
  );
}

function money(amount?: number | null, currency?: string | null): string {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "KES"} ${amount}`;
  }
}

function shortTime(value?: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function relativeTime(value?: string | null): string {
  if (!value) return "";
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function lastSeenLabel(conversation?: Conversation | null): string {
  if (!conversation?.otherParticipant) return "";
  if (conversation.otherParticipantOnline) return "Online";
  if (!conversation.otherParticipantLastSeenAt) return "Offline";
  return `Last seen ${relativeTime(conversation.otherParticipantLastSeenAt)} ago`;
}

function previewLabel(type?: string | null, text?: string | null): string {
  if (text?.trim()) return text;
  const kind = messageKind(type);
  if (kind === "image") return "Photo";
  if (kind === "video") return "Video";
  return "Message";
}

function upsertConversation(items: Conversation[], payload: DirectConversationUpdatedPayload): Conversation[] {
  const index = items.findIndex((item) => item.id === payload.conversationId);
  if (index === -1) return items;

  const updated: Conversation = {
    ...items[index],
    lastMessageId: payload.lastMessageId,
    lastMessageText: payload.lastMessageText,
    lastMessageType: payload.lastMessageType,
    lastMessageSenderId: payload.lastMessageSenderId,
    lastMessageAt: payload.lastMessageAt,
    myUnreadCount: payload.myUnreadCount,
  };

  const next = [...items];
  next.splice(index, 1);
  return [updated, ...next];
}

function upsertMessage(messages: Message[], incoming: Message): Message[] {
  const index = messages.findIndex((message) => message.id === incoming.id);
  if (index === -1) {
    return [...messages, incoming].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  const next = [...messages];
  next[index] = { ...next[index], ...incoming };
  return next;
}

function applyMessageUpdate(messages: Message[], payload: DirectMessageUpdatedPayload): Message[] {
  return messages.map((message) => {
    if (!payload.messageIds.includes(message.id)) return message;

    if (payload.kind === "media" && payload.media) {
      return {
        ...message,
        mediaAsset: {
          ...(message.mediaAsset ?? { id: payload.media.mediaAssetId }),
          id: payload.media.mediaAssetId,
          type: payload.media.type.toUpperCase(),
          status: payload.media.status.toUpperCase(),
          thumbnailUrl: payload.media.thumbnailUrl ?? message.mediaAsset?.thumbnailUrl,
          errorMessage: payload.media.errorMessage ?? message.mediaAsset?.errorMessage,
          displayWidth: payload.media.displayWidth ?? message.mediaAsset?.displayWidth,
          displayHeight: payload.media.displayHeight ?? message.mediaAsset?.displayHeight,
          r2Variants: payload.media.url
            ? [{ url: payload.media.url, variant: "medium" }]
            : (message.mediaAsset?.r2Variants ?? null),
          muxMeta: {
            ...(message.mediaAsset?.muxMeta ?? {}),
            playbackId: payload.media.muxPlaybackId,
            duration: payload.media.duration,
            thumbnailUrl: payload.media.thumbnailUrl,
            aspectRatio: payload.media.aspectRatio,
          },
        },
      };
    }

    if (payload.kind === "read") {
      return {
        ...message,
        deliveredAt: payload.readAt ?? message.deliveredAt,
        readAt: payload.readAt ?? message.readAt,
        deliveryStatus: "read",
      };
    }

    if (payload.kind === "delivery") {
      return {
        ...message,
        deliveredAt: payload.deliveredAt ?? message.deliveredAt,
        deliveryStatus: message.readAt ? "read" : "delivered",
      };
    }

    return message;
  });
}

function fromSocketMessage(payload: DirectMessageCreatedPayload, currentUserId?: string | null): Message {
  return {
    id: payload.messageId,
    conversationId: payload.conversationId,
    contentId: payload.contentId,
    senderId: payload.senderId,
    recipientId: payload.recipientId,
    type: payload.type.toUpperCase(),
    text: payload.text ?? null,
    deliveredAt: payload.deliveredAt ?? null,
    readAt: payload.readAt ?? null,
    createdAt: payload.createdAt,
    isMine: payload.senderId === currentUserId,
    deliveryStatus: payload.readAt
      ? "read"
      : payload.deliveredAt
        ? "delivered"
        : "sent",
    mediaAsset: payload.media
      ? {
          id: payload.media.mediaAssetId,
          type: payload.media.type.toUpperCase(),
          status: payload.media.status.toUpperCase(),
          thumbnailUrl: payload.media.thumbnailUrl ?? null,
          displayWidth: payload.media.displayWidth ?? null,
          displayHeight: payload.media.displayHeight ?? null,
          errorMessage: payload.media.errorMessage ?? null,
          r2Variants: payload.media.url ? [{ url: payload.media.url, variant: "medium" }] : null,
          muxMeta: {
            playbackId: payload.media.muxPlaybackId ?? null,
            duration: payload.media.duration ?? null,
            thumbnailUrl: payload.media.thumbnailUrl ?? null,
            aspectRatio: payload.media.aspectRatio ?? null,
          },
        }
      : null,
  };
}

export function InboxScreen({ lang }: { lang: string }) {
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

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
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

  const { data: unreadData } = useQuery(
    MY_UNREAD_CONVERSATION_COUNT,
    {
      skip: !isAuthenticated,
      fetchPolicy: "cache-and-network",
    },
  );

  const {
    data: conversationData,
    loading: conversationLoading,
  } = useQuery(DIRECT_CONVERSATION, {
    variables: { conversationId: selectedConversationId ?? "" },
    skip: !isAuthenticated || !selectedConversationId,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: messagesData,
    loading: messagesLoading,
  } = useQuery(DIRECT_MESSAGES, {
    variables: {
      input: {
        conversationId: selectedConversationId ?? "",
        limit: 40,
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages(
      ((messagesData as { directConversationMessages?: Message[] } | undefined)
        ?.directConversationMessages ?? []) as Message[],
    );
  }, [messagesData]);

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

  const uploadAndSendMedia = useCallback(
    async (file: File, kind: "image" | "video") => {
      if (!selectedConversationId) return;
      setIsUploading(true);
      const textToSend = composer.trim() || undefined;

      try {
        if (kind === "image") {
          const { data } = await requestImageUpload({
            variables: { mimeType: file.type || "image/jpeg" },
          });
          const requestResult = (data as {
            requestImageUpload?: { mediaAssetId?: string; uploadUrl?: string };
          } | undefined)?.requestImageUpload;
          const mediaAssetId = requestResult?.mediaAssetId;
          const uploadUrl = requestResult?.uploadUrl;
          if (!mediaAssetId || !uploadUrl) throw new Error("Could not start image upload");

          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type || "image/jpeg",
            },
          });
          if (!uploadResponse.ok) {
            throw new Error(`Image upload failed: ${uploadResponse.status}`);
          }

          await notifyImageUploaded({ variables: { mediaAssetId } });
          const result = await sendDirectMessage({
            variables: {
              input: {
                conversationId: selectedConversationId,
                text: textToSend,
                mediaAssetId,
                clientMessageId: crypto.randomUUID(),
              },
            },
          });

          const message = (result.data as { sendDirectMessage?: Message } | undefined)?.sendDirectMessage;
          if (message) {
            setMessages((prev) => upsertMessage(prev, message));
            setComposer("");
          }
          return;
        }

        const { data } = await requestVideoUpload({
          variables: { corsOrigin: window.location.origin },
        });
        const requestResult = (data as {
          requestVideoUpload?: { mediaAssetId?: string; uploadUrl?: string };
        } | undefined)?.requestVideoUpload;
        const mediaAssetId = requestResult?.mediaAssetId;
        const uploadUrl = requestResult?.uploadUrl;
        if (!mediaAssetId || !uploadUrl) throw new Error("Could not start video upload");

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "video/mp4",
          },
        });
        if (!uploadResponse.ok) {
          throw new Error(`Video upload failed: ${uploadResponse.status}`);
        }

        await notifyVideoUploaded({ variables: { mediaAssetId } });
        const result = await sendDirectMessage({
          variables: {
            input: {
              conversationId: selectedConversationId,
              text: textToSend,
              mediaAssetId,
              clientMessageId: crypto.randomUUID(),
            },
          },
        });

        const message = (result.data as { sendDirectMessage?: Message } | undefined)?.sendDirectMessage;
        if (message) {
          setMessages((prev) => upsertMessage(prev, message));
          setComposer("");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [
      composer,
      notifyImageUploaded,
      notifyVideoUploaded,
      requestImageUpload,
      requestVideoUpload,
      selectedConversationId,
      sendDirectMessage,
    ],
  );

  const openImagePicker = useCallback(() => {
    if (!requireAuth()) return;
    imageInputRef.current?.click();
  }, [requireAuth]);

  const openVideoPicker = useCallback(() => {
    if (!requireAuth()) return;
    videoInputRef.current?.click();
  }, [requireAuth]);

  const handleContinue = useCallback(() => {
    if (!requireAuth()) return;
    if (conversations[0]) navigateToConversation(conversations[0].id);
  }, [conversations, navigateToConversation, requireAuth]);

  const contentSummary = selectedConversation?.content;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100svh-var(--nav-height)-var(--safe-bottom))] px-4 py-6">
        <div
          className="mx-auto flex max-w-md flex-col gap-4 rounded-2xl border p-5"
          style={{
            backgroundColor: "rgb(var(--color-bg-elevated))",
            borderColor: "rgb(var(--color-border))",
          }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <MessageCircle size={22} />
          </div>
          <div className="space-y-1">
            <h1 className="font-semibold" style={{ fontSize: "var(--text-xl)" }}>
              Inbox
            </h1>
            <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
              Sign in to chat with sellers, send photos or videos, and keep every reply in one place.
            </p>
          </div>
          <Button onClick={handleContinue} className="h-11 rounded-full">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex min-h-[calc(100svh-var(--nav-height)-var(--safe-bottom))] w-full max-w-6xl flex-col md:grid md:grid-cols-[360px_minmax(0,1fr)]"
      style={{ paddingBottom: "calc(var(--nav-height) + var(--safe-bottom))" }}
    >
      <section
        className={`flex flex-col border-r md:min-h-[calc(100svh-var(--nav-height)-var(--safe-bottom))] ${
          selectedConversationId ? "hidden md:flex" : "flex"
        }`}
        style={{ borderColor: "rgb(var(--color-border))" }}
      >
        <div className="border-b px-4 py-4" style={{ borderColor: "rgb(var(--color-border))" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold" style={{ fontSize: "var(--text-xl)" }}>
                Inbox
              </h1>
              <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
                {unreadThreads > 0
                  ? `${unreadThreads} unread thread${unreadThreads === 1 ? "" : "s"}`
                  : "Your conversations with sellers and buyers"}
              </p>
            </div>
            {(conversationsLoading || ensuringConversation) && (
              <Loader2 className="animate-spin text-muted" size={18} />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading && conversations.length === 0 ? (
            <div className="space-y-3 px-4 py-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle size={24} />
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold" style={{ fontSize: "var(--text-lg)" }}>
                  No chats yet
                </h2>
                <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
                  Tap Message on any post and the thread will appear here instantly.
                </p>
              </div>
            </div>
          ) : (
            conversations.map((conversation) => {
              const selected = conversation.id === selectedConversationId;
              const thumb = conversationThumb(conversation);
              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => navigateToConversation(conversation.id)}
                  className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor: "rgb(var(--color-border) / 0.6)",
                    backgroundColor: selected ? "rgb(var(--brand-primary) / 0.06)" : "transparent",
                  }}
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-surface">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={conversation.content?.title || "Listing"}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <MessageCircle size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold" style={{ fontSize: "var(--text-base)" }}>
                        {participantName(conversation.otherParticipant)}
                      </p>
                      <span className="shrink-0 text-muted" style={{ fontSize: "var(--text-xs)" }}>
                        {shortTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className="truncate text-muted" style={{ fontSize: "var(--text-sm)" }}>
                      {conversation.content?.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p
                        className={`min-w-0 truncate ${
                          (conversation.myUnreadCount ?? 0) > 0 ? "font-semibold text-default" : "text-muted"
                        }`}
                        style={{ fontSize: "var(--text-sm)" }}
                      >
                        {previewLabel(conversation.lastMessageType, conversation.lastMessageText)}
                      </p>
                      {conversation.otherParticipantOnline ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      ) : null}
                    </div>
                  </div>

                  {(conversation.myUnreadCount ?? 0) > 0 ? (
                    <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      {conversation.myUnreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </section>

      <section className={`flex min-h-[calc(100svh-var(--nav-height)-var(--safe-bottom))] flex-col ${selectedConversationId ? "flex" : "hidden md:flex"}`}>
        {!selectedConversationId ? (
          <div className="hidden h-full items-center justify-center md:flex">
            <div className="max-w-sm space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle size={24} />
              </div>
              <h2 className="font-semibold" style={{ fontSize: "var(--text-lg)" }}>
                Pick a conversation
              </h2>
              <p className="text-muted" style={{ fontSize: "var(--text-sm)" }}>
                Open a thread to reply, share media, and see when the other person is online.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b px-4 py-3" style={{ borderColor: "rgb(var(--color-border))" }}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="md:hidden"
                  aria-label="Back to inbox"
                >
                  <ArrowLeft size={20} />
                </button>

                {selectedConversation?.otherParticipant?.profile?.avatar ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={selectedConversation.otherParticipant.profile.avatar}
                      alt={participantName(selectedConversation.otherParticipant)}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(
                      selectedConversation?.otherParticipant?.id ?? "0",
                    )} text-sm font-semibold text-white`}
                  >
                    {initialsForUser(selectedConversation?.otherParticipant)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold" style={{ fontSize: "var(--text-base)" }}>
                    {participantName(selectedConversation?.otherParticipant)}
                  </p>
                  <p className="truncate text-muted" style={{ fontSize: "var(--text-xs)" }}>
                    {lastSeenLabel(selectedConversation)}
                  </p>
                </div>

                {contentSummary ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/${lang}/content/${contentSummary.id}`)}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                    style={{ borderColor: "rgb(var(--color-border))" }}
                  >
                    View post
                  </button>
                ) : null}
              </div>

              {contentSummary ? (
                <div
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
                    <p className="truncate font-semibold" style={{ fontSize: "var(--text-sm)" }}>
                      {contentSummary.title}
                    </p>
                    <p className="truncate text-muted" style={{ fontSize: "var(--text-xs)" }}>
                      {money(contentSummary.price?.amount, contentSummary.price?.currency)}
                    </p>
                    <p className="truncate text-muted" style={{ fontSize: "var(--text-xs)" }}>
                      {contentSummary.location?.placeName || contentSummary.location?.subregion || contentSummary.location?.county}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto bg-[rgb(var(--color-bg-subtle)/0.35)] px-4 py-4">
              {(conversationLoading || messagesLoading) && messages.length === 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <Skeleton className="h-16 w-48 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const mine = Boolean(message.isMine ?? message.senderId === currentUser?.id);
                    const kind = messageKind(message.type);
                    const status = mediaStatus(message.mediaAsset?.status);
                    const imageUrl = imageForMessage(message);
                    const videoThumb = message.mediaAsset?.muxMeta?.thumbnailUrl ?? message.mediaAsset?.thumbnailUrl ?? null;

                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[82%] rounded-2xl px-3 py-2 ${mine ? "rounded-br-md text-white" : "rounded-bl-md"}`}
                          style={{
                            backgroundColor: mine ? "rgb(var(--brand-primary))" : "rgb(var(--color-bg-elevated))",
                            border: mine ? "none" : "1px solid rgb(var(--color-border))",
                          }}
                        >
                          {kind === "image" && (
                            <div className="mb-2 overflow-hidden rounded-xl bg-black/5">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt="Attachment"
                                  width={320}
                                  height={320}
                                  className="h-auto w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-40 items-center justify-center">
                                  <Loader2 size={22} className="animate-spin opacity-60" />
                                </div>
                              )}
                            </div>
                          )}

                          {kind === "video" && (
                            <div className="relative mb-2 overflow-hidden rounded-xl bg-black/10">
                              {videoThumb ? (
                                <Image
                                  src={videoThumb}
                                  alt="Video attachment"
                                  width={320}
                                  height={200}
                                  className="h-auto w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-40 items-center justify-center">
                                  <Loader2 size={22} className="animate-spin opacity-60" />
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
                                  <Play size={16} fill="currentColor" />
                                </div>
                              </div>
                            </div>
                          )}

                          {message.text ? (
                            <p style={{ fontSize: "var(--text-sm)", lineHeight: 1.45 }}>
                              {message.text}
                            </p>
                          ) : null}

                          {kind !== "text" && status !== "ready" ? (
                            <p className={`mt-2 ${mine ? "text-white/75" : "text-muted"}`} style={{ fontSize: "var(--text-xs)" }}>
                              {status === "failed"
                                ? (message.mediaAsset?.errorMessage || "Upload failed")
                                : status === "processing"
                                  ? "Processing media..."
                                  : "Uploading media..."}
                            </p>
                          ) : null}

                          <div
                            className={`mt-2 flex items-center gap-1 ${mine ? "justify-end text-white/70" : "justify-start text-muted"}`}
                            style={{ fontSize: "11px" }}
                          >
                            <span>{shortTime(message.createdAt)}</span>
                            {mine ? (
                              <span>
                                {normalizeEnum(message.deliveryStatus) || (
                                  message.readAt ? "read" : message.deliveredAt ? "delivered" : "sent"
                                )}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {typingUserId && selectedConversation?.otherParticipant?.id === typingUserId ? (
                    <div className="flex justify-start">
                      <div
                        className="rounded-2xl rounded-bl-md border px-3 py-2"
                        style={{
                          borderColor: "rgb(var(--color-border))",
                          backgroundColor: "rgb(var(--color-bg-elevated))",
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:120ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:240ms]" />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3" style={{ borderColor: "rgb(var(--color-border))" }}>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 rounded-full"
                  onClick={openImagePicker}
                  disabled={isUploading || isSending}
                >
                  <ImagePlus size={18} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-11 w-11 rounded-full"
                  onClick={openVideoPicker}
                  disabled={isUploading || isSending}
                >
                  <Video size={18} />
                </Button>

                <div className="flex-1">
                  <Input
                    value={composer}
                    onChange={(event) => handleComposerChange(event.target.value)}
                    placeholder="Message..."
                    className="h-11 rounded-full"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSendText();
                      }
                    }}
                  />
                </div>

                <Button
                  type="button"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={() => void handleSendText()}
                  disabled={isSending || isUploading || !composer.trim()}
                >
                  {isSending || isUploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </div>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadAndSendMedia(file, "image");
                event.currentTarget.value = "";
              }}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadAndSendMedia(file, "video");
                event.currentTarget.value = "";
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
