// Config v2 — turn a CopilotDraft into a real, editable v2 campaign.
//
// Mints a session campaign (so it appears in the listing), then hydrates the v2
// store and overlays every drafted field. Metric NAMES are resolved to catalog
// ids; anything that doesn't resolve is dropped rather than stored as a bad id.

import { useRowsStore } from "../store/rows";
import { useConfigV2Store, rebalance } from "../store/configV2";
import type { ConfigVariation, PageGroup } from "../store/config";
import { METRICS } from "../data/metrics";
import type { CopilotDraft } from "../data/copilotDrafts";

function metricIdByName(name: string): string | undefined {
  return METRICS.find((m) => m.name === name)?.id;
}

export function applyCopilotDraft(draft: CopilotDraft): string {
  // 1. Mint a session campaign of the drafted type so it lands in the listing.
  const id = useRowsStore.getState().createCampaign(draft.campaignType);

  // 2. Seed the v2 config with defaults (no campaign overlay needed — we set the
  //    drafted values explicitly below).
  const store = useConfigV2Store.getState();
  store.ensureConfigV2(id, draft.name);

  // 3. Build variations: control first, then the drafted change(s), splits
  //    rebalanced to sum to 100.
  const isRedirect = draft.campaignType === "Split URL";
  const variations: ConfigVariation[] = rebalance(
    draft.variations.map((v, i) => {
      const base = {
        id: i === 0 ? "control" : `copilot-var-${i}`,
        label: v.label,
        name: v.name,
        split: 0,
        modifications: 0,
      };
      if (i > 0 && isRedirect) {
        return {
          ...base,
          type: "redirect" as const,
          redirectMatchType: "matches" as const,
          redirectUrl: "",
          redirectExcludeQuery: false,
          redirectExcludeFragments: false,
        };
      }
      return { ...base, type: "editor" as const };
    })
  );

  // 4. One include page group with the drafted URL.
  const pageGroups: PageGroup[] = [
    {
      id: `copilot-pg-${id}`,
      kind: "include",
      rules: [
        {
          id: `copilot-rule-${id}`,
          predicate: "URL matches",
          value: draft.pageUrl,
          settings: {
            ignoreQueryString: true,
            ignoreFragment: true,
            caseInsensitive: true,
          },
        },
      ],
    },
  ];

  // 5. Resolve metric names → ids (drop unresolved).
  const successMetric = metricIdByName(draft.successMetricName) ?? null;
  const observationMetrics = draft.observationMetricNames
    .map(metricIdByName)
    .filter((mid): mid is string => Boolean(mid));

  store.patchV2(id, {
    name: draft.name,
    hypothesis: draft.hypothesisText,
    hypothesisId: draft.hypothesisId,
    pageGroups,
    editorUrl: draft.pageUrl,
    segment: draft.segmentLabel,
    customSegment: null,
    trafficAllocation: draft.trafficAllocation,
    splitMode: "Equal",
    variations,
    successMetric,
    observationMetrics,
    decisionRule: { ...draft.decisionRule },
  });

  return id;
}
