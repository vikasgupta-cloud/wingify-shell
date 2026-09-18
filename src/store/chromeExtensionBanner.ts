/** Persist collapsed state for the dashboard Chrome extension header chip. */

import { create } from "zustand";
import { persist } from "zustand/middleware";

type ChromeExtensionBannerState = {
  collapsed: boolean;
  collapse: () => void;
  expand: () => void;
};

export const useChromeExtensionBannerStore = create<ChromeExtensionBannerState>()(
  persist(
    (set) => ({
      collapsed: false,
      collapse: () => set({ collapsed: true }),
      expand: () => set({ collapsed: false }),
    }),
    { name: "wingify-chrome-extension-banner" }
  )
);
