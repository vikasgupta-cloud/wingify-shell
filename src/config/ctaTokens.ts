import tokens from "./tokens.json";
import type { ColorMode } from "./themes";
import { categoricalChartVars } from "./brandEngine";

/** Scale families available as CTA pickers (VWO colour tokens). */
export const CTA_FAMILIES = [
  "yellow",
  "cherry",
  "green",
  "berry",
  "ocean",
  "maroon",
  "amber",
  "neutral",
  "midnight",
] as const;

export type CtaFamily = (typeof CTA_FAMILIES)[number];

export type CtaTokenOption = {
  id: string;
  family: CtaFamily;
  step: string;
  label: string;
  hex: string;
  /** CSS custom property already defined in index.css */
  cssVar: string;
};

const SCALE_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;

// NOTE: the applied CTA variable set is the SINGLE SOURCE OF TRUTH derived from
// aestheticVarsForCta() output (see CTA_VARS below), so adding a var to the
// engine automatically makes applyCtaToken set AND clear it — no separate list
// to keep in sync.

function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function stepIndex(step: string): number {
  return SCALE_STEPS.indexOf(step as (typeof SCALE_STEPS)[number]);
}

function neighborStep(step: string, delta: number): string {
  const i = stepIndex(step);
  if (i < 0) return step;
  const next = Math.min(SCALE_STEPS.length - 1, Math.max(0, i + delta));
  return SCALE_STEPS[next];
}

function familyVar(family: CtaFamily, step: string): string {
  if (family === "midnight") return "var(--vwo-midnight-base)";
  return `var(--vwo-${family}-${step})`;
}

/** Every pickable CTA swatch from tokens.json scales. */
export const CTA_TOKEN_OPTIONS: CtaTokenOption[] = (() => {
  const out: CtaTokenOption[] = [];
  const scales = tokens.scales as Record<string, Record<string, string>>;

  for (const family of CTA_FAMILIES) {
    if (family === "midnight") {
      out.push({
        id: "midnight.base",
        family: "midnight",
        step: "base",
        label: "Midnight / base",
        hex: scales.midnight.base,
        cssVar: "--vwo-midnight-base",
      });
      continue;
    }
    const scale = scales[family];
    if (!scale) continue;
    for (const step of SCALE_STEPS) {
      const hex = scale[step];
      if (!hex) continue;
      out.push({
        id: `${family}.${step}`,
        family,
        step,
        label: `${family} / ${step}`,
        hex,
        cssVar: `--vwo-${family}-${step}`,
      });
    }
  }
  return out;
})();

const BY_ID = Object.fromEntries(
  CTA_TOKEN_OPTIONS.map((t) => [t.id, t])
) as Record<string, CtaTokenOption>;

export function isCtaTokenId(value: unknown): value is string {
  return typeof value === "string" && value in BY_ID;
}

export function resolveCtaTokenId(value: unknown): string | null {
  return isCtaTokenId(value) ? value : null;
}

export function ctaTokenById(id: string): CtaTokenOption | undefined {
  return BY_ID[id];
}

/**
 * Map a picked CTA token to primary + surrounding aesthetic roles
 * (ring, selection wash, links, report brand, chart lead) from the same family.
 */
