import type { Campaign, Decision, Variant } from "./campaigns";
import { campaignReportDateRange } from "../pages/reports/reportCampaignDefaults";
import type { ReportFilterContext } from "../pages/reports/reportFilters";
import {
  defaultReportFilters,
  variantConversionsAllocated,
  variantVisitors,
} from "../pages/reports/reportMetrics";

/**
 * Data thresholds that determine collecting — a variation is "cleared" once it
 * has at least COLLECT_MIN_VISITORS visitors AND COLLECT_MIN_CONVERSIONS
 * conversions. This is the ONLY gate for collecting (no runtime/day component).
 */
export const COLLECT_MIN_VISITORS = 500;
export const COLLECT_MIN_CONVERSIONS = 1;

/**
 * @deprecated Legacy constants — retained only so existing surface importers
 * (QuickView / Results progress meters) keep compiling. They NO LONGER gate the
 * collecting decision; use COLLECT_MIN_VISITORS / COLLECT_MIN_CONVERSIONS.
 */
export const CONCLUSION_MIN_RUNTIME_DAYS = 5;
export const CONCLUSION_MIN_VISITORS = 1000;
export const CONCLUSION_MIN_CONVERSIONS = 1;

/** No-filter (default) report context — listing + reports agree on numbers. */
function defaultNoFilterContext(campaign: Campaign): ReportFilterContext {
  return defaultReportFilters(campaignReportDateRange(campaign));
}

/**
 * The data model carries no per-vital breach flag, so an "unhealthy" campaign is
 * mapped to a single representative breached vital, chosen deterministically from
 * the id (stable across reloads) so the same campaign always names the same vital.
 */
export const BREACHED_VITALS = [
  "Data tracking",
  "Conversion tracking",
  "Experimentation conduct",
  "Guardrails",
] as const;

function hashVitalSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic representative breached vital for a campaign (stable by id). */
export function breachedVitalFor(campaign: Campaign): string {
  return BREACHED_VITALS[hashVitalSeed(campaign.id) % BREACHED_VITALS.length]!;
}

/** Winner | Baseline — listing shows “Best performer” chrome. */
export function hasDeclaredWinner(decision: Decision): boolean {
  return decision === "Winner" || decision === "Baseline";
}

/**
 * Best variant for conclusion UI — mirrors QuickView:
 * isBest → highest confidence → first variant.
 */
export function pickBestVariant(variants: Variant[]): Variant {
  const flagged = variants.find((v) => v.isBest);
  if (flagged) return flagged;
  const byConfidence = [...variants]
    .filter((v) => v.confidence !== null)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
  return byConfidence ?? variants[0]!;
}

export function campaignBestVariant(campaign: Campaign): Variant {
  return pickBestVariant(campaign.report.variants);
}

export function campaignBestVariantIndex(campaign: Campaign): number {
  const best = campaignBestVariant(campaign);
  const idx = campaign.report.variants.findIndex((v) => v.id === best.id);
  return idx >= 0 ? idx : 0;
}

/**
 * @deprecated Retained for surface importers only — NOT part of the collecting
 * decision anymore (which is data-threshold-only).
 */
export function hasMinimumRuntime(campaign: Campaign): boolean {
  return campaign.report.elapsedDays >= CONCLUSION_MIN_RUNTIME_DAYS;
}

/**
 * @deprecated Retained for surface importers only — NOT part of the collecting
 * decision anymore (which is data-threshold-only).
 */
export function hasMinimumConclusionSample(campaign: Campaign): boolean {
  return (
    campaign.visitors >= CONCLUSION_MIN_VISITORS &&
    campaign.uniqueConversions >= CONCLUSION_MIN_CONVERSIONS
  );
}

/**
 * Whether a single variation has cleared its data thresholds
 * (>= COLLECT_MIN_VISITORS visitors AND >= COLLECT_MIN_CONVERSIONS conversions),
 * computed under the default no-filter context so listing + reports agree.
 * Control is index 0.
 */
export function variationCleared(
  campaign: Campaign,
  variantIndex: number
): boolean {
  const filters = defaultNoFilterContext(campaign);
  const visitors = variantVisitors(campaign, variantIndex, filters);
  const conversions = variantConversionsAllocated(campaign, variantIndex, filters);
  return visitors >= COLLECT_MIN_VISITORS && conversions >= COLLECT_MIN_CONVERSIONS;
}

/**
 * A variation is "collecting" until it clears the data thresholds.
 * True until that variant has >= 500 visitors AND >= 1 conversion.
 */
export function variationCollecting(
  campaign: Campaign,
  variantIndex: number
): boolean {
  return !variationCleared(campaign, variantIndex);
}

