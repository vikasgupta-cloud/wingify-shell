import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveCtaTokenId } from "../config/ctaTokens";
import { resolveNeutralTokenId } from "../config/backgroundTokens";
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
  ctaTokenId: string | null;
  backgroundTokenId: string | null;
  /** Shared grey for table / kanban / gantt headers. */
  headerTokenId: string | null;
  setTheme: (themeId: ThemeId) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setCtaToken: (ctaTokenId: string | null) => void;
  setBackgroundToken: (backgroundTokenId: string | null) => void;
  setHeaderToken: (headerTokenId: string | null) => void;
  resetAppearance: () => void;
};

function syncDom(
  themeId: ThemeId,
  colorMode: ColorMode,
  ctaTokenId: string | null,
  backgroundTokenId: string | null,
  headerTokenId: string | null
) {
  applyBrand(themeId, colorMode, ctaTokenId, backgroundTokenId, headerTokenId);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: DEFAULT_THEME_ID,
      colorMode: DEFAULT_COLOR_MODE,
      ctaTokenId: null,
      backgroundTokenId: null,
      headerTokenId: null,
      setTheme: (themeId) => {
        const { colorMode, backgroundTokenId, headerTokenId } = get();
        syncDom(themeId, colorMode, null, backgroundTokenId, headerTokenId);
        set({ themeId, ctaTokenId: null });
      },
      setColorMode: (colorMode) => {
        const { themeId, ctaTokenId, backgroundTokenId, headerTokenId } = get();
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId
        );
        set({ colorMode });
      },
      setCtaToken: (ctaTokenId) => {
        const { themeId, colorMode, backgroundTokenId, headerTokenId } = get();
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId
        );
        set({ ctaTokenId });
      },
      setBackgroundToken: (backgroundTokenId) => {
        const { themeId, colorMode, ctaTokenId, headerTokenId } = get();
        const next = resolveNeutralTokenId(backgroundTokenId);
        syncDom(themeId, colorMode, ctaTokenId, next, headerTokenId);
        set({ backgroundTokenId: next });
      },
      setHeaderToken: (headerTokenId) => {
        const { themeId, colorMode, ctaTokenId, backgroundTokenId } = get();
        const next = resolveNeutralTokenId(headerTokenId);
        syncDom(themeId, colorMode, ctaTokenId, backgroundTokenId, next);
        set({ headerTokenId: next });
      },
      resetAppearance: () => {
        syncDom(DEFAULT_THEME_ID, DEFAULT_COLOR_MODE, null, null, null);
        set({
          themeId: DEFAULT_THEME_ID,
          colorMode: DEFAULT_COLOR_MODE,
          ctaTokenId: null,
          backgroundTokenId: null,
          headerTokenId: null,
        });
      },
    }),
    {
      name: "wingify-theme",
      partialize: (s) => ({
        themeId: s.themeId,
        colorMode: s.colorMode,
        ctaTokenId: s.ctaTokenId,
        backgroundTokenId: s.backgroundTokenId,
        headerTokenId: s.headerTokenId,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ThemeState>;
        return {
          ...current,
          ...p,
          themeId: resolveThemeId(p.themeId ?? current.themeId),
          colorMode: resolveColorMode(p.colorMode ?? current.colorMode),
          ctaTokenId: resolveCtaTokenId(p.ctaTokenId ?? current.ctaTokenId),
          backgroundTokenId: resolveNeutralTokenId(
            p.backgroundTokenId ?? current.backgroundTokenId
          ),
          headerTokenId: resolveNeutralTokenId(
            p.headerTokenId ?? current.headerTokenId
          ),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        syncDom(
          resolveThemeId(state.themeId),
          resolveColorMode(state.colorMode),
          resolveCtaTokenId(state.ctaTokenId),
          resolveNeutralTokenId(state.backgroundTokenId),
          resolveNeutralTokenId(state.headerTokenId)
        );
      },
    }
  )
);
