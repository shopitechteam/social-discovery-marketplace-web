"use client";

import { useEffect, useState } from "react";

/** Tailwind's `md` breakpoint — desktop is ≥ 768px. */
const DESKTOP_QUERY = "(min-width: 768px)";

/**
 * Tracks the desktop breakpoint.
 *
 * Returns `null` until the first client measurement so callers can avoid a
 * hydration flash (render nothing / a neutral state until known). Pass
 * `{ ssrDefault: false }` if you'd rather start from a concrete boolean and
 * accept a possible first-paint correction.
 */
export function useIsDesktop(options?: {
  ssrDefault?: boolean;
}): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(
    options?.ssrDefault ?? null,
  );

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktop;
}
