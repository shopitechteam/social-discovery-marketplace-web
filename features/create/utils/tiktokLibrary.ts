import { captureVideoFrames } from "@/features/create/utils/captureVideoFrames";
import { canonicalTiktokUrl } from "@/features/create/utils/tiktokImport";
import type { TiktokMeta } from "@/features/create/utils/tiktokDownload";

/**
 * On-device library of videos the seller downloaded from TikTok, so reusing one
 * never needs the link or a second download. Records are tagged
 * `source: "tiktok"` and scoped to the signed-in user (a shared browser never
 * shows one account's videos to another).
 *
 * Metadata and the video bytes live in separate stores, so listing the library
 * never loads every video into memory. Every function degrades to an empty
 * result when IndexedDB is unavailable (private mode, blocked storage): the
 * import flow still works, it just can't remember anything.
 */

const DB_NAME = "shopi-tiktok-library";
const DB_VERSION = 1;
const META_STORE = "videos";
const FILE_STORE = "files";
const MAX_PER_USER = 10;
const THUMB_DELAY_MS = 1_500;
const THUMB_TIMEOUT_MS = 6_000;

export type SavedTiktok = TiktokMeta & {
  key: string;
  userId: string;
  source: "tiktok";
  originalUrl: string;
  savedAt: number;
  size: number;
  /** Small poster frame captured from the file itself (TikTok's cover URLs expire). */
  thumb: string | null;
};

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        const meta = db.createObjectStore(META_STORE, { keyPath: "key" });
        meta.createIndex("userId", "userId", { unique: false });
        db.createObjectStore(FILE_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function listSavedTiktoks(userId: string): Promise<SavedTiktok[]> {
  const db = await openDb();
  if (!db) return [];
  try {
    const rows = await requestResult(
      db
        .transaction(META_STORE, "readonly")
        .objectStore(META_STORE)
        .index("userId")
        .getAll(userId),
    );
    return (rows as SavedTiktok[])
      .filter((row) => row.source === "tiktok")
      .sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  } finally {
    db.close();
  }
}

/** The stored video as a File ready for the normal upload pipeline, or null if it's gone. */
export async function getSavedTiktokFile(
  video: SavedTiktok,
): Promise<File | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    const blob = await requestResult(
      db.transaction(FILE_STORE, "readonly").objectStore(FILE_STORE).get(video.key),
    );
    if (!(blob instanceof Blob) || blob.size === 0) return null;
    return new File([blob], `shopi-tiktok-${video.id ?? video.savedAt}.mp4`, {
      type: blob.type || "video/mp4",
      lastModified: video.savedAt,
    });
  } catch {
    return null;
  } finally {
    db.close();
  }
}

export async function removeSavedTiktok(key: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction([META_STORE, FILE_STORE], "readwrite");
    tx.objectStore(META_STORE).delete(key);
    tx.objectStore(FILE_STORE).delete(key);
    await transactionDone(tx);
  } catch {
    // Nothing useful to do - the row just stays.
  } finally {
    db.close();
  }
}

/**
 * Remember a downloaded video. Downloading the same TikTok again replaces its
 * record; only the newest few per user are kept. Resolves null when the browser
 * won't store it (quota, blocked storage) - callers can carry on regardless.
 */
export async function saveTiktok(input: {
  userId: string;
  originalUrl: string;
  meta: TiktokMeta;
  blob: Blob;
}): Promise<SavedTiktok | null> {
  const { userId, originalUrl, meta, blob } = input;
  const record: SavedTiktok = {
    ...meta,
    key: `${userId}:${meta.id ?? canonicalTiktokUrl(originalUrl)}`,
    userId,
    source: "tiktok",
    originalUrl,
    savedAt: Date.now(),
    size: blob.size,
    thumb: null,
  };

  const db = await openDb();
  if (!db) return null;
  try {
    const tx = db.transaction([META_STORE, FILE_STORE], "readwrite");
    tx.objectStore(META_STORE).put(record);
    tx.objectStore(FILE_STORE).put(blob, record.key);
    await transactionDone(tx);
  } catch {
    db.close();
    return null;
  }
  db.close();

  // Prune, then add the poster frame once the flow that just started has had a
  // moment to do its own frame capture.
  void pruneOldest(userId);
  setTimeout(() => void attachThumb(record.key, blob), THUMB_DELAY_MS);
  return record;
}

async function pruneOldest(userId: string): Promise<void> {
  const stale = (await listSavedTiktoks(userId)).slice(MAX_PER_USER);
  await Promise.all(stale.map((row) => removeSavedTiktok(row.key)));
}

async function attachThumb(key: string, blob: Blob): Promise<void> {
  const thumb = await captureThumb(blob);
  if (!thumb) return;
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(META_STORE, "readwrite");
    const store = tx.objectStore(META_STORE);
    const existing = (await requestResult(store.get(key))) as
      | SavedTiktok
      | undefined;
    // The record may have been removed (or pruned) in the meantime.
    if (existing) store.put({ ...existing, thumb });
    await transactionDone(tx);
  } catch {
    // Best effort - the row falls back to a placeholder.
  } finally {
    db.close();
  }
}

async function captureThumb(blob: Blob): Promise<string | null> {
  try {
    const file = new File([blob], "thumb.mp4", { type: "video/mp4" });
    const frames = await Promise.race([
      captureVideoFrames(file, { fractions: [0.1], maxDimension: 200 }),
      new Promise<Blob[]>((_, reject) =>
        setTimeout(() => reject(new Error("thumb_timeout")), THUMB_TIMEOUT_MS),
      ),
    ]);
    return frames[0] ? await blobToDataUrl(frames[0]) : null;
  } catch {
    return null;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
