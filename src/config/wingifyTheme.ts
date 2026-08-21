/**
 * Wingify theme — maps wingifyThemeTokens.json onto app CSS roles.
 * Applied only when themeId === "wingify" (via brandEngine). Other themes unchanged.
 * Fonts from the pack are intentionally not applied.
 */

import type { ColorMode } from "./themes";

/** HSL channel triples (no `hsl()` wrapper) — matches index.css convention. */
const c = {
  /* Neutral */
  white: "0 0% 100%", // #FFFFFF · 50
  canvas: "40 33.3% 94.7%", // #F6F3ED · 100
  feather: "40 22.4% 86.9%", // #E5E0D6 · 150
  stone: "41.3 18.2% 82.7%", // #DBD6CB · 200
  dusk: "42.4 9.9% 66.5%", // #B2ADA1 · 300
  ash: "41.2 7.2% 56.5%", // #989388 · 400
  fog: "42.9 6.1% 44.7%", // #79756B · 500
  twilight: "45 6.7% 34.9%", // #5F5C53 · 600
  slate: "49.1 7.5% 28.8%", // #4F4D44 · 700
  charcoal: "42 9.1% 21.6%", // #3C3932 · 800
  near: "45 10.3% 15.3%", // #2B2923 · 900
  ink: "45 17.4% 9%", // #1B1913 · 950

  /* Yellow / selection */
  lemon: "67 100% 71.4%", // #EEFF6D
  selectHoverD: "65.9 80.4% 10%", // #2A2E05
  fieldHoverL: "69.6 80.6% 87.8%", // #F1F9C7

  /* Danger */
  danger: "11.7 98.2% 43.9%", // #DE2D02
  dangerSubtleL: "10.3 100% 93.1%", // #FFE2DC
  dangerSubtleD: "9.6 77.5% 17.5%", // #4F150A
  dangerTextL: "9.9 83.6% 31.2%", // #92230D
  dangerTextD: "10.5 94% 73.7%", // #FB937D

  /* Warning */
  warnSubtleL: "30.5 100% 89.2%", // #FFE4C8
  warnSubtleD: "33.9 100% 12.2%", // #3E2300
  warnTextL: "36.2 100% 21.8%", // #6F4300
  warnTextD: "32.5 76.4% 60.2%", // #E7A04C

  /* Success */
  okSubtleL: "148.5 60.6% 87.1%", // #CAF2DD
  okSubtleD: "157.5 100% 9.4%", // #00301E
  okTextL: "159.5 100% 17.3%", // #00583A
  okTextD: "160 93.2% 40.4%", // #07C787
  okBorderL: "149.1 54.2% 76.9%", // #A4E4C3

  /* Info */
  infoSubtleL: "220 100% 93.5%", // #DEE9FF
  infoSubtleD: "224.3 60.7% 21%", // #152656
  infoTextL: "225 60% 39.2%", // #2846A0
  infoTextD: "222.4 100% 77.3%", // #8BADFF
  infoBorderL: "220.7 100% 88.4%", // #C4D7FF

  /* AI */
  ai: "315.8 58.7% 50.6%", // #CB37A4
  aiSubtleL: "321.3 100% 93.9%", // #FFE0F4
  aiSubtleD: "316.8 53.2% 18.4%", // #48163A
  aiTextL: "315.3 55.3% 33.3%", // #84266C
  aiTextD: "315.9 89.6% 73.5%", // #F87FD8
  aiBorderL: "322.1 100% 88.8%", // #FFC6EA
} as const;

/**
 * Full Wingify semantic → app role map for one color mode.
 * Surfaces follow the pack: base/overlay/nav = white (light); pane/raised = #F6F3ED.
 */
