import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolveCtaTokenId } from "../config/ctaTokens";
import { resolveNeutralTokenId } from "../config/backgroundTokens";
import { applyBrand } from "../config/applyBrand";
import {
  DEFAULT_FORM_ELEMENT_SCHEME_ID,
  resolveFormElementSchemeId,
  type FormElementSchemeId,
} from "../config/formElementSchemes";
import {
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
      backgroundTokenId: null,
      headerTokenId: null,
      formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
      surfaceSchemeId: null,
      setTheme: (themeId) => {
        const {
          colorMode,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
          surfaceSchemeId,
        } = get();
        syncDom(
          themeId,
          colorMode,
          null,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
          surfaceSchemeId
        );
        set({ themeId, ctaTokenId: null });
      },
      setColorMode: (colorMode) => {
        const {
          themeId,
          ctaTokenId,
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
        set({ colorMode });
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
        syncDom(
          DEFAULT_THEME_ID,
          DEFAULT_COLOR_MODE,
          null,
          null,
          null,
          DEFAULT_FORM_ELEMENT_SCHEME_ID,
          null
        );
        set({
          themeId: DEFAULT_THEME_ID,
          colorMode: DEFAULT_COLOR_MODE,
          ctaTokenId: null,
          backgroundTokenId: null,
          headerTokenId: null,
          formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
          surfaceSchemeId: null,
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
        const formElementSchemeId = resolveFormElementSchemeId(
          wasYellowB
            ? "yellow-maroon"
            : (p.formElementSchemeId ?? current.formElementSchemeId)
        );
        return {
          ...current,
          ...p,
          themeId,
          colorMode: resolveColorMode(p.colorMode ?? current.colorMode),
          ctaTokenId: resolveCtaTokenId(p.ctaTokenId ?? current.ctaTokenId),
          backgroundTokenId: resolveNeutralTokenId(
            p.backgroundTokenId ?? current.backgroundTokenId
          ),
          headerTokenId: resolveNeutralTokenId(
            p.headerTokenId ?? current.headerTokenId
          ),
          formElementSchemeId,
          surfaceSchemeId: resolveSurfaceSchemeId(
            p.surfaceSchemeId ?? current.surfaceSchemeId
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
          resolveNeutralTokenId(state.headerTokenId),
          resolveFormElementSchemeId(state.formElementSchemeId),
          resolveSurfaceSchemeId(state.surfaceSchemeId)
        );
      },
    }
  )
);
