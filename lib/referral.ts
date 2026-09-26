/**
 * Invite codes carried from an invite link to signup.
 *
 * Someone taps a seller's link (/invite/K7M2QX), looks around, and signs up —
 * maybe minutes later, maybe after an OAuth round trip, maybe on another day.
 * The code has to survive all of that, so it is kept in localStorage from the
 * moment the invite page loads and sent with the register / social-login
 * mutation. The server only records it if that call creates the account.
 *
 * First invite wins, for 30 days: whoever reached the seller first gets the
 * credit, and a later link cannot quietly take it over. After 30 days the
 * invite is stale and a new link replaces it.
 *
 * Kept apart from first-touch attribution (lib/attribution.ts) on purpose: that
 * already reads `?ref=` as a traffic source, and an invite is a person, not a
 * channel.
 */

const STORAGE_KEY = "shopi_referral_v1";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
/** Mirrors the server's alphabet: no 0/O/1/I. */
const CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

interface StoredReferral {
  code: string;
  capturedAt: string;
}

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
}

function readStored(): StoredReferral | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredReferral>;
    const code = normalizeReferralCode(parsed.code);
    const capturedAt = parsed.capturedAt ? Date.parse(parsed.capturedAt) : NaN;
    if (!code || Number.isNaN(capturedAt)) return null;
    if (Date.now() - capturedAt > MAX_AGE_MS) return null;
    return { code, capturedAt: parsed.capturedAt! };
  } catch {
    // Private mode / storage disabled / corrupt value — no invite on record.
    return null;
  }
}

/** Remember an invite code, unless a fresh one is already held. */
export function captureReferral(rawCode: string): void {
  if (typeof window === "undefined") return;
  const code = normalizeReferralCode(rawCode);
  if (!code || readStored()) return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ code, capturedAt: new Date().toISOString() } satisfies StoredReferral),
    );
  } catch {
    // Storage blocked: the seller can still type the code in after signing up.
  }
}

/** The held invite code, shaped for `referralCode` on the auth inputs. */
export function referralCodeInput(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return readStored()?.code;
}

/** Forget the invite once an account has been created with it. */
export function clearReferral(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
