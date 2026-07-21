import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useCallback } from "react";
import {
  DEFAULT_REPORT_VIEW_SETTINGS,
  REPORT_PRESET_IDS,
  type ReportPresetId,
  type ReportViewSettings,
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
};

export type { ReportViewSettings, ReportPresetId };
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
    viewSettings: {
      ...base.viewSettings,
      ...(p.viewSettings && typeof p.viewSettings === "object"
        ? p.viewSettings
        : {}),
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
};

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
};

type CampaignReportUi = {
  selectedMetric: string;
  metricsNavCollapsed: boolean;
};

type SaveHint = {
  presetId: ReportPresetId;
  at: number;
};

type ReportViewsState = {
  byCampaign: Record<string, CampaignSlice>;
  uiByCampaign: Record<string, CampaignReportUi>;
  /** Transient UI feedback — not persisted. */
  lastSaveHint: SaveHint | null;
  initCampaign: (
    campaignId: string,
    seed: { primaryMetric: string; dateRange: ReportDateRange }
  ) => void;
  setActivePreset: (campaignId: string, presetId: ReportPresetId) => void;
  updateActivePreset: (
    campaignId: string,
    patch: Partial<ReportViewState>
  ) => void;
  setSelectedMetric: (campaignId: string, metric: string) => void;
  setMetricsNavCollapsed: (campaignId: string, collapsed: boolean) => void;
  clearSaveHint: () => void;
};

function createCampaignPresets(
  dateRange: ReportDateRange
): Record<ReportPresetId, ReportViewState> {
  const presets = clonePresets(DEFAULT_PRESETS);
  for (const id of Object.values(REPORT_PRESET_IDS) as ReportPresetId[]) {
    presets[id] = mergePresetPartial({
      ...presets[id],
      dateRange: { ...dateRange },
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
  return { activePresetId: active, presets };
}

function cloneCampaignSlice(sl: CampaignSlice): CampaignSlice {
  return {
    activePresetId: sl.activePresetId,
    presets: clonePresets(sl.presets),
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
                presets: createCampaignPresets(seed.dateRange),
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
          })),

        updateActivePreset: (campaignId, patch) => {
          const presetId = slice(campaignId).activePresetId;
          patchSlice(campaignId, (prev) => {
            const id = prev.activePresetId;
            const current = mergePresetPartial(prev.presets[id]);
            return {
              ...prev,
              presets: {
                ...prev.presets,
                [id]: applyPresetPatch(current, patch),
              },
            };
          });
          set({
            lastSaveHint: { presetId, at: Date.now() },
          });
        },

        clearSaveHint: () => set({ lastSaveHint: null }),

        setSelectedMetric: (campaignId, metric) =>
          set((s) => ({
            uiByCampaign: {
              ...s.uiByCampaign,
              [campaignId]: {
                selectedMetric: metric,
                metricsNavCollapsed:
                  s.uiByCampaign[campaignId]?.metricsNavCollapsed ?? false,
              },
            },
          })),

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
  return useReportViewsStore((s) => {
    const raw = s.byCampaign[campaignId];
    return raw ? normalizeSlice(raw) : cloneCampaignSlice(EMPTY_SLICE);
  });
}

function selectActivePresetState(
  campaignId: string,
  s: ReportViewsState
): ReportViewState {
  const sl = s.byCampaign[campaignId];
  if (!sl) return FALLBACK_PRESET_STATE;
  const id = activePresetFromSlice(sl);
  return presetFromSlice(sl, id);
}

export function useActiveReportPresetState(campaignId: string): ReportViewState {
  const selector = useCallback(
    (s: ReportViewsState) => selectActivePresetState(campaignId, s),
    [campaignId]
  );
  return useReportViewsStore(selector, (a, b) => a === b);
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

export function useReportSelectedMetric(
  campaignId: string,
  primaryMetric: string
): [string, (metric: string) => void] {
  const selected = useReportViewsStore(
    (s) => s.uiByCampaign[campaignId]?.selectedMetric ?? primaryMetric
  );
  const setSelectedMetric = useReportViewsStore((s) => s.setSelectedMetric);
  const setMetric = useCallback(
    (metric: string) => setSelectedMetric(campaignId, metric),
    [campaignId, setSelectedMetric]
  );
  return [selected, setMetric];
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
