import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SURVEY_DEFAULT_VISIBLE,
  type SurveyColumnId,
} from "../config/surveyColumns";
import type { SurveyFilter } from "../config/surveyFilters";
import { useSurveyTableStore } from "./surveyTable";

export type SurveyLayout = "table" | "card";

export const SURVEY_LAYOUT_LABEL: Record<SurveyLayout, string> = {
  table: "Table",
  card: "Card",
};

export type SurveyViewState = {
  filters: SurveyFilter[];
  sort: { column: SurveyColumnId; dir: "asc" | "desc" } | null;
  visibleColumns: SurveyColumnId[];
  layout: SurveyLayout;
  columnWidths: Partial<Record<SurveyColumnId, number>>;
};

export type SurveyView = { id: string; name: string; state: SurveyViewState };

export const SURVEY_OVERVIEW_ID = "survey-overview";

const SEED_TABLE_ID = "survey-seed-table";
const SEED_CARD_ID = "survey-seed-card";

function makeState(layout: SurveyLayout): SurveyViewState {
  return {
    filters: [],
    sort: null,
    visibleColumns: [...SURVEY_DEFAULT_VISIBLE],
    layout,
    columnWidths: {},
  };
}

export const SURVEY_BASE_STATE: SurveyViewState = makeState("table");

function seedViews(): SurveyView[] {
  return [
    { id: SEED_TABLE_ID, name: "Table View", state: makeState("table") },
    { id: SEED_CARD_ID, name: "Card View", state: makeState("card") },
  ];
}

type SurveyViewsState = {
  views: SurveyView[];
  draftViews: SurveyView[];
  activeViewId: string;
  defaultViewId: string;
  drafts: Record<string, SurveyViewState>;
  setActiveView: (id: string) => void;
  setDefaultView: (id: string) => void;
  updateActiveViewDraft: (patch: Partial<SurveyViewState>) => void;
  saveDraftToActiveView: () => void;
  saveDraftAsNewView: (name: string) => string;
  discardActiveViewDraft: () => void;
  createDraftView: (layout: SurveyLayout) => string;
  saveInNewLayout: (sourceId: string, layout: SurveyLayout) => string;
  renameView: (id: string, name: string) => void;
  deleteView: (id: string) => void;
  reorderViews: (from: number, to: number) => void;
  resetActiveViewColumns: () => void;
};

