import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Decision } from "../../data/campaigns";
import type { Campaign, Variant } from "../../data/campaigns";
import {
  allVariationsDisabled,
  conclusionKind,
  conclusionProgress,
  hasDeclaredWinner,
  reportFiltersActive,
  variationCollecting,
  type ConclusionKind,
  type ConclusionProgress,
} from "../../data/campaignConclusion";
import { conclusionCopy } from "../../data/conclusionCopy";
import {
  REPORT_PRESET_IDS,
  useActiveReportPresetId,
  useCampaignSharedFilters,
  useReportViewsStore,
} from "../../store/reportViews";
import { campaignReportDateRange } from "./reportCampaignDefaults";
import type { ReportFilterContext } from "./reportFilters";
import {
  bestVariantIndex,
  conversionRate,
  formatConfidence,
  formatConversionRate,
  formatNumber,
  formatUplift,
  metricRowStats,
  type MetricRowStats,
  type ReportDataMode,
} from "./reportMetrics";

export type ReportVariantRow = {
  variant: Variant;
  index: number;
  stats: MetricRowStats;
  /** True until this variation clears 500 visitors AND 1 conversion. */
  collecting: boolean;
};

export type ReportConclusionSnapshot = {
  kind: ConclusionKind;
  title: string;
  decision: Decision;
  showWinnerChrome: boolean;
  progress: ConclusionProgress;
  /**
   * Report-only OVERRIDE conditions. They change what the banner shows but do
   * NOT change `kind` — precedence is allDisabled > filtersActive > kind.
   */
  filtersActive: boolean;
  allDisabled: boolean;
};

export type ReportOverviewSnapshot = {
  lastUpdated: string;
  headline: string;
  body: string;
  stats: { value: string; label: string; accent: boolean }[];
  revenue: {
    best: { label: string; name: string };
    control: { label: string; name: string };
    projectedImpact: number;
    perVisitor: number;
    transactionRateLift: number;
    aovLift: number;
  };
  comparison: {
    heading: string;
    metric: string;
    rows: Array<{
      label: string;
      name: string;
      isControl: boolean;
      isWinner: boolean;
      rank: number | null;
      conversions: number;
      ctaRate: string;
      visitors: string;
      confidence: string;
      upliftLabel: string;
      stats: MetricRowStats;
    }>;
  };
};

export type ReportData = {
  campaign: Campaign;
  decision: Decision;
  conclusion: ReportConclusionSnapshot;
  showWinnerChrome: boolean;
  filters: ReportFilterContext;
  selectedMetric: string;
  dataMode: ReportDataMode;
  /** Rows for the currently selected metric — always filter-aware. */
  rows: ReportVariantRow[];
  totals: {
    conversions: number;
    visitors: number;
    conversionRate: number;
  };
  bestIndex: number;
  best: Variant;
  bestStats: MetricRowStats;
  overview: ReportOverviewSnapshot;
  /**
   * Look up stats for any metric/variant using the live filter context.
   * Prefer this over calling metricRowStats with hand-built filters.
   */
  statsFor: (metricName: string, variantIndex: number) => MetricRowStats;
};

const ReportDataContext = createContext<ReportData | null>(null);

function formatReportDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildOverview(
  campaign: Campaign,
  statsFor: (metricName: string, variantIndex: number) => MetricRowStats,
  bestIndex: number
): ReportOverviewSnapshot {
  const metric = campaign.primaryMetric;
  const variants = campaign.report.variants;
  const best = variants[bestIndex]!;
  const control = variants[0]!;
  const bestStats = statsFor(metric, bestIndex);
  const controlStats = statsFor(metric, 0);
  const upliftVsControl = bestStats.uplift ?? 0;
  const projected = Math.round(
    bestStats.conversions * Math.max(1.8, Math.abs(upliftVsControl) / 10)
  );
  const perVisitor =
    bestStats.visitors > 0 ? projected / bestStats.visitors : 0;
  const showWinner = hasDeclaredWinner(campaign.decision);
  const kind = conclusionKind(campaign);
  const remainingDays = Math.max(
    0,
    campaign.report.requiredDays - campaign.report.elapsedDays
  );

  // Banner title/body come from the single shared copy map so Overview,
  // Results (and later Quick view) can't drift.
  const copy = conclusionCopy(kind, {
    variation: best.name,
    control: control.name,
    days: remainingDays,
  });
  const headline = copy.title ?? copy.body;
  const body = copy.body;

  let heading: string;
  if (kind === "collecting") {
    heading = `Early standings on ${metric.toLowerCase()}`;
  } else if (kind === "progress") {
    heading = `Current standings on ${metric.toLowerCase()}`;
  } else if (kind === "inconclusive") {
    heading = `No clear leader on ${metric.toLowerCase()}`;
  } else if (kind === "baseline") {
    heading = `${control.name} leads on ${metric.toLowerCase()}`;
  } else {
    heading = `${best.name} leads on ${metric.toLowerCase()} vs. ${control.name}`;
  }

  return {
    lastUpdated: formatReportDate(campaign.lastUpdated),
    headline,
    body,
    stats: [
      {
        value: formatConversionRate(bestStats.conversionRate),
        label: metric,
        accent: showWinner,
      },
      {
        value: formatConfidence(bestStats.confidence),
        label: "Confidence",
        accent: false,
      },
      {
        value: `+$${projected.toLocaleString("en-US")}`,
        label: "Projected impact",
        accent: false,
      },
    ],
    revenue: {
      best: { label: best.label, name: best.name },
      control: { label: control.label, name: control.name },
      projectedImpact: projected,
      perVisitor,
      transactionRateLift:
        bestStats.conversionRate - controlStats.conversionRate,
      aovLift: Number((1.2 + Math.abs(upliftVsControl) / 50).toFixed(2)),
    },
    comparison: {
      heading,
      metric,
      rows: variants.map((variant, index) => {
        const stats = statsFor(metric, index);
        const isWinner = showWinner && index === bestIndex;
        return {
          label: variant.label,
          name: variant.name,
          isControl: index === 0,
          isWinner,
          rank: isWinner ? 1 : index === 0 ? null : index,
          conversions: stats.conversions,
          ctaRate: formatConversionRate(stats.conversionRate),
          visitors: formatNumber(stats.visitors),
          confidence: formatConfidence(stats.confidence),
          upliftLabel: index === 0 ? "Baseline" : formatUplift(stats.uplift),
          stats,
        };
      }),
    },
  };
}

