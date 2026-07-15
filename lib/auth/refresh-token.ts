"use client";

/**
 * Shared, deduped access-token refresh.
 *
 * Used by both the Apollo error link (GraphQL UNAUTHENTICATED → retry) and the
 * Socket.IO client (handshake denied for an expired JWT → refresh → reconnect),
 * so a burst of expired requests triggers exactly one refresh call.
 */

import type { RefreshTokenMutation } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";

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

    if (json.errors || !json.data?.refreshToken) return null;

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
 * Refresh the access token using the stored refresh token and write the new
 * session into the auth store. Resolves with the fresh access token, or null
 * when there is no refresh token or the refresh failed — callers decide
 * whether a null result should clear the session.
 */
export function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return Promise.resolve(null);

  if (!refreshPromise) {
    refreshPromise = doRefresh(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
