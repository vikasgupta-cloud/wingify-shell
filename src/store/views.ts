import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_VISIBLE, type ColumnId } from "../config/columns";
import type { Filter } from "../config/filters";
import type { GroupField } from "../config/grouping";
import { useTableStore } from "./table";

export type Layout = "table" | "kanban" | "gantt";

export const LAYOUT_LABEL: Record<Layout, string> = {
  table: "Table",
  gantt: "Gantt",
  kanban: "Kanban",
};

export type BoardColumnConfig = { order: string[]; hidden: string[] };

export type ViewState = {
  filters: Filter[];
  sort: { column: ColumnId; dir: "asc" | "desc" } | null;
  groupBy: GroupField | null;
  visibleColumns: ColumnId[];
  // A view's layout is fixed at creation and never changes afterwards. It is
  // therefore NOT part of the dirty check.
  layout: Layout;
  // Keyed by group field so a view's Status board order is independent of its
  // Creator board order.
  boardColumns: Partial<Record<GroupField, BoardColumnConfig>>;
  // Per-view column width overrides (px); a column absent here uses its default.
  columnWidths: Partial<Record<ColumnId, number>>;
};

export type View = { id: string; name: string; state: ViewState };

/** The Overview tab is a fixed lead tab, NOT a view — no state, no layout. */
export const OVERVIEW_ID = "overview";

const SEED_TABLE_ID = "seed-table";
const SEED_GANTT_ID = "seed-gantt";
const SEED_KANBAN_ID = "seed-kanban";

// A view's freshly-initialised state for a given layout: no filters, default
// display for that layout.
function makeState(layout: Layout): ViewState {
  return {
    filters: [],
    sort: null,
    groupBy: null,
    visibleColumns: [...DEFAULT_VISIBLE],
    layout,
    boardColumns: {},
    columnWidths: {},
  };
}

// Fallback used only when an id resolves to nothing (e.g. Overview is active).
export const BASE_STATE: ViewState = makeState("table");

// Three ordinary seeded views, one per layout, present on first load.
function seedViews(): View[] {
  return [
    { id: SEED_TABLE_ID, name: "Table View", state: makeState("table") },
    { id: SEED_GANTT_ID, name: "Gantt View", state: makeState("gantt") },
    { id: SEED_KANBAN_ID, name: "Kanban View", state: makeState("kanban") },
  ];
}

type ViewsState = {
  views: View[];
  /** Ephemeral, unsaved views spawned from "+". In-memory only — never persisted. */
  draftViews: View[];
  /** OVERVIEW_ID, or the id of a saved view or a draft view. */
  activeViewId: string;
  /** Landing view when the listing loads. Always a saved view — never Overview. */
  defaultViewId: string;
  /** In-memory only — never persisted. */
  drafts: Record<string, ViewState>;
  setActiveView: (id: string) => void;
  setDefaultView: (id: string) => void;
  updateActiveViewDraft: (patch: Partial<ViewState>) => void;
  saveDraftToActiveView: () => void;
  saveDraftAsNewView: (name: string) => string;
  discardActiveViewDraft: () => void;
  /** Create a new unsaved draft view locked to `layout` and switch to it. */
  createDraftView: (layout: Layout) => string;
  /**
   * Clone a view's filters/group/sort into a NEW saved view locked to `layout`,
   * reset layout-specific display, auto-name it, and switch to it.
   */
  saveInNewLayout: (sourceId: string, layout: Layout) => string;
  renameView: (id: string, name: string) => void;
  deleteView: (id: string) => void;
  reorderViews: (from: number, to: number) => void;
  resetActiveViewColumns: () => void;
};

