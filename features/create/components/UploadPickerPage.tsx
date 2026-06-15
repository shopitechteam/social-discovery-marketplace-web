"use client";

import { useRef, useEffect } from "react";
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

  const { setDraftId, setContentType, setStep, setError, draftId, step } = useCreateStore();
  const [createDraft] = useMutation(CreateDraftDocument);
  const { startImageUpload, startVideoUpload } = useMediaUpload();

  // If a draft is already in progress, skip the picker and resume it
  useEffect(() => {
    if (draftId && step !== "pick") {
      router.replace(`/${lang}/upload/create`);
    }
  }, [draftId, step, lang, router]);

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
      // Start uploads in background — they run while user is on the media review step
      const list = Array.from(files).slice(0, kind === "video" ? 1 : 10);
      list.forEach((file, i) => {
        if (kind === "image") startImageUpload(file, did, i);
        else startVideoUpload(file, did);
      });
      // Skip media review — go straight to edit details (TikTok style)
      // Media thumbnail in StepEdit shows upload progress while user fills in details
      setStep("edit");
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
      onClick: () => { window.location.href = `/${lang}/upload/tiktok`; },
    },
  ];

  return (
    /*
     * Mobile  (< md): full-height page, 430 px wide, stacked cards.
     * Desktop (≥ md): fixed backdrop + centred dialog, options laid out
     *                 horizontally in a 3-column grid.
     */
    <div className="md:fixed md:inset-0 md:z-50 md:flex md:items-center md:justify-center md:bg-black/50 md:backdrop-blur-sm">
      <div
        className="create-flow-card flex flex-col bg-app md:rounded-2xl md:shadow-2xl md:overflow-hidden md:max-w-2xl md:min-h-0"
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
          <h1 className="font-semibold" style={{ fontSize: "var(--text-lg)", color: "rgb(var(--color-text))" }}>
            Create
          </h1>
        </div>

        {/* Picker options
            Mobile : vertical stack (flex-col gap-3)
            Desktop: horizontal 3-col grid                */}
        <div className="flex flex-col gap-3 px-4 pt-6 pb-8 md:grid md:grid-cols-3 md:gap-4 md:px-8 md:pt-8 md:pb-10">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              className="flex items-center gap-4 w-full rounded-2xl active:scale-[0.98] transition-transform text-left
                         md:flex-col md:items-center md:text-center md:gap-3 md:py-8 md:px-4"
              style={{
                padding: "18px 20px",
                backgroundColor: "rgb(var(--color-bg-elevated))",
                border: "1px solid rgb(var(--color-border))",
                color: "rgb(var(--color-text))",
              }}
            >
              <span
                className="md:flex md:items-center md:justify-center md:rounded-2xl md:w-14 md:h-14"
                style={{
                  color: "rgb(var(--brand-primary))",
                  backgroundColor: "transparent",
                }}
              >
                {/* On desktop: icon inside a tinted circle */}
                <span
                  className="hidden md:flex items-center justify-center rounded-2xl w-14 h-14"
                  style={{ backgroundColor: "rgb(var(--brand-primary) / 0.1)" }}
                >
                  {opt.icon}
                </span>
                {/* On mobile: raw icon */}
                <span className="md:hidden">{opt.icon}</span>
              </span>

              <div className="flex flex-col gap-0.5 flex-1 md:flex-none md:items-center">
                <span className="font-semibold" style={{ fontSize: "var(--text-base)" }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: "var(--text-sm)", color: "rgb(var(--color-text-muted))" }}>
                  {opt.description}
                </span>
              </div>

              {/* Chevron — mobile only */}
              <svg
                className="ml-auto shrink-0 md:hidden"
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
