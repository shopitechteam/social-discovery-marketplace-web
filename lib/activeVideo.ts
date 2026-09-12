/**
 * activeVideo — singleton coordinator so only one video plays at a time.
 *
 * Each VideoMedia instance registers itself with a unique id and its current
 * intersection ratio. Whenever a ratio changes, the coordinator picks the
 * video with the highest ratio (≥ MIN_RATIO) as the "active" one and notifies
 * all registered listeners. Every other video is told to pause.
 */

const MIN_RATIO = 0.3; // must be at least 30% visible to be eligible

type Listener = (active: boolean) => void;

interface Entry {
  ratio: number;
  listener: Listener;
}

const registry = new Map<string, Entry>();

/**
 * Suspension depth, not a boolean.
 *
 * Another surface (the immersive viewer) can take over playback entirely while
 * the feed stays mounted behind it. A boolean would be left stuck on by React
 * Strict Mode's throwaway mount/unmount pass, silently killing feed autoplay
 * for the rest of the session; a counter tolerates the double-invoke.
 */
let suspendCount = 0;

function elect() {
  // While suspended nothing in the registry may play, whatever its ratio. The
  // feed cards behind a full-screen viewer still report their true viewport
  // ratios, so without this they would keep streaming and bleeding audio.
  if (suspendCount > 0) {
    for (const [, entry] of registry) entry.listener(false);
    return;
  }

  let bestId: string | null = null;
  let bestRatio = MIN_RATIO - 0.001; // anything below MIN_RATIO loses

  for (const [id, entry] of registry) {
    if (entry.ratio > bestRatio) {
      bestRatio = entry.ratio;
      bestId = id;
    }
  }

  for (const [id, entry] of registry) {
    entry.listener(id === bestId);
  }
}

/**
 * Pause every registered video until the matching resume.
 *
 * Call this synchronously in the handler that opens the takeover surface, not
 * in that surface's mount effect: having the outgoing element already paused
 * measurably improves the odds iOS honours the incoming element's play().
 */
export function suspendVideoElection() {
  suspendCount += 1;
  elect();
}

export function resumeVideoElection() {
  suspendCount = Math.max(0, suspendCount - 1);
  elect();
}

export function registerVideo(id: string, listener: Listener) {
  registry.set(id, { ratio: 0, listener });
  return () => {
    registry.delete(id);
    elect();
  };
}

export function updateRatio(id: string, ratio: number) {
  const entry = registry.get(id);
  if (!entry) return;
  entry.ratio = ratio;
  elect();
}
