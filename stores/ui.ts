import { create } from "zustand";

interface UiState {
  /**
   * When true, the mobile BottomNav renders with a `hidden` class instead of
   * being unmounted. A screen that owns the full viewport (e.g. the create-mode
   * chooser) sets this on mount and clears it on unmount. Toggling a class —
   * rather than conditionally mounting the nav — keeps it in the tree, so there
   * is no remount flash when the screen appears or goes away.
   */
  bottomNavHidden: boolean;
  setBottomNavHidden: (hidden: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  bottomNavHidden: false,
  setBottomNavHidden: (bottomNavHidden) => set({ bottomNavHidden }),
}));
