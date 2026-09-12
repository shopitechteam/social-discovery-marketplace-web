/**
 * immersiveHandoff — the one-shot baton passed from a feed card to the
 * immersive viewer when the card is tapped.
 *
 * The card knows exactly where its video was and whether sound was on; the
 * viewer mounts a frame later in a different tree and cannot ask. A module
 * singleton (same shape as lib/activeVideo.ts) carries that across without
 * threading props through a route boundary.
 *
 * Deliberately one-shot and time-boxed. A stale baton is worse than none: it
 * would seek a video the user opened minutes later from a share link to a
 * position they never watched to. Reading it consumes it.
 */

interface Handoff {
  contentId: string;
  time: number;
  muted: boolean;
  at: number;
}

/** Long enough to survive a route push and mount, far too short to go stale. */
const MAX_AGE_MS = 10_000;

let pending: Handoff | null = null;

export function setImmersiveHandoff(
  contentId: string,
  value: { time: number; muted: boolean },
) {
  pending = {
    contentId,
    time: Number.isFinite(value.time) ? value.time : 0,
    muted: value.muted,
    at: Date.now(),
  };
}

/**
 * Was this arrival a tap from the feed? Does NOT consume the baton.
 *
 * The viewer needs this during its very first render, before any slide exists
 * to claim the baton by id, because it decides whether sound starts on. That
 * has to be settled before the first paint: a <video> that mounts muted and is
 * unmuted afterwards is at the mercy of the autoplay policy, and the first
 * slide would keep coming up silent while later ones played with sound.
 *
 * The id is not checked here. Any fresh baton means the user got here by
 * tapping something, which is the only fact this answers.
 */
export function hasImmersiveHandoff(): boolean {
  if (!pending) return false;
  return Date.now() - pending.at <= MAX_AGE_MS;
}

/**
 * Reads and clears the baton, but only for the video it was set for. A
 * mismatched id means the user arrived some other way (deep link, forward
 * navigation), so there is nothing to hand off.
 */
export function takeImmersiveHandoff(
  contentId: string,
): { time: number; muted: boolean } | null {
  const value = pending;
  if (!value) return null;
  pending = null;
  if (value.contentId !== contentId) return null;
  if (Date.now() - value.at > MAX_AGE_MS) return null;
  return { time: value.time, muted: value.muted };
}
