"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronRight,
  Images,
  Music2,
  PenLine,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { useCreateStore } from "@/stores/create";
import { useUiStore } from "@/stores/ui";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { CreateDraftDocument } from "@/types/__generated__/graphql";
import { DesktopCreateFlow, CreateBanner } from "./DesktopCreateFlow";
import { TikTokPicker } from "./TikTokPicker";
import { CreateErrorDialog, createErrorMessage } from "./CreateErrorDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { SHOW_TIKTOK_CREATE_OPTIONS } from "@/features/create/utils/tiktokAvailability";
import { getSuspendedAccountMessage } from "@/lib/apollo/suspended-account";

/**
 * /upload - the "Upload & sell" entry point.
 *
 * Desktop (>= md): the whole create flow lives here in a shadcn Dialog with a
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
  const [view, setView] = useState<"pick" | "tiktok">("pick");
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

  useEffect(() => {
    if (storeHydrated && hasActiveDraft && creationMode === "ai") {
      router.replace(`/${lang}/upload/create-ai`);
    }
  }, [creationMode, hasActiveDraft, lang, router, storeHydrated]);

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

  if (isDesktop === null || !storeHydrated) return null;

  if (hasActiveDraft && creationMode === "ai") return null;

  if (!showingManual) {
    return (
      <CreationModeChooser
        lang={lang}
        isDesktop={isDesktop}
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
    router.push(`/${lang}/for-you`);
  }

  const options = [
    {
      label: "Video",
      description: "Start with one short product clip.",
      icon: Video,
      onClick: () => handlePickType("video"),
    },
    {
      label: "Photos",
      description: "Add up to 10 clear item photos.",
      icon: Images,
      onClick: () => handlePickType("image"),
    },
    {
      label: "TikTok Import",
      description: "Reuse a video you already posted.",
      icon: Music2,
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
        <header className="shrink-0 border-b border-border bg-app/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4">
            <button
              onClick={() => setView("pick")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-base font-semibold text-foreground">
              Add from TikTok
            </h1>
          </div>
        </header>
        <TikTokPicker
          lang={lang}
          onUsed={() => router.push(`/${lang}/upload/create`)}
          onError={(message) => setCreateError(message)}
        />
      </div>
    );
  }

  return (
    <div className="create-flow-card flex min-h-svh flex-col bg-app">
      <CreateErrorDialog
        message={createError}
        onClose={() => setCreateError(null)}
      />
      <header className="shrink-0 border-b border-border bg-app/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center gap-3 px-4">
          <button
            onClick={closePicker}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground active:opacity-70"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-foreground">
              Choose media
            </h1>
            <p className="text-xs leading-tight text-muted">
              You can review everything before posting.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5">
        <div className="mb-5 rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            What are you selling with?
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Pick the media you already have. Details come next.
          </p>
        </div>

        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-elevated">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.label}
                onClick={opt.onClick}
                disabled={creating}
                className={`${opt.hidden ? "hidden" : "flex"} min-h-20 w-full items-center gap-3 border-b border-border px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-surface disabled:opacity-50`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon size={20} strokeWidth={2.1} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">
                    {opt.description}
                  </span>
                </span>

                <ChevronRight className="shrink-0 text-muted" size={18} />
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

type CreationModeKey = "agent" | "manual";

const CREATION_MODES = [
  {
    key: "agent" as const,
    label: "Shopi Agent",
    icon: Bot,
    heading: "Guided setup",
    recommended: true,
    description:
      "Upload media and let Shopi Agent draft the title, category and useful details with you.",
  },
  {
    key: "manual" as const,
    label: "Manual",
    icon: PenLine,
    heading: "Full control",
    recommended: false,
    description: "Use the editor and enter every listing detail yourself.",
  },
];

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
        selected ? "border-primary bg-primary" : "border-border bg-elevated"
      }`}
    >
      {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
    </span>
  );
}

function CreationModeChooser({
  lang,
  isDesktop,
  onManual,
  onAgent,
}: {
  lang: string;
  isDesktop: boolean;
  onManual: () => void;
  onAgent: () => void;
}) {
  const router = useRouter();
  const setBottomNavHidden = useUiStore((s) => s.setBottomNavHidden);
  const [selected, setSelected] = useState<CreationModeKey>("agent");

  useLayoutEffect(() => {
    setBottomNavHidden(true);
    return () => setBottomNavHidden(false);
  }, [setBottomNavHidden]);

  function close() {
    router.replace(`/${lang}/for-you`);
  }

  function handleContinue() {
    if (selected === "agent") onAgent();
    else onManual();
  }

  const modeCards = (
    <div
      role="radiogroup"
      aria-label="How would you like to create your listing?"
      className="overflow-hidden rounded-lg border border-border bg-elevated"
    >
      {CREATION_MODES.map((mode) => {
        const isSelected = selected === mode.key;
        const Icon = mode.icon;
        return (
          <button
            key={mode.key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setSelected(mode.key)}
            className={`flex w-full items-start gap-3 border-b border-border px-4 py-4 text-left outline-none transition-colors last:border-b-0 hover:bg-surface focus-visible:bg-surface ${
              isSelected ? "bg-primary/5" : "bg-elevated"
            }`}
          >
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-surface text-foreground"
              }`}
            >
              <Icon size={19} strokeWidth={2.1} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {mode.heading}
                </span>
                {mode.recommended && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-strong dark:text-primary">
                    <Sparkles size={12} />
                    Recommended
                  </span>
                )}
              </span>
              <span className="mt-1 block text-xs font-medium text-muted">
                {mode.label}
              </span>
              <span className="app-subcopy mt-2 block">
                {mode.description}
              </span>
            </span>

            <RadioDot selected={isSelected} />
          </button>
        );
      })}
    </div>
  );

  const continueButton = (
    <button
      type="button"
      onClick={handleContinue}
      className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.99]"
    >
      Continue
    </button>
  );

  if (isDesktop) {
    return (
      <>
        <CreateBanner />
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) close();
          }}
        >
          <DialogContent className="w-[min(94vw,440px)] max-w-none gap-0 overflow-hidden rounded-xl border border-default bg-app p-0 shadow-xl">
            <DialogTitle className="sr-only">Create a listing</DialogTitle>
            <DialogDescription className="sr-only">
              Choose how you&apos;d like to create your listing.
            </DialogDescription>

            <div className="px-6 pt-6 pb-6">
              <div className="pr-8">
                <p className="text-xs font-semibold uppercase text-primary">
                  Upload and sell
                </p>
                <h1 className="mt-2 text-lg font-semibold text-foreground">
                  Create a listing
                </h1>
                <p className="app-subcopy mt-1">
                  Choose the path that fits how much help you want.
                </p>
              </div>

              <div className="mt-5">{modeCards}</div>
              <div className="mt-5">{continueButton}</div>

              <p className="mt-4 text-center text-xs leading-5 text-muted">
                Nothing is posted until you review and confirm it.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border bg-elevated">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-4 md:px-6">
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close create"
          >
            <X size={20} />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-semibold text-foreground">
              Create a listing
            </h1>
            <p className="text-xs leading-tight text-muted">
              Choose how to start
            </p>
          </div>
          <span aria-hidden className="h-10 w-10 shrink-0" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 md:px-6 md:py-10">
        <div className="mb-5 rounded-lg border border-border bg-surface px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            Start faster with Shopi Agent.
          </p>
          <p className="app-microcopy mt-1">
            Manual is still here when you want direct control.
          </p>
        </div>

        {modeCards}

        <p className="mt-4 px-1 text-xs leading-5 text-muted">
          Nothing is posted until you review and confirm it.
        </p>
      </main>

      <footer className="border-t border-border bg-elevated px-4 py-4 pb-[calc(1rem+var(--safe-bottom,0px))] md:px-6">
        <div className="mx-auto w-full max-w-2xl">{continueButton}</div>
      </footer>
    </div>
  );
}
