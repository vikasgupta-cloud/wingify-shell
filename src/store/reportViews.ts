import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { useCallback, useMemo } from "react";
import {
  DEFAULT_REPORT_VIEW_SETTINGS,
  REPORT_PRESET_IDS,
  sanitizeResultsRowDensity,
  sanitizeResultsTableColumns,
  type ReportPresetId,
  type ReportViewSettings,
  type ResultsRowDensity,
  type ResultsTableColumnId,
} from "../pages/reports/reportViewTypes";

/** Serializable date range for persistence (YYYY-MM-DD). */
export type ReportDateRange = {
  id: string;
  label: string;
  from: string;
  to: string;
};

export type ReportViewState = {
  dateRange: ReportDateRange;
  segments: string[];
  dimensions: string[];
  viewSettings: ReportViewSettings;
  /** Empty string = fall back to the campaign primary metric at runtime. */
  selectedMetric: string;
};

export type ReportCustomView = {
  id: string;
  name: string;
  presetId: ReportPresetId;
  state: ReportViewState;
};

export type { ReportViewSettings, ReportPresetId, ResultsTableColumnId, ResultsRowDensity };
export {
  DEFAULT_REPORT_VIEW_SETTINGS,
  REPORT_PRESET_IDS,
  REPORT_PRESET_TABS,
  reportPresetLabel,
} from "../pages/reports/reportViewTypes";

export const REPORT_SEGMENT_OPTIONS = [
  "New visitors",
  "Returning visitors",
  "Mobile",
  "Desktop",
  "Tablet",
] as const;

export const REPORT_DIMENSION_OPTIONS = [
  "Device",
  "Browser",
  "Location",
  "Traffic source",
] as const;

export const REPORT_BASE_FILTERS: Pick<
  ReportViewState,
  "dateRange" | "segments" | "dimensions"
> = {
  dateRange: {
    id: "campaign",
    label: "Campaign duration",
    from: "2026-04-09",
    to: "2026-05-01",
  },
  segments: [],
  dimensions: [],
};

export function createDefaultReportViewState(): ReportViewState {
  return {
    ...REPORT_BASE_FILTERS,
    selectedMetric: "",
    viewSettings: { ...DEFAULT_REPORT_VIEW_SETTINGS },
  };
}

function sanitizeDateRange(
  dr: Partial<ReportDateRange> | undefined
): ReportDateRange {
  const base = REPORT_BASE_FILTERS.dateRange;
  if (!dr || typeof dr.from !== "string" || typeof dr.to !== "string") {
    return { ...base };
  }
  return {
    id: typeof dr.id === "string" ? dr.id : base.id,
    label: typeof dr.label === "string" ? dr.label : base.label,
    from: dr.from,
    to: dr.to,
  };
}

function mergePresetPartial(p: Partial<ReportViewState> | undefined): ReportViewState {
  const base = createDefaultReportViewState();
  if (!p) return base;
  return {
    dateRange: sanitizeDateRange(p.dateRange),
    segments: Array.isArray(p.segments) ? [...p.segments] : base.segments,
    dimensions: Array.isArray(p.dimensions) ? [...p.dimensions] : base.dimensions,
    selectedMetric:
      typeof p.selectedMetric === "string" ? p.selectedMetric : base.selectedMetric,
    viewSettings: {
      ...base.viewSettings,
      ...(p.viewSettings && typeof p.viewSettings === "object"
        ? p.viewSettings
        : {}),
      resultsTableColumns: sanitizeResultsTableColumns(
        p.viewSettings?.resultsTableColumns,
        base.viewSettings.resultsTableColumns
      ),
      rowDensity: sanitizeResultsRowDensity(
        p.viewSettings?.rowDensity,
        base.viewSettings.rowDensity
      ),
    },
  };
}

function cloneReportViewState(state: Partial<ReportViewState>): ReportViewState {
  return mergePresetPartial(state);
}

function clonePresets(
  source: Record<ReportPresetId, ReportViewState>
): Record<ReportPresetId, ReportViewState> {
  return {
    [REPORT_PRESET_IDS.visitors]: cloneReportViewState(
      source[REPORT_PRESET_IDS.visitors]
    ),
    [REPORT_PRESET_IDS.sessions]: cloneReportViewState(
      source[REPORT_PRESET_IDS.sessions]
    ),
    [REPORT_PRESET_IDS.statistics]: cloneReportViewState(
      source[REPORT_PRESET_IDS.statistics]
    ),
  };
}


