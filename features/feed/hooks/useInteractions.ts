"use client";

import { useState, useEffect } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
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

/** Write like state back into the Apollo cache so every component reading
 *  the same Content object (feed cards, detail page, trending strip) updates
 *  immediately without a refetch. */
function writeLikeToCache(
  client: ReturnType<typeof useApolloClient>,
  contentId: string,
  liked: boolean,
  likeCount: number,
) {
  client.cache.modify({
    id: client.cache.identify({ __typename: "Content", id: contentId }),
    fields: {
      isLikedByMe: () => liked,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stats: (existing: any) => ({ ...existing, likes: likeCount }),
    },
  });
}

export function useInteractions(post: ContentCardFieldsFragment, options?: Options) {
  // Local state is the optimistic layer; the cache is the source of truth
  const [liked, setLiked] = useState(post.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.stats?.likes ?? 0);
  const client = useApolloClient();

  const [toggleLikeMutation] = useMutation(ToggleLikeDocument);
  const [viewMutation] = useMutation(ViewContentDocument);
  const [shareMutation] = useMutation(ShareContentDocument);

  // Keep local state in sync if the cache updates from another component
  // (e.g. user likes in detail page, comes back to feed)
  useEffect(() => {
    setLiked(post.isLikedByMe ?? false);
    setLikeCount(post.stats?.likes ?? 0);
  }, [post.isLikedByMe, post.stats?.likes]);

  // Fire viewContent once on mount (fire-and-forget)
  useEffect(() => {
    viewMutation({ variables: { contentId: post.id } }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  async function handleLike() {
    if (options?.requireAuth) {
      const authed = options.requireAuth({ contentId: post.id, action: "like" });
      if (!authed) return;
    }

    const wasLiked = liked;
    const newLiked = !wasLiked;
    const newCount = likeCount + (wasLiked ? -1 : 1);

    // Optimistic update — local state + cache
    setLiked(newLiked);
    setLikeCount(newCount);
    writeLikeToCache(client, post.id, newLiked, newCount);

    try {
      const { data } = await toggleLikeMutation({ variables: { contentId: post.id } });
      if (data?.toggleLike) {
        // Sync with server truth
        setLiked(data.toggleLike.liked);
        setLikeCount(data.toggleLike.likeCount);
        writeLikeToCache(client, post.id, data.toggleLike.liked, data.toggleLike.likeCount);
      }
    } catch {
      // Rollback
      setLiked(wasLiked);
      setLikeCount(likeCount);
      writeLikeToCache(client, post.id, wasLiked, likeCount);
    }
  }

  function handleShare() {
    shareMutation({ variables: { contentId: post.id } }).catch(() => {});
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post.title, url: window.location.href }).catch(() => {});
    }
  }

  return { liked, likeCount, handleLike, handleShare };
}
