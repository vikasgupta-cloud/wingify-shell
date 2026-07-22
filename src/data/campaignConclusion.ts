import type { Campaign, Decision, Variant } from "./campaigns";

/** Mandatory wait before any conclusion progress is shown. */
export const CONCLUSION_MIN_RUNTIME_DAYS = 5;

/**
 * Soft sample floors for leaving the initial collecting stage.
 * Full statistical targets remain report.requiredVisitors / requiredConversions.
 */
export const CONCLUSION_MIN_VISITORS = 1000;
export const CONCLUSION_MIN_CONVERSIONS = 40;

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

export function hasMinimumRuntime(campaign: Campaign): boolean {
  return campaign.report.elapsedDays >= CONCLUSION_MIN_RUNTIME_DAYS;
}

export function hasMinimumConclusionSample(campaign: Campaign): boolean {
  return (
    campaign.visitors >= CONCLUSION_MIN_VISITORS &&
    campaign.uniqueConversions >= CONCLUSION_MIN_CONVERSIONS
  );
}

/**
 * Very early stage: still inside the 5-day wait and/or below minimum sample.
 * Only applies while decision is still open.
 */
export function isInitialCollectingStage(campaign: Campaign): boolean {
  if (campaign.decision !== "No decision") return false;
  return !hasMinimumRuntime(campaign) || !hasMinimumConclusionSample(campaign);
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