function applyPresetPatch(
  current: ReportViewState,
  patch: Partial<ReportViewState>
): ReportViewState {
  return mergePresetPartial({
    ...current,
    ...patch,
    dateRange: patch.dateRange
      ? { ...current.dateRange, ...patch.dateRange }
      : current.dateRange,
    viewSettings: patch.viewSettings
      ? { ...current.viewSettings, ...patch.viewSettings }
      : current.viewSettings,
    segments: patch.segments ?? current.segments,
    dimensions: patch.dimensions ?? current.dimensions,
    selectedMetric: patch.selectedMetric ?? current.selectedMetric,
  });
}

function createDefaultPresets(): Record<ReportPresetId, ReportViewState> {
  const base = createDefaultReportViewState();
  return clonePresets({
    [REPORT_PRESET_IDS.visitors]: base,
    [REPORT_PRESET_IDS.sessions]: base,
    [REPORT_PRESET_IDS.statistics]: base,
  });
}

type CampaignSlice = {
  activePresetId: ReportPresetId;
  presets: Record<ReportPresetId, ReportViewState>;
  customViews: ReportCustomView[];
  activeCustomViewId: string | null;
};

function activeViewDraftKey(sl: CampaignSlice): string {
  if (sl.activeCustomViewId) return sl.activeCustomViewId;
  return `preset:${activePresetFromSlice(sl)}`;
}

/** Draft key from the persisted slice without cloning (safe for selectors). */
function activeViewDraftKeyFromRaw(
  sl: Partial<CampaignSlice> | undefined
): string {
  if (sl?.activeCustomViewId && typeof sl.activeCustomViewId === "string") {
    return sl.activeCustomViewId;
  }
  const presetId = isValidPresetId(sl?.activePresetId)
    ? sl.activePresetId
    : REPORT_PRESET_IDS.visitors;
  return `preset:${presetId}`;
}

/**
 * Read the active view state using only stable store references.
 * Never clone/normalize here — Zustand v5 requires getSnapshot to return
 * Object.is-equal values when the store has not changed.
 */
function selectActivePresetState(
  campaignId: string,
  s: ReportViewsState
): ReportViewState {
  const sl = s.byCampaign[campaignId];
  if (!sl) return FALLBACK_PRESET_STATE;

  const draftKey = activeViewDraftKeyFromRaw(sl);
  const draft = s.draftsByCampaign[campaignId]?.[draftKey];
  if (draft) return draft;

  if (sl.activeCustomViewId) {
    const custom = sl.customViews?.find((v) => v.id === sl.activeCustomViewId);
    if (custom?.state?.viewSettings?.layout) return custom.state;
  }

  const presetId = isValidPresetId(sl.activePresetId)
    ? sl.activePresetId
    : REPORT_PRESET_IDS.visitors;
  const preset = sl.presets?.[presetId];
  if (preset?.viewSettings?.layout) return preset;
  return FALLBACK_PRESET_STATE;
}

function savedStateFromSlice(sl: CampaignSlice): ReportViewState {
  if (sl.activeCustomViewId) {
    const custom = sl.customViews.find((v) => v.id === sl.activeCustomViewId);
    if (custom) return custom.state;
  }
  return presetFromSlice(sl, activePresetFromSlice(sl));
}

/** Session-only full view drafts — keyed by preset:* or custom view id. */
type DraftsByCampaign = Record<string, Record<string, ReportViewState>>;

function isReportStateDirty(
  draft: ReportViewState,
  saved: ReportViewState
): boolean {
  return JSON.stringify(draft) !== JSON.stringify(saved);
}

