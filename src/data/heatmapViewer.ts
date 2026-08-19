// Dummy overlays for the Insights → Heatmaps viewer. Everything is expressed in
// viewport percentages so an overlay lines up with the preview site at any size.

/** 0 = cool (a click or two), 1 = warm core, 2 = full hotspot. */
export type HeatTier = 0 | 1 | 2;

/** [left %, top %, diameter px, heat] */
export type HeatDot = readonly [number, number, number, HeatTier];

/** [left %, top %, width %, height %] */
export type Rect = readonly [number, number, number, number];

export const HEAT_DOTS: readonly HeatDot[] = [
  [12.4, 35.5, 24, 0],
  [49.3, 92.1, 21, 0],
  [15.4, 42.6, 23, 0],
  [42.3, 24.9, 21, 0],
  [35.2, 61.2, 23, 0],
  [85.8, 72.6, 18, 0],
  [88.2, 75.9, 27, 0],
  [73.3, 70.6, 19, 0],
  [56, 21.7, 22, 0],
  [57.4, 95.7, 25, 0],
  [26.4, 7.4, 26, 0],
  [20.5, 90.3, 20, 0],
  [9.6, 34.3, 17, 0],
  [95.9, 92, 20, 0],
  [78, 88.1, 23, 0],
  [89, 46, 24, 0],
  [80.9, 56.1, 23, 0],
  [75.9, 28.7, 18, 0],
  [67.3, 48.1, 24, 0],
  [95.1, 66.3, 32, 0],
  [91.4, 29.1, 17, 0],
  [96.5, 5.3, 27, 0],
  [78.2, 27.3, 26, 0],
  [42.2, 31.9, 32, 0],
  [17.6, 8.4, 19, 0],
  [79.3, 54.4, 17, 0],
  [22.1, 43.7, 17, 0],
  [35.7, 85.2, 18, 0],
  [8.3, 67.6, 26, 0],
  [83.9, 93.7, 26, 0],
  [19.7, 12.5, 25, 0],
  [43.5, 77.4, 27, 0],
  [18.7, 76.9, 27, 0],
  [85.1, 28.3, 29, 0],
  [97.4, 96.9, 25, 0],
  [35, 31.1, 17, 0],
  [68.9, 43.5, 23, 0],
  [91.7, 23.1, 28, 0],
  [23.4, 67.8, 18, 0],
  [96.7, 53, 25, 0],
  [44, 28.4, 23, 0],
  [72.5, 53.8, 16, 0],
  [37.5, 38.8, 18, 0],
  [46.1, 38.3, 16, 0],
  [26, 44, 57, 2],
  [30.1, 45, 30, 1],
  [23.6, 41.6, 36, 1],
  [52, 60, 55, 2],
  [54.3, 57.5, 37, 1],
  [54, 56.7, 37, 1],
  [34, 61, 53, 2],
  [29.5, 63.1, 37, 1],
  [38.5, 62.4, 25, 1],
  [9, 7, 49, 2],
  [11.7, 9.7, 30, 1],
  [11.6, 8.8, 34, 1],
  [26, 7, 56, 2],
  [27.7, 9.9, 28, 1],
  [29.8, 8, 28, 1],
  [45, 7, 51, 2],
  [48, 3.8, 28, 1],
  [43.6, 6.3, 25, 1],
  [62, 7, 48, 2],
  [65.4, 6.2, 26, 1],
  [61.5, 5, 36, 1],
  [80, 7, 52, 2],
  [84.1, 5.6, 32, 1],
  [75.7, 4.5, 33, 1],
  [15, 24, 52, 2],
  [12.7, 26.4, 35, 1],
  [16.4, 23.9, 31, 1],
  [41, 24, 56, 2],
  [44.2, 26.8, 28, 1],
  [41.2, 24.7, 25, 1],
];

