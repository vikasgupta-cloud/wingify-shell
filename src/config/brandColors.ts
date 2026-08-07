/**
 * Wingify brand colors — from `vwo-colour-tokens.figma.json` primitives.
 * Semantic CSS mapping lives in `src/index.css`.
 */

/** Main & primary palette — brand values from VWO primitives. */
export const BRAND_COLORS = {
  /** yellow/50 — Primary Yellow */
  yellow: "#EEFF6D",
  /** ocean/300 — Primary Blue / Sky */
  blue: "#91C5FF",
  /** maroon/900 — Primary Maroon */
  maroon: "#410D23",
  /** neutral/0 */
  white: "#FFFFFF",
  /** neutral/50 — Grey */
  grey: "#F6F3ED",
  /** neutral/100 — Feather */
  feather: "#E5E0D6",
  /** neutral/300 — Dusk */
  dusk: "#B2ADA1",
  /** neutral/600 — Twilight */
  twilight: "#5F5C53",
  /** midnight/base */
  midnight: "#1E2022",
  /** green/800 · green/300 · green/100 */
  greenRich: "#004842",
  greenBright: "#07C787",
  greenTint: "#D8E9E8",
  /** cherry/500 · cherry/400 · cherry/100 */
  cherryRich: "#DE2D02",
  cherryBright: "#FF6038",
  cherryTint: "#F4E4E4",
  /** berry/500 · berry/300 · berry/100 */
  berryRich: "#CB37A4",
  berryBright: "#F87FD8",
  berryTint: "#F4E4F3",
  /** ocean/900 · ocean/500 · ocean/100 */
  oceanRich: "#0E1D4A",
  oceanBright: "#406BED",
  oceanTint: "#D3E8FF",
} as const;

/** Extra scale steps used by legacy mappings. */
export const TOKEN_EXTRAS = {
  ocean50: "#F6FAFE",
  ocean700: "#3256C0",
  ocean800: "#2846A0",
  neutral100: "#E5E0D6",
  neutral300: "#DBD6CB",
  green50: "#F7FAF9",
  /** green/300 — #07C787 */
  green300: "#07C787",
  green500: "#00A87D",
  green600: "#00856B",
  green700: "#00574D",
  yellow100: "#E4F462",
  yellow400: "#8F9B04",
  yellow700: "#4B5100",
  maroon50: "#FFF8FA",
  berry50: "#FCF8FB",
  cherry50: "#FCF9F8",
  cherry700: "#971A00",
  sky50: "#F6FAFE",
  sky100: "#D3E8FF",
  sky700: "#2846A0",
} as const;

/** @deprecated Prefer `BRAND_COLORS.blue` */
export const sky = BRAND_COLORS.blue;

export type BrandColorName = keyof typeof BRAND_COLORS;
