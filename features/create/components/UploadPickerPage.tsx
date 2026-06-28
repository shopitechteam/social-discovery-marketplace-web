"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import { CreateDraftDocument } from "@/types/__generated__/graphql";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ICON_VIDEO = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect
      x="2"
      y="5"
      width="14"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M16 9.5l6-3v11l-6-3v-5Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const ICON_PHOTO = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path
      d="M3 15l5-5 4 4 3-3 6 6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
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
  const [creating, setCreating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const { setDraftId, setContentType, setStep, setError, draftId, step } =
    useCreateStore();
  const [createDraft] = useMutation(CreateDraftDocument);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // If a draft is already in progress, skip the picker and resume it
  useEffect(() => {
    if (draftId && step !== "pick") {
      router.replace(`/${lang}/upload/create`);
    }
  }, [draftId, step, lang, router]);

  // Pick a media type → create the draft and jump straight to the details step.
  // No native file picker here; the user chooses files on the details step via
  // its dotted media picker (cleaner UX, lets them keep adding/removing photos).
  async function handlePickType(kind: "image" | "video") {
    if (creating) return;
    setError(null);
    setCreating(true);
    try {
      const { data, error } = await createDraft({
        variables: { input: { type: kind === "video" ? "VIDEO" : "IMAGE" } },
      });
      if (error || !data?.createDraft)
        throw new Error(error?.message ?? "Failed to create draft");
      setDraftId(data.createDraft.id);
      setContentType(kind);
      setStep("edit");
      router.push(`/${lang}/upload/create`);
    } catch (err) {
      setError(String(err));
      setCreating(false);
    }
  }

  function closePicker() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(`/${lang}/feed`);
  }

  const options = [
    {
      label: "Video",
      description: "Share a short clip",
      icon: ICON_VIDEO,
      onClick: () => handlePickType("video"),
    },
    {
      label: "Photos",
      description: "Up to 10 images",
      icon: ICON_PHOTO,
      onClick: () => handlePickType("image"),
    },
    {
      label: "TikTok Import",
      description: "Bring your TikTok content",
      icon: ICON_TIKTOK,
      onClick: () => {
        router.replace(`/${lang}/upload/tiktok`);
      },
    },
  ];

  const optionCards = (
    <div className="flex flex-col gap-3 px-4 pt-6 pb-8 md:grid md:grid-cols-3 md:gap-4 md:px-8 md:pt-2 md:pb-2">
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={opt.onClick}
          disabled={creating}
          className="flex w-full items-center gap-4 rounded-2xl text-left transition-transform active:scale-[0.98] disabled:opacity-50 md:flex-col md:items-center md:gap-3 md:px-4 md:py-8 md:text-center"
          style={{
            padding: "18px 20px",
            backgroundColor: "rgb(var(--color-bg-elevated))",
            border: "1px solid rgb(var(--color-border))",
            color: "rgb(var(--color-text))",
          }}
        >
          <span
            className="md:flex md:h-14 md:w-14 md:items-center md:justify-center md:rounded-2xl"
            style={{
              color: "rgb(var(--brand-primary))",
              backgroundColor: "transparent",
            }}
          >
            <span
              className="hidden h-14 w-14 items-center justify-center rounded-2xl md:flex"
              style={{ backgroundColor: "rgb(var(--brand-primary) / 0.1)" }}
            >
              {opt.icon}
            </span>
            <span className="md:hidden">{opt.icon}</span>
          </span>

          <div className="flex flex-1 flex-col gap-0.5 md:flex-none md:items-center">
            <span
              className="font-semibold"
              style={{ fontSize: "var(--text-base)" }}
            >
              {opt.label}
            </span>
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              {opt.description}
            </span>
          </div>

          <svg
            className="ml-auto shrink-0 md:hidden"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: "rgb(var(--color-text-muted))" }}
          >
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) closePicker();
        }}
      >
        <DialogContent className="w-[min(92vw,820px)]  max-w-none overflow-hidden rounded-3xl border border-[rgb(229_231_235)] bg-app p-0">
          <DialogHeader className="border-b border-[rgb(229_231_235)] px-8 py-5 text-left">
            <DialogTitle
              style={{
                fontSize: "var(--text-xl)",
                color: "rgb(var(--color-text))",
              }}
            >
              Create
            </DialogTitle>
            <DialogDescription className="sr-only">
              Choose how you want to create a new post.
            </DialogDescription>
          </DialogHeader>
          {optionCards}
          <div className="mt-12" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="create-flow-card flex flex-col bg-app">
      <div
        className="flex shrink-0 items-center gap-3 px-4"
        style={{
          height: 56,
          borderBottom: "1px solid rgb(var(--color-border))",
        }}
      >
        <button
          onClick={closePicker}
          className="flex items-center justify-center rounded-full transition-opacity active:opacity-60"
          style={{ width: 36, height: 36, color: "rgb(var(--color-text))" }}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1
          className="font-semibold"
          style={{
            fontSize: "var(--text-lg)",
            color: "rgb(var(--color-text))",
          }}
        >
          Create
        </h1>
      </div>

      {optionCards}
    </div>
  );
}
