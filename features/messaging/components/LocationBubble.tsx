"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { mapsUrlFor, staticMapUrl } from "../lib/helpers";

/**
 * A shared-location message: a static map thumbnail (when available and it
 * loads) over an icon/label row. Tapping opens the coordinates in the device's
 * default maps app. If the static map fails (e.g. the Static Maps API isn't
 * enabled on the key), the broken image is hidden and we keep the label row.
 */
export function LocationBubble({
  latitude,
  longitude,
  label,
  mine,
}: {
  latitude: number;
  longitude: number;
  label?: string | null;
  mine: boolean;
}) {
  const mapImg = staticMapUrl(latitude, longitude);
  const [mapBroken, setMapBroken] = useState(false);
  const showMap = Boolean(mapImg) && !mapBroken;

  return (
    <a
      href={mapsUrlFor(latitude, longitude)}
      target="_blank"
      rel="noopener noreferrer"
      className={`block overflow-hidden rounded-xl transition-opacity active:opacity-70 ${
        mine ? "bg-white/15" : "bg-black/5"
      }`}
    >
      {showMap ? (
        <div className="relative aspect-[2/1] w-full bg-black/10">
          <Image
            src={mapImg as string}
            alt={label || "Shared location"}
            fill
            sizes="(max-width: 430px) 75vw, 320px"
            className="object-cover"
            unoptimized
            onError={() => setMapBroken(true)}
          />
          {/* Marker overlay — the OSM tile has no built-in pin, so we drop one
              at the center (the location sits ~mid-tile at this zoom). */}
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full drop-shadow">
            <MapPin
              size={26}
              className="fill-red-500 text-white"
              strokeWidth={2}
            />
          </span>
        </div>
      ) : null}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            mine ? "bg-white/20" : "bg-primary/15 text-primary"
          }`}
        >
          <MapPin size={18} />
        </span>
        <span className="min-w-0">
          <span
            className="block font-semibold leading-tight"
            style={{ fontSize: "var(--text-sm)" }}
          >
            Shared location
          </span>
          <span
            className={`block truncate ${mine ? "text-white/75" : "text-muted"}`}
            style={{ fontSize: "var(--text-xs)" }}
          >
            {label || "Tap to open in Maps"}
          </span>
        </span>
      </div>
    </a>
  );
}
