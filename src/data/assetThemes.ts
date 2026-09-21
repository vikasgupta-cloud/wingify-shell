/** Dummy themes for Configuration → Assets Hub → Themes. */

export type AssetTheme = {
  id: string;
  name: string;
  badge: string;
  /** Palette swatches — stored as data for preview circles. */
  palette: string[];
  typography: string;
};

export const ASSET_THEMES: AssetTheme[] = [
  {
    id: "dark",
    name: "Dark",
    badge: "Standard",
    palette: ["#ffffff", "#e8e8e8", "#f5f5f0", "#2a2a2a"],
    typography: "-apple-system, BlinkMacSystemFont, Segoe UI",
  },
  {
    id: "british-phonebooth",
    name: "British Phonebooth",
    badge: "Standard",
    palette: ["#ffffff", "#2a2a2a", "#ffffff", "#f5f5f0"],
    typography: "-apple-system, BlinkMacSystemFont, Segoe UI",
  },
  {
    id: "clockwork-orange",
    name: "Clockwork Orange",
    badge: "Standard",
    palette: ["#ffffff", "#e8e8e8", "#ffffff", "#2a2a2a"],
    typography: "-apple-system, BlinkMacSystemFont, Segoe UI",
  },
  {
    id: "cloudy-sea",
    name: "Cloudy Sea",
    badge: "Standard",
    palette: ["#4a9b9b", "#4a4a4a", "#8a8a8a", "#f5f5f0"],
    typography: "-apple-system, BlinkMacSystemFont, Segoe UI",
  },
  {
    id: "ecologic",
    name: "Ecologic",
    badge: "Standard",
    palette: ["#3d4a52", "#2a2a2a", "#4a4a4a", "#2d5a3d"],
    typography: "-apple-system, BlinkMacSystemFont, Segoe UI",
  },
  {
    id: "frosted-glass",
    name: "Frosted Glass",
    badge: "Standard",
    palette: ["#1a1a1a", "#ffffff", "#f5f5f0", "#2a2a2a"],
    typography: "-apple-system, BlinkMacSystemFont, Segoe UI",
  },
];
