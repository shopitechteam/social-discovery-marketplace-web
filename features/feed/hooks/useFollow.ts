"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
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

  const [toggleFollowMutation] = useMutation(ToggleFollowDocument);

  async function toggle() {
    // Guard — redirect to auth if guest
    if (!requireAuth()) return;

    const wasFollowing = following;
    // Optimistic update
    setFollowing(!wasFollowing);
    setFollowerCount((c) => c + (wasFollowing ? -1 : 1));
    setLoading(true);

    try {
      const { data } = await toggleFollowMutation({ variables: { userId } });
      if (data?.toggleFollow) {
        // Sync with server truth
        setFollowing(data.toggleFollow.following);
        setFollowerCount(data.toggleFollow.followerCount);
      }
    } catch {
      // Rollback
      setFollowing(wasFollowing);
      setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }

  return { following, followerCount, toggle, loading, isAuthenticated };
}
