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

  function extractError(error: unknown): string {
    if (CombinedGraphQLErrors.is(error)) {
      return error.errors[0]?.message ?? "Something went wrong.";
    }
    if (error instanceof Error) return error.message;
    return "Something went wrong.";
  }

  async function loginWithGoogle(idToken: string): Promise<string | null> {
    try {
      const { data, error } = await googleMutation({ variables: { input: { idToken } } });
      if (error) return extractError(error);
      if (!data?.loginWithGoogle) return "Something went wrong.";
      setAuth(data.loginWithGoogle as Parameters<typeof setAuth>[0]);
      router.replace(getDestination());
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
      router.replace(getDestination());
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
      router.replace(getDestination());
      return null;
    } catch (err) {
      return extractError(err);
    }
  }

  // ── Google Identity Services (no npm package needed) ──────────────────────

  const triggerGoogle = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!googleClientId) { resolve("Google client ID not configured."); return; }

      type GIS = {
        accounts: {
          id: {
            initialize: (c: object) => void;
            prompt: (cb?: (n: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; isDismissedMoment: () => boolean; getMomentType: () => string; getNotDisplayedReason: () => string; getSkippedReason: () => string }) => void) => void;
            renderButton: (el: HTMLElement, opts: object) => void;
          };
        };
      };

      function initAndPrompt() {
        const g = (window as unknown as { google?: GIS }).google;
        if (!g) { resolve("Google sign-in failed to load."); return; }

        // Always re-initialize so the callback closure is fresh
        g.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string; error?: string }) => {
            if (!response.credential) {
              resolve(response.error ?? "Google sign-in cancelled.");
              return;
            }
            const err = await loginWithGoogle(response.credential);
            resolve(err);
          },
          ux_mode: "popup",
          cancel_on_tap_outside: false,
        });

        g.accounts.id.prompt((notification) => {
          // One Tap was suppressed (dismissed too many times, browser blocked, etc.)
          // Fall back to a rendered button flow is not possible in popup mode,
          // so resolve with null to unblock the UI — user can retry.
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const reason = notification.isNotDisplayed()
              ? notification.getNotDisplayedReason()
              : notification.getSkippedReason();
            // "suppressed_by_user" / "opt_out_or_no_session" etc — not a real error
            const silentReasons = ["suppressed_by_user", "opt_out_or_no_session", "user_cancel", "tap_outside", "issuing_failed"];
            if (silentReasons.includes(reason)) {
              resolve(null);
            } else {
              resolve("Google sign-in was blocked by browser. Please try again.");
            }
          }
        });
      }

      if ((window as Window & { google?: unknown }).google) {
        initAndPrompt();
      } else {
        // Prevent duplicate script injection
        if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = initAndPrompt;
          script.onerror = () => resolve("Failed to load Google sign-in.");
          document.head.appendChild(script);
        } else {
          // Script tag exists but google not on window yet — wait briefly
          const wait = setInterval(() => {
            if ((window as Window & { google?: unknown }).google) {
              clearInterval(wait);
              initAndPrompt();
            }
          }, 100);
          setTimeout(() => { clearInterval(wait); resolve("Google sign-in timed out. Please try again."); }, 5000);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, from]);

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
          const msg = e instanceof Error ? e.message : String(e);
          resolve(msg === "popup_closed_by_user" ? null : (msg || "Apple sign-in failed."));
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
    triggerGoogle,
    triggerApple,
    triggerFacebook,
    loading: loading || mutationLoading,
    setLoading,
  };
}
