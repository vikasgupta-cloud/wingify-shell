/** Dummy chart series for Journey Analytics boards & reports. Client-side only. */

export type AnalyticsRange =
  | "Today"
  | "Yesterday"
  | "7D"
  | "30D"
  | "3M"
  | "6M"
  | "12M";

export type AnalyticsKpi = {
  label: string;
  value: string;
  delta: string;
  up: boolean;
};

export type AnalyticsSeriesPoint = {
  label: string;
  value: number;
};

export type AnalyticsDonutSlice = {
  label: string;
  value: number;
  /** CSS color token, e.g. var(--chart-1) */
  color: string;
};

export type AnalyticsBarRow = {
  label: string;
  value: number;
  max: number;
};

export type AnalyticsBoardChartData = {
  kpis: AnalyticsKpi[];
  traffic: AnalyticsSeriesPoint[];
  mix: AnalyticsDonutSlice[];
  funnels: AnalyticsBarRow[];
};

export type AnalyticsReportChartData = {
  kpis: AnalyticsKpi[];
  series: AnalyticsSeriesPoint[];
  breakdown: AnalyticsBarRow[];
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function rangeLabels(range: AnalyticsRange): string[] {
  switch (range) {
    case "Today":
      return ["12a", "4a", "8a", "12p", "4p", "8p"];
    case "Yesterday":
      return ["12a", "4a", "8a", "12p", "4p", "8p"];
    case "7D":
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    case "30D":
      return Array.from({ length: 8 }, (_, i) => `W${i + 1}`);
    case "3M":
      return ["Jan", "Feb", "Mar"];
    case "6M":
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    case "12M":
      return ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  }
}

function seriesFromSeed(
  seed: string,
  range: AnalyticsRange,
  base: number,
  swing: number
): AnalyticsSeriesPoint[] {
  const rand = seeded(hash(`${seed}:${range}:${base}`));
  const labels = rangeLabels(range);
  let v = base;
  return labels.map((label) => {
    v = Math.max(0, v + (rand() - 0.45) * swing);
    return { label, value: Math.round(v) };
  });
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

export function getBoardChartData(
  itemId: string,
  range: AnalyticsRange
): AnalyticsBoardChartData {
  const traffic = seriesFromSeed(itemId, range, 4200, 900);
  const last = traffic[traffic.length - 1]?.value ?? 0;
  const prev = traffic[0]?.value ?? last;
  const deltaPct = prev === 0 ? 0 : ((last - prev) / prev) * 100;

  const mixSeed = seeded(hash(`${itemId}:mix`));
  const a = 35 + mixSeed() * 20;
  const b = 25 + mixSeed() * 15;
  const c = Math.max(10, 100 - a - b);

  const funnels = [
    { label: "Viewed", value: 100, max: 100 },
    { label: "Clicked", value: 62 + hash(itemId) % 15, max: 100 },
    { label: "Added", value: 28 + hash(itemId) % 12, max: 100 },
    { label: "Purchased", value: 9 + hash(itemId) % 8, max: 100 },
  ];

  return {
    kpis: [
      {
        label: "Sessions",
        value: fmt(last * 12),
        delta: `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%`,
        up: deltaPct >= 0,
      },
      {
        label: "Conversion",
        value: `${(2.4 + (hash(itemId) % 20) / 10).toFixed(1)}%`,
        delta: "+0.3%",
        up: true,
      },
      {
        label: "Revenue",
        value: `$${fmt(18000 + (hash(itemId) % 40) * 500)}`,
        delta: "-1.2%",
        up: false,
      },
      {
        label: "Avg. order",
        value: `$${(42 + (hash(itemId) % 30)).toFixed(0)}`,
        delta: "+4.1%",
        up: true,
      },
    ],
    traffic,
    mix: [
      { label: "Organic", value: Math.round(a), color: "var(--chart-1)" },
      { label: "Paid", value: Math.round(b), color: "var(--chart-2)" },
      { label: "Direct", value: Math.round(c), color: "var(--chart-3)" },
    ],
    funnels,
  };
}

export function getReportChartData(
  itemId: string,
  range: AnalyticsRange
): AnalyticsReportChartData {
  const series = seriesFromSeed(itemId, range, 180, 40);
  const last = series[series.length - 1]?.value ?? 0;
  const prev = series[0]?.value ?? last;
  const deltaPct = prev === 0 ? 0 : ((last - prev) / prev) * 100;

  const breakdown = [
    { label: "Desktop", value: 48 + (hash(itemId) % 20), max: 100 },
    { label: "Mobile", value: 32 + (hash(itemId) % 15), max: 100 },
    { label: "Tablet", value: 8 + (hash(itemId) % 10), max: 100 },
  ];

  return {
    kpis: [
      {
        label: "Page views",
        value: fmt(last * 85),
        delta: `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%`,
        up: deltaPct >= 0,
      },
      {
        label: "Unique visitors",
        value: fmt(last * 52),
        delta: "+2.8%",
        up: true,
      },
      {
        label: "Bounce rate",
        value: `${(38 + (hash(itemId) % 12)).toFixed(0)}%`,
        delta: "-1.4%",
        up: true,
      },
      {
        label: "Avg. time",
        value: `1m ${10 + (hash(itemId) % 40)}s`,
        delta: "+6s",
        up: true,
      },
    ],
    series,
    breakdown,
  };
}
