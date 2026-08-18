/**
 * Wingify theme — colors only from wingifyThemeTokens.json.
 * Fonts/spacing/layout are intentionally not applied here.
 */

import type { ColorMode } from "./themes";

/** HSL channel triples (no `hsl()` wrapper) — matches index.css convention. */
const c = {
  ink: "45 17.4% 9%", // #1B1913
  canvas: "40 33.3% 94.7%", // #F6F3ED
  white: "0 0% 100%", // #FFFFFF
  feather: "40 22.4% 86.9%", // #E5E0D6
  stone: "41.3 18.2% 82.7%", // #DBD6CB
  dusk: "42.4 9.9% 66.5%", // #B2ADA1
  ash: "41.2 7.2% 56.5%", // #989388
  fog: "42.9 6.1% 44.7%", // #79756B
  twilight: "45 6.7% 34.9%", // #5F5C53
  slate: "49.1 7.5% 28.8%", // #4F4D44
  charcoal: "42 9.1% 21.6%", // #3C3932
  near: "45 10.3% 15.3%", // #2B2923
  lemon: "67 100% 71.4%", // #EEFF6D
  lemonDeep: "64.4 100% 24.1%", // #727B00
  selectHoverL: "70.6 89.5% 92.5%", // #F7FDDB
  selectHoverD: "65.9 80.4% 10%", // #2A2E05
  fieldHoverL: "69.6 80.6% 87.8%", // #F1F9C7
  fieldHoverD: "67.5 59.3% 10.6%", // #272B0B
  accentHoverL: "68.5 76.5% 80%", // #E8F3A5
  accentHoverD: "65.7 100% 12.4%", // #393F00
  danger: "11.7 98.2% 43.9%", // #DE2D02
  dangerSubtleL: "10.3 100% 93.1%", // #FFE2DC
  dangerSubtleD: "9.6 77.5% 17.5%", // #4F150A
  dangerTextL: "9.9 83.6% 31.2%", // #92230D
  dangerTextD: "10.5 94% 73.7%", // #FB937D
  dangerBorderL: "11.1 100% 87.3%", // #FFCABE
  warnSubtleL: "30.5 100% 89.2%", // #FFE4C8
  warnSubtleD: "33.9 100% 12.2%", // #3E2300
  warnTextL: "36.2 100% 21.8%", // #6F4300
  warnTextD: "32.5 76.4% 60.2%", // #E7A04C
  okSubtleL: "148.5 60.6% 87.1%", // #CAF2DD
  okSubtleD: "157.5 100% 9.4%", // #00301E
  okTextL: "159.5 100% 17.3%", // #00583A
  okTextD: "160 93.2% 40.4%", // #07C787
  okBorderL: "149.1 54.2% 76.9%", // #A4E4C3
  infoSubtleL: "220 100% 93.5%", // #DEE9FF
  infoSubtleD: "224.3 60.7% 21%", // #152656
  infoTextL: "225 60% 39.2%", // #2846A0
  infoTextD: "222.4 100% 77.3%", // #8BADFF
  infoBorderL: "220.7 100% 88.4%", // #C4D7FF
  ai: "315.8 58.7% 50.6%", // #CB37A4
  aiSubtleL: "321.3 100% 93.9%", // #FFE0F4
  aiSubtleD: "316.8 53.2% 18.4%", // #48163A
  aiTextL: "315.3 55.3% 33.3%", // #84266C
  aiTextD: "315.9 89.6% 73.5%", // #F87FD8
  aiBorderL: "322.1 100% 88.8%", // #FFC6EA
} as const;