export const useSurveyViewsStore = create<SurveyViewsState>()(
  persist(
    (set, get) => {
      const findView = (id: string): SurveyView | undefined =>
        get().views.find((v) => v.id === id) ??
        get().draftViews.find((v) => v.id === id);

      const savedState = (id: string): SurveyViewState =>
        findView(id)?.state ?? SURVEY_BASE_STATE;

      const effectiveState = (id: string): SurveyViewState =>
        get().drafts[id] ?? savedState(id);

      return {
        views: seedViews(),
        draftViews: [],
        activeViewId: SEED_TABLE_ID,
        defaultViewId: SEED_TABLE_ID,
        drafts: {},

        setActiveView: (id) => {
          set({ activeViewId: id });
          useSurveyTableStore.getState().setPage(1);
        },

        setDefaultView: (id) => {
          if (id === SURVEY_OVERVIEW_ID) return;
          if (!get().views.some((v) => v.id === id)) return;
          set({ defaultViewId: id, activeViewId: id });
          useSurveyTableStore.getState().setPage(1);
        },

        updateActiveViewDraft: (patch) =>
          set((s) => {
            if (s.activeViewId === SURVEY_OVERVIEW_ID) return s;
            const base = s.drafts[s.activeViewId] ?? savedState(s.activeViewId);
            const { layout: _lockedLayout, ...safePatch } = patch;
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
            const { [id]: _removed, ...restDrafts } = s.drafts;
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
            const { [prevActive]: _removed, ...restDrafts } = s.drafts;
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
          useSurveyTableStore.getState().setPage(1);
          return id;
        },

        discardActiveViewDraft: () => {
          const id = get().activeViewId;
          const isDraftView = get().draftViews.some((v) => v.id === id);
          set((s) => {
            const { [id]: _removed, ...restDrafts } = s.drafts;
            if (isDraftView) {
              return {
                draftViews: s.draftViews.filter((v) => v.id !== id),
                drafts: restDrafts,
                activeViewId: s.defaultViewId,
              };
            }
            return { drafts: restDrafts };
          });
          if (isDraftView) useSurveyTableStore.getState().setPage(1);
        },

        createDraftView: (layout) => {
          const id = crypto.randomUUID();
          set((s) => ({
            draftViews: [
              ...s.draftViews,
              {
                id,
                name: `${SURVEY_LAYOUT_LABEL[layout]} view`,
                state: makeState(layout),
              },
            ],
            activeViewId: id,
          }));
          useSurveyTableStore.getState().setPage(1);
          return id;
        },

        saveInNewLayout: (sourceId, layout) => {
          const source = findView(sourceId);
          if (!source) return sourceId;
          const src = effectiveState(sourceId);
          const id = crypto.randomUUID();
          const state: SurveyViewState = {
            ...makeState(layout),
            filters: src.filters.map((f) => ({
              ...f,
              value: Array.isArray(f.value) ? [...f.value] : f.value,
            })),
            sort: src.sort ? { ...src.sort } : null,
          };
          const name = `${source.name} — ${SURVEY_LAYOUT_LABEL[layout]}`;
          set((s) => ({
            views: [...s.views, { id, name, state }],
            activeViewId: id,
          }));
          useSurveyTableStore.getState().setPage(1);
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
            const { [id]: _removed, ...restDrafts } = s.drafts;
            const defaultViewId =
              s.defaultViewId === id ? nextViews[0].id : s.defaultViewId;
            let activeViewId = s.activeViewId;
            if (activeViewId === id) {
              activeViewId = nextViews[Math.min(idx, nextViews.length - 1)].id;
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
            visibleColumns: [...SURVEY_DEFAULT_VISIBLE],
          }),
      };
    },
    {
      name: "wingify-survey-views-v1",
      partialize: (s) => ({
        views: s.views,
        activeViewId: s.activeViewId,
        defaultViewId: s.defaultViewId,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<
          Pick<SurveyViewsState, "views" | "activeViewId" | "defaultViewId">
        >;
        const views =
          Array.isArray(p.views) && p.views.length ? p.views : current.views;
        const isView = (id: string | undefined) =>
          !!id && views.some((v) => v.id === id);
        const defaultViewId = isView(p.defaultViewId)
          ? (p.defaultViewId as string)
          : views[0].id;
        const activeViewId =
          p.activeViewId === SURVEY_OVERVIEW_ID
            ? SURVEY_OVERVIEW_ID
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

const savedStateFor = (s: SurveyViewsState, id: string): SurveyViewState =>
  (s.views.find((v) => v.id === id) ?? s.draftViews.find((v) => v.id === id))
    ?.state ?? SURVEY_BASE_STATE;

export function isSurveyDirtyIgnoringLayout(
  draft: SurveyViewState,
  saved: SurveyViewState
): boolean {
  const { layout: _d, ...draftRest } = draft;
  const { layout: _s, ...savedRest } = saved;
  return JSON.stringify(draftRest) !== JSON.stringify(savedRest);
}

export function useActiveSurveyViewState(): SurveyViewState {
  return useSurveyViewsStore(
    (s) => s.drafts[s.activeViewId] ?? savedStateFor(s, s.activeViewId)
  );
}

export function useIsActiveSurveyViewDirty(): boolean {
  return useSurveyViewsStore((s) => {
    const draft = s.drafts[s.activeViewId];
    if (!draft) return false;
    return isSurveyDirtyIgnoringLayout(draft, savedStateFor(s, s.activeViewId));
  });
}

export function useIsActiveSurveyViewUnsaved(): boolean {
  return useSurveyViewsStore((s) =>
    s.draftViews.some((v) => v.id === s.activeViewId)
  );
}
