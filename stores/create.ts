import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CreateStep = "pick" | "media" | "edit" | "options" | "ready";

export type MediaItem = {
  id: string;
  localUri: string;
  type: "image" | "video";
  status: "uploading" | "processing" | "ready" | "error";
  thumbnailUrl?: string;
  r2Variants?: Array<{
    variant: string;
    url: string;
    width?: number;
    height?: number;
    sizeBytes?: number | null;
  }>;
  muxPlaybackId?: string;
  errorMessage?: string;
};

/** A product attribute (Make, Model, Condition, …) — AI-generated, user-editable. */
export type Spec = { key: string; value: string };

/**
 * Reference to an embedded TikTok video. Present only for embed-backed drafts
 * (source = TIKTOK_EMBED). The video streams from TikTok via <tiktok-video>;
 * no media is uploaded or re-hosted.
 */
export type TiktokEmbed = {
  videoId: string;
  shareUrl: string;
  coverImageUrl?: string;
  authorUsername?: string;
  authorName?: string;
  title?: string;
  duration?: number;
};

/** Location as returned by the LocationPicker — mirrors ContentLocationInput */
export type DraftLocation = {
  placeName: string;           // e.g. "Madaraka Estate"
  formattedAddress: string;    // full address from Google
  placeId: string;             // Google Place ID
  latitude?: number;
  longitude?: number;
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
  categoryId: string | null;
  categoryName: string | null;
  categorySource: "ai" | "manual" | null;
  contentType: "image" | "video" | null;
  /** Set when the draft embeds a TikTok video instead of uploaded media. */
  tiktokEmbed: TiktokEmbed | null;
  price: number | null;
  currency: string;
  isFree: boolean;
  specs: Spec[];
  /** True while AI auto-fill is running after media processes. */
  isExtracting: boolean;
  /** True once AI auto-fill has run for this draft (so we don't re-run). */
  hasExtracted: boolean;
  visibilityMode: "public" | "friends_only" | "private";
  allowDownload: boolean;
  hdEnabled: boolean;
  postOnTiktok: boolean;
  scheduledPublishAt: Date | null;
  location: DraftLocation | null;
  isSubmitting: boolean;
  error: string | null;
  isRestoring: boolean;
  /**
   * True while a draft is being created in the background after the user picked
   * media. Lets the editor open INSTANTLY (before draftId exists) without the
   * CreateFlow guard bouncing back to the picker.
   */
  draftPending: boolean;
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
  setCategory: (
    id: string | null,
    name?: string | null,
    source?: "ai" | "manual" | null,
  ) => void;
  setContentType: (type: "image" | "video" | null) => void;
  setTiktokEmbed: (embed: TiktokEmbed | null) => void;
  setPrice: (price: number | null, isFree: boolean) => void;
  setSpecs: (specs: Spec[]) => void;
  setIsExtracting: (v: boolean) => void;
  setHasExtracted: (v: boolean) => void;
  setVisibilityMode: (mode: "public" | "friends_only" | "private") => void;
  setAllowDownload: (v: boolean) => void;
  setHdEnabled: (v: boolean) => void;
  setPostOnTiktok: (v: boolean) => void;
  setScheduledPublishAt: (date: Date | null) => void;
  setLocation: (loc: DraftLocation | null) => void;
  setIsSubmitting: (v: boolean) => void;
  setIsRestoring: (v: boolean) => void;
  setDraftPending: (v: boolean) => void;
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
  categoryId: null,
  categoryName: null,
  categorySource: null,
  contentType: null,
  tiktokEmbed: null,
  price: null,
  currency: "KES",
  isFree: true,
  specs: [],
  isExtracting: false,
  hasExtracted: false,
  visibilityMode: "public",
  allowDownload: false,
  hdEnabled: false,
  postOnTiktok: false,
  scheduledPublishAt: null,
  location: null,
  isSubmitting: false,
  error: null,
  isRestoring: false,
  draftPending: false,
};

export const useCreateStore = create<CreateFlowState & CreateFlowActions>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setStep: (step) => set({ step }),
      // Starting/switching a draft resets the one-shot AI auto-fill guard so the
      // new draft gets its own extraction pass.
      setDraftId: (draftId) =>
        set((s) =>
          s.draftId === draftId
            ? { draftId }
            : { draftId, hasExtracted: false, isExtracting: false },
        ),

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
      setCategory: (categoryId, categoryName = null, categorySource = null) =>
        set({ categoryId, categoryName, categorySource }),
      setContentType: (contentType) => set({ contentType }),
      setTiktokEmbed: (tiktokEmbed) => set({ tiktokEmbed }),
      setPrice: (price, isFree) => set({ price, isFree }),
      setSpecs: (specs) => set({ specs }),
      setIsExtracting: (isExtracting) => set({ isExtracting }),
      setHasExtracted: (hasExtracted) => set({ hasExtracted }),
      setVisibilityMode: (visibilityMode) => set({ visibilityMode }),
      setAllowDownload: (allowDownload) => set({ allowDownload }),
      setHdEnabled: (hdEnabled) => set({ hdEnabled }),
      setPostOnTiktok: (postOnTiktok) => set({ postOnTiktok }),
      setScheduledPublishAt: (scheduledPublishAt) => set({ scheduledPublishAt }),
      setLocation: (location) => set({ location }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      setIsRestoring: (isRestoring) => set({ isRestoring }),
      setDraftPending: (draftPending) => set({ draftPending }),
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
        tiktokEmbed: s.tiktokEmbed,
        // Strip blob localUris — they're only valid in the originating tab's memory
        mediaItems: s.mediaItems.map((item) => {
          const { localUri, ...rest } = item;
          void localUri;
          return rest as MediaItem;
        }),
        title: s.title,
        caption: s.caption,
        hashtags: s.hashtags,
        categoryId: s.categoryId,
        categoryName: s.categoryName,
        categorySource: s.categorySource,
        price: s.price,
        currency: s.currency,
        isFree: s.isFree,
        specs: s.specs,
        // NOTE: hasExtracted/isExtracting are intentionally NOT persisted.
        // Persisting hasExtracted made the AI auto-fill run only once per
        // browser session (it stayed true across drafts), so later uploads
        // silently never called the extraction mutation.
        visibilityMode: s.visibilityMode,
        allowDownload: s.allowDownload,
        hdEnabled: s.hdEnabled,
        postOnTiktok: s.postOnTiktok,
        scheduledPublishAt: s.scheduledPublishAt,
        location: s.location,
      }),
    },
  ),
);
