import { applyTheme, type ColorMode, type ThemeId } from "./themes";
import { computeThemeVars, THEME_VARS } from "./brandEngine";
import { aestheticVarsForCta, ctaTokenById, CTA_VARS } from "./ctaTokens";
import { CHART_CSS_VARS_NEVER_INLINE } from "./chartTokens";
import {
  aestheticVarsForBackground,
  aestheticVarsForHeader,
  BACKGROUND_VARS,
  backgroundTokenById,
  HEADER_VARS,
  neutralTokenById,
} from "./backgroundTokens";
import {
  computeFormElementVars,
  FORM_ELEMENT_VARS,
  formElementSchemeOverridesTheme,
  type FormElementSchemeId,
} from "./formElementSchemes";
import {
  computeSurfaceVars,
  SURFACE_VARS,
  type SurfaceSchemeId,
} from "./surfaceTokens";

const ALL_BRAND_VARS: readonly string[] = Array.from(
  new Set([
    ...THEME_VARS,
    ...CTA_VARS,
    ...BACKGROUND_VARS,
    ...HEADER_VARS,
    ...FORM_ELEMENT_VARS,
    ...SURFACE_VARS,
  ])
);

export function applyBrand(
  themeId: ThemeId,
  colorMode: ColorMode,
  ctaTokenId: string | null,
  backgroundTokenId: string | null = null,
  headerTokenId: string | null = null,
  formElementSchemeId: FormElementSchemeId = "yellow-yellow",
  surfaceSchemeId: SurfaceSchemeId | null = null
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  applyTheme(themeId, colorMode);

  const formVars =
    themeId === "yellow"
      ? computeFormElementVars(formElementSchemeId, colorMode)
      : {};

  const vars: Record<string, string> = {
    ...computeThemeVars(themeId, colorMode),
    ...formVars,
    ...computeSurfaceVars(surfaceSchemeId, colorMode),
  };
  const token = ctaTokenId ? ctaTokenById(ctaTokenId) : undefined;
  if (token) {
    Object.assign(vars, aestheticVarsForCta(token, colorMode));
    root.setAttribute("data-cta", token.id);
  } else {
    root.removeAttribute("data-cta");
  }

  const bg = backgroundTokenById(backgroundTokenId);
  if (bg) {
    Object.assign(vars, aestheticVarsForBackground(bg, colorMode));
    root.setAttribute("data-background", bg.id);
  } else {
    root.removeAttribute("data-background");
  }

  const header = neutralTokenById(headerTokenId);
  if (header) {
    Object.assign(vars, aestheticVarsForHeader(header, colorMode));
    root.setAttribute("data-listing-header", header.id);
  } else {
    root.removeAttribute("data-listing-header");
  }

  if (surfaceSchemeId) {
    root.setAttribute("data-surface", surfaceSchemeId);
  } else {
    root.removeAttribute("data-surface");
  }

  if (
    themeId === "yellow" &&
    formElementSchemeOverridesTheme(formElementSchemeId)
  ) {
    root.setAttribute("data-form-elements", formElementSchemeId);
  } else {
    root.removeAttribute("data-form-elements");
  }

  for (const key of ALL_BRAND_VARS) {
    const value = vars[key];
    if (value != null) root.style.setProperty(key, value);
    else root.style.removeProperty(key);
  }

  // Charts stay on index.css palette — never inherit leftover CTA/theme inlines.
  for (const key of CHART_CSS_VARS_NEVER_INLINE) {
    root.style.removeProperty(key);
  }
}
