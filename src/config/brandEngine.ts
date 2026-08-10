/**
 * Brand engine — theme presets (primary, ring, links, report brand).
 * Charts are not derived here; they stay on `--chart-*` in index.css.
 *
 * Everything here returns `hsl`-less `var(--vwo-*)` references (resolved by
 * index.css), so the values follow light/dark like the rest of the system.
 */

import type { ColorMode, ThemeId } from "./themes";
import { THEME_IDS, COLOR_MODES } from "./themes";

/** A raw VWO scale family reference. `midnight` has a single `base` step. */
export function familyStepVar(family: string, step: string): string {
  if (family === "midnight") return "var(--vwo-midnight-base)";
  return `var(--vwo-${family}-${step})`;
}

// ── Theme presets ────────────────────────────────────────────────────────────
//
// Each theme = an accent family plus an EXACT per-mode var map. Keeping the map
// explicit preserves every bespoke tweak (yellow's maroon brand-deep, midnight's
// dark action tokens, yellow/midnight not tinting links/selection). Chart tokens
// are omitted on purpose. Adding a theme = one entry here + THEME_IDS + swatches.

const v = familyStepVar;

type ModeVars = Record<string, string>;

const THEME_VAR_SPEC: Record<ThemeId, { light: ModeVars; dark: ModeVars }> = {
  yellow: {
    light: {
      "--primary": v("yellow", "50"),
      "--primary-foreground": "var(--vwo-midnight-base)",
      "--primary-hover": v("yellow", "100"),
      "--primary-active": v("yellow", "200"),
      "--primary-subtle": v("yellow", "100"),
      "--primary-border": "var(--primary-active)",
      "--ring": v("yellow", "300"),
      "--brand-deep": v("maroon", "900"),
    },
    dark: {
      "--primary": v("yellow", "50"),
      "--primary-foreground": "var(--vwo-midnight-base)",
      "--primary-hover": v("yellow", "100"),
      "--primary-active": v("yellow", "200"),
      "--primary-subtle": "var(--vwo-dark-bg-hover)",
      "--primary-border": "var(--primary-active)",
      "--ring": v("yellow", "200"),
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
  green: {
    light: {
      "--primary": v("green", "800"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("green", "700"),
      "--primary-active": v("green", "900"),
      "--primary-subtle": v("green", "100"),
      "--primary-border": "var(--primary)",
      "--ring": v("green", "800"),
      "--accent": v("green", "100"),
      "--selected-bg": v("green", "100"),
      "--selected-fg": v("green", "700"),
      "--link": v("green", "600"),
      "--link-hover": v("green", "700"),
      "--brand-deep": v("green", "900"),
      "--report-brand": v("green", "800"),
      "--report-brand-fg": v("green", "700"),
      "--report-brand-tint": v("green", "50"),
      "--report-link": v("green", "600"),
    },
    dark: {
      "--primary": v("green", "800"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("green", "700"),
      "--primary-active": v("green", "900"),
      "--primary-subtle": v("green", "900"),
      "--primary-border": "var(--primary)",
      "--ring": v("green", "300"),
      "--accent": v("green", "900"),
      "--accent-foreground": v("green", "100"),
      "--selected-bg": v("green", "900"),
      "--selected-fg": v("green", "200"),
      "--link": v("green", "300"),
      "--link-hover": v("green", "200"),
      "--brand-deep": v("green", "900"),
    },
  },
  midnight: {
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
  berry: {
    light: {
      "--primary": v("berry", "500"),
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": v("berry", "600"),
      "--primary-active": v("berry", "700"),
      "--primary-subtle": v("berry", "100"),
      "--primary-border": "var(--primary)",
      "--ring": v("berry", "400"),
      "--accent": v("berry", "100"),
      "--selected-bg": v("berry", "100"),
      "--selected-fg": v("berry", "700"),
      "--link": v("berry", "500"),
      "--link-hover": v("berry", "600"),
      "--brand-deep": v("berry", "900"),
      "--report-brand": v("berry", "800"),
      "--report-brand-fg": v("berry", "700"),
      "--report-brand-tint": v("berry", "50"),
      "--report-link": v("berry", "500"),
    },
    dark: {
      "--primary": v("berry", "300"),
      "--primary-foreground": "var(--vwo-midnight-base)",
      "--primary-hover": v("berry", "200"),
      "--primary-active": v("berry", "400"),
      "--primary-subtle": v("berry", "900"),
      "--primary-border": "var(--primary)",
      "--ring": v("berry", "300"),
      "--accent": v("berry", "900"),
      "--accent-foreground": v("berry", "100"),
      "--selected-bg": v("berry", "900"),
      "--selected-fg": v("berry", "200"),
      "--link": v("berry", "300"),
      "--link-hover": v("berry", "200"),
      "--brand-deep": v("berry", "900"),
    },
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
