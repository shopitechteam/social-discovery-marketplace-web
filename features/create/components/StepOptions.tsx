/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCreateStore } from "@/stores/create";
import {
  AutosaveDraftDocument,
  AdvanceDraftStepDocument,
  PublishDraftDocument,
  TiktokConnectUrlDocument,
  MeDocument,
} from "@/types/__generated__/graphql";
import type { VisibilityMode } from "@/types/__generated__/graphql";
import { getMediaPreviewSrc } from "@/features/create/utils/mediaPreview";
import { Celebration, SuccessBadge } from "./Celebration";
import { TikTokCreatePreview } from "./TikTokCreatePreview";

const POST_TO_TIKTOK = gql`
  mutation PostToTiktokOptions($contentId: String!) {
    postToTiktok(contentId: $contentId)
  }
`;

interface StepOptionsProps {
  lang: string;
}

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

function toVisibilityMode(mode: Visibility): VisibilityMode {
  switch (mode) {
    case "friends_only":
      return "FRIENDS_ONLY";
    case "private":
      return "PRIVATE";
    case "public":
    default:
      return "PUBLIC";
  }
}

export function StepOptions({ lang }: StepOptionsProps) {
  const {
    draftId,
    price,
    currency,
    title,
    isFree,
    mediaItems,
    contentType,
    tiktokEmbed,
    visibilityMode,
    allowDownload,
    hdEnabled,
    postOnTiktok,
    setVisibilityMode,
    setAllowDownload,
    setHdEnabled,
    setPostOnTiktok,
    setStep,
    setError,
    error,
    reset,
  } = useCreateStore();

  const router = useRouter();
  const [advancing, setAdvancing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [tiktokReconnectNeeded, setTiktokReconnectNeeded] = useState(false);
  const [connectingTiktok, setConnectingTiktok] = useState(false);

  const { data: meData, refetch: refetchMe } = useQuery(MeDocument, { fetchPolicy: "cache-and-network" });
  const isTiktokConnected = meData?.me?.authProviders?.tiktok ?? false;

  const [autosave] = useMutation(AutosaveDraftDocument);
  const [advanceStep] = useMutation(AdvanceDraftStepDocument);
  const [publishDraft] = useMutation(PublishDraftDocument);
  const [postToTiktok] = useMutation(POST_TO_TIKTOK) as any;
  const [getTiktokConnectUrl] = useMutation(TiktokConnectUrlDocument);

  async function handleTiktokToggle() {
    if (postOnTiktok) {
      setPostOnTiktok(false);
      return;
    }
    if (isTiktokConnected) {
      setPostOnTiktok(true);
      return;
    }
    // Not connected — open OAuth popup then re-check
    setConnectingTiktok(true);
    try {
      const { data } = await getTiktokConnectUrl({ variables: { returnUrl: undefined } });
      const url = data?.tiktokConnectUrl;
      if (!url) return;
      const popup = window.open(url, "tiktok-connect", "width=520,height=680");
      // Poll until popup closes
      const poll = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(poll);
          setConnectingTiktok(false);
          const { data: fresh } = await refetchMe();
          if (fresh?.me?.authProviders?.tiktok) {
            setPostOnTiktok(true);
          }
        }
      }, 800);
    } catch {
      setConnectingTiktok(false);
    }
  }

  useEffect(() => {
    if (!draftId) return;

    const timer = setTimeout(() => {
      autosave({
        variables: {
          id: draftId,
          input: {
            visibilityMode: toVisibilityMode(visibilityMode),
            allowDownload,
            hdEnabled,
          },
        },
      }).catch(() => undefined);
    }, 250);

    return () => clearTimeout(timer);
  }, [allowDownload, autosave, draftId, hdEnabled, visibilityMode]);

  /**
   * Post: save settings, advance the draft to READY (the backend requires READY
   * before publish), then publish — all without a separate preview screen.
   * Optionally cross-posts to TikTok for videos.
   */
  async function handlePost() {
    if (!draftId || publishing || advancing) return;
    setError(null);
    setPublishing(true);

    const parsedPrice = price ?? 0;

    try {
      // 1. Autosave options
      const { error: saveError } = await autosave({
        variables: {
          id: draftId,
          input: {
            price: { amount: parsedPrice, currency, negotiable: false },
            visibilityMode: toVisibilityMode(visibilityMode),
            allowDownload,
            hdEnabled,
          },
        },
      });
      if (saveError) {
        setError(saveError.message ?? "Failed to save settings");
        return;
      }

      // 2. Advance PUBLISHING_OPTIONS → READY (required before publish)
      const { data: stepData, error: stepError } = await advanceStep({
        variables: { id: draftId },
      });
      if (stepError) {
        setError(stepError.message ?? "Could not finalize post");
        return;
      }
      const serverStep = stepData?.advanceDraftStep?.currentStep as string | undefined;
      if (serverStep !== "READY") {
        setError("Please complete all required fields before posting.");
        return;
      }

      // 3. Publish
      const { data: pubData, error: publishError } = await publishDraft({
        variables: { id: draftId },
      });
      if (publishError) {
        setError(publishError.message ?? "Failed to publish");
        return;
      }
      if (!pubData?.publishDraft) return;

      const contentId = pubData.publishDraft.id as string;
      setPublished(true);

      // 4. Optional TikTok cross-post
      if (postOnTiktok && contentId) {
        try {
          const tiktokResult = await postToTiktok({ variables: { contentId } });
          const tiktokErrors = tiktokResult?.errors ?? [];
          const needsReconnect = tiktokErrors.some((e: { message?: string }) =>
            (e.message ?? "").includes("TIKTOK_RECONNECT_REQUIRED"),
          );
          if (needsReconnect) {
            setTiktokReconnectNeeded(true);
            return; // hold on the success screen so user can reconnect
          }
        } catch {
          // network error — user still lands on the success screen
        }
      }

      // No auto-redirect — the success screen stays up until the user taps
      // "Go to feed". The post is already submitted and will appear once it
      // clears automated review in the background.
    } catch (err) {
      setError(String(err));
    } finally {
      setPublishing(false);
    }
  }

  /** Save draft (autosave already keeps it current) and exit to the feed. */
  async function handleSaveDraft() {
    if (publishing) return;
    setAdvancing(true);
    try {
      if (draftId) {
        await autosave({
          variables: {
            id: draftId,
            input: {
              price: { amount: price ?? 0, currency, negotiable: false },
              visibilityMode: toVisibilityMode(visibilityMode),
              allowDownload,
              hdEnabled,
            },
          },
        }).catch(() => undefined);
      }
      reset();
      router.push(`/${lang}/feed`);
    } finally {
      setAdvancing(false);
    }
  }

  const cover = mediaItems[0];
  const coverSrc = getMediaPreviewSrc(cover);

  // ── Published success ──────────────────────────────────────────────────────
  if (published) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        style={{ backgroundColor: "rgb(var(--color-bg))" }}
      >
        <Celebration>
          <div className="flex flex-col items-center justify-center gap-5 px-6 text-center max-w-sm mx-auto">
            <SuccessBadge />

            <div className="celebrate-text">
              <h2
                className="font-extrabold mb-1.5"
                style={{ fontSize: "var(--text-2xl)", color: "rgb(var(--color-text))" }}
              >
                Posted! 🎉
              </h2>
              <p style={{ fontSize: "var(--text-base)", color: "rgb(var(--color-text-muted))" }}>
                It’s been submitted and is going through a quick automated review
                to make sure it meets our guidelines. It’ll show up on the feed as
                soon as it’s approved.
              </p>
            </div>

            {!tiktokReconnectNeeded && (
              <button
                onClick={() => {
                  reset();
                  router.push(`/${lang}/feed`);
                }}
                className="celebrate-cta mt-1 h-11 rounded-full px-6 font-semibold active:scale-[0.97] transition-transform"
                style={{
                  backgroundColor: "rgb(var(--brand-primary))",
                  color: "white",
                  fontSize: "var(--text-base)",
                  boxShadow: "0 8px 24px rgb(var(--brand-primary) / 0.4)",
                }}
              >
                Go to feed
              </button>
            )}

            {tiktokReconnectNeeded && (
              <div
                className="celebrate-text w-full max-w-xs rounded-2xl px-4 py-4 text-center"
                style={{
                  backgroundColor: "rgb(var(--color-bg-elevated))",
                  border: "1px solid rgb(var(--color-border))",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <p className="font-semibold mb-1" style={{ fontSize: "var(--text-sm)", color: "rgb(var(--color-text))" }}>
                  TikTok cross-post needs reconnect
                </p>
                <p className="mb-3" style={{ fontSize: "var(--text-xs)", color: "rgb(var(--color-text-muted))" }}>
                  Your TikTok connection needs the posting permission. Reconnect once and it will work automatically next time.
                </p>
                <button
                  onClick={async () => {
                    try {
                      const { data: urlData } = await getTiktokConnectUrl({ variables: { returnUrl: undefined } });
                      const url = urlData?.tiktokConnectUrl;
                      if (url) window.open(url, "tiktok-connect", "width=520,height=680");
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="font-semibold px-4 py-2 rounded-full"
                  style={{ fontSize: "var(--text-xs)", backgroundColor: "rgb(var(--brand-primary))", color: "white" }}
                >
                  Reconnect TikTok
                </button>
                <button
                  onClick={() => {
                    reset();
                    router.push(`/${lang}/feed`);
                  }}
                  className="block mx-auto mt-2 font-medium"
                  style={{ fontSize: "var(--text-xs)", color: "rgb(var(--color-text-muted))" }}
                >
                  Go to feed
                </button>
              </div>
            )}
          </div>

          <style jsx>{`
            .celebrate-text,
            .celebrate-cta {
              opacity: 0;
              animation: celebrate-rise 0.5s ease-out 0.5s forwards;
            }
            .celebrate-cta {
              animation-delay: 0.7s;
            }
            @keyframes celebrate-rise {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </Celebration>
      </div>
    );
  }

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

  const tiktokSection = contentType === "video" && (
    <Section title="Share">
      <div className="flex flex-col">
        <ToggleRow
          label="Post on TikTok"
          description={
            connectingTiktok
              ? "Connecting to TikTok…"
              : isTiktokConnected
                ? "Cross-post this video to your TikTok"
                : "Connect TikTok to enable cross-posting"
          }
          value={postOnTiktok}
          onChange={handleTiktokToggle}
          disabled={connectingTiktok}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: postOnTiktok ? "rgb(var(--brand-primary))" : "rgb(var(--color-text-muted))" }}>
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.27 8.27 0 0 0 4.84 1.55V6.85a4.85 4.85 0 0 1-1.07-.16z"/>
            </svg>
          }
        />
      </div>
    </Section>
  );

  return (
    <div className="flex flex-col md:flex-row h-full flex-1">

      {/* ── Publishing overlay ──────────────────────────────────────────────
          handlePost runs several sequential mutations (autosave → advance →
          publish → optional TikTok cross-post). Without this the screen looks
          frozen and the user can't tell anything is happening. Show a dimmed,
          interaction-blocking overlay with a centered loader for the duration. */}
      {publishing && <PublishingOverlay />}

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
            {tiktokEmbed ? (
              <TikTokCreatePreview
                embed={tiktokEmbed}
                className="absolute inset-0 h-full w-full"
                style={{ aspectRatio: "auto" }}
                sizes="160px"
              />
            ) : cover.type === "video" && cover.localUri ? (
              <video
                src={cover.localUri}
                className="absolute inset-0 w-full h-full object-contain"
                muted
                playsInline
                preload="metadata"
              />
            ) : coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverSrc}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
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
          {/* Spacer to keep the title centered (Post/Draft live in the bottom bar) */}
          <div style={{ width: 50 }} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 flex flex-col gap-5">
          {visibilitySection}
          {togglesSection}
          {tiktokSection}

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

        {/* ── Fixed bottom action bar: Draft (outline) + Post (primary) ── */}
        <div
          className="flex gap-3 px-4 pt-3 shrink-0"
          style={{
            borderTop: "1px solid rgb(var(--color-border))",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
          }}
        >
          <button
            onClick={handleSaveDraft}
            disabled={advancing || publishing}
            className="flex-1 h-12 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{
              backgroundColor: "transparent",
              border: "1.5px solid rgb(var(--color-border-strong))",
              color: "rgb(var(--color-text))",
              fontSize: "var(--text-base)",
              opacity: advancing || publishing ? 0.6 : 1,
            }}
          >
            {advancing ? <MiniSpinnerDark /> : "Draft"}
          </button>
          <button
            onClick={handlePost}
            disabled={publishing || advancing}
            className="flex-1 h-12 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{
              backgroundColor: "rgb(var(--brand-primary))",
              color: "white",
              fontSize: "var(--text-base)",
              boxShadow: publishing ? "none" : "0 6px 20px rgb(var(--brand-primary) / 0.4)",
              opacity: publishing ? 0.8 : 1,
            }}
          >
            {publishing ? <MiniSpinner /> : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * Full-screen dimmed overlay shown while a post is being published. Sits above
 * the create-flow card (which uses z-50 on desktop) at z-[60], blocks all
 * interaction underneath, and centers a loader + label so the user knows the
 * post is in flight rather than the screen having frozen.
 */
function PublishingOverlay() {
  return (
    <div
      className="fixed inset-0 z-60 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-[2px]"
      style={{ touchAction: "none" }}
      role="status"
      aria-live="polite"
      aria-label="Publishing your post"
    >
      <svg
        className="animate-spin"
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm font-medium text-white/90">Posting…</span>
    </div>
  );
}

function MiniSpinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function MiniSpinnerDark() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

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
  disabled,
  icon,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ opacity: disabled ? 0.6 : 1 }}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
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
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
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
