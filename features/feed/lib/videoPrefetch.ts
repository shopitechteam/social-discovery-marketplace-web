/**
 * Whether it is reasonable to warm the next video's stream.
 *
 * The immersive viewer keeps a second HLS player attached to the slide below
 * the active one so a swipe starts from a buffer rather than a manifest fetch.
 * That is a real bandwidth commitment — a few seconds of video the viewer may
 * never watch — and this surface is opened on mobile data most of the time, so
 * it is not unconditional.
 *
 * Two refusals, both explicit signals rather than guesses: Data Saver being on,
 * and a connection the browser itself classes as 2g. Anything else prefetches.
 * Safari reports no Network Information at all, so absence means yes — falling
 * back to "no" there would disable the feature for every iPhone, which is most
 * of the audience.
 */

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

function connectionOf(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInformation })
    .connection;
}

export function videoPrefetchAllowed(): boolean {
  const connection = connectionOf();
  // No API (Safari, older browsers) — prefetch. See note above.
  if (!connection) return typeof navigator !== "undefined";
  if (connection.saveData) return false;
  const type = connection.effectiveType ?? "";
  return type !== "slow-2g" && type !== "2g";
}

/**
 * Subscribe to connection changes so a viewer left open while the user walks
 * out of coverage stops warming the next slide. Returns an unsubscribe.
 */
export function onVideoPrefetchChange(listener: () => void): () => void {
  const connection = connectionOf();
  if (!connection?.addEventListener) return () => {};
  connection.addEventListener("change", listener);
  return () => connection.removeEventListener?.("change", listener);
}
