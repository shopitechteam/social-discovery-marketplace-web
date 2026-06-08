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
  STORY_READY:  'story:ready',
  STORY_FAILED: 'story:failed',
} as const;

export const WS_CLIENT_EVENTS = {
  WATCH_DRAFT:   'watch:draft',
  UNWATCH_DRAFT: 'unwatch:draft',
} as const;

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
