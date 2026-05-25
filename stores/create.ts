import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CreateStep = "pick" | "media" | "edit" | "options" | "ready";

export type MediaItem = {
  id: string; // mediaAssetId from API
  localUri: string; // blob URL for preview before upload
  type: "image" | "video";
  status: "uploading" | "processing" | "ready" | "error";
  thumbnailUrl?: string;
  muxPlaybackId?: string;
  errorMessage?: string;
};

export type CreateFlowState = {
  // Current step
  step: CreateStep;

  // Draft ID from backend (null until created)
  draftId: string | null;

  // Media items (local state mirrors backend mediaAssetIds order)
  mediaItems: MediaItem[];

  // Edit step metadata
  title: string;
  caption: string;
  hashtags: string[];
  contentType: "image" | "video" | null;

  // Options step
  price: number | null;
  currency: string;
  isFree: boolean;
  visibilityMode: "public" | "friends_only" | "private";
  allowDownload: boolean;
  hdEnabled: boolean;
  scheduledPublishAt: Date | null;

  // UI state
  isSubmitting: boolean;
  error: string | null;

  /**
   * Set to true while CreateFlow is fetching draft state from the API on reload.
   * The UI shows a loading spinner instead of the wrong step.
   */
  isRestoring: boolean;
};

type CreateFlowActions = {
  setStep: (step: CreateStep) => void;
  setDraftId: (id: string) => void;
  addMediaItem: (item: MediaItem) => void;
  updateMediaItem: (id: string, patch: Partial<MediaItem>) => void;
  removeMediaItem: (id: string) => void;
  reorderMediaItems: (ids: string[]) => void;
  setTitle: (title: string) => void;
  setCaption: (caption: string) => void;
  setHashtags: (tags: string[]) => void;
  setContentType: (type: "image" | "video" | null) => void;
  setPrice: (price: number | null, isFree: boolean) => void;
  setVisibilityMode: (mode: "public" | "friends_only" | "private") => void;
  setAllowDownload: (v: boolean) => void;
  setHdEnabled: (v: boolean) => void;
  setScheduledPublishAt: (date: Date | null) => void;
  setIsSubmitting: (v: boolean) => void;
  setIsRestoring: (v: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
};

const DEFAULT_STATE: CreateFlowState = {
  step: "pick",
  draftId: null,
  mediaItems: [],
  title: "",
  caption: "",
  hashtags: [],
  contentType: null,
  price: null,
  currency: "KES",
  isFree: true,
  visibilityMode: "public",
  allowDownload: false,
  hdEnabled: false,
  scheduledPublishAt: null,
  isSubmitting: false,
  error: null,
  isRestoring: false,
};

export const useCreateStore = create<CreateFlowState & CreateFlowActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setStep: (step) => set({ step }),
      setDraftId: (draftId) => set({ draftId }),

      addMediaItem: (item) =>
        set((s) => ({ mediaItems: [...s.mediaItems, item] })),

      updateMediaItem: (id, patch) =>
        set((s) => ({
          mediaItems: s.mediaItems.map((m) =>
            m.id === id ? { ...m, ...patch } : m,
          ),
        })),

      removeMediaItem: (id) =>
        set((s) => ({
          mediaItems: s.mediaItems.filter((m) => m.id !== id),
        })),

      reorderMediaItems: (ids) =>
        set((s) => ({
          mediaItems: ids
            .map((id) => s.mediaItems.find((m) => m.id === id))
            .filter(Boolean) as MediaItem[],
        })),

      setTitle: (title) => set({ title }),
      setCaption: (caption) => set({ caption }),
      setHashtags: (hashtags) => set({ hashtags }),
      setContentType: (contentType) => set({ contentType }),
      setPrice: (price, isFree) => set({ price, isFree }),
      setVisibilityMode: (visibilityMode) => set({ visibilityMode }),
      setAllowDownload: (allowDownload) => set({ allowDownload }),
      setHdEnabled: (hdEnabled) => set({ hdEnabled }),
      setScheduledPublishAt: (scheduledPublishAt) => set({ scheduledPublishAt }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      setIsRestoring: (isRestoring) => set({ isRestoring }),
      setError: (error) => set({ error }),

      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: "shopi-create-draft",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist what's needed to re-land on the right step.
      // Transient UI flags (isSubmitting, error, isRestoring) are excluded.
      partialize: (s) => ({
        draftId: s.draftId,
        step: s.step,
        contentType: s.contentType,
        // Persist media items so in-progress uploads survive a reload.
        // blob: URIs won't work after reload but thumbnailUrl / muxPlaybackId will.
        mediaItems: s.mediaItems,
        // Persist text fields so the user doesn't lose typed content
        title: s.title,
        caption: s.caption,
        hashtags: s.hashtags,
        price: s.price,
        currency: s.currency,
        isFree: s.isFree,
        visibilityMode: s.visibilityMode,
        allowDownload: s.allowDownload,
        hdEnabled: s.hdEnabled,
        scheduledPublishAt: s.scheduledPublishAt,
      }),
    },
  ),
);
