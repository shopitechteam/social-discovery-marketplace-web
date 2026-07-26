/**
 * Mirror of the backend event constants — keep in sync with
 * src/services/websocket/socket-events.ts on the API.
 *
 * Only copy what the client needs; don't import server-only code.
 */

export const WS_EVENTS = {
  MEDIA_READY:    'media:ready',
  MEDIA_FAILED:   'media:failed',
  MEDIA_PROGRESS: 'media:progress',
  NOTIFICATION:   'notification',
  TIKTOK_IMPORT_UPDATED: 'tiktok:import:updated',
  CONTENT_PUBLISH_UPDATED: 'content:publish:updated',
  STORY_READY:  'story:ready',
  STORY_FAILED: 'story:failed',
  DM_MESSAGE_CREATED: 'dm:message:created',
  DM_MESSAGE_UPDATED: 'dm:message:updated',
  DM_CONVERSATION_UPDATED: 'dm:conversation:updated',
  DM_CONVERSATION_REMOVED: 'dm:conversation:removed',
  DM_PRESENCE_UPDATED: 'dm:presence:updated',
  DM_TYPING_UPDATED: 'dm:typing:updated',
  AGENT_STREAM_DELTA: 'agent:stream:delta',
  AGENT_STREAM_DONE: 'agent:stream:done',
} as const;

export const WS_CLIENT_EVENTS = {
  WATCH_DRAFT:   'watch:draft',
  UNWATCH_DRAFT: 'unwatch:draft',
  JOIN_CONVERSATION: 'join:conversation',
  LEAVE_CONVERSATION: 'leave:conversation',
  SET_CONVERSATION_VIEWPORT: 'conversation:viewport',
  START_TYPING: 'typing:start',
  STOP_TYPING: 'typing:stop',
} as const;

export interface DirectConversationViewportPayload {
  conversationId: string;
  tabId: string;
  isActive: boolean;
}

export interface MediaReadyPayload {
  mediaAssetId: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  url?: string;
  muxPlaybackId?: string;
  displayWidth?: number;
  displayHeight?: number;
  aspectRatio?: string;
  duration?: number;
}

export interface MediaFailedPayload {
  mediaAssetId: string;
  errorMessage: string;
}

export interface MediaProgressPayload {
  mediaAssetId: string;
  percent: number;
}

export interface StoryReadyPayload {
  storyId: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  muxPlaybackId?: string;
}

export interface TiktokImportUpdatedPayload {
  downloadId: string;
  status: 'COMPLETED' | 'FAILED' | 'UPLOADING' | 'PROCESSING';
  muxPlaybackId?: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  errorMessage?: string;
}

export interface ContentPublishUpdatedPayload {
  contentId: string;
  status: 'LIVE' | 'FAILED';
  muxPlaybackId?: string;
  errorMessage?: string;
}

export interface DirectMessageMediaSnapshot {
  mediaAssetId: string;
  type: 'image' | 'video';
  status: 'pending' | 'uploading' | 'processing' | 'ready' | 'failed' | 'orphaned';
  thumbnailUrl?: string;
  url?: string;
  muxPlaybackId?: string;
  displayWidth?: number;
  displayHeight?: number;
  aspectRatio?: string;
  duration?: number;
  errorMessage?: string;
}

export interface DirectMessageCreatedPayload {
  conversationId: string;
  messageId: string;
  contentId: string;
  senderId: string;
  recipientId: string;
  type: 'text' | 'image' | 'video' | 'location';
  text?: string;
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  media?: DirectMessageMediaSnapshot;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface DirectMessageUpdatedPayload {
  kind: 'delivery' | 'read' | 'media';
  conversationId: string;
  messageIds: string[];
  deliveredAt?: string;
  readAt?: string;
  media?: DirectMessageMediaSnapshot;
}

export interface DirectConversationUpdatedPayload {
  conversationId: string;
  contentId: string;
  sellerId: string;
  buyerId: string;
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageType?: 'text' | 'image' | 'video' | 'location';
  lastMessageSenderId?: string;
  lastMessageAt?: string;
  myUnreadCount: number;
  blockedByMe?: boolean;
  blockedByOther?: boolean;
  canSendMessages?: boolean;
  lifecycleStatus?: string;
  sellerFirstResponseMinutes?: number;
  buyerFirstResponseMinutes?: number;
  dealClosedAt?: string;
  dealClosedByUserId?: string;
}

export interface DirectConversationRemovedPayload {
  conversationId: string;
}

export interface DirectPresenceUpdatedPayload {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

export interface DirectTypingUpdatedPayload {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface NotificationActorPayload {
  id: string;
  username?: string;
  displayName: string;
  avatar?: string;
}

export interface NotificationPayload {
  id: string;
  type: 'FOLLOW' | 'SAVE' | 'POST_LIVE' | 'POST_REJECTED';
  title: string;
  body: string;
  actorCount: number;
  actors: NotificationActorPayload[];
  isRead: boolean;
  readAt?: string;
  actionPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationUpdatedPayload {
  action: 'upserted' | 'read' | 'read_all';
  notification?: NotificationPayload;
  unreadCount: number;
}

export interface AgentStreamDeltaPayload {
  draftId: string;
  channel: 'seller';
  delta: string;
}

export interface AgentStreamDonePayload {
  draftId: string;
  channel: 'seller';
  empty: boolean;
}
