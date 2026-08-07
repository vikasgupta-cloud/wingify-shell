import { create } from "zustand";
import { useThemeStore } from "./theme";
import { useFontStore } from "./fonts";

type DesignControllerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openController: () => void;
  closeController: () => void;
  /**
   * Single reset for the whole design controller — appearance (theme, mode,
   * CTA) AND fonts. One entry point so "Reset all" can't reset one and miss the
   * other as new design surfaces are added.
   */
  resetDesign: () => void;
};

/** Shared open state for the fonts + CTA design playground. */
export const useDesignControllerStore = create<DesignControllerState>(
  (set) => ({
    open: false,
    setOpen: (open) => set({ open }),
    openController: () => set({ open: true }),
    closeController: () => set({ open: false }),
    resetDesign: () => {
      useThemeStore.getState().resetAppearance();
      useFontStore.getState().resetFonts();
    },
  })
);
