import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Shared width for Wandz, Insights, Chats, and Activity side panels. */
export const SIDE_PANEL_WIDTH = {
  default: 320,
  min: 280,
  max: 560,
  step: 40,
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

export const useSidePanelWidthStore = create<SidePanelWidthState>()(
  persist(
    (set) => ({
      width: SIDE_PANEL_WIDTH.default,
      setWidth: (width) => set({ width: clampWidth(width) }),
      increaseWidth: () =>
        set((s) => ({ width: clampWidth(s.width + SIDE_PANEL_WIDTH.step) })),
      decreaseWidth: () =>
        set((s) => ({ width: clampWidth(s.width - SIDE_PANEL_WIDTH.step) })),
    }),
    {
      // v2: narrower default so reports stay usable beside the panel.
      name: "wingify-side-panel-width-v2",
      partialize: (s) => ({ width: s.width }),
      merge: (persisted, current) => {
        const raw =
          persisted && typeof persisted === "object" && "width" in persisted
            ? (persisted as { width: unknown }).width
            : undefined;
        return {
          ...current,
          width:
            typeof raw === "number" && Number.isFinite(raw)
              ? clampWidth(raw)
              : current.width,
        };
      },
    }
  )
);
