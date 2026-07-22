"use client";

/**
 * PhoneInput — Kenyan mobile number entry with a fixed +254 prefix.
 *
 * The country code is chrome, not content: it renders as a static affix so the
 * seller can neither delete it nor type a second one. The field itself only
 * ever holds the 9 subscriber digits, which removes the whole class of
 * "+254254712…" bugs. Pasting a full number in any format still works —
 * `toSubscriberDigits` strips whatever prefix came with it.
 *
 * Reports the canonical `254XXXXXXXXX` (or null while incomplete) upward, so
 * the caller never has to parse anything.
 */

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import {
  formatSubscriberDigits,
  fromStoredPhone,
  toStoredPhone,
  toSubscriberDigits,
} from "@/lib/phone";

interface PhoneInputProps {
  /** Canonical stored number, e.g. `254712345678`. */
  value: string | null;
  /** Fires with the canonical number, or null while it's incomplete/invalid. */
  onChange: (stored: string | null) => void;
  error?: string | null;
  id?: string;
}

export function PhoneInput({ value, onChange, error, id = "contact-phone" }: PhoneInputProps) {
  // The in-progress digits live here, NOT in the parent. The parent only ever
  // holds the canonical number or null, so a half-typed "71" has no
  // representation up there — driving the field off that value directly would
  // echo back "" on every keystroke and make the input impossible to type in.
  const [digits, setDigits] = useState(() => fromStoredPhone(value));

  // Adopt the parent's value only when it genuinely disagrees with what we're
  // showing: initial hydration of a saved draft, or an external reset. While
  // the user is mid-number both sides are null, so this correctly stays out of
  // the way instead of clearing the field.
  useEffect(() => {
    if (value !== toStoredPhone(digits)) setDigits(fromStoredPhone(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(raw: string) {
    const next = toSubscriberDigits(raw);
    setDigits(next);
    onChange(toStoredPhone(next));
  }

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-surface px-3 transition-colors focus-within:border-primary ${
          error ? "border-error" : "border-border"
        }`}
      >
        <Phone className="h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
        {/* Static, unfocusable prefix — every listing is Kenyan, so the country
            code is never a choice the seller has to make (or can get wrong). */}
        <span className="shrink-0 select-none py-3 text-base font-medium text-muted">
          +254
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          // Prompts the number pad on mobile, where nearly all posting happens.
          pattern="[0-9 ]*"
          value={formatSubscriberDigits(digits)}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="712 345 678"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          className="w-full bg-transparent py-3 text-base text-foreground outline-none placeholder:text-muted/60"
        />
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-error">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          Buyers use this to call you about this listing
        </p>
      )}
    </div>
  );
}
