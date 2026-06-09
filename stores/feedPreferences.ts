"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type NearbyLocation = {
  countyName: string;
  subCountyName?: string | null;
  updatedAt: number;
};

type NearbyLocationInput = Omit<NearbyLocation, "updatedAt">;

type FeedPreferencesState = {
  nearbyLocation: NearbyLocation | null;
  videoMuted: boolean;
  setNearbyLocation: (location: NearbyLocationInput) => void;
  clearNearbyLocation: () => void;
  setVideoMuted: (muted: boolean) => void;
  toggleVideoMuted: () => void;
};

type PersistedFeedPreferencesState = {
  nearbyLocation?: NearbyLocation | null;
};

export const useFeedPreferencesStore = create<FeedPreferencesState>()(
  persist(
    (set) => ({
      nearbyLocation: null,
      videoMuted: true,

      setNearbyLocation: (location) =>
        set({
          nearbyLocation: {
            countyName: location.countyName,
            subCountyName: location.subCountyName ?? null,
            updatedAt: Date.now(),
          },
        }),

      clearNearbyLocation: () => set({ nearbyLocation: null }),
      setVideoMuted: (videoMuted) => set({ videoMuted }),
      toggleVideoMuted: () =>
        set((state) => ({ videoMuted: !state.videoMuted })),
    }),
    {
      name: "shopi-feed-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nearbyLocation: state.nearbyLocation,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as PersistedFeedPreferencesState | null;

        return {
          ...current,
          nearbyLocation: persistedState?.nearbyLocation ?? null,
          videoMuted: true,
        };
      },
    },
  ),
);
