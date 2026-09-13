"use client";

import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";

/**
 * Re-run the queries on screen whenever the signed-in user changes.
 *
 * Signing in used to be a full-document navigation, which threw the Apollo
 * cache away and guaranteed every field was re-read as the new user. That also
 * threw away the feed: someone who had scrolled to the two-hundredth post,
 * tapped save, and signed in came back to the first post, because the pages
 * they had accumulated lived only in that cache.
 *
 * Navigating client-side keeps the cache, and therefore the position — but the
 * cached answers were computed for a signed-out viewer. `isSavedByMe`,
 * `isLikedByMe` and `isMyContent` are all viewer-scoped, so without this the
 * feed would come back correct in shape and wrong in state.
 *
 * A refetch rather than a cache reset, deliberately: refetching leaves the
 * current data on screen while the request is in flight, so nothing blanks,
 * nothing reflows, and the scroll position survives. Resetting the store would
 * empty every list first and undo the thing this is here to protect.
 *
 * Mounted once, inside the Apollo provider.
 */
export function RefetchOnAuthChange() {
  const client = useApolloClient();

  useEffect(() => {
    let previous = useAuthStore.getState().accessToken;

    return useAuthStore.subscribe((state) => {
      const next = state.accessToken;
      // Token rotation from the refresh link is not a change of viewer, and
      // refetching the whole screen on every silent refresh would be a lot of
      // traffic for nothing. Only signing in or out counts.
      if (Boolean(next) === Boolean(previous)) {
        previous = next;
        return;
      }
      previous = next;
      // Best-effort: a failure here leaves the cached data in place, which is
      // the same state we would have been in anyway.
      void client.refetchQueries({ include: "active" }).catch(() => {});
    });
  }, [client]);

  return null;
}
