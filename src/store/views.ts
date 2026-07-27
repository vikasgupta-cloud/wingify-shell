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
  // Per-view column width overrides (px); a column absent here uses its default.
  columnWidths: Partial<Record<ColumnId, number>>;
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
  columnWidths: {},
};

type ViewsState = {
  views: View[];
  activeViewId: string;
  /** View opened when the listing loads. */
  defaultViewId: string;
  /** In-memory only — never persisted. */
  drafts: Record<string, ViewState>;
  setActiveView: (id: string) => void;
  setDefaultView: (id: string) => void;
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
        defaultViewId: BASE_VIEW_ID,
        drafts: {},

        setActiveView: (id) => {
          set({ activeViewId: id });
          useTableStore.getState().setPage(1);
        },

        setDefaultView: (id) => {
          const exists =
            id === BASE_VIEW_ID || get().views.some((v) => v.id === id);
          if (!exists) return;
          set({ defaultViewId: id, activeViewId: id });
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
              views: [
                ...s.views,
                { id, name: name.trim() || "New saved filter", state },
              ],
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
            const wasDefault = s.defaultViewId === id;
            return {
              views: s.views.filter((v) => v.id !== id),
              drafts: restDrafts,
              activeViewId: wasActive ? BASE_VIEW_ID : s.activeViewId,
              defaultViewId: wasDefault ? BASE_VIEW_ID : s.defaultViewId,
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
        const views = Array.isArray(p.views) ? p.views : current.views;
        const resolveId = (id: string | undefined) => {
          if (!id) return BASE_VIEW_ID;
          if (id === BASE_VIEW_ID) return BASE_VIEW_ID;
          return views.some((v) => v.id === id) ? id : BASE_VIEW_ID;
        };
        const defaultViewId = resolveId(p.defaultViewId ?? p.activeViewId);
        const activeViewId = resolveId(p.activeViewId ?? defaultViewId);
        return {
          ...current,
          views,
          defaultViewId,
          activeViewId,
        };
      },
    }
  )
);

const savedStateFor = (s: ViewsState, id: string): ViewState =>
  id === BASE_VIEW_ID
    ? BASE_STATE
    : s.views.find((v) => v.id === id)?.state ?? BASE_STATE;

// A view is dirty when its draft differs from the saved state on any key EXCEPT
// `layout`. Switching Table/Kanban/Gantt still writes layout into the draft and
// still saves with the view, but must never on its own show Discard / Save view.
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