/**
 * Single reactive source for report numbers. Subscribes to view/filter state;
 * any segment, date, metric, or preset change recomputes once and fans out.
 */
export function ReportDataProvider({
  campaign,
  children,
}: {
  campaign: Campaign;
  children: ReactNode;
}) {
  const initCampaign = useReportViewsStore((s) => s.initCampaign);
  const sharedFilters = useCampaignSharedFilters(campaign.id);
  const selectedMetricFromUi = useReportViewsStore(
    (s) => s.uiByCampaign[campaign.id]?.selectedMetric
  );
  const activePresetId = useActiveReportPresetId(campaign.id);

  useLayoutEffect(() => {
    initCampaign(campaign.id, {
      primaryMetric: campaign.primaryMetric,
      dateRange: campaignReportDateRange(campaign),
    });
  }, [
    campaign.id,
    campaign.primaryMetric,
    campaign.startedOn,
    campaign.createdOn,
    campaign.lastUpdated,
    initCampaign,
  ]);

  const value = useMemo<ReportData>(() => {
    const filters: ReportFilterContext = {
      segments: sharedFilters.segments,
      dimensions: sharedFilters.dimensions,
      dateRange: sharedFilters.dateRange,
    };
    const selectedMetric =
      selectedMetricFromUi || campaign.primaryMetric;
    const dataMode: ReportDataMode =
      activePresetId === REPORT_PRESET_IDS.sessions ? "sessions" : "visitors";

    const statsFor = (metricName: string, variantIndex: number): MetricRowStats => {
      const variant =
        campaign.report.variants[variantIndex] ?? campaign.report.variants[0]!;
      const index = Math.min(
        variantIndex,
        campaign.report.variants.length - 1
      );
      return metricRowStats(
        campaign,
        metricName,
        variant,
        index,
        filters,
        dataMode
      );
    };

    const rows: ReportVariantRow[] = campaign.report.variants.map(
      (variant, index) => ({
        variant,
        index,
        stats: statsFor(selectedMetric, index),
        collecting: variationCollecting(campaign, index),
      })
    );

    const totalsVisitors = rows.reduce((sum, r) => sum + r.stats.visitors, 0);
    const totalsConversions = rows.reduce(
      (sum, r) => sum + r.stats.conversions,
      0
    );
    const bestIndex = bestVariantIndex(campaign);
    const best = campaign.report.variants[bestIndex]!;
    const bestStats = rows[bestIndex]?.stats ?? statsFor(selectedMetric, bestIndex);
    const showWinnerChrome = hasDeclaredWinner(campaign.decision);
    const kind = conclusionKind(campaign);
    const remainingDays = Math.max(
      0,
      campaign.report.requiredDays - campaign.report.elapsedDays
    );
    const conclusion: ReportConclusionSnapshot = {
      kind,
      title:
        conclusionCopy(kind, {
          variation: best.name,
          control: campaign.report.variants[0]?.name ?? "Control",
          days: remainingDays,
        }).title ?? "",
      decision: campaign.decision,
      showWinnerChrome,
      progress: conclusionProgress(campaign),
      filtersActive: reportFiltersActive(filters),
      allDisabled: allVariationsDisabled(campaign),
    };

    return {
      campaign,
      decision: campaign.decision,
      conclusion,
      showWinnerChrome,
      filters,
      selectedMetric,
      dataMode,
      rows,
      totals: {
        conversions: totalsConversions,
        visitors: totalsVisitors,
        conversionRate: conversionRate(totalsConversions, totalsVisitors),
      },
      bestIndex,
      best,
      bestStats,
      overview: buildOverview(campaign, statsFor, bestIndex),
      statsFor,
    };
  }, [
    campaign,
    sharedFilters.segments,
    sharedFilters.dimensions,
    sharedFilters.dateRange,
    selectedMetricFromUi,
    activePresetId,
  ]);

  return (
    <ReportDataContext.Provider value={value}>
      {children}
    </ReportDataContext.Provider>
  );
}

export function useReportData(): ReportData {
  const ctx = useContext(ReportDataContext);
  if (!ctx) {
    throw new Error("useReportData must be used within ReportDataProvider");
  }
  return ctx;
}

/** Convenience: stats for one variant under the live filters. */
export function useReportVariantStats(
  metricName: string,
  variantIndex: number
): MetricRowStats {
  const { statsFor } = useReportData();
  return useMemo(
    () => statsFor(metricName, variantIndex),
    [statsFor, metricName, variantIndex]
  );
}
