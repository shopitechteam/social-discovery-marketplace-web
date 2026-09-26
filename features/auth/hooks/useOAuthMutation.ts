"use client";

import { useMutation } from "@apollo/client/react";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import {
  LoginWithGoogleDocument,
  LoginWithAppleDocument,
  LoginWithFacebookDocument,
} from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { getSuspendedAccountMessage } from "@/lib/apollo/suspended-account";
import { trackAuthSuccess, trackSignup } from "@/lib/analytics";
import { attributionInput } from "@/lib/attribution";
import { clearReferral, referralCodeInput } from "@/lib/referral";
import {
  authDestination,
  navigateAfterAuth,
} from "@/features/auth/lib/postAuthNavigate";
import {
  allowGoogleAutoSelect,
  initializeGoogleIdentity,
  loadGoogleIdentity,
  promptOneTap,
  registerCredentialHandler,
} from "@/features/auth/lib/googleIdentity";

// Auth screens mount their Google button more than once (layout copies,
// CSS-toggled by breakpoint). Google answers only one handler (see
// lib/googleIdentity), so its loading/error outcome is broadcast to every
// mounted button — whichever copy is the visible one shows it.
const googleUiSubscribers = new Set<{
  setLoading: (value: boolean) => void;
  onError: (message: string) => void;
}>();

function broadcastGoogleLoading(value: boolean) {
  googleUiSubscribers.forEach((sub) => sub.setLoading(value));
}

function broadcastGoogleError(message: string) {
  googleUiSubscribers.forEach((sub) => sub.onError(message));
}