function chartLeadVars(
  family: CtaFamily,
  colorMode: ColorMode,
  step: string
): Record<string, string> {
  if (family === "midnight") {
    if (colorMode === "dark") {
      return {
        "--chart-1": "var(--vwo-neutral-100)",
        "--chart-1-fg": "var(--vwo-midnight-base)",
        "--chart-info": "var(--vwo-neutral-300)",
        "--chart-info-bg": "var(--vwo-neutral-800)",
        "--chart-seq-1": "var(--vwo-neutral-900)",
        "--chart-seq-2": "var(--vwo-neutral-800)",
        "--chart-seq-3": "var(--vwo-neutral-700)",
        "--chart-seq-4": "var(--vwo-neutral-600)",
        "--chart-seq-5": "var(--vwo-neutral-500)",
        "--chart-seq-6": "var(--vwo-neutral-400)",
        "--chart-seq-7": "var(--vwo-neutral-300)",
      };
    }
    return {
      "--chart-1": "var(--vwo-midnight-base)",
      "--chart-1-fg": "var(--vwo-neutral-0)",
      "--chart-info": "var(--vwo-neutral-700)",
      "--chart-info-bg": "var(--vwo-neutral-50)",
      "--chart-seq-1": "var(--vwo-neutral-100)",
      "--chart-seq-2": "var(--vwo-neutral-200)",
      "--chart-seq-3": "var(--vwo-neutral-300)",
      "--chart-seq-4": "var(--vwo-neutral-400)",
      "--chart-seq-5": "var(--vwo-neutral-500)",
      "--chart-seq-6": "var(--vwo-neutral-600)",
      "--chart-seq-7": "var(--vwo-neutral-800)",
    };
  }

  const i = stepIndex(step);
  // Pale CTA steps (yellow/50) need a darker stroke for SVG charts.
  const strokeStep =
    colorMode === "dark"
      ? i >= 5
        ? "300"
        : step === "base"
          ? "300"
          : step
      : i <= 2
        ? "500"
        : step;

  // White ink on mid/deep fills; midnight on pale fills (AA for badge labels).
  const strokeIdx = stepIndex(strokeStep);
  const chartFg =
    strokeIdx >= 0 && strokeIdx <= 3
      ? "var(--vwo-midnight-base)"
      : "var(--vwo-neutral-0)";

  if (colorMode === "dark") {
    return {
      "--chart-1": familyVar(family, strokeStep),
      "--chart-1-fg": chartFg,
      "--chart-info": familyVar(family, "300"),
      "--chart-info-bg": familyVar(family, "900"),
      "--chart-seq-1": familyVar(family, "900"),
      "--chart-seq-2": familyVar(family, "800"),
      "--chart-seq-3": familyVar(family, "700"),
      "--chart-seq-4": familyVar(family, "600"),
      "--chart-seq-5": familyVar(family, "500"),
      "--chart-seq-6": familyVar(family, "400"),
      "--chart-seq-7": familyVar(family, "300"),
    };
  }

  return {
    "--chart-1": familyVar(family, strokeStep),
    "--chart-1-fg": chartFg,
    "--chart-info": familyVar(family, "600"),
    "--chart-info-bg": familyVar(family, "50"),
    "--chart-seq-1": familyVar(family, "100"),
    "--chart-seq-2": familyVar(family, "200"),
    "--chart-seq-3": familyVar(family, "300"),
    "--chart-seq-4": familyVar(family, "400"),
    "--chart-seq-5": familyVar(family, "500"),
    "--chart-seq-6": familyVar(family, "600"),
    "--chart-seq-7": familyVar(family, "800"),
  };
}

