import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveCtaTokenId } from "../config/ctaTokens";
import {
  DEFAULT_BACKGROUND_TOKEN_ID,
  DEFAULT_HEADER_TOKEN_ID,
  resolveNeutralTokenId,
  resolveWingifyChromeTokens,
  wingifyChromeTokenIds,
} from "../config/backgroundTokens";
import { applyBrand } from "../config/applyBrand";
import {
  DEFAULT_FORM_ELEMENT_SCHEME_ID,
  resolveFormElementSchemeId,
  type FormElementSchemeId,
} from "../config/formElementSchemes";
import {
  DEFAULT_SURFACE_SCHEME_ID,
  resolveSurfaceSchemeId,
  type SurfaceSchemeId,
} from "../config/surfaceTokens";
import {
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME_ID,
  resolveColorMode,
  resolveThemeId,
  type ColorMode,
  type ThemeId,
} from "../config/themes";

/** Chrome defaults that ship with the Wingify theme (mode-aware). */
function wingifyChromeDefaults(mode: ColorMode) {
  return {
    ...wingifyChromeTokenIds(mode),
    surfaceSchemeId: DEFAULT_SURFACE_SCHEME_ID,
  } as const;
}

function isWingifyDefaultChrome(
  mode: ColorMode,
  backgroundTokenId: string | null,
  headerTokenId: string | null
): boolean {
  const d = wingifyChromeTokenIds(mode);
  return (
    backgroundTokenId === d.backgroundTokenId &&
    headerTokenId === d.headerTokenId
  );
}

type ThemeState = {
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId: string | null;
  /** Shared grey for table / kanban / gantt headers. */
  headerTokenId: string | null;
  formElementSchemeId: FormElementSchemeId;
  /** Chrome / body / card surface preset. null = theme defaults. */
  surfaceSchemeId: SurfaceSchemeId | null;
  setTheme: (themeId: ThemeId) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setCtaToken: (ctaTokenId: string | null) => void;
  setBackgroundToken: (backgroundTokenId: string | null) => void;
  setHeaderToken: (headerTokenId: string | null) => void;
  setFormElementScheme: (formElementSchemeId: FormElementSchemeId) => void;
  setSurfaceScheme: (surfaceSchemeId: SurfaceSchemeId | null) => void;
  resetAppearance: () => void;
};

