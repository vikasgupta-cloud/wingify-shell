/**
 * Brand engine — theme presets (primary, ring, links, report brand).
 * Charts are not derived here; they stay on `--chart-*` in index.css.
 *
 * Everything here returns `hsl`-less `var(--vwo-*)` references (resolved by
 * index.css), so the values follow light/dark like the rest of the system.
 */

import type { ColorMode, ThemeId } from "./themes";
import { THEME_IDS, COLOR_MODES } from "./themes";
import { computeWingifyThemeVars } from "./wingifyTheme";

/** A raw VWO scale family reference. `midnight` has a single `base` step. */
export function familyStepVar(family: string, step: string): string {
  if (family === "midnight") return "var(--vwo-midnight-base)";
  return `var(--vwo-${family}-${step})`;
}

// ── Theme presets ────────────────────────────────────────────────────────────
//
// Each theme = an accent family plus an EXACT per-mode var map. Keeping the map
// explicit preserves every bespoke tweak (yellow's neutral-950 brand-deep, midnight's
// dark action tokens, yellow/midnight/neutral-black not tinting links/selection). Chart tokens
// are omitted on purpose (except Wingify, which sets charts via data-theme CSS).
// Adding a theme = one entry here + THEME_IDS + swatches.

const v = familyStepVar;

type ModeVars = Record<string, string>;

