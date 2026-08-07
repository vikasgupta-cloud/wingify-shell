import { create } from "zustand";
import type { Campaign } from "../data/campaigns";
import type {
  CampaignConfig,
  ConfigVariation,
  PageGroup,
  PageRule,
  UrlPredicate,
} from "./config";
import { DEFAULT_URL_SETTINGS, defaultConfig, rebalance } from "./config";
import { campaignToConfig } from "./campaignToConfig";
import type { CustomSegmentDef } from "../config/segments";

// Config v2 store — SESSION-ONLY, NOT persisted, keyed by campaign id. It mirrors
// v1's CampaignConfig (so the same sub-controls can be reused) and adds the two
// v2-only pieces: an explicit decision rule and which "act" is open. The variation
// / page-rule / segment logic is COPIED from v1 (not imported from its store) so
// v2 owns its own state; only pure helpers + the hydration mapping are shared.

export type DecisionRule = {
  confidenceThresholdPct: number; // default 95
  minRuntimeDays: number; // default 14
  ifWins: string;
  ifLoses: string;
  ifInconclusive: string;
};

export type ActStep = "idea" | "reach" | "verdict" | "launch";

export type ConfigV2 = CampaignConfig & { decisionRule: DecisionRule };

export const DEFAULT_DECISION_RULE: DecisionRule = {
  confidenceThresholdPct: 95,
  minRuntimeDays: 14,
  ifWins: "",
  ifLoses: "",
  ifInconclusive: "",
};

export const ACT_ORDER: ActStep[] = ["idea", "reach", "verdict", "launch"];

// Session-unique id generator (no persistence, no crypto needed for ordering).
let v2Seq = 0;
const uid = (prefix: string) => `${prefix}-v2-${(v2Seq += 1)}`;

const newRule = (): PageRule => ({
  id: uid("rule"),
  predicate: "URL matches",
  value: "",
  settings: { ...DEFAULT_URL_SETTINGS },
});

// Largest-remainder integer split (copied from v1's private helper).
function distribute(weights: number[], target: number): number[] {
  const n = weights.length;
  if (n === 0) return [];
  if (target <= 0) return weights.map(() => 0);
  const totalW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (totalW > 0 ? (w / totalW) * target : target / n));
  const floors = raw.map((r) => Math.floor(r));
  const rem = target - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let k = 0; k < rem && k < order.length; k++) result[order[k].i] += 1;
  return result;
}

export { rebalance };

type V2State = {
  configs: Record<string, ConfigV2>;
  actStep: Record<string, ActStep>;
  ensureConfigV2: (id: string, name: string, campaign?: Campaign) => void;
  patchV2: (id: string, partial: Partial<ConfigV2>) => void;
  patchDecisionRule: (id: string, partial: Partial<DecisionRule>) => void;
  setActStep: (id: string, step: ActStep) => void;
  // Page rules
  addRule: (id: string, groupId: string) => void;
  removeRule: (id: string, groupId: string, ruleId: string) => void;
  updateRule: (
    id: string,
    groupId: string,
    ruleId: string,
    patch: Partial<PageRule>
  ) => void;
  addExcludeGroup: (id: string) => void;
  // Segment
  selectSegment: (id: string, label: string) => void;
  applyCustomSegment: (id: string, def: CustomSegmentDef) => void;
  // Variations
  addTypedVariation: (id: string, type: "editor" | "redirect") => string | undefined;
  updateVariation: (
    id: string,
    variationId: string,
    patch: Partial<ConfigVariation>
  ) => void;
  removeVariation: (id: string, variationId: string) => void;
  renameVariation: (id: string, variationId: string, name: string) => void;
  setSplit: (id: string, variationId: string, split: number) => void;
  toggleLock: (id: string, variationId: string) => void;
  setSplitMode: (id: string, mode: CampaignConfig["splitMode"]) => void;
};

