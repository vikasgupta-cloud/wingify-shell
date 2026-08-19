import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EDITOR_PREVIEW_SRC } from "../components/editor/EditorCanvas";
import {
  BASE_CLICKS,
  BASE_HOVERS,
  FRICTION_TYPE_IDS,
  type FrictionTypeId,
} from "../data/heatmapViewer";

export type ClickScope = "all" | "first";

export type Observation = {
  id: string;
  text: string;
  /** Viewport percentages, so a pin lands in the same place on any screen. */
  x: number;
  y: number;
  /** Which visualization it was captured on — shown alongside the note. */
  viz: string;
  /** The view (or ad-hoc URL) it belongs to. */
  url: string;
  createdAt: number;
};

/**
 * Everything the heatmap experience shares: what the Heatmaps page is asking
 * for, what the viewer's toolbar has narrowed it to, and what the analyst
 * recorded while looking at it. One store so the page, the viewer, and the
 * panels can't drift out of sync.
 */
type HeatmapsState = {
  // ---- set on the Heatmaps page, read by the viewer ----
  url: string;
  visualization: string;
  activeViewId: string | null;
  setUrl: (url: string) => void;
  setVisualization: (viz: string) => void;
  selectView: (id: string | null, url?: string) => void;

  // ---- narrowed in the viewer's toolbar ----
  clickScope: ClickScope;
  firstNClicks: number;
  latestOnly: boolean;
  hoverLatestOnly: boolean;
  frictionTypes: FrictionTypeId[];
  metricId: string;
  segment: string;
  dateLabel: string;
  pageRule: { matcher: string; url: string } | null;
  campaignTypeId: string | null;
  applyClickScope: (scope: ClickScope, firstN: number, latest: boolean) => void;
  applyHoverScope: (latest: boolean) => void;
  applyFrictionTypes: (types: FrictionTypeId[], latest: boolean) => void;
  applyMetric: (id: string) => void;
  applyDateFilter: (label: string, segment: string) => void;
  applyPageRule: (matcher: string, url: string) => void;
  applyCampaign: (typeId: string | null) => void;

  // ---- captured in the viewer, surfaced back on the Heatmaps page ----
  observations: Observation[];
  addObservation: (o: Omit<Observation, "id" | "createdAt">) => void;
  removeObservation: (id: string) => void;

  resetScope: () => void;
};

const DEFAULT_SCOPE = {
  clickScope: "all" as ClickScope,
  firstNClicks: 1,
  latestOnly: true,
  hoverLatestOnly: true,
  frictionTypes: [...FRICTION_TYPE_IDS],
  metricId: "click-distribution",
  segment: "All Visitors",
  dateLabel: "Last 30 days",
  pageRule: null,
  campaignTypeId: null,
};

export const useHeatmapsStore = create<HeatmapsState>()(
  persist(
    (set) => ({
      url: EDITOR_PREVIEW_SRC,
      visualization: "heatmap",
      activeViewId: null,
      setUrl: (url) => set({ url }),
      setVisualization: (visualization) => set({ visualization }),
      selectView: (activeViewId, url) =>
        set(url ? { activeViewId, url } : { activeViewId }),

      ...DEFAULT_SCOPE,
      applyClickScope: (clickScope, firstNClicks, latestOnly) =>
        set({ clickScope, firstNClicks, latestOnly }),
      applyHoverScope: (hoverLatestOnly) => set({ hoverLatestOnly }),
      applyFrictionTypes: (frictionTypes, latestOnly) =>
        set({ frictionTypes, latestOnly }),
      applyMetric: (metricId) => set({ metricId }),
      applyDateFilter: (dateLabel, segment) => set({ dateLabel, segment }),
      applyPageRule: (matcher, url) => set({ pageRule: { matcher, url } }),
      applyCampaign: (campaignTypeId) => set({ campaignTypeId }),

      observations: [],
      addObservation: (o) =>
        set((s) => ({
          observations: [
            ...s.observations,
            { ...o, id: crypto.randomUUID(), createdAt: Date.now() },
          ],
        })),
      removeObservation: (id) =>
        set((s) => ({
          observations: s.observations.filter((o) => o.id !== id),
        })),

      resetScope: () => set({ ...DEFAULT_SCOPE }),
    }),
    { name: "wingify-heatmaps" }
  )
);

/**
 * Click total after the toolbar's narrowing. "First N clicks" only counts the
 * opening clicks of a session, so the number drops sharply — that drop is the
 * whole point of the control, and the footer readout has to show it.
 */
export function visibleClicks(s: HeatmapsState): number {
  if (s.clickScope === "first") {
    return Math.min(BASE_CLICKS, Math.max(1, s.firstNClicks) * 18);
  }
  return BASE_CLICKS;
}

export function visibleHovers(): number {
  return BASE_HOVERS;
}

/** Friction is the sum of the checked types — unchecking one drops its share. */
export function visibleFriction(s: HeatmapsState): number {
  const PER_TYPE: Record<FrictionTypeId, number> = {
    rage: 11,
    dead: 9,
    error: 5,
  };
  return s.frictionTypes.reduce((sum, t) => sum + PER_TYPE[t], 0);
}
