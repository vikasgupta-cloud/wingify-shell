/**
 * The single authority for writing brand variables to <html>.
 *
 * Both the theme preset and the optional custom-CTA override now write INLINE
 * custom properties, so a naive "theme sets, CTA clears" split would collide.
 * applyBrand instead computes the complete effective set for the current
 * (theme, mode, cta) and diffs it against the full brand-var key union: keys in
 * the effective set are written, keys absent are removed. That makes theme
 * switches, mode flips, and CTA set/clear all idempotent and collision-free.
 */

import { applyTheme, type ColorMode, type ThemeId } from "./themes";
import { computeThemeVars, THEME_VARS } from "./brandEngine";
import { aestheticVarsForCta, ctaTokenById, CTA_VARS } from "./ctaTokens";

// Every key either surface can set — the diff domain for apply/clear.
const ALL_BRAND_VARS: readonly string[] = Array.from(
  new Set([...THEME_VARS, ...CTA_VARS])
);

export function applyBrand(
  themeId: ThemeId,
  colorMode: ColorMode,
  ctaTokenId: string | null
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Attributes (data-theme / data-mode) still drive [data-mode] semantic vars
  // and any attribute-keyed CSS.
  applyTheme(themeId, colorMode);

  // Theme first, then the custom CTA overrides its subset on top.
  const vars: Record<string, string> = { ...computeThemeVars(themeId, colorMode) };
  const token = ctaTokenId ? ctaTokenById(ctaTokenId) : undefined;
  if (token) {
    Object.assign(vars, aestheticVarsForCta(token, colorMode));
    root.setAttribute("data-cta", token.id);
  } else {
    root.removeAttribute("data-cta");
  }

  for (const key of ALL_BRAND_VARS) {
    const value = vars[key];
    if (value != null) root.style.setProperty(key, value);
    else root.style.removeProperty(key);
  }
}
