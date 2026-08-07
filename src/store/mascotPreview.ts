import { create } from "zustand";
import type { MascotId } from "../config/mascots";

type MascotPreviewState = {
  /** Product-row hover preview; null = use route mascot. */
  previewId: MascotId | null;
  setPreview: (id: MascotId | null) => void;
};

/** Ephemeral hover preview for the rail logo — not persisted. */
export const useMascotPreviewStore = create<MascotPreviewState>((set) => ({
  previewId: null,
  setPreview: (previewId) => set({ previewId }),
}));
