"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import {
  AutosaveDraftDocument,
  AdvanceDraftStepDocument,
  VisibilityMode,
} from "@/types/__generated__/graphql";
import { getMediaPreviewSrc } from "@/features/create/utils/mediaPreview";

type Visibility = "public" | "friends_only" | "private";

const VISIBILITY_OPTIONS: {
  value: Visibility;
  label: string;
  icon: string;
  desc: string;
}[] = [
  { value: "public",       label: "Everyone",     icon: "🌍", desc: "Anyone can see this post" },
  { value: "friends_only", label: "Friends only",  icon: "👥", desc: "Only people you follow" },
  { value: "private",      label: "Only me",       icon: "🔒", desc: "Only visible to you" },
];

export function StepOptions() {
  const {
    draftId,
    price,
    currency,
    title,
    isFree,
    mediaItems,
    visibilityMode,
    allowDownload,
    hdEnabled,
    setVisibilityMode,
    setAllowDownload,
    setHdEnabled,
    setStep,
    setError,
    error,
  } = useCreateStore();

  const [advancing, setAdvancing] = useState(false);

  const [autosave] = useMutation(AutosaveDraftDocument);
  const [advanceStep] = useMutation(AdvanceDraftStepDocument);

  async function handleNext() {
    if (!draftId) return;
    setError(null);
    setAdvancing(true);

    const parsedPrice = price ?? 0;

    try {
      // 1. Autosave options
      const { error: saveError } = await autosave({
        variables: {
          id: draftId,
          input: {
            price: { amount: parsedPrice, currency, negotiable: false },
            visibilityMode: visibilityMode.toUpperCase() as VisibilityMode,
            allowDownload,
            hdEnabled,
          },
        },
      });
      if (saveError) {
        setError(saveError.message ?? "Failed to save settings");
        return;
      }

      // 2. Advance step — trust what the server returns
      const { data: stepData, error: stepError } = await advanceStep({
        variables: { id: draftId },
      });
      if (stepError) {
        setError(stepError.message ?? "Could not advance step");
        return;
      }

      // Cast to string so we're not tied to the codegen-narrowed union
      const serverStep = stepData?.advanceDraftStep?.currentStep as string | undefined;
      const stepMap: Record<string, "edit" | "options" | "ready" | "media" | "pick"> = {
        EDITING: "edit",
        MEDIA_UPLOAD: "media",
        PUBLISHING_OPTIONS: "options",
        READY: "ready",
      };
      if (serverStep && stepMap[serverStep]) {
        setStep(stepMap[serverStep]);
        if (serverStep !== "READY") {
          setError("Please complete all required fields before proceeding.");
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setAdvancing(false);
    }
  }

  const cover = mediaItems[0];
  const coverSrc = getMediaPreviewSrc(cover);

  // ── Shared form sections ──────────────────────────────────────────────────

  const visibilitySection = (
    <Section title="Audience">
      <div className="flex flex-col gap-2">
        {VISIBILITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setVisibilityMode(opt.value)}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all"
            style={{
              backgroundColor:
                visibilityMode === opt.value
                  ? "rgb(var(--brand-primary) / 0.08)"
                  : "rgb(var(--color-bg-subtle))",
              border:
                visibilityMode === opt.value
                  ? "1.5px solid rgb(var(--brand-primary) / 0.4)"
                  : "1.5px solid transparent",
            }}
          >
            <span style={{ fontSize: 20 }}>{opt.icon}</span>
            <div className="flex-1 text-left">
              <p style={{ fontSize: "var(--text-base)", fontWeight: 500, color: "rgb(var(--color-text))" }}>
                {opt.label}
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "rgb(var(--color-text-muted))" }}>
                {opt.desc}
              </p>
            </div>
            <RadioDot active={visibilityMode === opt.value} />
          </button>
        ))}
      </div>
    </Section>
  );

  const togglesSection = (
    <Section title="More options">
      <div className="flex flex-col">
        <ToggleRow
          label="Allow downloads"
          description="Let others save your content"
          value={allowDownload}
          onChange={setAllowDownload}
        />
        <div style={{ height: 1, backgroundColor: "rgb(var(--color-border))", margin: "2px 0" }} />
        <ToggleRow
          label="HD quality"
          description="Upload and serve in high definition"
          value={hdEnabled}
          onChange={setHdEnabled}
        />
      </div>
    </Section>
  );

  return (
    <div className="flex flex-col md:flex-row h-full flex-1">

      {/* ── Desktop left — summary card ── */}
      <div
        className="hidden md:flex md:flex-col md:justify-center md:items-center md:gap-5 md:p-8"
        style={{
          width: 320,
          flexShrink: 0,
          borderRight: "1px solid rgb(var(--color-border))",
          backgroundColor: "rgb(var(--color-bg-subtle))",
        }}
      >
        {/* Cover thumbnail */}
        {cover && (
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{
              width: 160,
              height: 213,
              backgroundColor: "rgb(var(--color-bg))",
              border: "1px solid rgb(var(--color-border))",
            }}
          >
            {cover.type === "video" && cover.localUri ? (
              <video
                src={cover.localUri}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: "rgb(var(--color-bg-subtle))" }} />
            )}
          </div>
        )}

        {/* Summary rows */}
        <div className="w-full max-w-[240px] flex flex-col gap-2">
          <SummaryRow label="Title" value={title || "—"} />
          <SummaryRow
            label="Price"
            value={isFree || !price ? "Free" : `${currency} ${price}`}
          />
          <SummaryRow
            label="Files"
            value={`${mediaItems.length} ${mediaItems.length === 1 ? "file" : "files"}`}
          />
        </div>
      </div>

      {/* ── Right / mobile — settings form ── */}
      <div className="flex flex-col flex-1 h-full min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
          <button
            onClick={() => setStep("edit")}
            className="flex items-center gap-1"
            style={{ color: "rgb(var(--color-text-muted))", fontSize: "var(--text-sm)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <h2
            className="font-semibold"
            style={{ fontSize: "var(--text-lg)", color: "rgb(var(--color-text))" }}
          >
            Settings
          </h2>
          <button
            onClick={handleNext}
            disabled={advancing}
            className="font-semibold px-4 py-1.5 rounded-full"
            style={{
              backgroundColor: "rgb(var(--brand-primary))",
              color: "white",
              fontSize: "var(--text-sm)",
              opacity: advancing ? 0.6 : 1,
            }}
          >
            {advancing ? "…" : "Review"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-5">
          {visibilitySection}
          {togglesSection}

          {error && (
            <div
              className="rounded-xl px-4 py-3"
              style={{
                backgroundColor: "rgb(var(--color-error) / 0.08)",
                border: "1px solid rgb(var(--color-error) / 0.2)",
                color: "rgb(var(--color-error))",
                fontSize: "var(--text-sm)",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="mb-2 font-semibold uppercase tracking-wide"
        style={{ fontSize: "var(--text-xs)", color: "rgb(var(--color-text-muted))" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between rounded-xl px-3 py-2.5"
      style={{ backgroundColor: "rgb(var(--color-bg-elevated))", border: "1px solid rgb(var(--color-border))" }}
    >
      <span style={{ fontSize: "var(--text-xs)", color: "rgb(var(--color-text-muted))" }}>{label}</span>
      <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "rgb(var(--color-text))" }} className="line-clamp-1 max-w-[140px] text-right">{value}</span>
    </div>
  );
}

function RadioDot({ active }: { active: boolean }) {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        border: active
          ? "2px solid rgb(var(--brand-primary))"
          : "2px solid rgb(var(--color-border-strong))",
      }}
    >
      {active && (
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "rgb(var(--brand-primary))" }} />
      )}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: "var(--text-base)", fontWeight: 500, color: "rgb(var(--color-text))" }}>
          {label}
        </p>
        <p style={{ fontSize: "var(--text-xs)", color: "rgb(var(--color-text-muted))" }}>
          {description}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative flex-shrink-0 rounded-full transition-colors"
        style={{
          width: 44,
          height: 26,
          backgroundColor: value ? "rgb(var(--brand-primary))" : "rgb(var(--color-border-strong))",
        }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white transition-transform shadow-sm"
          style={{
            width: 22,
            height: 22,
            left: 2,
            transform: value ? "translateX(18px)" : "translateX(0px)",
          }}
        />
      </button>
    </div>
  );
}
