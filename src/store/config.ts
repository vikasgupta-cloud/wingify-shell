import { create } from "zustand";
import { IP_SUBJECTS, IP_OPERATORS } from "../config/configOptions";

// NOTE: Session-only by design. This store is NOT persisted — a reload wipes
// every campaign's config and its saved snapshot.

export type UrlPredicate =
  | "URL matches"
  | "URL matches pattern"
  | "URL contains"
  | "URL starts with"
  | "URL ends with"
  | "URL matches regex"
  | "Page group is";

export type PageRule = { id: string; predicate: UrlPredicate; value: string };
export type PageGroup = { id: string; kind: "include" | "exclude"; rules: PageRule[] };

export type SmartStats = {
  statsModel: string;
  testingApproach: string;
  multipleTestingCorrection: string;
  minVisitorsPerVariation: number;
  minConversionsPerVariation: number;
  convertAfterDays: number;
};

export type QaIpRule = { id: string; subject: string; operator: string; value: string };

export type QaConfig = {
  ipEnabled: boolean;
  ipRules: QaIpRule[];
  cookiesEnabled: boolean;
  urlParamsEnabled: boolean;
  previewVariationId: string;
  previewUrl: string;
  debugUrl: string;
};
export type ConfigVariation = {
  id: string;
  label: string;
  name: string;
  split: number;
  redirectUrl?: string;
  locked?: boolean;
  modifications: number;
};

export type CampaignConfig = {
  name: string;
  labels: string[];
  hypothesis: string | null;
  pageGroups: PageGroup[];
  trafficAllocation: number;
  segment: string;
  trigger: string;
  frequency: string;
  editorUrl: string;
  editorView: "desktop" | "mobile" | "tablet";
  variationSplitEnabled: boolean;
  variations: ConfigVariation[];
  splitMode: "Manual" | "Equal" | "Auto";
  successMetric: string | null;
  observationMetrics: string[];
  protectionMetrics: string[];
  mutuallyExclusiveGroup: string | null;
  trackAcrossDomains: boolean;
  hideCampaignNames: boolean;
  smartStats: SmartStats;
  qa: QaConfig;
};

// Simple session-unique id generator (no persistence, no need for crypto).
let idSeq = 0;
const uid = (prefix: string) => `${prefix}-${(idSeq += 1)}`;

export function defaultConfig(name: string): CampaignConfig {
  return {
    name,
    labels: [],
    hypothesis: null,
    pageGroups: [
      {
        id: uid("pg"),
        kind: "include",
        rules: [{ id: uid("rule"), predicate: "URL matches", value: "" }],
      },
    ],
    trafficAllocation: 100,
    segment: "All Traffic",
    trigger: "Page Viewed",
    frequency: "",
    editorUrl: "",
    editorView: "desktop",
    variationSplitEnabled: false,
    variations: [
      { id: "control", label: "C", name: "Control", split: 100, modifications: 0 },
    ],
    splitMode: "Equal",
    successMetric: null,
    observationMetrics: [],
    protectionMetrics: [],
    mutuallyExclusiveGroup: null,
    trackAcrossDomains: false,
    hideCampaignNames: false,
    smartStats: {
      statsModel: "Bayesian",
      testingApproach: "Two-tailed",
      multipleTestingCorrection: "Enabled",
      minVisitorsPerVariation: 1000,
      minConversionsPerVariation: 100,
      convertAfterDays: 7,
    },
    qa: {
      ipEnabled: false,
      ipRules: [],
      cookiesEnabled: false,
      urlParamsEnabled: false,
      previewVariationId: "control",
      previewUrl: "",
      debugUrl: "",
    },
  };
}

// Distribute an integer `target` across `weights` proportionally, using the
// largest-remainder method so the parts are integers that sum to exactly target.
// When every weight is 0 (or none given a weight), splits evenly.
function distribute(weights: number[], target: number): number[] {
  const n = weights.length;
  if (n === 0) return [];
  if (target <= 0) return weights.map(() => 0);
  const totalW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (totalW > 0 ? (w / totalW) * target : target / n));
  const floors = raw.map((r) => Math.floor(r));
  let rem = target - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let k = 0; k < rem && k < order.length; k++) result[order[k].i] += 1;
  return result;
}

// Even split across ALL variations (integers summing to 100). Used when the set
// of variations changes (add/remove) and on "Equal" mode.
export function rebalance(variations: ConfigVariation[]): ConfigVariation[] {
  const splits = distribute(
    variations.map(() => 1),
    100
  );
  return variations.map((v, i) => ({ ...v, split: splits[i] }));
}

