import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_VISIBLE, type ColumnId } from "../config/columns";
import type { Filter } from "../config/filters";
import type { GroupField } from "../config/grouping";
import { useTableStore } from "./table";

export type Layout = "table" | "kanban" | "gantt";

export type BoardColumnConfig = { order: string[]; hidden: string[] };

export type ViewState = {
  filters: Filter[];
  sort: { column: ColumnId; dir: "asc" | "desc" } | null;
  groupBy: GroupField | null;
  visibleColumns: ColumnId[];
  layout: Layout;
  // Keyed by group field so a view's Status board order is independent of its
  // Creator board order.
  boardColumns: Partial<Record<GroupField, BoardColumnConfig>>;
};

export type View = { id: string; name: string; state: ViewState };

export const BASE_VIEW_ID = "all";
export const BASE_STATE: ViewState = {
  filters: [],
  sort: null,
  groupBy: null,
  visibleColumns: [...DEFAULT_VISIBLE],
  layout: "table",
  boardColumns: {},
};

type ViewsState = {
  views: View[];
  activeViewId: string;
  /** In-memory only — never persisted. */
  drafts: Record<string, ViewState>;
  setActiveView: (id: string) => void;
  updateActiveViewDraft: (patch: Partial<ViewState>) => void;
  saveDraftToActiveView: () => void;
  saveDraftAsNewView: (name: string) => string;
  discardActiveViewDraft: () => void;
  renameView: (id: string, name: string) => void;
  deleteView: (id: string) => void;
  reorderViews: (from: number, to: number) => void;
  resetActiveViewColumns: () => void;
};

export const useViewsStore = create<ViewsState>()(
  persist(
    (set, get) => {
      const savedState = (id: string): ViewState =>
        id === BASE_VIEW_ID
          ? BASE_STATE
          : get().views.find((v) => v.id === id)?.state ?? BASE_STATE;

      const effectiveState = (id: string): ViewState =>
        get().drafts[id] ?? savedState(id);

      return {
        views: [],
        activeViewId: BASE_VIEW_ID,
        drafts: {},

        setActiveView: (id) => {
          set({ activeViewId: id });
          useTableStore.getState().setPage(1);
        },

        updateActiveViewDraft: (patch) =>
          set((s) => {
            const base = s.drafts[s.activeViewId] ?? savedState(s.activeViewId);
            return {
              drafts: {
                ...s.drafts,
                [s.activeViewId]: { ...base, ...patch },
              },
            };
          }),

        saveDraftToActiveView: () =>
          set((s) => {
            const id = s.activeViewId;
            if (id === BASE_VIEW_ID) return s;
            const draft = s.drafts[id];
            if (!draft) return s;
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
              activeViewId: id,
              drafts: restDrafts,
            };
          });
          useTableStore.getState().setPage(1);
          return id;
        },

        discardActiveViewDraft: () =>
          set((s) => {
            const { [s.activeViewId]: _removed, ...restDrafts } = s.drafts;
            return { drafts: restDrafts };
          }),

        renameView: (id, name) =>
          set((s) => {
            const trimmed = name.trim();
            if (!trimmed) return s;
            return {
              views: s.views.map((v) =>
                v.id === id ? { ...v, name: trimmed } : v
              ),
            };
          }),

        deleteView: (id) =>
          set((s) => {
            const { [id]: _removed, ...restDrafts } = s.drafts;
            const wasActive = s.activeViewId === id;
            return {
              views: s.views.filter((v) => v.id !== id),
              drafts: restDrafts,
              activeViewId: wasActive ? BASE_VIEW_ID : s.activeViewId,
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
      name: "wingify-views-v1",
      partialize: (s) => ({ views: s.views, activeViewId: s.activeViewId }),
    }
  )
);

const savedStateFor = (s: ViewsState, id: string): ViewState =>
  id === BASE_VIEW_ID
    ? BASE_STATE
    : s.views.find((v) => v.id === id)?.state ?? BASE_STATE;

export function useActiveViewState(): ViewState {
  return useViewsStore(
    (s) => s.drafts[s.activeViewId] ?? savedStateFor(s, s.activeViewId)
  );
}

export function useIsActiveViewDirty(): boolean {
  return useViewsStore((s) => {
    const draft = s.drafts[s.activeViewId];
    if (!draft) return false;
    return JSON.stringify(draft) !== JSON.stringify(savedStateFor(s, s.activeViewId));
  });
}
