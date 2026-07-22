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
  conclusionKind,
  conclusionProgress,
  conclusionTitle,
  hasDeclaredWinner,
  type ConclusionKind,
  type ConclusionProgress,
} from "../../data/campaignConclusion";
import {
  REPORT_PRESET_IDS,
  useActiveReportPresetId,
  useActiveReportPresetState,
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
};

export type ReportConclusionSnapshot = {
  kind: ConclusionKind;
  title: string;
  decision: Decision;
  showWinnerChrome: boolean;
  progress: ConclusionProgress;
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

  let headline: string;
  let body: string;
  let heading: string;

  if (kind === "collecting") {
    headline = conclusionTitle(campaign);
    body = `Too early to conclude on ${metric.toLowerCase()}. Wait for at least 5 days and a minimum sample before progress estimates appear.`;
    heading = `Early standings on ${metric.toLowerCase()}`;
  } else if (kind === "progress") {
    headline = conclusionTitle(campaign);
    body =
      campaign.status === "Ended"
        ? "This campaign ended before reaching a statistical conclusion."
        : `Gathering data for ${metric.toLowerCase()}. Check back when the required sample is met.`;
    heading = `Current standings on ${metric.toLowerCase()}`;
  } else if (kind === "inconclusive") {
    headline = "No clear winner";
    body = `Results for ${metric.toLowerCase()} are inconclusive. No variation clearly outperformed the others.`;
    heading = `No clear leader on ${metric.toLowerCase()}`;
  } else if (kind === "baseline") {
    headline = `${control.name} remains the best choice`;
    body = `Keep the baseline. Monitor ${metric.toLowerCase()} after any future changes.`;
    heading = `${control.name} leads on ${metric.toLowerCase()}`;
  } else {
    headline = `${best.name} is your best choice`;
    body = `Roll it out to all traffic and monitor ${metric.toLowerCase()} for two weeks.`;
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
  const viewState = useActiveReportPresetState(campaign.id);
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
      segments: viewState.segments,
      dimensions: viewState.dimensions,
      dateRange: viewState.dateRange,
    };
    const selectedMetric =
      viewState.selectedMetric || campaign.primaryMetric;
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
    const conclusion: ReportConclusionSnapshot = {
      kind: conclusionKind(campaign),
      title: conclusionTitle(campaign),
      decision: campaign.decision,
      showWinnerChrome,
      progress: conclusionProgress(campaign),
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
    viewState.segments,
    viewState.dimensions,
    viewState.dateRange,
    viewState.selectedMetric,
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
