"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { Bot, ChevronRight, PenLine } from "lucide-react";
import { useCreateStore } from "@/stores/create";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { CreateDraftDocument } from "@/types/__generated__/graphql";
import { DesktopCreateFlow } from "./DesktopCreateFlow";
import { TikTokPicker } from "./TikTokPicker";
import { CreateErrorDialog, createErrorMessage } from "./CreateErrorDialog";
import { SHOW_TIKTOK_CREATE_OPTIONS } from "@/features/create/utils/tiktokAvailability";
import { getSuspendedAccountMessage } from "@/lib/apollo/suspended-account";

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

/**
 * /upload — the "Upload & sell" entry point.
 *
 * Desktop (≥ md): the whole create flow lives here in a shadcn Dialog with a
 * stepper and a live post preview (DesktopCreateFlow); no route hops.
 *
 * Mobile: this page is the type picker; picking a type creates the draft and
 * navigates to /upload/create (full-page flow).
 */
export function UploadPickerPage({ lang }: { lang: string }) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [storeHydrated, setStoreHydrated] = useState(false);
  const [manualSelected, setManualSelected] = useState(false);
  const [creating, setCreating] = useState(false);
  // TikTok import renders in place on this page (same surface as the other
  // types — no route hop), then continues to /upload/create like they do.
  const [view, setView] = useState<"pick" | "tiktok">("pick");
  // Draft-creation failures (e.g. "Maximum active drafts reached") shown in a
  // dialog, same as the desktop create flow — for all three entry points
  // (Video, Photos, TikTok import).
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    creationMode,
    setCreationMode,
    setDraftId,
    setContentType,
    setStep,
    setError,
    draftId,
    step,
  } = useCreateStore();
  const [createDraft] = useMutation(CreateDraftDocument);

  useEffect(() => {
    if (useCreateStore.persist.hasHydrated()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot external-store hydration latch
      setStoreHydrated(true);
      return;
    }
    return useCreateStore.persist.onFinishHydration(() =>
      setStoreHydrated(true),
    );
  }, []);

  const hasActiveDraft = !!draftId && step !== "pick";
  const showingManual =
    manualSelected ||
    creationMode === "manual" ||
    (hasActiveDraft && creationMode !== "ai" && creationMode !== "choose");

  // A guided draft resumes in its dedicated route. A legacy persisted draft
  // has no creationMode, so it safely resumes in the established manual flow.
  useEffect(() => {
    if (storeHydrated && hasActiveDraft && creationMode === "ai") {
      router.replace(`/${lang}/upload/create-ai`);
    }
  }, [creationMode, hasActiveDraft, lang, router, storeHydrated]);

  // Mobile only: if a draft is already in progress, skip the picker and resume
  // it on the full-page flow. Desktop resumes inside the dialog instead.
  // Paused while the TikTok picker is up — its "Use This Video" handler
  // navigates explicitly once the draft is ready.
  useEffect(() => {
    if (
      showingManual &&
      isDesktop === false &&
      view === "pick" &&
      draftId &&
      step !== "pick"
    ) {
      router.replace(`/${lang}/upload/create`);
    }
  }, [isDesktop, view, draftId, step, lang, router, showingManual]);

  // Avoid a layout flash before the breakpoint is known.
  if (isDesktop === null || !storeHydrated) return null;

  if (hasActiveDraft && creationMode === "ai") return null;

  if (!showingManual) {
    return (
      <CreationModeChooser
        lang={lang}
        onManual={() => {
          setCreationMode("manual");
          setManualSelected(true);
        }}
        onAgent={() => {
          setCreationMode("ai");
          router.push(`/${lang}/upload/create-ai`);
        }}
      />
    );
  }

  if (isDesktop) return <DesktopCreateFlow lang={lang} />;

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
      if (getSuspendedAccountMessage(err)) {
        setCreating(false);
        return;
      }
      setCreateError(createErrorMessage(err));
      setCreating(false);
    }
  }

  function closePicker() {
    if (!draftId) setCreationMode(null);
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
      // In place on this page, like the other types — no route hop.
      onClick: () => setView("tiktok"),
      hidden: !SHOW_TIKTOK_CREATE_OPTIONS,
    },
  ];

  if (view === "tiktok") {
    return (
      <div className="fixed inset-0 z-60 flex flex-col overflow-hidden bg-app">
        <CreateErrorDialog
          message={createError}
          onClose={() => setCreateError(null)}
        />
        <div
          className="flex shrink-0 items-center gap-3 px-4 pt-4 pb-4"
          style={{ borderBottom: "1px solid rgb(var(--color-border))" }}
        >
          <button
            onClick={() => setView("pick")}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }}
            aria-label="Back"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1
            className="font-semibold"
            style={{
              fontSize: "var(--text-xl)",
              color: "rgb(var(--color-text))",
            }}
          >
            Add from TikTok
          </h1>
        </div>
        <TikTokPicker
          lang={lang}
          onUsed={() => router.push(`/${lang}/upload/create`)}
          onError={(message) => setCreateError(message)}
        />
      </div>
    );
  }

  return (
    <div className="create-flow-card flex flex-col bg-app">
      <CreateErrorDialog
        message={createError}
        onClose={() => setCreateError(null)}
      />
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

      <div className="flex flex-col gap-3 px-4 pt-6 pb-8">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={opt.onClick}
            disabled={creating}
            className={`${opt.hidden ? "hidden" : "flex"} w-full items-center gap-4 rounded-2xl text-left transition-transform active:scale-[0.98] disabled:opacity-50`}
            style={{
              padding: "18px 20px",
              backgroundColor: "rgb(var(--color-bg-elevated))",
              border: "1px solid rgb(var(--color-border))",
              color: "rgb(var(--color-text))",
            }}
          >
            <span style={{ color: "rgb(var(--brand-primary))" }}>
              {opt.icon}
            </span>

            <div className="flex flex-1 flex-col gap-0.5">
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
              className="ml-auto shrink-0"
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
    </div>
  );
}