export const HOVER_DOTS: readonly HeatDot[] = [
  [86.0, 4.2, 22, 0],
  [12.7, 83.2, 23, 0],
  [85.5, 82.9, 16, 0],
  [88.3, 25.4, 18, 0],
  [84.9, 74.3, 25, 0],
  [6.1, 19.3, 18, 0],
  [18.4, 19.4, 17, 1],
  [46.4, 20.0, 18, 0],
  [78.0, 82.4, 26, 1],
  [68.5, 50.9, 16, 0],
  [42.7, 75.9, 24, 0],
  [43.3, 80.1, 23, 0],
  [84.6, 24.9, 20, 0],
  [4.7, 70.5, 25, 0],
  [12.3, 39.5, 17, 0],
  [7.1, 12.5, 16, 0],
  [88.9, 74.9, 22, 0],
  [88.3, 34.5, 16, 1],
  [92.2, 56.8, 21, 0],
  [43.7, 15.1, 22, 0],
  [46.2, 84.4, 20, 1],
  [87.4, 41.7, 18, 1],
  [78.3, 40.5, 26, 0],
  [50.6, 83.0, 19, 1],
  [84.8, 46.1, 24, 0],
  [55.2, 27.1, 16, 0],
  [89.9, 34.7, 25, 1],
  [17.7, 86.5, 16, 0],
  [22.2, 75.1, 19, 0],
  [41.8, 31.9, 17, 0],
  [85.5, 5.4, 21, 0],
  [32.5, 41.2, 24, 0],
  [57.5, 7.7, 21, 0],
  [2.6, 89.5, 23, 0],
  [65.0, 14.2, 25, 0],
  [91.1, 89.8, 15, 0],
  [91.0, 54.4, 17, 1],
  [98.2, 15.5, 23, 1],
  [76.0, 8.5, 21, 0],
  [5.8, 4.5, 24, 1],
  [25.0, 14.9, 24, 0],
  [14.6, 61.8, 25, 0],
  [23.6, 91.5, 15, 1],
  [97.3, 32.3, 23, 1],
  [63.3, 27.4, 18, 0],
  [47.4, 34.5, 26, 0],
  [69.0, 23.9, 24, 0],
  [25.0, 13.7, 17, 1],
  [31.5, 70.7, 19, 0],
  [29.8, 43.9, 19, 0],
  [47.0, 70.3, 17, 0],
  [67.0, 36.4, 17, 0],
  [69.4, 42.5, 20, 0],
  [24.8, 6.4, 15, 0],
  [60.6, 20.9, 22, 1],
  [48.3, 33.2, 22, 1],
  [48.9, 29.1, 26, 0],
  [37.3, 10.8, 20, 0],
  [95.2, 37.7, 22, 1],
  [32.7, 52.2, 17, 1],
  [70.0, 95.8, 24, 0],
  [20.2, 12.1, 21, 0],
  [24.2, 60.4, 24, 1],
  [35.2, 46.8, 20, 1],
  [75.3, 76.1, 16, 0],
  [76.7, 5.3, 17, 0],
  [7.5, 76.4, 25, 1],
  [28.1, 49.4, 15, 0],
  [51.8, 34.8, 25, 0],
  [74.0, 8.0, 25, 1],
  [7.8, 6.8, 17, 0],
  [44.9, 57.8, 20, 0],
  [37.0, 56.9, 19, 0],
  [42.1, 41.7, 15, 1],
  [90.2, 72.5, 15, 0],
  [88.7, 17.0, 22, 0],
  [27.3, 38.6, 21, 0],
  [81.2, 18.2, 24, 1],
  [36.9, 8.0, 20, 1],
  [40.2, 89.2, 17, 1],
  [82.0, 52.3, 15, 1],
  [74.3, 9.6, 20, 1],
  [38.6, 3.6, 21, 1],
  [55.5, 59.7, 21, 0],
  [35.3, 41.6, 19, 0],
  [85.1, 38.2, 16, 1],
  [15.6, 15.4, 19, 0],
  [83.1, 87.1, 25, 0],
  [90.6, 90.6, 21, 1],
  [70.4, 58.3, 16, 1],
  [15.0, 35.0, 16, 0],
  [65.0, 13.4, 16, 0],
  [42.4, 22.0, 23, 1],
  [81.9, 34.8, 24, 0],
  [21.4, 71.9, 16, 0],
  [41.5, 17.6, 18, 1],
  [66.9, 51.4, 24, 1],
  [76.3, 20.5, 24, 0],
  [60.8, 39.2, 15, 1],
  [59.2, 21.9, 17, 0],
  [41.4, 97.2, 14, 0],
  [20.0, 42.5, 25, 0],
  [10.7, 23.9, 20, 1],
  [78.7, 57.8, 25, 0],
  [41.2, 50.2, 16, 0],
  [90.3, 84.3, 19, 0],
  [96.3, 76.5, 24, 1],
  [79.5, 56.1, 18, 0],
  [51.1, 44.3, 20, 0],
  [94.4, 67.4, 23, 0],
  [14.7, 97.4, 19, 1],
  [65.5, 20.7, 23, 0],
  [69.9, 53.7, 17, 0],
  [63.1, 25.6, 15, 0],
  [18.9, 10.5, 20, 0],
  [71.2, 10.8, 21, 1],
  [18.2, 67.7, 17, 0],
  [60.8, 86.8, 22, 0],
  [42.0, 33.6, 18, 0],
  [70.1, 26.6, 22, 1],
  [39.1, 72.1, 15, 0],
  [94.1, 71.4, 24, 0],
  [95.2, 84.3, 18, 1],
  [78.7, 87.9, 24, 0],
  [13.7, 31.6, 17, 1],
  [19.3, 49.8, 17, 0],
  [78.1, 49.6, 15, 1],
  [64.6, 23.3, 24, 0],
  [57.3, 63.3, 18, 1],
  [39.2, 36.7, 17, 0],
  [78.6, 56.5, 16, 0],
  [50.4, 29.0, 20, 1],
  [36.2, 35.4, 21, 1],
  [22.6, 68.8, 14, 0],
  [85.3, 69.7, 23, 0],
  [22.2, 74.2, 20, 0],
  [62.9, 28.5, 22, 0],
  [98.8, 91.4, 22, 0],
  [91.6, 65.4, 15, 0],
  [33.7, 75.3, 23, 0],
  [12.8, 30.1, 25, 0],
  [75.7, 35.8, 25, 1],
  [3.3, 13.8, 14, 0],
  [16.0, 70.1, 16, 0],
  [20.3, 12.5, 19, 0],
  [33.8, 89.4, 23, 0],
  [37.7, 52.6, 22, 0],
  [78.0, 7.4, 16, 0],
  [92.4, 10.4, 15, 1],
  [38.5, 6.2, 25, 0],
];

