export type TiktokMeta = {
  id: string | null;
  title: string | null;
  author: string | null;
  authorUsername: string | null;
  cover: string | null;
  duration: number | null;
};

export class TiktokDownloadError extends Error {}

const RETRY_DELAY_MS = 1_500;

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

const EMPTY_META: TiktokMeta = {
  id: null,
  title: null,
  author: null,
  authorUsername: null,
  cover: null,
  duration: null,
};

function parseMeta(header: string | null): TiktokMeta {
  if (!header) return EMPTY_META;
  try {
    return { ...EMPTY_META, ...JSON.parse(decodeURIComponent(header)) };
  } catch {
    return EMPTY_META;
  }
}

/**
 * Download a TikTok video through /api/tiktok-save - the same endpoint the
 * /tiktok-downloader page uses - and read its metadata from the response
 * headers, so a single lookup yields both the file and its details.
 *
 * `onProgress` receives 0..1 while the size is known, or `null` when the server
 * didn't send a length (indeterminate).
 */
export async function downloadTiktokVideo(
  url: string,
  options: {
    signal?: AbortSignal;
    onProgress?: (fraction: number | null) => void;
  } = {},
): Promise<{ blob: Blob; meta: TiktokMeta }> {
  const { signal, onProgress } = options;
  const endpoint = `/api/tiktok-save?url=${encodeURIComponent(url)}&download=1`;

  let res = await fetch(endpoint, { signal });
  if (res.status === 502) {
    // The lookup service allows about one request a second; a quick second tap
    // or a retry right after another lookup can trip it. Try once more.
    await delay(RETRY_DELAY_MS, signal);
    res = await fetch(endpoint, { signal });
  }
  if (!res.ok) throw new TiktokDownloadError(`download_failed_${res.status}`);

  const meta = parseMeta(res.headers.get("X-Tiktok-Meta"));
  const total = Number(res.headers.get("Content-Length")) || 0;

  let blob: Blob;
  if (res.body && total > 0) {
    const reader = res.body.getReader();
    const chunks: BlobPart[] = [];
    let received = 0;
    let lastPercent = -1;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value as BlobPart);
      received += value.byteLength;
      const percent = Math.min(100, Math.floor((received / total) * 100));
      if (percent !== lastPercent) {
        lastPercent = percent;
        onProgress?.(percent / 100);
      }
    }
    blob = new Blob(chunks, { type: "video/mp4" });
  } else {
    onProgress?.(null);
    blob = await res.blob();
  }

  if (blob.size === 0) throw new TiktokDownloadError("empty_download");
  return { blob, meta };
}
