import { campaignBestVariantIndex } from "../../data/campaignConclusion";
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

/**
 * Allocate campaign.uniqueConversions (filter-scaled) across variants
 * proportional to convRate × visitorShare so totals match listing.
 */
export function variantConversionsAllocated(
  campaign: Campaign,
  index: number,
  filters: ReportFilterContext,
  dataMode: ReportDataMode = "visitors"
): number {
  const scale = reportVisitorScale(filters);
  const totalConversions = Math.max(
    0,
    Math.round(campaign.uniqueConversions * scale)
  );
  const variants = campaign.report.variants;
  if (variants.length === 0) return 0;
  if (totalConversions === 0) return 0;

  const weights = variants.map((variant, i) => {
    const visitors = variantVisitors(campaign, i, filters, dataMode);
    return Math.max(0.0001, (variant.convRate / 100) * visitors);
  });
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / weightSum) * totalConversions);
  const floors = raw.map((n) => Math.floor(n));
  let rem = totalConversions - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((n, i) => ({ i, frac: n - floors[i]! }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < rem; k++) {
    floors[order[k % order.length]!.i]! += 1;
  }
  return floors[index] ?? 0;
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
 * Primary metric uses campaign variant fields + listing uniqueConversions.
 * Other metrics anchor uplift from report.otherMetrics when present.
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
  const scale = reportVisitorScale(filters);

  if (metricName === campaign.primaryMetric) {
    const uplift =
      variant.uplift === null
        ? null
        : Number((variant.uplift * scale).toFixed(1));
    const confidence =
      variant.confidence === null
        ? null
        : Math.min(
            99,
            Math.max(
              1,
              Math.round(variant.confidence * (0.85 + scale * 0.15))
            )
          );
    const conversions = variantConversionsAllocated(
      campaign,
      index,
      filters,
      dataMode
    );
    return {
      uplift,
      confidence,
      conversions,
      visitors,
      conversionRate: conversionRate(conversions, visitors),
    };
  }

  const listed = campaign.report.otherMetrics.find((m) => m.name === metricName);
  const seed = hashMetricSeed(
    `${campaign.id}:${metricName}:${variant.id}:${suffix}:${dataMode}`
  );
  const rng = (min: number, max: number) => min + (seed % (max - min + 1));

  if (index === 0) {
    const controlRate =
      listed != null
        ? Math.max(0.5, variant.convRate * 0.9)
        : rng(15, 120) / 10;
    const conversions = Math.max(0, Math.round((visitors * controlRate) / 100));
    return {
      uplift: null,
      confidence: null,
      conversions,
      visitors,
      conversionRate: conversionRate(conversions, visitors),
    };
  }

  const uplift =
    listed != null
      ? listed.uplift === null
        ? null
        : Number((listed.uplift * scale).toFixed(1))
      : Number(((rng(-80, 280) - 100) / 10).toFixed(1));
  const confidence = rng(42, 98);
  const baseRate = rng(15, 120) / 10;
  const convRate =
    uplift === null ? baseRate : baseRate * (1 + uplift / 100);
  const conversions = Math.max(0, Math.round((visitors * convRate) / 100));
  return {
    uplift,
    confidence,
    conversions,
    visitors,
    conversionRate: conversionRate(conversions, visitors),
  };
}

/**
 * Outcome / “best” index locked to listing (isBest → confidence → first).
 * Filters scale numbers but do not change which variation is declared best.
 */
export function bestVariantIndex(
  campaign: Campaign,
  _metricName?: string,
  _filters?: ReportFilterContext,
  _dataMode?: ReportDataMode
): number {
  return campaignBestVariantIndex(campaign);
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
