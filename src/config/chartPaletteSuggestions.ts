/**
 * Chart palette PROPOSALS only — not design tokens.
 *
 * These are exploration swatches for the Design System charts gallery.
 * Do not import into index.css, tokens.generated.css, Figma sync, or
 * chartTokens.ts. Hex is intentional here so proposals stay outside the
 * token system until a palette is approved.
 */

export type ChartPaletteSuggestion = {
  id: string;
  name: string;
  note: string;
  /** Series colors in draw order (typically 8; brand pack may use 9). */
  colors: readonly string[];
};

/**
 * Exploration palettes for the charts gallery. First entry is the Wingify
 * brand data-viz pack from brand guidelines (anchor + brights).
 */
export const CHART_PALETTE_SUGGESTIONS: readonly ChartPaletteSuggestion[] = [
  {
    id: "brand-data-viz",
    name: "Brand data viz",
    note: "Wingify guidelines: anchor with plum, then brights for playfulness. Neutrals stay off-series for backgrounds.",
    // Order mirrors brand usage — dark anchor first, then sky/orange/lime/pink/green/magenta/blue, teal close.
    colors: [
      "#6A1B3C", // plum anchor
      "#B8D9FF", // sky
      "#FF6038", // orange
      "#EEFF6D", // lime
      "#F87FD8", // pink
      "#07C787", // emerald
      "#CB37A4", // magenta
      "#406BED", // royal blue
      "#00574D", // deep teal
    ],
  },
  {
    id: "harvest-ink",
    name: "Harvest ink",
    note: "Warmer clay and brass, cooler lagoon/denim — closer to paper UI chrome.",
    colors: [
      "#2F6FA8", // denim (series 1)
      "#9A7A28", // brass
      "#6A54B0", // iris
      "#6F942C", // leaf
      "#C07AC8", // mauve
      "#1F6E52", // pine
      "#8F5324", // clay
      "#1C8894", // lagoon
    ],
  },
  {
    id: "parchment-spectrum",
    name: "Parchment spectrum",
    note: "Dustier, lower chroma — reads as print-ink on feather/grey surfaces.",
    colors: [
      "#3A6F9C",
      "#8C7634",
      "#6556A4",
      "#648A38",
      "#A878B8",
      "#2A6550",
      "#87562C",
      "#2A7E88",
    ],
  },
  {
    id: "studio-clear",
    name: "Studio clear",
    note: "Slightly cleaner hues for dense multi-series charts without neon punch.",
    colors: [
      "#2B74B0",
      "#A0842A",
      "#6B56BA",
      "#759B32",
      "#BE7AD0",
      "#1A6B4C",
      "#9A5522",
      "#12909C",
    ],
  },
  {
    id: "twilight-grove",
    name: "Twilight grove",
    note: "Leans berry/midnight of the brand — still earthy, a bit more dusk.",
    colors: [
      "#355F9E",
      "#8E6E2E",
      "#6E4EAE",
      "#5A8A3A",
      "#B06CB8",
      "#246048",
      "#8A4A28",
      "#2A7888",
    ],
  },
];