export function computeWingifyThemeVars(
  mode: ColorMode
): Record<string, string> {
  if (mode === "dark") {
    return {
      /* Text */
      "--foreground": c.canvas,
      "--muted-foreground": c.dusk,
      "--card-foreground": c.canvas,
      "--popover-foreground": c.canvas,
      "--panel-foreground": c.canvas,
      "--rail-foreground": c.canvas,

      /* Borders */
      "--border": c.charcoal,
      "--surface-border": c.charcoal,
      "--panel-border": c.charcoal,
      "--input": c.fog,

      /* Surfaces — base / raised / overlay / nav / pane */
      "--background": c.ink,
      "--card": c.near,
      "--popover": c.charcoal,
      "--muted": c.near,
      "--canvas": c.ink,
      "--surface": c.near,
      "--rail": c.near,
      "--panel": c.ink,
      "--listing-header-bg": c.ink,
      "--listing-header-fg": c.canvas,

      /* Primary fill */
      "--primary": c.canvas,
      "--primary-foreground": c.ink,
      "--primary-hover": c.stone,
      "--primary-active": c.dusk,
      "--primary-subtle": c.charcoal,
      "--primary-border": c.canvas,
      "--cta-secondary-fg": c.canvas,
      /* Form controls — pack select.* (fill lemon, mark ink, edge lemon in dark) */
      "--control": c.lemon,
      "--control-foreground": c.ink,
      "--control-border": c.lemon,
      "--control-selected-bg": c.lemon,
      "--control-selected-fg": c.ink,
      "--control-selected-border": c.lemon,
      "--ring": c.canvas,
      "--brand-deep": c.ink,

      /* CTA tertiary + AI (button hierarchy) */
      "--cta-tertiary-bg": c.charcoal,
      "--cta-tertiary-fg": c.canvas,
      "--cta-tertiary-border": c.charcoal,
      "--cta-tertiary-hover": c.slate,
      "--cta-ai-bg": c.ai,
      "--cta-ai-fg": c.white,
      "--cta-ai-hover": c.aiTextD,
      "--cta-disabled-bg": c.near,
      "--cta-disabled-fg": c.fog,

      /* Secondary / tertiary fills */
      "--secondary": c.charcoal,
      "--secondary-foreground": c.canvas,
      "--secondary-hover": c.slate,

      /* Selection / accent */
      "--accent": c.lemon,
      "--accent-foreground": c.ink,
      "--selected-bg": c.lemon,
      "--selected-fg": c.ink,
      "--rail-active": c.lemon,
      "--rail-active-foreground": c.ink,
      "--brand-feather": c.selectHoverD,

      /* Links (info) */
      "--link": c.infoTextD,
      "--link-hover": c.infoBorderL,

      /* Danger solid */
      "--destructive": c.danger,
      "--destructive-foreground": c.white,

      /* Status semantics */
      "--success-fg": c.okTextD,
      "--success-bg": c.okSubtleD,
      "--success-solid": c.okTextD,
      "--danger-fg": c.dangerTextD,
      "--danger-bg": c.dangerSubtleD,
      "--danger-on-subtle": c.dangerTextD,
      "--warning-fg": c.warnTextD,
      "--warning-bg": c.warnSubtleD,
      "--warning-solid": c.warnTextD,
      "--info-fg": c.infoTextD,
      "--info-bg": c.infoSubtleD,
      "--highlight-fg": c.aiTextD,
      "--highlight-bg": c.aiSubtleD,

      /* Report chrome */
      "--report-brand": c.canvas,
      "--report-brand-fg": c.canvas,
      "--report-brand-tint": c.charcoal,
      "--report-link": c.infoTextD,
      "--report-track": c.slate,
      "--report-info-bg": c.infoSubtleD,
      "--report-blue-bg": c.infoSubtleD,
      "--report-blue-border": c.infoTextL,
      "--report-blue-fg": c.infoTextD,
      "--report-purple-bg": c.aiSubtleD,
      "--report-purple-border": c.aiTextL,
      "--report-purple-fg": c.aiTextD,
      "--report-green-tint": c.okSubtleD,
      "--report-green-badge": c.okSubtleD,
      "--report-green-border": c.okTextL,
      "--report-green-deep": c.okTextD,
      "--report-red": c.danger,
      "--report-amber": c.warnTextD,

      /* Status badges / vitals (pack-aligned) */
      "--status-paused-fg": c.dangerTextD,
      "--status-analysis-fg": c.aiTextD,
      "--vitals-healthy": c.okTextD,
      "--vitals-unhealthy": c.danger,
    };
  }

  return {
    /* Text */
    "--foreground": c.ink,
    "--muted-foreground": c.twilight,
    "--card-foreground": c.ink,
    "--popover-foreground": c.ink,
    "--panel-foreground": c.ink,
    "--rail-foreground": c.ink,

    /* Borders — default + strong (input) */
    "--border": c.stone,
    "--surface-border": c.stone,
    "--panel-border": c.stone,
    "--input": c.ash,

    /* Surfaces
       base/overlay/nav → white chrome & cards
       raised/pane → warm #F6F3ED content plane */
    "--background": c.white,
    "--card": c.white,
    "--popover": c.white,
    "--muted": c.canvas,
    "--canvas": c.canvas,
    "--surface": c.canvas,
    "--rail": c.white,
    "--panel": c.white,
    "--listing-header-bg": c.white,
    "--listing-header-fg": c.ink,

    /* Primary fill — fg is pack canvas #F6F3ED, not pure white */
    "--primary": c.ink,
    "--primary-foreground": c.canvas,
    "--primary-hover": c.charcoal,
    "--primary-active": c.slate,
    "--primary-subtle": c.feather,
    "--primary-border": c.ink,
    "--cta-secondary-fg": c.ink,
    /* Form controls — pack select.* (fill lemon, mark + edge ink) */
    "--control": c.lemon,
    "--control-foreground": c.ink,
    "--control-border": c.ink,
    "--control-selected-bg": c.lemon,
    "--control-selected-fg": c.ink,
    "--control-selected-border": c.ink,
    "--ring": c.near,
    "--brand-deep": c.ink,

    /* CTA tertiary + AI (button hierarchy) */
    "--cta-tertiary-bg": c.feather,
    "--cta-tertiary-fg": c.ink,
    "--cta-tertiary-border": c.feather,
    "--cta-tertiary-hover": c.stone,
    "--cta-ai-bg": c.ai,
    "--cta-ai-fg": c.white,
    "--cta-ai-hover": c.aiTextL,
    "--cta-disabled-bg": c.canvas,
    "--cta-disabled-fg": c.dusk,

    /* Secondary / tertiary */
    "--secondary": c.white,
    "--secondary-foreground": c.ink,
    "--secondary-hover": c.canvas,

    /* Selection / accent */
    "--accent": c.lemon,
    "--accent-foreground": c.ink,
    "--selected-bg": c.lemon,
    "--selected-fg": c.ink,
    "--rail-active": c.lemon,
    "--rail-active-foreground": c.ink,
    "--brand-feather": c.fieldHoverL,

    /* Links (info) */
    "--link": c.infoTextL,
    "--link-hover": c.infoTextL,

    /* Danger solid */
    "--destructive": c.danger,
    "--destructive-foreground": c.white,

    /* Status semantics */
    "--success-fg": c.okTextL,
    "--success-bg": c.okSubtleL,
    "--success-solid": c.okTextL,
    "--danger-fg": c.dangerTextL,
    "--danger-bg": c.dangerSubtleL,
    "--danger-on-subtle": c.dangerTextL,
    "--warning-fg": c.warnTextL,
    "--warning-bg": c.warnSubtleL,
    "--warning-solid": c.warnTextD,
    "--info-fg": c.infoTextL,
    "--info-bg": c.infoSubtleL,
    "--highlight-fg": c.aiTextL,
    "--highlight-bg": c.aiSubtleL,

    /* Report chrome */
    "--report-brand": c.ink,
    "--report-brand-fg": c.ink,
    "--report-brand-tint": c.canvas,
    "--report-link": c.infoTextL,
    "--report-track": c.stone,
    "--report-info-bg": c.infoSubtleL,
    "--report-blue-bg": c.infoSubtleL,
    "--report-blue-border": c.infoBorderL,
    "--report-blue-fg": c.infoTextL,
    "--report-purple-bg": c.aiSubtleL,
    "--report-purple-border": c.aiBorderL,
    "--report-purple-fg": c.ai,
    "--report-green-tint": c.okSubtleL,
    "--report-green-badge": c.okSubtleL,
    "--report-green-border": c.okBorderL,
    "--report-green-deep": c.okTextL,
    "--report-red": c.danger,
    "--report-amber": c.warnTextD,

    /* Status badges / vitals */
    "--status-paused-fg": c.dangerTextL,
    "--status-analysis-fg": c.aiTextL,
    "--vitals-healthy": c.okTextL,
    "--vitals-unhealthy": c.danger,
  };
}
