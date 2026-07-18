const blockedDrafts = new Set<string>();
const inFlightAutosaves = new Map<string, Set<Promise<unknown>>>();

export function blockDraftAutosave(draftId: string): void {
  blockedDrafts.add(draftId);
}

export function unblockDraftAutosave(draftId: string): void {
  blockedDrafts.delete(draftId);
}

export function isDraftAutosaveBlocked(draftId: string): boolean {
  return blockedDrafts.has(draftId);
}

export function trackDraftAutosave<T>(
  draftId: string,
  request: Promise<T>,
): Promise<T> {
  const pending = inFlightAutosaves.get(draftId) ?? new Set<Promise<unknown>>();
  pending.add(request);
  inFlightAutosaves.set(draftId, pending);

  return request.finally(() => {
    const current = inFlightAutosaves.get(draftId);
    current?.delete(request);
    if (current && current.size === 0) {
      inFlightAutosaves.delete(draftId);
    }
  });
}

export async function awaitDraftAutosaves(draftId: string): Promise<void> {
  const pending = inFlightAutosaves.get(draftId);
  if (!pending || pending.size === 0) return;
  await Promise.allSettled(Array.from(pending));
}
