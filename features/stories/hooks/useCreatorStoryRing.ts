"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { StoriesFeedDocument } from "@/types/__generated__/graphql";
import { useSeenStories } from "../lib/seenStories";
import { useAuthHydrated } from "@/lib/auth/useAuthHydrated";
import { toTrayRing, type TrayRing } from "./useStoriesFeed";

/**
 * One creator's live stories, as this viewer sees them — for a ring on their
 * avatar anywhere in the app (post cards, their profile).
 *
 * Reads the same cached tray as StoriesBar: it's already loaded, kept live by
 * the socket, and every card on screen shares the one (deduplicated) request.
 * A card never adds a request of its own. Held until auth hydrates, so the
 * server-rendered card and the first client render match; the ring appears
 * just after.
 */
export function useCreatorStoryRing(userId: string | null | undefined): TrayRing | null {
  const hydrated = useAuthHydrated();
  const viewerId = useAuthStore((s) => s.user?.id ?? null);
  const { data } = useQuery(StoriesFeedDocument, {
    skip: !hydrated || !userId,
    fetchPolicy: "cache-first",
  });
  const seenLocally = useSeenStories();
  // Mount time is enough to leave out stories already expired in the cache;
  // the tray's own clock drops ones that expire while it's open.
  const [now] = useState(() => Date.now());

  return useMemo(() => {
    const ring = data?.storiesFeed.find((r) => r.user.id === userId);
    return ring ? toTrayRing(ring, seenLocally, viewerId, now) : null;
  }, [data, userId, seenLocally, viewerId, now]);
}