/** App CSS roles driven by the Wingify pack (no chart vars — CSS data-theme). */
export function computeWingifyThemeVars(mode: ColorMode): Record<string, string> {
  if (mode === "dark") {
    return {
      "--background": c.ink,
      "--foreground": c.canvas,
      "--card": c.near,
      "--card-foreground": c.canvas,
      "--popover": c.charcoal,
      "--popover-foreground": c.canvas,
      "--primary": c.canvas,
      "--primary-foreground": c.ink,
      "--primary-hover": c.stone,
      "--primary-active": c.dusk,
      "--primary-subtle": c.charcoal,
      "--primary-border": c.canvas,
      "--cta-secondary-fg": c.canvas,
      "--control": c.canvas,
      "--control-foreground": c.ink,
      "--control-border": c.canvas,
      "--secondary": c.charcoal,
      "--secondary-foreground": c.canvas,
      "--secondary-hover": c.slate,
      "--muted": c.charcoal,
      "--muted-foreground": c.dusk,
      "--canvas": c.ink,
      "--surface": c.ink,
      "--surface-border": c.charcoal,
      "--accent": c.lemon,
      "--accent-foreground": c.ink,
      "--selected-bg": c.lemon,
      "--selected-fg": c.ink,
      "--link": c.infoTextD,
      "--link-hover": c.infoBorderL,
      "--brand-deep": c.ink,
      "--border": c.charcoal,
      "--input": c.fog,
      "--ring": c.canvas,
      "--destructive": c.danger,
      "--destructive-foreground": c.white,
      "--rail": c.near,
      "--rail-foreground": c.canvas,
      "--rail-active": c.lemon,
      "--rail-active-foreground": c.ink,
      "--panel": c.ink,
      "--panel-foreground": c.canvas,
      "--panel-border": c.charcoal,
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
      "--report-brand": c.canvas,
      "--report-brand-fg": c.canvas,
      "--report-brand-tint": c.charcoal,
      "--report-link": c.infoTextD,
      "--brand-feather": c.selectHoverD,
    };
  }

  return {
    "--background": c.white,
    "--foreground": c.ink,
    "--card": c.white,
    "--card-foreground": c.ink,
    "--popover": c.white,
    "--popover-foreground": c.ink,
    "--primary": c.ink,
    "--primary-foreground": c.canvas,
    "--primary-hover": c.charcoal,
    "--primary-active": c.slate,
    "--primary-subtle": c.feather,
    "--primary-border": c.ink,
    "--cta-secondary-fg": c.ink,
    "--control": c.ink,
    "--control-foreground": c.canvas,
    "--control-border": c.ink,
    "--secondary": c.white,
    "--secondary-foreground": c.ink,
    "--secondary-hover": c.canvas,
    "--muted": c.canvas,
    "--muted-foreground": c.twilight,
    "--canvas": c.canvas,
    "--surface": c.canvas,
    "--surface-border": c.stone,
    "--accent": c.lemon,
    "--accent-foreground": c.ink,
    "--selected-bg": c.lemon,
    "--selected-fg": c.ink,
    "--link": c.infoTextL,
    "--link-hover": c.infoTextL,
    "--brand-deep": c.ink,
    "--border": c.stone,
    "--input": c.ash,
    "--ring": c.near,
    "--destructive": c.danger,
    "--destructive-foreground": c.white,
    "--rail": c.white,
    "--rail-foreground": c.ink,
    "--rail-active": c.lemon,
    "--rail-active-foreground": c.ink,
    "--panel": c.white,
    "--panel-foreground": c.ink,
    "--panel-border": c.stone,
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
    "--report-brand": c.ink,
    "--report-brand-fg": c.ink,
    "--report-brand-tint": c.canvas,
    "--report-link": c.infoTextL,
    "--brand-feather": c.fieldHoverL,
  };
}

export const WINGIFY_CHART_LIGHT = [
  "27.8 100% 26.7%", // #883F00
  "49.4 100% 27.8%", // #8E7500
  "71.2 100% 34.5%", // #8FB000
  "155.3 100% 22.4%", // #007243
  "188.6 100% 32.9%", // #0090A8
  "201.8 100% 35.1%", // #0072B3
  "256.7 51.4% 50.8%", // #6541C2
  "286.4 68.8% 66.1%", // #C96DE4
] as const;

export const WINGIFY_CHART_DARK = [
  "28.2 100% 32.5%", // #A64E00
  "49.7 100% 36.7%", // #BB9B00
  "75.5 59% 58.8%", // #B4D458
  "156 100% 29.4%", // #00965A
  "188.5 100% 42.9%", // #00BCDB
  "201.9 100% 37.6%", // #007AC0
  "251.8 72.8% 71.2%", // #9580EB
  "286.5 100% 80.8%", // #E99DFF
] as const;
