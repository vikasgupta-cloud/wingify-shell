// Design controller — surface presets: how chrome, body, and cards stack.

import tokens from "./tokens.json";
import type { ColorMode } from "./themes";

export const SURFACE_SCHEME_IDS = [
  "full-white",
  "feather-nav",
  "feather-body",
] as const;

export type SurfaceSchemeId = (typeof SURFACE_SCHEME_IDS)[number];

/** Default surface preset on first load / Reset appearance. */
export const DEFAULT_SURFACE_SCHEME_ID: SurfaceSchemeId = "feather-body";

/** The three layers a preset paints. */
type SurfaceLayer = "chrome" | "body" | "card";

/** Fills for the preview chip, in the same order as the layers. */
export type SurfaceLayerFills = Record<SurfaceLayer, string>;

export type SurfaceSchemeOption = {
  id: SurfaceSchemeId;
  label: string;
  description: string;
  preview: { light: SurfaceLayerFills; dark: SurfaceLayerFills };
};

const { scales, semantic } = tokens;

/**
 * Two tones per mode — paper (the raised sheet) and tint (the recessed one).
 * Light tint is the app's own body canvas, so the chrome reads as a whisper
 * against white; dark inverts, so the tint is the deeper canvas.
 */
type Tone = "paper" | "tint";

/** hsl(40 18% 97.8%) — the --canvas-trial body colour, for preview chips. */
const LIGHT_BODY_HEX = "#FAFAF8";

const TONES: Record<ColorMode, Record<Tone, { cssVar: string; hex: string }>> = {
  light: {
    paper: { cssVar: "--vwo-neutral-0", hex: scales.neutral["0"] },
    tint: { cssVar: "--canvas-trial", hex: LIGHT_BODY_HEX },
  },
  dark: {
    paper: {
      cssVar: "--vwo-dark-bg-surface",
      hex: semantic.dark["bg.surface"],
    },
    tint: { cssVar: "--vwo-dark-bg-canvas", hex: semantic.dark["bg.canvas"] },
  },
};

const SCHEME_LAYERS: Record<SurfaceSchemeId, Record<SurfaceLayer, Tone>> = {
  "full-white": { chrome: "paper", body: "paper", card: "paper" },
  "feather-nav": { chrome: "tint", body: "paper", card: "paper" },
  "feather-body": { chrome: "paper", body: "tint", card: "paper" },
};

const SCHEME_COPY: Record<
  SurfaceSchemeId,
  { label: string; description: string }
> = {
  "full-white": {
    label: "Full white",
    description: "Nav, body, and cards all on one sheet",
  },
  "feather-nav": {
    label: "Feather nav",
    description: "White body and cards, feather top + side nav",
  },
  "feather-body": {
    label: "Feather body",
    description: "White nav and cards, feather body behind them",
  },
};

export const SURFACE_SCHEMES: SurfaceSchemeOption[] = SURFACE_SCHEME_IDS.map(
  (id) => {
    const layers = SCHEME_LAYERS[id];
    const fills = (mode: ColorMode): SurfaceLayerFills => ({
      chrome: TONES[mode][layers.chrome].hex,
      body: TONES[mode][layers.body].hex,
      card: TONES[mode][layers.card].hex,
    });
    return {
      id,
      ...SCHEME_COPY[id],
      preview: { light: fills("light"), dark: fills("dark") },
    };
  }
);

export function isSurfaceSchemeId(value: unknown): value is SurfaceSchemeId {
  return (
    typeof value === "string" &&
    (SURFACE_SCHEME_IDS as readonly string[]).includes(value)
  );
}

/** null = inherit the theme's own surfaces (no preset). */
export function resolveSurfaceSchemeId(value: unknown): SurfaceSchemeId | null {
  return isSurfaceSchemeId(value) ? value : null;
}

export function surfaceSchemeById(
  id: string | null | undefined
): SurfaceSchemeOption | undefined {
  if (!id) return undefined;
  return SURFACE_SCHEMES.find((scheme) => scheme.id === id);
}

/** Chrome = top bar + side nav (--rail / --panel); body = page canvas. */
export const SURFACE_VARS = [
  "--rail",
  "--panel",
  "--canvas",
  "--surface",
  "--background",
  "--card",
] as const;

/**
 * Surface fills for a preset. Applied before the Background picker so an
 * explicit canvas grey still wins over the preset's body tone.
 */
export function computeSurfaceVars(
  schemeId: SurfaceSchemeId | null,
  mode: ColorMode
): Record<string, string> {
  if (!schemeId) return {};
  const layers = SCHEME_LAYERS[schemeId];
  const fill = (layer: SurfaceLayer) =>
    `var(${TONES[mode][layers[layer]].cssVar})`;

  return {
    "--rail": fill("chrome"),
    "--panel": fill("chrome"),
    "--canvas": fill("body"),
    "--surface": fill("body"),
    "--background": fill("card"),
    "--card": fill("card"),
  };
}
