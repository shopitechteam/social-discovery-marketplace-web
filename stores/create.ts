import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CreateStep = "pick" | "media" | "edit" | "options" | "ready";

export type MediaItem = {
  id: string;
  localUri: string;
  type: "image" | "video";
  status: "uploading" | "processing" | "ready" | "error";
  thumbnailUrl?: string;
  muxPlaybackId?: string;
  errorMessage?: string;
};

/** Location as returned by the LocationPicker — mirrors ContentLocationInput */
export type DraftLocation = {
  placeName: string;           // e.g. "Madaraka Estate"
  formattedAddress: string;    // full address from Google
  placeId: string;             // Google Place ID
  latitude: number;
  longitude: number;
  // Denormalized display labels (filled from Google address components)
  county?: string;             // e.g. "Laikipia"
  subregion?: string;          // e.g. "Nyahururu"
};

export type CreateFlowState = {
  step: CreateStep;
  draftId: string | null;
  mediaItems: MediaItem[];
  title: string;
  caption: string;
  hashtags: string[];
  contentType: "image" | "video" | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  visibilityMode: "public" | "friends_only" | "private";
  allowDownload: boolean;
  hdEnabled: boolean;
  scheduledPublishAt: Date | null;
  location: DraftLocation | null;
  isSubmitting: boolean;
  error: string | null;
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
  setLocation: (loc: DraftLocation | null) => void;
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
  location: null,
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
      setLocation: (location) => set({ location }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      setIsRestoring: (isRestoring) => set({ isRestoring }),
      setError: (error) => set({ error }),

      reset: () => set(DEFAULT_STATE),
    }),
    {
      name: "shopi-create-draft",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        draftId: s.draftId,
        step: s.step,
        contentType: s.contentType,
        // Strip blob localUris — they're only valid in the originating tab's memory
        mediaItems: s.mediaItems.map(({ localUri: _, ...rest }) => rest as MediaItem),
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
        location: s.location,
      }),
    },
  ),
);
