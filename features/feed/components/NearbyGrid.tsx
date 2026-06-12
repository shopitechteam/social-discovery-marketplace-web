"use client";

import { useState, useEffect, useCallback } from "react";
import { PostCard } from "./PostCard";
import { FeedPaginationSkeleton, FeedSkeleton } from "./FeedSkeleton";
import { useNearbyFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useFeedPreferencesStore } from "@/stores/feedPreferences";

type PermissionState =
  | "checking"
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

interface Location {
  countyName: string;
  subCountyName?: string | null;
}

interface Props {
  lang: string;
}

export function NearbyGrid({ lang }: Props) {
  const [permState, setPermState] = useState<PermissionState>("checking");
  const [location, setLocation] = useState<Location | null>(null);
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
  const effectiveLocation: Location | null =
    location ?? (prefsHydrated ? cachedLocation : null);
  const effectivePermState: PermissionState = effectiveLocation
    ? "granted"
    : permState;

  const { items, loading, hasMore, loadMore } = useNearbyFeed(
    effectiveLocation?.countyName ?? null,
    effectiveLocation?.subCountyName,
  );

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    rootMargin: "1400px",
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermState("unavailable");
      return;
    }
    setPermState("requesting");
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=6`,
            { headers: { "Accept-Language": "en" } },
          );
          const json = await res.json();
          // Nominatim returns state/county in address object
          const addr = json?.address ?? {};
          const raw = addr.state ?? addr.county ?? addr.region ?? null;
          const countyName = raw?.replace(/ county$/i, "").trim() ?? null;
          const subCountyName =
            addr.county !== raw
              ? (addr.county?.replace(/ county$/i, "").trim() ?? null)
              : null;
          if (!countyName) {
            setGeoError("Couldn't determine your county. Try again.");
            setPermState("granted");
            return;
          }
          const nextLocation = { countyName, subCountyName };
          setLocation(nextLocation);
          setCachedNearbyLocation(nextLocation);
          setPermState("granted");
        } catch {
          setGeoError("Location lookup failed. Please try again.");
          setPermState("granted");
        }
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
  }, [clearCachedNearbyLocation, setCachedNearbyLocation]);

  useEffect(() => {
    if (prefsHydrated) return;
    const unsubscribe = useFeedPreferencesStore.persist.onFinishHydration(
      () => {
        setPrefsHydrated(true);
      },
    );
    return unsubscribe;
  }, [prefsHydrated]);

  useEffect(() => {
    if (!prefsHydrated) return;
    if (cachedLocation) return;

    if (!navigator.geolocation) {
      queueMicrotask(() => setPermState("unavailable"));
      return;
    }

    if (!navigator.permissions?.query) {
      queueMicrotask(() => setPermState("idle"));
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted") {
          requestLocation();
        } else {
          setPermState(result.state === "denied" ? "denied" : "idle");
        }
      })
      .catch(() => setPermState("idle"));
  }, [cachedLocation, prefsHydrated, requestLocation]);

  if (effectivePermState === "checking") {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 w-full right-0 bottom-0 flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Checking location…</p>
      </div>
    );
  }

  // ── Permission not yet requested ──────────────────────────────────────────
  if (effectivePermState === "idle") {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 w-full right-0 bottom-0 flex-col items-center justify-center px-6 text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-default text-base mb-1">
            Discover sellers near you
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            See listings from sellers in your area. We only use your location to
            find nearby content.
          </p>
        </div>
        <button
          onClick={requestLocation}
          className="px-6 py-3 bg-primary text-white rounded-full text-sm font-semibold active:scale-95 transition-transform shadow-sm"
        >
          Enable location
        </button>
      </div>
    );
  }

  // ── Requesting ────────────────────────────────────────────────────────────
  if (effectivePermState === "requesting") {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 w-full right-0 bottom-0 flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Finding your location…</p>
      </div>
    );
  }

  // ── Denied ────────────────────────────────────────────────────────────────
  if (effectivePermState === "denied") {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 w-full right-0 bottom-0 flex-col items-center justify-center px-6 text-center gap-4">
        <div className="text-4xl">🚫</div>
        <h3 className="font-bold text-default text-base">
          Location access denied
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          To see nearby listings, enable location access in your browser
          settings and reload.
        </p>
      </div>
    );
  }

  // ── Unavailable ───────────────────────────────────────────────────────────
  if (effectivePermState === "unavailable") {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 w-full right-0 bottom-0 flex-col items-center justify-center px-6 text-center gap-4">
        <div className="text-4xl">📍</div>
        <p className="text-muted-foreground text-sm">
          Location is not supported on this device.
        </p>
      </div>
    );
  }

  // ── Granted — loading feed ────────────────────────────────────────────────
  if (loading && items.length === 0) return <FeedSkeleton />;

  // ── Geo error (location resolved but reverse geocode failed) ──────────────
  if (geoError && !location) {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 w-full right-0 bottom-0 flex-col items-center justify-center px-6 text-center gap-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-muted-foreground text-sm">{geoError}</p>
        <button
          onClick={requestLocation}
          className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── No results ────────────────────────────────────────────────────────────
  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-[93svh] fixed top-0 left-0 w-full right-0 bottom-0 flex-col items-center justify-center px-6 text-center gap-4">
        <div className="text-4xl">🏪</div>
        <h3 className="font-bold text-default text-base">
          No listings nearby yet
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          No sellers found in <strong>{effectiveLocation?.countyName}</strong>{" "}
          yet. Be the first to list something!
        </p>
      </div>
    );
  }

  return (
    <div className="pb-safe-area-inset-bottom pb-6">
      {/* Location banner */}
      {effectiveLocation && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span className="text-xs text-muted-foreground">
            Showing listings in{" "}
            <span className="font-semibold text-default">
              {effectiveLocation.subCountyName
                ? `${effectiveLocation.subCountyName}, `
                : ""}
              {effectiveLocation.countyName}
            </span>
          </span>
          <button
            onClick={requestLocation}
            className="ml-auto text-xs text-primary font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        {items.map((post, i) => (
          <PostCard key={post.id} post={post} lang={lang} priority={i < 3} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />

      {loading && items.length > 0 && <FeedPaginationSkeleton />}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-muted-foreground text-xs py-6">
          All nearby listings shown ✓
        </p>
      )}
    </div>
  );
}
