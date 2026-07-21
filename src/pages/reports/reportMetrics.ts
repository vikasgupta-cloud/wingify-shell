import type { Campaign, Variant } from "../../data/campaigns";
import {
  filterMetricSeedSuffix,
  reportVisitorScale,
  type ReportFilterContext,
} from "./reportFilters";

export type ReportDataMode = "visitors" | "sessions";

export type MetricRowStats = {
  uplift: number | null;
  confidence: number | null;
  conversions: number;
  visitors: number;
  conversionRate: number;
};

function hashMetricSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export { hashMetricSeed };

/** Scaled, remainder-split visitor/session counts — shared by table, graphs, overview. */
export function variantVisitors(
  campaign: Campaign,
  index: number,
  filters: ReportFilterContext,
  mode: ReportDataMode = "visitors"
): number {
  const scale = reportVisitorScale(filters);
  const total = Math.max(1, Math.round(campaign.visitors * scale));
  const count = campaign.report.variants.length;
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  const visitors = base + (index < remainder ? 1 : 0);
  return mode === "sessions" ? Math.max(1, Math.round(visitors * 1.32)) : visitors;
}

export function variantConversions(variant: Variant, visitors: number): number {
  return Math.max(1, Math.round((visitors * variant.convRate) / 100));
}

export function conversionRate(conversions: number, visitors: number): number {
  if (visitors <= 0) return 0;
  return (conversions / visitors) * 100;
}

export function formatConversionRate(rate: number, digits = 2): string {
  return `${rate.toFixed(digits)}%`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatUplift(uplift: number | null): string {
  if (uplift === null) return "—";
  const rounded = Math.round(uplift);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export function formatConfidence(confidence: number | null): string {
  if (confidence === null) return "—";
  return `${confidence}%`;
}

/**
 * Canonical per-variant metric stats for a campaign + filters.
 * Primary metric uses campaign variant fields (scaled); others are seeded.
 * Conversion rate is always conversions / visitors.
 */
export function metricRowStats(
  campaign: Campaign,
  metricName: string,
  variant: Variant,
  index: number,
  filters: ReportFilterContext,
  dataMode: ReportDataMode = "visitors"
): MetricRowStats {
  const visitors = variantVisitors(campaign, index, filters, dataMode);
  const suffix = filterMetricSeedSuffix(filters);

  if (metricName === campaign.primaryMetric) {
    const uplift =
      variant.uplift === null
        ? null
        : Number((variant.uplift * reportVisitorScale(filters)).toFixed(1));
    const confidence =
      variant.confidence === null
        ? null
        : Math.min(
            99,
            Math.max(
              1,
              Math.round(
                variant.confidence * (0.85 + reportVisitorScale(filters) * 0.15)
              )
            )
          );
    const conversions = variantConversions(variant, visitors);
    return {
      uplift,
      confidence,
      conversions,
      visitors,
      conversionRate: conversionRate(conversions, visitors),
    };
  }

  const seed = hashMetricSeed(
    `${campaign.id}:${metricName}:${variant.id}:${suffix}:${dataMode}`
  );
  const rng = (min: number, max: number) => min + (seed % (max - min + 1));
  const controlRate = rng(15, 120) / 10;
  if (index === 0) {
    const conversions = Math.max(1, Math.round((visitors * controlRate) / 100));
    return {
      uplift: null,
      confidence: null,
      conversions,
      visitors,
      conversionRate: conversionRate(conversions, visitors),
    };
  }
  const uplift = Number(((rng(-80, 280) - 100) / 10).toFixed(1));
  const confidence = rng(42, 98);
  const convRate = controlRate * (1 + uplift / 100);
  const conversions = Math.max(1, Math.round((visitors * convRate) / 100));
  return {
    uplift,
    confidence,
    conversions,
    visitors,
    conversionRate: conversionRate(conversions, visitors),
  };
}

/** Pick the leading variation using filter-adjusted confidence (then uplift). */
export function bestVariantIndex(
  campaign: Campaign,
  metricName: string,
  filters: ReportFilterContext,
  dataMode: ReportDataMode = "visitors"
): number {
  const variants = campaign.report.variants;
  let bestIdx = 0;
  let bestScore = -Infinity;
  variants.forEach((variant, index) => {
    if (index === 0) return;
    const stats = metricRowStats(
      campaign,
      metricName,
      variant,
      index,
      filters,
      dataMode
    );
    const score =
      (stats.confidence ?? 0) * 1000 + (stats.uplift ?? Number.NEGATIVE_INFINITY);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = index;
    }
  });
  if (bestIdx === 0 && variants.length > 1) {
    const flagged = variants.findIndex((v) => v.isBest);
    return flagged > 0 ? flagged : 1;
  }
  return bestIdx;
}

export function defaultReportFilters(
  dateRange: ReportFilterContext["dateRange"]
): ReportFilterContext {
  return {
    segments: [],
    dimensions: [],
    dateRange,
  };
}