export const FRICTION_DOTS: readonly HeatDot[] = [
  [75.0, 25.4, 23, 0],
  [66.7, 11.2, 14, 0],
  [64.9, 9.2, 14, 2],
  [77.1, 17.6, 16, 0],
  [94.9, 18.3, 22, 0],
  [73.1, 9.5, 15, 0],
  [81.3, 10.5, 18, 0],
  [64.6, 9.0, 23, 0],
  [97.1, 8.3, 20, 0],
  [65.5, 15.4, 18, 0],
  [87.0, 17.9, 14, 0],
  [58.7, 18.3, 14, 0],
  [62.8, 26.3, 23, 0],
  [83.6, 26.9, 23, 2],
  [62.7, 13.2, 21, 2],
  [86.3, 15.2, 16, 0],
  [72.5, 19.6, 14, 0],
  [92.1, 24.4, 20, 2],
  [69.6, 12.9, 18, 0],
  [60.5, 20.2, 18, 0],
  [68.9, 27.8, 20, 0],
  [63.0, 27.7, 22, 0],
  [41.3, 35.7, 18, 0],
  [13.3, 25.3, 13, 0],
  [65.4, 25.9, 17, 0],
  [3.4, 26.6, 17, 0],
];

/** Clickable elements the clickmap outlines, with their share of page clicks. */
export type ClickTarget = {
  id: string;
  rect: Rect;
  clicks: number;
  /** Percent of page clicks, pre-computed so the UI stays presentational. */
  share: string;
};

