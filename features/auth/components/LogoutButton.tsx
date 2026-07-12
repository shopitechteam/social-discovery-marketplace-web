"use client";

import { useLogout } from "../hooks/useLogout";

export function LogoutButton({ lang }: { lang: string }) {
  const { logout, loading } = useLogout(lang);

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="px-6 py-2 bg-primary rounded-md text-white font-semibold text-sm active:opacity-75 transition-opacity disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
