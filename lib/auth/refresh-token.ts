"use client";

/**
 * Shared, deduped access-token refresh.
 *
 * Used by both the Apollo error link (GraphQL UNAUTHENTICATED → retry) and the
 * Socket.IO client (handshake denied for an expired JWT → refresh → reconnect),
 * so a burst of expired requests triggers exactly one refresh call — in this
 * tab and across tabs.
 *
 * This is the only place that decides a session is over: it signs the user
 * out when the API rejects the refresh token, and never for a failed attempt
 * (offline, server down, rate limited), which a later request will retry.
 */

import type { RefreshTokenMutation } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";

// What the API answers when the session itself is over: logged out elsewhere,
// password changed, expired, or the account suspended.
const SESSION_REJECTED_CODES = new Set(["UNAUTHORIZED", "UNAUTHENTICATED", "FORBIDDEN"]);

function isSessionRejected(errors: unknown[] | undefined): boolean {
  return (errors ?? []).some((error) =>
    SESSION_REJECTED_CODES.has(
      (error as { extensions?: { code?: string } })?.extensions?.code ?? "",
    ),
  );
}

// Tracks an in-flight refresh so concurrent callers share a single request
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
            mutation RefreshToken($input: RefreshTokenInput!) {
              refreshToken(input: $input) {
                accessToken
                refreshToken
                user {
                  id
                  email
                  role
                  isVerified
                  profile { firstName lastName avatar }
                }
              }
            }
          `,
        variables: { input: { refreshToken } },
      }),
    });

    const json = (await res.json()) as {
      data?: RefreshTokenMutation;
      errors?: unknown[];
    };

    if (json.errors || !json.data?.refreshToken) {
      if (isSessionRejected(json.errors)) useAuthStore.getState().clearAuth();
      return null;
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    } = json.data.refreshToken;
    useAuthStore
      .getState()
      .setAuth({ accessToken, refreshToken: newRefreshToken, user });
    return accessToken;
  } catch {
    return null;
  }
}

/**
 * Runs `fn` holding a lock shared by every open tab, so two tabs never spend
 * the same refresh token at once. Browsers without Web Locks just run it.
 */
async function withCrossTabLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !navigator.locks) return fn();
  return navigator.locks.request("shopi-auth-refresh", () => fn());
}

async function refreshUnlessAnotherTabDid(staleRefreshToken: string): Promise<string | null> {
  // Another tab may have refreshed while this one waited for the lock — use
  // its tokens rather than spending the old refresh token again.
  await useAuthStore.persist.rehydrate();
  const { accessToken, refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;
  if (refreshToken !== staleRefreshToken && accessToken) return accessToken;
  return doRefresh(refreshToken);
}

/**
 * Refresh the access token using the stored refresh token and write the new
 * session into the auth store. Resolves with the fresh access token, or null
 * when there is none — in which case the store is already signed out if the
 * session was rejected, and left alone if the refresh merely failed.
 */
export function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return Promise.resolve(null);

  if (!refreshPromise) {
    refreshPromise = withCrossTabLock(() => refreshUnlessAnotherTabDid(refreshToken)).finally(
      () => {
        refreshPromise = null;
      },
    );
  }
  return refreshPromise;
}
