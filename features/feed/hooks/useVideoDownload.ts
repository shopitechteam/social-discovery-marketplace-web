"use client";

import { useCallback, useRef, useState } from "react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

/**
 * Downloading a post's video as a real file.
 *
 * The player streams HLS, and `stream.mux.com/{playbackId}.m3u8` is a manifest
 * — pointing a download at it saves a few hundred bytes of playlist text that
 * no phone gallery will open. The API resolves the post to a Mux static
 * rendition instead, which is an actual MP4.
 *
 * That rendition is encoded on demand for older uploads, so the query can come
 * back PREPARING. This hook polls through that and only then saves, which is
 * why the button needs a pending state rather than firing and forgetting.
 */

const VIDEO_DOWNLOAD = gql`
  query VideoDownload($contentId: String!) {
    videoDownload(contentId: $contentId) {
      status
      url
      filename
      reason
    }
  }
`;

type VideoDownloadResult = {
  status: "READY" | "PREPARING" | "UNAVAILABLE";
  url?: string | null;
  filename?: string | null;
  reason?: string | null;
};

/** Mux usually finishes a rendition well inside this; past it, stop waiting. */
const MAX_WAIT_MS = 90_000;
const POLL_INTERVAL_MS = 3_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Hand a URL to the browser as a save, with a filename. */
async function saveToDisk(url: string, filename: string): Promise<void> {
  const anchor = document.createElement("a");

  try {
    // Fetch to a blob so the browser honours our filename. A cross-origin
    // anchor download keeps Mux's own name and, on some browsers, opens the
    // video in a tab instead of saving it.
    const res = await fetch(url);
    if (!res.ok) throw new Error(`download_failed_${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // CORS or a network blip — fall back to a direct link. The file still
    // downloads; only the suggested filename may be lost.
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
}

export type VideoDownloadState = {
  /** True from the click until the file is saved or the attempt gives up. */
  isDownloading: boolean;
  /** True while waiting on Mux, so the button can say "Preparing…". */
  isPreparing: boolean;
  /** Set when the download can't happen; safe to show the viewer. */
  error: string | null;
  download: () => Promise<void>;
  clearError: () => void;
};

export function useVideoDownload(contentId: string): VideoDownloadState {
  const client = useApolloClient();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const download = useCallback(async () => {
    if (inFlight.current || typeof document === "undefined") return;
    inFlight.current = true;
    setIsDownloading(true);
    setError(null);

    const deadline = Date.now() + MAX_WAIT_MS;

    try {
      for (;;) {
        const { data } = await client.query({
          query: VIDEO_DOWNLOAD,
          variables: { contentId },
          // Always ask: a PREPARING answer goes stale the moment Mux finishes.
          fetchPolicy: "network-only",
        });

        const result = (data as { videoDownload?: VideoDownloadResult } | undefined)
          ?.videoDownload;

        if (result?.status === "READY" && result.url) {
          await saveToDisk(result.url, result.filename || "shopi-video.mp4");
          return;
        }

        if (result?.status === "UNAVAILABLE") {
          setError(result.reason || "This video isn't available to download.");
          return;
        }

        if (Date.now() >= deadline) {
          setError("This video is still being prepared. Try again in a minute.");
          return;
        }

        setIsPreparing(true);
        await sleep(POLL_INTERVAL_MS);
      }
    } catch {
      setError("Couldn't download that video. Check your connection and try again.");
    } finally {
      inFlight.current = false;
      setIsDownloading(false);
      setIsPreparing(false);
    }
  }, [client, contentId]);

  const clearError = useCallback(() => setError(null), []);

  return { isDownloading, isPreparing, error, download, clearError };
}
