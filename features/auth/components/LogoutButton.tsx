"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { LogoutDocument } from "@/types/__generated__/graphql";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";

export function LogoutButton({ lang }: { lang: string }) {
  const router = useRouter();
  // Primitive selector — stable reference, no object allocation
  const refreshToken = useAuthStore((s) => s.refreshToken);
  // Pull action directly from store instance — never changes, no subscription needed
  const clearAuth = useAuthStore.getState().clearAuth;
  const [logout, { loading }] = useMutation(LogoutDocument, {
    errorPolicy: "all",
  });
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    if (refreshToken) {
      await logout({ variables: { refreshToken } });
    }
    clearAuth();
    router.replace(`/${lang}/feed`);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="px-6 py-3 rounded-2xl bg-error text-white font-semibold text-sm active:opacity-75 transition-opacity disabled:opacity-50"
      >
        {loading ? "Signing out…" : "Sign out"}
      </button>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