/** Baseline event volumes — the store narrows these down as filters apply. */
export const BASE_CLICKS = 111;
export const BASE_HOVERS = 548;

export const FRICTION_TYPE_IDS = ["rage", "dead", "error"] as const;
export type FrictionTypeId = (typeof FRICTION_TYPE_IDS)[number];

export const FRICTION_TYPE_LABELS: Record<FrictionTypeId, string> = {
  rage: "Rage clicks",
  dead: "Dead clicks",
  error: "Error clicks",
};

export const CLICKMAP_TOTAL = 136;

export const CLICK_TARGETS: readonly ClickTarget[] = [
  { id: "logo", rect: [13.5, 5.5, 12, 6], clicks: 7, share: "5%" },
  { id: "nav-pricing", rect: [33.5, 3.5, 6, 9], clicks: 9, share: "7%" },
  { id: "contact", rect: [73.5, 1.2, 5, 3.5], clicks: 4, share: "3%" },
  { id: "headline", rect: [14.5, 21.5, 35, 26], clicks: 5, share: "4%" },
  { id: "cta-primary", rect: [27, 56.5, 12, 6], clicks: 22, share: "16%" },
  { id: "cta-secondary", rect: [14.5, 56.5, 11.5, 6], clicks: 14, share: "10%" },
];

/** The tooltip the clickmap parks on the page, mirroring a hovered target. */
export const CLICKMAP_TOOLTIP = {
  at: [46, 54] as const,
  clicks: 4,
  share: "3%",
};

/** Region the click-area tool has already drawn once the coach mark is gone. */
export const CLICK_AREA_SELECTION: Rect = [9.5, 10.5, 42, 65];

/** Scrollmap bands, top to bottom. `to` is the bottom edge as a viewport %. */
export type ScrollBand = { to: number; token: string; alpha: number };

export const SCROLL_BANDS: readonly ScrollBand[] = [
  { to: 13, token: "--report-red", alpha: 0.72 },
  { to: 55, token: "--warning-solid", alpha: 0.62 },
  { to: 78, token: "--warning-solid", alpha: 0.42 },
  { to: 92, token: "--report-green", alpha: 0.5 },
  { to: 100, token: "--report-green-mid", alpha: 0.55 },
];

export const SCROLLMAP_STATS = {
  totalViews: 753,
  foldAt: 46,
  foldViews: 552,
  foldShare: "73.3%",
};

/** Zonalmap regions — `share` drives both the label and the fill intensity. */
export type Zone = {
  id: string;
  rect: Rect;
  label: string;
  clicks: number;
  tier: HeatTier;
};

export const ZONALMAP_TOTAL = 111;

export const ZONES: readonly Zone[] = [
  { id: "utility", rect: [0, 0, 100, 4.5], label: "0.9%", clicks: 1, tier: 0 },
  { id: "nav", rect: [0, 4.5, 100, 8], label: "18.92%", clicks: 21, tier: 1 },
  { id: "hero", rect: [15, 17, 70, 65], label: "33.33%", clicks: 37, tier: 2 },
];

export const ZONALMAP_TOOLTIP = { at: [62, 36] as const, zoneId: "hero" };

/** Element list rows — clicks already sorted desc, shares pre-computed. */
export type ElementRow = {
  element: string;
  type: string;
  clicks: number;
  share: string;
};

export const ELEMENT_LIST_TOTAL = 111;

