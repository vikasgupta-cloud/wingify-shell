/**
 * Wingify brand colors — strict sources:
 * - `color.json` → main / primary palette (named Wingify colors)
 * - `tokens.json` → scale extras only (hover, mid steps, soft tints)
 *
 * Semantic CSS mapping lives in `src/index.css`.
 */

/** Main & primary palette — hex from `color.json` only. */
export const BRAND_COLORS = {
  /** Wingify Primary Yellow */
  yellow: "#EEFF6D",
  /** Wingify Primary Blue */
  blue: "#91C5FF",
  /** Wingify Primary Maroon */
  maroon: "#410D23",
  /** Wingify White */
  white: "#FFFFFF",
  /** Wingify Grey */
  grey: "#F6F3ED",
  /** Wingify Feather */
  feather: "#E5E0D6",
  /** Wingify Dusk */
  dusk: "#B2ADA1",
  /** Wingify Twilight */
  twilight: "#5F5C53",
  /** Wingify Midnight */
  midnight: "#1E2022",
  /** Wingify Green Rich / Bright / Tint */
  greenRich: "#004842",
  greenBright: "#07C787",
  greenTint: "#D8E9E8",
  /** Wingify Cherry Rich / Bright / Tint */
  cherryRich: "#DE2D02",
  cherryBright: "#FF6038",
  cherryTint: "#F4E4E4",
  /** Wingify Berry Rich / Bright / Tint */
  berryRich: "#CB37A4",
  berryBright: "#F87FD8",
  berryTint: "#F4E4F3",
  /** Wingfy Ocean Rich / Wingify Ocean Bright / Tint */
  oceanRich: "#0E1D4A",
  oceanBright: "#406BED",
  oceanTint: "#D3E8FF",
} as const;

/**
 * Extra steps from `tokens.json` scales — only when color.json has no match.
 * Matches tokens.semantic.light primary.hover / active, soft tints, etc.
 */
export const TOKEN_EXTRAS = {
  ocean50: "#F2F7FE",
  ocean700: "#3256C0",
  ocean800: "#243F92",
  neutral100: "#EFEBE3",
  neutral300: "#C9C4B8",
  green50: "#ECFAF9",
  green300: "#7CD9C1",
  green600: "#008F71",
  yellow100: "#E7F867",
  maroon50: "#FEF4F6",
  berry50: "#FEF3FD",
  cherry50: "#FFF4F4",
  sky50: "#F1F8FF",
} as const;

/** @deprecated Prefer `BRAND_COLORS.blue` — Primary Blue from color.json */
export const sky = BRAND_COLORS.blue;

export type BrandColorName = keyof typeof BRAND_COLORS;
