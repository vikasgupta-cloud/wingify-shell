/**
 * Brand engine — shared derivation of brand-driven CSS variables from a colour
 * family + mode. Stage 1 uses it for the categorical CHART palette so a custom
 * CTA re-skins the whole series set (not just the lead). Stage 2 will route the
 * theme presets through the same engine so adding a theme is a single entry.
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

type SeriesSpec = {
  family: string;
  light: string;
  dark: string;
  /** Label ink over a solid fill of this family: pale families need dark ink. */
  ink: "white" | "midnight";
};

/**
 * Canonical categorical rotation — a distinguishable multi-hue order. The active
 * accent takes series 1; series 2…8 draw from this list (accent removed), so the
 * whole palette follows the accent while staying visually separable. Steps are
 * mode-tuned to mirror the values the hand-authored theme blocks use today.
 */
export const CANONICAL_SERIES: readonly SeriesSpec[] = [
  { family: "ocean", light: "500", dark: "400", ink: "white" },
  { family: "green", light: "400", dark: "300", ink: "white" },
  { family: "berry", light: "500", dark: "300", ink: "white" },
  { family: "amber", light: "300", dark: "300", ink: "midnight" },
  { family: "cherry", light: "500", dark: "400", ink: "white" },
  { family: "maroon", light: "400", dark: "300", ink: "white" },
  { family: "neutral", light: "400", dark: "300", ink: "midnight" },
  { family: "yellow", light: "300", dark: "100", ink: "midnight" },
];

const inkVar = (ink: SeriesSpec["ink"]) =>
  ink === "white" ? "var(--vwo-neutral-0)" : "var(--vwo-midnight-base)";

/**
 * Fill + label-ink vars for the categorical series 2…8, given the accent family
 * that already owns series 1. Returns `--chart-2`…`--chart-8` and their `-fg`.
 * Deterministic; the accent family is skipped so it never repeats.
 */
export function categoricalChartVars(
  accentFamily: string,
  mode: ColorMode
): Record<string, string> {
  const pool = CANONICAL_SERIES.filter((s) => s.family !== accentFamily).slice(
    0,
    7
  );
  const out: Record<string, string> = {};
  pool.forEach((s, i) => {
    const slot = i + 2; // series 1 is the accent (set elsewhere)
    const step = mode === "dark" ? s.dark : s.light;
    out[`--chart-${slot}`] = familyStepVar(s.family, step);
    out[`--chart-${slot}-fg`] = inkVar(s.ink);
  });
  return out;
}

// ── Theme presets ────────────────────────────────────────────────────────────
//
// Each theme = an accent family (drives series 1 + the categorical rotation) plus
// an EXACT per-mode var map transcribed from the previous hand-authored CSS
// blocks. Keeping the map explicit preserves every bespoke tweak verbatim
// (yellow's maroon brand-deep + olive ring, green's darker active + chart-positive
// override, midnight's dark action tokens, and the yellow/midnight "don't tint
// links/selection" behaviour — those keys are simply absent and inherit
// [data-mode]). Only the categorical series 2…8 are now computed (rotated from the
// accent) instead of hand-listed. Adding a theme = one entry here + THEME_IDS +
// THEMES swatches.

