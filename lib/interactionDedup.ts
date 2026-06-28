/**
 * Session-scoped dedup for content interactions.
 *
 * Prevents the same interaction type from firing more than once per content
 * item within a single page session. Reset on full page reload naturally
 * because this is module-level state.
 *
 * VIDEO_REPLAYED is intentionally excluded — every replay is distinct signal.
 */

const SESSION_ONCE: ReadonlySet<string> = new Set([
  "VIDEO_COMPLETED",
  "SKIPPED",
  "DETAIL_VIEWED",
  "LIKED",
  "SAVED",
  "SHARED",
  "REPORTED",
  "LINK_COPIED",
  "CREATOR_MESSAGED",
]);

const fired = new Set<string>();

function key(contentId: string, type: string): string {
  return `${contentId}:${type}`;
}

/** Returns true if this type has already been fired for this content this session. */
export function hasFired(contentId: string, type: string): boolean {
  return fired.has(key(contentId, type));
}

/**
 * Returns true if this interaction should be fired (not yet seen this session).
 * Automatically marks it as seen when returning true.
 */
export function shouldFire(contentId: string, type: string): boolean {
  if (!SESSION_ONCE.has(type)) return true; // always allow (e.g. VIDEO_REPLAYED)
  const k = key(contentId, type);
  if (fired.has(k)) return false;
  fired.add(k);
  return true;
}
