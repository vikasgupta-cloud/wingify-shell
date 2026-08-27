/** Chart types common in product analytics tools (Mixpanel, Amplitude, etc.). */

export const ANALYTICS_CHART_CATEGORIES = [
  "Trends",
  "Comparison",
  "Composition",
  "Conversion",
  "Retention",
  "Distribution",
  "Engagement",
] as const;

export type AnalyticsChartCategory =
  (typeof ANALYTICS_CHART_CATEGORIES)[number];

export type AnalyticsChartFilter = AnalyticsChartCategory | "All";

/** URL slug for a chart filter tab (`All` → `all`, `Trends` → `trends`). */
export function chartFilterSlug(filter: AnalyticsChartFilter): string {
  return filter === "All" ? "all" : filter.toLowerCase();
}

/** Parse a chart filter slug; returns null when unknown. */
export function parseChartFilterSlug(
  slug: string | undefined
): AnalyticsChartFilter | null {
  if (!slug) return null;
  if (slug === "all") return "All";
  const match = ANALYTICS_CHART_CATEGORIES.find(
    (cat) => cat.toLowerCase() === slug.toLowerCase()
  );
  return match ?? null;
}

export type AnalyticsChartId =
  | "palette"
  | "line"
  | "multi-line"
  | "area"
  | "stacked-area"
  | "bar"
  | "grouped-bar"
  | "stacked-bar"
  | "horizontal-bar"
  | "donut"
  | "pie"
  | "treemap"
  | "funnel"
  | "sankey"
  | "retention-curve"
  | "cohort-heatmap"
  | "histogram"
  | "box-plot"
  | "scatter"
  | "flow"
  | "session-heatmap"
  | "kpi-sparkline"
  | "gauge";

export type AnalyticsChartDef = {
  id: AnalyticsChartId;
  label: string;
  category: AnalyticsChartCategory;
  description: string;
  /** Tools that commonly ship this view. */
  tools: ("Mixpanel" | "Amplitude" | "Both")[];
};

export const ANALYTICS_CHARTS: AnalyticsChartDef[] = [
  {
    id: "palette",
    label: "Full palette",
    category: "Comparison",
    description:
      "All eight chart series tokens in finalized aesthetic draw order.",
    tools: ["Both"],
  },
  {
    id: "line",
    label: "Line",
    category: "Trends",
    description: "Single metric over time — DAU, events, revenue.",
    tools: ["Both"],
  },
  {
    id: "multi-line",
    label: "Multi-line",
    category: "Trends",
    description: "Compare several series on one time axis.",
    tools: ["Both"],
  },
  {
    id: "area",
    label: "Area",
    category: "Trends",
    description: "Filled trend emphasizing volume under the curve.",
    tools: ["Both"],
  },
  {
    id: "stacked-area",
    label: "Stacked area",
    category: "Composition",
    description: "Part-to-whole contribution of segments over time.",
    tools: ["Both"],
  },
  {
    id: "bar",
    label: "Bar",
    category: "Comparison",
    description: "Discrete categories — top events, plans, pages.",
    tools: ["Both"],
  },
  {
    id: "grouped-bar",
    label: "Grouped bar",
    category: "Comparison",
    description: "Side-by-side bars for segment comparison.",
    tools: ["Both"],
  },
  {
    id: "stacked-bar",
    label: "Stacked bar",
    category: "Comparison",
    description: "Stacked segments within each category.",
    tools: ["Both"],
  },
  {
    id: "horizontal-bar",
    label: "Horizontal bar",
    category: "Comparison",
    description: "Ranked lists with long labels — properties, paths.",
    tools: ["Both"],
  },
  {
    id: "donut",
    label: "Donut",
    category: "Composition",
    description: "Share of a whole with a center KPI.",
    tools: ["Both"],
  },
  {
    id: "pie",
    label: "Pie",
    category: "Composition",
    description: "Classic composition of categorical shares.",
    tools: ["Amplitude"],
  },
  {
    id: "treemap",
    label: "Treemap",
    category: "Composition",
    description: "Nested rectangles sized by volume or value.",
    tools: ["Amplitude"],
  },
  {
    id: "funnel",
    label: "Funnel",
    category: "Conversion",
    description: "Step conversion rates through a defined path.",
    tools: ["Both"],
  },
  {
    id: "sankey",
    label: "Sankey / flow",
    category: "Conversion",
    description: "How volume moves between steps or states.",
    tools: ["Mixpanel"],
  },
  {
    id: "retention-curve",
    label: "Retention curve",
    category: "Retention",
    description: "Percent retained by day/week after a start event.",
    tools: ["Both"],
  },
  {
    id: "cohort-heatmap",
    label: "Cohort heatmap",
    category: "Retention",
    description: "Cohort × period matrix of retention intensity.",
    tools: ["Both"],
  },
  {
    id: "histogram",
    label: "Histogram",
    category: "Distribution",
    description: "Frequency buckets — session length, cart value.",
    tools: ["Both"],
  },
  {
    id: "box-plot",
    label: "Box plot",
    category: "Distribution",
    description: "Median, quartiles, and outliers by segment.",
    tools: ["Amplitude"],
  },
  {
    id: "scatter",
    label: "Scatter",
    category: "Distribution",
    description: "Correlation between two numeric properties.",
    tools: ["Amplitude"],
  },
  {
    id: "flow",
    label: "User paths",
    category: "Engagement",
    description: "Most common sequences after or before an event.",
    tools: ["Both"],
  },
  {
    id: "session-heatmap",
    label: "Intensity heatmap",
    category: "Engagement",
    description: "Activity density across hours and weekdays.",
    tools: ["Mixpanel"],
  },
  {
    id: "kpi-sparkline",
    label: "KPI + sparkline",
    category: "Trends",
    description: "Big number with a compact trend thumb.",
    tools: ["Both"],
  },
  {
    id: "gauge",
    label: "Gauge / goal",
    category: "Conversion",
    description: "Progress toward a target or threshold.",
    tools: ["Amplitude"],
  },
];
