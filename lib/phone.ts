/**
 * Kenyan phone helpers — the client-side mirror of the API's @utils/phone.
 *
 * Both sides must agree on the canonical stored form (`254` + 9 digits) so a
 * number round-trips through autosave unchanged. The API re-validates
 * everything; this exists to give the seller an inline error as they type
 * rather than after a failed save.
 */

/** Canonical stored form, e.g. `254712345678`. */
const KE_MOBILE = /^254(?:7|1)\d{8}$/;

/** The 9 subscriber digits the user actually types, after the fixed +254. */
const KE_SUBSCRIBER = /^(?:7|1)\d{8}$/;

/**
 * Reduce whatever the user typed or pasted to the 9 subscriber digits that sit
 * after +254. Handles a pasted full number (+254712345678, 0712345678,
 * 254712345678) so paste doesn't produce a doubled country code — the single
 * most common way this field goes wrong.
 */
export function toSubscriberDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00254")) digits = digits.slice(5);
  else if (digits.startsWith("254")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

/** Canonical `254XXXXXXXXX`, or null when the 9 digits aren't a valid mobile. */
export function toStoredPhone(subscriberDigits: string): string | null {
  const digits = subscriberDigits.replace(/\D/g, "");
  if (!KE_SUBSCRIBER.test(digits)) return null;
  return `254${digits}`;
}

/** Pull the 9 subscriber digits back out of a stored `254XXXXXXXXX`. */
export function fromStoredPhone(stored: string | null | undefined): string {
  if (!stored) return "";
  return toSubscriberDigits(stored);
}

/** Group as `712 345 678` for readability while typing. */
export function formatSubscriberDigits(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 9);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean);
  return parts.join(" ");
}

/** Display form for a stored number: `+254 712 345 678`. */
export function formatStoredPhone(stored: string | null | undefined): string {
  if (!stored || !KE_MOBILE.test(stored)) return "";
  return `+254 ${formatSubscriberDigits(stored.slice(3))}`;
}

/** `tel:` href — no spaces, dialers mishandle them. */
export function telHref(stored: string): string {
  return `tel:+${stored.replace(/\D/g, "")}`;
}
