"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useForm, useWatch } from "react-hook-form";
import { useCreateStore } from "@/stores/create";
import {
  AutosaveDraftDocument,
  AdvanceDraftStepDocument,
  ExtractDraftDetailsDocument,
} from "@/types/__generated__/graphql";
import { LocationPicker } from "./LocationPicker";
import { SpecsEditor } from "./SpecsEditor";
import { MediaPicker } from "./MediaPicker";
import { CategoryPickerDrawer } from "./CategoryPickerDrawer";
import { useVideoFrameExtract } from "@/features/create/hooks/useVideoFrameExtract";
import { takeCachedVideoFrames } from "@/features/create/utils/captureVideoFrames";

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
    document.querySelectorAll<HTMLTextAreaElement>(
      "textarea[data-title-input]",
    ),
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
    categoryId,
    categoryName,
    categorySource,
    price,
    currency,
    isFree,
    specs,
    isExtracting,
    hasExtracted,
    location,
    mediaItems,
    tiktokEmbed,
    contentType,
    setTitle,
    setCaption,
    setHashtags,
    setCategory,
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
  const { extractFromFrames } = useVideoFrameExtract();
  // One-shot guard for the instant video extraction (keyed by draftId).
  const videoExtractStartedRef = useRef<string | null>(null);

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
  const { register, control, handleSubmit, setValue } = useForm<EditFormValues>({
    defaultValues: { caption },
    mode: "onChange",
  });
  const watchCaption = useWatch({ control, name: "caption" }) ?? caption;

  // ── AI auto-fill: fills title, description, price and specs ─────────────────
  // The "killer feature". Whatever it returns is fully editable; the user can
  // clear/override anything. Two paths, both one-shot per draft:
  //
  //   • VIDEO (native): runs INSTANTLY off frames snapshotted from the local
  //     file at pick-time (cached by draftId). Decoupled from the Mux upload —
  //     no need to wait for processing, matching the image flow's speed.
  //   • IMAGE / TikTok embed: runs the server-side extractDraftDetails mutation
  //     once the media is READY (or off the TikTok cover for embeds).
  const allReady =
    mediaItems.length > 0 && mediaItems.every((m) => m.status === "ready");

  const isNativeVideo = contentType === "video" && !tiktokEmbed;

  // Apply an extracted result to the form — only fills fields the user hasn't
  // already typed into. Shared by both the video and image/embed paths.
  function applyExtracted(r: {
    title?: string | null;
    description?: string | null;
    price?: number | null;
    specs?: { key: string; value: string }[] | null;
    level1?: string | null;
    categoryId?: string | null;
  }) {
    if (r.title && !titleValue.trim()) setTitleValue(r.title);
    if (r.description && !watchCaption?.trim()) {
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
    if (r.categoryId && !categoryId) {
      setCategory(r.categoryId, r.level1 ?? null, "ai");
    }
  }

  // Embed-backed drafts (TikTok) have no media assets, but AI auto-fill can run
  // off the TikTok thumbnail (the server uses coverImageUrl for these). Native
  // image drafts need all media READY first; native video uses the frame path.
  const canExtractServer =
    !isNativeVideo && (!!tiktokEmbed?.coverImageUrl || allReady);

  // ── Video path: instant frame-based extraction ─────────────────────────────
  // One-shot per draft via a ref guard — NOT via effect state, so re-renders
  // (e.g. setIsExtracting) never re-enter or cancel the in-flight request. That
  // bug previously dropped the result and left the spinner stuck.
  useEffect(() => {
    if (!draftId || !isNativeVideo) return;
    if (videoExtractStartedRef.current === draftId) return;

    // Frames are captured asynchronously at pick-time; poll briefly for them.
    const startedAt = Date.now();
    const FRAME_WAIT_MS = 15_000;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tryExtract = async () => {
      const frames = takeCachedVideoFrames(draftId);
      if (!frames || frames.length === 0) {
        if (Date.now() - startedAt < FRAME_WAIT_MS) {
          timer = setTimeout(tryExtract, 400);
        }
        return;
      }

      videoExtractStartedRef.current = draftId; // lock in once frames are in hand
      setHasExtracted(true);
      setIsExtracting(true);
      try {
        const r = await extractFromFrames(draftId, frames);
        if (r) applyExtracted(r);
      } catch (err) {
        console.error("[AI-extract] video frame extraction error", err);
      } finally {
        setIsExtracting(false);
      }
    };
    tryExtract();

    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, isNativeVideo]);

  // ── Image / TikTok embed path: server-side extraction ──────────────────────
  useEffect(() => {
    if (!draftId || hasExtracted || isExtracting || !canExtractServer) return;

    setHasExtracted(true); // guard: never re-run for this draft
    setIsExtracting(true);
    extractDetails({ variables: { id: draftId } })
      .then(({ data }) => {
        const r = data?.extractDraftDetails;
        if (r) applyExtracted(r);
      })
      .catch((err) => {
        console.error("[AI-extract] mutation error", err);
      })
      .finally(() => setIsExtracting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canExtractServer, draftId, hasExtracted]);

  // ── Debounced autosave ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!draftId) return;
    const timer = setTimeout(() => {
      autosaveMutation({
        variables: {
          id: draftId,
          input: {
            title: titleValue || undefined,
            caption: watchCaption || undefined,
            hashtags: tags.length ? tags : undefined,
            categoryId: categoryId ?? undefined,
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
  }, [titleValue, watchCaption, tags, categoryId, location]);

  // ── Form validity (drives the sticky Next button's disabled state) ──────────
  // Mirrors the synchronously-checkable rules in onNext: a non-empty title, a
  // location, at least one media item that isn't broken, and a valid price.
  // The async upload-still-attaching wait stays inside onNext.
  const parsedPriceValue = priceInput.trim() ? Number(priceInput) : 0;
  const priceValid = Number.isFinite(parsedPriceValue) && parsedPriceValue >= 0;
  const hasUsableMedia =
    mediaItems.length > 0 && !mediaItems.every((m) => m.status === "error");
  const canProceed =
    !!draftId &&
    titleValue.trim().length > 0 &&
    !!location &&
    hasUsableMedia &&
    priceValid &&
    !isExtracting;

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
    const ATTACH_POLL_MS = 300;
    let remainingAttachChecks = Math.ceil(ATTACH_TIMEOUT_MS / ATTACH_POLL_MS);
    while (
      useCreateStore
        .getState()
        .mediaItems.some((m) => m.status === "uploading") &&
      remainingAttachChecks > 0
    ) {
      remainingAttachChecks -= 1;
      await new Promise((r) => setTimeout(r, ATTACH_POLL_MS));
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
            categoryId: categoryId ?? undefined,
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
        serverStep = stepData?.advanceDraftStep?.currentStep as
          | string
          | undefined;
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

  const categoryBlock = (
    <div>
      <label
        className="block mb-1.5 font-medium"
        style={{
          fontSize: "var(--text-sm)",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        Category
      </label>
      <CategoryPickerDrawer
        value={categoryId}
        fallbackLabel={categoryName}
        onChange={(id, name) => setCategory(id, name, "manual")}
      />
      {hasExtracted && categoryId && categorySource === "ai" && (
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "rgb(var(--brand-primary))",
            marginTop: 6,
          }}
        >
          AI suggestion
        </p>
      )}
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
      className="hidden md:flex md:flex-col md:gap-4 md:p-8 md:overflow-y-auto"
      style={{
        width: 340,
        flexShrink: 0,
        borderRight: "1px solid rgb(var(--color-border))",
        backgroundColor: "rgb(var(--color-bg-subtle))",
      }}
    >
      <MediaPicker />

      {/* Title preview */}
      {titleValue && (
        <p
          className="text-center font-semibold line-clamp-2"
          style={{
            fontSize: "var(--text-base)",
            color: "rgb(var(--color-text))",
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
          className="sticky top-0 z-50 flex items-center justify-between px-4 pt-4 pb-3 shrink-0 border-b"
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
          {/* Spacer balances the back button so the title stays centred.
              The primary action now lives in the sticky bottom bar. */}
          <span aria-hidden className="w-12" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {/* Mobile-only: media picker (dotted picker / photo grid / video) */}
          <div className="mb-5 mt-4 md:hidden">
            <MediaPicker />
          </div>

          {/* Title — full width on both layouts (media lives above/in left panel) */}
          <div className="mb-5">{titleBlock}</div>

          <Divider />

          {/* Caption */}
          <div className="mt-4">{captionBlock}</div>

          <Divider className="mt-4" />

          {/* Tags */}
          <div className="mt-4">{tagsBlock}</div>

          <Divider className="mt-4" />

          {/* Category */}
          <div className="mt-4">{categoryBlock}</div>

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

        {/* Sticky bottom action bar — full-width Next, disabled until the
            required fields are valid. Replaces the old top-right button so the
            primary action sits where the thumb is. */}
        <div
          className="sticky bottom-0 z-50 shrink-0 border-t px-4 pt-3"
          style={{
            backgroundColor: "rgb(var(--color-bg))",
            borderColor: "rgb(var(--color-border))",
            paddingBottom: "calc(0.75rem + var(--safe-bottom))",
          }}
        >
          <button
            onClick={handleSubmit(onNext)}
            disabled={!canProceed || advancing}
            className="w-full h-12 rounded-full font-semibold bg-primary text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ fontSize: "var(--text-base)" }}
          >
            {advancing ? "Saving…" : "Next"}
          </button>
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
