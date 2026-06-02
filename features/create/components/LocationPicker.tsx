"use client";

import { useState } from "react";
import type { DraftLocation } from "@/stores/create";
import { LocationPickerDrawer } from "./LocationPickerDrawer";

interface Props {
  value: DraftLocation | null;
  onSelect: (loc: DraftLocation) => void;
  onClear: () => void;
}

export function LocationPicker({ value, onSelect, onClear }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {value ? (
        // ── Selected state ─────────────────────────────────────────────────
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer"
          style={{
            backgroundColor: "rgb(var(--color-bg-subtle))",
            border: "1px solid rgb(var(--color-border))",
          }}
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
          aria-label="Change location"
        >
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgb(var(--brand-primary) / 0.12)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--brand-primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>

          <div className="flex-1 min-w-0">
            <p
              className="font-semibold truncate"
              style={{ fontSize: "var(--text-sm)", color: "rgb(var(--color-text))" }}
            >
              {value.placeName}
            </p>
            {value.county && (
              <p
                className="truncate"
                style={{ fontSize: "var(--text-xs)", color: "rgb(var(--color-text-muted))" }}
              >
                {[value.subregion, value.county].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
            style={{ color: "rgb(var(--color-text-muted))", backgroundColor: "rgb(var(--color-bg))" }}
            aria-label="Remove location"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        // ── Tag location button ────────────────────────────────────────────
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 w-full transition-opacity active:opacity-70"
          style={{
            backgroundColor: "rgb(var(--color-bg-subtle))",
            border: "1px solid rgb(var(--color-border))",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-text-muted))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ fontSize: "var(--text-sm)", color: "rgb(var(--color-text-muted))" }}>
            Tag location
          </span>
        </button>
      )}

      <LocationPickerDrawer
        open={open}
        onOpenChange={setOpen}
        onSelect={onSelect}
      />
    </>
  );
}
