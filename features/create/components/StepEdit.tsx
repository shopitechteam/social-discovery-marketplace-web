"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useForm, useWatch } from "react-hook-form";
import { useCreateStore } from "@/stores/create";
import {
  AutosaveDraftDocument,
  AdvanceDraftStepDocument,
  ExtractDraftDetailsDocument,
  SuggestedPostLocationDocument,
  MyContactPhoneDocument,
} from "@/types/__generated__/graphql";
import { LocationPicker } from "./LocationPicker";
import { PhoneInput } from "./PhoneInput";
import { SpecsEditor } from "./SpecsEditor";
import { MediaPicker } from "./MediaPicker";
import { CategoryPickerDrawer } from "./CategoryPickerDrawer";
import { useVideoFrameExtract } from "@/features/create/hooks/useVideoFrameExtract";
import { takeCachedVideoFrames } from "@/features/create/utils/captureVideoFrames";
import {
  isDraftAutosaveBlocked,
  trackDraftAutosave,
} from "@/features/create/utils/draftAutosave";
import { Switch } from "@/components/ui/switch";

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

/** Scroll a required field into view so its inline error is visible when the
 *  user taps Next from the bottom of a long, scrolled form. */
function scrollFieldIntoView(field: string) {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-field="${field}"]`),
  );
  const visible = els.find((el) => el.offsetParent !== null) ?? els[0];
  visible?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function StepEdit({
  onBack,
  embedded = false,
}: {
  onBack?: () => void;
  /** Inside the desktop create dialog: it owns the header (back/stepper) and
   *  the live preview panel, so this step renders only the form column. */
  embedded?: boolean;
}) {
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
    negotiable,
    specs,
    isExtracting,
    hasExtracted,
    location,
    contactPhone,
    mediaItems,
    tiktokEmbed,
    contentType,
    setTitle,
    setCaption,
    setHashtags,
    setCategory,
    setPrice,
    setNegotiable,
    setSpecs,
    setIsExtracting,
    setHasExtracted,
    setLocation,
    setContactPhone,
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
  // One-shot guard for the instant frame extraction (keyed by draftId).
  const frameExtractStartedRef = useRef<string | null>(null);
  // Set when no locally-captured frames showed up (e.g. a resumed draft after
  // reload — the in-memory frame cache is gone). Unblocks the server-side
  // extraction fallback for image drafts.
  const [frameExtractGaveUp, setFrameExtractGaveUp] = useState(false);

  // ── Title (autosize textarea) ──────────────────────────────────────────────
  const [titleValue, setTitleValue] = useState(title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
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
  const { register, control, handleSubmit, setValue } = useForm<EditFormValues>(
    {
      defaultValues: { caption },
      mode: "onChange",
    },
  );
  const watchCaption = useWatch({ control, name: "caption" }) ?? caption;

  // ── Location auto-fill ─────────────────────────────────────────────────────
  // Pre-fill the location with the user's suggested location — their latest
  // post's location, falling back to their saved profile location (resolved
  // server-side). Runs once; never overrides a location the user (or a restored
  // draft) already has, so it's freely editable and a manual clear sticks.
  const locationAutofilledRef = useRef(false);
  const { data: suggestedLocationData } = useQuery(
    SuggestedPostLocationDocument,
    { fetchPolicy: "cache-first" },
  );
  useEffect(() => {
    if (locationAutofilledRef.current) return;
    if (location) return; // user/draft already has one — don't clobber it
    const suggested = suggestedLocationData?.suggestedPostLocation;
    if (!suggested?.placeName || !suggested.placeId) return;
    locationAutofilledRef.current = true;
    setLocation({
      placeName: suggested.placeName,
      formattedAddress: suggested.formattedAddress ?? "",
      placeId: suggested.placeId,
      county: suggested.county ?? undefined,
      subregion: suggested.subregion ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedLocationData, location]);

  // Pre-fill the contact number from the seller's saved one, on exactly the
  // same terms as the location above: once, and never over a value the draft
  // or the user already has. That's what makes it "type it once, edit it any
  // time" rather than a field that keeps snapping back to the old number.
  const phoneAutofilledRef = useRef(false);
  const { data: myPhoneData } = useQuery(MyContactPhoneDocument, {
    fetchPolicy: "cache-first",
  });
  useEffect(() => {
    if (phoneAutofilledRef.current) return;
    if (contactPhone) return; // draft or user already set one
    const saved = myPhoneData?.myContactPhone;
    if (!saved) return;
    phoneAutofilledRef.current = true;
    setContactPhone(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPhoneData, contactPhone]);

  // ── AI auto-fill: fills title, description, price and specs ─────────────────
  // The "killer feature". Whatever it returns is fully editable; the user can
  // clear/override anything. Two paths, both one-shot per draft:
  //
  //   • NATIVE (video AND image): runs INSTANTLY off frames snapshotted from
  //     the local file at pick-time (cached by draftId). Decoupled from the
  //     Mux/R2/Sharp uploads — extraction never waits for processing.
  //   • TikTok embed (no local file), or a resumed native draft whose local
  //     frames are gone: server-side extractDraftDetails once media is READY.
  const allReady =
    mediaItems.length > 0 && mediaItems.every((m) => m.status === "ready");

  const isNativeVideo = contentType === "video" && !tiktokEmbed;
  // Native drafts (video AND image) use the instant frame path — frames are
  // snapshotted from the local file at pick-time, so extraction never waits
  // for Mux or the R2/Sharp pipeline. Embeds have no local file.
  const isNativeDraft = !tiktokEmbed;

  // Soft cap on the visible "Writing with AI…" state. When it fires the
  // spinner stops and the user just types; the request keeps running in the
  // background and a late result still fills any fields left untouched.
  const EXTRACT_SOFT_TIMEOUT_MS = 12_000;

  // Current form values, readable at result-arrival time. With the soft
  // timeout an AI result can land AFTER the user started typing — the apply
  // guards must read what is on screen NOW, not the values captured when the
  // request started, or a late result would overwrite the user's own text.
  const formNowRef = useRef({
    title: "",
    caption: "",
    price: "",
    specsCount: 0,
    categoryId: null as string | null,
  });
  useEffect(() => {
    formNowRef.current = {
      title: titleValue,
      caption: watchCaption ?? "",
      price: priceInput,
      specsCount: specs.length,
      categoryId: categoryId ?? null,
    };
  });

  // Apply an extracted result to the form — only fills fields the user hasn't
  // already typed into. Shared by the frame and server paths.
  function applyExtracted(r: {
    title?: string | null;
    description?: string | null;
    price?: number | null;
    specs?: { key: string; value: string }[] | null;
    level1?: string | null;
    categoryId?: string | null;
  }) {
    const now = formNowRef.current;
    if (r.title && !now.title.trim()) setTitleValue(r.title);
    if (r.description && !now.caption.trim()) {
      setValue("caption", r.description);
    }
    if (r.price != null && !now.price.trim()) {
      setPriceInput(String(r.price));
    }
    const cleanSpecs = (r.specs ?? [])
      .map((s) => ({ key: s.key, value: s.value }))
      .filter((s) => s.key.trim() && s.value.trim());
    if (cleanSpecs.length > 0 && now.specsCount === 0) {
      setSpecs(cleanSpecs);
    }
    if (r.categoryId && !now.categoryId) {
      setCategory(r.categoryId, r.level1 ?? null, "ai");
    }
  }

  // Run one extraction with the soft-timeout UX. AI is an assist, never a
  // gate: the form stays fully editable throughout, and the spinner cannot
  // outlive the cap even if the request hangs.
  async function runExtraction(
    task: () => Promise<Parameters<typeof applyExtracted>[0] | null>,
  ) {
    setHasExtracted(true); // one-shot per draft
    setIsExtracting(true);
    const softTimer = setTimeout(
      () => setIsExtracting(false),
      EXTRACT_SOFT_TIMEOUT_MS,
    );
    try {
      const r = await task();
      if (r) applyExtracted(r);
    } catch (err) {
      console.error("[AI-extract] extraction error", err);
    } finally {
      clearTimeout(softTimer);
      setIsExtracting(false);
    }
  }

  // Server-side extraction fallback. Embeds (TikTok) always use it — the
  // server reads the embed's cover image. Native image drafts reach it only
  // when no locally-captured frames exist (resumed draft after a reload), and
  // then must wait for the CDN variants (allReady) as before.
  const canExtractServer =
    !!tiktokEmbed?.coverImageUrl ||
    (!isNativeVideo && allReady && frameExtractGaveUp);

  // ── Instant path (native video and images): extract from local frames ──────
  // One-shot per draft via a ref guard — NOT via effect state, so re-renders
  // (e.g. setIsExtracting) never re-enter or cancel the in-flight request. That
  // bug previously dropped the result and left the spinner stuck.
  // Re-runs when media is added, so picking a photo directly on this step
  // (MediaPicker) still triggers instant extraction.
  useEffect(() => {
    if (!draftId || !isNativeDraft || hasExtracted) return;
    if (frameExtractStartedRef.current === draftId) return;

    // Frames are captured asynchronously at pick-time; poll briefly for them.
    // Video frame capture can take a while on big files; image frames are
    // near-instant, so give up quickly and fall back to the server path.
    const startedAt = Date.now();
    const FRAME_WAIT_MS = isNativeVideo ? 15_000 : 5_000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const tryExtract = async () => {
      if (cancelled || frameExtractStartedRef.current === draftId) return;
      const frames = takeCachedVideoFrames(draftId);
      if (!frames || frames.length === 0) {
        if (Date.now() - startedAt < FRAME_WAIT_MS) {
          timer = setTimeout(tryExtract, 400);
        } else {
          setFrameExtractGaveUp(true); // resumed draft — server fallback may run
        }
        return;
      }

      frameExtractStartedRef.current = draftId; // lock in once frames are in hand
      await runExtraction(() => extractFromFrames(draftId, frames));
    };
    tryExtract();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, isNativeDraft, isNativeVideo, hasExtracted, mediaItems.length]);

  // ── Server path: TikTok embeds, and image drafts without local frames ──────
  useEffect(() => {
    if (!draftId || hasExtracted || isExtracting || !canExtractServer) return;
    if (frameExtractStartedRef.current === draftId) return;

    // Claim the shared one-shot lock so a frame poll that finds late-arriving
    // frames can never start a second, parallel extraction.
    frameExtractStartedRef.current = draftId;
    runExtraction(async () => {
      const { data } = await extractDetails({ variables: { id: draftId } });
      return data?.extractDraftDetails ?? null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canExtractServer, draftId, hasExtracted]);

  // ── Debounced autosave ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!draftId) return;
    const timer = setTimeout(() => {
      if (isDraftAutosaveBlocked(draftId)) return;
      void trackDraftAutosave(
        draftId,
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
              // Already canonical `254XXXXXXXXX` (PhoneInput only ever emits
              // that or null), so the server normalisation is a no-op here.
              contactPhone: contactPhone ?? undefined,
            },
          },
        }),
      ).catch(() => undefined);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleValue, watchCaption, tags, categoryId, location, contactPhone]);

  // ── Live-sync to store ─────────────────────────────────────────────────────
  // Mirror the local form state into the create store as the user types so the
  // desktop dialog's live preview panel updates in real time. Lightly debounced
  // to avoid a sessionStorage write per keystroke (the store is persisted).
  // Local state never reads back from the store after mount, so no loop.
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(titleValue);
      setCaption(watchCaption ?? "");
      setHashtags(tags);
      const parsed = priceInput.trim() ? Number(priceInput) : 0;
      if (Number.isFinite(parsed) && parsed >= 0) {
        setPrice(parsed, parsed === 0);
      }
    }, 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleValue, watchCaption, tags, priceInput]);

  // ── Form validity (drives the sticky Next button's disabled state) ──────────
  // Mirrors the synchronously-checkable rules in onNext: a non-empty title, a
  // location, at least one media item that isn't broken, and a valid price.
  // The async upload-still-attaching wait stays inside onNext.
  const parsedPriceValue = priceInput.trim() ? Number(priceInput) : 0;
  const priceValid = Number.isFinite(parsedPriceValue) && parsedPriceValue >= 0;
  const hasUsableMedia =
    mediaItems.length > 0 && !mediaItems.every((m) => m.status === "error");

  // AI extraction must NEVER gate progression: if the user has filled the form
  // (or the AI is slow/hung), they proceed. A late AI result only fills fields
  // that are still empty, so letting them move on loses nothing.
  const canProceed =
    !!draftId &&
    titleValue.trim().length > 0 &&
    !!location &&
    !!contactPhone &&
    !!categoryId &&
    hasUsableMedia &&
    priceValid;

  async function onNext(values: EditFormValues) {
    if (!draftId) {
      setError("Draft is not ready yet - please wait a moment and try again.");
      return;
    }
    setError(null);
    setTitleError(null);
    setLocationError(null);
    setPhoneError(null);
    setCategoryError(null);
    setMediaError(null);

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
      setMediaError("Upload is taking too long — please try again.");
      scrollFieldIntoView("media");
      return;
    }
    const attachedMedia = useCreateStore.getState().mediaItems;
    if (attachedMedia.length === 0) {
      setMediaError("Add at least one photo or video before continuing.");
      scrollFieldIntoView("media");
      return;
    }
    if (attachedMedia.every((m) => m.status === "error")) {
      setMediaError(
        "Your upload failed. Please go back and choose media again.",
      );
      scrollFieldIntoView("media");
      return;
    }
    if (!location) {
      setLocationError("Add a location before moving to settings.");
      scrollFieldIntoView("location");
      return;
    }

    // Null here means either empty or not yet a complete 9-digit number —
    // PhoneInput can't represent a half-typed number as valid.
    if (!contactPhone) {
      setPhoneError("Add a phone number so buyers can call you.");
      scrollFieldIntoView("phone");
      return;
    }

    if (!categoryId) {
      setCategoryError("Choose a category before moving to settings.");
      scrollFieldIntoView("category");
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
            price: { amount: parsedPrice, currency, negotiable },
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
        aria-invalid={!!titleError}
        className={`w-full overflow-hidden bg-transparent outline-none resize-none placeholder:text-base font-semibold leading-snug text-md caret-primary ${
          titleError ? "text-error" : "text-foreground"
        }`}
      />
      {titleError && (
        <span className="mt-1 text-xs font-medium text-error">
          {titleError}
        </span>
      )}
      <span className="mt-1 text-xs text-muted">
        {titleValue.length}/{MAX_TITLE}
      </span>
    </div>
  );

  const captionBlock = (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label className="text-sm font-medium text-muted">
          Detailed description (optional)
        </label>
        {isExtracting && (
          <span className="inline-flex items-center gap-1 text-xs text-primary">
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
        className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-base text-foreground caret-primary outline-none transition-all"
        maxLength={MAX_CAPTION}
      />
      <p className="mt-1 text-right text-xs text-muted">
        {watchCaption?.length ?? 0}/{MAX_CAPTION}
      </p>
    </div>
  );

  const tagsBlock = (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">
        Tags (optional)
      </label>
      <div
        className="flex min-h-11 flex-wrap gap-1.5 rounded-xl border border-border bg-surface px-3 py-2.5"
        onClick={() => document.getElementById("tag-input")?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="leading-none text-primary opacity-70"
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
          className="min-w-30 flex-1 bg-transparent text-base text-foreground caret-primary outline-none"
        />
      </div>
      <p className="mt-1 text-xs text-muted">
        Press Enter or comma to add a tag
      </p>
    </div>
  );

  const categoryBlock = (
    <div data-field="category">
      <label className="mb-1.5 block text-sm font-medium text-muted">
        Category
      </label>
      <CategoryPickerDrawer
        value={categoryId}
        fallbackLabel={categoryName}
        onChange={(id, name) => {
          setCategory(id, name, "manual");
          setCategoryError(null);
        }}
      />
      {categoryError && (
        <p className="mt-1.5 text-xs font-medium text-error">
          {categoryError}
        </p>
      )}
      {hasExtracted && categoryId && categorySource === "ai" && (
        <p className="mt-1.5 text-xs text-primary">AI suggestion</p>
      )}
    </div>
  );

  const priceBlock = (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">
        Price (optional)
      </label>
      <div className="flex items-center gap-3">
        <div className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3">
          <span className="text-sm font-medium text-muted">{currency}</span>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className="flex-1 bg-transparent text-md text-foreground outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setPriceInput("");
            setPrice(0, true);
          }}
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            !priceInput || priceInput === "0"
              ? "bg-primary-soft text-primary"
              : "bg-surface text-muted"
          }`}
        >
          Custom
        </button>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Set a price in {currency} or leave at 0 for custom
      </p>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-3">
        <div className="min-w-0 pr-4">
          <p className="text-sm font-medium text-foreground">Negotiable</p>
          <p className="text-xs text-muted">
            Buyers can discuss the price with you
          </p>
        </div>
        <Switch
          checked={negotiable}
          onCheckedChange={setNegotiable}
          aria-label="Mark price as negotiable"
        />
      </div>
    </div>
  );

  const locationBlock = (
    <div data-field="location">
      <label className="mb-1.5 block text-sm font-medium text-muted">
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
        <p className="mt-1.5 text-xs font-medium text-error">
          {locationError}
        </p>
      )}
      <p className="mt-1.5 text-xs text-muted">
        Helps buyers find your listing nearby
      </p>
    </div>
  );

  const phoneBlock = (
    <div data-field="phone">
      <label
        htmlFor="contact-phone"
        className="mb-1.5 block text-sm font-medium text-muted"
      >
        Phone number
      </label>
      <PhoneInput
        value={contactPhone}
        onChange={(stored) => {
          setContactPhone(stored);
          if (stored) setPhoneError(null);
        }}
        error={phoneError}
      />
    </div>
  );

  const specsBlock = (
    <SpecsEditor specs={specs} onChange={setSpecs} aiGenerated={hasExtracted} />
  );

  // Inline media validation message — rendered directly under the MediaPicker
  // (both mobile + desktop copies) so "add at least one photo" appears where the
  // media is, not buried in the bottom error bar.
  const mediaErrorBlock =
    mediaError && !hasUsableMedia ? (
      <p className="mt-2 text-xs font-medium text-error">{mediaError}</p>
    ) : null;

  const errorBlock = error ? (
    <div className="rounded-xl border border-[rgb(var(--color-error)/0.2)] bg-[rgb(var(--color-error)/0.08)] px-4 py-3 text-sm text-error">
      {error}
    </div>
  ) : null;

  // ── Desktop media preview panel (left column) ──────────────────────────────
  const desktopPreview = (
    <div className="hidden w-85 shrink-0 border-r border-border bg-surface md:flex md:flex-col md:gap-4 md:p-8 md:overflow-y-auto">
      <div data-field="media">
        <MediaPicker />
        {mediaErrorBlock}
      </div>

      {/* Title preview */}
      {titleValue && (
        <p className="line-clamp-2 text-center text-base font-semibold text-foreground">
          {titleValue}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-full flex-1">
      {/* ── Desktop left panel — media preview (standalone page only; the
             dialog shows the live preview panel instead) ── */}
      {!embedded && desktopPreview}

      {/* ── Right / mobile column — header + form ── */}
      <div className="flex flex-col flex-1 h-full min-h-0">
        {/* Header — sticky so it stays pinned while the form scrolls.
            Hidden when embedded: the dialog header owns back + stepper. */}
        {!embedded && (
          <div className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b border-border bg-background px-4 pt-4 pb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-muted"
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
            <h2 className="text-lg font-semibold text-foreground">Details</h2>
            {/* Spacer balances the back button so the title stays centred.
                The primary action now lives in the sticky bottom bar. */}
            <span aria-hidden className="w-12" />
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto pb-8 ${embedded ? "px-8" : "px-4"}`}
        >
          {/* Media picker (dotted picker / photo grid / video). On the
              standalone page desktop shows it in the left panel instead. */}
          <div
            className={`mb-5 mt-4 ${embedded ? "" : "md:hidden"}`}
            data-field="media"
          >
            <MediaPicker />
            {mediaErrorBlock}
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

          <Divider className="mt-4" />

          {/* Contact number — sits with Location as the "how buyers reach this
              listing" pair, and last so the form still opens on the fun part. */}
          <div className="mt-4">{phoneBlock}</div>

          {/* Error */}
          {error && <div className="mt-4">{errorBlock}</div>}
        </div>

        {/* Sticky bottom action bar — full-width Next, disabled until the
            required fields are valid. Replaces the old top-right button so the
            primary action sits where the thumb is. */}
        <div
          className={`sticky bottom-0 z-50 shrink-0 border-t border-border bg-background pt-3 pb-[calc(0.75rem+var(--safe-bottom))] ${embedded ? "px-8" : "px-4"}`}
        >
          <button
            onClick={handleSubmit(onNext)}
            // Always clickable (except while a save is in flight). Instead of a
            // dead/disabled button that hides WHAT is missing, onNext validates
            // each required field and surfaces a specific inline error so the
            // user knows exactly what to fix. `canProceed` only dims the button
            // as a soft hint that something still needs attention.
            disabled={advancing}
            aria-disabled={!canProceed}
            className={`h-12 w-full rounded-full bg-primary text-base font-semibold text-white transition-opacity disabled:cursor-not-allowed ${
              advancing ? "opacity-60" : canProceed ? "opacity-100" : "opacity-55"
            }`}
          >
            {advancing ? "Saving…" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Divider({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-border ${className}`} />;
}
