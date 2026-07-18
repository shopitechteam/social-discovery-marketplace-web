"use client";

import { useState } from "react";
import { Download, Link2, LoaderCircle } from "lucide-react";
import type { Dictionary } from "@/i18n/getDictionary";

type VideoInfo = {
  id: string | null;
  title: string | null;
  author: string | null;
  cover: string | null;
  duration: number | null;
};

/**
 * "By the way" TikTok saver — a small utility card, deliberately styled as a
 * side tool rather than a headline feature. Paste a TikTok link, get the
 * clean (no-watermark) file saved to your device via /api/tiktok-save.
 */
export function TiktokSaverSection({ dict }: { dict: Dictionary }) {
  const t = dict.landing.tiktokSaver;

  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || state === "loading") return;

    setState("loading");
    setInfo(null);
    try {
      const res = await fetch(
        `/api/tiktok-save?url=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) throw new Error("fetch_failed");
      setInfo((await res.json()) as VideoInfo);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setInfo(null);
    setUrl("");
    setSaving(false);
    setSaveFailed(false);
  }

  /** Fetch the file ourselves so we know when the download actually succeeded —
   *  only then clear the tool. A plain <a download> gives no completion signal. */
  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaveFailed(false);
    try {
      const res = await fetch(
        `/api/tiktok-save?url=${encodeURIComponent(url.trim())}&download=1`,
      );
      if (!res.ok) throw new Error("download_failed");
      const blob = await res.blob();

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `shopi-tiktok-${info?.id ?? "video"}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      reset();
    } catch {
      setSaving(false);
      setSaveFailed(true);
    }
  }

  return (
    <section
      id="tiktok-saver"
      className="px-(--landing-page-x) py-10 md:py-14"
    >
      <div className="mx-auto max-w-(--landing-page-max)">
        <div className="rounded-[1.1rem] border border-dashed border-border bg-surface p-6 md:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_minmax(0,26rem)] md:gap-10">
            {/* Copy */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">
                {t.eyebrow}
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.2rem,2vw,1.6rem)] font-bold leading-tight text-default">
                {t.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-normal text-muted">
                {t.body}
              </p>
              <p className="mt-3 text-xs text-muted">{t.disclaimer}</p>
            </div>

            {/* Tool */}
            <div>
              {state !== "ready" ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 rounded-[1.5rem] border border-border bg-elevated p-2 sm:flex-row sm:items-center sm:rounded-full sm:py-1.5 sm:pr-1.5 sm:pl-4">
                    <Link2 size={16} className="shrink-0 text-muted" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={t.placeholder}
                      aria-label={t.placeholder}
                      className="min-w-0 flex-1 bg-transparent px-1 text-sm text-default outline-none placeholder:text-placeholder sm:px-0"
                    />
                    <button
                      type="submit"
                      disabled={state === "loading" || !url.trim()}
                      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold whitespace-nowrap text-background disabled:cursor-default disabled:opacity-50 sm:w-auto sm:shrink-0"
                    >
                      {state === "loading" ? (
                        <>
                          <LoaderCircle size={15} className="animate-spin" />
                          {t.fetching}
                        </>
                      ) : (
                        t.button
                      )}
                    </button>
                  </div>
                  {state === "error" && (
                    <p className="px-2 text-xs font-medium text-error">
                      {t.error}
                    </p>
                  )}
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-elevated p-3 sm:flex-row sm:items-center">
                    {info?.cover ? (
                      // Plain <img>: TikTok CDN covers aren't in the next/image
                      // remote-pattern allowlist, and this is a transient preview.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={info.cover}
                        alt=""
                        className="h-16 w-12 shrink-0 rounded-lg object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-default">
                        {info?.title || "TikTok video"}
                      </p>
                      {info?.author ? (
                        <p className="truncate text-xs text-muted">
                          @{info.author}
                        </p>
                      ) : null}
                      <button
                        onClick={reset}
                        className="mt-1 cursor-pointer text-xs font-medium text-muted underline underline-offset-2 hover:text-default"
                      >
                        {t.tryAnother}
                      </button>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold whitespace-nowrap text-white disabled:cursor-default disabled:opacity-70 sm:w-auto sm:shrink-0"
                    >
                      {saving ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <Download size={15} />
                      )}
                      {saving ? t.fetching : t.save}
                    </button>
                  </div>
                {saveFailed && (
                  <p className="px-2 text-xs font-medium text-error">
                    {t.error}
                  </p>
                )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
