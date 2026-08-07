import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FLAG_REPORT_CONFIG,
  type FlagReportColumnId,
  type FlagReportFilter,
  type FlagReportKind,
} from "../config/flagReports";
import { getFlagReportTableStore } from "./flagReportTable";

export type FlagReportLayout = "table" | "card";

export const FLAG_REPORT_LAYOUT_LABEL: Record<FlagReportLayout, string> = {
  table: "Table",
  card: "Card",
};

export type FlagReportViewState = {
  filters: FlagReportFilter[];
  sort: { column: FlagReportColumnId; dir: "asc" | "desc" } | null;
  visibleColumns: FlagReportColumnId[];
  layout: FlagReportLayout;
  columnWidths: Partial<Record<FlagReportColumnId, number>>;
};

export type FlagReportView = {
  id: string;
  name: string;
  state: FlagReportViewState;
};

export const FLAG_REPORT_OVERVIEW_ID = "flag-report-overview";

type FlagReportViewsState = {
  views: FlagReportView[];
  draftViews: FlagReportView[];
  activeViewId: string;
  defaultViewId: string;
  drafts: Record<string, FlagReportViewState>;
  setActiveView: (id: string) => void;
  setDefaultView: (id: string) => void;
  updateActiveViewDraft: (patch: Partial<FlagReportViewState>) => void;
  saveDraftToActiveView: () => void;
  saveDraftAsNewView: (name: string) => string;
  discardActiveViewDraft: () => void;
  createDraftView: (layout: FlagReportLayout) => string;
  saveInNewLayout: (sourceId: string, layout: FlagReportLayout) => string;
  renameView: (id: string, name: string) => void;
  deleteView: (id: string) => void;
  reorderViews: (from: number, to: number) => void;
  resetActiveViewColumns: () => void;
};

const viewsStores = new Map<
  FlagReportKind,
  ReturnType<typeof createFlagReportViewsStore>
>();

