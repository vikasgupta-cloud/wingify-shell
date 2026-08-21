import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useThemeStore } from "./theme";
import { useFontStore } from "./fonts";
import { useIconLibraryStore } from "./iconLibrary";

/** Set true to remount the Appearance tab, player controller, and Settings switch. */
export const DESIGN_CONTROLLER_ENABLED = false;

type DesignControllerState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openController: () => void;
  closeController: () => void;
  /**
   * Whether the floating "Appearance" tab is mounted. Off by default so the
   * prototype reads as the product; Settings → General is the only way back in.
   */
  tabVisible: boolean;
  setTabVisible: (visible: boolean) => void;
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
      setOpen: (open) => set({ open }),
      openController: () => set({ open: true }),
      closeController: () => set({ open: false }),
      tabVisible: false,
      setTabVisible: (tabVisible) => set({ tabVisible }),
      resetDesign: () => {
        useThemeStore.getState().resetAppearance();
        useFontStore.getState().resetFonts();
        useIconLibraryStore.getState().resetIconLibrary();
      },
    }),
    {
      name: "wingify-design-controller",
      // `open` is session state, not a preference — only the tab toggle persists.
      partialize: (state) => ({ tabVisible: state.tabVisible }),
    }
  )
);