function normalizeDraftValue(
  value: unknown,
  fallback: ReportViewState
): ReportViewState {
  // Legacy layout-only drafts (columns array or { columns, rowDensity }).
  if (Array.isArray(value)) {
    return applyPresetPatch(fallback, {
      viewSettings: {
        resultsTableColumns: sanitizeResultsTableColumns(
          value,
          fallback.viewSettings.resultsTableColumns
        ),
      },
    });
  }
  if (value && typeof value === "object") {
    const v = value as Partial<ReportViewState> & {
      resultsTableColumns?: unknown;
      rowDensity?: unknown;
    };
    if (
      "resultsTableColumns" in v &&
      !("dateRange" in v) &&
      !("viewSettings" in v)
    ) {
      return applyPresetPatch(fallback, {
        viewSettings: {
          resultsTableColumns: sanitizeResultsTableColumns(
            v.resultsTableColumns,
            fallback.viewSettings.resultsTableColumns
          ),
          rowDensity: sanitizeResultsRowDensity(
            v.rowDensity,
            fallback.viewSettings.rowDensity
          ),
        },
      });
    }
    return mergePresetPartial(v);
  }
  return cloneReportViewState(fallback);
}

const DEFAULT_PRESETS = createDefaultPresets();

/** Read-only fallback — stable reference for selectors (never mutate). */
const FALLBACK_PRESET_STATE = DEFAULT_PRESETS[REPORT_PRESET_IDS.visitors];

function isValidPresetId(id: unknown): id is ReportPresetId {
  return (
    typeof id === "string" &&
    (Object.values(REPORT_PRESET_IDS) as string[]).includes(id)
  );
}

function activePresetFromSlice(sl: CampaignSlice): ReportPresetId {
  return isValidPresetId(sl.activePresetId)
    ? sl.activePresetId
    : REPORT_PRESET_IDS.visitors;
}

function presetFromSlice(sl: CampaignSlice, presetId: ReportPresetId): ReportViewState {
  const preset = sl.presets[presetId];
  if (!preset?.viewSettings?.layout) {
    return FALLBACK_PRESET_STATE;
  }
  return preset;
}

const EMPTY_SLICE: CampaignSlice = {
  activePresetId: REPORT_PRESET_IDS.visitors,
  presets: clonePresets(DEFAULT_PRESETS),
  customViews: [],
  activeCustomViewId: null,
};

type CampaignReportUi = {
  selectedMetric: string;
  metricsNavCollapsed: boolean;
};

type SaveHint = {
  presetId: ReportPresetId;
  customViewId?: string;
  at: number;
};

type ReportViewsState = {
  byCampaign: Record<string, CampaignSlice>;
  uiByCampaign: Record<string, CampaignReportUi>;
  /** Session-only view drafts — not persisted. */
  draftsByCampaign: DraftsByCampaign;
  /** Transient UI feedback after an explicit save — not persisted. */
  lastSaveHint: SaveHint | null;
  initCampaign: (
    campaignId: string,
    seed: { primaryMetric: string; dateRange: ReportDateRange }
  ) => void;
  setActivePreset: (campaignId: string, presetId: ReportPresetId) => void;
  setActiveCustomView: (campaignId: string, viewId: string) => void;
  /** Patches the active view draft; does not persist until save. */
  updateActivePreset: (
    campaignId: string,
    patch: Partial<ReportViewState>
  ) => void;
  setResultsTableColumnsDraft: (
    campaignId: string,
    columns: ResultsTableColumnId[]
  ) => void;
  setResultsRowDensityDraft: (
    campaignId: string,
    rowDensity: ResultsRowDensity
  ) => void;
  saveDraftToActiveView: (campaignId: string) => void;
  /** @deprecated Use saveDraftToActiveView */
  saveResultsTableColumnsDraft: (campaignId: string) => void;
  saveReportViewAsNew: (campaignId: string, name: string) => string;
  discardActiveViewDraft: (campaignId: string) => void;
  /** @deprecated Use discardActiveViewDraft */
  discardResultsTableColumnsDraft: (campaignId: string) => void;
  renameCustomView: (campaignId: string, viewId: string, name: string) => void;
  deleteCustomView: (campaignId: string, viewId: string) => void;
  reorderCustomViews: (campaignId: string, from: number, to: number) => void;
  setSelectedMetric: (campaignId: string, metric: string) => void;
  setMetricsNavCollapsed: (campaignId: string, collapsed: boolean) => void;
  clearSaveHint: () => void;
};

function createCampaignPresets(
  dateRange: ReportDateRange,
  selectedMetric = ""
): Record<ReportPresetId, ReportViewState> {
  const presets = clonePresets(DEFAULT_PRESETS);
  for (const id of Object.values(REPORT_PRESET_IDS) as ReportPresetId[]) {
    presets[id] = mergePresetPartial({
      ...presets[id],
      dateRange: { ...dateRange },
      selectedMetric,
    });
  }
  return presets;
}

