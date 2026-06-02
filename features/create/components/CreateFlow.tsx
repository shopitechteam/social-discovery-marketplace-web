/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import type { CreateStep } from "@/stores/create";
import { StepEdit } from "./StepEdit";
import { StepMediaReview } from "./StepMediaReview";
import { StepOptions } from "./StepOptions";
import { StepReady } from "./StepReady";
import { useRouter } from "next/navigation";
import { GetDraftDocument } from "@/types/__generated__/graphql";
import type { DraftStep, ContentType } from "@/types/__generated__/graphql";

interface CreateFlowProps {
  lang: string;
}

/** Map backend DraftStep → frontend CreateStep */
function mapDraftStep(apiStep: DraftStep): CreateStep {
  switch (apiStep) {
    case "MEDIA_UPLOAD":
      return "media";
    case "EDITING":
      return "edit";
    case "PUBLISHING_OPTIONS":
      return "options";
    case "READY":
      return "ready";
    default:
      return "edit";
  }
}

function mapContentType(
  type: ContentType | null | undefined,
): "image" | "video" | null {
  if (type === "IMAGE") return "image";
  if (type === "VIDEO") return "video";
  return null;
}

export function CreateFlow({ lang }: CreateFlowProps) {
  const store = useCreateStore();
  const {
    step,
    draftId,
    setStep,
    setTitle,
    setCaption,
    setHashtags,
    setContentType,
    setPrice,
    setVisibilityMode,
    setAllowDownload,
    setHdEnabled,
    setError,
  } = store;

  const router = useRouter();
  const apolloClient = useApolloClient();

  // Track whether Zustand persist has finished loading from sessionStorage.
  // Until it has, we render nothing — avoids acting on stale DEFAULT_STATE.
  const [hydrated, setHydrated] = useState(false);
  // True while we're fetching the draft from the API to restore step on reload
  const [restoring, setRestoring] = useState(false);

  // Step 1: wait for Zustand to rehydrate from sessionStorage
  useEffect(() => {
    // If already hydrated synchronously (SSR / no persist data) finish immediately
    if (useCreateStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useCreateStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  // Step 2: once hydrated, decide what to do
  useEffect(() => {
    if (!hydrated) return;

    if (!draftId) {
      // Nothing in session — send back to picker
      router.replace(`/${lang}/upload`);
      return;
    }

    // Store has a real step already (persisted from before the reload) — just render it
    if (step !== "pick") return;

    // draftId exists but step got reset to "pick" (e.g. sessionStorage only had
    // a partial write). Re-fetch from the API to get the authoritative step.
    let cancelled = false;
    setRestoring(true);

    apolloClient
      .query({
        query: GetDraftDocument,
        variables: { id: draftId },
        fetchPolicy: "network-only",
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.draft) {
          useCreateStore.getState().reset();
          router.replace(`/${lang}/upload`);
          return;
        }

        const d = data.draft;
        setStep(mapDraftStep(d.currentStep));
        setContentType(mapContentType(d.type));
        setTitle(d.title ?? "");
        setCaption(d.caption ?? "");
        setHashtags(d.hashtags ?? []);
        setVisibilityMode(
          (d.visibilityMode?.toLowerCase() as
            | "public"
            | "friends_only"
            | "private") ?? "public",
        );
        setAllowDownload(d.allowDownload ?? false);
        setHdEnabled(d.hdEnabled ?? false);
        if (d.price) setPrice(d.price.amount, d.price.amount === 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function handleBack() {
    router.push(`/${lang}/upload`);
  }

  // ── Not yet rehydrated from sessionStorage ────────────────────────────────
  if (!hydrated || restoring) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Restoring your draft…</span>
        </div>
      </div>
    );
  }

  // ── Redirecting (no draftId or step === "pick") ───────────────────────────
  if (step === "pick") return null;

  // ── Ready step — full-screen layout ──────────────────────────────────────
  if (step === "ready") {
    return <StepReady lang={lang} />;
  }

  return (
    <div className="md:fixed md:inset-0 md:z-50 md:flex md:items-center md:justify-center md:bg-black/50 md:backdrop-blur-sm">
      <div className="create-flow-card flex flex-col bg-app w-full md:rounded-2xl md:shadow-2xl md:overflow-hidden">
        <div className="flex-1 flex flex-col">
          {step === "media" && <StepMediaReview onBack={handleBack} />}
          {step === "edit" && <StepEdit onBack={handleBack} />}
          {step === "options" && <StepOptions />}
        </div>
      </div>
    </div>
  );
}
