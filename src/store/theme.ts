import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyCtaToken,
  resolveCtaTokenId,
} from "../config/ctaTokens";
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
  /** Token id like `green.800` — overrides preset CTA + surround. */
  ctaTokenId: string | null;
  setTheme: (themeId: ThemeId) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setCtaToken: (ctaTokenId: string | null) => void;
};

function syncDom(
  themeId: ThemeId,
  colorMode: ColorMode,
  ctaTokenId: string | null
) {
  applyTheme(themeId, colorMode);
  applyCtaToken(ctaTokenId, colorMode);
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