function isLegacyCampaignSlice(raw: object): boolean {
  return "activeViewId" in raw && !("activePresetId" in raw);
}

function normalizeSlice(raw: unknown): CampaignSlice {
  if (!raw || typeof raw !== "object") {
    return cloneCampaignSlice(EMPTY_SLICE);
  }
  if (isLegacyCampaignSlice(raw)) {
    return cloneCampaignSlice(EMPTY_SLICE);
  }
  const r = raw as Partial<CampaignSlice>;
  const presets = clonePresets(DEFAULT_PRESETS);
  if (r.presets && typeof r.presets === "object") {
    for (const id of Object.values(REPORT_PRESET_IDS) as ReportPresetId[]) {
      const p = (r.presets as Record<string, Partial<ReportViewState>>)[id];
      presets[id] = mergePresetPartial(p);
    }
  }
  const active =
    r.activePresetId &&
    (Object.values(REPORT_PRESET_IDS) as string[]).includes(r.activePresetId)
      ? (r.activePresetId as ReportPresetId)
      : REPORT_PRESET_IDS.visitors;
  const customViews = Array.isArray(r.customViews)
    ? r.customViews
        .filter(
          (v): v is ReportCustomView =>
            Boolean(v) &&
            typeof v === "object" &&
            typeof (v as ReportCustomView).id === "string" &&
            typeof (v as ReportCustomView).name === "string" &&
            isValidPresetId((v as ReportCustomView).presetId)
        )
        .map((v) => ({
          id: v.id,
          name: v.name,
          presetId: v.presetId,
          state: mergePresetPartial(v.state),
        }))
    : [];
  const activeCustomViewId =
    typeof r.activeCustomViewId === "string" &&
    customViews.some((v) => v.id === r.activeCustomViewId)
      ? r.activeCustomViewId
      : null;
  return { activePresetId: active, presets, customViews, activeCustomViewId };
}

function cloneCampaignSlice(sl: CampaignSlice): CampaignSlice {
  return {
    activePresetId: sl.activePresetId,
    presets: clonePresets(sl.presets),
    customViews: sl.customViews.map((v) => ({
      id: v.id,
      name: v.name,
      presetId: v.presetId,
      state: cloneReportViewState(v.state),
    })),
    activeCustomViewId: sl.activeCustomViewId,
  };
}

