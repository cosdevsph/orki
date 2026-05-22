import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

type UIStoreState = {
  /**
   * When true the AppShell bottom dock is hidden.
   * Pages that render a full-screen viewer (e.g. FlashcardViewer) set this
   * to true for the duration of the viewer session.
   */
  hideDock: boolean;
  setHideDock: (hide: boolean) => void;
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStoreState>((set) => ({
  hideDock: false,
  setHideDock: (hide) => set({ hideDock: hide }),
}));