export function useOAuthMutation(
  lang: string,
  from?: string,
  /** Which auth screen the user was on. Recorded as attribution context and
   *  used to label returning-user events; new-vs-returning itself now comes
   *  from the server's `isNewUser`, not from guessing at this. */
  surface: "register" | "welcome" | "login" | "one_tap" | "unknown" = "unknown",
  /**
   * Sign in where the user already is (Google One Tap on the feed) instead of
   * navigating to the post-auth destination. Viewer-scoped queries refetch on
   * their own (RefetchOnAuthChange).
   */
  { stayOnPage = false }: { stayOnPage?: boolean } = {},
) {
  // AttributionInput.surface is a free-text hint; "unknown" carries nothing.
  const surfaceForInput = surface === "unknown" ? undefined : surface;
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const [googleMutation, { loading: googleLoading }] = useMutation(
    LoginWithGoogleDocument,
    { errorPolicy: "all" },
  );
  const [appleMutation, { loading: appleLoading }] = useMutation(
    LoginWithAppleDocument,
    { errorPolicy: "all" },
  );
  const [facebookMutation, { loading: facebookLoading }] = useMutation(
    LoginWithFacebookDocument,
    { errorPolicy: "all" },
  );

  const mutationLoading = googleLoading || appleLoading || facebookLoading;

  function getDestination() {
    return authDestination(from, lang);
  }

  /**
   * Land on the destination after a social sign-in.
   *
   * This was a hard `window.location.assign`, to guarantee the freshly written
   * `shopi-auth-hint` cookie reached the proxy — a soft navigation that raced
   * the write got bounced back to auth. navigateAfterAuth keeps that guarantee
   * by checking the cookie is readable first and only then navigating
   * client-side, so the Apollo cache (and the feed position inside it) is no
   * longer thrown away on every sign-in.
   */
  function goToDestination() {
    navigateAfterAuth(router, getDestination());
  }

  function extractError(error: unknown): string {
    if (getSuspendedAccountMessage(error)) {
      useAuthStore.getState().clearAuth();
    }
    if (CombinedGraphQLErrors.is(error)) {
      return error.errors[0]?.message ?? "Something went wrong.";
    }
    if (error instanceof Error) return error.message;
    // Never String(obj) a plain object — that yields "[object Object]".
    if (typeof error === "object" && error !== null) {
      const o = error as { message?: unknown; error?: unknown };
      if (typeof o.message === "string") return o.message;
      if (typeof o.error === "string") return o.error;
    }
    if (typeof error === "string" && error) return error;
    return "Something went wrong.";
  }

  async function loginWithGoogle(idToken: string): Promise<string | null> {
    try {
      const { data, error } = await googleMutation({
        variables: {
          input: {
            idToken,
            attribution: attributionInput(surfaceForInput),
            // Recorded only if this call creates the account.
            referralCode: referralCodeInput(),
          },
        },
      });
      if (error) return extractError(error);
      if (!data?.loginWithGoogle) return "Something went wrong.";
      // The server tells us whether it created the account, so social signups
      // are no longer guessed from which screen the button was on.
      if (data.loginWithGoogle.isNewUser) {
        trackSignup("google");
        clearReferral();
      } else trackAuthSuccess("google", surface);
      setAuth(data.loginWithGoogle as Parameters<typeof setAuth>[0]);
      if (!stayOnPage) goToDestination();
      return null;
    } catch (err) {
      return extractError(err);
    }
  }

  async function loginWithApple(idToken: string): Promise<string | null> {
    try {
      const { data, error } = await appleMutation({
        variables: {
          input: {
            idToken,
            attribution: attributionInput(surfaceForInput),
            // Recorded only if this call creates the account.
            referralCode: referralCodeInput(),
          },
        },
      });
      if (error) return extractError(error);
      if (!data?.loginWithApple) return "Something went wrong.";
      // The server tells us whether it created the account, so social signups
      // are no longer guessed from which screen the button was on.
      if (data.loginWithApple.isNewUser) {
        trackSignup("apple");
        clearReferral();
      } else trackAuthSuccess("apple", surface);
      setAuth(data.loginWithApple as Parameters<typeof setAuth>[0]);
      goToDestination();
      return null;
    } catch (err) {
      return extractError(err);
    }
  }

  async function loginWithFacebook(idToken: string): Promise<string | null> {
    try {
      const { data, error } = await facebookMutation({
        variables: {
          input: {
            idToken,
            attribution: attributionInput(surfaceForInput),
            // Recorded only if this call creates the account.
            referralCode: referralCodeInput(),
          },
        },
      });
      if (error) return extractError(error);
      if (!data?.loginWithFacebook) return "Something went wrong.";
      // The server tells us whether it created the account, so social signups
      // are no longer guessed from which screen the button was on.
      if (data.loginWithFacebook.isNewUser) {
        trackSignup("facebook");
        clearReferral();
      } else trackAuthSuccess("facebook", surface);
      setAuth(data.loginWithFacebook as Parameters<typeof setAuth>[0]);
      goToDestination();
      return null;
    } catch (err) {
      return extractError(err);
    }
  }

  // ── Google Identity Services ───────────────────────────────────────────────
  // Google's own button, shown as Google draws it, is the tap target. It must
  // stay visible: Google ignores clicks on its button when it can't see it
  // (clickjacking protection), so the old invisible button under a
  // Shopi-styled one did nothing in browsers that report visibility. GIS is
  // set up once per page in lib/googleIdentity; this registers the screen's
  // credential handler, renders one button, and starts One Tap (auto sign-in
  // for returning users). Returns its cleanup at once — not after the script
  // loads — so a button that unmounts mid-load leaves nothing registered.
  const mountGoogleButton = useCallback(
    (
      container: HTMLElement,
      {
        onError,
        onReady,
        text,
        dark,
      }: {
        onError: (message: string) => void;
        onReady: () => void;
        text: "signin_with" | "signup_with" | "continue_with";
        dark: boolean;
      },
    ): (() => void) => {
      const subscriber = { setLoading, onError };
      googleUiSubscribers.add(subscriber);
      const unregister = registerCredentialHandler(async (response) => {
        if (!response.credential) {
          broadcastGoogleError(response.error ?? "Google sign-in cancelled.");
          return;
        }
        broadcastGoogleLoading(true);
        const error = await loginWithGoogle(response.credential);
        broadcastGoogleLoading(false);
        if (error) broadcastGoogleError(error);
        else allowGoogleAutoSelect();
      });
      let cancelled = false;
      const cleanup = () => {
        cancelled = true;
        googleUiSubscribers.delete(subscriber);
        unregister();
      };

      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        onError("Google client ID not configured.");
        return cleanup;
      }

      void (async () => {
        try {
          const id = await loadGoogleIdentity();
          if (cancelled) return;
          initializeGoogleIdentity(id, googleClientId);
          container.replaceChildren();
          id.renderButton(container, {
            type: "standard",
            theme: dark ? "filled_black" : "outline",
            size: "large",
            text,
            // Pill, like the auth screens' other buttons.
            shape: "pill",
            logo_alignment: "center",
            // Full width of the form; Google caps its button at 400px.
            width: Math.min(400, Math.max(200, Math.floor(container.getBoundingClientRect().width))),
          });
          onReady();
          promptOneTap(id);
        } catch (error) {
          if (!cancelled) {
            onError(error instanceof Error ? error.message : "Google sign-in failed to load.");
          }
        }
      })();

      return cleanup;
    },
    // loginWithGoogle closes over the current locale/destination.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, from],
  );

  // ── Apple Sign In JS (CDN) ─────────────────────────────────────────────────

  const triggerApple = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
      if (!appleClientId) { resolve("Apple client ID not configured."); return; }

      type AppleAuthResponse = { authorization?: { id_token?: string }; error?: string };
      type AppleIdType = { auth: { init: (c: object) => void; signIn: () => Promise<AppleAuthResponse> } };

      async function doSignIn() {
        const AppleID = (window as Window & { AppleID?: AppleIdType }).AppleID;
        if (!AppleID) { resolve("Apple sign-in failed to load."); return; }

        AppleID.auth.init({
          clientId: appleClientId,
          scope: "name email",
          redirectURI: window.location.origin + "/auth/apple-callback",
          usePopup: true,
        });

        try {
          const res = await AppleID.auth.signIn();
          const idToken = res.authorization?.id_token;
          if (!idToken) { resolve("Apple sign-in cancelled."); return; }
          const err = await loginWithApple(idToken);
          resolve(err);
        } catch (e: unknown) {
          // Apple's SDK rejects with a plain object like { error: "popup_closed_by_user" },
          // not an Error — so reading e.error (and treating cancellations as a no-op)
          // avoids surfacing "[object Object]" to the user.
          const code =
            e instanceof Error
              ? e.message
              : typeof e === "object" && e !== null && "error" in e
                ? String((e as { error: unknown }).error)
                : "";
          const cancelled =
            code === "popup_closed_by_user" || code === "user_cancelled_authorize";
          resolve(cancelled ? null : (code || "Apple sign-in failed. Please try again."));
        }
      }

      if ((window as Window & { AppleID?: unknown }).AppleID) {
        doSignIn();
      } else {
        const script = document.createElement("script");
        script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
        script.async = true;
        script.onload = doSignIn;
        script.onerror = () => resolve("Failed to load Apple sign-in.");
        document.head.appendChild(script);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, from]);

  // ── Facebook Login (JS SDK popup) ─────────────────────────────────────────

  const triggerFacebook = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      if (!appId) { resolve("Facebook app ID not configured."); return; }

      type FBLoginResponse = { authResponse?: { accessToken?: string }; status?: string };
      type FBType = {
        init: (opts: object) => void;
        login: (cb: (res: FBLoginResponse) => void, opts: object) => void;
      };

      async function doLogin() {
        const FB = (window as Window & { FB?: FBType }).FB;
        if (!FB) { resolve("Facebook sign-in failed to load."); return; }

        FB.login(async (res) => {
          const accessToken = res.authResponse?.accessToken;
          if (!accessToken) {
            resolve(res.status === "not_authorized" ? "Facebook login cancelled." : null);
            return;
          }
          const err = await loginWithFacebook(accessToken);
          resolve(err);
        }, { scope: "public_profile,email" });
      }

      if ((window as Window & { FB?: unknown }).FB) {
        doLogin();
      } else {
        // Load the FB SDK then init before login
        const script = document.createElement("script");
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.onload = () => {
          const FB = (window as Window & { FB?: FBType }).FB;
          if (!FB) { resolve("Facebook sign-in failed to load."); return; }
          FB.init({ appId, version: "v19.0", xfbml: false, cookie: false });
          doLogin();
        };
        script.onerror = () => resolve("Failed to load Facebook sign-in.");
        document.head.appendChild(script);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, from]);

  return {
    loginWithGoogle,
    loginWithApple,
    loginWithFacebook,
    mountGoogleButton,
    triggerApple,
    triggerFacebook,
    loading: loading || mutationLoading,
    setLoading,
  };
}