export const useReportViewsStore = create<ReportViewsState>()(
  persist(
    (set, get) => {
      const slice = (campaignId: string): CampaignSlice => {
        const raw = get().byCampaign[campaignId];
        return raw ? normalizeSlice(raw) : cloneCampaignSlice(EMPTY_SLICE);
      };

      const patchSlice = (
        campaignId: string,
        update: (prev: CampaignSlice) => CampaignSlice
      ) =>
        set((s) => {
          const prev = s.byCampaign[campaignId]
            ? normalizeSlice(s.byCampaign[campaignId])
            : cloneCampaignSlice(EMPTY_SLICE);
          return {
            byCampaign: {
              ...s.byCampaign,
              [campaignId]: normalizeSlice(update(prev)),
            },
          };
        });

      return {
        byCampaign: {},
        uiByCampaign: {},
        draftsByCampaign: {},
        lastSaveHint: null,

        initCampaign: (campaignId, seed) =>
          set((s) => {
            const hasPresets = Boolean(s.byCampaign[campaignId]);
            const hasUi = Boolean(s.uiByCampaign[campaignId]);
            if (hasPresets && hasUi) return s;

            const nextByCampaign = { ...s.byCampaign };
            if (!hasPresets) {
              nextByCampaign[campaignId] = {
                activePresetId: REPORT_PRESET_IDS.visitors,
                presets: createCampaignPresets(seed.dateRange, seed.primaryMetric),
                customViews: [],
                activeCustomViewId: null,
              };
            }

            const nextUi = { ...s.uiByCampaign };
            if (!hasUi) {
              nextUi[campaignId] = {
                selectedMetric: seed.primaryMetric,
                metricsNavCollapsed: false,
              };
            }

            return {
              byCampaign: nextByCampaign,
              uiByCampaign: nextUi,
            };
          }),

        setActivePreset: (campaignId, presetId) =>
          patchSlice(campaignId, (prev) => ({
            ...prev,
            activePresetId: presetId,
            activeCustomViewId: null,
          })),

        setActiveCustomView: (campaignId, viewId) =>
          patchSlice(campaignId, (prev) => {
            const view = prev.customViews.find((v) => v.id === viewId);
            if (!view) return prev;
            return {
              ...prev,
              activePresetId: view.presetId,
              activeCustomViewId: viewId,
            };
          }),

        updateActivePreset: (campaignId, patch) => {
          const current = slice(campaignId);
          const key = activeViewDraftKey(current);
          const saved = savedStateFromSlice(current);
          set((s) => {
            const existing = s.draftsByCampaign[campaignId]?.[key];
            const base = existing
              ? normalizeDraftValue(existing, saved)
              : cloneReportViewState(saved);
            const next = applyPresetPatch(base, patch);
            const campaignDrafts = {
              ...(s.draftsByCampaign[campaignId] ?? {}),
            };
            if (!isReportStateDirty(next, saved)) {
              delete campaignDrafts[key];
            } else {
              campaignDrafts[key] = next;
            }
            const nextDrafts = { ...s.draftsByCampaign };
            if (Object.keys(campaignDrafts).length === 0) {
              delete nextDrafts[campaignId];
            } else {
              nextDrafts[campaignId] = campaignDrafts;
            }
            return {
              draftsByCampaign: nextDrafts,
              lastSaveHint: null,
            };
          });
        },

        setResultsTableColumnsDraft: (campaignId, columns) => {
          get().updateActivePreset(campaignId, {
            viewSettings: {
              resultsTableColumns: sanitizeResultsTableColumns(columns),
            },
          });
        },

        setResultsRowDensityDraft: (campaignId, rowDensity) => {
          get().updateActivePreset(campaignId, {
            viewSettings: {
              rowDensity: sanitizeResultsRowDensity(rowDensity),
            },
          });
        },

        saveDraftToActiveView: (campaignId) => {
          const current = slice(campaignId);
          const key = activeViewDraftKey(current);
          const rawDraft = get().draftsByCampaign[campaignId]?.[key];
          if (!rawDraft) return;
          const saved = savedStateFromSlice(current);
          const draft = normalizeDraftValue(rawDraft, saved);
          const customViewId = current.activeCustomViewId;
          const presetId = current.activePresetId;
          patchSlice(campaignId, (prev) => {
            if (prev.activeCustomViewId) {
              return {
                ...prev,
                customViews: prev.customViews.map((v) =>
                  v.id === prev.activeCustomViewId
                    ? { ...v, state: cloneReportViewState(draft) }
                    : v
                ),
              };
            }
            const id = prev.activePresetId;
            return {
              ...prev,
              presets: {
                ...prev.presets,
                [id]: cloneReportViewState(draft),
              },
            };
          });
          set((s) => {
            const campaignDrafts = {
              ...(s.draftsByCampaign[campaignId] ?? {}),
            };
            delete campaignDrafts[key];
            const nextDrafts = { ...s.draftsByCampaign };
            if (Object.keys(campaignDrafts).length === 0) {
              delete nextDrafts[campaignId];
            } else {
              nextDrafts[campaignId] = campaignDrafts;
            }
            return {
              draftsByCampaign: nextDrafts,
              lastSaveHint: {
                presetId,
                customViewId: customViewId ?? undefined,
                at: Date.now(),
              },
            };
          });
        },

        saveResultsTableColumnsDraft: (campaignId) => {
          get().saveDraftToActiveView(campaignId);
        },

        saveReportViewAsNew: (campaignId, name) => {
          const current = slice(campaignId);
          const key = activeViewDraftKey(current);
          const rawDraft = get().draftsByCampaign[campaignId]?.[key];
          const base = savedStateFromSlice(current);
          const state = rawDraft
            ? normalizeDraftValue(rawDraft, base)
            : cloneReportViewState(base);
          const id = crypto.randomUUID();
          const trimmed = name.trim() || "New view";
          patchSlice(campaignId, (prev) => ({
            ...prev,
            customViews: [
              ...prev.customViews,
              {
                id,
                name: trimmed,
                presetId: prev.activePresetId,
                state,
              },
            ],
            activeCustomViewId: id,
          }));
          set((s) => {
            const campaignDrafts = {
              ...(s.draftsByCampaign[campaignId] ?? {}),
            };
            delete campaignDrafts[key];
            const nextDrafts = { ...s.draftsByCampaign };
            if (Object.keys(campaignDrafts).length === 0) {
              delete nextDrafts[campaignId];
            } else {
              nextDrafts[campaignId] = campaignDrafts;
            }
            return {
              draftsByCampaign: nextDrafts,
              lastSaveHint: {
                presetId: current.activePresetId,
                customViewId: id,
                at: Date.now(),
              },
            };
          });
          return id;
        },

        discardActiveViewDraft: (campaignId) => {
          const key = activeViewDraftKey(slice(campaignId));
          set((s) => {
            const campaignDrafts = {
              ...(s.draftsByCampaign[campaignId] ?? {}),
            };
            delete campaignDrafts[key];
            const nextDrafts = { ...s.draftsByCampaign };
            if (Object.keys(campaignDrafts).length === 0) {
              delete nextDrafts[campaignId];
            } else {
              nextDrafts[campaignId] = campaignDrafts;
            }
            return {
              draftsByCampaign: nextDrafts,
              lastSaveHint: null,
            };
          });
        },

        discardResultsTableColumnsDraft: (campaignId) => {
          get().discardActiveViewDraft(campaignId);
        },

        renameCustomView: (campaignId, viewId, name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          patchSlice(campaignId, (prev) => ({
            ...prev,
            customViews: prev.customViews.map((v) =>
              v.id === viewId ? { ...v, name: trimmed } : v
            ),
          }));
        },

        deleteCustomView: (campaignId, viewId) =>
          set((s) => {
            const prev = s.byCampaign[campaignId]
              ? normalizeSlice(s.byCampaign[campaignId])
              : cloneCampaignSlice(EMPTY_SLICE);
            const wasActive = prev.activeCustomViewId === viewId;
            const campaignDrafts = {
              ...(s.draftsByCampaign[campaignId] ?? {}),
            };
            delete campaignDrafts[viewId];
            const nextDrafts = { ...s.draftsByCampaign };
            if (Object.keys(campaignDrafts).length === 0) {
              delete nextDrafts[campaignId];
            } else {
              nextDrafts[campaignId] = campaignDrafts;
            }
            return {
              byCampaign: {
                ...s.byCampaign,
                [campaignId]: {
                  ...prev,
                  customViews: prev.customViews.filter((v) => v.id !== viewId),
                  activeCustomViewId: wasActive
                    ? null
                    : prev.activeCustomViewId,
                },
              },
              draftsByCampaign: nextDrafts,
              lastSaveHint: null,
            };
          }),

        reorderCustomViews: (campaignId, from, to) =>
          patchSlice(campaignId, (prev) => {
            if (
              from < 0 ||
              to < 0 ||
              from >= prev.customViews.length ||
              to >= prev.customViews.length ||
              from === to
            ) {
              return prev;
            }
            const next = [...prev.customViews];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return { ...prev, customViews: next };
          }),

        clearSaveHint: () => set({ lastSaveHint: null }),

        setSelectedMetric: (campaignId, metric) => {
          get().updateActivePreset(campaignId, { selectedMetric: metric });
        },

        setMetricsNavCollapsed: (campaignId, collapsed) =>
          set((s) => {
            const ui = s.uiByCampaign[campaignId];
            if (!ui) return s;
            return {
              uiByCampaign: {
                ...s.uiByCampaign,
                [campaignId]: { ...ui, metricsNavCollapsed: collapsed },
              },
            };
          }),
      };
    },
    {
      name: "wingify-report-views-v4",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        byCampaign: s.byCampaign,
        uiByCampaign: s.uiByCampaign,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<
          Pick<ReportViewsState, "byCampaign" | "uiByCampaign">
        >;
        const byCampaign: Record<string, CampaignSlice> = {};
        if (p?.byCampaign && typeof p.byCampaign === "object") {
          for (const [campaignId, raw] of Object.entries(p.byCampaign)) {
            byCampaign[campaignId] = normalizeSlice(raw);
          }
        }
        const uiByCampaign =
          p?.uiByCampaign && typeof p.uiByCampaign === "object"
            ? { ...p.uiByCampaign }
            : {};
        return { ...current, byCampaign, uiByCampaign };
      },
    }
  )
);

