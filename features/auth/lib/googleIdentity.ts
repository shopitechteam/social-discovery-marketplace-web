"use client";

/**
 * Google Identity Services, owned once per page.
 *
 * GIS is a page-global singleton: `google.accounts.id.initialize()` configures
 * the whole page, and only buttons rendered under the *last* call are sure to
 * work. The auth screens mount their Google button several times at once
 * (layout copies, CSS-toggled by breakpoint), and each copy used to call
 * initialize() itself — so whenever the visible button wasn't the last to
 * initialize (first load vs. client-side navigation vs. Strict Mode), a tap on
 * it did nothing at all. That's the "sometimes Google doesn't even fire" bug.
 *
 * Here GIS is initialized exactly once, with a callback that hands each
 * credential to the most recently mounted handler. Buttons only render.
 *
 * It also runs One Tap with auto-select on the auth screens: a returning user
 * who already chose Google for Shopi, and is signed in to Google, is signed in
 * without tapping. Logging out turns that off (see disableGoogleAutoSelect) —
 * otherwise the login screen would sign them straight back in.
 */

const GIS_SRC = "https://accounts.google.com/gsi/client";
/** Generous: this is the whole script over a phone network. */
const LOAD_TIMEOUT_MS = 15_000;
const AUTO_SELECT_OFF_KEY = "shopi-google-auto-select-off";

export interface GoogleCredentialResponse {
  credential?: string;
  error?: string;
}

export interface GoogleId {
  initialize(config: object): void;
  renderButton(element: HTMLElement, options: object): void;
  prompt(): void;
  cancel(): void;
  disableAutoSelect(): void;
}

/**
 * `window.google` alone proves nothing — Google Maps and other Google scripts
 * define it too. Only `accounts.id` means GIS is here.
 */
function readyGoogleId(): GoogleId | null {
  const google = (window as unknown as { google?: { accounts?: { id?: GoogleId } } }).google;
  return google?.accounts?.id ?? null;
}

function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram|Line\/|TikTok|Snapchat|; wv\)/i.test(navigator.userAgent);
}

function loadErrorMessage(): string {
  return isInAppBrowser()
    ? "Google sign-in isn't available in this in-app browser. Use email below, or open Shopi in your browser."
    : "Couldn't load Google sign-in. Check your connection and try again.";
}

let quieted = false;

/**
 * GIS reports routine One Tap outcomes as console errors — "[GSI_LOGGER]:
 * FedCM get() rejects with AbortError" when a prompt is closed, NetworkError
 * when there's no Google account to offer — and its `log_level` option can't
 * go above "warn", so they can't be switched off. Next's dev overlay shows
 * every console error as an app error. In development only, these are logged
 * as warnings instead: still in the console, no longer flagged as a bug.
 */
function quietGoogleLogsInDevelopment(): void {
  if (quieted || process.env.NODE_ENV !== "development") return;
  quieted = true;
  const error = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("[GSI_LOGGER]")) {
      console.warn(...args);
      return;
    }
    error(...args);
  };
}

let loading: Promise<GoogleId> | null = null;

/** Load the GIS script once. A failed load can be retried by calling again. */
export function loadGoogleIdentity(): Promise<GoogleId> {
  quietGoogleLogsInDevelopment();
  const ready = readyGoogleId();
  if (ready) return Promise.resolve(ready);
  if (loading) return loading;

  loading = new Promise<GoogleId>((resolve, reject) => {
    // A previous failed attempt's tag would never fire again.
    document
      .querySelectorAll(`script[src="${GIS_SRC}"][data-shopi-load-state="error"]`)
      .forEach((tag) => tag.remove());

    let script = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    const tag = script;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      const id = readyGoogleId();
      if (id) {
        tag.dataset.shopiLoadState = "loaded";
        resolve(id);
      } else {
        tag.dataset.shopiLoadState = "error";
        loading = null;
        reject(new Error(loadErrorMessage()));
      }
    };
    const timer = window.setTimeout(finish, LOAD_TIMEOUT_MS);
    tag.addEventListener("load", finish, { once: true });
    tag.addEventListener("error", finish, { once: true });
  });
  return loading;
}

