/**
 * Wingify theme — maps semantic Figma tokens onto app CSS roles.
 * Applied only when themeId === "wingify" (via brandEngine). Other themes unchanged.
 * Fonts from the pack are intentionally not applied.
 *
 * Every value is `var(--semantic-*)` from src/config/tokens/figma/.
 */

import type { ColorMode } from "./themes";

const s = {
  canvas: "var(--semantic-bg-canvas)",
  surface: "var(--semantic-bg-surface)",
  raised: "var(--semantic-bg-surface-raised)",
  selected: "var(--semantic-bg-selected)",
  text: "var(--semantic-text-primary)",
  textSecondary: "var(--semantic-text-secondary)",
  border: "var(--semantic-border-default)",
  borderSubtle: "var(--semantic-border-subtle)",
  borderHover: "var(--semantic-border-hover)",
  borderStrong: "var(--semantic-border-strong)",
  focus: "var(--semantic-border-focus)",
  primaryBg: "var(--semantic-action-primary-bg)",
  primaryFg: "var(--semantic-action-primary-text)",
  primaryHover: "var(--semantic-action-primary-bg-hover)",
  primaryActive: "var(--semantic-action-primary-bg-active)",
  secondaryBorder: "var(--semantic-action-secondary-border)",
  secondaryText: "var(--semantic-action-secondary-text)",
  tertiaryBg: "var(--semantic-action-tertiary-bg)",
  tertiaryHover: "var(--semantic-action-tertiary-bg-hover)",
  destructiveBg: "var(--semantic-action-destructive-bg)",
  destructiveFg: "var(--semantic-action-destructive-text)",
  aiBg: "var(--semantic-action-ai-bg)",
  aiFg: "var(--semantic-action-ai-text)",
  aiHover: "var(--semantic-action-ai-bg-hover)",
  accent: "var(--semantic-accent-selected-bg)",
  accentFg: "var(--semantic-accent-selected-text)",
  accentHover: "var(--semantic-accent-selected-hover)",
  accentEdge: "var(--semantic-accent-selected-edge)",
  fieldHover: "var(--semantic-accent-field-hover)",
  onSurfaceHover: "var(--semantic-context-on-surface-hover)",
  onSurfaceActive: "var(--semantic-context-on-surface-active)",
  successFg: "var(--semantic-status-success-soft-text)",
  successBg: "var(--semantic-status-success-soft-bg)",
  successSolid: "var(--semantic-status-success-strong-bg)",
  dangerFg: "var(--semantic-status-error-soft-text)",
  dangerBg: "var(--semantic-status-error-soft-bg)",
  warningFg: "var(--semantic-status-warning-soft-text)",
  warningBg: "var(--semantic-status-warning-soft-bg)",
  warningSolid: "var(--semantic-status-warning-strong-bg)",
  infoFg: "var(--semantic-status-info-soft-text)",
  infoBg: "var(--semantic-status-info-soft-bg)",
  aiSoftFg: "var(--semantic-status-ai-soft-text)",
  aiSoftBg: "var(--semantic-status-ai-soft-bg)",
  link: "var(--semantic-text-link)",
  linkHover: "var(--semantic-text-link-hover)",
  disabledBg: "var(--semantic-bg-disabled)",
  disabledFg: "var(--semantic-text-disabled)",
} as const;

/**
 * Full Wingify semantic → app role map.
 * Mode differences come from [data-mode] semantic swaps in tokens.generated.css.
 */
export function computeWingifyThemeVars(
  _mode: ColorMode
): Record<string, string> {
  return {
    "--foreground": s.text,
    "--muted-foreground": s.textSecondary,
    "--card-foreground": s.text,
    "--popover-foreground": s.text,
    "--panel-foreground": s.text,
    "--rail-foreground": s.text,

    "--border": s.border,
    "--surface-border": s.border,
    "--panel-border": s.border,
    "--input": s.borderStrong,
    "--ring": s.focus,

    "--background": s.surface,
    "--card": s.raised,
    "--popover": s.raised,
    "--muted": s.canvas,
    "--canvas": s.canvas,
    "--surface": s.canvas,
    "--rail": s.surface,
    "--panel": s.surface,
    "--listing-header-bg": s.surface,
    "--listing-header-fg": s.text,

    "--control": s.accent,
    "--control-foreground": s.accentFg,
    "--control-border": s.accentEdge,
    "--control-selected-bg": s.accent,
    "--control-selected-fg": s.accentFg,
    "--control-selected-border": s.accentEdge,
    "--brand-deep": s.text,
    "--brand-feather": s.fieldHover,

    "--primary": s.primaryBg,
    "--primary-foreground": s.primaryFg,
    "--primary-hover": s.primaryHover,
    "--primary-active": s.primaryActive,
    "--primary-subtle": s.fieldHover,
    "--primary-border": s.primaryBg,
    "--cta-secondary-fg": s.secondaryText,

    "--cta-tertiary-bg": s.tertiaryBg,
    "--cta-tertiary-fg": s.text,
    "--cta-tertiary-border": s.border,
    "--cta-tertiary-hover": s.tertiaryHover,
    "--cta-ai-bg": s.aiBg,
    "--cta-ai-fg": s.aiFg,
    "--cta-ai-hover": s.aiHover,
    "--cta-disabled-bg": s.disabledBg,
    "--cta-disabled-fg": s.disabledFg,

    "--secondary": s.onSurfaceHover,
    "--secondary-foreground": s.text,
    "--secondary-hover": s.onSurfaceActive,

    "--accent": s.accent,
    "--accent-foreground": s.accentFg,
    "--selected-bg": s.accent,
    "--selected-fg": s.accentFg,
    "--rail-active": s.accent,
    "--rail-active-foreground": s.accentFg,

    "--link": s.link,
    "--link-hover": s.linkHover,

    "--destructive": s.destructiveBg,
    "--destructive-foreground": s.destructiveFg,

    "--success-fg": s.successFg,
    "--success-bg": s.successBg,
    "--success-solid": s.successSolid,
    "--danger-fg": s.dangerFg,
    "--danger-bg": s.dangerBg,
    "--danger-on-subtle": s.dangerFg,
    "--warning-fg": s.warningFg,
    "--warning-bg": s.warningBg,
    "--warning-solid": s.warningSolid,
    "--info-fg": s.infoFg,
    "--info-bg": s.infoBg,
    "--highlight-fg": s.aiSoftFg,
    "--highlight-bg": s.aiSoftBg,

    "--report-brand": s.text,
    "--report-brand-fg": s.text,
    "--report-brand-tint": s.canvas,
    "--report-link": s.link,
    "--report-track": s.border,
    "--report-info-bg": s.infoBg,
    "--report-blue-bg": s.infoBg,
    "--report-blue-border": "var(--ocean-300)",
    "--report-blue-fg": s.infoFg,
    "--report-purple-bg": s.aiSoftBg,
    "--report-purple-border": "var(--berry-300)",
    "--report-purple-fg": s.aiBg,
    "--report-green-tint": s.successBg,
    "--report-green-badge": s.successBg,
    "--report-green-border": "var(--green-200)",
    "--report-green-deep": s.successFg,
    "--report-red": "var(--cherry-500)",
    "--report-amber": s.warningFg,

    "--status-paused-fg": s.dangerFg,
    "--status-analysis-fg": s.aiSoftFg,
    "--vitals-healthy": s.successFg,
    "--vitals-unhealthy": "var(--cherry-500)",
  };
}
