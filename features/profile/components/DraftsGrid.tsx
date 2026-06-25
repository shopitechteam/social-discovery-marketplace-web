"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "sonner";
import { FileEdit, Plus, Send, Trash2, Play } from "lucide-react";
import {
  MyDraftsDocument,
  PublishDraftDocument,
  DiscardDraftDocument,
  type DraftFieldsFragment,
} from "@/types/__generated__/graphql";
import { useCreateStore } from "@/stores/create";

interface Props {
  lang: string;
}

function mapType(type?: string | null): "image" | "video" | null {
  if (type === "IMAGE") return "image";
  if (type === "VIDEO") return "video";
  return null;
}

function formatDate(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DraftsGrid({ lang }: Props) {
  const router = useRouter();
  const { setDraftId, setContentType, setStep } = useCreateStore();

  const { data, loading, refetch } = useQuery(MyDraftsDocument, {
    variables: { limit: 30 },
    fetchPolicy: "cache-and-network",
  });
  const [publishDraft] = useMutation(PublishDraftDocument);
  const [discardDraft] = useMutation(DiscardDraftDocument);

  const [busyId, setBusyId] = useState<string | null>(null);

  const drafts = (data?.myDrafts ?? []) as DraftFieldsFragment[];

  function continueEditing(draft: DraftFieldsFragment) {
    setDraftId(draft.id);
    setContentType(mapType(draft.type));
    setStep("edit");
    router.push(`/${lang}/upload/create`);
  }

  async function handlePublish(draft: DraftFieldsFragment) {
    if (busyId) return;
    setBusyId(draft.id);
    try {
      const { data: res, error } = await publishDraft({
        variables: { id: draft.id },
      });
      if (error || !res?.publishDraft) {
        throw new Error(error?.message ?? "Could not publish");
      }
      toast.success("Posted! Your content is live.");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDiscard(draft: DraftFieldsFragment) {
    if (busyId) return;
    if (!window.confirm("Discard this draft? This cannot be undone.")) return;
    setBusyId(draft.id);
    try {
      await discardDraft({ variables: { id: draft.id } });
      toast.success("Draft discarded");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not discard");
    } finally {
      setBusyId(null);
    }
  }

  // ── Loading skeleton (2-grid, matches Posts/TikTok) ──────────────────────────
  if (loading && drafts.length === 0) {
    return (
      <section className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4 xl:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-9/10 rounded-xl"
              style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            />
          ))}
        </div>
      </section>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!loading && drafts.length === 0) {
    return (
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border"
            style={{
              backgroundColor: "rgb(var(--color-bg-elevated))",
              borderColor: "rgb(var(--color-border))",
              color: "rgb(var(--brand-primary))",
            }}
          >
            <FileEdit size={26} strokeWidth={2} />
          </div>
          <h2
            className="font-bold"
            style={{
              fontSize: "var(--text-lg)",
              color: "rgb(var(--color-text))",
            }}
          >
            No drafts yet
          </h2>
          <p
            className="mt-2 max-w-sm leading-snug"
            style={{
              fontSize: "var(--text-base)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            When you save a post as a draft, it shows up here so you can finish
            and publish it later.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/${lang}/upload`)}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-semibold text-white active:opacity-80"
            style={{
              fontSize: "var(--text-sm)",
              background:
                "linear-gradient(135deg, rgb(var(--brand-primary)), rgb(var(--brand-secondary)))",
            }}
          >
            <Plus size={16} strokeWidth={2.4} /> New post
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header — same heading/description pattern + sizes as the Storefront
            (Posts) tab for consistency across subtabs. */}
        <div className="mb-4">
          <h2
            className="font-bold leading-tight"
            style={{
              fontSize: "var(--text-base)",
              color: "rgb(var(--color-text))",
            }}
          >
            Drafts
          </h2>
          <p
            className="mt-1"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {drafts.length} {drafts.length === 1 ? "draft" : "drafts"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 xl:grid-cols-4 xl:gap-4">
          {drafts.map((draft) => {
          const busy = busyId === draft.id;
          const isVideo = mapType(draft.type) === "video";
          return (
            <div
              key={draft.id}
              className="flex flex-col overflow-hidden rounded-xl border"
              style={{
                backgroundColor: "rgb(var(--color-bg-elevated))",
                borderColor: "rgb(var(--color-border))",
              }}
            >
              {/* Thumbnail — tap to continue editing */}
              <button
                type="button"
                onClick={() => continueEditing(draft)}
                className="relative block aspect-9/10 w-full overflow-hidden bg-black/5"
                aria-label="Continue editing draft"
              >
                {draft.coverThumbnailUrl ? (
                  <Image
                    src={draft.coverThumbnailUrl}
                    alt={draft.title ?? "Draft"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 22vw"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ color: "rgb(var(--color-text-muted))" }}
                  >
                    <FileEdit size={28} />
                  </div>
                )}

                {isVideo && draft.coverThumbnailUrl && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white">
                      <Play size={15} fill="currentColor" />
                    </span>
                  </span>
                )}

                {/* Draft badge */}
                <span
                  className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-semibold text-white"
                  style={{
                    fontSize: "11px",
                    backgroundColor: "rgb(0 0 0 / 0.6)",
                  }}
                >
                  Draft
                </span>
              </button>

              {/* Meta — title / date (matches TikTok & Posts cards) */}
              <div className="px-2.5 pt-2.5">
                <p
                  className="line-clamp-2 leading-tight"
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "rgb(var(--color-text))",
                    fontWeight: 500,
                  }}
                >
                  {draft.title?.trim() || "Untitled draft"}
                </p>
                <p
                  className="mt-1"
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "rgb(var(--color-text-muted))",
                  }}
                >
                  {formatDate(draft.updatedAt ?? draft.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-2 flex items-center gap-2 px-2.5 pb-3">
                <button
                  type="button"
                  onClick={() => handlePublish(draft)}
                  disabled={busy}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg font-semibold text-white disabled:opacity-60"
                  style={{
                    fontSize: "var(--text-sm)",
                    backgroundColor: "rgb(var(--brand-primary))",
                  }}
                >
                  <Send size={14} /> {busy ? "Posting…" : "Post"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDiscard(draft)}
                  disabled={busy}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg disabled:opacity-60"
                  style={{
                    color: "rgb(var(--color-error))",
                    backgroundColor: "rgb(var(--color-error) / 0.1)",
                  }}
                  aria-label="Discard draft"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
