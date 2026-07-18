import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Landing-page TikTok saver.
 *
 * GET ?url=<tiktok link>              → JSON metadata (title, author, cover…)
 * GET ?url=<tiktok link>&download=1   → streams the clean (no-watermark) MP4
 *                                       with a Content-Disposition: attachment
 *                                       header so the browser saves it.
 *
 * Uses the same tikwm technique as the main import pipeline
 * (api repo: queues/workers/tiktok-download.worker.ts) but skips auth and Mux
 * re-hosting — this tool only hands the file to the visitor's device.
 * We never proxy arbitrary URLs: the stream source is always the URL tikwm
 * resolved for a validated tiktok.com link.
 */

const TIKWM_API = "https://www.tikwm.com/api/";

type TikwmData = {
  id?: string | number;
  title?: string;
  author?: { unique_id?: string; nickname?: string };
  cover?: string;
  origin_cover?: string;
  duration?: number;
  play?: string;
  hdplay?: string;
};

function isTiktokUrl(raw: string): boolean {
  try {
    const { hostname } = new URL(raw);
    return hostname === "tiktok.com" || hostname.endsWith(".tiktok.com");
  } catch {
    return false;
  }
}

/** tikwm sometimes returns relative media paths — normalise to absolute. */
function absoluteTikwmUrl(url: string): string {
  return url.startsWith("http") ? url : `https://www.tikwm.com${url}`;
}

async function fetchVideoInfo(url: string): Promise<TikwmData | null> {
  const res = await fetch(TIKWM_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ url, hd: "1" }),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const payload = (await res.json()) as {
    code?: number;
    data?: TikwmData;
  } | null;
  if (!payload || payload.code !== 0 || !payload.data?.play) return null;
  return payload.data;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url") ?? "";
  const wantsFile = request.nextUrl.searchParams.get("download") === "1";

  if (!isTiktokUrl(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  let data: TikwmData | null = null;
  try {
    data = await fetchVideoInfo(url);
  } catch {
    data = null;
  }
  if (!data) {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }

  if (!wantsFile) {
    return NextResponse.json({
      id: data.id != null ? String(data.id) : null,
      title: data.title ?? null,
      author: data.author?.nickname ?? data.author?.unique_id ?? null,
      authorUsername: data.author?.unique_id ?? null,
      cover: data.origin_cover || data.cover || null,
      duration: data.duration ?? null,
    });
  }

  // ── Stream the clean file through us so the download attribute works ──
  const fileUrl = absoluteTikwmUrl(data.hdplay || data.play!);

  let upstream: Response;
  try {
    upstream = await fetch(fileUrl, {
      signal: AbortSignal.timeout(120_000),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "download_failed" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "download_failed" }, { status: 502 });
  }

  const filename = `shopi-tiktok-${data.id ?? "video"}.mp4`;
  const headers = new Headers({
    "Content-Type": "video/mp4",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  });
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { headers });
}
