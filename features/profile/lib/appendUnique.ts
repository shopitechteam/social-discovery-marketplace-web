/**
 * Append a page of results, dropping anything already on the list.
 *
 * These cursors index into a live collection: publish or delete a post, gain a
 * follower, get another profile visit while the user is paging, and the next
 * window overlaps the last one. Concatenating blindly then puts the same record
 * in the list twice, which React reports as a duplicate key and handles by
 * remounting or silently dropping a tile.
 *
 * The cursor-paginated feeds already dedupe for exactly this reason, inside
 * ApolloWrapper's mergeFeedPage. The profile screens each wrote their own
 * `updateQuery` and none of them did, so this is that guarantee in one place.
 */
export function appendUnique<T extends { id: string }>(
  previous: readonly T[],
  incoming: readonly T[],
): T[] {
  const seen = new Set(previous.map((item) => item.id));
  return [...previous, ...incoming.filter((item) => !seen.has(item.id))];
}
