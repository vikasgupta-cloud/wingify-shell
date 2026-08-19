/**
 * Colour palette packs for the design controller.
 * "Current" = existing VWO tokens; "New" = revised shades (Feather/Red/Blue/etc);
 * "Koto" = Wingify Creative brand sheet only (no invented intermediates).
 * Berry + midnight stay identical in Current/New packs.
 */
import tokens from "./tokens.json";

export const PALETTE_IDS = ["current", "new", "koto"] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];
export const DEFAULT_PALETTE_ID: PaletteId = "current";

export const PALETTE_LABELS: Record<PaletteId, string> = {
  current: "Current",
  new: "New",
  koto: "Koto",
};

export type ScaleMap = Record<string, Record<string, string>>;

const currentScales = tokens.scales as ScaleMap;

/**
 * New palette from design refs:
 * Feather → neutral (light end), Maroon, Red → cherry, Green, Amber,
 * Blue → ocean, Yellow. Berry + midnight copied from Current.
 */
const newScaleOverrides: ScaleMap = {
  neutral: {
    "0": "#fefefd", // Feather Lighter
    "50": "#f6f3ed", // Feather Normal (canvas)
    "100": "#dddbd5", // Feather Normal :hover
    "200": "#c5c2be", // Feather Normal :active
    "300": currentScales.neutral["300"]!,
    "400": currentScales.neutral["400"]!,
    "500": currentScales.neutral["500"]!,
    "600": currentScales.neutral["600"]!,
    "700": currentScales.neutral["700"]!,
    "800": currentScales.neutral["800"]!,
    "900": currentScales.neutral["900"]!,
    "950": currentScales.neutral["950"]!,
  },
  maroon: {
    "50": "#f0e8ec",
    "100": "#e9dde2",
    "200": "#d1b8c3",
    "300": "#9b667c",
    "400": "#884963",
    "500": "#6a1b3c",
    "600": "#50142d",
    "700": "#401024",
    "800": "#300c1b",
    "900": "#250915",
  },
  cherry: {
    "50": "#fceae6",
    "100": "#f5beb1",
    "200": "#f09e8b",
    "300": "#e97255",
    "400": "#e55735",
    "500": "#de2d02",
    "600": "#ca2902",
    "700": "#9e2001",
    "800": "#7a1901",
    "900": "#5d1301",
  },
  green: {
    "50": "#eff9f4",
    "100": "#cceddb",
    "200": "#b4e4ca",
    "300": "#91d7b2",
    "400": "#7cd0a3",
    "500": "#5bc48c",
    "600": "#53b27f",
    "700": "#418b63",
    "800": "#326c4d",
    "900": "#26523b",
  },
  amber: {
    "50": "#fffbee",
    "100": "#fef1ca",
    "200": "#feebb0",
    "300": "#fee28c",
    "400": "#fddc75",
    "500": "#fdd353",
    "600": "#e6c04c",
    "700": "#b4963b",
    "800": "#877132",
    "900": "#675726",
  },
  ocean: {
    "50": "#f0f4fd", // Blue Light
    "100": "#e8effd", // Blue Light :hover
    "200": "#d0ddfa", // Blue Light :active
    "300": "#6692ef", // Blue Normal
    "400": "#5c83d7", // Blue Normal :hover
    "500": "#5275bf", // Blue Normal :active
    "600": "#4d6eb3", // Blue Dark
    "700": "#3d588f", // Blue Dark :hover
    "800": "#2e426c", // Blue Dark :active
    "900": "#243354", // Blue Darker
  },
  yellow: {
    "50": "#fdffec",
    "100": "#f9ffc6",
    "200": "#f1ff83",
    "300": "#d9e676",
    "400": "#c1cc69",
    "500": "#b5bf62",
    "600": "#91994f",
    "700": "#6c733b",
    "800": "#54592e",
    "900": "#2e3119",
  },
};

function mergeNewScales(): ScaleMap {
  return {
    ...currentScales,
    ...newScaleOverrides,
    berry: currentScales.berry,
    midnight: currentScales.midnight,
  };
}

/**
 * Koto brand sheet (exact hexes only). Scale steps reuse these colours —
 * no interpolated shades outside the sheet.
 */
