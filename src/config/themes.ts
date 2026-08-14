import tokens from "./tokens.json";
import {
  resolveSurfaceSchemeId,
  type SurfaceSchemeId,
} from "./surfaceTokens";
import {
  DEFAULT_FORM_ELEMENT_SCHEME_ID,
  resolveFormElementSchemeId,
  type FormElementSchemeId,
} from "./formElementSchemes";

/**
 * Accent families = primary button / CTA color.
 * Light vs dark surfaces are a separate `ColorMode` — picking Midnight
 * means midnight-colored buttons, not a dark UI.
 */

export const THEME_IDS = [
  "yellow",
  "cherry",
  "green",
  "midnight",
  "berry",
] as const;

export const COLOR_MODES = ["light", "dark"] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ColorMode = (typeof COLOR_MODES)[number];

export const DEFAULT_THEME_ID: ThemeId = "yellow";
export const DEFAULT_COLOR_MODE: ColorMode = "light";

const LEGACY_THEME_IDS: Record<string, ThemeId> = {
  warm: "yellow",
  neutral: "yellow",
  "yellow-b": "yellow",
  cool: "green",
  contrast: "midnight",
};

export type ThemeOption = {
  id: ThemeId;
  label: string;
  description: string;
  /** Preview chips from tokens — light mode. */
  swatchesLight: [string, string, string];
  /** Preview chips from tokens — dark mode. */
  swatchesDark: [string, string, string];
};

const { scales, semantic } = tokens;

export const THEMES: ThemeOption[] = [
  {
    id: "yellow",
    label: "Yellow",
    description: "Yellow primary buttons — pick a secondary under Form elements",
    swatchesLight: [
      scales.neutral["0"],
      scales.yellow["50"],
      scales.neutral["100"],
    ],
    swatchesDark: [
      semantic.dark["bg.canvas"],
      scales.yellow["50"],
      semantic.dark["bg.surface"],
    ],
  },
  {
    id: "cherry",
    label: "Cherry",
    description: "Cherry primary buttons",
    swatchesLight: [
      scales.neutral["0"],
      scales.cherry["400"],
      scales.neutral["100"],
    ],
    swatchesDark: [
      semantic.dark["bg.canvas"],
      scales.cherry["400"],
      semantic.dark["bg.surface"],
    ],
  },
  {
    id: "green",
    label: "Green",
    description: "Green Rich primary buttons (#004842)",
    swatchesLight: [
      scales.neutral["0"],
      scales.green["800"],
      scales.neutral["100"],
    ],
    swatchesDark: [
      semantic.dark["bg.canvas"],
      scales.green["800"],
      semantic.dark["bg.surface"],
    ],
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Midnight primary buttons (light surfaces by default)",
    swatchesLight: [
      scales.neutral["0"],
      scales.midnight.base,
      scales.neutral["100"],
    ],
    swatchesDark: [
      semantic.dark["bg.canvas"],
      semantic.dark["action.primary.bg"],
      semantic.dark["bg.surface"],
    ],
  },
  {
    id: "berry",
    label: "Berry",
    description: "Berry primary buttons",
    swatchesLight: [
      scales.neutral["0"],
      scales.berry["500"],
      scales.neutral["100"],
    ],
    swatchesDark: [
      semantic.dark["bg.canvas"],
      scales.berry["300"],
      semantic.dark["bg.surface"],
    ],
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    (THEME_IDS as readonly string[]).includes(value)
  );
}

export function isColorMode(value: unknown): value is ColorMode {
  return (
    typeof value === "string" &&
    (COLOR_MODES as readonly string[]).includes(value)
  );
}

export function resolveThemeId(value: unknown): ThemeId {
  if (isThemeId(value)) return value;
  if (typeof value === "string" && value in LEGACY_THEME_IDS) {
    return LEGACY_THEME_IDS[value];
  }
  return DEFAULT_THEME_ID;
}

export function resolveColorMode(value: unknown): ColorMode {
  return isColorMode(value) ? value : DEFAULT_COLOR_MODE;
}

export function applyTheme(themeId: ThemeId, colorMode: ColorMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", themeId);
  root.setAttribute("data-mode", colorMode);
}

export function readStoredTheme(): {
  themeId: ThemeId;
  colorMode: ColorMode;
  ctaTokenId: string | null;
  backgroundTokenId: string | null;
  headerTokenId: string | null;
  formElementSchemeId: FormElementSchemeId;
  surfaceSchemeId: SurfaceSchemeId | null;
} {
  if (typeof localStorage === "undefined") {
    return {
      themeId: DEFAULT_THEME_ID,
      colorMode: DEFAULT_COLOR_MODE,
      ctaTokenId: null,
      backgroundTokenId: null,
      headerTokenId: null,
      formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
      surfaceSchemeId: null,
    };
  }
  try {
    const raw = localStorage.getItem("wingify-theme");
    if (!raw) {
      return {
        themeId: DEFAULT_THEME_ID,
        colorMode: DEFAULT_COLOR_MODE,
        ctaTokenId: null,
        backgroundTokenId: null,
        headerTokenId: null,
        formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
        surfaceSchemeId: null,
      };
    }
    const parsed = JSON.parse(raw) as {
      state?: {
        themeId?: unknown;
        colorMode?: unknown;
        ctaTokenId?: unknown;
        backgroundTokenId?: unknown;
        headerTokenId?: unknown;
        formElementSchemeId?: unknown;
        surfaceSchemeId?: unknown;
      };
    };
    const cta =
      typeof parsed?.state?.ctaTokenId === "string"
        ? parsed.state.ctaTokenId
        : null;
    const background =
      typeof parsed?.state?.backgroundTokenId === "string"
        ? parsed.state.backgroundTokenId
        : null;
    const header =
      typeof parsed?.state?.headerTokenId === "string"
        ? parsed.state.headerTokenId
        : null;
    const rawTheme = parsed?.state?.themeId;
    return {
      themeId: resolveThemeId(rawTheme),
      colorMode: resolveColorMode(parsed?.state?.colorMode),
      ctaTokenId: cta,
      backgroundTokenId: background,
      headerTokenId: header,
      formElementSchemeId: resolveFormElementSchemeId(
        rawTheme === "yellow-b"
          ? "yellow-maroon"
          : parsed?.state?.formElementSchemeId
      ),
      surfaceSchemeId: resolveSurfaceSchemeId(parsed?.state?.surfaceSchemeId),
    };
  } catch {
    return {
      themeId: DEFAULT_THEME_ID,
      colorMode: DEFAULT_COLOR_MODE,
      ctaTokenId: null,
      backgroundTokenId: null,
      headerTokenId: null,
      formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
      surfaceSchemeId: null,
    };
  }
}

/** @deprecated Prefer `readStoredTheme` */
export function readStoredThemeId(): ThemeId {
  return readStoredTheme().themeId;
}
