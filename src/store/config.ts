import { create } from "zustand";
import { IP_SUBJECTS, IP_OPERATORS } from "../config/configOptions";
import type { CustomSegmentDef } from "../config/segments";

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

export type UrlSettings = {
  ignoreQueryString: boolean;
  ignoreFragment: boolean;
  caseInsensitive: boolean;
};
export type PageRule = {
  id: string;
  predicate: UrlPredicate;
  value: string;
  settings: UrlSettings;
};
export type PageGroup = { id: string; kind: "include" | "exclude"; rules: PageRule[] };

// URL matching defaults applied to every new rule. Surfaced to the user as
// "Some URL settings have been applied by default." in the UI.
export const DEFAULT_URL_SETTINGS: UrlSettings = {
  ignoreQueryString: true,
  ignoreFragment: true,
  caseInsensitive: true,
};

const newRule = (): PageRule => ({
  id: uid("rule"),
  predicate: "URL matches",
  value: "",
  settings: { ...DEFAULT_URL_SETTINGS },
});

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
export type RedirectMatchType = "matches" | "contains" | "starts" | "ends";

export type ConfigVariation = {
  id: string;
  label: string;
  name: string;
  split: number;
  locked?: boolean;
  modifications: number;
  type: "editor" | "redirect";
  // Redirect-only fields (present, defaulted, when type === "redirect").
  redirectMatchType?: RedirectMatchType;
  redirectUrl?: string;
  redirectExcludeQuery?: boolean;
  redirectExcludeFragments?: boolean;
};

export type CampaignConfig = {
  name: string;
  labels: string[];
  hypothesis: string | null;
  // Id of the selected canned hypothesis (see src/data/hypotheses.ts); null
  // when none is chosen. `hypothesis` mirrors its title so the section
  // completion check (isSectionComplete "main") keeps working.
  hypothesisId: string | null;
  pageGroups: PageGroup[];
  trafficAllocation: number;
  segment: string;
  // The applied-but-not-necessarily-saved custom segment for this campaign.
  // null when a standard / my-segment is selected. When set, `segment` holds
  // its generated label.
  customSegment: CustomSegmentDef | null;
  trigger: string;
  frequency: string;
  editorUrl: string;
  editorView: "desktop" | "mobile" | "tablet";
  editWith: "visual" | "code";
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
    hypothesisId: null,
    pageGroups: [
      {
        id: uid("pg"),
        kind: "include",
        rules: [newRule()],
      },
    ],
    trafficAllocation: 100,
    segment: "All Traffic",
    customSegment: null,
    trigger: "Page Viewed",
    frequency: "Always",
    editorUrl: "",
    editorView: "desktop",
    editWith: "visual",
    variations: [
      {
        id: "control",
        label: "C",
        name: "Control",
        split: 100,
        modifications: 0,
        type: "editor",
      },
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
  // NOTE: view state only — how the config step navigator (DotNav) is shown.
  // 'undocked' = hover-dots flyout; 'docked' = persistent left panel. Session-
  // only (this store is not persisted) and outside CampaignConfig so it never
  // marks the config dirty.
  dockState: "docked" | "undocked";
  setDockState: (state: "docked" | "undocked") => void;
  // NOTE: session-only view state — how the config surface renders its steps.
  // 'scroll' = all steps in one vertical scroll (default); 'guided' = one step
  // at a time, navigated via the DotNav. Outside CampaignConfig so it never
  // marks the config dirty. `activeStepId` is the step shown in Guided and the
  // step the DotNav highlights; defaults to the first step (Main Information).
  viewMode: "scroll" | "guided";
  setViewMode: (mode: "scroll" | "guided") => void;
  activeStepId: string;
  setActiveStepId: (stepId: string) => void;
  // NOTE: session-only view state — ids of connected third-party integrations.
  // Deliberately OUTSIDE CampaignConfig so connecting/disconnecting never marks
  // the config dirty (not part of the saved snapshot comparison).
  connectedIntegrations: string[];
  connectIntegration: (integrationId: string) => void;
  disconnectIntegration: (integrationId: string) => void;
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
  addExcludeGroup: (campaignId: string) => void;
  // Pick a standard / my-segment by label; clears any applied custom segment.
  selectSegment: (campaignId: string, label: string) => void;
  // Apply a custom segment built in the drawer; sets segment label + def.
  applyCustomSegment: (campaignId: string, def: CustomSegmentDef) => void;
  addVariation: (campaignId: string, kind: "blank" | "duplicate") => void;
  // Adds a typed variation (editor / redirect) and returns its new id so the
  // caller can open it in the right initial editing state.
  addTypedVariation: (
    campaignId: string,
    type: "editor" | "redirect"
  ) => string | undefined;
  updateVariation: (
    campaignId: string,
    variationId: string,
    patch: Partial<ConfigVariation>
  ) => void;
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
  dockState: "undocked",
  setDockState: (state) => set({ dockState: state }),
  viewMode: "scroll",
  setViewMode: (mode) => set({ viewMode: mode }),
  activeStepId: "main",
  setActiveStepId: (stepId) => set({ activeStepId: stepId }),
  connectedIntegrations: [],
  connectIntegration: (integrationId) =>
    set((s) =>
      s.connectedIntegrations.includes(integrationId)
        ? s
        : { connectedIntegrations: [...s.connectedIntegrations, integrationId] }
    ),
  disconnectIntegration: (integrationId) =>
    set((s) => ({
      connectedIntegrations: s.connectedIntegrations.filter(
        (i) => i !== integrationId
      ),
    })),
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
            rules: [...g.rules, newRule()],
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
  addExcludeGroup: (campaignId) => {
    const current = get().configs[campaignId];
    if (!current) return;
    if (current.pageGroups.some((g) => g.kind === "exclude")) return;
    const pageGroups: PageGroup[] = [
      ...current.pageGroups,
      { id: uid("pg"), kind: "exclude", rules: [newRule()] },
    ];
    get().patch(campaignId, { pageGroups });
  },
  selectSegment: (campaignId, label) => {
    get().patch(campaignId, { segment: label, customSegment: null });
  },
  applyCustomSegment: (campaignId, def) => {
    get().patch(campaignId, { segment: def.label, customSegment: def });
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
      type: "editor",
    };
    const variations = rebalance([...current.variations, variation]);
    get().patch(campaignId, { variations });
  },
  addTypedVariation: (campaignId, type) => {
    const current = get().configs[campaignId];
    if (!current) return undefined;
    const n = current.variations.filter((v) => v.id !== "control").length + 1;
    const id = crypto.randomUUID();
    const variation: ConfigVariation =
      type === "redirect"
        ? {
            id,
            label: `V${n}`,
            name: `Variation ${n}`,
            split: 0,
            modifications: 0,
            type: "redirect",
            redirectMatchType: "matches",
            redirectUrl: "",
            redirectExcludeQuery: false,
            redirectExcludeFragments: false,
          }
        : {
            id,
            label: `V${n}`,
            name: `Variation ${n}`,
            split: 0,
            modifications: 0,
            type: "editor",
          };
    const variations = rebalance([...current.variations, variation]);
    get().patch(campaignId, { variations });
    return id;
  },
  updateVariation: (campaignId, variationId, patch) => {
    const current = get().configs[campaignId];
    if (!current) return;
    const variations = current.variations.map((v) =>
      v.id === variationId ? { ...v, ...patch } : v
    );
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
