import {
  Blocks,
  CircleDollarSign,
  File,
  LayoutPanelTop,
  MousePointerClick,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type MetricCategory =
  | "Action"
  | "Widgets"
  | "Pages"
  | "Custom"
  | "Browsing Indicators"
  | "Transaction";

export type MetricCondition = { label: string; value: string };

export type Metric = {
  id: string;
  name: string;
  category: MetricCategory;
  tracks: string; // "Page visit" | "Click" | "Form submit" | "Custom event" | "Revenue"
  whereLabel: string; // "Where Page URL"
  whereOperator: string; // "Includes" | "Excludes"
  conditions: MetricCondition[];
  calculates: string; // "Unique visitors" | "Sessions" | "Total transactions"
  conversionWindow: string; // "7 days" | "14 days" | "30 days"
  createdBy: string; // "VWO" | "John Doe" | "Priya Menon"
  codeSnippet: string | null;
};

export const METRIC_CATEGORIES: MetricCategory[] = [
  "Action",
  "Widgets",
  "Pages",
  "Custom",
  "Browsing Indicators",
  "Transaction",
];

const CATEGORY_ICONS: Record<MetricCategory, LucideIcon> = {
  Action: MousePointerClick,
  Widgets: LayoutPanelTop,
  Pages: File,
  Custom: Blocks,
  "Browsing Indicators": TrendingUp,
  Transaction: CircleDollarSign,
};

export function categoryIcon(c: MetricCategory): LucideIcon {
  return CATEGORY_ICONS[c];
}

// Deterministic 32-bit string hash (FNV-1a). No Math.random — every field is
// derived from the metric id so the catalog is identical on every load.
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(pool: T[], seed: string): T {
  return pool[hash(seed) % pool.length];
}

// The per-category name lists. Each begins with the three shared names, then
// category-appropriate metrics. Counts: Action 8, Widgets 8, Pages 8,
// Custom 9, Browsing Indicators 9, Transaction 9 => 51 total.
const NAMES: Record<MetricCategory, string[]> = {
  Action: [
    "Unique visitors",
    "Sessions",
    "Total transactions",
    "CTA button click rate",
    "Add to cart clicks",
    "Signup button click",
    "Video play rate",
    "Link click rate",
  ],
  Widgets: [
    "Unique visitors",
    "Sessions",
    "Total transactions",
    "Widget engagement",
    "Carousel interaction",
    "Chat widget opens",
    "Popup dismissals",
    "Banner click rate",
  ],
  Pages: [
    "Unique visitors",
    "Sessions",
    "Total transactions",
    "Page visit",
    "Bounce rate",
    "Pages per session",
    "Exit rate",
    "Scroll depth",
  ],
  Custom: [
    "Unique visitors",
    "Sessions",
    "Total transactions",
    "Custom event fired",
    "API conversion",
    "Feature adoption",
    "Onboarding completion",
    "Custom goal",
    "Engagement score",
  ],
  "Browsing Indicators": [
    "Unique visitors",
    "Sessions",
    "Total transactions",
    "Return visits",
    "Time on site",
    "Session duration",
    "Search usage",
    "Filter usage",
    "Wishlist adds",
  ],
  Transaction: [
    "Unique visitors",
    "Sessions",
    "Total transactions",
    "Revenue per visitor",
    "Transaction rate",
    "Average order value",
    "Checkout completion",
    "Refund rate",
    "Coupon usage",
  ],
};

// Default "tracks" verb per category; overridden below for the shared names.
const CATEGORY_TRACKS: Record<MetricCategory, string> = {
  Action: "Click",
  Widgets: "Click",
  Pages: "Page visit",
  Custom: "Custom event",
  "Browsing Indicators": "Page visit",
  Transaction: "Revenue",
};

const CONDITION_LABELS = [
  "URL matches",
  "Page group is",
  "URL contains",
  "Element is",
  "Event name is",
];
const CONDITION_VALUES = [
  "https://Chroma.com/products/size-chart",
  "cart pages",
  "checkout pages",
  ".add-to-cart",
  "signup_complete",
  "https://Chroma.com/cart",
  "product pages",
];
const CONVERSION_WINDOWS = ["7 days", "14 days", "30 days"];
const CREATED_BY = ["VWO", "John Doe", "Priya Menon"];
const CALCULATES = ["Unique visitors", "Sessions", "Total transactions"];

const SNIPPETS = [
  `window.VWO = window.VWO || [];\nVWO.event = VWO.event || [];\nVWO.event.push(["goalTriggered", { id: "cta_click" }]);`,
  `document.querySelector(".add-to-cart")\n  .addEventListener("click", function () {\n    window.VWO.push(["track.goalConversion", 213]);\n  });`,
  `window.VWO = window.VWO || [];\nVWO.push(["track.revenueConversion", {\n  revenue: order.total,\n  currency: "USD"\n}]);`,
  `window.dataLayer = window.dataLayer || [];\ndataLayer.push({\n  event: "vwo_custom_event",\n  metric: "engagement"\n});`,
];

function calculatesFor(name: string, seed: string): string {
  if (CALCULATES.includes(name)) return name;
  return pick(CALCULATES, seed);
}

function tracksFor(name: string, category: MetricCategory): string {
  if (name === "Total transactions" || name === "Revenue per visitor")
    return "Revenue";
  if (name === "Sessions" || name === "Unique visitors") return "Page visit";
  return CATEGORY_TRACKS[category];
}

function conditionsFor(id: string): MetricCondition[] {
  const h = hash(id + ":cond");
  const count = (h % 2) + 1; // 1 or 2 conditions
  const out: MetricCondition[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      label: pick(CONDITION_LABELS, `${id}:cl:${i}`),
      value: pick(CONDITION_VALUES, `${id}:cv:${i}`),
    });
  }
  return out;
}

function buildMetric(category: MetricCategory, name: string, index: number): Metric {
  const slug = category.toLowerCase().replace(/[^a-z]+/g, "-");
  const id = `${slug}-${index}`;
  const h = hash(id);
  return {
    id,
    name,
    category,
    tracks: tracksFor(name, category),
    whereLabel: "Where Page URL",
    whereOperator: h % 5 === 0 ? "Excludes" : "Includes",
    conditions: conditionsFor(id),
    calculates: calculatesFor(name, `${id}:calc`),
    conversionWindow: pick(CONVERSION_WINDOWS, `${id}:cw`),
    createdBy: pick(CREATED_BY, `${id}:by`),
    // Roughly a third carry a snippet.
    codeSnippet: hash(`${id}:snip`) % 3 === 0 ? pick(SNIPPETS, `${id}:sn`) : null,
  };
}

export const METRICS: Metric[] = METRIC_CATEGORIES.flatMap((category) =>
  NAMES[category].map((name, i) => buildMetric(category, name, i + 1))
);

const BY_ID = new Map(METRICS.map((m) => [m.id, m]));

export function metricById(id: string): Metric | undefined {
  return BY_ID.get(id);
}
