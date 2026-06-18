"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useCreateStore } from "@/stores/create";
import {
  AutosaveDraftDocument,
  AdvanceDraftStepDocument,
  ExtractDraftDetailsDocument,
} from "@/types/__generated__/graphql";
import { LocationPicker } from "./LocationPicker";
import { SpecsEditor } from "./SpecsEditor";
import {
  getMediaPreviewSrc,
  shouldUnoptimizeMedia,
} from "@/features/create/utils/mediaPreview";

interface EditFormValues {
  caption: string;
}

const MAX_TITLE = 120;
const MAX_CAPTION = 2000;

/** Grow a textarea to fit its content — call whenever value changes */
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/** Focus the visible title textarea (there are mobile + desktop copies). */
function focusTitle() {
  const inputs = Array.from(
    document.querySelectorAll<HTMLTextAreaElement>("textarea[data-title-input]"),
  );
  const visible = inputs.find((el) => el.offsetParent !== null) ?? inputs[0];
  visible?.focus();
}

export function StepEdit({ onBack }: { onBack?: () => void }) {
  const {
    draftId,
    title,
    caption,
    hashtags,
    price,
    currency,
    isFree,
    specs,
    isExtracting,
    hasExtracted,
    location,
    mediaItems,
    tiktokEmbed,
    setTitle,
    setCaption,
    setHashtags,
    setPrice,
    setSpecs,
    setIsExtracting,
    setHasExtracted,
    setLocation,
    setStep,
    setError,
    error,
  } = useCreateStore();

  const [autosaveMutation] = useMutation(AutosaveDraftDocument);
  const [advanceStep, { loading: advancing }] = useMutation(
    AdvanceDraftStepDocument,
  );
  const [extractDetails] = useMutation(ExtractDraftDetailsDocument);

  // ── Title (autosize textarea) ──────────────────────────────────────────────
  const [titleValue, setTitleValue] = useState(title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  // Resize every rendered title textarea (mobile + desktop copies) whenever the
  // value changes programmatically (e.g. AI auto-fill). Per-element so the hidden
  // copy doesn't starve the visible one.
  useEffect(() => {
    document
      .querySelectorAll<HTMLTextAreaElement>("textarea[data-title-input]")
      .forEach((el) => autosize(el));
  }, [titleValue]);

  // ── Tag chip input ─────────────────────────────────────────────────────────
  const [tags, setTags] = useState<string[]>(hashtags);
  const [tagInput, setTagInput] = useState("");

  function addTag(raw: string) {
    const cleaned = raw.replace(/^#+/, "").trim().toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  // ── Price ──────────────────────────────────────────────────────────────────
  const [priceInput, setPriceInput] = useState(
    price !== null && !isFree ? String(price) : "",
  );

  // ── Caption (react-hook-form) ──────────────────────────────────────────────
  const { register, watch, handleSubmit, setValue } = useForm<EditFormValues>({
    defaultValues: { caption },
    mode: "onChange",
  });
  const watchCaption = watch("caption", caption);

  // ── AI auto-fill: runs once when media is ready ────────────────────────────
  // The "killer feature" — analyses the uploaded media (image, or video frames
  // + voice-over) and fills title, description, price and specs. Whatever it
  // returns is fully editable; the user can clear/override anything.
  const allReady =
    mediaItems.length > 0 && mediaItems.every((m) => m.status === "ready");

  // Embed-backed drafts (TikTok) have no media assets, but AI auto-fill can run
  // off the TikTok thumbnail (the server uses coverImageUrl for these). For
  // native drafts it needs all media READY as before.
  const canExtract = !!tiktokEmbed?.coverImageUrl || allReady;

  useEffect(() => {
    if (!draftId || hasExtracted || isExtracting || !canExtract) {
      console.log("[AI-extract] effect skipped", {
        draftId,
        hasExtracted,
        isExtracting,
        allReady,
        mediaStatuses: mediaItems.map((m) => m.status),
      });
      return;
    }

    console.log("[AI-extract] firing extraction mutation", { draftId });
    setHasExtracted(true); // guard: never re-run for this draft
    setIsExtracting(true);
    extractDetails({ variables: { id: draftId } })
      .then(({ data }) => {
        console.log("[AI-extract] mutation response", { data });
        const r = data?.extractDraftDetails;
        if (!r) {
          console.warn("[AI-extract] no result returned (data null)");
          return;
        }

        // Only fill fields the user hasn't already typed into.
        if (r.title && !titleValue.trim()) setTitleValue(r.title);
        if (r.description && !watch("caption")?.trim()) {
          setValue("caption", r.description);
        }
        if (r.price != null && !priceInput.trim()) {
          setPriceInput(String(r.price));
        }
        const cleanSpecs = (r.specs ?? [])
          .map((s) => ({ key: s.key, value: s.value }))
          .filter((s) => s.key.trim() && s.value.trim());
        if (cleanSpecs.length > 0 && specs.length === 0) {
          setSpecs(cleanSpecs);
        }
      })
      .catch((err) => {
        console.error("[AI-extract] mutation error", err);
      })
      .finally(() => setIsExtracting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canExtract, draftId, hasExtracted]);

  // ── Debounced autosave ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!draftId) return;
    const timer = setTimeout(() => {
      autosaveMutation({
        variables: {
          id: draftId,
          input: {
            title: titleValue || undefined,
            caption: watch("caption") || undefined,
            hashtags: tags.length ? tags : undefined,
            specs: specs.length
              ? specs
                  .filter((s) => s.key.trim() && s.value.trim())
                  .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
              : undefined,
            location: location
              ? {
                  placeName: location.placeName,
                  formattedAddress: location.formattedAddress,
                  placeId: location.placeId,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  county: location.county,
                  subregion: location.subregion,
                }
              : undefined,
          },
        },
      }).catch(() => undefined);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleValue, watchCaption, tags, location]);

  async function onNext(values: EditFormValues) {
    if (!draftId) {
      setError("Draft is not ready yet - please wait a moment and try again.");
      return;
    }
    setError(null);
    setTitleError(null);

    const trimmedTitle = titleValue.trim();
    if (!trimmedTitle) {
      setTitleError("Add a title before moving to settings.");
      focusTitle();
      return;
    }

    // Wait for any items still in "uploading" status — those haven't been
    // attached to the draft yet (attach happens after the R2 PUT completes).
    // Items in "processing" or "ready" are already attached server-side.
    const ATTACH_TIMEOUT_MS = 30_000;
    const started = Date.now();
    while (
      useCreateStore
        .getState()
        .mediaItems.some((m) => m.status === "uploading") &&
      Date.now() - started < ATTACH_TIMEOUT_MS
    ) {
      await new Promise((r) => setTimeout(r, 300));
    }
    if (
      useCreateStore.getState().mediaItems.some((m) => m.status === "uploading")
    ) {
      setError("Upload is taking too long — please try again.");
      return;
    }
    const attachedMedia = useCreateStore.getState().mediaItems;
    if (attachedMedia.length === 0) {
      setError("Add at least one photo or video before continuing.");
      return;
    }
    if (attachedMedia.every((m) => m.status === "error")) {
      setError("Your upload failed. Please go back and choose media again.");
      return;
    }
    if (!location) {
      setLocationError("Add a location before moving to settings.");
      return;
    }

    const parsedPrice = priceInput.trim() ? Number(priceInput) : 0;
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Price must be 0 or more.");
      return;
    }

    const finalIsFree = parsedPrice === 0;
    setPrice(parsedPrice, finalIsFree);

    try {
      // Final autosave (including price + location)
      const { error: saveError } = await autosaveMutation({
        variables: {
          id: draftId,
          input: {
            title: trimmedTitle,
            caption: values.caption,
            hashtags: tags,
            specs: specs
              .filter((s) => s.key.trim() && s.value.trim())
              .map((s) => ({ key: s.key.trim(), value: s.value.trim() })),
            price: { amount: parsedPrice, currency, negotiable: false },
            location: location
              ? {
                  placeName: location.placeName,
                  formattedAddress: location.formattedAddress,
                  placeId: location.placeId,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  county: location.county,
                  subregion: location.subregion,
                }
              : undefined,
          },
        },
      });
      if (saveError) {
        setError(saveError.message ?? "Could not save details");
        return;
      }

      setTitle(trimmedTitle);
      setCaption(values.caption);
      setHashtags(tags);

      let serverStep: string | undefined;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const { data: stepData, error: stepError } = await advanceStep({
          variables: { id: draftId },
        });
        if (stepError) {
          setError(stepError.message ?? "Could not advance step");
          return;
        }
        serverStep = stepData?.advanceDraftStep?.currentStep as string | undefined;
        if (serverStep === "PUBLISHING_OPTIONS" || serverStep === "READY") {
          setStep("options");
          return;
        }
        if (serverStep !== "EDITING") break;
      }

      setError(
        serverStep === "MEDIA_UPLOAD"
          ? "Your media is still attaching. Please wait a moment and try again."
          : "Please complete the required details before continuing.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/title/i.test(message)) {
        setTitleError("Add a title before moving to settings.");
        focusTitle();
        return;
      }
      setError(message);
    }
  }

  // Show first media item immediately (blob) regardless of upload status
  const cover = mediaItems[0];
  const coverSrc = getMediaPreviewSrc(cover);

  // ─────────────────────────────────────────────────────────────────────────
  // Shared sub-components (form fields) extracted so we can render them in
  // both the mobile column layout and the desktop two-column layout.
  // ─────────────────────────────────────────────────────────────────────────

  const titleBlock = (
    <div className="flex-1 flex flex-col justify-start pt-1">
      <textarea
        // Callback ref sizes whichever copy (mobile/desktop) is actually
        // visible. A shared useRef breaks here because the title is rendered in
        // two places — the hidden copy has scrollHeight 0 and starves the other.
        ref={(el) => {
          autosize(el);
        }}
        value={titleValue}
        onChange={(e) => {
          if (e.target.value.length <= MAX_TITLE) {
            setTitleValue(e.target.value);
            if (e.target.value.trim()) setTitleError(null);
          }
          autosize(e.currentTarget);
        }}
        onInput={(e) => autosize(e.currentTarget)}
        placeholder="Add a title…"
        rows={1}
        data-title-input
        className="w-full bg-transparent outline-none resize-none placeholder:text-base font-semibold leading-snug"
        aria-invalid={!!titleError}
        style={{
          fontSize: "var(--text-md)",
          color: titleError
            ? "rgb(var(--color-error))"
            : "rgb(var(--color-text))",
          caretColor: "rgb(var(--brand-primary))",
          overflow: "hidden",
        }}
      />
      {titleError && (
        <span
          className="mt-1 font-medium"
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--color-error))",
          }}
        >
          {titleError}
        </span>
      )}
      <span
        className="mt-1"
        style={{
          fontSize: "var(--text-xs)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        {titleValue.length}/{MAX_TITLE}
      </span>
    </div>
  );

  const captionBlock = (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label
          className="font-medium"
          style={{
            fontSize: "var(--text-sm)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          Detailed description (optional)
        </label>
        {isExtracting && (
          <span
            className="inline-flex items-center gap-1"
            style={{
              fontSize: "var(--text-xs)",
              color: "rgb(var(--brand-primary))",
            }}
          >
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Writing with AI…
          </span>
        )}
      </div>
      <textarea
        {...register("caption", {
          maxLength: {
            value: MAX_CAPTION,
            message: `Max ${MAX_CAPTION} chars`,
          },
        })}
        placeholder="Share what's on your mind…"
        rows={4}
        className="w-full resize-none rounded-xl px-3 py-2.5 outline-none transition-all"
        style={{
          fontSize: "var(--text-base)",
          color: "rgb(var(--color-text))",
          backgroundColor: "rgb(var(--color-bg-subtle))",
          border: "1px solid rgb(var(--color-border))",
          caretColor: "rgb(var(--brand-primary))",
        }}
        maxLength={MAX_CAPTION}
      />
      <p
        className="text-right mt-1"
        style={{
          fontSize: "var(--text-xs)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        {watchCaption?.length ?? 0}/{MAX_CAPTION}
      </p>
    </div>
  );

  const tagsBlock = (
    <div>
      <label
        className="block mb-1.5 font-medium"
        style={{
          fontSize: "var(--text-sm)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        Tags
      </label>
      <div
        className="flex flex-wrap gap-1.5 rounded-xl px-3 py-2.5 min-h-[44px]"
        style={{
          backgroundColor: "rgb(var(--color-bg-subtle))",
          border: "1px solid rgb(var(--color-border))",
        }}
        onClick={() => document.getElementById("tag-input")?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
            style={{
              backgroundColor: "rgb(var(--brand-primary) / 0.12)",
              color: "rgb(var(--brand-primary))",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
            }}
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="leading-none"
              style={{ color: "rgb(var(--brand-primary))", opacity: 0.7 }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="tag-input"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value.replace(/\s/g, ""))}
          onKeyDown={handleTagKeyDown}
          onBlur={() => {
            if (tagInput) addTag(tagInput);
          }}
          placeholder={
            tags.length === 0 ? "fashion, style… (Enter to add)" : ""
          }
          className="flex-1 min-w-[120px] bg-transparent outline-none"
          style={{
            fontSize: "var(--text-base)",
            color: "rgb(var(--color-text))",
            caretColor: "rgb(var(--brand-primary))",
          }}
        />
      </div>
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "rgb(var(--color-text-muted))",
          marginTop: 4,
        }}
      >
        Press Enter or comma to add a tag
      </p>
    </div>
  );

  const priceBlock = (
    <div>
      <label
        className="block mb-1.5 font-medium"
        style={{
          fontSize: "var(--text-sm)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        Price
      </label>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 flex-1 rounded-xl px-3"
          style={{
            height: 48,
            backgroundColor: "rgb(var(--color-bg-subtle))",
            border: "1px solid rgb(var(--color-border))",
          }}
        >
          <span
            style={{
              color: "rgb(var(--color-text-muted))",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
            }}
          >
            {currency}
          </span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{
              fontSize: "var(--text-md)",
              color: "rgb(var(--color-text))",
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setPriceInput("");
            setPrice(0, true);
          }}
          className="rounded-xl px-3 py-2 font-medium"
          style={{
            backgroundColor:
              !priceInput || priceInput === "0"
                ? "rgb(var(--brand-primary) / 0.12)"
                : "rgb(var(--color-bg-subtle))",
            color:
              !priceInput || priceInput === "0"
                ? "rgb(var(--brand-primary))"
                : "rgb(var(--color-text-muted))",
            fontSize: "var(--text-sm)",
          }}
        >
          Free
        </button>
      </div>
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "rgb(var(--color-text-muted))",
          marginTop: 6,
        }}
      >
        Set a price in {currency} or leave at 0 for free
      </p>
    </div>
  );

  const locationBlock = (
    <div>
      <label
        className="block mb-1.5 font-medium"
        style={{
          fontSize: "var(--text-sm)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        Location
      </label>
      <LocationPicker
        value={location}
        onSelect={(loc) => {
          setLocation(loc);
          setLocationError(null);
        }}
        onClear={() => {
          setLocation(null);
          setLocationError("Add a location before moving to settings.");
        }}
      />
      {locationError && (
        <p
          className="font-medium"
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--color-error))",
            marginTop: 6,
          }}
        >
          {locationError}
        </p>
      )}
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "rgb(var(--color-text-muted))",
          marginTop: 6,
        }}
      >
        Helps buyers find your listing nearby
      </p>
    </div>
  );

  const specsBlock = (
    <SpecsEditor specs={specs} onChange={setSpecs} aiGenerated={hasExtracted} />
  );

  const errorBlock = error ? (
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
  ) : null;

  // ── Desktop media preview panel (left column) ──────────────────────────────
  const desktopPreview = (
    <div
      className="hidden md:flex md:flex-col md:justify-center md:items-center md:gap-4 md:p-8"
      style={{
        width: 340,
        flexShrink: 0,
        borderRight: "1px solid rgb(var(--color-border))",
        backgroundColor: "rgb(var(--color-bg-subtle))",
      }}
    >
      {/* Large media preview */}
      <div
        className="rounded-2xl overflow-hidden relative w-full"
        style={{
          aspectRatio: "3/4",
          maxWidth: 240,
          backgroundColor: "rgb(var(--color-bg))",
          border: "1px solid rgb(var(--color-border))",
        }}
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="100vw"
            className="object-contain"
            unoptimized={shouldUnoptimizeMedia(coverSrc)}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "rgb(var(--color-text-muted))" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path
                d="M3 15l5-5 4 4 3-3 6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Upload / processing overlay — always show until ready */}
        {(!cover || cover.status !== "ready") && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="flex flex-col items-center gap-1.5">
              <svg
                className="animate-spin"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeOpacity="0.3"
                  strokeWidth="3"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{
                  fontSize: 10,
                  color: "white",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                {cover?.status === "uploading" ? "UPLOADING" : "PROCESSING"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Media count badge */}
      {mediaItems.length > 1 && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          +{mediaItems.length - 1} more{" "}
          {mediaItems.length - 1 === 1 ? "file" : "files"}
        </p>
      )}

      {/* Title preview */}
      {titleValue && (
        <p
          className="text-center font-semibold line-clamp-2"
          style={{
            fontSize: "var(--text-base)",
            color: "rgb(var(--color-text))",
            maxWidth: 240,
          }}
        >
          {titleValue}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full flex-1">
      {/* ── Desktop left panel — media preview ── */}
      {desktopPreview}

      {/* ── Right / mobile column — header + form ── */}
      <div className="flex flex-col flex-1 h-full min-h-0">
        {/* Header — sticky so it stays pinned while the form scrolls */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-4 pt-4 pb-3 shrink-0 border-b"
          style={{
            backgroundColor: "rgb(var(--color-bg))",
            borderColor: "rgb(var(--color-border))",
          }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-1"
            style={{
              color: "rgb(var(--color-text-muted))",
              fontSize: "var(--text-sm)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
          <h2
            className="font-semibold"
            style={{
              fontSize: "var(--text-lg)",
              color: "rgb(var(--color-text))",
            }}
          >
            Details
          </h2>
          <button
            onClick={handleSubmit(onNext)}
            disabled={advancing}
            className="font-semibold px-4 py-1.5 rounded-full"
            style={{
              backgroundColor: "rgb(var(--brand-primary))",
              color: "white",
              fontSize: "var(--text-sm)",
              opacity: advancing ? 0.6 : 1,
            }}
          >
            {advancing ? "…" : "Next"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {/* Mobile-only: thumbnail + title row */}
          <div className="flex gap-3 mb-5 md:hidden">
            <div
              className="rounded-xl overflow-hidden flex-shrink-0 relative"
              style={{
                width: 72,
                height: 96,
                backgroundColor: "rgb(var(--color-bg-subtle))",
              }}
            >
              {/* Image preview — shown as soon as blob URL is available */}
              {coverSrc ? (
                <Image
                  src={coverSrc}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                  unoptimized={shouldUnoptimizeMedia(coverSrc)}
                />
              ) : (
                // Placeholder while no blob URL yet
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                    <path
                      d="M3 15l5-5 4 4 3-3 6 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              {/* Upload / processing spinner overlay */}
              {(!cover || cover.status !== "ready") && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="flex flex-col items-center gap-1">
                    <svg
                      className="animate-spin"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeOpacity="0.3"
                        strokeWidth="3"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      style={{
                        fontSize: 9,
                        color: "white",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {cover?.status === "uploading"
                        ? "UPLOADING"
                        : "PROCESSING"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {titleBlock}
          </div>

          {/* Desktop-only: title block without thumbnail (thumbnail is in left panel) */}
          <div className="hidden md:block mb-5">{titleBlock}</div>

          <Divider />

          {/* Caption */}
          <div className="mt-4">{captionBlock}</div>

          <Divider className="mt-4" />

          {/* Tags */}
          <div className="mt-4">{tagsBlock}</div>

          <Divider className="mt-4" />

          {/* Price */}
          <div className="mt-4">{priceBlock}</div>

          <Divider className="mt-4" />

          {/* Specifications (AI-generated, editable) — hidden for now.
              Remove `hidden` to re-enable once spec generation is turned on. */}
          <div className="mt-4 hidden">{specsBlock}</div>
          <div className="hidden">
            <Divider className="mt-4" />
          </div>

          {/* Location */}
          <div className="mt-4">{locationBlock}</div>

          {/* Error */}
          {error && <div className="mt-4">{errorBlock}</div>}
        </div>
      </div>
    </div>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{ height: 1, backgroundColor: "rgb(var(--color-border))" }}
    />
  );
}
