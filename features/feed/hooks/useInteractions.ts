"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import {
  ToggleLikeDocument,
  ViewContentDocument,
  ShareContentDocument,
} from "@/types/__generated__/graphql";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

interface Options {
  /** Call before like/comment — return false to abort (not authed). */
  requireAuth?: (intent?: { contentId?: string; action?: "like" | "comment" }) => boolean;
}

export function useInteractions(post: ContentCardFieldsFragment, options?: Options) {
  const [liked, setLiked] = useState(post.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.stats?.likes ?? 0);

  const [toggleLikeMutation] = useMutation(ToggleLikeDocument);
  const [viewMutation] = useMutation(ViewContentDocument);
  const [shareMutation] = useMutation(ShareContentDocument);

  // Fire viewContent once on mount (fire-and-forget)
  useEffect(() => {
    viewMutation({ variables: { contentId: post.id } }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  async function handleLike() {
    // Guard — redirect to auth if not logged in, saving scroll intent
    if (options?.requireAuth) {
      const authed = options.requireAuth({ contentId: post.id, action: "like" });
      if (!authed) return;
    }

    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    try {
      const { data } = await toggleLikeMutation({
        variables: { contentId: post.id },
      });
      if (data?.toggleLike) {
        // Sync with server truth
        setLiked(data.toggleLike.liked);
        setLikeCount(data.toggleLike.likeCount);
      }
    } catch {
      // Rollback on error
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    }
  }

  function handleShare() {
    shareMutation({ variables: { contentId: post.id } }).catch(() => {});
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: post.title, url: window.location.href })
        .catch(() => {});
    }
  }

  return { liked, likeCount, handleLike, handleShare };
}
