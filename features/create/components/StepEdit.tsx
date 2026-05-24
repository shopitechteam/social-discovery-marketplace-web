"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useCreateStore } from "@/stores/create";
import {
  AutosaveDraftDocument,
  AdvanceDraftStepDocument,
} from "@/types/__generated__/graphql";

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

export function StepEdit({ onBack }: { onBack?: () => void }) {
  const {
    draftId,
    title,
    caption,
    hashtags,
    price,
    currency,
    isFree,
    mediaItems,
    setTitle,
    setCaption,
    setHashtags,
    setPrice,
    setStep,
    setError,
    error,
  } = useCreateStore();

  const [autosaveMutation] = useMutation(AutosaveDraftDocument);
  const [advanceStep, { loading: advancing }] = useMutation(
    AdvanceDraftStepDocument,
  );

  // ── Title (autosize textarea) ──────────────────────────────────────────────
  const [titleValue, setTitleValue] = useState(title);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    autosize(titleRef.current);
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
  const { register, watch, handleSubmit } = useForm<EditFormValues>({
    defaultValues: { caption },
    mode: "onChange",
  });
  const watchCaption = watch("caption", caption);

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
          },
        },
      }).catch(() => undefined);
    }, 800);
    return () => clearTimeout(timer);
  }, [titleValue, watchCaption, tags]);

  async function onNext(values: EditFormValues) {
    if (!draftId) return;
    setError(null);

    const parsedPrice = priceInput.trim() ? parseFloat(priceInput) : 0;
    const finalIsFree = parsedPrice === 0;
    setPrice(parsedPrice, finalIsFree);

    // Final autosave (including price)
    await autosaveMutation({
      variables: {
        id: draftId,
        input: {
          title: titleValue,
          caption: values.caption,
          hashtags: tags,
          price: { amount: parsedPrice, currency, negotiable: false },
        },
      },
    });

    setTitle(titleValue);
    setCaption(values.caption);
    setHashtags(tags);

    const { error: stepError } = await advanceStep({
      variables: { id: draftId },
    });
    if (stepError) {
      setError(stepError.message ?? "Could not advance step");
      return;
    }
    setStep("options");
  }

  // Show first media item immediately (blob) regardless of upload status
  const cover = mediaItems[0];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
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
        {/* Thumbnail + title */}
        <div className="flex gap-3 mb-5">
          <div
            className="rounded-xl overflow-hidden flex-shrink-0 relative"
            style={{
              width: 72,
              height: 96,
              backgroundColor: "rgb(var(--color-bg-subtle))",
            }}
          >
            {cover &&
              (cover.type === "video" ? (
                <video
                  src={cover.localUri}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={cover.thumbnailUrl ?? cover.localUri}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={cover.localUri.startsWith("blob:")}
                />
              ))}

            {/* Processing overlay — scoped to the thumbnail only */}
            {cover && cover.status !== "ready" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
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
                    {cover.status === "uploading" ? "UPLOADING" : "PROCESSING"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Auto-growing title textarea */}
          <div className="flex-1 flex flex-col justify-start pt-1">
            <textarea
              ref={titleRef}
              value={titleValue}
              onChange={(e) => {
                if (e.target.value.length <= MAX_TITLE)
                  setTitleValue(e.target.value);
              }}
              placeholder="Add a caption…"
              rows={1}
              className="w-full bg-transparent outline-none resize-none placeholder:text-base font-semibold leading-snug"
              style={{
                fontSize: "var(--text-md)",
                color: "rgb(var(--color-text))",
                caretColor: "rgb(var(--brand-primary))",
                overflow: "hidden",
              }}
            />
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
        </div>

        <Divider />

        {/* Caption */}
        <div className="mt-4">
          <label
            className="block mb-1.5 font-medium"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            Detailed description (optional)
          </label>
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

        <Divider className="mt-4" />

        {/* Tags chip input */}
        <div className="mt-4">
          <label
            className="block mb-1.5 font-medium"
            style={{
              fontSize: "var(--text-sm)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            Tags
          </label>
          {/* Chip container */}
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

        <Divider className="mt-4" />

        {/* Price */}
        <div className="mt-4">
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

        {/* Error */}
        {error && (
          <div
            className="mt-4 rounded-xl px-4 py-3"
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
