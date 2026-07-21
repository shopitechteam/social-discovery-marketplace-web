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

export function useOAuthMutation(lang: string, from?: string) {
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
    return from && from.startsWith("/") ? from : `/${lang}/feed`;
  }

  // After a successful social login we MUST land on the destination — every time.
  //
  // Why a hard navigation instead of router.replace(): the destination is often a
  // proxy-guarded route (see proxy.ts) that checks the "shopi-auth-hint" cookie.
  // setAuth() writes that cookie via document.cookie, but a soft client navigation
  // can fire its RSC request before the cookie write is committed/sent — so the
  // proxy sees no session and bounces back to auth-welcome (the "reload fixes it"
  // bug). A full-document navigation guarantees the freshly-set cookie is sent with
  // the request, so the proxy always sees the session. It also gives the server a
  // clean render with the new auth state (equivalent to the manual reload).
  function goToDestination() {
    const dest = getDestination();
    if (typeof window !== "undefined") {
      window.location.assign(dest);
    } else {
      router.replace(dest);
    }
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
      const { data, error } = await googleMutation({ variables: { input: { idToken } } });
      if (error) return extractError(error);
      if (!data?.loginWithGoogle) return "Something went wrong.";
      setAuth(data.loginWithGoogle as Parameters<typeof setAuth>[0]);
      goToDestination();
      return null;
    } catch (err) {
      return extractError(err);
    }
  }

  async function loginWithApple(idToken: string): Promise<string | null> {
    try {
      const { data, error } = await appleMutation({ variables: { input: { idToken } } });
      if (error) return extractError(error);
      if (!data?.loginWithApple) return "Something went wrong.";
      setAuth(data.loginWithApple as Parameters<typeof setAuth>[0]);
      goToDestination();
      return null;
    } catch (err) {
      return extractError(err);
    }
  }

  async function loginWithFacebook(idToken: string): Promise<string | null> {
    try {
      const { data, error } = await facebookMutation({ variables: { input: { idToken } } });
      if (error) return extractError(error);
      if (!data?.loginWithFacebook) return "Something went wrong.";
      setAuth(data.loginWithFacebook as Parameters<typeof setAuth>[0]);
      goToDestination();
      return null;
    } catch (err) {
      return extractError(err);
    }
  }

  // ── Google Identity Services ───────────────────────────────────────────────
  // Installed PWAs are stricter about popup blockers. The old approach rendered
  // a hidden GIS button after a Shopi click, then called `.click()` on it. That
  // loses the trusted user gesture while the SDK is loading. Render Google's
  // button directly instead, so the user's tap opens the GIS popup itself.
  const renderGoogleButton = useCallback(
    async (
      container: HTMLElement,
      onError: (message: string) => void,
    ): Promise<void> => {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        onError("Google client ID not configured.");
        return;
      }

      type GIS = {
        accounts: {
          id: {
            initialize: (config: object) => void;
            renderButton: (element: HTMLElement, options: object) => void;
          };
        };
      };

      const getGoogle = (): Promise<GIS> =>
        new Promise((resolve, reject) => {
          const existing = (window as unknown as { google?: GIS }).google;
          if (existing) {
            resolve(existing);
            return;
          }

          const selector = 'script[src="https://accounts.google.com/gsi/client"]';
          const script = document.querySelector<HTMLScriptElement>(selector)
            ?? document.createElement("script");
          const resolveGoogle = () => {
            const google = (window as unknown as { google?: GIS }).google;
            if (google) resolve(google);
            else reject(new Error("Google sign-in failed to load."));
          };

          if (!script.parentNode) {
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.addEventListener("load", resolveGoogle, { once: true });
            script.addEventListener(
              "error",
              () => reject(new Error("Failed to load Google sign-in.")),
              { once: true },
            );
            document.head.appendChild(script);
          } else {
            script.addEventListener("load", resolveGoogle, { once: true });
            script.addEventListener(
              "error",
              () => reject(new Error("Failed to load Google sign-in.")),
              { once: true },
            );
          }
        });

      try {
        const google = await getGoogle();
        container.replaceChildren();
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string; error?: string }) => {
            if (!response.credential) {
              onError(response.error ?? "Google sign-in cancelled.");
              return;
            }
            setLoading(true);
            const error = await loginWithGoogle(response.credential);
            setLoading(false);
            if (error) onError(error);
          },
          ux_mode: "popup",
          cancel_on_tap_outside: true,
          use_fedcm_for_button: true,
        });
        google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: Math.max(260, Math.floor(container.getBoundingClientRect().width)),
        });
      } catch (error) {
        onError(error instanceof Error ? error.message : "Google sign-in failed to load.");
      }
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
    renderGoogleButton,
    triggerApple,
    triggerFacebook,
    loading: loading || mutationLoading,
    setLoading,
  };
}
