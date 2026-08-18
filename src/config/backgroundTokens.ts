// Grey-only page canvas + shared listing header fills (neutral scale only).

import tokens from "./tokens.json";
import type { ColorMode } from "./themes";

export type NeutralTokenOption = {
  id: string;
  step: string;
  label: string;
  hex: string;
  cssVar: string;
};

/** Full VWO neutral scale — used for page canvas and listing headers. */
export const NEUTRAL_STEPS = [
  "0",
  "25",
  "50",
  "75",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

const STEP_LABEL: Record<string, string> = {
  "0": "White",
  "25": "Porcelain",
  "50": "Canvas",
  "75": "Parchment",
  "100": "Feather",
  "200": "Stone",
  "300": "Dusk",
  "400": "Ash",
  "500": "Fog",
  "600": "Twilight",
  "700": "Slate",
  "800": "Charcoal",
  "900": "Ink",
  "950": "Near black",
};

function buildNeutralOptions(): NeutralTokenOption[] {
  const scale = tokens.scales.neutral as Record<string, string>;
  return NEUTRAL_STEPS.filter((step) => scale[step]).map((step) => ({
    id: `neutral.${step}`,
    step,
    label: STEP_LABEL[step] ?? `Neutral ${step}`,
    hex: scale[step],
    cssVar: `--vwo-neutral-${step}`,
  }));
}

export const NEUTRAL_TOKEN_OPTIONS = buildNeutralOptions();

/** Wingify light defaults — Canvas · #F6F3ED / Parchment · #EFECE4 */
export const DEFAULT_BACKGROUND_TOKEN_ID = "neutral.50";
export const DEFAULT_HEADER_TOKEN_ID = "neutral.75";

/** Wingify dark defaults — ink pane / raised chrome */
export const DEFAULT_BACKGROUND_TOKEN_ID_DARK = "neutral.950";
export const DEFAULT_HEADER_TOKEN_ID_DARK = "neutral.900";

/** Mode-aware Wingify chrome (surface / background / headers). */
export function wingifyChromeTokenIds(mode: ColorMode): {
  backgroundTokenId: string;
  headerTokenId: string;
} {
  if (mode === "dark") {
    return {
      backgroundTokenId: DEFAULT_BACKGROUND_TOKEN_ID_DARK,
      headerTokenId: DEFAULT_HEADER_TOKEN_ID_DARK,
    };
  }
  return {
    backgroundTokenId: DEFAULT_BACKGROUND_TOKEN_ID,
    headerTokenId: DEFAULT_HEADER_TOKEN_ID,
  };
}

/**
 * Keeps Wingify Canvas/Parchment (light) from sticking when the UI is dark —
 * and the dark ink pair from sticking when returning to light — if the user
 * is still on the auto defaults for the opposite mode.
 */
export function resolveWingifyChromeTokens(
  mode: ColorMode,
  backgroundTokenId: string | null | undefined,
  headerTokenId: string | null | undefined
): { backgroundTokenId: string | null; headerTokenId: string | null } {
  const defaults = wingifyChromeTokenIds(mode);
  const opposite = wingifyChromeTokenIds(mode === "dark" ? "light" : "dark");
  let bg =
    backgroundTokenId === undefined
      ? defaults.backgroundTokenId
      : resolveNeutralTokenId(backgroundTokenId);
  let header =
    headerTokenId === undefined
      ? defaults.headerTokenId
      : resolveNeutralTokenId(headerTokenId);

  if (bg === opposite.backgroundTokenId) bg = defaults.backgroundTokenId;
  if (header === opposite.headerTokenId) header = defaults.headerTokenId;
  return { backgroundTokenId: bg, headerTokenId: header };
}

const BY_ID = Object.fromEntries(
  NEUTRAL_TOKEN_OPTIONS.map((t) => [t.id, t])
) as Record<string, NeutralTokenOption>;

export function isNeutralTokenId(value: unknown): value is string {
  return typeof value === "string" && value in BY_ID;
}

export function resolveNeutralTokenId(value: unknown): string | null {
  return isNeutralTokenId(value) ? value : null;
}

export function neutralTokenById(
  id: string | null | undefined
): NeutralTokenOption | undefined {
  if (!id) return undefined;
  return BY_ID[id];
}

/** @deprecated Prefer NEUTRAL_TOKEN_OPTIONS — same list in both modes. */
export function backgroundOptionsForMode(
  _mode: ColorMode
): NeutralTokenOption[] {
  return NEUTRAL_TOKEN_OPTIONS;
}

export const isBackgroundTokenId = isNeutralTokenId;
export const resolveBackgroundTokenId = resolveNeutralTokenId;
export const backgroundTokenById = neutralTokenById;
export type BackgroundTokenOption = NeutralTokenOption;

/** Page chrome only (`bg-canvas`) — never cards/tables (`bg-background`). */
export const BACKGROUND_VARS = ["--canvas", "--surface"] as const;

export function aestheticVarsForBackground(
  token: NeutralTokenOption,
  _mode: ColorMode
): Record<string, string> {
  const fill = `var(${token.cssVar})`;
  return {
    "--canvas": fill,
    "--surface": fill,
  };
}

/** Shared listing headers (tables, kanban columns, gantt). */
export const HEADER_VARS = [
  "--listing-header-bg",
  "--listing-header-fg",
] as const;

/** Relative luminance (sRGB) — shared with CTA so design-controller picks stay readable. */
function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Ink over a solid neutral fill — pale fills get neutral-950 text, mid/deep get white.
 * Matches CTA luminance threshold (> 0.55 → dark ink).
 */
export function inkForNeutralFill(hex: string): string {
  return hexLuminance(hex) > 0.55
    ? "var(--vwo-neutral-950)"
    : "var(--vwo-neutral-0)";
}

/** @deprecated Prefer inkForNeutralFill(hex) — step alone mis-classifies 300–400. */
export function inkForNeutralStep(step: string): string {
  const token = NEUTRAL_TOKEN_OPTIONS.find((t) => t.step === step);
  if (token) return inkForNeutralFill(token.hex);
  const n = Number(step);
  if (!Number.isFinite(n)) return "var(--vwo-neutral-950)";
  return n >= 300 ? "var(--vwo-neutral-0)" : "var(--vwo-neutral-950)";
}

export function aestheticVarsForHeader(
  token: NeutralTokenOption,
  _mode: ColorMode
): Record<string, string> {
  return {
    "--listing-header-bg": `var(${token.cssVar})`,
    "--listing-header-fg": inkForNeutralFill(token.hex),
  };
}