export const useViewsStore = create<ViewsState>()(
  persist(
    (set, get) => {
      const findView = (id: string): View | undefined =>
        get().views.find((v) => v.id === id) ??
        get().draftViews.find((v) => v.id === id);

      const savedState = (id: string): ViewState =>
        findView(id)?.state ?? BASE_STATE;

      const effectiveState = (id: string): ViewState =>
        get().drafts[id] ?? savedState(id);

      return {
        views: seedViews(),
        draftViews: [],
        activeViewId: SEED_TABLE_ID,
        defaultViewId: SEED_TABLE_ID,
        drafts: {},

        setActiveView: (id) => {
          set({ activeViewId: id });
          useTableStore.getState().setPage(1);
        },

        setDefaultView: (id) => {
          if (id === OVERVIEW_ID) return; // Overview can never be the default
          if (!get().views.some((v) => v.id === id)) return;
          set({ defaultViewId: id, activeViewId: id });
          useTableStore.getState().setPage(1);
        },

        updateActiveViewDraft: (patch) =>
          set((s) => {
            if (s.activeViewId === OVERVIEW_ID) return s;
            const base = s.drafts[s.activeViewId] ?? savedState(s.activeViewId);
            // Layout is locked per view; never let a patch change it.
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
            // Only saved views can be updated in place.
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
              views: [...s.views, { id, name: name.trim() || "New view", state }],
              draftViews: s.draftViews.filter((v) => v.id !== prevActive),
              activeViewId: id,
              drafts: restDrafts,
            };
          });
          useTableStore.getState().setPage(1);
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
          if (isDraftView) useTableStore.getState().setPage(1);
        },

        createDraftView: (layout) => {
          const id = crypto.randomUUID();
          set((s) => ({
            draftViews: [
              ...s.draftViews,
              { id, name: `${LAYOUT_LABEL[layout]} view`, state: makeState(layout) },
            ],
            activeViewId: id,
          }));
          useTableStore.getState().setPage(1);
          return id;
        },

        saveInNewLayout: (sourceId, layout) => {
          const source = findView(sourceId);
          if (!source) return sourceId;
          const src = effectiveState(sourceId);
          const id = crypto.randomUUID();
          const state: ViewState = {
            ...makeState(layout), // resets column widths / selection / board config
            filters: src.filters.map((f) => ({
              ...f,
              value: Array.isArray(f.value) ? [...f.value] : f.value,
            })),
            sort: src.sort ? { ...src.sort } : null,
            groupBy: src.groupBy,
          };
          const name = `${source.name} — ${LAYOUT_LABEL[layout]}`;
          set((s) => ({
            views: [...s.views, { id, name, state }],
            activeViewId: id,
          }));
          useTableStore.getState().setPage(1);
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
              // Draft views (from "+") are renamed inline before they are saved.
              draftViews: s.draftViews.map((v) =>
                v.id === id ? { ...v, name: trimmed } : v
              ),
            };
          }),

        deleteView: (id) =>
          set((s) => {
            // Delete floor: never fewer than one view (Overview + exactly one).
            if (s.views.length <= 1) return s;
            const idx = s.views.findIndex((v) => v.id === id);
            if (idx === -1) return s;
            const nextViews = s.views.filter((v) => v.id !== id);
            const { [id]: _removed, ...restDrafts } = s.drafts;
            const defaultViewId =
              s.defaultViewId === id ? nextViews[0].id : s.defaultViewId;
            let activeViewId = s.activeViewId;
            if (activeViewId === id) {
              // Switch to an adjacent view (same slot, clamped).
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
          get().updateActiveViewDraft({ visibleColumns: [...DEFAULT_VISIBLE] }),
      };
    },
    {
      name: "wingify-views-v2",
      partialize: (s) => ({
        views: s.views,
        activeViewId: s.activeViewId,
        defaultViewId: s.defaultViewId,
      }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<
          Pick<ViewsState, "views" | "activeViewId" | "defaultViewId">
        >;
        const views =
          Array.isArray(p.views) && p.views.length ? p.views : current.views;
        const isView = (id: string | undefined) =>
          !!id && views.some((v) => v.id === id);
        const defaultViewId = isView(p.defaultViewId)
          ? (p.defaultViewId as string)
          : views[0].id;
        const activeViewId =
          p.activeViewId === OVERVIEW_ID
            ? OVERVIEW_ID
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

const savedStateFor = (s: ViewsState, id: string): ViewState =>
  (s.views.find((v) => v.id === id) ?? s.draftViews.find((v) => v.id === id))
    ?.state ?? BASE_STATE;

// A view is dirty when its draft differs from the saved state. Layout is fixed
// per view, so it never participates (a draft always carries its view's layout).
export function isDirtyIgnoringLayout(draft: ViewState, saved: ViewState): boolean {
  const { layout: _draftLayout, ...draftRest } = draft;
  const { layout: _savedLayout, ...savedRest } = saved;
  return JSON.stringify(draftRest) !== JSON.stringify(savedRest);
}

export function useActiveViewState(): ViewState {
  return useViewsStore(
    (s) => s.drafts[s.activeViewId] ?? savedStateFor(s, s.activeViewId)
  );
}

export function useIsActiveViewDirty(): boolean {
  return useViewsStore((s) => {
    const draft = s.drafts[s.activeViewId];
    if (!draft) return false;
    return isDirtyIgnoringLayout(draft, savedStateFor(s, s.activeViewId));
  });
}

/** True when the active tab is an unsaved draft view spawned from "+". */
export function useIsActiveViewUnsaved(): boolean {
  return useViewsStore((s) => s.draftViews.some((v) => v.id === s.activeViewId));
}
