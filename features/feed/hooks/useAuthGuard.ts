"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

const INTENT_KEY = "shopi-auth-intent";

export interface AuthIntent {
  scrollY: number;
  contentId?: string;
  action?: "like" | "comment";
}

/**
 * Save the current scroll position + what the user was trying to do,
 * then redirect to the auth-welcome screen with ?from= pointing back here.
 *
 * On return from auth, FeedGrid reads and restores the intent.
 */
export function useAuthGuard(lang: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const router = useRouter();
  const pathname = usePathname();

  function requireAuth(intent?: Omit<AuthIntent, "scrollY">): boolean {
    if (isAuthenticated) return true;

    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const data: AuthIntent = { scrollY, ...intent };
    sessionStorage.setItem(INTENT_KEY, JSON.stringify(data));

    const from = encodeURIComponent(pathname);
    router.push(`/${lang}/auth/auth-welcome?from=${from}`);
    return false;
  }

  return { isAuthenticated, requireAuth };
}

/** Called by FeedGrid on mount to check if we're returning from auth. */
export function consumeAuthIntent(): AuthIntent | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(INTENT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(INTENT_KEY);
  try {
    return JSON.parse(raw) as AuthIntent;
  } catch {
    return null;
  }
}
