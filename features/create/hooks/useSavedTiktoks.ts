"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listSavedTiktoks,
  removeSavedTiktok,
  type SavedTiktok,
} from "@/features/create/utils/tiktokLibrary";

/** The signed-in seller's on-device TikTok downloads, newest first. */
export function useSavedTiktoks(userId: string | null) {
  const [state, setState] = useState<{
    userId: string | null;
    videos: SavedTiktok[];
  } | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const videos = await listSavedTiktoks(userId);
    setState({ userId, videos });
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    if (userId) {
      void listSavedTiktoks(userId).then((videos) => {
        if (!cancelled) setState({ userId, videos });
      });
    }
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const remove = useCallback(async (key: string) => {
    setState((current) =>
      current
        ? { ...current, videos: current.videos.filter((v) => v.key !== key) }
        : current,
    );
    await removeSavedTiktok(key);
  }, []);

  const loaded = state !== null && state.userId === userId;
  return {
    videos: loaded ? state.videos : [],
    loading: userId !== null && !loaded,
    refresh,
    remove,
  };
}