const KOTO = {
  yellow: "#EEFF6D",
  maroon: "#410D23",
  sky: "#91C5FF",
  white: "#FFFFFF",
  grey: "#F6F3E0",
  feather: "#E5E0D6",
  dusk: "#B2ADA1",
  twilight: "#5F5C53",
  midnight: "#1E2022",
  cherryBright: "#FF6038",
  greenBright: "#07C787",
  oceanBright: "#4068ED",
  berryBright: "#FB7FD8",
  cherryRich: "#DE2D02",
  greenRich: "#004B42",
  oceanRich: "#0E1D4A",
  berryRich: "#CB37A4",
  cherryTint: "#F4E4E4",
  greenTint: "#D8E9E8",
  oceanTint: "#D3E8FF",
  berryTint: "#F4E4F3",
} as const;

function buildKotoScales(): ScaleMap {
  const {
    yellow,
    maroon,
    sky,
    white,
    grey,
    feather,
    dusk,
    twilight,
    midnight,
    cherryBright,
    greenBright,
    oceanBright,
    berryBright,
    cherryRich,
    greenRich,
    oceanRich,
    berryRich,
    cherryTint,
    greenTint,
    oceanTint,
    berryTint,
  } = KOTO;

  return {
    neutral: {
      "0": white,
      "50": grey,
      "100": feather,
      "200": feather,
      "300": dusk,
      "400": dusk,
      "500": twilight,
      "600": twilight,
      "700": twilight,
      "800": midnight,
      "900": midnight,
      "950": midnight,
    },
    midnight: { base: midnight },
    maroon: {
      "50": maroon,
      "100": maroon,
      "200": maroon,
      "300": maroon,
      "400": maroon,
      "500": maroon,
      "600": maroon,
      "700": maroon,
      "800": maroon,
      "900": maroon,
    },
    yellow: {
      "50": yellow,
      "100": yellow,
      "200": yellow,
      "300": yellow,
      "400": yellow,
      "500": yellow,
      "600": twilight,
      "700": twilight,
      "800": midnight,
      "900": midnight,
    },
    // No amber on the sheet — warnings reuse Grey / Yellow / Twilight only.
    amber: {
      "50": grey,
      "100": grey,
      "200": grey,
      "300": yellow,
      "400": yellow,
      "500": yellow,
      "600": twilight,
      "700": twilight,
      "800": midnight,
      "900": midnight,
    },
    cherry: {
      "50": cherryTint,
      "100": cherryTint,
      "200": cherryTint,
      "300": cherryBright,
      "400": cherryBright,
      "500": cherryRich,
      "600": cherryRich,
      "700": cherryRich,
      "800": cherryRich,
      "900": cherryRich,
    },
    green: {
      "50": greenTint,
      "100": greenTint,
      "200": greenTint,
      "300": greenBright,
      "400": greenBright,
      "500": greenBright,
      "600": greenRich,
      "700": greenRich,
      "800": greenRich,
      "900": greenRich,
    },
    ocean: {
      "50": oceanTint,
      "100": oceanTint,
      "200": oceanTint,
      "300": sky,
      "400": oceanBright,
      "500": oceanBright,
      "600": oceanBright,
      "700": oceanRich,
      "800": oceanRich,
      "900": oceanRich,
    },
    berry: {
      "50": berryTint,
      "100": berryTint,
      "200": berryTint,
      "300": berryBright,
      "400": berryBright,
      "500": berryBright,
      "600": berryRich,
      "700": berryRich,
      "800": berryRich,
      "900": berryRich,
    },
  };
}

const PALETTE_SCALES: Record<PaletteId, ScaleMap> = {
  current: currentScales,
  new: mergeNewScales(),
  koto: buildKotoScales(),
};

export function isPaletteId(value: unknown): value is PaletteId {
  return (
    typeof value === "string" &&
    (PALETTE_IDS as readonly string[]).includes(value)
  );
}

export function resolvePaletteId(value: unknown): PaletteId {
  return isPaletteId(value) ? value : DEFAULT_PALETTE_ID;
}

