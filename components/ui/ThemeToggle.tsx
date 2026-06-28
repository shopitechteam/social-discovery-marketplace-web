"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Only render after mount — prevents SSR/client mismatch
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Switch
        disabled
        aria-label="Toggle dark mode"
        className="opacity-0"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="inline-flex items-center gap-2">
      <Sun
        size={14}
        strokeWidth={2.1}
        style={{ color: isDark ? "rgb(var(--color-text-placeholder))" : "rgb(var(--brand-secondary))" }}
        aria-hidden
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <Moon
        size={14}
        strokeWidth={2.1}
        style={{ color: isDark ? "rgb(var(--brand-accent))" : "rgb(var(--color-text-placeholder))" }}
        aria-hidden
      />
    </div>
  );
}