export const ELEMENT_ROWS: readonly ElementRow[] = [
  { element: "Pricing", type: "Span", clicks: 9, share: "8.1%" },
  { element: "https://static.wingify.com/gcp/w", type: "Image", clicks: 7, share: "6.3%" },
  { element: "See it in action", type: "Span", clicks: 7, share: "6.3%" },
  { element: "https://static.wingify.com/gcp/w", type: "Image", clicks: 6, share: "5.4%" },
  { element: "onetrust-close-btn-handler on...", type: "Button", clicks: 6, share: "5.4%" },
  { element: "Allow Cookies", type: "Button", clicks: 5, share: "4.5%" },
  { element: "Bring Back Lost Visitors at 4x t", type: "Division", clicks: 5, share: "4.5%" },
  { element: "Capabilities", type: "Division", clicks: 5, share: "4.5%" },
  { element: "Explore for Free", type: "Button", clicks: 5, share: "4.5%" },
  { element: "https://static.wingify.com/gcp/w", type: "Image", clicks: 5, share: "4.5%" },
  { element: "VWO Engage", type: "Strong Text", clicks: 5, share: "4.5%" },
  { element: "VWO Engage", type: "Section", clicks: 5, share: "4.5%" },
  { element: "https://static.wingify.com/gcp/u", type: "Image", clicks: 4, share: "3.6%" },
  { element: "Request Demo", type: "Button", clicks: 4, share: "3.6%" },
  { element: "Solutions", type: "Division", clicks: 3, share: "2.7%" },
];

/** Metrics picker presets (zonalmap → Click distribution). */
export type MetricPreset = {
  id: string;
  label: string;
  description: string;
  isNew?: boolean;
};

export const METRIC_PRESETS: readonly MetricPreset[] = [
  {
    id: "click-distribution",
    label: "Click distribution",
    description:
      "Click distribution shows how clicks are divided across all elements on the page, highlighting user engagement hotspots.",
  },
  {
    id: "click-rate",
    label: "Click rate",
    description:
      "Click rate compares clicks on a zone against the visitors who saw it, so small zones aren't penalised by low traffic.",
  },
  {
    id: "click-count",
    label: "Click count",
    description: "Raw number of clicks recorded inside each zone, unweighted.",
  },
  {
    id: "hover-rate",
    label: "Hover rate",
    description:
      "Share of visitors who paused over a zone without clicking — useful for spotting hesitation.",
    isNew: true,
  },
  {
    id: "engagement-rate",
    label: "Engagement rate",
    description:
      "Blends clicks, hovers, and dwell time into a single score per zone.",
    isNew: true,
  },
];

/** Campaign picker options (the flask control). */
export const CAMPAIGN_TYPES = [
  { id: "web", label: "Web Experimentation" },
  { id: "feature", label: "Feature Experimentation" },
] as const;

/** Wandz analysis report. */
export const WANDZ_REPORT = {
  suggestions: [
    "Mobile hero optimization",
    "Exit intent triggers",
    "Social proof visibility",
  ],
  positives: [
    "Clear value proposition focused on bringing back lost website visitors.",
    "Multiple clear call-to-action options provided above the fold (Explore for Free, Request Demo, See it in Action).",
    "High engagement on evaluation elements like the Pricing navigation link.",
  ],
  negatives: [
    "Severe scroll drop-off occurring right after the hero section (views plummet from 60% at 6% scroll to 21.75% at 12% scroll).",
    "Significant dead clicks on non-interactive product images and visual assets.",
    "Lower click conversion on main CTA buttons compared to secondary navigation links.",
  ],
  observations: [
    "Extreme drop-off in user interest right below the fold",
    "Product imagery reads as clickable but isn't wired up",
    "Secondary nav absorbs clicks intended for the primary CTA",
  ],
} as const;

/** Zones drawn while Edit zones mode is active. */
export const EDIT_ZONE_DRAFTS: readonly Rect[] = [
  [13, 14, 74, 46],
  [28, 66, 44, 30],
];
