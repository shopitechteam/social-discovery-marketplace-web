"use client";

import { useCallback, useEffect, useState } from "react";
import { useFeedPreferencesStore } from "@/stores/feedPreferences";

export type NearbyPermissionState =
  | "checking"
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export interface NearbyCoords {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  label?: string | null;
}

/**
 * The persisted location is a render seed, not a source of truth. Anything
 * older than this triggers a silent GPS re-read so a user who travelled
 * (Nyahururu → Nanyuki) is not pinned to where they last opened the tab.
 */
const STALE_AFTER_MS = 10 * 60_000;

/**
 * Below this, a new fix is treated as GPS jitter and the previous coordinates
 * are kept. The feed query is keyed by lat/lng, so adopting every few-metre
 * drift would miss the Apollo cache and reset accumulated pagination pages.
 */
const SIGNIFICANT_MOVE_METERS = 500;

function metersBetween(a: NearbyCoords, b: NearbyCoords): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Owns the geolocation permission flow and the persisted "nearby" position,
 * shared by the mobile NearbyGrid and the DesktopNearbyColumn.
 */
export function useNearbyLocation() {
  const [permState, setPermState] = useState<NearbyPermissionState>("checking");
  const [location, setLocation] = useState<NearbyCoords | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const cachedLocation = useFeedPreferencesStore((s) => s.nearbyLocation);
  const setCachedNearbyLocation = useFeedPreferencesStore(
    (s) => s.setNearbyLocation,
  );
  const clearCachedNearbyLocation = useFeedPreferencesStore(
    (s) => s.clearNearbyLocation,
  );

  const [prefsHydrated, setPrefsHydrated] = useState(() =>
    useFeedPreferencesStore.persist.hasHydrated(),
  );

  // Read the stored position inside callbacks without making them depend on
  // (and re-run for) every coordinate change.
  const readCached = () => useFeedPreferencesStore.getState().nearbyLocation;

  const effectiveLocation: NearbyCoords | null =
    location ?? (prefsHydrated ? cachedLocation : null);

  // A cached position means we can render the feed immediately; a background
  // refresh must never drop the UI back to a spinner.
  const effectivePermState: NearbyPermissionState = effectiveLocation
    ? "granted"
    : permState;

  const requestLocation = useCallback(
    ({ silent = false }: { silent?: boolean } = {}) => {
      if (!navigator.geolocation) {
        setPermState("unavailable");
        return;
      }
      if (!silent) setPermState("requesting");
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next: NearbyCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
            label: "your current location",
          };
          const previous = readCached();
          const moved =
            !previous || metersBetween(previous, next) >= SIGNIFICANT_MOVE_METERS;

          if (moved) {
            setLocation(next);
            setCachedNearbyLocation(next);
          } else {
            // Same place: refresh the stored timestamp so we stop re-polling,
            // but keep the exact coordinates the feed query is already keyed by.
            setCachedNearbyLocation(previous);
          }
          setPermState("granted");
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            clearCachedNearbyLocation();
            setLocation(null);
            setPermState("denied");
          } else {
            setGeoError("Couldn't get your location.");
            setPermState("granted");
          }
        },
        { timeout: 10_000, maximumAge: 5 * 60_000 },
      );
    },
    [clearCachedNearbyLocation, setCachedNearbyLocation],
  );

  useEffect(() => {
    if (prefsHydrated) return;
    const unsubscribe = useFeedPreferencesStore.persist.onFinishHydration(() =>
      setPrefsHydrated(true),
    );
    return unsubscribe;
  }, [prefsHydrated]);

  // Resolve the position on mount, and again whenever the stored one has gone
  // stale — including on tab re-focus, which is when a moved user comes back.
  useEffect(() => {
    if (!prefsHydrated) return;

    if (!navigator.geolocation) {
      queueMicrotask(() => setPermState("unavailable"));
      return;
    }

    const resolve = () => {
      const current = readCached();
      const isStale =
        !current || Date.now() - current.updatedAt > STALE_AFTER_MS;
      if (!isStale) return;

      if (!navigator.permissions?.query) {
        // No Permissions API (older Safari): with nothing cached we must wait
        // for a tap, otherwise refresh silently behind the rendered feed.
        if (current) requestLocation({ silent: true });
        else setPermState("idle");
        return;
      }

      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            requestLocation({ silent: Boolean(current) });
          } else if (result.state === "denied") {
            clearCachedNearbyLocation();
            setPermState("denied");
          } else {
            setPermState(current ? "granted" : "idle");
          }
        })
        .catch(() => setPermState(current ? "granted" : "idle"));
    };

    // A fresh stored position short-circuits this; `effectivePermState`
    // already reports "granted" whenever one exists, so no state change is
    // needed on that path.
    resolve();

    const onVisible = () => {
      if (document.visibilityState === "visible") resolve();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [prefsHydrated, requestLocation, clearCachedNearbyLocation]);

  const refreshLocation = useCallback(
    () => requestLocation({ silent: true }),
    [requestLocation],
  );

  return {
    location: effectiveLocation,
    permState: effectivePermState,
    geoError,
    requestLocation,
    refreshLocation,
  };
}
