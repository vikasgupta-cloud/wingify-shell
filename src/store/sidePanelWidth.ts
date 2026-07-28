import { create } from "zustand";

/** Shared width for Wandz, Insights, Chats, and Activity side panels. */
export const SIDE_PANEL_WIDTH = {
  default: 420,
  min: 320,
  max: 720,
  step: 80,
} as const;

function clampWidth(width: number): number {
  return Math.min(
    SIDE_PANEL_WIDTH.max,
    Math.max(SIDE_PANEL_WIDTH.min, Math.round(width))
  );
}

type SidePanelWidthState = {
  width: number;
  setWidth: (width: number) => void;
  increaseWidth: () => void;
  decreaseWidth: () => void;
};

export const useSidePanelWidthStore = create<SidePanelWidthState>((set) => ({
  width: SIDE_PANEL_WIDTH.default,
  setWidth: (width) => set({ width: clampWidth(width) }),
  increaseWidth: () =>
    set((s) => ({ width: clampWidth(s.width + SIDE_PANEL_WIDTH.step) })),
  decreaseWidth: () =>
    set((s) => ({ width: clampWidth(s.width - SIDE_PANEL_WIDTH.step) })),
}));
