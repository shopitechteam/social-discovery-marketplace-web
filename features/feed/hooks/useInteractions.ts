"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { gql } from "@apollo/client";
import {
  ToggleLikeDocument,
  ViewContentDocument,
  ShareContentDocument,
} from "@/types/__generated__/graphql";
import type { ContentCardFieldsFragment } from "@/types/__generated__/graphql";

const TOGGLE_SAVE = gql`
  mutation ToggleSave($contentId: String!, $collectionId: String) {
    toggleSave(contentId: $contentId, collectionId: $collectionId) {
      saved
      saveCount
      collectionId
    }
  }
`;

interface Options {
  /** Call before like/comment/save — return false to abort (not authed). */
  requireAuth?: (intent?: { contentId?: string; action?: "like" | "comment" | "save" }) => boolean;
}

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

function writeSaveToCache(
  client: ReturnType<typeof useApolloClient>,
  contentId: string,
  saved: boolean,
  saveCount: number,
) {
  client.cache.modify({
    id: client.cache.identify({ __typename: "Content", id: contentId }),
    fields: {
      isSavedByMe: () => saved,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stats: (existing: any) => ({ ...existing, saves: saveCount }),
    },
  });
}

export function useInteractions(post: ContentCardFieldsFragment, options?: Options) {
  const [liked, setLiked] = useState(post.isLikedByMe ?? false);
  const [likeCount, setLikeCount] = useState(post.stats?.likes ?? 0);
  const [saved, setSaved] = useState(post.isSavedByMe ?? false);
  const [saveCount, setSaveCount] = useState(post.stats?.saves ?? 0);
  const client = useApolloClient();

  const [toggleLikeMutation] = useMutation(ToggleLikeDocument);
  const [viewMutation] = useMutation(ViewContentDocument);
  const [shareMutation] = useMutation(ShareContentDocument);
  const viewFired = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [toggleSaveMutation] = useMutation(TOGGLE_SAVE) as any;

  useEffect(() => {
    setLiked(post.isLikedByMe ?? false);
    setLikeCount(post.stats?.likes ?? 0);
    setSaved(post.isSavedByMe ?? false);
    setSaveCount(post.stats?.saves ?? 0);
  }, [post.isLikedByMe, post.stats?.likes, post.isSavedByMe, post.stats?.saves]);

  // Call this when the post scrolls into view — fires at most once per mount
  function fireView() {
    if (viewFired.current) return;
    viewFired.current = true;
    viewMutation({ variables: { contentId: post.id } }).catch(() => {});
  }

  async function handleLike() {
    if (options?.requireAuth) {
      if (!options.requireAuth({ contentId: post.id, action: "like" })) return;
    }

    const wasLiked = liked;
    const newLiked = !wasLiked;
    const newCount = likeCount + (wasLiked ? -1 : 1);

    setLiked(newLiked);
    setLikeCount(newCount);
    writeLikeToCache(client, post.id, newLiked, newCount);

    try {
      const { data } = await toggleLikeMutation({ variables: { contentId: post.id } });
      if (data?.toggleLike) {
        setLiked(data.toggleLike.liked);
        setLikeCount(data.toggleLike.likeCount);
        writeLikeToCache(client, post.id, data.toggleLike.liked, data.toggleLike.likeCount);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount(likeCount);
      writeLikeToCache(client, post.id, wasLiked, likeCount);
    }
  }

  async function handleSave(collectionId?: string) {
    if (options?.requireAuth) {
      if (!options.requireAuth({ contentId: post.id, action: "save" })) return;
    }

    const wasSaved = saved;
    const newSaved = !wasSaved;
    const newCount = saveCount + (wasSaved ? -1 : 1);

    setSaved(newSaved);
    setSaveCount(newCount);
    writeSaveToCache(client, post.id, newSaved, newCount);

    try {
      const { data } = await toggleSaveMutation({
        variables: { contentId: post.id, collectionId: collectionId ?? null },
      });
      if (data?.toggleSave) {
        setSaved(data.toggleSave.saved);
        setSaveCount(data.toggleSave.saveCount);
        writeSaveToCache(client, post.id, data.toggleSave.saved, data.toggleSave.saveCount);
      }
    } catch {
      setSaved(wasSaved);
      setSaveCount(saveCount);
      writeSaveToCache(client, post.id, wasSaved, saveCount);
    }
  }

  function handleShare() {
    shareMutation({ variables: { contentId: post.id } }).catch(() => {});
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post.title, url: window.location.href }).catch(() => {});
    }
  }

  function syncSaved(isSaved: boolean, count: number) {
    setSaved(isSaved);
    setSaveCount(count);
    writeSaveToCache(client, post.id, isSaved, count);
  }

  return { liked, likeCount, handleLike, saved, saveCount, handleSave, handleShare, fireView, syncSaved };
}
