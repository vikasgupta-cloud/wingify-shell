import tokens from "./tokens.json";

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
    description: "Yellow primary buttons",
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
    description: "Green primary buttons (#07C787)",
    swatchesLight: [
      scales.neutral["0"],
      scales.green["300"],
      scales.neutral["100"],
    ],
    swatchesDark: [
      semantic.dark["bg.canvas"],
      scales.green["300"],
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
} {
  if (typeof localStorage === "undefined") {
    return { themeId: DEFAULT_THEME_ID, colorMode: DEFAULT_COLOR_MODE };
  }
  try {
    const raw = localStorage.getItem("wingify-theme");
    if (!raw) {
      return { themeId: DEFAULT_THEME_ID, colorMode: DEFAULT_COLOR_MODE };
    }
    const parsed = JSON.parse(raw) as {
      state?: { themeId?: unknown; colorMode?: unknown };
    };
    return {
      themeId: resolveThemeId(parsed?.state?.themeId),
      colorMode: resolveColorMode(parsed?.state?.colorMode),
    };
  } catch {
    return { themeId: DEFAULT_THEME_ID, colorMode: DEFAULT_COLOR_MODE };
  }
}

/** @deprecated Prefer `readStoredTheme` */
export function readStoredThemeId(): ThemeId {
  return readStoredTheme().themeId;
}
