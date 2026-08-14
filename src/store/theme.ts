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
  setTheme: (themeId: ThemeId) => void;
  setColorMode: (colorMode: ColorMode) => void;
  setCtaToken: (ctaTokenId: string | null) => void;
  setBackgroundToken: (backgroundTokenId: string | null) => void;
  setHeaderToken: (headerTokenId: string | null) => void;
  setFormElementScheme: (formElementSchemeId: FormElementSchemeId) => void;
  resetAppearance: () => void;
};

function syncDom(
  themeId: ThemeId,
  colorMode: ColorMode,
  ctaTokenId: string | null,
  backgroundTokenId: string | null,
  headerTokenId: string | null,
  formElementSchemeId: FormElementSchemeId
) {
  applyBrand(
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    formElementSchemeId
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
      setTheme: (themeId) => {
        const {
          colorMode,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId,
        } = get();
        syncDom(
          themeId,
          colorMode,
          null,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId
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
        } = get();
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId
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
        } = get();
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId
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
        } = get();
        const next = resolveNeutralTokenId(backgroundTokenId);
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          next,
          headerTokenId,
          formElementSchemeId
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
        } = get();
        const next = resolveNeutralTokenId(headerTokenId);
        syncDom(
          themeId,
          colorMode,
          ctaTokenId,
          backgroundTokenId,
          next,
          formElementSchemeId
        );
        set({ headerTokenId: next });
      },
      setFormElementScheme: (formElementSchemeId) => {
        const { colorMode, backgroundTokenId, headerTokenId } = get();
        syncDom(
          "yellow",
          colorMode,
          null,
          backgroundTokenId,
          headerTokenId,
          formElementSchemeId
        );
        set({
          formElementSchemeId,
          themeId: "yellow",
          ctaTokenId: null,
        });
      },
      resetAppearance: () => {
        syncDom(
          DEFAULT_THEME_ID,
          DEFAULT_COLOR_MODE,
          null,
          null,
          null,
          DEFAULT_FORM_ELEMENT_SCHEME_ID
        );
        set({
          themeId: DEFAULT_THEME_ID,
          colorMode: DEFAULT_COLOR_MODE,
          ctaTokenId: null,
          backgroundTokenId: null,
          headerTokenId: null,
          formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
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
          resolveFormElementSchemeId(state.formElementSchemeId)
        );
      },
    }
  )
);
