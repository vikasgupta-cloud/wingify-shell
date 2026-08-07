/** App chrome themes — remap semantic CSS vars via `data-theme` on `<html>`. */

export const THEME_IDS = ["warm", "neutral", "cool", "contrast"] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME_ID: ThemeId = "warm";

export type ThemeOption = {
  id: ThemeId;
  label: string;
  description: string;
  /** Preview chips as space-separated HSL (no `hsl()` wrapper). */
  swatches: [string, string, string];
};

export const THEMES: ThemeOption[] = [
  {
    id: "warm",
    label: "Warm",
    description: "Brand default — cream greys and yellow CTAs",
    swatches: ["40 33.3% 94.7%", "67 100% 71.4%", "210 6.3% 12.5%"],
  },
  {
    id: "neutral",
    label: "Neutral",
    description: "Flatter cool greys, less paper warmth",
    swatches: ["210 14% 95%", "0 0% 100%", "210 8% 14%"],
  },
  {
    id: "cool",
    label: "Cool",
    description: "Sky and ocean surfaces with soft blue accents",
    swatches: ["212 45% 96%", "212 100% 78.4%", "225 68% 17%"],
  },
  {
    id: "contrast",
    label: "Contrast",
    description: "Dark chrome with high-contrast borders",
    swatches: ["210 6.3% 12.5%", "67 100% 71.4%", "0 0% 100%"],
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === "string" &&
    (THEME_IDS as readonly string[]).includes(value)
  );
}

export function applyTheme(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", themeId);
}

/** Read persisted theme before React mounts (avoids a flash of the wrong theme). */
export function readStoredThemeId(): ThemeId {
  if (typeof localStorage === "undefined") return DEFAULT_THEME_ID;
  try {
    const raw = localStorage.getItem("wingify-theme");
    if (!raw) return DEFAULT_THEME_ID;
    const parsed = JSON.parse(raw) as { state?: { themeId?: unknown } };
    return isThemeId(parsed?.state?.themeId)
      ? parsed.state.themeId
      : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}