export function getPaletteScales(paletteId: PaletteId = DEFAULT_PALETTE_ID): ScaleMap {
  return PALETTE_SCALES[resolvePaletteId(paletteId)];
}

/** CSS custom properties written for the active palette (cleared when switching). */
const APPLIED_SCALE_VARS: string[] = [];
const APPLIED_SEMANTIC_VARS: string[] = [];

function hexToHslChannels(hex: string): string | null {
  const value = hex.replace("#", "");
  if (!/^[\da-f]{6}$/i.test(value)) return null;
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
  }
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta ? delta / (1 - Math.abs(2 * l - 1)) : 0;
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function channels(hex: string): string {
  return hexToHslChannels(hex) ?? "0 0% 0%";
}

function scaleHex(scales: ScaleMap, family: string, step: string): string {
  return scales[family]?.[step] ?? "#000000";
}

/**
 * Light semantic roles remapped from the active scales so surfaces, status,
 * and links follow the selected pack (same step roles as the Current tokens).
 */
function lightSemanticFromScales(scales: ScaleMap): Record<string, string> {
  const n = (step: string) => channels(scaleHex(scales, "neutral", step));
  const c = (step: string) => channels(scaleHex(scales, "cherry", step));
  const a = (step: string) => channels(scaleHex(scales, "amber", step));
  const g = (step: string) => channels(scaleHex(scales, "green", step));
  const o = (step: string) => channels(scaleHex(scales, "ocean", step));
  const y = (step: string) => channels(scaleHex(scales, "yellow", step));
  const m = (step: string) => channels(scaleHex(scales, "maroon", step));
  const b = (step: string) => channels(scaleHex(scales, "berry", step));
  const mid = channels(scaleHex(scales, "midnight", "base"));

  return {
    "--vwo-light-bg-canvas": n("50"),
    "--vwo-light-bg-surface": n("0"),
    "--vwo-light-bg-surface-raised": n("0"),
    "--vwo-light-bg-surface-sunken": n("100"),
    "--vwo-light-bg-hover": n("50"),
    "--vwo-light-bg-active": n("100"),
    "--vwo-light-bg-selected": n("100"),
    "--vwo-light-bg-disabled": n("50"),
    "--vwo-light-text-primary": n("950"),
    "--vwo-light-text-secondary": n("700"),
    "--vwo-light-text-tertiary": n("600"),
    "--vwo-light-text-placeholder": n("600"),
    "--vwo-light-text-disabled": n("400"),
    "--vwo-light-text-inverse": n("0"),
    "--vwo-light-text-link": o("600"),
    "--vwo-light-text-link-hover": o("700"),
    "--vwo-light-border-subtle": n("100"),
    "--vwo-light-border-default": n("200"),
    "--vwo-light-border-control": n("400"),
    "--vwo-light-border-strong": n("500"),
    "--vwo-light-border-focus": o("500"),
    "--vwo-light-action-primary-bg": n("950"),
    "--vwo-light-action-primary-bg-hover": n("900"),
    "--vwo-light-action-primary-bg-active": n("800"),
    "--vwo-light-action-primary-text": n("0"),
    "--vwo-light-action-secondary-bg": n("0"),
    "--vwo-light-action-secondary-bg-hover": n("50"),
    "--vwo-light-action-secondary-border": n("300"),
    "--vwo-light-action-secondary-text": n("950"),
    "--vwo-light-action-subtle-bg-hover": n("50"),
    "--vwo-light-action-subtle-text": n("700"),
    "--vwo-light-action-destructive-bg": c("600"),
    "--vwo-light-action-destructive-bg-hover": c("700"),
    "--vwo-light-action-destructive-text": n("0"),
    "--vwo-light-action-disabled-bg": n("100"),
    "--vwo-light-action-disabled-text": n("400"),
    "--vwo-light-status-error-bg": c("50"),
    "--vwo-light-status-error-border": c("200"),
    "--vwo-light-status-error-text": c("700"),
    "--vwo-light-status-error-icon": c("600"),
    "--vwo-light-status-error-solid": c("600"),
    "--vwo-light-status-error-solid-text": n("0"),
    "--vwo-light-status-warning-bg": a("50"),
    "--vwo-light-status-warning-border": a("200"),
    "--vwo-light-status-warning-text": a("700"),
    "--vwo-light-status-warning-icon": a("600"),
    "--vwo-light-status-warning-solid": a("300"),
    "--vwo-light-status-warning-solid-text": a("900"),
    "--vwo-light-status-success-bg": g("50"),
    "--vwo-light-status-success-border": g("200"),
    "--vwo-light-status-success-text": g("700"),
    "--vwo-light-status-success-icon": g("600"),
    "--vwo-light-status-success-solid": g("700"),
    "--vwo-light-status-success-solid-text": n("0"),
    "--vwo-light-status-info-bg": o("50"),
    "--vwo-light-status-info-border": o("200"),
    "--vwo-light-status-info-text": o("700"),
    "--vwo-light-status-info-icon": o("600"),
    "--vwo-light-status-info-solid": o("500"),
    "--vwo-light-status-info-solid-text": n("0"),
    "--vwo-light-status-neutral-bg": n("50"),
    "--vwo-light-status-neutral-border": n("200"),
    "--vwo-light-status-neutral-text": n("700"),
    "--vwo-light-status-neutral-solid": n("600"),
    "--vwo-light-status-neutral-solid-text": n("0"),
    "--vwo-light-status-ai-bg": b("50"),
    "--vwo-light-status-ai-border": b("200"),
    "--vwo-light-status-ai-text": b("700"),
    "--vwo-light-status-ai-solid": b("600"),
    "--vwo-light-status-ai-solid-text": n("0"),
    "--vwo-light-accent-indicator": y("50"),
    "--vwo-light-accent-emphasis": m("900"),
    "--vwo-light-overlay-scrim": mid,
    "--vwo-light-overlay-inverse-surface": mid,
  };
}

