import tokens from "./tokens.json";
import {
  DEFAULT_SURFACE_SCHEME_ID,
  resolveSurfaceSchemeId,
  type SurfaceSchemeId,
} from "./surfaceTokens";
import {
  DEFAULT_FORM_ELEMENT_SCHEME_ID,
  resolveFormElementSchemeId,
  type FormElementSchemeId,
} from "./formElementSchemes";
import {
  DEFAULT_BACKGROUND_TOKEN_ID,
  DEFAULT_HEADER_TOKEN_ID,
  resolveBackgroundTokenId,
  resolveWingifyChromeTokens,
} from "./backgroundTokens";

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
  "maroon",
  "neutral-black",
  "wingify",
] as const;

export const COLOR_MODES = ["light", "dark"] as const;

export type ThemeId = (typeof THEME_IDS)[number];
export type ColorMode = (typeof COLOR_MODES)[number];

export const DEFAULT_THEME_ID: ThemeId = "wingify";
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
  {
    id: "maroon",
    label: "Maroon",
    description: "Maroon 900 primary buttons (#410D23)",
    swatchesLight: [
      scales.neutral["0"],
      scales.maroon["900"],
      scales.neutral["100"],
    ],
    swatchesDark: [
      semantic.dark["bg.canvas"],
      scales.maroon["900"],
      semantic.dark["bg.surface"],
    ],
  },
  {
    id: "neutral-black",
    label: "Neutral black",
    description: "Neutral 950 primary — VWO Neutral black as Primary tokens",
    swatchesLight: [
      scales.neutral["0"],
      scales.neutral["950"],
      scales.neutral["100"],
    ],
    swatchesDark: [
      semantic.dark["bg.canvas"],
      scales.neutral["100"],
      semantic.dark["bg.surface"],
    ],
  },
  {
    id: "wingify",
    label: "Wingify",
    description:
      "Full Wingify pack — white cards/nav, warm pane, ink primary, lemon selection",
    swatchesLight: ["#FFFFFF", "#1B1913", "#EEFF6D"],
    swatchesDark: ["#1B1913", "#F6F3ED", "#EEFF6D"],
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
      backgroundTokenId: DEFAULT_BACKGROUND_TOKEN_ID,
      headerTokenId: DEFAULT_HEADER_TOKEN_ID,
      formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
      surfaceSchemeId: DEFAULT_SURFACE_SCHEME_ID,
    };
  }
  try {
    const raw = localStorage.getItem("wingify-theme");
    if (!raw) {
      return {
        themeId: DEFAULT_THEME_ID,
        colorMode: DEFAULT_COLOR_MODE,
        ctaTokenId: null,
        backgroundTokenId: DEFAULT_BACKGROUND_TOKEN_ID,
        headerTokenId: DEFAULT_HEADER_TOKEN_ID,
        formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
        surfaceSchemeId: DEFAULT_SURFACE_SCHEME_ID,
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
    const rawTheme = parsed?.state?.themeId;
    const themeId = resolveThemeId(rawTheme);
    const colorMode = resolveColorMode(parsed?.state?.colorMode);
    const chrome =
      themeId === "wingify"
        ? resolveWingifyChromeTokens(
            colorMode,
            parsed?.state?.backgroundTokenId,
            parsed?.state?.headerTokenId
          )
        : {
            backgroundTokenId:
              parsed?.state?.backgroundTokenId === undefined
                ? null
                : resolveBackgroundTokenId(parsed?.state?.backgroundTokenId),
            headerTokenId:
              parsed?.state?.headerTokenId === undefined
                ? null
                : resolveBackgroundTokenId(parsed?.state?.headerTokenId),
          };
    return {
      themeId,
      colorMode,
      ctaTokenId: cta,
      backgroundTokenId: chrome.backgroundTokenId,
      headerTokenId: chrome.headerTokenId,
      formElementSchemeId: resolveFormElementSchemeId(
        rawTheme === "yellow-b"
          ? "yellow-maroon"
          : parsed?.state?.formElementSchemeId
      ),
      surfaceSchemeId:
        parsed?.state?.surfaceSchemeId === undefined
          ? DEFAULT_SURFACE_SCHEME_ID
          : resolveSurfaceSchemeId(parsed?.state?.surfaceSchemeId),
    };
  } catch {
    return {
      themeId: DEFAULT_THEME_ID,
      colorMode: DEFAULT_COLOR_MODE,
      ctaTokenId: null,
      backgroundTokenId: DEFAULT_BACKGROUND_TOKEN_ID,
      headerTokenId: DEFAULT_HEADER_TOKEN_ID,
      formElementSchemeId: DEFAULT_FORM_ELEMENT_SCHEME_ID,
      surfaceSchemeId: DEFAULT_SURFACE_SCHEME_ID,
    };
  }
}

/** @deprecated Prefer `readStoredTheme` */
export function readStoredThemeId(): ThemeId {
  return readStoredTheme().themeId;
}
