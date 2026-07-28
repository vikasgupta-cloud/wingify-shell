/**
 * Single source of truth for conclusion-state copy. Overview + Results read from
 * here today; Quick view will reuse it later. Keeping every state string in one
 * map is what stops the surfaces from drifting apart.
 *
 * Placeholders {variation} / {control} / {days} are resolved by the caller via
 * conclusionCopy().
 */
export type ConclusionCopyState =
  | "collecting"
  | "progress"
  | "winner"
  | "baseline"
  | "inconclusive"
  | "filtersApplied"
  | "allDisabled";

export const CONCLUSION_COPY: Record<
  ConclusionCopyState,
  { title?: string; body: string }
> = {
  collecting: {
    title: "Collecting data",
    body: "Campaign duration is calculated and shown once each variation reaches 500 visitors and 1 conversion.",
  },
  progress: {
    title: "Conclusion in {days} days",
    body: "Gathering data. Check back when the required sample is met.",
  },
  winner: {
    title: "{variation} is your best choice",
    body: "It beat the baseline with ≥95% probability. Rollout and monitor for two weeks.",
  },
  baseline: {
    title: "Stick to {control}",
    body: "No variation reached the 95% probability-to-be-better threshold; detected uplifts aren't reliable.",
  },
  inconclusive: {
    title: "No significant winner",
    body: "This campaign reached its visitor target without a variation proving significantly better.",
  },
  filtersApplied: {
    body: "Duration, recommendation and conclusion are not applicable on filtered data.",
  },
  allDisabled: {
    body: "Statistical parameters, recommendations and conclusion are not shown because all variations are disabled.",
  },
};

function fill(
  template: string | undefined,
  vars: { variation?: string; control?: string; days?: number }
): string | undefined {
  if (template === undefined) return undefined;
  return template
    .replace(/\{variation\}/g, vars.variation ?? "the variation")
    .replace(/\{control\}/g, vars.control ?? "Control")
    .replace(/\{days\}/g, String(vars.days ?? 0));
}

/** Resolve a state's title/body, substituting any {variation}/{control}/{days}. */
export function conclusionCopy(
  state: ConclusionCopyState,
  vars: { variation?: string; control?: string; days?: number } = {}
): { title?: string; body: string } {
  const entry = CONCLUSION_COPY[state];
  return {
    title: fill(entry.title, vars),
    body: fill(entry.body, vars)!,
  };
}
