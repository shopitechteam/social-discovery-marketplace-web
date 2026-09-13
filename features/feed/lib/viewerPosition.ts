/**
 * Which slide the immersive viewer was showing, remembered across a remount.
 *
 * The viewer rewrites the address bar as the user swipes, but Next keeps its
 * router tree pointing at the slug the route was opened with and restores that
 * tree on back. So returning from a conversation re-created the viewer seeded
 * on the FIRST video, not the one being watched.
 *
 * Reading the slug back out of `window.location` looked like the fix and is
 * not: on a back navigation the component can mount before the browser has
 * committed the restored URL, so the read is a race — sometimes the new slug,
 * sometimes the old one. This records the answer directly instead.
 *
 * Keyed by the ROUTE's slug rather than the active one, because that is what
 * stays stable across the remount: the route still says "golf", and that is
 * the key under which we stored "the user had swiped to phone-laptop-stand".
 *
 * Time-boxed so it can only ever restore a position the user just left. Coming
 * back to the same video tomorrow is a fresh visit and should start at the top.
 */

interface ViewerPosition {
  /** The route's own slug — the one Next will hand back on a remount. */
  routeSlug: string;
  /** The slug actually on screen when we left. */
  activeSlug: string;
  at: number;
}

/** Long enough to cover a detour into a conversation and back, no longer. */
const MAX_AGE_MS = 5 * 60 * 1000;

let last: ViewerPosition | null = null;

export function rememberViewerSlide(routeSlug: string, activeSlug: string) {
  last = { routeSlug, activeSlug, at: Date.now() };
}

/**
 * The slide to resume for this route, or null to start at the seed.
 *
 * Deliberately not one-shot: a remount can render more than once, and every
 * one of them should agree on where the viewer is.
 */
export function viewerSlideFor(routeSlug: string): string | null {
  if (!last || last.routeSlug !== routeSlug) return null;
  if (Date.now() - last.at > MAX_AGE_MS) return null;
  return last.activeSlug;
}

/** Forget the position — the user closed the viewer rather than stepping out. */
export function clearViewerSlide() {
  last = null;
}