function createFlagReportViewsStore(kind: FlagReportKind) {
  const defaults = [...FLAG_REPORT_CONFIG[kind].defaultVisible];
  const seedTable = `${kind}-seed-table`;
  const seedCard = `${kind}-seed-card`;

  const makeState = (layout: FlagReportLayout): FlagReportViewState => ({
    filters: [],
    sort: null,
    visibleColumns: [...defaults],
    layout,
    columnWidths: {},
  });

  const baseState = makeState("table");

  const seedViews = (): FlagReportView[] => [
    { id: seedTable, name: "Table View", state: makeState("table") },
    { id: seedCard, name: "Card View", state: makeState("card") },
  ];

  const tableStore = getFlagReportTableStore(kind);

  return create<FlagReportViewsState>()(
    persist(
      (set, get) => {
        const findView = (id: string) =>
          get().views.find((v) => v.id === id) ??
          get().draftViews.find((v) => v.id === id);

        const savedState = (id: string) => findView(id)?.state ?? baseState;
        const effectiveState = (id: string) =>
          get().drafts[id] ?? savedState(id);

        return {
          views: seedViews(),
          draftViews: [],
          activeViewId: seedTable,
          defaultViewId: seedTable,
          drafts: {},

          setActiveView: (id) => {
            set({ activeViewId: id });
            tableStore.getState().setPage(1);
          },

          setDefaultView: (id) => {
            if (id === FLAG_REPORT_OVERVIEW_ID) return;
            if (!get().views.some((v) => v.id === id)) return;
            set({ defaultViewId: id, activeViewId: id });
            tableStore.getState().setPage(1);
          },

          updateActiveViewDraft: (patch) =>
            set((s) => {
              if (s.activeViewId === FLAG_REPORT_OVERVIEW_ID) return s;
              const base = s.drafts[s.activeViewId] ?? savedState(s.activeViewId);
              const { layout: _l, ...safePatch } = patch;
              return {
                drafts: {
                  ...s.drafts,
                  [s.activeViewId]: { ...base, ...safePatch },
                },
              };
            }),

          saveDraftToActiveView: () =>
            set((s) => {
              const id = s.activeViewId;
              const draft = s.drafts[id];
              if (!draft || !s.views.some((v) => v.id === id)) return s;
              const { [id]: _, ...restDrafts } = s.drafts;
              return {
                views: s.views.map((v) =>
                  v.id === id ? { ...v, state: draft } : v
                ),
                drafts: restDrafts,
              };
            }),

          saveDraftAsNewView: (name) => {
            const id = crypto.randomUUID();
            const prevActive = get().activeViewId;
            const state = effectiveState(prevActive);
            set((s) => {
              const { [prevActive]: _, ...restDrafts } = s.drafts;
              return {
                views: [
                  ...s.views,
                  { id, name: name.trim() || "New view", state },
                ],
                draftViews: s.draftViews.filter((v) => v.id !== prevActive),
                activeViewId: id,
                drafts: restDrafts,
              };
            });
            tableStore.getState().setPage(1);
            return id;
          },

          discardActiveViewDraft: () => {
            const id = get().activeViewId;
            const isDraftView = get().draftViews.some((v) => v.id === id);
            set((s) => {
              const { [id]: _, ...restDrafts } = s.drafts;
              if (isDraftView) {
                return {
                  draftViews: s.draftViews.filter((v) => v.id !== id),
                  drafts: restDrafts,
                  activeViewId: s.defaultViewId,
                };
              }
              return { drafts: restDrafts };
            });
            if (isDraftView) tableStore.getState().setPage(1);
          },

          createDraftView: (layout) => {
            const id = crypto.randomUUID();
            set((s) => ({
              draftViews: [
                ...s.draftViews,
                {
                  id,
                  name: `${FLAG_REPORT_LAYOUT_LABEL[layout]} view`,
                  state: makeState(layout),
                },
              ],
              activeViewId: id,
            }));
            tableStore.getState().setPage(1);
            return id;
          },

          saveInNewLayout: (sourceId, layout) => {
            const source = findView(sourceId);
            if (!source) return sourceId;
            const src = effectiveState(sourceId);
            const id = crypto.randomUUID();
            const state: FlagReportViewState = {
              ...makeState(layout),
              filters: src.filters.map((f) => ({
                ...f,
                value: Array.isArray(f.value) ? [...f.value] : f.value,
              })),
              sort: src.sort ? { ...src.sort } : null,
            };
            const name = `${source.name} — ${FLAG_REPORT_LAYOUT_LABEL[layout]}`;
            set((s) => ({
              views: [...s.views, { id, name, state }],
              activeViewId: id,
            }));
            tableStore.getState().setPage(1);
            return id;
          },

          renameView: (id, name) =>
            set((s) => {
              const trimmed = name.trim();
              if (!trimmed) return s;
              return {
                views: s.views.map((v) =>
                  v.id === id ? { ...v, name: trimmed } : v
                ),
                draftViews: s.draftViews.map((v) =>
                  v.id === id ? { ...v, name: trimmed } : v
                ),
              };
            }),

          deleteView: (id) =>
            set((s) => {
              if (s.views.length <= 1) return s;
              const idx = s.views.findIndex((v) => v.id === id);
              if (idx === -1) return s;
              const nextViews = s.views.filter((v) => v.id !== id);
              const { [id]: _, ...restDrafts } = s.drafts;
              const defaultViewId =
                s.defaultViewId === id ? nextViews[0].id : s.defaultViewId;
              let activeViewId = s.activeViewId;
              if (activeViewId === id) {
                activeViewId =
                  nextViews[Math.min(idx, nextViews.length - 1)].id;
              }
              return {
                views: nextViews,
                drafts: restDrafts,
                defaultViewId,
                activeViewId,
              };
            }),

          reorderViews: (from, to) =>
            set((s) => {
              if (
                from < 0 ||
                to < 0 ||
                from >= s.views.length ||
                to >= s.views.length ||
                from === to
              )
                return s;
              const next = [...s.views];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
              return { views: next };
            }),

          resetActiveViewColumns: () =>
            get().updateActiveViewDraft({
              visibleColumns: [...defaults],
            }),
        };
      },
      {
        name: `wingify-flag-report-views-${kind}-v1`,
        partialize: (s) => ({
          views: s.views,
          activeViewId: s.activeViewId,
          defaultViewId: s.defaultViewId,
        }),
        merge: (persisted, current) => {
          if (!persisted || typeof persisted !== "object") return current;
          const p = persisted as Partial<
            Pick<
              FlagReportViewsState,
              "views" | "activeViewId" | "defaultViewId"
            >
          >;
          const views =
            Array.isArray(p.views) && p.views.length ? p.views : current.views;
          const isView = (id: string | undefined) =>
            !!id && views.some((v) => v.id === id);
          const defaultViewId = isView(p.defaultViewId)
            ? (p.defaultViewId as string)
            : views[0].id;
          const activeViewId =
            p.activeViewId === FLAG_REPORT_OVERVIEW_ID
              ? FLAG_REPORT_OVERVIEW_ID
              : isView(p.activeViewId)
                ? (p.activeViewId as string)
                : defaultViewId;
          return {
            ...current,
            views,
            draftViews: [],
            defaultViewId,
            activeViewId,
          };
        },
      }
    )
  );
}

export function getFlagReportViewsStore(kind: FlagReportKind) {
  let store = viewsStores.get(kind);
  if (!store) {
    store = createFlagReportViewsStore(kind);
    viewsStores.set(kind, store);
  }
  return store;
}

export function isFlagReportDirtyIgnoringLayout(
  draft: FlagReportViewState,
  saved: FlagReportViewState
): boolean {
  const { layout: _d, ...draftRest } = draft;
  const { layout: _s, ...savedRest } = saved;
  return JSON.stringify(draftRest) !== JSON.stringify(savedRest);
}

export function useActiveFlagReportViewState(kind: FlagReportKind) {
  const store = getFlagReportViewsStore(kind);
  return store((s) => {
    const saved =
      (s.views.find((v) => v.id === s.activeViewId) ??
        s.draftViews.find((v) => v.id === s.activeViewId))?.state ??
      ({
        filters: [],
        sort: null,
        visibleColumns: [...FLAG_REPORT_CONFIG[kind].defaultVisible],
        layout: "table" as const,
        columnWidths: {},
      } satisfies FlagReportViewState);
    return s.drafts[s.activeViewId] ?? saved;
  });
}

export function useIsActiveFlagReportViewDirty(kind: FlagReportKind) {
  const store = getFlagReportViewsStore(kind);
  return store((s) => {
    const draft = s.drafts[s.activeViewId];
    if (!draft) return false;
    const saved =
      (s.views.find((v) => v.id === s.activeViewId) ??
        s.draftViews.find((v) => v.id === s.activeViewId))?.state;
    if (!saved) return true;
    return isFlagReportDirtyIgnoringLayout(draft, saved);
  });
}

export function useIsActiveFlagReportViewUnsaved(kind: FlagReportKind) {
  const store = getFlagReportViewsStore(kind);
  return store((s) => s.draftViews.some((v) => v.id === s.activeViewId));
}
