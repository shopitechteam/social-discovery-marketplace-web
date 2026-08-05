"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type NearbyLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  label?: string | null;
  updatedAt: number;
};

type NearbyLocationInput = Omit<NearbyLocation, "updatedAt">;

type FeedPreferencesState = {
  nearbyLocation: NearbyLocation | null;
  nearbyRadiusKm: number;
  videoMuted: boolean;
  /** When the "enable location" feed banner was last dismissed, or null if never. */
  locationBannerDismissedAt: number | null;
  setNearbyLocation: (location: NearbyLocationInput) => void;
  clearNearbyLocation: () => void;
  setNearbyRadiusKm: (radiusKm: number) => void;
  setVideoMuted: (muted: boolean) => void;
  toggleVideoMuted: () => void;
  dismissLocationBanner: () => void;
};

type PersistedFeedPreferencesState = {
  nearbyLocation?: NearbyLocation | null;
  nearbyRadiusKm?: number;
  videoMuted?: boolean;
  locationBannerDismissedAt?: number | null;
};

const DEFAULT_NEARBY_RADIUS_KM = 50;

export const useFeedPreferencesStore = create<FeedPreferencesState>()(
  persist(
    (set) => ({
      nearbyLocation: null,
      nearbyRadiusKm: DEFAULT_NEARBY_RADIUS_KM,
      videoMuted: true,
      locationBannerDismissedAt: null,

      setNearbyLocation: (location) =>
        set({
          nearbyLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracyMeters: location.accuracyMeters ?? null,
            label: location.label ?? null,
            updatedAt: Date.now(),
          },
        }),

      clearNearbyLocation: () => set({ nearbyLocation: null }),
      setNearbyRadiusKm: (nearbyRadiusKm) => set({ nearbyRadiusKm }),
      setVideoMuted: (videoMuted) => set({ videoMuted }),
      toggleVideoMuted: () =>
        set((state) => ({ videoMuted: !state.videoMuted })),
      dismissLocationBanner: () => set({ locationBannerDismissedAt: Date.now() }),
    }),
    {
      name: "shopi-feed-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nearbyLocation: state.nearbyLocation,
        nearbyRadiusKm: state.nearbyRadiusKm,
        videoMuted: state.videoMuted,
        locationBannerDismissedAt: state.locationBannerDismissedAt,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as PersistedFeedPreferencesState | null;
        const persistedLocation = persistedState?.nearbyLocation;
        const nearbyLocation =
          typeof persistedLocation?.latitude === "number" &&
          typeof persistedLocation.longitude === "number"
            ? persistedLocation
            : null;
        const nearbyRadiusKm =
          typeof persistedState?.nearbyRadiusKm === "number"
            ? persistedState.nearbyRadiusKm
            : DEFAULT_NEARBY_RADIUS_KM;

        return {
          ...current,
          nearbyLocation,
          nearbyRadiusKm,
          videoMuted:
            typeof persistedState?.videoMuted === "boolean"
              ? persistedState.videoMuted
              : true,
          locationBannerDismissedAt:
            typeof persistedState?.locationBannerDismissedAt === "number"
              ? persistedState.locationBannerDismissedAt
              : null,
        };
      },
    },
  ),
);