export function aestheticVarsForCta(
  token: CtaTokenOption,
  colorMode: ColorMode
): Record<string, string> {
  const { family, step, hex } = token;
  const lightFg = hexLuminance(hex) > 0.55;
  const fg = lightFg
    ? "var(--vwo-midnight-base)"
    : "var(--vwo-neutral-0)";
  // Lead + sequential + info from the accent, plus the full categorical series
  // 2…8 rotated from the accent so the whole palette re-skins (not just series 1).
  const charts = {
    ...chartLeadVars(family, colorMode, step),
    ...categoricalChartVars(family, colorMode),
  };

  if (family === "midnight") {
    if (colorMode === "dark") {
      return {
        "--primary": "var(--vwo-dark-action-primary-bg)",
        "--primary-foreground": "var(--vwo-dark-action-primary-text)",
        "--primary-hover": "var(--vwo-dark-action-primary-bg-hover)",
        "--primary-active": "var(--vwo-dark-action-primary-bg-active)",
        "--primary-subtle": "var(--vwo-dark-bg-hover)",
        "--primary-border": "var(--vwo-dark-action-primary-bg)",
        "--ring": "var(--vwo-neutral-100)",
        "--accent": "var(--vwo-dark-bg-selected)",
        "--accent-foreground": "var(--vwo-dark-text-primary)",
        "--selected-bg": "var(--vwo-dark-bg-selected)",
        "--selected-fg": "var(--vwo-dark-text-primary)",
        "--link": "var(--vwo-dark-text-link)",
        "--link-hover": "var(--vwo-dark-text-link-hover)",
        "--brand-deep": "var(--vwo-neutral-900)",
        "--report-brand": "var(--vwo-neutral-900)",
        "--report-brand-fg": "var(--vwo-neutral-800)",
        "--report-brand-tint": "var(--vwo-neutral-900)",
        "--report-link": "var(--vwo-dark-text-link)",
        ...charts,
      };
    }
    return {
      "--primary": "var(--vwo-midnight-base)",
      "--primary-foreground": "var(--vwo-neutral-0)",
      "--primary-hover": "var(--vwo-neutral-900)",
      "--primary-active": "var(--vwo-neutral-800)",
      "--primary-subtle": "var(--vwo-neutral-100)",
      "--primary-border": "var(--vwo-midnight-base)",
      "--ring": "var(--vwo-neutral-800)",
      "--accent": "var(--vwo-light-bg-selected)",
      "--accent-foreground": "var(--vwo-midnight-base)",
      "--selected-bg": "var(--vwo-light-bg-selected)",
      "--selected-fg": "var(--vwo-midnight-base)",
      "--link": "var(--vwo-light-text-link)",
      "--link-hover": "var(--vwo-light-text-link-hover)",
      "--brand-deep": "var(--vwo-midnight-base)",
      "--report-brand": "var(--vwo-neutral-900)",
      "--report-brand-fg": "var(--vwo-neutral-800)",
      "--report-brand-tint": "var(--vwo-neutral-50)",
      "--report-link": "var(--vwo-light-text-link)",
      ...charts,
    };
  }

  const primary = familyVar(family, step);
  // Hover toward mid contrast: lighter steps go darker (+), darker steps go lighter (−).
  const i = stepIndex(step);
  const hoverStep = i <= 3 ? neighborStep(step, 1) : neighborStep(step, -1);
  const activeStep = i <= 3 ? neighborStep(step, 2) : neighborStep(step, -2);
  // Only yellow CTAs keep a darker outline; others match the fill.
  const primaryBorder =
    family === "yellow" ? familyVar(family, activeStep) : primary;

  if (colorMode === "dark") {
    return {
      "--primary": primary,
      "--primary-foreground": fg,
      "--primary-hover": familyVar(family, hoverStep),
      "--primary-active": familyVar(family, activeStep),
      "--primary-subtle": familyVar(family, "900"),
      "--primary-border": primaryBorder,
      "--ring": familyVar(family, i >= 5 ? "300" : step),
      "--accent": familyVar(family, "900"),
      "--accent-foreground": familyVar(family, "100"),
      "--selected-bg": familyVar(family, "900"),
      "--selected-fg": familyVar(family, "200"),
      "--link": familyVar(family, "300"),
      "--link-hover": familyVar(family, "200"),
      "--brand-deep": familyVar(family, "900"),
      "--report-brand": familyVar(family, "800"),
      "--report-brand-fg": familyVar(family, "300"),
      "--report-brand-tint": familyVar(family, "900"),
      "--report-link": familyVar(family, "300"),
      ...charts,
    };
  }

  return {
    "--primary": primary,
    "--primary-foreground": fg,
    "--primary-hover": familyVar(family, hoverStep),
    "--primary-active": familyVar(family, activeStep),
    "--primary-subtle": familyVar(family, "100"),
    "--primary-border": primaryBorder,
    "--ring": primary,
    "--accent": familyVar(family, "100"),
    "--accent-foreground": familyVar(family, "800"),
    "--selected-bg": familyVar(family, "100"),
    "--selected-fg": familyVar(family, "700"),
    "--link": familyVar(family, "500"),
    "--link-hover": familyVar(family, "600"),
    "--brand-deep": familyVar(family, "900"),
    "--report-brand": familyVar(family, "800"),
    "--report-brand-fg": familyVar(family, "700"),
    "--report-brand-tint": familyVar(family, "50"),
    "--report-link": familyVar(family, "500"),
    ...charts,
  };
}

/**
 * Single source of truth for the CTA variable set: the exact keys
 * aestheticVarsForCta() produces. Every branch returns the same key set, so a
 * reference computation gives the canonical list used to both apply and clear —
 * adding a var to the engine can never drift from what gets cleared.
 */
export const CTA_VARS: readonly string[] = Object.keys(
  aestheticVarsForCta(CTA_TOKEN_OPTIONS[0]!, "light")
);

/** Apply or clear custom CTA overrides on <html>. */
export function applyCtaToken(
  tokenId: string | null,
  colorMode: ColorMode
) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!tokenId) {
    root.removeAttribute("data-cta");
    for (const key of CTA_VARS) root.style.removeProperty(key);
    return;
  }
  const token = BY_ID[tokenId];
  if (!token) {
    applyCtaToken(null, colorMode);
    return;
  }
  root.setAttribute("data-cta", tokenId);
  const vars = aestheticVarsForCta(token, colorMode);
  for (const key of CTA_VARS) {
    root.style.setProperty(key, vars[key]);
  }
}
