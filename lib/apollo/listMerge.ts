import type { Reference } from "@apollo/client/cache";

/**
 * Helpers shared by the cache's list field policies (see ApolloWrapper). Kept
 * free of React and of any runtime import so the merge rules can be exercised
 * against a real InMemoryCache outside the app.
 */

export type ListItem = Reference | { __ref?: string; id?: string };

export type ReadField = <T = unknown>(
  fieldName: string,
  from?: ListItem,
) => T | undefined;

export function itemKey(item: ListItem, readField: ReadField) {
  if ("__ref" in item && item.__ref) return item.__ref;
  const id = readField<string>("id", item);
  if (id) return id;
  return "id" in item ? item.id : undefined;
}

export function keyedSet(items: ListItem[], readField: ReadField) {
  const keys = new Set<string>();
  for (const item of items) {
    const key = itemKey(item, readField);
    if (key) keys.add(key);
  }
  return keys;
}

export type CursorPage = Record<string, unknown> & {
  hasMore?: unknown;
  nextCursor?: unknown;
};

/**
 * Merge for the `{ <items>, hasMore, nextCursor }` lists that are read with
 * `cache-and-network` and paged by `fetchMore` + `updateQuery`: the stores
 * directory, notifications, and the profile's own and saved posts.
 *
 * Without it, revisiting one of those screens rendered the accumulated list
 * from cache and then the background page-1 refresh overwrote it, collapsing
 * it to the first page under the user — so the scroll position a back or tab
 * return had just restored pointed past the end of the list.
 *
 * - A write carrying the cursor argument appends, deduped.
 * - A write at least as long as what is cached replaces it. That is a first
 *   load, and also how `updateQuery` hands back its combined pages.
 * - A shorter write is a first-page refresh: it becomes the new head (so new
 *   notifications and new posts still show up on top) and the rest of the
 *   loaded pages are kept after it, with the cursor still pointing past them.
 *   Items that dropped out of the refreshed head are gone. If the head no
 *   longer overlaps what was loaded at all, the lists cannot be stitched and
 *   the refresh wins.
 *
 * `refetch()` still collapses to page 1 on purpose: its default write policy
 * is "overwrite", so `existing` is undefined here.
 */
export function preserveLoadedPages(
  itemsField: string,
  cursorOf: (args: Record<string, unknown> | null) => unknown,
) {
  return (
    existing: CursorPage | undefined,
    incoming: CursorPage,
    {
      args,
      readField,
    }: { args: Record<string, unknown> | null; readField: ReadField },
  ): CursorPage => {
    const incomingItems =
      (incoming?.[itemsField] as ListItem[] | undefined) ?? [];
    const existingItems =
      (existing?.[itemsField] as ListItem[] | undefined) ?? [];

    if (cursorOf(args)) {
      const seen = keyedSet(existingItems, readField);
      const appended = incomingItems.filter((item) => {
        const key = itemKey(item, readField);
        return !key || !seen.has(key);
      });
      return { ...incoming, [itemsField]: [...existingItems, ...appended] };
    }

    if (!existing || existingItems.length <= incomingItems.length) {
      return incoming;
    }

    const fresh = keyedSet(incomingItems, readField);
    let lastOverlap = -1;
    existingItems.forEach((item, index) => {
      const key = itemKey(item, readField);
      if (key && fresh.has(key)) lastOverlap = index;
    });
    if (lastOverlap === -1) return incoming;

    const tail = existingItems.slice(lastOverlap + 1).filter((item) => {
      const key = itemKey(item, readField);
      return !key || !fresh.has(key);
    });
    return {
      ...incoming,
      [itemsField]: [...incomingItems, ...tail],
      hasMore: existing.hasMore,
      nextCursor: existing.nextCursor,
    };
  };
}
