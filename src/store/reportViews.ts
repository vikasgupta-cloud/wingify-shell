import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
};

export type ReportView = {
  id: string;
  name: string;
  state: ReportViewState;
};

export const REPORT_BASE_VIEW_ID = "all";

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

export const REPORT_BASE_STATE: ReportViewState = {
  dateRange: {
    id: "campaign",
    label: "Campaign duration",
    from: "2026-04-09",
    to: "2026-05-01",
  },
  segments: [],
  dimensions: [],
};

type CampaignSlice = {
  views: ReportView[];
  activeViewId: string;
};

const EMPTY_SLICE: CampaignSlice = {
  views: [],
  activeViewId: REPORT_BASE_VIEW_ID,
};

type ReportViewsState = {
  byCampaign: Record<string, CampaignSlice>;
  /** In-memory only — never persisted. Keyed `${campaignId}::${viewId}`. */
  drafts: Record<string, ReportViewState>;
  setActiveView: (campaignId: string, id: string) => void;
  updateActiveViewDraft: (
    campaignId: string,
    patch: Partial<ReportViewState>
  ) => void;
  saveDraftToActiveView: (campaignId: string) => void;
  saveDraftAsNewView: (campaignId: string, name: string) => string;
  discardActiveViewDraft: (campaignId: string) => void;
  renameView: (campaignId: string, id: string, name: string) => void;
  deleteView: (campaignId: string, id: string) => void;
  reorderViews: (campaignId: string, from: number, to: number) => void;
};

const draftKey = (campaignId: string, viewId: string) =>
  `${campaignId}::${viewId}`;

export const useReportViewsStore = create<ReportViewsState>()(
  persist(
    (set, get) => {
      const slice = (campaignId: string): CampaignSlice =>
        get().byCampaign[campaignId] ?? EMPTY_SLICE;

      const savedState = (campaignId: string, id: string): ReportViewState =>
        id === REPORT_BASE_VIEW_ID
          ? REPORT_BASE_STATE
          : slice(campaignId).views.find((v) => v.id === id)?.state ??
            REPORT_BASE_STATE;

      const effectiveState = (
        campaignId: string,
        id: string
      ): ReportViewState =>
        get().drafts[draftKey(campaignId, id)] ?? savedState(campaignId, id);

      const patchSlice = (
        campaignId: string,
        update: (prev: CampaignSlice) => CampaignSlice
      ) =>
        set((s) => ({
          byCampaign: {
            ...s.byCampaign,
            [campaignId]: update(slice(campaignId)),
          },
        }));

      return {
        byCampaign: {},
        drafts: {},

        setActiveView: (campaignId, id) =>
          patchSlice(campaignId, (prev) => ({
            ...prev,
            activeViewId: id,
          })),

        updateActiveViewDraft: (campaignId, patch) =>
          set((s) => {
            const { activeViewId } = slice(campaignId);
            const key = draftKey(campaignId, activeViewId);
            const base = s.drafts[key] ?? savedState(campaignId, activeViewId);
            return {
              drafts: {
                ...s.drafts,
                [key]: { ...base, ...patch },
              },
            };
          }),

        saveDraftToActiveView: (campaignId) =>
          set((s) => {
            const { activeViewId, views } = slice(campaignId);
            if (activeViewId === REPORT_BASE_VIEW_ID) return s;
            const key = draftKey(campaignId, activeViewId);
            const draft = s.drafts[key];
            if (!draft) return s;
            const { [key]: _removed, ...restDrafts } = s.drafts;
            return {
              byCampaign: {
                ...s.byCampaign,
                [campaignId]: {
                  views: views.map((v) =>
                    v.id === activeViewId ? { ...v, state: draft } : v
                  ),
                  activeViewId,
                },
              },
              drafts: restDrafts,
            };
          }),

        saveDraftAsNewView: (campaignId, name) => {
          const id = crypto.randomUUID();
          const prevActive = slice(campaignId).activeViewId;
          const state = effectiveState(campaignId, prevActive);
          const prevKey = draftKey(campaignId, prevActive);
          set((s) => {
            const { [prevKey]: _removed, ...restDrafts } = s.drafts;
            const prev = slice(campaignId);
            return {
              byCampaign: {
                ...s.byCampaign,
                [campaignId]: {
                  views: [
                    ...prev.views,
                    { id, name: name.trim() || "New view", state },
                  ],
                  activeViewId: id,
                },
              },
              drafts: restDrafts,
            };
          });
          return id;
        },

        discardActiveViewDraft: (campaignId) =>
          set((s) => {
            const key = draftKey(campaignId, slice(campaignId).activeViewId);
            const { [key]: _removed, ...restDrafts } = s.drafts;
            return { drafts: restDrafts };
          }),

        renameView: (campaignId, id, name) => {
          const trimmed = name.trim();
          if (!trimmed) return;
          patchSlice(campaignId, (prev) => ({
            ...prev,
            views: prev.views.map((v) =>
              v.id === id ? { ...v, name: trimmed } : v
            ),
          }));
        },

        deleteView: (campaignId, id) =>
          set((s) => {
            const key = draftKey(campaignId, id);
            const { [key]: _removed, ...restDrafts } = s.drafts;
            const prev = slice(campaignId);
            const wasActive = prev.activeViewId === id;
            return {
              byCampaign: {
                ...s.byCampaign,
                [campaignId]: {
                  views: prev.views.filter((v) => v.id !== id),
                  activeViewId: wasActive
                    ? REPORT_BASE_VIEW_ID
                    : prev.activeViewId,
                },
              },
              drafts: restDrafts,
            };
          }),

        reorderViews: (campaignId, from, to) =>
          patchSlice(campaignId, (prev) => {
            if (
              from < 0 ||
              to < 0 ||
              from >= prev.views.length ||
              to >= prev.views.length ||
              from === to
            )
              return prev;
            const next = [...prev.views];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return { ...prev, views: next };
          }),
      };
    },
    {
      name: "wingify-report-views-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ byCampaign: s.byCampaign }),
    }
  )
);

export function isReportViewDirty(
  draft: ReportViewState,
  saved: ReportViewState
): boolean {
  return JSON.stringify(draft) !== JSON.stringify(saved);
}

function savedStateFor(
  s: ReportViewsState,
  campaignId: string,
  id: string
): ReportViewState {
  if (id === REPORT_BASE_VIEW_ID) return REPORT_BASE_STATE;
  return (
    s.byCampaign[campaignId]?.views.find((v) => v.id === id)?.state ??
    REPORT_BASE_STATE
  );
}

export function useReportCampaignSlice(campaignId: string): CampaignSlice {
  return useReportViewsStore((s) => s.byCampaign[campaignId] ?? EMPTY_SLICE);
}

export function useReportActiveViewState(campaignId: string): ReportViewState {
  return useReportViewsStore((s) => {
    const activeViewId =
      s.byCampaign[campaignId]?.activeViewId ?? REPORT_BASE_VIEW_ID;
    return (
      s.drafts[draftKey(campaignId, activeViewId)] ??
      savedStateFor(s, campaignId, activeViewId)
    );
  });
}

export function useIsReportViewDirty(campaignId: string): boolean {
  return useReportViewsStore((s) => {
    const activeViewId =
      s.byCampaign[campaignId]?.activeViewId ?? REPORT_BASE_VIEW_ID;
    const draft = s.drafts[draftKey(campaignId, activeViewId)];
    if (!draft) return false;
    return isReportViewDirty(
      draft,
      savedStateFor(s, campaignId, activeViewId)
    );
  });
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
