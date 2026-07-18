"use client";

import { useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { LogoutDocument } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";

/** Revokes the refresh token, clears local auth state and returns to the feed. */
export function useLogout(lang: string) {
  // Primitive selector — stable reference, no object allocation
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [logoutMutation, { loading }] = useMutation(LogoutDocument, {
    errorPolicy: "all",
  });

  const logout = useCallback(async () => {
    if (refreshToken) {
      await logoutMutation({ variables: { refreshToken } });
    }
    useAuthStore.getState().clearAuth();
    window.location.href = `/${lang}/feed`;
  }, [refreshToken, logoutMutation, lang]);

  return { logout, loading };
}