export function useReportCampaignSlice(campaignId: string): CampaignSlice {
  // Select the stored slice by stable reference — normalizing inside the
  // selector would return a fresh object every call and, since Zustand v5 uses
  // Object.is, spin an infinite render loop. Normalize in a memo keyed on the
  // raw slice instead.
  const raw = useReportViewsStore((s) => s.byCampaign[campaignId]);
  return useMemo(
    () => (raw ? normalizeSlice(raw) : cloneCampaignSlice(EMPTY_SLICE)),
    [raw]
  );
}

export function useActiveReportPresetState(campaignId: string): ReportViewState {
  const selector = useCallback(
    (s: ReportViewsState) => selectActivePresetState(campaignId, s),
    [campaignId]
  );
  // Selector returns a stable stored reference, so Zustand v5's default Object.is
  // equality is correct here (the removed second-arg comparator was a no-op in v5).
  return useReportViewsStore(selector);
}

/** @deprecated Use useActiveReportPresetState */
export function useReportActiveViewState(campaignId: string): ReportViewState {
  return useActiveReportPresetState(campaignId);
}

export function useActiveReportPresetId(campaignId: string): ReportPresetId {
  const selector = useCallback(
    (s: ReportViewsState) => {
      const sl = s.byCampaign[campaignId];
      if (!sl) return REPORT_PRESET_IDS.visitors;
      return activePresetFromSlice(sl);
    },
    [campaignId]
  );
  return useReportViewsStore(selector);
}

