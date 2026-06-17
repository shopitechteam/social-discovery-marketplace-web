"use client";

/**
 * DesktopNearbyColumn — desktop version of the Nearby tab. Mirrors the
 * geolocation / permission flow of the mobile NearbyGrid, but renders
 * desktop-styled cards and states (no full-screen fixed overlays).
 */

import { useState, useEffect, useCallback } from "react";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./FeedSkeleton";
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

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-default bg-elevated px-6 py-20 text-center">
      {children}
    </div>
  );
}

function DesktopPostCard({
  post,
  lang,
  priority,
}: {
  post: Parameters<typeof PostCard>[0]["post"];
  lang: string;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-default bg-elevated shadow-sm">
      <PostCard post={post} lang={lang} priority={priority} />
    </div>
  );
}

export function DesktopNearbyColumn({ lang }: { lang: string }) {
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
      () => setPrefsHydrated(true),
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

  const pinIcon = (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgb(var(--brand-primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );

  if (effectivePermState === "checking") {
    return (
      <Panel>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Checking location…</p>
      </Panel>
    );
  }

  if (effectivePermState === "idle") {
    return (
      <Panel>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {pinIcon}
        </div>
        <div>
          <h3 className="mb-1 text-lg font-bold text-default">
            Discover sellers near you
          </h3>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            See listings from sellers in your area. We only use your location to
            find nearby content.
          </p>
        </div>
        <button
          onClick={requestLocation}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: "rgb(var(--brand-primary))" }}
        >
          Enable location
        </button>
      </Panel>
    );
  }

  if (effectivePermState === "requesting") {
    return (
      <Panel>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Finding your location…</p>
      </Panel>
    );
  }

  if (effectivePermState === "denied") {
    return (
      <Panel>
        <div className="text-4xl">🚫</div>
        <h3 className="text-lg font-bold text-default">
          Location access denied
        </h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          To see nearby listings, enable location access in your browser settings
          and reload.
        </p>
      </Panel>
    );
  }

  if (effectivePermState === "unavailable") {
    return (
      <Panel>
        <div className="text-4xl">📍</div>
        <p className="text-sm text-muted-foreground">
          Location is not supported on this device.
        </p>
      </Panel>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-default bg-elevated"
          >
            <PostCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (geoError && !location) {
    return (
      <Panel>
        <div className="text-4xl">⚠️</div>
        <p className="text-sm text-muted-foreground">{geoError}</p>
        <button
          onClick={requestLocation}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: "rgb(var(--brand-primary))" }}
        >
          Try again
        </button>
      </Panel>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <Panel>
        <div className="text-4xl">🏪</div>
        <h3 className="text-lg font-bold text-default">
          No listings nearby yet
        </h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
          No sellers found in <strong>{effectiveLocation?.countyName}</strong>{" "}
          yet. Be the first to list something!
        </p>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {effectiveLocation && (
        <div className="flex items-center gap-2 rounded-2xl border border-default bg-elevated px-4 py-3">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(var(--brand-primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span className="text-sm text-muted-foreground">
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
            className="ml-auto text-sm font-medium text-primary"
            style={{ color: "rgb(var(--brand-primary))" }}
          >
            Refresh
          </button>
        </div>
      )}

      {items.map((post, i) => (
        <DesktopPostCard key={post.id} post={post} lang={lang} priority={i < 2} />
      ))}

      <div ref={sentinelRef} className="h-1" />

      {loading && items.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-default bg-elevated">
          <PostCardSkeleton />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          All nearby listings shown ✓
        </p>
      )}
    </div>
  );
}
