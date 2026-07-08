"use client";

/**
 * LocationPickerDrawer — RedNote-style location picker
 *
 * Nearby  → GPS → nearbyPage(pageToken) — 20 per page, infinite scroll via nextPageToken
 * All     → wardsPaged cursor scroll; first page sorted by $geoNear if GPS available
 *           typing = hybrid DB text-search + Google autocomplete
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { gql, type TypedDocumentNode } from "@apollo/client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import type { DraftLocation } from "@/stores/create";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NearbyPlace {
  placeId: string;
  name: string;
  address?: string | null;
  primaryType?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface NearbyPageResult {
  places: NearbyPlace[];
  radiusMeters: number;
  hasMore: boolean;
}

interface WardItem {
  id: string;
  name: string;
  slug: string;
  countyId: string;
  subCountyId: string;
  countyName?: string | null;
  subCountyName?: string | null;
}

interface WardPageResult {
  edges: WardItem[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText?: string | null;
  secondaryText?: string | null;
}

interface LocationResult {
  googlePlaceId?: string | null;
  placeName?: string | null;
  formattedAddress?: string | null;
  countyName?: string | null;
  subCountyName?: string | null;
  wardName?: string | null;
  coordinates?: { lat: number; lng: number } | null;
}

interface ReverseGeocodeResult {
  googlePlaceId?: string | null;
  placeName?: string | null;
  formattedAddress?: string | null;
  countyName?: string | null;
  subCountyName?: string | null;
  wardName?: string | null;
  coordinates?: { lat: number; lng: number } | null;
}

// ─── GQL ─────────────────────────────────────────────────────────────────────

const NEARBY_PAGE: TypedDocumentNode<
  { nearbyPage: NearbyPageResult },
  { lat: number; lng: number; radiusIndex: number }
> = gql`
  query LocationNearbyPage($lat: Float!, $lng: Float!, $radiusIndex: Int!) {
    nearbyPage(lat: $lat, lng: $lng, radiusIndex: $radiusIndex) {
      places { placeId name address primaryType lat lng }
      radiusMeters
      hasMore
    }
  }
`;

const WARDS_PAGED: TypedDocumentNode<
  { wardsPaged: WardPageResult },
  { after?: string; first: number; lat?: number; lng?: number }
> = gql`
  query LocationWardsPaged($after: String, $first: Int!, $lat: Float, $lng: Float) {
    wardsPaged(after: $after, first: $first, lat: $lat, lng: $lng) {
      edges { id name slug countyId subCountyId countyName subCountyName }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const WARD_SEARCH: TypedDocumentNode<
  { wardSearch: PlacePrediction[] },
  { input: string; sessionToken?: string }
> = gql`
  query LocationWardSearch($input: String!, $sessionToken: String) {
    wardSearch(input: $input, sessionToken: $sessionToken) {
      placeId description mainText secondaryText
    }
  }
`;

const RESOLVE_PLACE: TypedDocumentNode<
  { resolveGooglePlace: { matched: boolean; location: LocationResult } },
  { placeId: string }
> = gql`
  query LocationResolve($placeId: String!) {
    resolveGooglePlace(placeId: $placeId) {
      matched
      location {
        googlePlaceId placeName formattedAddress
        countyName subCountyName wardName
        coordinates { lat lng }
      }
    }
  }
`;

const REVERSE_GEOCODE: TypedDocumentNode<
  { reverseGeocode: { matched: boolean; location: ReverseGeocodeResult } },
  { lat: number; lng: number }
> = gql`
  query CreateLocationReverseGeocode($lat: Float!, $lng: Float!) {
    reverseGeocode(lat: $lat, lng: $lng) {
      matched
      location {
        googlePlaceId
        placeName
        formattedAddress
        countyName
        subCountyName
        wardName
        coordinates { lat lng }
      }
    }
  }
`;

// ─── Haversine distance (metres) ─────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function radiusLabel(r: number): string {
  return r >= 1000 ? `${r / 1000} km` : `${r} m`;
}

function firstText(...values: Array<string | null | undefined>): string | undefined {
  return values.find((value) => value?.trim())?.trim();
}

function gpsFallbackLabel(lat: number, lng: number): string {
  return `Current location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "nearby" | "all";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (loc: DraftLocation) => void;
}

function RadioCircle({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked
          ? "border-primary bg-primary"
          : "border-[rgb(var(--color-border-strong))] bg-transparent"
      }`}
    >
      {checked && <span className="w-2 h-2 rounded-full bg-white" />}
    </span>
  );
}

function Spinner({ small }: { small?: boolean }) {
  const s = small ? 14 : 24;
  return (
    <svg className="animate-spin text-primary" width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LoadMoreRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-5 text-xs text-muted">
      <Spinner small />
      <span>{label}</span>
    </div>
  );
}

export function LocationPickerDrawer({ open, onOpenChange, onSelect }: Props) {
  const [tab, setTab] = useState<Tab>("nearby");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  type CurrentLocationStatus = "idle" | "loading" | "denied" | "unavailable" | "lookupError" | "error";
  const [currentLocationStatus, setCurrentLocationStatus] =
    useState<CurrentLocationStatus>("idle");

  // Nearby
  type NearbyStatus = "idle" | "loading" | "loadingMore" | "done" | "denied" | "error";
  const [nearbyItems, setNearbyItems] = useState<NearbyPlace[]>([]);
  const [nearbyStatus, setNearbyStatus] = useState<NearbyStatus>("idle");
  const [nearbyRadiusMeters, setNearbyRadiusMeters] = useState(2000);
  const [nearbyHasMore, setNearbyHasMore] = useState(true);
  // Refs to avoid stale-closure bugs — always mirror their state counterparts
  const radiusIndexRef = useRef(0);
  const nearbyHasMoreRef = useRef(true);
  const nearbyItemsRef = useRef<NearbyPlace[]>([]); // mirrors nearbyItems for use in async callbacks
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null);
  const [gpsPosition, setGpsPosition] = useState<{ lat: number; lng: number } | null>(null);
  const nearbyLoadedRef = useRef(false);
  const nearbyLoadingRef = useRef(false);

  // All / wards
  type WardStatus = "idle" | "loading" | "loadingMore" | "done";
  const [wards, setWards] = useState<WardItem[]>([]);
  const [wardCursor, setWardCursor] = useState<string | null>(null);
  const [wardHasMore, setWardHasMore] = useState(true);
  const [wardStatus, setWardStatus] = useState<WardStatus>("idle");
  const wardsLoadedRef = useRef(false);
  const wardLoadingRef = useRef(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fetchNearbyPage] = useLazyQuery(NEARBY_PAGE, { fetchPolicy: "cache-first" });
  const [fetchWardsPaged] = useLazyQuery(WARDS_PAGED, { fetchPolicy: "network-only" });
  const [fetchWardSearch] = useLazyQuery(WARD_SEARCH, { fetchPolicy: "network-only" });
  const [fetchResolve] = useLazyQuery(RESOLVE_PLACE, { fetchPolicy: "cache-first" });
  const [fetchReverseGeocode] = useLazyQuery(REVERSE_GEOCODE, { fetchPolicy: "network-only" });

  function resetAll() {
    setQuery(""); setSelectedId(null); setTab("nearby");
    setCurrentLocationStatus("idle");
    setNearbyItems([]); setNearbyStatus("idle"); setNearbyRadiusMeters(2000); setNearbyHasMore(true);
    setWards([]); setWardCursor(null); setWardHasMore(true); setWardStatus("idle");
    gpsRef.current = null; nearbyItemsRef.current = [];
    setGpsPosition(null);
    nearbyLoadedRef.current = false; nearbyLoadingRef.current = false;
    nearbyHasMoreRef.current = true; radiusIndexRef.current = 0;
    wardsLoadedRef.current = false; wardLoadingRef.current = false;
  }

  // ── Nearby ───────────────────────────────────────────────────────────────

  // Request GPS and store in gpsRef. Calls cb(true) on success, cb(false, code) on failure.
  // code 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
  function requestGps(cb: (granted: boolean, code?: number) => void) {
    if (!navigator.geolocation) { cb(false, 1); return; }
    if (gpsRef.current) { cb(true); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        gpsRef.current = nextGps;
        setGpsPosition(nextGps);
        cb(true);
      },
      (err) => { cb(false, err.code); },
      { timeout: 15000, maximumAge: 120000, enableHighAccuracy: false },
    );
  }

  function startNearby() {
    if (!navigator.geolocation) { setNearbyStatus("denied"); return; }
    setNearbyStatus("loading");
    requestGps((granted, code) => {
      if (granted && gpsRef.current) {
        radiusIndexRef.current = 0;
        nearbyItemsRef.current = [];
        fetchNearbyBatch(0);
        return;
      }
      if (code === 1) { setNearbyStatus("denied"); return; }
      // code 2/3 = transient unavailable/timeout — retry up to 2 more times with longer delay
      let retries = 0;
      function retry() {
        retries++;
        setTimeout(() => {
          gpsRef.current = null; // clear so requestGps re-attempts
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const nextGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              gpsRef.current = nextGps;
              setGpsPosition(nextGps);
              radiusIndexRef.current = 0;
              nearbyItemsRef.current = [];
              fetchNearbyBatch(0);
            },
            (err2) => {
              if (err2.code === 1) { setNearbyStatus("denied"); return; }
              if (retries < 2) { retry(); return; }
              setNearbyStatus("error");
            },
            { timeout: 15000, maximumAge: 0, enableHighAccuracy: false },
          );
        }, retries * 2000);
      }
      retry();
    });
  }

  async function fetchNearbyBatch(idx: number) {
    const gps = gpsRef.current;
    if (!gps || nearbyLoadingRef.current) return;
    nearbyLoadingRef.current = true;
    try {
      const { data } = await fetchNearbyPage({
        variables: { lat: gps.lat, lng: gps.lng, radiusIndex: idx },
      });
      const page = data?.nearbyPage;
      if (!page) { setNearbyStatus("error"); return; }

      const existing = nearbyItemsRef.current;
      const seen = new Set(existing.map((p) => p.placeId));
      const fresh = page.places.filter((p) => !seen.has(p.placeId));
      const merged = [...existing, ...fresh].sort((a, b) => {
        const da = a.lat != null && a.lng != null ? haversine(gps.lat, gps.lng, a.lat, a.lng) : Infinity;
        const db = b.lat != null && b.lng != null ? haversine(gps.lat, gps.lng, b.lat, b.lng) : Infinity;
        return da - db;
      });

      nearbyItemsRef.current = merged;
      radiusIndexRef.current = idx;
      nearbyHasMoreRef.current = page.hasMore;
      setNearbyItems(merged);
      setNearbyRadiusMeters(page.radiusMeters);
      setNearbyHasMore(page.hasMore);
      setNearbyStatus("done");
      nearbyLoadedRef.current = true;
    } catch {
      setNearbyStatus("error");
    } finally {
      nearbyLoadingRef.current = false;
    }
  }

  function loadMoreNearby() {
    if (nearbyLoadingRef.current || !nearbyHasMoreRef.current) return;
    setNearbyStatus("loadingMore");
    fetchNearbyBatch(radiusIndexRef.current + 1);
  }

  // ── Wards ────────────────────────────────────────────────────────────────

  async function loadWards(after: string | null) {
    if (wardLoadingRef.current) return;
    wardLoadingRef.current = true;
    const isFirst = after === null;
    setWardStatus(isFirst ? "loading" : "loadingMore");
    const gps = gpsRef.current;
    try {
      const { data } = await fetchWardsPaged({
        variables: {
          after: after ?? undefined,
          first: 30,
          lat: gps?.lat,
          lng: gps?.lng,
        },
      });
      const page = data?.wardsPaged;
      if (!page) { setWardStatus("done"); return; }
      setWards((prev) => isFirst ? page.edges : [...prev, ...page.edges]);
      setWardCursor(page.pageInfo.endCursor);
      setWardHasMore(page.pageInfo.hasNextPage);
      setWardStatus("done");
      wardsLoadedRef.current = true;
    } catch {
      setWardStatus("done");
    } finally {
      wardLoadingRef.current = false;
    }
  }

  function loadMoreWards() {
    if (wardLoadingRef.current || !wardHasMore || wardCursor === null) return;
    loadWards(wardCursor);
  }

  // ── Search (Google Places) ───────────────────────────────────────────────

  const runSearch = useCallback(async (text: string) => {
    setWardStatus("loading");
    setWards([]);
    try {
      const { data } = await fetchWardSearch({ variables: { input: text } });
      const predictions = data?.wardSearch ?? [];
      // Map predictions to WardItem shape so the existing Row/pick logic works
      setWards(predictions.map((p) => ({
        id: `google:${p.placeId}`,
        name: p.mainText ?? p.description,
        slug: "",
        countyId: "",
        subCountyId: "",
        countyName: null,
        subCountyName: p.secondaryText ?? null,
      })));
    } finally {
      setWardStatus("done");
    }
  }, [fetchWardSearch]);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!v.trim()) {
      wardsLoadedRef.current = false;
      wardLoadingRef.current = false;
      setWards([]); setWardCursor(null); setWardHasMore(true);
      loadWards(null);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(v), 300);
  }

  // ── Resolve & confirm ────────────────────────────────────────────────────

  async function resolveAndSelect(placeId: string, fallback: Partial<DraftLocation>) {
    setResolving(true);
    try {
      const { data } = await fetchResolve({ variables: { placeId } });
      const loc = data?.resolveGooglePlace?.location;
      confirmLocation({
        placeName: loc?.placeName ?? fallback.placeName ?? "",
        formattedAddress: loc?.formattedAddress ?? fallback.formattedAddress ?? "",
        placeId: loc?.googlePlaceId ?? placeId,
        latitude: loc?.coordinates?.lat ?? fallback.latitude,
        longitude: loc?.coordinates?.lng ?? fallback.longitude,
        county: loc?.countyName ?? fallback.county,
        subregion: loc?.subCountyName ?? fallback.subregion,
      });
    } finally {
      setResolving(false);
    }
  }

  function handlePickNearby(p: NearbyPlace) {
    setSelectedId(p.placeId);
    resolveAndSelect(p.placeId, {
      placeName: p.name,
      formattedAddress: p.address ?? p.name,
      latitude: p.lat ?? undefined,
      longitude: p.lng ?? undefined,
    });
  }

  function handlePickWard(w: WardItem) {
    setSelectedId(w.id);
    if (w.id.startsWith("google:")) {
      const googlePlaceId = w.id.replace("google:", "");
      resolveAndSelect(googlePlaceId, {
        placeName: w.name,
        subregion: w.subCountyName ?? undefined,
        county: w.countyName ?? undefined,
      });
      return;
    }
    confirmLocation({
      placeName: w.name,
      formattedAddress: [w.name, w.subCountyName, w.countyName].filter(Boolean).join(", "),
      placeId: w.id,
      latitude: undefined,
      longitude: undefined,
      county: w.countyName ?? undefined,
      subregion: w.subCountyName ?? undefined,
    });
  }

  function confirmLocation(loc: DraftLocation) {
    onSelect(loc);
    onOpenChange(false);
  }

  function handleUseCurrentLocation() {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setCurrentLocationStatus("unavailable");
      return;
    }

    setCurrentLocationStatus("loading");
    requestGps(async (granted, code) => {
      if (!granted || !gpsRef.current) {
        setCurrentLocationStatus(code === 1 ? "denied" : "error");
        return;
      }

      const gps = gpsRef.current;
      try {
        const { data } = await fetchReverseGeocode({
          variables: { lat: gps.lat, lng: gps.lng },
        });
        const loc = data?.reverseGeocode?.location;
        const fallbackLabel = gpsFallbackLabel(gps.lat, gps.lng);
        const regionAddress = [loc?.wardName, loc?.subCountyName, loc?.countyName]
          .filter(Boolean)
          .join(", ");
        const hasResolvedLocation = Boolean(firstText(
          loc?.placeName,
          loc?.wardName,
          loc?.subCountyName,
          loc?.countyName,
          loc?.formattedAddress,
        ));
        if (!loc || !hasResolvedLocation) {
          setCurrentLocationStatus("lookupError");
          return;
        }

        const placeName = firstText(
          loc?.placeName,
          loc?.wardName,
          loc?.subCountyName,
          loc?.countyName,
          loc?.formattedAddress,
        ) ?? fallbackLabel;
        const formattedAddress = firstText(
          loc?.formattedAddress,
          regionAddress,
          placeName,
        ) ?? fallbackLabel;

        confirmLocation({
          placeName,
          formattedAddress,
          placeId: loc?.googlePlaceId ?? `current:${gps.lat.toFixed(5)},${gps.lng.toFixed(5)}`,
          latitude: loc?.coordinates?.lat ?? gps.lat,
          longitude: loc?.coordinates?.lng ?? gps.lng,
          county: loc?.countyName ?? undefined,
          subregion: loc?.subCountyName ?? undefined,
        });
      } catch {
        setCurrentLocationStatus("lookupError");
      }
    });
  }

  // ── Scroll handlers ──────────────────────────────────────────────────────

  function handleNearbyScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) loadMoreNearby();
  }

  function handleAllScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) loadMoreWards();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  function Row({
    id, primary, secondary, region, onPick,
  }: { id: string; primary: string; secondary?: string; region?: string; onPick: () => void }) {
    return (
      <button
        type="button"
        className="flex w-full items-center gap-3 border-b border-border px-4 py-3.5 text-left active:opacity-60"
        onClick={() => { setSelectedId(id); onPick(); }}
        disabled={resolving}
      >
        <RadioCircle checked={selectedId === id} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {primary}
          </p>
          {secondary && (
            <p className="mt-0.5 truncate text-xs text-muted">
              {secondary}
            </p>
          )}
        </div>
        {region && (
          <span className="ml-2 flex-shrink-0 text-right text-xs text-muted">
            {region}
          </span>
        )}
      </button>
    );
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      const resetTimer = setTimeout(resetAll, 300);
      return () => clearTimeout(resetTimer);
    }

    const loadTimer = setTimeout(() => {
      if (tab === "nearby") startNearby();
      if (tab === "all") {
        // Silently grab GPS for geo-sort, then load wards regardless
        requestGps(() => {}); // fire and forget; gpsRef will be set by the time loadWards runs if granted
        loadWards(null);
      }
    }, 0);

    return () => clearTimeout(loadTimer);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const loadTimer = setTimeout(() => {
      if (tab === "nearby" && !nearbyLoadedRef.current) startNearby();
      if (tab === "all" && !wardsLoadedRef.current) {
        requestGps(() => {}); // fire and forget; denial is fine, geo-sort is optional
        loadWards(null);
      }
    }, 0);

    return () => clearTimeout(loadTimer);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[75dvh] flex flex-col p-0 gap-0 outline-none">

        {/* Header */}
        <DrawerHeader className="px-4 pt-5 pb-0 flex items-center justify-between flex-shrink-0">
          <DrawerTitle className="text-base text-foreground">
            Locations
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Tabs */}
        <div className="mt-3 flex flex-shrink-0 border-b border-border px-4">
          {(["nearby", "all"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative mr-6 pb-2.5 text-sm font-semibold ${
                tab === t ? "text-foreground" : "text-muted"
              }`}
            >
              {t === "nearby" ? "Nearby" : "All"}
              {tab === t && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="px-4 pt-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={currentLocationStatus === "loading" || resolving}
            className="flex w-full items-center gap-3 rounded-xl border border-[rgb(var(--brand-primary)/0.18)] bg-[rgb(var(--brand-primary)/0.08)] px-3 py-3 text-left text-foreground active:opacity-70 disabled:opacity-70"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              {currentLocationStatus === "loading" ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12" />
                </svg>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">
                {currentLocationStatus === "loading"
                  ? "Finding your location..."
                  : "Use my current location"}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {currentLocationStatus === "denied"
                  ? "Location permission is blocked. You can still search below."
                  : currentLocationStatus === "unavailable"
                    ? "Location needs HTTPS or localhost. You can still search below."
                  : currentLocationStatus === "lookupError"
                    ? "Could not name this location. Search below instead."
                  : currentLocationStatus === "error"
                    ? "Could not get GPS. Try again or search below."
                    : "Share your GPS location for this post"}
              </p>
            </div>
          </button>
        </div>

        {/* Search — All tab */}
        {tab === "all" && (
          <div className="px-4 pt-3 pb-2 flex-shrink-0">
            <div className="flex h-10.5 items-center gap-2 rounded-xl border border-border bg-surface px-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-text-muted))" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search wards, towns, places…"
                className="flex-1 bg-transparent text-sm text-foreground caret-primary outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    wardsLoadedRef.current = false;
                    wardLoadingRef.current = false;
                    setWards([]); setWardCursor(null); setWardHasMore(true);
                    loadWards(null);
                  }}
                  className="text-muted"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resolving indicator */}
        {resolving && (
          <div className="flex flex-shrink-0 items-center gap-2 px-4 py-2 text-xs text-muted">
            <Spinner small />
            <span>Saving location…</span>
          </div>
        )}

        {/* ── NEARBY tab ────────────────────────────────────────────── */}
        {tab === "nearby" && (
          <div className="flex-1 overflow-y-auto" onScroll={handleNearbyScroll}>

            {nearbyStatus === "loading" && (
              <div className="px-4 pt-3 space-y-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-border py-3.5">
                    <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/3 rounded" />
                      <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                    <Skeleton className="h-3 w-10 rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {nearbyStatus === "denied" && (
              <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-text-muted))" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
                <p className="text-sm text-muted">
                  Location access denied.<br />Switch to <strong>All</strong> to search instead.
                </p>
              </div>
            )}

            {nearbyStatus === "error" && (
              <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-text-muted))" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="text-sm text-muted">
                  GPS signal weak — move to an open area or use <strong>All</strong> to search instead.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { nearbyLoadedRef.current = false; setNearbyItems([]); radiusIndexRef.current = 0; startNearby(); }}
                    className="rounded-lg bg-[rgb(var(--brand-primary)/0.1)] px-4 py-2 text-sm font-semibold text-primary"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("all")}
                    className="rounded-lg bg-surface px-4 py-2 text-sm font-semibold text-foreground"
                  >
                    Search All
                  </button>
                </div>
              </div>
            )}

            {(nearbyStatus === "done" || nearbyStatus === "loadingMore") && nearbyItems.length > 0 && (
              <p className="px-4 py-2 text-xs text-muted">
                Within {radiusLabel(nearbyRadiusMeters)}
              </p>
            )}

            {nearbyItems.map((p) => {
              const gps = gpsPosition;
              const dist = gps && p.lat != null && p.lng != null
                ? formatDist(haversine(gps.lat, gps.lng, p.lat, p.lng))
                : undefined;
              return (
                <Row
                  key={p.placeId}
                  id={p.placeId}
                  primary={p.name}
                  secondary={[p.primaryType, p.address].filter(Boolean).join(" · ")}
                  region={dist}
                  onPick={() => handlePickNearby(p)}
                />
              );
            })}

            {nearbyStatus === "loadingMore" && <LoadMoreRow label="Loading more places…" />}

            {nearbyStatus === "done" && !nearbyHasMore && nearbyItems.length > 0 && (
              <p className="px-4 py-4 text-center text-xs text-muted">
                No more nearby places
              </p>
            )}

            {nearbyStatus === "done" && nearbyItems.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                No places found nearby.
              </p>
            )}
          </div>
        )}

        {/* ── ALL tab ───────────────────────────────────────────────── */}
        {tab === "all" && (
          <div className="flex-1 overflow-y-auto" onScroll={handleAllScroll}>

            {wardStatus === "loading" && (
              <div className="px-4 pt-3 space-y-0">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-border py-3.5">
                    <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-1/2 rounded" />
                      <Skeleton className="h-3 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {wardStatus !== "loading" && wards.length === 0 && query.trim().length >= 2 && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}

            {wards.map((w) => (
              <Row
                key={w.id}
                id={w.id}
                primary={w.name}
                secondary={[w.subCountyName, w.countyName].filter(Boolean).join(", ")}
                onPick={() => handlePickWard(w)}
              />
            ))}

            {wardStatus === "loadingMore" && <LoadMoreRow label="Loading more wards…" />}

            {wardStatus === "done" && !wardHasMore && wards.length > 0 && (
              <p className="px-4 py-4 text-center text-xs text-muted">
                All wards loaded
              </p>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
