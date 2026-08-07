// Config v2 — live readiness model derived from a campaign's CURRENT v2 config.
//
// The single bridge between the config-v2 store and the pure power / readiness
// engine. Reads the config reactively and recomputes whenever any input the
// practitioner can edit changes, and honours the v2 decision rule (confidence
// threshold → alpha; minimum runtime → an extra finding). No UI here.

import { useMemo } from "react";
import {
  surfaceForUrl,
  DAILY_VISITORS,
  baselineRate,
  segmentReach,
  BASELINE_RATES,
  type PageSurface,
} from "../data/siteAnalytics";
import {
  type PowerInputs,
  sampleSizePerVariant,
  dailyVisitorsIntoTest,
  daysToSignificance,
  minimumDetectableEffect,
  totalSampleNeeded,
} from "./experimentPower";
import {
  type ReadinessFinding,
  durationFinding,
  trafficFinding,
  metricProximityFinding,
  observationOverloadFinding,
  collisionFindings,
} from "./experimentReadiness";
import { useConfigV2Store, type ConfigV2 } from "../store/configV2";
import { useVisibleCampaigns } from "../store/rows";
import { metricById } from "../data/metrics";
import type { Campaign } from "../data/campaigns";

/** Relative lift (%) the forecast is powered for by default. */
export const DEFAULT_MDE_PCT = 5;

export type ReadinessModel = {
  surface: PageSurface;
  baselineRatePct: number;
  dailyIntoTest: number;
  variantCount: number;
  /** Whole days to significance; Infinity when unreachable. */
  daysToSignificance: number;
  samplePerVariant: number;
  totalSampleNeeded: number;
  /** Smallest relative lift (%) detectable within `days`. */
  mdeAtDays: (days: number) => number;
  findings: ReadinessFinding[];
  briefSentence: string;
};

// The subset of a v2 config the readiness model actually reads. Accepting this
// (rather than a full ConfigV2) lets callers forecast a not-yet-stored draft.
export type ReadinessConfig = Pick<
  ConfigV2,
  | "pageGroups"
  | "successMetric"
  | "variations"
  | "trafficAllocation"
  | "segment"
  | "observationMetrics"
  | "decisionRule"
>;

/** First non-empty include-rule URL, else "" — the surface anchor for the test. */
function firstIncludeUrl(config: ReadinessConfig): string {
  for (const group of config.pageGroups) {
    if (group.kind !== "include") continue;
    const rule = group.rules.find((r) => r.value.trim() !== "");
    if (rule) return rule.value.trim();
  }
  return "";
}

function surfacePhrase(surface: PageSurface): string {
  switch (surface) {
    case "home":
      return "the homepage";
    case "collection":
      return "collection pages";
    case "product":
      return "product pages";
    case "cart":
      return "the cart";
    case "checkout":
      return "checkout";
    case "account":
      return "account pages";
    case "landing":
      return "landing pages";
  }
}

/** Pure model builder — shared shape, testable without React. */
export function buildReadinessModel(
  config: ReadinessConfig,
  campaign: Campaign | undefined,
  campaigns: Campaign[],
  campaignId: string
): ReadinessModel {
  // 1. Surface — first include rule, else the campaign URL, else collection.
  const ruleUrl = firstIncludeUrl(config);
  const surfaceUrl = ruleUrl || campaign?.url || "";
  const surface = surfaceUrl ? surfaceForUrl(surfaceUrl) : "collection";

  // 2. Baseline rate — chosen success metric, or the surface's headline metric.
  const metricName = config.successMetric
    ? metricById(config.successMetric)?.name ?? null
    : null;
  const provisionalMetric = Object.keys(BASELINE_RATES[surface] ?? {})[0];
  const baselineMetricName = metricName ?? provisionalMetric ?? "";
  const baselineRatePct = baselineRate(baselineMetricName, surface);

  // 3. Variants + traffic. Confidence threshold drives alpha.
  const variantCount = config.variations.length;
  const alpha = Math.min(
    0.5,
    Math.max(0.001, 1 - config.decisionRule.confidenceThresholdPct / 100)
  );
  const inputs: PowerInputs = {
    baselineRatePct,
    variants: variantCount,
    trafficAllocationPct: config.trafficAllocation,
    dailyVisitors: DAILY_VISITORS[surface],
    segmentReach: segmentReach(config.segment),
    mde: DEFAULT_MDE_PCT,
    alpha,
    power: 0.8,
  };

  const dailyIntoTest = dailyVisitorsIntoTest(inputs);
  const days = daysToSignificance(inputs);
  const samplePerVariant = sampleSizePerVariant(inputs);
  const totalNeeded = totalSampleNeeded(inputs);
  const mdeAtDays = (d: number) => minimumDetectableEffect({ ...inputs, days: d });

  // 4. Findings.
  const findings: ReadinessFinding[] = [];
  if (!config.successMetric) {
    findings.push({
      id: "no-success-metric",
      level: "blocked",
      title: "No success metric chosen",
      detail:
        "No success metric chosen — pick one to see a real forecast. The numbers above use the surface's headline metric as a stand-in.",
    });
  }
  const duration = durationFinding(days);
  if (duration) findings.push(duration);
  // Significance arriving before the committed minimum runtime.
  if (
    Number.isFinite(days) &&
    days < config.decisionRule.minRuntimeDays
  ) {
    findings.push({
      id: "min-runtime",
      level: "warn",
      title: "Significance may arrive before your minimum runtime",
      detail: `The forecast reaches significance in about ${days} days, before your ${config.decisionRule.minRuntimeDays}-day minimum. Keep running to two full weekly cycles so day-of-week effects don't skew the call.`,
    });
  }
  const traffic = trafficFinding(dailyIntoTest, variantCount);
  if (traffic) findings.push(traffic);
  if (metricName) {
    const proximity = metricProximityFinding(metricName, surface);
    if (proximity) findings.push(proximity);
  }
  const overload = observationOverloadFinding(config.observationMetrics.length);
  if (overload) findings.push(overload);
  findings.push(...collisionFindings(campaignId, surfaceUrl, campaigns));

  // 5. Plain-words brief.
  const audience = config.segment?.trim() || "all visitors";
  const variationsPart = `${variantCount} variation${
    variantCount === 1 ? "" : "s"
  }`;
  const metricPart = metricName
    ? `judged on ${metricName}`
    : "with no success metric chosen yet";
  const briefSentence = `${config.trafficAllocation}% of ${audience} landing on ${surfacePhrase(
    surface
  )} will see ${variationsPart}, ${metricPart}.`;

  return {
    surface,
    baselineRatePct,
    dailyIntoTest,
    variantCount,
    daysToSignificance: days,
    samplePerVariant,
    totalSampleNeeded: totalNeeded,
    mdeAtDays,
    findings,
    briefSentence,
  };
}

export function useExperimentReadiness(
  campaignId: string
): ReadinessModel | null {
  const config = useConfigV2Store((s) => s.configs[campaignId]);
  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === campaignId);

  return useMemo(() => {
    if (!config) return null;
    return buildReadinessModel(config, campaign, campaigns, campaignId);
  }, [config, campaign, campaigns, campaignId]);
}
