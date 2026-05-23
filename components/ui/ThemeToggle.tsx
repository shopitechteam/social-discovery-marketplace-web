"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/stores/theme";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Only render after mount — prevents SSR/client mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <p style={{ fontSize: "var(--text-sm)", color: "rgb(var(--color-text-muted))" }}>
        Current theme: <strong>{resolvedTheme}</strong>
      </p>

      <button
        onClick={toggleTheme}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 24px",
          borderRadius: "var(--radius-full)",
          border: "1px solid rgb(var(--color-border))",
          background: "rgb(var(--color-bg-elevated))",
          color: "rgb(var(--color-text))",
          fontSize: "var(--text-base)",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "var(--shadow-sm)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ fontSize: 20 }}>{isDark ? "☀️" : "🌙"}</span>
        {isDark ? "Switch to Light" : "Switch to Dark"}
      </button>
    </>
  );
}
