/**
 * Wingify / KOLO brand color tokens for the brand-design experiment.
 * Source of truth: `brand-colors.tokens.json` (Figma export).
 * Semantic app mapping lives in `src/index.css` (`--brand-*` + shadcn tokens).
 */
export const BRAND_COLORS = {
  yellow: "#EEFF6D",
  sky: "#91C5FF",
  maroon: "#410D23",
  white: "#FFFFFF",
  grey: "#F6F3ED",
  feather: "#E5E0D6",
  dusk: "#B2ADA1",
  twilight: "#5F5C53",
  midnight: "#1E2022",
  greenRich: "#004842",
  greenBright: "#07C787",
  greenTint: "#D8E9E8",
  cherryRich: "#DE2D02",
  cherryBright: "#FF6038",
  cherryTint: "#F4E4E4",
  berryRich: "#CB37A4",
  berryBright: "#F87FD8",
  berryTint: "#F4E4F3",
  oceanRich: "#0E1D4A",
  oceanBright: "#406BED",
  oceanTint: "#D3E8FF",
} as const;

export type BrandColorName = keyof typeof BRAND_COLORS;