type ConfigState = {
  configs: Record<string /* campaignId */, CampaignConfig>;
  saved: Record<string, CampaignConfig>;
  // NOTE: view state only — whether Workflow Mode is open for a campaign.
  // Deliberately OUTSIDE CampaignConfig so toggling it never marks the config
  // dirty (it is not part of the saved snapshot comparison).
  workflowOpen: Record<string /* campaignId */, boolean>;
  openWorkflow: (id: string) => void;
  closeWorkflow: (id: string) => void;
  ensureConfig: (id: string, name: string) => void;
  patch: (id: string, partial: Partial<CampaignConfig>) => void;
  save: (id: string) => void;
  addRule: (campaignId: string, groupId: string) => void;
  removeRule: (campaignId: string, groupId: string, ruleId: string) => void;
  updateRule: (
    campaignId: string,
    groupId: string,
    ruleId: string,
    patch: Partial<PageRule>
  ) => void;
  addIncludeGroup: (campaignId: string) => void;
  addExcludeGroup: (campaignId: string) => void;
  addVariation: (campaignId: string, kind: "blank" | "duplicate") => void;
  removeVariation: (campaignId: string, variationId: string) => void;
  renameVariation: (campaignId: string, variationId: string, name: string) => void;
  setSplit: (campaignId: string, variationId: string, split: number) => void;
  toggleLock: (campaignId: string, variationId: string) => void;
  setSplitMode: (campaignId: string, mode: CampaignConfig["splitMode"]) => void;
  setSuccessMetric: (campaignId: string, metricId: string | null) => void;
  setObservationMetrics: (campaignId: string, ids: string[]) => void;
  toggleGuardrail: (campaignId: string, metricId: string) => void;
  setProtectionMetrics: (campaignId: string, ids: string[]) => void;
  addIpRule: (campaignId: string) => void;
  removeIpRule: (campaignId: string, ruleId: string) => void;
  updateIpRule: (campaignId: string, ruleId: string, patch: Partial<QaIpRule>) => void;
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  configs: {},
  saved: {},
  workflowOpen: {},
  openWorkflow: (id) =>
    set((s) => ({ workflowOpen: { ...s.workflowOpen, [id]: true } })),
  closeWorkflow: (id) =>
    set((s) => ({ workflowOpen: { ...s.workflowOpen, [id]: false } })),
  ensureConfig: (id, name) => {
    if (get().configs[id]) return;
    const seed = defaultConfig(name);
    set((s) => ({
      configs: { ...s.configs, [id]: seed },
      saved: { ...s.saved, [id]: seed },
    }));
  },
  patch: (id, partial) =>
    set((s) => {
      const current = s.configs[id];
      if (!current) return s;
      return { configs: { ...s.configs, [id]: { ...current, ...partial } } };
    }),
  save: (id) =>
    set((s) => {
      const current = s.configs[id];
      if (!current) return s;
      return { saved: { ...s.saved, [id]: current } };
    }),
  addRule: (campaignId, groupId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const pageGroups = current.pageGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            rules: [
              ...g.rules,
              { id: uid("rule"), predicate: "URL matches" as UrlPredicate, value: "" },
            ],
          }
        : g
    );
    get().patch(campaignId, { pageGroups });
  },
  removeRule: (campaignId, groupId, ruleId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const firstIncludeId = current.pageGroups.find((g) => g.kind === "include")?.id;
    const pageGroups = current.pageGroups
      .map((g) =>
        g.id === groupId ? { ...g, rules: g.rules.filter((r) => r.id !== ruleId) } : g
      )
      .filter((g) => g.rules.length > 0 || g.id === firstIncludeId);
    get().patch(campaignId, { pageGroups });
  },
  updateRule: (campaignId, groupId, ruleId, patch) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const pageGroups = current.pageGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            rules: g.rules.map((r) => {
              if (r.id !== ruleId) return r;
              const next = { ...r, ...patch };
              // Switching to or from "Page group is" changes the value's meaning.
              if (
                patch.predicate !== undefined &&
                (patch.predicate === "Page group is" || r.predicate === "Page group is") &&
                patch.predicate !== r.predicate
              ) {
                next.value = "";
              }
              return next;
            }),
          }
        : g
    );
    get().patch(campaignId, { pageGroups });
  },
  addIncludeGroup: (campaignId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const pageGroups: PageGroup[] = [
      ...current.pageGroups,
      {
        id: uid("pg"),
        kind: "include",
        rules: [{ id: uid("rule"), predicate: "URL matches", value: "" }],
      },
    ];
    get().patch(campaignId, { pageGroups });
  },
  addExcludeGroup: (campaignId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    if (current.pageGroups.some((g) => g.kind === "exclude")) return;
    const pageGroups: PageGroup[] = [
      ...current.pageGroups,
      {
        id: uid("pg"),
        kind: "exclude",
        rules: [{ id: uid("rule"), predicate: "URL matches", value: "" }],
      },
    ];
    get().patch(campaignId, { pageGroups });
  },
  addVariation: (campaignId, kind) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const n = current.variations.filter((v) => v.id !== "control").length + 1;
    const last = current.variations[current.variations.length - 1];
    const variation: ConfigVariation = {
      id: crypto.randomUUID(),
      label: `V${n}`,
      name: `Variation ${n}`,
      split: 0,
      modifications: kind === "duplicate" ? last.modifications : 0,
    };
    const variations = rebalance([...current.variations, variation]);
    get().patch(campaignId, { variations });
  },
  removeVariation: (campaignId, variationId) => {
    const current = get().configs[campaignId];
    if (!current || variationId === "control") return;
    let idx = 0;
    const remaining = current.variations
      .filter((v) => v.id !== variationId)
      .map((v) => {
        if (v.id === "control") return v;
        idx += 1;
        const name = /^Variation \d+$/.test(v.name) ? `Variation ${idx}` : v.name;
        return { ...v, label: `V${idx}`, name };
      });
    const variations = rebalance(remaining);
    get().patch(campaignId, { variations });
  },
  renameVariation: (campaignId, variationId, name) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const variations = current.variations.map((v) =>
      v.id === variationId ? { ...v, name } : v
    );
    get().patch(campaignId, { variations });
  },
  setSplit: (campaignId, variationId, split) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const clamped = Math.max(0, Math.min(100, Math.round(split)));
    const vars = current.variations;
    const others = vars.filter((v) => v.id !== variationId);
    const lockedTotal = others
      .filter((v) => v.locked)
      .reduce((s, v) => s + v.split, 0);
    const unlocked = others.filter((v) => !v.locked);
    // The edited variation can never push the locked total past 100.
    const edited = Math.min(clamped, 100 - lockedTotal);

    let variations: ConfigVariation[];
    if (unlocked.length === 0) {
      // Nothing to absorb the remainder — just clamp the edited one.
      variations = vars.map((v) =>
        v.id === variationId ? { ...v, split: edited } : v
      );
    } else {
      const remaining = 100 - edited - lockedTotal;
      const shares = distribute(
        unlocked.map((v) => v.split),
        remaining
      );
      const byId = new Map(unlocked.map((v, i) => [v.id, shares[i]]));
      variations = vars.map((v) => {
        if (v.id === variationId) return { ...v, split: edited };
        if (byId.has(v.id)) return { ...v, split: byId.get(v.id)! };
        return v;
      });
    }
    get().patch(campaignId, { variations });
  },
  toggleLock: (campaignId, variationId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const variations = current.variations.map((v) =>
      v.id === variationId ? { ...v, locked: !v.locked } : v
    );
    get().patch(campaignId, { variations });
  },
  setSplitMode: (campaignId, mode) => {
    const current = get().configs[campaignId];
    if (!current) return;
    if (mode === "Equal") {
      const variations = rebalance(
        current.variations.map((v) => ({ ...v, locked: false }))
      );
      get().patch(campaignId, { splitMode: mode, variations });
    } else if (mode === "Auto") {
      const variations = current.variations.map((v) => ({ ...v, locked: false }));
      get().patch(campaignId, { splitMode: mode, variations });
    } else {
      get().patch(campaignId, { splitMode: mode });
    }
  },
  setSuccessMetric: (campaignId, metricId) => {
    get().patch(campaignId, { successMetric: metricId });
  },
  setObservationMetrics: (campaignId, ids) => {
    get().patch(campaignId, { observationMetrics: ids });
  },
  toggleGuardrail: (campaignId, metricId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const has = current.protectionMetrics.includes(metricId);
    const protectionMetrics = has
      ? current.protectionMetrics.filter((id) => id !== metricId)
      : [...current.protectionMetrics, metricId];
    get().patch(campaignId, { protectionMetrics });
  },
  setProtectionMetrics: (campaignId, ids) => {
    get().patch(campaignId, { protectionMetrics: ids });
  },
  addIpRule: (campaignId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const rule: QaIpRule = {
      id: uid("ip"),
      subject: IP_SUBJECTS[0],
      operator: IP_OPERATORS[0],
      value: "",
    };
    get().patch(campaignId, {
      qa: { ...current.qa, ipRules: [...current.qa.ipRules, rule] },
    });
  },
  removeIpRule: (campaignId, ruleId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    get().patch(campaignId, {
      qa: { ...current.qa, ipRules: current.qa.ipRules.filter((r) => r.id !== ruleId) },
    });
  },
  updateIpRule: (campaignId, ruleId, patch) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const ipRules = current.qa.ipRules.map((r) =>
      r.id === ruleId ? { ...r, ...patch } : r
    );
    get().patch(campaignId, { qa: { ...current.qa, ipRules } });
  },
}));

export function useIsConfigDirty(id: string): boolean {
  return useConfigStore(
    (s) => JSON.stringify(s.configs[id]) !== JSON.stringify(s.saved[id])
  );
}