function syncDom(
  themeId: ThemeId,
  colorMode: ColorMode,
  ctaTokenId: string | null,
  backgroundTokenId: string | null,
  headerTokenId: string | null,
  formElementSchemeId: FormElementSchemeId,
  surfaceSchemeId: SurfaceSchemeId | null
) {
  applyBrand(
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    formElementSchemeId,
    surfaceSchemeId
  );
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: DEFAULT_THEME_ID,
      colorMode: DEFAULT_COLOR_MODE,
      ctaTokenId: null,
      backgroundTokenId: DEFAULT_BACKGROUND_TOKEN_ID,
      headerTokenId: DEFAULT_HEADER_TOKEN_ID,
      formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
      surfaceSchemeId: DEFAULT_SURFACE_SCHEME_ID,
      setTheme: (themeId) => {
        const { colorMode, formElementSchemeId } = get();
        const chrome =
          themeId === "wingify"
            ? wingifyChromeDefaults(colorMode)
            : {
                backgroundTokenId: get().backgroundTokenId,
                headerTokenId: get().headerTokenId,
                surfaceSchemeId: get().surfaceSchemeId,
              };
        syncDom(
          themeId,
          colorMode,
          null,
          chrome.backgroundTokenId,
          chrome.headerTokenId,
          formElementSchemeId,
          chrome.surfaceSchemeId
        );
        set({ themeId, ctaTokenId: null, ...chrome });
      },
      setColorMode: (colorMode) => {
        const {
          themeId,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
          surfaceSchemeId,
          colorMode: prevMode,
        } = get();
        // Wingify light defaults (Canvas 50 / Parchment 75) must not stick in
        // dark mode — swap to the dark pair when still on auto defaults.
        let nextBg = backgroundTokenId;
        let nextHeader = headerTokenId;
        let nextSurface = surfaceSchemeId;
        if (
          themeId === "wingify" &&
          isWingifyDefaultChrome(prevMode, backgroundTokenId, headerTokenId)
        ) {
          const chrome = wingifyChromeDefaults(colorMode);
          nextBg = chrome.backgroundTokenId;
          nextHeader = chrome.headerTokenId;
          nextSurface = chrome.surfaceSchemeId;
        }
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          nextBg,
          nextHeader,
          formElementSchemeId,
          nextSurface
        );
        set({
          colorMode,
          backgroundTokenId: nextBg,
          headerTokenId: nextHeader,
          surfaceSchemeId: nextSurface,
        });
      },
      setCtaToken: (ctaTokenId) => {
        const {
          themeId,
          colorMode,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
          surfaceSchemeId,
        } = get();
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
          surfaceSchemeId
        );
        set({ ctaTokenId });
      },
      setBackgroundToken: (backgroundTokenId) => {
        const {
          themeId,
          colorMode,
          ctaTokenId,
          headerTokenId,
          formElementSchemeId,
          surfaceSchemeId,
        } = get();
        const next = resolveNeutralTokenId(backgroundTokenId);
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          next,
          headerTokenId,
          formElementSchemeId,
          surfaceSchemeId
        );
        set({ backgroundTokenId: next });
      },
      setHeaderToken: (headerTokenId) => {
        const {
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          formElementSchemeId,
          surfaceSchemeId,
        } = get();
        const next = resolveNeutralTokenId(headerTokenId);
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          next,
          formElementSchemeId,
          surfaceSchemeId
        );
        set({ headerTokenId: next });
      },
      setFormElementScheme: (formElementSchemeId) => {
        const { colorMode, backgroundTokenId, headerTokenId, surfaceSchemeId } =
          get();
        syncDom(
          "yellow",
          colorMode,
          null,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
          surfaceSchemeId
        );
        set({
          formElementSchemeId,
          themeId: "yellow",
          ctaTokenId: null,
        });
      },
      setSurfaceScheme: (surfaceSchemeId) => {
        const {
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
        } = get();
        const next = resolveSurfaceSchemeId(surfaceSchemeId);
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
          next
        );
        set({ surfaceSchemeId: next });
      },
      resetAppearance: () => {
        const chrome = wingifyChromeDefaults(DEFAULT_COLOR_MODE);
        syncDom(
          DEFAULT_THEME_ID,
          DEFAULT_COLOR_MODE,
          null,
          chrome.backgroundTokenId,
          chrome.headerTokenId,
          DEFAULT_FORM_ELEMENT_SCHEME_ID,
          chrome.surfaceSchemeId
        );
        set({
          themeId: DEFAULT_THEME_ID,
          colorMode: DEFAULT_COLOR_MODE,
          ctaTokenId: null,
          backgroundTokenId: chrome.backgroundTokenId,
          headerTokenId: chrome.headerTokenId,
          formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
          surfaceSchemeId: chrome.surfaceSchemeId,
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
        formElementSchemeId: s.formElementSchemeId,
        surfaceSchemeId: s.surfaceSchemeId,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ThemeState> & {
          themeId?: unknown;
        };
        const rawTheme = p.themeId;
        const wasYellowB = rawTheme === "yellow-b";
        const themeId = resolveThemeId(p.themeId ?? current.themeId);
        const colorMode = resolveColorMode(p.colorMode ?? current.colorMode);
        const formElementSchemeId = resolveFormElementSchemeId(
          wasYellowB
            ? "yellow-maroon"
            : (p.formElementSchemeId ?? current.formElementSchemeId)
        );
        const chrome =
          themeId === "wingify"
            ? resolveWingifyChromeTokens(
                colorMode,
                p.backgroundTokenId === undefined
                  ? current.backgroundTokenId
                  : p.backgroundTokenId,
                p.headerTokenId === undefined
                  ? current.headerTokenId
                  : p.headerTokenId
              )
            : {
                backgroundTokenId:
                  p.backgroundTokenId === undefined
                    ? current.backgroundTokenId
                    : resolveNeutralTokenId(p.backgroundTokenId),
                headerTokenId:
                  p.headerTokenId === undefined
                    ? current.headerTokenId
                    : resolveNeutralTokenId(p.headerTokenId),
              };
        return {
          ...current,
          ...p,
          themeId,
          colorMode,
          ctaTokenId: resolveCtaTokenId(p.ctaTokenId ?? current.ctaTokenId),
          backgroundTokenId: chrome.backgroundTokenId,
          headerTokenId: chrome.headerTokenId,
          formElementSchemeId,
          surfaceSchemeId:
            p.surfaceSchemeId === undefined
              ? DEFAULT_SURFACE_SCHEME_ID
              : resolveSurfaceSchemeId(p.surfaceSchemeId),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const themeId = resolveThemeId(state.themeId);
        const colorMode = resolveColorMode(state.colorMode);
        const surfaceSchemeId =
          state.surfaceSchemeId === undefined
            ? DEFAULT_SURFACE_SCHEME_ID
            : resolveSurfaceSchemeId(state.surfaceSchemeId);
        const chrome =
          themeId === "wingify"
            ? resolveWingifyChromeTokens(
                colorMode,
                state.backgroundTokenId,
                state.headerTokenId
              )
            : {
                backgroundTokenId: resolveNeutralTokenId(state.backgroundTokenId),
                headerTokenId: resolveNeutralTokenId(state.headerTokenId),
              };
        state.surfaceSchemeId = surfaceSchemeId;
        state.backgroundTokenId = chrome.backgroundTokenId;
        state.headerTokenId = chrome.headerTokenId;
        syncDom(
          themeId,
          colorMode,
          resolveCtaTokenId(state.ctaTokenId),
          chrome.backgroundTokenId,
          chrome.headerTokenId,
          resolveFormElementSchemeId(state.formElementSchemeId),
          surfaceSchemeId
        );
      },
    }
  )
);
