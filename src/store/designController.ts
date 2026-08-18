import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useThemeStore } from "./theme";
import { useFontStore } from "./fonts";
import { useIconLibraryStore } from "./iconLibrary";

export const DEFAULT_SHOW_WEB_EXPERIMENT_OLD = true;

type DesignControllerState = {
  open: boolean;
  /** Show “Web experimentation (Old)” in the product rail. */
  showWebExperimentOld: boolean;
  setOpen: (open: boolean) => void;
  openController: () => void;
  closeController: () => void;
  setShowWebExperimentOld: (show: boolean) => void;
  /**
   * Single reset for the whole design controller — appearance (theme, mode,
   * CTA) AND fonts. One entry point so "Reset all" can't reset one and miss the
   * other as new design surfaces are added.
   */
  resetDesign: () => void;
};

/** Shared open state for the fonts + CTA design playground. */
export const useDesignControllerStore = create<DesignControllerState>()(
  persist(
    (set) => ({
      open: false,
      showWebExperimentOld: DEFAULT_SHOW_WEB_EXPERIMENT_OLD,
      setOpen: (open) => set({ open }),
      openController: () => set({ open: true }),
      closeController: () => set({ open: false }),
      setShowWebExperimentOld: (showWebExperimentOld) =>
        set({ showWebExperimentOld }),
      resetDesign: () => {
        useThemeStore.getState().resetAppearance();
        useFontStore.getState().resetFonts();
        useIconLibraryStore.getState().resetIconLibrary();
        set({
          showWebExperimentOld: DEFAULT_SHOW_WEB_EXPERIMENT_OLD,
        });
      },
    }),
    {
      name: "wingify-design-controller",
      partialize: (s) => ({
        showWebExperimentOld: s.showWebExperimentOld,
      }),
    }
  )
);
