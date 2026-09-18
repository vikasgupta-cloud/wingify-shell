import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CONCEPT_TEST_DEFAULT_VISIBLE,
  type ConceptTestColumnId,
} from "../config/conceptTestColumns";
import type { ConceptTestFilter } from "../config/conceptTestFilters";
import { useConceptTestTableStore } from "./conceptTestTable";

export type ConceptTestLayout = "table" | "card";

export const CONCEPT_TEST_LAYOUT_LABEL: Record<ConceptTestLayout, string> = {
  table: "Table",
  card: "Card",
};

export type ConceptTestViewState = {
  filters: ConceptTestFilter[];
  sort: { column: ConceptTestColumnId; dir: "asc" | "desc" } | null;
  visibleColumns: ConceptTestColumnId[];
  layout: ConceptTestLayout;
  columnWidths: Partial<Record<ConceptTestColumnId, number>>;
};

export type ConceptTestView = { id: string; name: string; state: ConceptTestViewState };

export const CONCEPT_TEST_OVERVIEW_ID = "concept-test-overview";

const SEED_TABLE_ID = "concept-test-seed-table";
const SEED_CARD_ID = "concept-test-seed-card";

function makeState(layout: ConceptTestLayout): ConceptTestViewState {
  return {
    // Screenshot: Status / Created date range as dashed quick filters (not pre-applied).
    filters: [],
    sort: null,
    visibleColumns: [...CONCEPT_TEST_DEFAULT_VISIBLE],
    layout,
    columnWidths: {},
  };
}

export const CONCEPT_TEST_BASE_STATE: ConceptTestViewState = makeState("table");

function seedViews(): ConceptTestView[] {
  return [
    { id: SEED_TABLE_ID, name: "Table View", state: makeState("table") },
    { id: SEED_CARD_ID, name: "Card View", state: makeState("card") },
  ];
}

type ConceptTestViewsState = {
  views: ConceptTestView[];
  draftViews: ConceptTestView[];
  activeViewId: string;
  defaultViewId: string;
  drafts: Record<string, ConceptTestViewState>;
  setActiveView: (id: string) => void;
  setDefaultView: (id: string) => void;
  updateActiveViewDraft: (patch: Partial<ConceptTestViewState>) => void;
  saveDraftToActiveView: () => void;
  saveDraftAsNewView: (name: string) => string;
  discardActiveViewDraft: () => void;
  createDraftView: (layout: ConceptTestLayout) => string;
  saveInNewLayout: (sourceId: string, layout: ConceptTestLayout) => string;
  renameView: (id: string, name: string) => void;
  deleteView: (id: string) => void;
  reorderViews: (from: number, to: number) => void;
  resetActiveViewColumns: () => void;
};

export const useConceptTestViewsStore = create<ConceptTestViewsState>()(
  persist(
    (set, get) => {
      const findView = (id: string): ConceptTestView | undefined =>
        get().views.find((v) => v.id === id) ??
        get().draftViews.find((v) => v.id === id);

      const savedState = (id: string): ConceptTestViewState =>
        findView(id)?.state ?? CONCEPT_TEST_BASE_STATE;

      const effectiveState = (id: string): ConceptTestViewState =>
        get().drafts[id] ?? savedState(id);

      return {
        views: seedViews(),
        draftViews: [],
        activeViewId: SEED_TABLE_ID,
        defaultViewId: SEED_TABLE_ID,
        drafts: {},

        setActiveView: (id) => {
          set({ activeViewId: id });
          useConceptTestTableStore.getState().setPage(1);
        },

        setDefaultView: (id) => {
          if (id === CONCEPT_TEST_OVERVIEW_ID) return;
          if (!get().views.some((v) => v.id === id)) return;
          set({ defaultViewId: id, activeViewId: id });
          useConceptTestTableStore.getState().setPage(1);
        },

        updateActiveViewDraft: (patch) =>
          set((s) => {
            if (s.activeViewId === CONCEPT_TEST_OVERVIEW_ID) return s;
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
          useConceptTestTableStore.getState().setPage(1);
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
          if (isDraftView) useConceptTestTableStore.getState().setPage(1);
        },

        createDraftView: (layout) => {
          const id = crypto.randomUUID();
          set((s) => ({
            draftViews: [
              ...s.draftViews,
              {
                id,
                name: `${CONCEPT_TEST_LAYOUT_LABEL[layout]} view`,
                state: makeState(layout),
              },
            ],
            activeViewId: id,
          }));
          useConceptTestTableStore.getState().setPage(1);
          return id;
        },

        saveInNewLayout: (sourceId, layout) => {
          const source = findView(sourceId);
          if (!source) return sourceId;
          const src = effectiveState(sourceId);
          const id = crypto.randomUUID();
          const state: ConceptTestViewState = {
            ...makeState(layout),
            filters: src.filters.map((f) => ({
              ...f,
              value: Array.isArray(f.value) ? [...f.value] : f.value,
            })),
            sort: src.sort ? { ...src.sort } : null,
          };
          const name = `${source.name} — ${CONCEPT_TEST_LAYOUT_LABEL[layout]}`;
          set((s) => ({
            views: [...s.views, { id, name, state }],
            activeViewId: id,
          }));
          useConceptTestTableStore.getState().setPage(1);
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
            visibleColumns: [...CONCEPT_TEST_DEFAULT_VISIBLE],
          }),
      };
    },
    {
      name: "wingify-concept-test-views-v1",
      partialize: (s) => ({
        views: s.views,
        activeViewId: s.activeViewId,
        defaultViewId: s.defaultViewId,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<
          Pick<ConceptTestViewsState, "views" | "activeViewId" | "defaultViewId">
        >;
        const views =
          Array.isArray(p.views) && p.views.length ? p.views : current.views;
        const isView = (id: string | undefined) =>
          !!id && views.some((v) => v.id === id);
        const defaultViewId = isView(p.defaultViewId)
          ? (p.defaultViewId as string)
          : views[0].id;
        const activeViewId =
          p.activeViewId === CONCEPT_TEST_OVERVIEW_ID
            ? CONCEPT_TEST_OVERVIEW_ID
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

const savedStateFor = (s: ConceptTestViewsState, id: string): ConceptTestViewState =>
  (s.views.find((v) => v.id === id) ?? s.draftViews.find((v) => v.id === id))
    ?.state ?? CONCEPT_TEST_BASE_STATE;

export function isConceptTestDirtyIgnoringLayout(
  draft: ConceptTestViewState,
  saved: ConceptTestViewState
): boolean {
  const { layout: _d, ...draftRest } = draft;
  const { layout: _s, ...savedRest } = saved;
  return JSON.stringify(draftRest) !== JSON.stringify(savedRest);
}

export function useActiveConceptTestViewState(): ConceptTestViewState {
  return useConceptTestViewsStore(
    (s) => s.drafts[s.activeViewId] ?? savedStateFor(s, s.activeViewId)
  );
}

export function useIsActiveConceptTestViewDirty(): boolean {
  return useConceptTestViewsStore((s) => {
    const draft = s.drafts[s.activeViewId];
    if (!draft) return false;
    return isConceptTestDirtyIgnoringLayout(draft, savedStateFor(s, s.activeViewId));
  });
}

export function useIsActiveConceptTestViewUnsaved(): boolean {
  return useConceptTestViewsStore((s) =>
    s.draftViews.some((v) => v.id === s.activeViewId)
  );
}
