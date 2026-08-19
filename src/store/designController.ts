import { create } from "zustand";
import { useThemeStore } from "./theme";
import { useFontStore } from "./fonts";
import { useIconLibraryStore } from "./iconLibrary";
import { useComponentAppearanceStore } from "./componentAppearance";

type DesignControllerState = {
  open: boolean;
  tabVisible: boolean;
  setOpen: (open: boolean) => void;
  setTabVisible: (checked: boolean) => void;
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
    tabVisible: true,
    setOpen: (open) => set({ open }),
    setTabVisible: (checked) => set({ tabVisible: checked }),
    openController: () => set({ open: true }),
    closeController: () => set({ open: false }),
    resetDesign: () => {
      useThemeStore.getState().resetAppearance();
      useFontStore.getState().resetFonts();
      useIconLibraryStore.getState().resetIconLibrary();
      useComponentAppearanceStore.getState().resetComponentAppearance();
    },
  })
);