function CreationModeChooser({
  lang,
  onManual,
  onAgent,
}: {
  lang: string;
  onManual: () => void;
  onAgent: () => void;
}) {
  const router = useRouter();

  function close() {
    router.replace(`/${lang}/feed`);
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-elevated">
        <div className="mx-auto flex h-15 w-full max-w-2xl items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close create"
          >
            <span aria-hidden className="text-2xl font-light leading-none">
              ×
            </span>
          </button>
          <h1 className="text-base font-semibold text-foreground">
            Create a post
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 py-8 md:px-6 md:py-14">
        <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          How would you like to create it?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          You can switch to the familiar editor at any time.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-elevated">
          <button
            type="button"
            onClick={onAgent}
            className="group flex min-h-24 w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface active:bg-primary-soft/50 md:px-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Bot size={23} />
            </span>

            <span className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="block text-base font-semibold text-foreground">
                  Shopi Agent
                </span>
                <span className=" rounded-full  bg-primary/80 h-6 flex items-center justify-center text-white px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                  <p className="-mt-0.5"> recommended</p>
                </span>
              </div>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                Recommended for a faster post. Shopi Agent prepares the details
                with you.
              </span>
            </span>
            <ChevronRight
              size={20}
              className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
            />
          </button>

          <div className="mx-4 h-px bg-border md:mx-5" />

          <button
            type="button"
            onClick={onManual}
            className="group flex min-h-24 w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface active:bg-surface md:px-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-foreground">
              <PenLine size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-foreground">
                Create manually
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">
                Use the current form and enter the listing yourself.
              </span>
            </span>
            <ChevronRight
              size={20}
              className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>

        <p className="mt-4 px-1 text-xs leading-relaxed text-muted">
          Nothing is posted until you review and confirm it.
        </p>
      </main>
    </div>
  );
}
