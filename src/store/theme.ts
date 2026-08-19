import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveCtaTokenId } from "../config/ctaTokens";
import { resolveNeutralTokenId } from "../config/backgroundTokens";
import { applyBrand } from "../config/applyBrand";
import {
  applyPalette,
  DEFAULT_PALETTE_ID,
  resolvePaletteId,
  type PaletteId,
} from "../config/palettes";
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
  paletteId: PaletteId;
  ctaTokenId: string | null;
  backgroundTokenId: string | null;
  /** Shared grey for table / kanban / gantt headers. */
  headerTokenId: string | null;
  setTheme: (themeId: ThemeId) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setPalette: (paletteId: PaletteId) => void;
  setCtaToken: (ctaTokenId: string | null) => void;
  setBackgroundToken: (backgroundTokenId: string | null) => void;
  setHeaderToken: (headerTokenId: string | null) => void;
  /** Restore a full appearance snapshot from a saved theme. */
  applySnapshot: (snapshot: {
    themeId: ThemeId;
    colorMode: ColorMode;
    paletteId: PaletteId;
    ctaTokenId: string | null;
    backgroundTokenId: string | null;
    headerTokenId: string | null;
  }) => void;
  resetAppearance: () => void;
};

function syncDom(
  themeId: ThemeId,
  colorMode: ColorMode,
  paletteId: PaletteId,
  ctaTokenId: string | null,
  backgroundTokenId: string | null,
  headerTokenId: string | null
) {
  applyPalette(paletteId);
  applyBrand(themeId, colorMode, ctaTokenId, backgroundTokenId, headerTokenId);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: DEFAULT_THEME_ID,
      colorMode: DEFAULT_COLOR_MODE,
      paletteId: DEFAULT_PALETTE_ID,
      ctaTokenId: null,
      backgroundTokenId: null,
      headerTokenId: null,
      setTheme: (themeId) => {
        const { colorMode, paletteId, backgroundTokenId, headerTokenId } = get();
        syncDom(themeId, colorMode, paletteId, null, backgroundTokenId, headerTokenId);
        set({ themeId, ctaTokenId: null });
      },
      setColorMode: (colorMode) => {
        const {
          themeId,
          paletteId,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
        } = get();
        syncDom(
          themeId,
          colorMode,
          paletteId,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId
        );
        set({ colorMode });
      },
      setPalette: (paletteId) => {
        const {
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
        } = get();
        syncDom(
          themeId,
          colorMode,
          paletteId,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId
        );
        set({ paletteId });
      },
      setCtaToken: (ctaTokenId) => {
        const {
          themeId,
          colorMode,
          paletteId,
          backgroundTokenId,
          headerTokenId,
        } = get();
        syncDom(
          themeId,
          colorMode,
          paletteId,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId
        );
        set({ ctaTokenId });
      },
      setBackgroundToken: (backgroundTokenId) => {
        const { themeId, colorMode, paletteId, ctaTokenId, headerTokenId } =
          get();
        const next = resolveNeutralTokenId(backgroundTokenId);
        syncDom(themeId, colorMode, paletteId, ctaTokenId, next, headerTokenId);
        set({ backgroundTokenId: next });
      },
      setHeaderToken: (headerTokenId) => {
        const {
          themeId,
          colorMode,
          paletteId,
          ctaTokenId,
          backgroundTokenId,
        } = get();
        const next = resolveNeutralTokenId(headerTokenId);
        syncDom(
          themeId,
          colorMode,
          paletteId,
          ctaTokenId,
          backgroundTokenId,
          next
        );
        set({ headerTokenId: next });
      },
      applySnapshot: (snapshot) => {
        const themeId = resolveThemeId(snapshot.themeId);
        const colorMode = resolveColorMode(snapshot.colorMode);
        const paletteId = resolvePaletteId(snapshot.paletteId);
        const ctaTokenId = resolveCtaTokenId(snapshot.ctaTokenId);
        const backgroundTokenId = resolveNeutralTokenId(
          snapshot.backgroundTokenId
        );
        const headerTokenId = resolveNeutralTokenId(snapshot.headerTokenId);
        syncDom(
          themeId,
          colorMode,
          paletteId,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId
        );
        set({
          themeId,
          colorMode,
          paletteId,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
        });
      },
      resetAppearance: () => {
        syncDom(DEFAULT_THEME_ID, DEFAULT_COLOR_MODE, DEFAULT_PALETTE_ID, null, null, null);
        set({
          themeId: DEFAULT_THEME_ID,
          colorMode: DEFAULT_COLOR_MODE,
          paletteId: DEFAULT_PALETTE_ID,
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
        paletteId: s.paletteId,
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
          paletteId: resolvePaletteId(p.paletteId ?? current.paletteId),
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
          resolvePaletteId(state.paletteId),
          resolveCtaTokenId(state.ctaTokenId),
          resolveNeutralTokenId(state.backgroundTokenId),
          resolveNeutralTokenId(state.headerTokenId)
        );
      },
    }
  )
);
