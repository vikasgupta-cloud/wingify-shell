import { create } from "zustand";
import type { MascotId } from "../config/mascots";

const CLEAR_GRACE_MS = 140;

type MascotPreviewState = {
  /** Product-row hover preview; null = use route mascot. */
  previewId: MascotId | null;
  setPreview: (id: MascotId | null) => void;
  /** Immediate set — cancels any pending clear. */
  preview: (id: MascotId) => void;
  /** Delayed clear so moving between nav rows doesn't flash the route mark. */
  scheduleClear: () => void;
  cancelClear: () => void;
};

let clearTimer: number | undefined;

/** Ephemeral hover preview for the rail logo — not persisted. */
export const useMascotPreviewStore = create<MascotPreviewState>((set, get) => ({
  previewId: null,
  setPreview: (previewId) => {
    window.clearTimeout(clearTimer);
    clearTimer = undefined;
    set({ previewId });
  },
  preview: (id) => {
    window.clearTimeout(clearTimer);
    clearTimer = undefined;
    if (get().previewId === id) return;
    set({ previewId: id });
  },
  scheduleClear: () => {
    window.clearTimeout(clearTimer);
    clearTimer = window.setTimeout(() => {
      clearTimer = undefined;
      set({ previewId: null });
    }, CLEAR_GRACE_MS);
  },
  cancelClear: () => {
    window.clearTimeout(clearTimer);
    clearTimer = undefined;
  },
}));
