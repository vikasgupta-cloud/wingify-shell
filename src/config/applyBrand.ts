import { applyTheme, type ColorMode, type ThemeId } from "./themes";
import { computeThemeVars, THEME_VARS } from "./brandEngine";
import { aestheticVarsForCta, ctaTokenById, CTA_VARS } from "./ctaTokens";
import {
  aestheticVarsForBackground,
  aestheticVarsForHeader,
  BACKGROUND_VARS,
  backgroundTokenById,
  HEADER_VARS,
  neutralTokenById,
} from "./backgroundTokens";

const ALL_BRAND_VARS: readonly string[] = Array.from(
  new Set([...THEME_VARS, ...CTA_VARS, ...BACKGROUND_VARS, ...HEADER_VARS])
);

export function applyBrand(
  themeId: ThemeId,
  colorMode: ColorMode,
  ctaTokenId: string | null,
  backgroundTokenId: string | null = null,
  headerTokenId: string | null = null
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  applyTheme(themeId, colorMode);

  const vars: Record<string, string> = {
    ...computeThemeVars(themeId, colorMode),
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

  for (const key of ALL_BRAND_VARS) {
    const value = vars[key];
    if (value != null) root.style.setProperty(key, value);
    else root.style.removeProperty(key);
  }
}
