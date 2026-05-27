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

function elect() {
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
