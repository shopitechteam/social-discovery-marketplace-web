"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { ToggleFollowDocument } from "@/types/__generated__/graphql";
import { useAuthGuard } from "./useAuthGuard";

interface UseFollowOptions {
  /** The user ID to follow/unfollow */
  userId: string;
  /** Initial follow state — comes from `creator.isFollowedByMe` on the feed item */
  initialFollowing: boolean;
  /** Initial follower count — comes from `creator.followerCount` */
  initialFollowerCount?: number;
  lang: string;
}

export function useFollow({
  userId,
  initialFollowing,
  initialFollowerCount = 0,
  lang,
}: UseFollowOptions) {
  const { requireAuth, isAuthenticated } = useAuthGuard(lang);
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);
  // Track whether we've done a local toggle so we don't clobber it with a
  // stale incoming prop update (e.g. Apollo cache re-render with old value)
  const locallyToggled = useRef(false);

  const client = useApolloClient();
  const [toggleFollowMutation] = useMutation(ToggleFollowDocument);

  // Sync when initialFollowing changes from the outside (e.g. Apollo cache
  // updates after a refetch, or when the same creator card re-mounts with
  // fresh data).  We only apply external updates when we haven't done a local
  // toggle, or after the loading cycle has finished.
  useEffect(() => {
    if (!locallyToggled.current) {
      setFollowing(initialFollowing);
      setFollowerCount(initialFollowerCount);
    }
  }, [initialFollowing, initialFollowerCount]);

  async function toggle() {
    // Guard — redirect to auth if guest
    if (!requireAuth()) return;

    const wasFollowing = following;
    // Mark that we've locally toggled so stale prop updates don't revert us
    locallyToggled.current = true;
    // Optimistic update
    setFollowing(!wasFollowing);
    setFollowerCount((c) => c + (wasFollowing ? -1 : 1));
    setLoading(true);

    try {
      const { data } = await toggleFollowMutation({
        variables: { userId },
        update(cache) {
          // Write the new follow state directly into the User's Apollo cache
          // entry so every component showing this user reflects the change
          // immediately — without needing a query refetch.
          const cacheId = cache.identify({ __typename: "User", id: userId });
          if (cacheId) {
            cache.modify({
              id: cacheId,
              fields: {
                isFollowedByMe: () => !wasFollowing,
                followerCount: (prev: number) =>
                  Math.max(0, prev + (wasFollowing ? -1 : 1)),
              },
            });
          }
        },
      });
      if (data?.toggleFollow) {
        // Sync local state with server truth
        setFollowing(data.toggleFollow.following);
        setFollowerCount(data.toggleFollow.followerCount);
        // Also reconcile Apollo cache with server truth
        const cacheId = client.cache.identify({
          __typename: "User",
          id: userId,
        });
        if (cacheId) {
          client.cache.modify({
            id: cacheId,
            fields: {
              isFollowedByMe: () => data.toggleFollow.following,
              followerCount: () => data.toggleFollow.followerCount,
            },
          });
        }
      }
    } catch {
      // Rollback
      locallyToggled.current = false;
      setFollowing(wasFollowing);
      setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
    } finally {
      setLoading(false);
      // After the server round-trip completes, allow future external prop
      // updates to sync again (e.g. next refetch brings correct data)
      locallyToggled.current = false;
    }
  }

  return { following, followerCount, toggle, loading, isAuthenticated };
}