/**
 * Campaign-level collecting — DATA-THRESHOLD ONLY (no day/runtime component):
 * collecting ⇔ decision === "No decision" AND NOT( baseline cleared AND at
 * least one non-control variant cleared ), where "cleared" = >= 500 visitors
 * AND >= 1 conversion.
 */
export function isInitialCollectingStage(campaign: Campaign): boolean {
  if (campaign.decision !== "No decision") return false;
  const baselineCleared = variationCleared(campaign, 0);
  const anyVariantCleared = campaign.report.variants.some(
    (_, i) => i > 0 && variationCleared(campaign, i)
  );
  return !(baselineCleared && anyVariantCleared);
}

/** Any segment or dimension filter applied (report-only override condition). */
export function reportFiltersActive(filters: ReportFilterContext): boolean {
  return filters.segments.length > 0 || filters.dimensions.length > 0;
}

/**
 * Whether every non-control variation is disabled (report-only override
 * condition). The data model carries an optional `disabled` flag per variant;
 * none are set today, so this returns false until a later data tweak flips some.
 */
export function allVariationsDisabled(campaign: Campaign): boolean {
  const nonControl = campaign.report.variants.slice(1);
  if (nonControl.length === 0) return false;
  return nonControl.every((v) => v.disabled === true);
}

/** Listing / quickview conclusion title. */
export function conclusionTitle(campaign: Campaign): string {
  if (campaign.decision !== "No decision") {
    if (campaign.decision === "Inconclusive") return "No clear winner";
    const best = campaignBestVariant(campaign);
    return `${best.name} is your best choice`;
  }
  if (campaign.status === "Ended") return "Ended without a conclusion";
  if (isInitialCollectingStage(campaign)) {
    if (!hasMinimumRuntime(campaign)) {
      const remaining = Math.max(
        0,
        CONCLUSION_MIN_RUNTIME_DAYS - campaign.report.elapsedDays
      );
      return remaining === 0
        ? "Collecting minimum data"
        : `Collecting data · ${remaining} day${remaining === 1 ? "" : "s"} to go`;
    }
    return "Collecting minimum data";
  }
  const remaining = Math.max(
    0,
    campaign.report.requiredDays - campaign.report.elapsedDays
  );
  return `Conclusion in ${remaining} days`;
}

export type ConclusionKind =
  | "collecting"
  | "progress"
  | "winner"
  | "baseline"
  | "inconclusive";

export function conclusionKind(campaign: Campaign): ConclusionKind {
  switch (campaign.decision) {
    case "Winner":
      return "winner";
    case "Baseline":
      return "baseline";
    case "Inconclusive":
      return "inconclusive";
    default:
      return isInitialCollectingStage(campaign) ? "collecting" : "progress";
  }
}

export type ConclusionProgress = {
  elapsedDays: number;
  requiredDays: number;
  visitors: number;
  requiredVisitors: number;
  uniqueConversions: number;
  requiredConversions: number;
  /** Target days for the initial collecting stage. */
  minRuntimeDays: number;
  /** Soft visitor floor for leaving collecting. */
  minVisitors: number;
  /** Soft conversion floor for leaving collecting. */
  minConversions: number;
  startedOn: string | null;
  estimatedEndDate: string | null;
};

export function conclusionProgress(campaign: Campaign): ConclusionProgress {
  const r = campaign.report;
  return {
    elapsedDays: r.elapsedDays,
    requiredDays: r.requiredDays,
    visitors: campaign.visitors,
    requiredVisitors: r.requiredVisitors,
    uniqueConversions: campaign.uniqueConversions,
    requiredConversions: r.requiredConversions,
    minRuntimeDays: CONCLUSION_MIN_RUNTIME_DAYS,
    minVisitors: CONCLUSION_MIN_VISITORS,
    minConversions: CONCLUSION_MIN_CONVERSIONS,
    startedOn: campaign.startedOn,
    estimatedEndDate: r.estimatedEndDate,
  };
}

/** Leading variation label for listing — derived from report + decision. */
export function leadingVariationFromReport(
  decision: Decision,
  variants: Variant[],
  started: boolean
): string {
  if (!started) return "—";
  if (decision === "Baseline") return "Control";
  const flagged = variants.find((v) => v.isBest);
  if (flagged) return flagged.name;
  if (decision === "Winner") return pickBestVariant(variants).name;
  if (decision === "Inconclusive" || decision === "No decision") return "—";
  return pickBestVariant(variants).name;
}

export function leadingVariationName(campaign: Campaign): string {
  return leadingVariationFromReport(
    campaign.decision,
    campaign.report.variants,
    Boolean(campaign.startedOn) || campaign.visitors > 0
  );
}
