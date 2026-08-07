import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyTheme,
  DEFAULT_THEME_ID,
  isThemeId,
  type ThemeId,
} from "../config/themes";

type ThemeState = {
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: DEFAULT_THEME_ID,
      setTheme: (themeId) => {
        applyTheme(themeId);
        set({ themeId });
      },
    }),
    {
      name: "wingify-theme",
      partialize: (s) => ({ themeId: s.themeId }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ThemeState>;
        const themeId = isThemeId(p.themeId) ? p.themeId : current.themeId;
        return { ...current, ...p, themeId };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.themeId) applyTheme(state.themeId);
      },
    }
  )
);
