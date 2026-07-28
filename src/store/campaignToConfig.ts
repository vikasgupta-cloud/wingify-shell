import type { Campaign } from "../data/campaigns";
import { METRICS } from "../data/metrics";
import { DEFAULT_SEGMENT_LABEL, findSegmentByLabel } from "../config/segments";
import type { CampaignConfig, ConfigVariation, PageGroup } from "./config";
import { DEFAULT_URL_SETTINGS, rebalance } from "./config";

// Report audiences that don't match a segment label verbatim. Anything not
// listed (and not already an exact label) falls back to DEFAULT_SEGMENT_LABEL.
const AUDIENCE_SEGMENT_ALIASES: Record<string, string> = {
  "Mobile shoppers": "Mobile traffic",
  "Desktop shoppers": "Desktop traffic",
  "Email subscribers": "Email",
};

// Direction A: mirror an existing campaign's Configuration from its report
// record. Returns ONLY the fields that map from fields already on the record;
// every other config field stays at defaultConfig. Pure + deterministic (ids
// derived from campaign.id), session-only — no persistence.
export function campaignToConfig(campaign: Campaign): Partial<CampaignConfig> {
  const { report } = campaign;

  const splitMode: CampaignConfig["splitMode"] =
    report.trafficSplit === "Custom" ? "Manual" : "Equal";

  // Report variants → config variations (Control first, order preserved). The
  // report stores no per-variant split, so both Equal and Manual seed an even
  // integer split summing to 100 via rebalance().
  const variations: ConfigVariation[] = rebalance(
    report.variants.map((v) => ({
      id: v.id,
      label: v.label,
      name: v.name,
      split: 0,
      modifications: 0,
      type: "editor" as const,
    }))
  );

  const successMetric =
    METRICS.find((m) => m.name === campaign.primaryMetric)?.id ?? null;

  // De-duplicated catalog ids for the report's other metrics; names that don't
  // resolve drop out. otherMetrics is only 3 long, so no picker cap is needed.
  const observationMetrics = Array.from(
    new Set(
      report.otherMetrics
        .map((o) => METRICS.find((m) => m.name === o.name)?.id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const audienceLabel =
    AUDIENCE_SEGMENT_ALIASES[report.audience] ?? report.audience;
  const segment = findSegmentByLabel(audienceLabel)
    ? audienceLabel
    : DEFAULT_SEGMENT_LABEL;

  const pageGroups: PageGroup[] = [
    {
      // Deterministic ids (keyed off campaign.id) so re-derivation is stable and
      // never collides with defaultConfig's uid("pg")/uid("rule") sequence.
      id: `pg-${campaign.id}`,
      kind: "include",
      rules: [
        {
          id: `rule-${campaign.id}`,
          predicate: "URL matches",
          value: campaign.url,
          settings: { ...DEFAULT_URL_SETTINGS },
        },
      ],
    },
  ];

  return {
    labels: campaign.labels,
    hypothesis: campaign.hypothesis,
    hypothesisId: null,
    pageGroups,
    editorUrl: campaign.url,
    trafficAllocation: report.traffic,
    splitMode,
    variations,
    successMetric,
    observationMetrics,
    segment,
  };
}
