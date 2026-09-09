"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Subcategory picker for /explore — the Alibaba category-tile pattern: a round
 * product photo per subcategory with its name underneath, four to a row.
 *
 * Why a photo grid rather than another chip bar: the category bar above it is
 * already chips, and a second row of text pills reads as more of the same. A
 * picture of an actual listing tells you what "Cables & Adapters" means in this
 * catalogue faster than the words do, which is the whole point of a discovery
 * surface. The cover comes from the best-ranked live listing in that
 * subcategory, so the row restyles itself as the catalogue changes with no
 * curation work.
 *
 * The row hides itself below MIN_TILES — a lone tile holding a single listing
 * is a worse filter than no filter, and most categories start out that thin.
 */

/** Fewer distinct subcategories than this and the row does not render at all. */
const MIN_TILES = 2;
/** Two full rows of four. Beyond this the row stops being scannable. */
const MAX_TILES = 8;

export type SubcategoryTile = {
  name: string;
  count: number;
  imageUrl?: string | null;
};

export function SubcategoryRow({
  subcategories,
  selected,
  onSelect,
  className,
}: {
  subcategories: SubcategoryTile[];
  /** Currently active subcategory name, or null for "all of this category". */
  selected: string | null;
  /** Called with the name to apply, or null to clear. */
  onSelect: (name: string | null) => void;
  className?: string;
}) {
  const tiles = subcategories.slice(0, MAX_TILES);
  if (tiles.length < MIN_TILES) return null;

  return (
    <section
      className={cn("px-4 pb-3 pt-4 lg:px-0 lg:pb-7 lg:pt-5", className)}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3 lg:mb-4">
        <h2
          className="font-semibold"
          style={{
            fontSize: "var(--text-sm)",
            color: "rgb(var(--color-text-main))",
          }}
        >
          Shop by type
        </h2>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="shrink-0 font-medium text-primary [-webkit-tap-highlight-color:transparent]"
            style={{ fontSize: "var(--text-xs)" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Base is the phone: exactly four across, two tidy rows, sized for a
          thumb. One `lg` override handles desktop, where the page picks up its
          sidebar and the main column gets wide — there is no middle tier,
          so tablets keep the phone layout rather than wrapping 8 tiles into a
          ragged 6+2.

          On desktop the column count is not pinned at all: auto-fill packs in
          as many 84px-floor tracks as the main column holds, so a tile is the
          same size whatever sits beside it. Fixed column counts went wrong in
          both directions here — four everywhere blew each circle past 200px in
          a desktop main column, and eight squeezed them below the phone size.

          NOTE: the floor (84px) is what sets the tile size, not `lg:max-w-30`.
          The cap only binds on very wide columns. To make desktop tiles bigger,
          raise the floor — and expect fewer per row. */}
      <ul className="grid grid-cols-4 gap-x-2 gap-y-3 lg:grid-cols-[repeat(auto-fill,minmax(84px,1fr))] lg:gap-x-4 lg:gap-y-5">
        {tiles.map((tile) => {
          const isSelected = selected === tile.name;
          return (
            <li key={tile.name}>
              <button
                type="button"
                onClick={() => onSelect(isSelected ? null : tile.name)}
                aria-pressed={isSelected}
                className="group mx-auto flex w-full max-w-17 flex-col items-center gap-1.5 outline-none [-webkit-tap-highlight-color:transparent] lg:max-w-30 lg:gap-2"
              >
                <span
                  className={cn(
                    "relative block aspect-square w-full overflow-hidden rounded-full transition-transform duration-150 group-active:scale-95",
                    // The selected ring sits outside the circle so it never
                    // crops the photo.
                    isSelected &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
                >
                  {tile.imageUrl ? (
                    <Image
                      src={tile.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 68px, 120px"
                      loading="lazy"
                    />
                  ) : null}

                  {isSelected && (
                    <span
                      className="absolute inset-0 flex items-center justify-center bg-black/45 text-white"
                      aria-hidden
                    >
                      <Check size={18} strokeWidth={3} />
                    </span>
                  )}
                </span>

                <span
                  // Reserve both lines so a one-word label and a wrapping one
                  // leave their circles on the same baseline across rows.
                  className="line-clamp-2 min-h-[2.5em] text-center leading-tight"
                  style={{
                    fontSize: "var(--text-xs)",
                    color: isSelected
                      ? "rgb(var(--brand-primary))"
                      : "rgb(var(--color-text))",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {tile.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
