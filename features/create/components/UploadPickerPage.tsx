"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import { useMediaUpload } from "@/features/create/hooks/useMediaUpload";
import { CreateDraftDocument } from "@/types/__generated__/graphql";

const ICON_VIDEO = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M16 9.5l6-3v11l-6-3v-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

const ICON_PHOTO = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const ICON_TIKTOK = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function UploadPickerPage({ lang }: { lang: string }) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { setDraftId, setContentType, setStep, setError, draftId } = useCreateStore();
  const [createDraft] = useMutation(CreateDraftDocument);
  const { startImageUpload, startVideoUpload } = useMediaUpload();

  async function ensureDraft(type: "image" | "video"): Promise<string> {
    if (draftId) return draftId;
    const { data, error } = await createDraft({
      variables: { input: { type: type === "video" ? "VIDEO" : "IMAGE" } },
    });
    if (error || !data?.createDraft)
      throw new Error(error?.message ?? "Failed to create draft");
    const id = data.createDraft.id;
    setDraftId(id);
    return id;
  }

  async function handleFiles(files: FileList, kind: "image" | "video") {
    if (!files.length) return;
    setError(null);
    try {
      const did = await ensureDraft(kind);
      setContentType(kind);
      setStep("edit");
      const list = Array.from(files).slice(0, kind === "video" ? 1 : 10);
      for (const file of list) {
        if (kind === "image") startImageUpload(file, did);
        else startVideoUpload(file, did);
      }
      router.push(`/${lang}/upload/create`);
    } catch (err) {
      setError(String(err));
    }
  }

  const options = [
    {
      label: "Video",
      description: "Share a short clip",
      icon: ICON_VIDEO,
      onClick: () => videoInputRef.current?.click(),
    },
    {
      label: "Photos",
      description: "Up to 10 images",
      icon: ICON_PHOTO,
      onClick: () => imageInputRef.current?.click(),
    },
    {
      label: "TikTok Import",
      description: "Bring your TikTok content",
      icon: ICON_TIKTOK,
      onClick: () => {
        window.location.href = `/${lang}/upload/tiktok`;
      },
    },
  ];

  return (
    <div
      className="flex flex-col min-h-svh bg-app"
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{ height: 56, borderBottom: "1px solid rgb(var(--color-border))" }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
          style={{ width: 36, height: 36, color: "rgb(var(--color-text))" }}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1
          className="font-semibold"
          style={{ fontSize: "var(--text-lg)", color: "rgb(var(--color-text))" }}
        >
          Create
        </h1>
      </div>

      {/* Picker options */}
      <div className="flex flex-col gap-3 px-4 pt-6">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={opt.onClick}
            className="flex items-center gap-4 w-full rounded-2xl active:scale-[0.98] transition-transform text-left"
            style={{
              padding: "18px 20px",
              backgroundColor: "rgb(var(--color-bg-elevated))",
              border: "1px solid rgb(var(--color-border))",
              color: "rgb(var(--color-text))",
            }}
          >
            <span style={{ color: "rgb(var(--brand-primary))" }}>{opt.icon}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold" style={{ fontSize: "var(--text-base)" }}>
                {opt.label}
              </span>
              <span style={{ fontSize: "var(--text-sm)", color: "rgb(var(--color-text-muted))" }}>
                {opt.description}
              </span>
            </div>
            <svg
              className="ml-auto shrink-0"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: "rgb(var(--color-text-muted))" }}
            >
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files, "video")}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files, "image")}
      />
    </div>
  );
}
