import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveCtaTokenId } from "../config/ctaTokens";
import { applyBrand } from "../config/applyBrand";
import {
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
  /** Token id like `green.800` — overrides preset CTA + surround. */
  ctaTokenId: string | null;
  setTheme: (themeId: ThemeId) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setCtaToken: (ctaTokenId: string | null) => void;
  /** Restore default theme, light mode, and clear CTA override. */
  resetAppearance: () => void;
};

function syncDom(
  themeId: ThemeId,
  colorMode: ColorMode,
  ctaTokenId: string | null
) {
  applyBrand(themeId, colorMode, ctaTokenId);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: DEFAULT_THEME_ID,
      colorMode: DEFAULT_COLOR_MODE,
      ctaTokenId: null,
      setTheme: (themeId) => {
        const { colorMode } = get();
        // Preset theme wins — clear custom CTA override.
        syncDom(themeId, colorMode, null);
        set({ themeId, ctaTokenId: null });
      },
      setColorMode: (colorMode) => {
        const { themeId, ctaTokenId } = get();
        syncDom(themeId, colorMode, ctaTokenId);
        set({ colorMode });
      },
      setCtaToken: (ctaTokenId) => {
        const { themeId, colorMode } = get();
        syncDom(themeId, colorMode, ctaTokenId);
        set({ ctaTokenId });
      },
      resetAppearance: () => {
        syncDom(DEFAULT_THEME_ID, DEFAULT_COLOR_MODE, null);
        set({
          themeId: DEFAULT_THEME_ID,
          colorMode: DEFAULT_COLOR_MODE,
          ctaTokenId: null,
        });
      },
    }),
    {
      name: "wingify-theme",
      partialize: (s) => ({
        themeId: s.themeId,
        colorMode: s.colorMode,
        ctaTokenId: s.ctaTokenId,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ThemeState>;
        return {
          ...current,
          ...p,
          themeId: resolveThemeId(p.themeId ?? current.themeId),
          colorMode: resolveColorMode(p.colorMode ?? current.colorMode),
          ctaTokenId: resolveCtaTokenId(p.ctaTokenId ?? current.ctaTokenId),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        syncDom(
          resolveThemeId(state.themeId),
          resolveColorMode(state.colorMode),
          resolveCtaTokenId(state.ctaTokenId)
        );
      },
    }
  )
);