/** Accent family per theme (series 1 + rotation anchor). */
export const THEME_ACCENT: Record<ThemeId, string> = {
  yellow: "yellow",
  cherry: "cherry",
  green: "green",
  midnight: "midnight",
  berry: "berry",
};

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
      "--chart-1": v("yellow", "500"),
      "--chart-1-fg": "var(--vwo-neutral-0)",
      "--chart-info": v("yellow", "600"),
      "--chart-info-bg": v("yellow", "50"),
      "--chart-highlight": v("yellow", "50"),
      "--chart-seq-1": v("yellow", "100"),
      "--chart-seq-2": v("yellow", "200"),
      "--chart-seq-3": v("yellow", "300"),
      "--chart-seq-4": v("yellow", "400"),
      "--chart-seq-5": v("yellow", "500"),
      "--chart-seq-6": v("yellow", "600"),
      "--chart-seq-7": v("yellow", "800"),
    },
    dark: {
      "--primary": v("yellow", "50"),
      "--primary-foreground": "var(--vwo-midnight-base)",
      "--primary-hover": v("yellow", "100"),
      "--primary-active": v("yellow", "200"),
      "--primary-subtle": "var(--vwo-dark-bg-hover)",
      "--primary-border": "var(--primary-active)",
      "--ring": v("yellow", "200"),
      "--chart-1": v("yellow", "300"),
      "--chart-1-fg": "var(--vwo-midnight-base)",
      "--chart-info": v("yellow", "300"),
      "--chart-info-bg": v("yellow", "900"),
      "--chart-highlight": v("yellow", "50"),
      "--chart-seq-1": v("yellow", "900"),
      "--chart-seq-2": v("yellow", "800"),
      "--chart-seq-3": v("yellow", "700"),
      "--chart-seq-4": v("yellow", "600"),
      "--chart-seq-5": v("yellow", "500"),
      "--chart-seq-6": v("yellow", "400"),
      "--chart-seq-7": v("yellow", "300"),
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
      "--chart-1": v("cherry", "500"),
      "--chart-1-fg": "var(--vwo-neutral-0)",
      "--chart-info": v("cherry", "600"),
      "--chart-info-bg": v("cherry", "50"),
      "--chart-seq-1": v("cherry", "100"),
      "--chart-seq-2": v("cherry", "200"),
      "--chart-seq-3": v("cherry", "300"),
      "--chart-seq-4": v("cherry", "400"),
      "--chart-seq-5": v("cherry", "500"),
      "--chart-seq-6": v("cherry", "600"),
      "--chart-seq-7": v("cherry", "800"),
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
      "--chart-1": v("cherry", "400"),
      "--chart-1-fg": "var(--vwo-neutral-0)",
      "--chart-info": v("cherry", "400"),
      "--chart-info-bg": v("cherry", "900"),
      "--chart-seq-1": v("cherry", "900"),
      "--chart-seq-2": v("cherry", "800"),
      "--chart-seq-3": v("cherry", "700"),
      "--chart-seq-4": v("cherry", "600"),
      "--chart-seq-5": v("cherry", "500"),
      "--chart-seq-6": v("cherry", "400"),
      "--chart-seq-7": v("cherry", "300"),
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
      "--chart-1": v("green", "600"),
      "--chart-1-fg": "var(--vwo-neutral-0)",
      "--chart-info": v("green", "700"),
      "--chart-info-bg": v("green", "50"),
      "--chart-positive": v("green", "600"),
      "--chart-positive-bg": v("green", "50"),
      "--chart-seq-1": v("green", "100"),
      "--chart-seq-2": v("green", "200"),
      "--chart-seq-3": v("green", "300"),
      "--chart-seq-4": v("green", "400"),
      "--chart-seq-5": v("green", "500"),
      "--chart-seq-6": v("green", "600"),
      "--chart-seq-7": v("green", "800"),
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
      "--chart-1": v("green", "400"),
      "--chart-1-fg": "var(--vwo-neutral-0)",
      "--chart-info": v("green", "300"),
      "--chart-info-bg": v("green", "900"),
      "--chart-positive": v("green", "400"),
      "--chart-positive-bg": v("green", "900"),
      "--chart-seq-1": v("green", "900"),
      "--chart-seq-2": v("green", "800"),
      "--chart-seq-3": v("green", "700"),
      "--chart-seq-4": v("green", "600"),
      "--chart-seq-5": v("green", "500"),
      "--chart-seq-6": v("green", "400"),
      "--chart-seq-7": v("green", "300"),
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
      "--chart-1": "var(--vwo-midnight-base)",
      "--chart-1-fg": "var(--vwo-neutral-0)",
      "--chart-info": v("neutral", "700"),
      "--chart-info-bg": v("neutral", "50"),
      "--chart-seq-1": v("neutral", "100"),
      "--chart-seq-2": v("neutral", "200"),
      "--chart-seq-3": v("neutral", "300"),
      "--chart-seq-4": v("neutral", "400"),
      "--chart-seq-5": v("neutral", "500"),
      "--chart-seq-6": v("neutral", "600"),
      "--chart-seq-7": v("neutral", "800"),
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
      "--chart-1": v("neutral", "100"),
      "--chart-1-fg": "var(--vwo-midnight-base)",
      "--chart-info": v("neutral", "300"),
      "--chart-info-bg": v("neutral", "800"),
      "--chart-seq-1": v("neutral", "900"),
      "--chart-seq-2": v("neutral", "800"),
      "--chart-seq-3": v("neutral", "700"),
      "--chart-seq-4": v("neutral", "600"),
      "--chart-seq-5": v("neutral", "500"),
      "--chart-seq-6": v("neutral", "400"),
      "--chart-seq-7": v("neutral", "300"),
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
      "--chart-1": v("berry", "500"),
      "--chart-1-fg": "var(--vwo-neutral-0)",
      "--chart-info": v("berry", "600"),
      "--chart-info-bg": v("berry", "50"),
      "--chart-seq-1": v("berry", "100"),
      "--chart-seq-2": v("berry", "200"),
      "--chart-seq-3": v("berry", "300"),
      "--chart-seq-4": v("berry", "400"),
      "--chart-seq-5": v("berry", "500"),
      "--chart-seq-6": v("berry", "600"),
      "--chart-seq-7": v("berry", "800"),
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
      "--chart-1": v("berry", "300"),
      "--chart-1-fg": "var(--vwo-midnight-base)",
      "--chart-info": v("berry", "300"),
      "--chart-info-bg": v("berry", "900"),
      "--chart-seq-1": v("berry", "900"),
      "--chart-seq-2": v("berry", "800"),
      "--chart-seq-3": v("berry", "700"),
      "--chart-seq-4": v("berry", "600"),
      "--chart-seq-5": v("berry", "500"),
      "--chart-seq-6": v("berry", "400"),
      "--chart-seq-7": v("berry", "300"),
    },
  },
};

/**
 * Full brand-var map for a theme + mode: the explicit spec (primary, ring,
 * brand-deep, surrounds, chart lead/seq/info + any bespoke keys) merged with the
 * computed categorical series 2…8 rotated from the accent.
 */
export function computeThemeVars(
  themeId: ThemeId,
  mode: ColorMode
): Record<string, string> {
  const spec = THEME_VAR_SPEC[themeId][mode];
  return {
    ...spec,
    ...categoricalChartVars(THEME_ACCENT[themeId], mode),
  };
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