export function useActiveResultsTableColumns(
  campaignId: string
): ResultsTableColumnId[] {
  const selector = useCallback(
    (s: ReportViewsState) =>
      sanitizeResultsTableColumns(
        selectActivePresetState(campaignId, s).viewSettings.resultsTableColumns
      ),
    [campaignId]
  );
  // Zustand v5 ignores the second equality-fn argument, so this selector — which
  // returns a fresh array every call — must dedupe via useShallow to avoid an
  // infinite render loop.
  return useReportViewsStore(useShallow(selector));
}

export function useActiveResultsRowDensity(
  campaignId: string
): ResultsRowDensity {
  const selector = useCallback(
    (s: ReportViewsState) =>
      sanitizeResultsRowDensity(
        selectActivePresetState(campaignId, s).viewSettings.rowDensity
      ),
    [campaignId]
  );
  return useReportViewsStore(selector);
}

export function useIsReportViewDirty(campaignId: string): boolean {
  const selector = useCallback(
    (s: ReportViewsState) => {
      const sl = s.byCampaign[campaignId];
      if (!sl) return false;
      const key = activeViewDraftKeyFromRaw(sl);
      return Boolean(s.draftsByCampaign[campaignId]?.[key]);
    },
    [campaignId]
  );
  return useReportViewsStore(selector);
}

export function useReportCustomViews(campaignId: string): ReportCustomView[] {
  return useReportViewsStore(
    (s) => s.byCampaign[campaignId]?.customViews ?? EMPTY_SLICE.customViews
  );
}

export function useActiveCustomViewId(campaignId: string): string | null {
  return useReportViewsStore(
    (s) => s.byCampaign[campaignId]?.activeCustomViewId ?? null
  );
}

export function useReportSelectedMetric(
  campaignId: string,
  primaryMetric: string
): [string, (metric: string) => void] {
  const fromView = useActiveReportPresetState(campaignId).selectedMetric;
  const setSelectedMetric = useReportViewsStore((s) => s.setSelectedMetric);
  const setMetric = useCallback(
    (metric: string) => setSelectedMetric(campaignId, metric),
    [campaignId, setSelectedMetric]
  );
  return [fromView || primaryMetric, setMetric];
}

export function useReportMetricsNavCollapsed(
  campaignId: string
): [boolean, (collapsed: boolean) => void] {
  const collapsed = useReportViewsStore(
    (s) => s.uiByCampaign[campaignId]?.metricsNavCollapsed ?? false
  );
  const setCollapsed = useReportViewsStore((s) => s.setMetricsNavCollapsed);
  const setNavCollapsed = useCallback(
    (value: boolean) => setCollapsed(campaignId, value),
    [campaignId, setCollapsed]
  );
  return [collapsed, setNavCollapsed];
}

export function toYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromYmd(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
