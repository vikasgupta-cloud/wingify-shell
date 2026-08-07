import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyTheme,
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME_ID,
  resolveColorMode,
  resolveThemeId,
  type ColorMode,
  type ThemeId,
} from "../config/themes";

type ThemeState = {
  themeId: ThemeId;
  colorMode: ColorMode;
  setTheme: (themeId: ThemeId) => void;
  setColorMode: (colorMode: ColorMode) => void;
};

function syncDom(themeId: ThemeId, colorMode: ColorMode) {
  applyTheme(themeId, colorMode);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: DEFAULT_THEME_ID,
      colorMode: DEFAULT_COLOR_MODE,
      setTheme: (themeId) => {
        const colorMode = get().colorMode;
        syncDom(themeId, colorMode);
        set({ themeId });
      },
      setColorMode: (colorMode) => {
        const themeId = get().themeId;
        syncDom(themeId, colorMode);
        set({ colorMode });
      },
    }),
    {
      name: "wingify-theme",
      partialize: (s) => ({ themeId: s.themeId, colorMode: s.colorMode }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ThemeState>;
        return {
          ...current,
          ...p,
          themeId: resolveThemeId(p.themeId ?? current.themeId),
          colorMode: resolveColorMode(p.colorMode ?? current.colorMode),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        syncDom(
          resolveThemeId(state.themeId),
          resolveColorMode(state.colorMode)
        );
      },
    }
  )
);