const THEME_VAR_SPEC: Record<string, { light: ModeVars; dark: ModeVars }> = {
  yellow: {
    light: {
      "--primary": v("yellow", "50"),
      "--primary-foreground": "var(--vwo-neutral-950)",
      "--primary-hover": v("yellow", "100"),
      "--primary-active": v("yellow", "200"),
      "--primary-subtle": v("yellow", "100"),
      "--primary-border": "var(--vwo-neutral-950)",
      "--ring": v("yellow", "300"),
      "--brand-deep": v("maroon", "900"),
    },
    dark: {
      "--primary": v("yellow", "50"),
      "--primary-foreground": "var(--vwo-neutral-950)",
      "--primary-hover": v("yellow", "100"),
      "--primary-active": v("yellow", "200"),
      "--primary-subtle": "var(--vwo-dark-bg-hover)",
      "--primary-border": "var(--vwo-neutral-950)",
      "--ring": v("yellow", "200"),
    },
  },
  maroon: {
    light: {
      "--primary": v("maroon", "900"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("maroon", "800"),
      "--primary-active": v("maroon", "700"),
      "--primary-subtle": v("maroon", "100"),
      "--primary-border": "var(--primary)",
      "--ring": v("maroon", "700"),
      "--accent": v("maroon", "100"),
      "--selected-bg": v("maroon", "100"),
      "--selected-fg": v("maroon", "800"),
      "--link": v("maroon", "700"),
      "--link-hover": v("maroon", "800"),
      "--brand-deep": v("maroon", "900"),
      "--report-brand": v("maroon", "900"),
      "--report-brand-fg": v("maroon", "800"),
      "--report-brand-tint": v("maroon", "50"),
      "--report-link": v("maroon", "700"),
    },
    dark: {
      "--primary": v("maroon", "400"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("maroon", "300"),
      "--primary-active": v("maroon", "500"),
      "--primary-subtle": v("maroon", "900"),
      "--primary-border": "var(--primary)",
      "--ring": v("maroon", "300"),
      "--accent": v("maroon", "900"),
      "--accent-foreground": v("maroon", "100"),
      "--selected-bg": v("maroon", "900"),
      "--selected-fg": v("maroon", "200"),
      "--link": v("maroon", "300"),
      "--link-hover": v("maroon", "200"),
      "--brand-deep": v("maroon", "900"),
    },
  },
  cherry: {
    light: {
      "--primary": v("cherry", "400"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("cherry", "500"),
      "--primary-active": v("cherry", "600"),
      "--primary-subtle": v("cherry", "100"),
      "--primary-border": "var(--primary)",
      "--ring": v("cherry", "400"),
      "--accent": v("cherry", "100"),
      "--selected-bg": v("cherry", "100"),
      "--selected-fg": v("cherry", "700"),
      "--link": v("cherry", "500"),
      "--link-hover": v("cherry", "600"),
      "--brand-deep": v("cherry", "900"),
      "--report-brand": v("cherry", "900"),
      "--report-brand-fg": v("cherry", "800"),
      "--report-brand-tint": v("cherry", "50"),
      "--report-link": v("cherry", "500"),
    },
    dark: {
      "--primary": v("cherry", "400"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("cherry", "300"),
      "--primary-active": v("cherry", "500"),
      "--primary-subtle": v("cherry", "900"),
      "--primary-border": "var(--primary)",
      "--ring": v("cherry", "300"),
      "--accent": v("cherry", "900"),
      "--accent-foreground": v("cherry", "100"),
      "--selected-bg": v("cherry", "900"),
      "--selected-fg": v("cherry", "200"),
      "--link": v("cherry", "300"),
      "--link-hover": v("cherry", "200"),
      "--brand-deep": v("cherry", "900"),
    },
  },
  black: {
    light: {
      "--primary": "var(--vwo-midnight-base)",
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("neutral", "900"),
      "--primary-active": v("neutral", "800"),
      "--primary-subtle": v("neutral", "100"),
      "--primary-border": "var(--primary)",
      "--ring": v("neutral", "800"),
      "--brand-deep": "var(--vwo-midnight-base)",
      "--report-brand": v("neutral", "900"),
      "--report-brand-fg": v("neutral", "800"),
      "--report-brand-tint": v("neutral", "50"),
    },
    dark: {
      "--primary": "var(--vwo-dark-action-primary-bg)",
      "--primary-foreground": "var(--vwo-dark-action-primary-text)",
      "--primary-hover": "var(--vwo-dark-action-primary-bg-hover)",
      "--primary-active": "var(--vwo-dark-action-primary-bg-active)",
      "--primary-subtle": "var(--vwo-dark-bg-hover)",
      "--primary-border": "var(--primary)",
      "--ring": v("neutral", "100"),
      "--brand-deep": v("neutral", "900"),
    },
  },
  // Black primary CTA with deliberate yellow interaction signals.
  "black-yellow": {
    light: {
      "--primary": "var(--vwo-midnight-base)",
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("yellow", "50"),
      "--primary-hover-foreground": "var(--vwo-midnight-base)",
      "--primary-active": v("neutral", "950"),
      "--primary-subtle": v("neutral", "100"),
      "--primary-border": "var(--primary)",
      "--ring": v("yellow", "300"),
      "--rail-active": v("yellow", "50"),
      "--rail-active-foreground": "var(--vwo-midnight-base)",
      "--main-nav-hover-background": v("yellow", "100"),
      "--main-nav-hover-foreground": "var(--vwo-midnight-base)",
      // Selected/on fill for checkbox, radio, toggle.
      "--control-selected-bg": v("yellow", "50"),
      "--control-selected-fg": "var(--vwo-midnight-base)",
      "--control-selected-border": v("yellow", "200"),
      // Field hover wash (inputs + dropdowns) — background only.
      "--field-hover-bg": v("yellow", "100"),
      // Table row hover — lightest yellow.
      "--table-row-hover": v("yellow", "50"),
      "--brand-deep": "var(--vwo-midnight-base)",
      "--report-brand": v("neutral", "900"),
      "--report-brand-fg": v("neutral", "800"),
      "--report-brand-tint": v("neutral", "50"),
    },
    dark: {
      "--primary": "var(--vwo-dark-action-primary-bg)",
      "--primary-foreground": "var(--vwo-dark-action-primary-text)",
      "--primary-hover": v("yellow", "50"),
      "--primary-hover-foreground": "var(--vwo-midnight-base)",
      "--primary-active": "var(--vwo-midnight-base)",
      "--primary-subtle": "var(--vwo-dark-bg-hover)",
      "--primary-border": "var(--primary)",
      "--ring": v("yellow", "200"),
      "--rail-active": v("yellow", "50"),
      "--rail-active-foreground": "var(--vwo-midnight-base)",
      "--main-nav-hover-background": v("yellow", "100"),
      "--main-nav-hover-foreground": "var(--vwo-midnight-base)",
      "--control-selected-bg": v("yellow", "50"),
      "--control-selected-fg": "var(--vwo-midnight-base)",
      "--control-selected-border": v("yellow", "200"),
      "--field-hover-bg": v("yellow", "100"),
      "--table-row-hover": v("yellow", "50"),
      "--brand-deep": v("neutral", "900"),
    },
  },
  maroon: {
    light: {
      "--primary": v("maroon", "900"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("maroon", "800"),
      "--primary-active": v("maroon", "700"),
      "--primary-subtle": v("maroon", "100"),
      "--primary-border": "var(--primary)",
      "--ring": v("maroon", "900"),
      "--accent": v("maroon", "100"),
      "--selected-bg": v("maroon", "100"),
      "--selected-fg": v("maroon", "800"),
      "--link": v("maroon", "700"),
      "--link-hover": v("maroon", "800"),
      "--brand-deep": v("maroon", "900"),
      "--report-brand": v("maroon", "900"),
      "--report-brand-fg": v("maroon", "800"),
      "--report-brand-tint": v("maroon", "50"),
      "--report-link": v("maroon", "700"),
    },
    dark: {
      "--primary": v("maroon", "900"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("maroon", "800"),
      "--primary-active": v("maroon", "700"),
      "--primary-subtle": v("maroon", "900"),
      "--primary-border": "var(--primary)",
      "--ring": v("maroon", "400"),
      "--accent": v("maroon", "900"),
      "--accent-foreground": v("maroon", "100"),
      "--selected-bg": v("maroon", "900"),
      "--selected-fg": v("maroon", "200"),
      "--link": v("maroon", "300"),
      "--link-hover": v("maroon", "200"),
      "--brand-deep": v("maroon", "900"),
    },
  },
  /**
   * Neutral black as Primary — button.primary = neutral/950 (light) /
   * neutral/100 (dark). Links stay ocean (semantic text.link).
   */
  "neutral-black": {
    light: {
      "--primary": v("neutral", "950"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("neutral", "900"),
      "--primary-active": v("neutral", "800"),
      "--primary-subtle": v("neutral", "100"),
      "--primary-border": "var(--primary)",
      "--ring": v("neutral", "800"),
      "--brand-deep": v("neutral", "950"),
      "--report-brand": v("neutral", "950"),
      "--report-brand-fg": v("neutral", "900"),
      "--report-brand-tint": v("neutral", "50"),
    },
    dark: {
      "--primary": v("neutral", "100"),
      "--primary-foreground": v("neutral", "950"),
      "--primary-hover": v("neutral", "50"),
      "--primary-active": v("neutral", "200"),
      "--primary-subtle": v("neutral", "800"),
      "--primary-border": "var(--primary)",
      "--ring": v("neutral", "100"),
      "--brand-deep": v("neutral", "950"),
      "--report-brand": v("neutral", "100"),
      "--report-brand-fg": v("neutral", "50"),
      "--report-brand-tint": v("neutral", "800"),
    },
  },
  /** Full Wingify pack colors — see wingifyTheme.ts / wingifyThemeTokens.json */
  wingify: {
    light: computeWingifyThemeVars("light"),
    dark: computeWingifyThemeVars("dark"),
  },
};

/** Full brand-var map for a theme + mode (no chart tokens). */
export function computeThemeVars(
  themeId: ThemeId,
  mode: ColorMode
): Record<string, string> {
  return { ...THEME_VAR_SPEC[themeId][mode] };
}

/**
 * Union of every var key any theme sets, in any mode. Used by the apply layer to
 * clear stale inline values on switch (a theme that omits a key falls back to
 * [data-mode], reproducing the old cascade exactly).
 */
export const THEME_VARS: readonly string[] = Array.from(
  new Set(
    THEME_IDS.flatMap((id) =>
      COLOR_MODES.flatMap((mode) => Object.keys(computeThemeVars(id, mode)))
    )
  )
);