export const useConfigV2Store = create<V2State>((set, get) => ({
  configs: {},
  actStep: {},

  ensureConfigV2: (id, name, campaign) => {
    if (get().configs[id]) return;
    // Direction A hydration, identical to v1: overlay the record-mirroring fields
    // onto a blank seed when a campaign is supplied. Then add decision-rule defaults.
    const base = campaign
      ? { ...defaultConfig(name), ...campaignToConfig(campaign) }
      : defaultConfig(name);
    const seed: ConfigV2 = { ...base, decisionRule: { ...DEFAULT_DECISION_RULE } };
    set((s) => ({
      configs: { ...s.configs, [id]: seed },
      actStep: { [id]: s.actStep[id] ?? "idea", ...s.actStep },
    }));
  },

  patchV2: (id, partial) =>
    set((s) => {
      const current = s.configs[id];
      if (!current) return s;
      return { configs: { ...s.configs, [id]: { ...current, ...partial } } };
    }),

  patchDecisionRule: (id, partial) =>
    set((s) => {
      const current = s.configs[id];
      if (!current) return s;
      return {
        configs: {
          ...s.configs,
          [id]: { ...current, decisionRule: { ...current.decisionRule, ...partial } },
        },
      };
    }),

  setActStep: (id, step) =>
    set((s) => ({ actStep: { ...s.actStep, [id]: step } })),

  addRule: (id, groupId) => {
    const current = get().configs[id];
    if (!current) return;
    const pageGroups = current.pageGroups.map((g) =>
      g.id === groupId ? { ...g, rules: [...g.rules, newRule()] } : g
    );
    get().patchV2(id, { pageGroups });
  },

  removeRule: (id, groupId, ruleId) => {
    const current = get().configs[id];
    if (!current) return;
    const firstIncludeId = current.pageGroups.find((g) => g.kind === "include")?.id;
    const pageGroups = current.pageGroups
      .map((g) =>
        g.id === groupId ? { ...g, rules: g.rules.filter((r) => r.id !== ruleId) } : g
      )
      .filter((g) => g.rules.length > 0 || g.id === firstIncludeId);
    get().patchV2(id, { pageGroups });
  },

  updateRule: (id, groupId, ruleId, patch) => {
    const current = get().configs[id];
    if (!current) return;
    const pageGroups = current.pageGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            rules: g.rules.map((r) => {
              if (r.id !== ruleId) return r;
              const next = { ...r, ...patch };
              const changingGroupPredicate =
                patch.predicate !== undefined &&
                (patch.predicate === "Page group is" ||
                  r.predicate === "Page group is") &&
                patch.predicate !== r.predicate;
              if (changingGroupPredicate) next.value = "";
              return next;
            }),
          }
        : g
    );
    get().patchV2(id, { pageGroups });
  },

  addExcludeGroup: (id) => {
    const current = get().configs[id];
    if (!current) return;
    if (current.pageGroups.some((g) => g.kind === "exclude")) return;
    const pageGroups: PageGroup[] = [
      ...current.pageGroups,
      { id: uid("pg"), kind: "exclude", rules: [newRule()] },
    ];
    get().patchV2(id, { pageGroups });
  },

  selectSegment: (id, label) =>
    get().patchV2(id, { segment: label, customSegment: null }),

  applyCustomSegment: (id, def) =>
    get().patchV2(id, { segment: def.label, customSegment: def }),

  addTypedVariation: (id, type) => {
    const current = get().configs[id];
    if (!current) return undefined;
    const n = current.variations.filter((v) => v.id !== "control").length + 1;
    const vid = uid("var");
    const variation: ConfigVariation =
      type === "redirect"
        ? {
            id: vid,
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
            id: vid,
            label: `V${n}`,
            name: `Variation ${n}`,
            split: 0,
            modifications: 0,
            type: "editor",
          };
    const variations = rebalance([...current.variations, variation]);
    get().patchV2(id, { variations });
    return vid;
  },

  updateVariation: (id, variationId, patch) => {
    const current = get().configs[id];
    if (!current) return;
    const variations = current.variations.map((v) =>
      v.id === variationId ? { ...v, ...patch } : v
    );
    get().patchV2(id, { variations });
  },

  removeVariation: (id, variationId) => {
    const current = get().configs[id];
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
    get().patchV2(id, { variations });
  },

  renameVariation: (id, variationId, name) => {
    const current = get().configs[id];
    if (!current) return;
    const variations = current.variations.map((v) =>
      v.id === variationId ? { ...v, name } : v
    );
    get().patchV2(id, { variations });
  },

  setSplit: (id, variationId, split) => {
    const current = get().configs[id];
    if (!current) return;
    const clamped = Math.max(0, Math.min(100, Math.round(split)));
    const vars = current.variations;
    const others = vars.filter((v) => v.id !== variationId);
    const lockedTotal = others
      .filter((v) => v.locked)
      .reduce((s, v) => s + v.split, 0);
    const unlocked = others.filter((v) => !v.locked);
    const edited = Math.min(clamped, 100 - lockedTotal);

    let variations: ConfigVariation[];
    if (unlocked.length === 0) {
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
    get().patchV2(id, { variations });
  },

  toggleLock: (id, variationId) => {
    const current = get().configs[id];
    if (!current) return;
    const variations = current.variations.map((v) =>
      v.id === variationId ? { ...v, locked: !v.locked } : v
    );
    get().patchV2(id, { variations });
  },

  setSplitMode: (id, mode) => {
    const current = get().configs[id];
    if (!current) return;
    if (mode === "Equal") {
      const variations = rebalance(
        current.variations.map((v) => ({ ...v, locked: false }))
      );
      get().patchV2(id, { splitMode: mode, variations });
    } else if (mode === "Auto") {
      const variations = current.variations.map((v) => ({ ...v, locked: false }));
      get().patchV2(id, { splitMode: mode, variations });
    } else {
      get().patchV2(id, { splitMode: mode });
    }
  },
}));

// Re-exported for callers that build predicate pickers against the v2 store.
export type { UrlPredicate };