/**
 * Dark semantic roles from the active scales (used for Koto so light/dark
 * both stay on the brand sheet; other packs keep index.css dark defaults).
 */
function darkSemanticFromScales(scales: ScaleMap): Record<string, string> {
  const n = (step: string) => channels(scaleHex(scales, "neutral", step));
  const c = (step: string) => channels(scaleHex(scales, "cherry", step));
  const a = (step: string) => channels(scaleHex(scales, "amber", step));
  const g = (step: string) => channels(scaleHex(scales, "green", step));
  const o = (step: string) => channels(scaleHex(scales, "ocean", step));
  const y = (step: string) => channels(scaleHex(scales, "yellow", step));
  const m = (step: string) => channels(scaleHex(scales, "maroon", step));
  const b = (step: string) => channels(scaleHex(scales, "berry", step));
  const mid = channels(scaleHex(scales, "midnight", "base"));

  return {
    "--vwo-dark-bg-canvas": mid,
    "--vwo-dark-bg-surface": n("800"),
    "--vwo-dark-bg-surface-raised": n("700"),
    "--vwo-dark-bg-surface-sunken": mid,
    "--vwo-dark-bg-hover": n("700"),
    "--vwo-dark-bg-active": n("600"),
    "--vwo-dark-bg-selected": n("700"),
    "--vwo-dark-bg-disabled": n("700"),
    "--vwo-dark-text-primary": n("50"),
    "--vwo-dark-text-secondary": n("200"),
    "--vwo-dark-text-tertiary": n("300"),
    "--vwo-dark-text-placeholder": n("300"),
    "--vwo-dark-text-disabled": n("500"),
    "--vwo-dark-text-inverse": mid,
    "--vwo-dark-text-link": o("300"),
    "--vwo-dark-text-link-hover": o("200"),
    "--vwo-dark-border-subtle": n("700"),
    "--vwo-dark-border-default": n("600"),
    "--vwo-dark-border-control": n("500"),
    "--vwo-dark-border-strong": n("400"),
    "--vwo-dark-border-focus": o("300"),
    "--vwo-dark-action-primary-bg": n("50"),
    "--vwo-dark-action-primary-bg-hover": n("0"),
    "--vwo-dark-action-primary-bg-active": n("100"),
    "--vwo-dark-action-primary-text": mid,
    "--vwo-dark-action-secondary-bg": n("700"),
    "--vwo-dark-action-secondary-bg-hover": n("600"),
    "--vwo-dark-action-secondary-border": n("500"),
    "--vwo-dark-action-secondary-text": n("50"),
    "--vwo-dark-action-subtle-bg-hover": n("700"),
    "--vwo-dark-action-subtle-text": n("200"),
    "--vwo-dark-action-destructive-bg": c("600"),
    "--vwo-dark-action-destructive-bg-hover": c("700"),
    "--vwo-dark-action-destructive-text": n("0"),
    "--vwo-dark-action-disabled-bg": n("700"),
    "--vwo-dark-action-disabled-text": n("500"),
    "--vwo-dark-status-error-bg": c("900"),
    "--vwo-dark-status-error-border": c("700"),
    "--vwo-dark-status-error-text": c("300"),
    "--vwo-dark-status-error-icon": c("400"),
    "--vwo-dark-status-error-solid": c("600"),
    "--vwo-dark-status-error-solid-text": n("0"),
    "--vwo-dark-status-warning-bg": a("900"),
    "--vwo-dark-status-warning-border": a("700"),
    "--vwo-dark-status-warning-text": a("300"),
    "--vwo-dark-status-warning-icon": a("400"),
    "--vwo-dark-status-warning-solid": a("400"),
    "--vwo-dark-status-warning-solid-text": a("900"),
    "--vwo-dark-status-success-bg": g("900"),
    "--vwo-dark-status-success-border": g("700"),
    "--vwo-dark-status-success-text": g("300"),
    "--vwo-dark-status-success-icon": g("400"),
    "--vwo-dark-status-success-solid": g("600"),
    "--vwo-dark-status-success-solid-text": n("0"),
    "--vwo-dark-status-info-bg": o("900"),
    "--vwo-dark-status-info-border": o("700"),
    "--vwo-dark-status-info-text": o("300"),
    "--vwo-dark-status-info-icon": o("400"),
    "--vwo-dark-status-info-solid": o("500"),
    "--vwo-dark-status-info-solid-text": n("0"),
    "--vwo-dark-status-neutral-bg": n("700"),
    "--vwo-dark-status-neutral-border": n("600"),
    "--vwo-dark-status-neutral-text": n("300"),
    "--vwo-dark-status-neutral-solid": n("500"),
    "--vwo-dark-status-neutral-solid-text": n("0"),
    "--vwo-dark-status-ai-bg": b("900"),
    "--vwo-dark-status-ai-border": b("700"),
    "--vwo-dark-status-ai-text": b("300"),
    "--vwo-dark-status-ai-solid": b("600"),
    "--vwo-dark-status-ai-solid-text": n("0"),
    "--vwo-dark-accent-indicator": y("50"),
    "--vwo-dark-accent-emphasis": m("400"),
    "--vwo-dark-overlay-scrim": mid,
    "--vwo-dark-overlay-inverse-surface": n("800"),
  };
}

/** Write every scale (+ light semantics) for the selected palette onto :root. */
export function applyPalette(paletteId: PaletteId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const id = resolvePaletteId(paletteId);
  const scales = getPaletteScales(id);

  for (const key of APPLIED_SCALE_VARS.splice(0)) {
    root.style.removeProperty(key);
  }
  for (const key of APPLIED_SEMANTIC_VARS.splice(0)) {
    root.style.removeProperty(key);
  }

  for (const [family, steps] of Object.entries(scales)) {
    for (const [step, hex] of Object.entries(steps)) {
      const prop =
        family === "midnight" && step === "base"
          ? "--vwo-midnight-base"
          : `--vwo-${family}-${step}`;
      root.style.setProperty(prop, channels(hex));
      APPLIED_SCALE_VARS.push(prop);
    }
  }

  const semantic = {
    ...lightSemanticFromScales(scales),
    ...(id === "koto" ? darkSemanticFromScales(scales) : {}),
  };
  for (const [prop, value] of Object.entries(semantic)) {
    root.style.setProperty(prop, value);
    APPLIED_SEMANTIC_VARS.push(prop);
  }

  root.setAttribute("data-palette", id);
}
