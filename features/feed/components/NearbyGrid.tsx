"use client";

import { useState, useEffect, useCallback } from "react";
import { useApolloClient } from "@apollo/client/react";
import { PostCard } from "./PostCard";
import { FeedSkeleton } from "./FeedSkeleton";
import { useNearbyFeed } from "../hooks/useFeed";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { ReverseGeocodeDocument } from "@/types/__generated__/graphql";

type PermissionState = "idle" | "requesting" | "granted" | "denied" | "unavailable";

interface Location {
  lat: number;
  lng: number;
  countyName: string;
  subCountyName?: string | null;
}

interface Props {
  lang: string;
}

export function NearbyGrid({ lang }: Props) {
  const client = useApolloClient();
  const [permState, setPermState] = useState<PermissionState>("idle");
  const [location, setLocation] = useState<Location | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const { items, loading, hasMore, loadMore } = useNearbyFeed(
    location?.countyName ?? null,
    location?.subCountyName,
  );

  const { sentinelRef } = useInfiniteScroll({ hasMore, loading, onLoadMore: loadMore, rootMargin: "600px" });

  // On mount, check if permission was already granted (restore without re-asking)
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermState("unavailable");
      return;
    }
    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") requestLocation();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          const { data } = await client.query({
            query: ReverseGeocodeDocument,
            variables: { lat, lng },
          });
          const loc = data?.reverseGeocode?.location;
          const countyName = loc?.countyName?.replace(/ county$/i, "").trim() ?? null;
          if (!countyName) {
            setGeoError("Couldn't determine your county. Try again.");
            setPermState("granted");
            return;
          }
          setLocation({ lat, lng, countyName, subCountyName: loc.subCountyName });
          setPermState("granted");
        } catch {
          setGeoError("Location lookup failed. Please try again.");
          setPermState("granted");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setPermState("denied");
        else { setGeoError("Couldn't get your location."); setPermState("granted"); }
      },
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }, [client]);

  // ── Permission not yet requested ──────────────────────────────────────────
  if (permState === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-default text-base mb-1">Discover sellers near you</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            See listings from sellers in your area. We only use your location to find nearby content.
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
  if (permState === "requesting") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Finding your location…</p>
      </div>
    );
  }

  // ── Denied ────────────────────────────────────────────────────────────────
  if (permState === "denied") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
        <div className="text-4xl">🚫</div>
        <h3 className="font-bold text-default text-base">Location access denied</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          To see nearby listings, enable location access in your browser settings and reload.
        </p>
      </div>
    );
  }

  // ── Unavailable ───────────────────────────────────────────────────────────
  if (permState === "unavailable") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
        <div className="text-4xl">📍</div>
        <p className="text-muted-foreground text-sm">Location is not supported on this device.</p>
      </div>
    );
  }

  // ── Granted — loading feed ────────────────────────────────────────────────
  if (loading && items.length === 0) return <FeedSkeleton />;

  // ── Geo error (location resolved but reverse geocode failed) ──────────────
  if (geoError && !location) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-muted-foreground text-sm">{geoError}</p>
        <button onClick={requestLocation} className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold">
          Try again
        </button>
      </div>
    );
  }

  // ── No results ────────────────────────────────────────────────────────────
  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
        <div className="text-4xl">🏪</div>
        <h3 className="font-bold text-default text-base">No listings nearby yet</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          No sellers found in <strong>{location?.countyName}</strong> yet.{" "}
          Be the first to list something!
        </p>
      </div>
    );
  }

  return (
    <div className="pb-safe-area-inset-bottom pb-6">
      {/* Location banner */}
      {location && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <span className="text-xs text-muted-foreground">
            Showing listings in{" "}
            <span className="font-semibold text-default">
              {location.subCountyName ? `${location.subCountyName}, ` : ""}
              {location.countyName}
            </span>
          </span>
          <button onClick={requestLocation} className="ml-auto text-[11px] text-primary font-medium">
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

      {loading && items.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-muted-foreground text-xs py-6">
          All nearby listings shown ✓
        </p>
      )}
    </div>
  );
}
