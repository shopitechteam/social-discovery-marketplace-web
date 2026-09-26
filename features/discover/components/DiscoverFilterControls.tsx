"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_RADIUS_KM,
  DISTANCE_STOPS_KM,
  useDiscoverFiltersStore,
  type DiscoverContentType,
} from "@/stores/discoverFilters";

/**
 * Filter controls shared by the mobile filter drawer and the desktop sidebar,
 * bound straight to the discover filters store so both surfaces always show
 * the same state.
 *
 * Anything that changes continuously — typing a price, dragging the distance
 * slider — edits a local draft and only commits to the store (which is what
 * the queries read) once the input has been still for a moment. Committing on
 * every keystroke or slider tick fired a feed query, a count query and three
 * facet queries per step.
 */

const COMMIT_DELAY_MS = 450;

export const CONTENT_TYPE_OPTIONS: Array<{ value: DiscoverContentType | null; label: string }> = [
  { value: null, label: "All" },
  { value: "IMAGE", label: "Photos" },
  { value: "VIDEO", label: "Videos" },
];

export const POSTED_WITHIN_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: "Any time" },
  { value: 1, label: "Last 24 hours" },
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
];

export function postedWithinLabel(days: number | null): string {
  return POSTED_WITHIN_OPTIONS.find((option) => option.value === days)?.label ?? "Any time";
}

/**
 * A local copy of `value` that commits back after the user pauses. An outside
 * change (Clear, a shared link) replaces the draft — unless it is the value
 * this hook itself just committed.
 */
function useDebouncedDraft<T>(value: T, commit: (next: T) => void, delay = COMMIT_DELAY_MS) {
  const [draft, setDraft] = useState(value);
  const lastCommitted = useRef(value);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (Object.is(value, lastCommitted.current)) return;
    lastCommitted.current = value;
    setDraft(value);
  }, [value]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const update = (next: T) => {
    setDraft(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      lastCommitted.current = next;
      commit(next);
    }, delay);
  };

  return [draft, update] as const;
}

export function PriceRangeFields({ compact = false }: { compact?: boolean }) {
  const minPrice = useDiscoverFiltersStore((s) => s.minPrice);
  const maxPrice = useDiscoverFiltersStore((s) => s.maxPrice);
  const setMinPrice = useDiscoverFiltersStore((s) => s.setMinPrice);
  const setMaxPrice = useDiscoverFiltersStore((s) => s.setMaxPrice);
  const [minDraft, updateMin] = useDebouncedDraft(minPrice, setMinPrice);
  const [maxDraft, updateMax] = useDebouncedDraft(maxPrice, setMaxPrice);

  const inputClass = compact
    ? "h-9 min-w-0 rounded-lg border border-border bg-transparent px-2 text-xs font-semibold outline-none focus:border-primary"
    : "h-11 w-full rounded-xl border border-border bg-elevated px-3 text-[15px] text-main outline-none placeholder:text-muted focus:border-primary";

  return (
    <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-3")}>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="Min"
        value={minDraft}
        onChange={(event) => updateMin(event.target.value)}
        aria-label="Minimum price in KSh"
        className={inputClass}
      />
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="Max"
        value={maxDraft}
        onChange={(event) => updateMax(event.target.value)}
        aria-label="Maximum price in KSh"
        className={inputClass}
      />
    </div>
  );
}

/** Photos / Videos as one segmented control. */
export function ContentTypeSegments({ compact = false }: { compact?: boolean }) {
  const selectedType = useDiscoverFiltersStore((s) => s.selectedType);
  const setSelectedType = useDiscoverFiltersStore((s) => s.setSelectedType);

  return (
    <div
      role="radiogroup"
      aria-label="Content type"
      className={cn("grid grid-cols-3 rounded-xl bg-surface p-1", compact ? "gap-0.5" : "gap-1")}
    >
      {CONTENT_TYPE_OPTIONS.map((option) => {
        const active = selectedType === option.value;
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setSelectedType(option.value)}
            className={cn(
              "rounded-lg font-semibold transition-colors",
              compact ? "h-7 text-xs" : "h-9 text-sm",
              active ? "bg-elevated text-main shadow-sm" : "text-muted hover:text-main",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type LocateState = "idle" | "locating" | "denied" | "unavailable";

/**
 * "Near me" with a radius. The first tap asks the browser for the viewer's
 * position; after that the slider picks how far out to look. The position is
 * held in memory only — it never goes into the URL, so a shared link can't
 * reveal where someone was standing.
 */
export function DistanceFilter({ compact = false }: { compact?: boolean }) {
  const nearby = useDiscoverFiltersStore((s) => s.nearby);
  const radiusKm = useDiscoverFiltersStore((s) => s.radiusKm);
  const setNearby = useDiscoverFiltersStore((s) => s.setNearby);
  const setRadiusKm = useDiscoverFiltersStore((s) => s.setRadiusKm);
  const [locate, setLocate] = useState<LocateState>("idle");

  const stopIndex = Math.max(
    0,
    DISTANCE_STOPS_KM.findIndex((stop) => stop >= radiusKm),
  );
  const [draftIndex, updateIndex] = useDebouncedDraft(stopIndex, (index) =>
    setRadiusKm(DISTANCE_STOPS_KM[index] ?? DEFAULT_RADIUS_KM),
  );
  const draftKm = DISTANCE_STOPS_KM[draftIndex] ?? DEFAULT_RADIUS_KM;

  function requestLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocate("unavailable");
      return;
    }
    setLocate("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocate("idle");
        setNearby({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => setLocate(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  const text = compact ? "text-xs" : "text-sm";

  if (!nearby) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={requestLocation}
          disabled={locate === "locating"}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl border border-border font-semibold text-main transition-colors hover:bg-surface disabled:opacity-60",
            compact ? "h-9 text-xs" : "h-11 text-sm",
          )}
        >
          {locate === "locating" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden />
          )}
          {locate === "locating" ? "Finding you…" : "Use my location"}
        </button>
        {locate === "denied" ? (
          <p className={cn("text-muted", compact ? "text-[11px]" : "text-xs")}>
            Location access is off. Allow it in your browser settings to filter by distance.
          </p>
        ) : locate === "unavailable" ? (
          <p className={cn("text-muted", compact ? "text-[11px]" : "text-xs")}>
            Couldn’t find your location. Try again, or pick a region instead.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className={cn("font-semibold text-main", text)}>Within {draftKm} km of you</p>
        <button
          type="button"
          onClick={() => setNearby(null)}
          className={cn("shrink-0 font-semibold text-muted underline underline-offset-2", compact ? "text-[11px]" : "text-xs")}
        >
          Turn off
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={DISTANCE_STOPS_KM.length - 1}
        step={1}
        value={draftIndex}
        onChange={(event) => updateIndex(Number(event.target.value))}
        aria-label="Distance from you"
        aria-valuetext={`${draftKm} km`}
        className="w-full accent-primary"
      />
      <div className={cn("flex justify-between text-muted", compact ? "text-[10px]" : "text-[11px]")}>
        <span>{DISTANCE_STOPS_KM[0]} km</span>
        <span>{DISTANCE_STOPS_KM[DISTANCE_STOPS_KM.length - 1]} km</span>
      </div>
    </div>
  );
}