// ── One initialize, many buttons ──────────────────────────────────────────────

type CredentialHandler = (response: GoogleCredentialResponse) => void;
const handlers: CredentialHandler[] = [];
let initialized = false;
let prompted = false;
let leaveTimer: number | undefined;

/**
 * How long the auth screens may be without a mounted button before One Tap is
 * cancelled. A Strict Mode remount or a login ↔ register switch re-registers
 * well within it, so One Tap carries on instead of being cancelled and
 * re-prompted — which, while the first FedCM request was still outstanding,
 * failed with "Only one navigator.credentials.get request may be outstanding".
 */
const LEAVE_GRACE_MS = 1_000;

/**
 * Receive Google's credential while mounted. The newest handler wins — every
 * button on one screen shares the same destination, and a screen being left
 * has already unregistered.
 */
export function registerCredentialHandler(handler: CredentialHandler): () => void {
  window.clearTimeout(leaveTimer);
  handlers.push(handler);
  return () => {
    const i = handlers.lastIndexOf(handler);
    if (i !== -1) handlers.splice(i, 1);
    if (handlers.length > 0) return;
    // Really left the auth screens (nothing re-mounted in the grace period):
    // close any One Tap still showing, and prompt afresh next visit.
    window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(() => {
      if (handlers.length > 0) return;
      prompted = false;
      readyGoogleId()?.cancel();
    }, LEAVE_GRACE_MS);
  };
}

export function initializeGoogleIdentity(id: GoogleId, clientId: string): void {
  if (initialized) return;
  initialized = true;
  id.initialize({
    client_id: clientId,
    callback: (response: GoogleCredentialResponse) => handlers[handlers.length - 1]?.(response),
    ux_mode: "popup",
    auto_select: googleAutoSelectAllowed(),
    // One Tap stays until it's closed or used. Cancelling it on any tap
    // outside meant scrolling the feed dismissed it before it could be read
    // (and logged a FedCM AbortError each time). The browser draws the prompt
    // with its own close control.
    cancel_on_tap_outside: false,
    // One Tap on Safari / iOS (ITP browsers).
    itp_support: true,
    // One Tap goes through FedCM (Chrome requires it). The button must not:
    // a FedCM button request made while One Tap's is outstanding is rejected
    // ("Only one navigator.credentials.get request may be outstanding") and
    // the tap does nothing. The button's classic popup flow never touches
    // navigator.credentials, so it works whatever One Tap is doing.
    use_fedcm_for_prompt: true,
    use_fedcm_for_button: false,
  });
}

/**
 * One Tap, once per visit to the auth screens. With auto-select allowed and a
 * single Google account that has used Shopi before, Google signs the user in
 * straight away; otherwise it offers the account to confirm with one tap.
 * Dismissals are rate-limited by the browser/Google, so it never nags.
 */
export function promptOneTap(id: GoogleId): void {
  if (prompted) return;
  prompted = true;
  id.prompt();
}

// ── Auto-select after logout ──────────────────────────────────────────────────

export function googleAutoSelectAllowed(): boolean {
  try {
    return window.localStorage.getItem(AUTO_SELECT_OFF_KEY) !== "1";
  } catch {
    return true;
  }
}

/**
 * The user signed out (or deleted their account) on purpose: don't sign them
 * straight back in. Remembered across reloads — GIS usually isn't loaded on
 * the page they sign out from — and applied to GIS directly when it is.
 */
export function disableGoogleAutoSelect(): void {
  try {
    window.localStorage.setItem(AUTO_SELECT_OFF_KEY, "1");
  } catch {
    // Private mode: GIS's own flag below still covers this page.
  }
  readyGoogleId()?.disableAutoSelect();
}

/** They chose Google again — auto sign-in is welcome from here on. */
export function allowGoogleAutoSelect(): void {
  try {
    window.localStorage.removeItem(AUTO_SELECT_OFF_KEY);
  } catch {
    // Nothing to undo.
  }
}
