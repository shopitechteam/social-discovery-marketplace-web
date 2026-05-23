"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUserFieldsFragment } from "@/types/__generated__/graphql";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUserFieldsFragment | null;

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  setUser: (user: AuthUserFieldsFragment) => void;
  setAuth: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUserFieldsFragment;
  }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

function setAuthHintCookie(authenticated: boolean) {
  if (typeof document === "undefined") return;
  if (authenticated) {
    document.cookie = "shopi-auth-hint=1; path=/; max-age=31536000; samesite=lax";
  } else {
    document.cookie = "shopi-auth-hint=; path=/; max-age=0; samesite=lax";
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens({ accessToken, refreshToken }) {
        set({ accessToken, refreshToken });
        setAuthHintCookie(true);
      },

      setUser(user) {
        set({ user });
      },

      setAuth({ accessToken, refreshToken, user }) {
        set({ accessToken, refreshToken, user });
        setAuthHintCookie(true);
      },

      clearAuth() {
        set({ accessToken: null, refreshToken: null, user: null });
        setAuthHintCookie(false);
      },

      isAuthenticated() {
        return !!get().accessToken;
      },
    }),
    {
      name: "shopi-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync the hint cookie whenever the store is rehydrated from localStorage
        if (state) setAuthHintCookie(!!state.accessToken);
      },
    },
  ),
);
