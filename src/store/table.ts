import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GanttZoom = "day" | "week" | "month";
export type RowDensity = "compact" | "default" | "comfortable";

type TableState = {
  search: string;
  pageSize: number;
  page: number;
  ganttZoom: GanttZoom;
  rowDensity: RowDensity;
  // A monotonically-increasing signal: bumping it asks the mounted GanttChart to
  // re-centre on today. Lets the "Today" control live in the top toolbar (outside
  // the Gantt) without threading the chart's scroll ref up. NOT persisted.
  ganttTodayTick: number;
  setSearch: (s: string) => void;
  setPageSize: (n: number) => void;
  setPage: (n: number) => void;
  setGanttZoom: (z: GanttZoom) => void;
  setRowDensity: (d: RowDensity) => void;
  pingGanttToday: () => void;
};

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      search: "",
      pageSize: 10,
      page: 1,
      // Global display preferences — deliberately NOT part of ViewState, so
      // changing them never marks the active view dirty.
      ganttZoom: "month",
      rowDensity: "default",
      ganttTodayTick: 0,
      setSearch: (search) => set({ search, page: 1 }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setPage: (page) => set({ page }),
      setGanttZoom: (ganttZoom) => set({ ganttZoom }),
      setRowDensity: (rowDensity) => set({ rowDensity }),
      pingGanttToday: () => set((s) => ({ ganttTodayTick: s.ganttTodayTick + 1 })),
    }),
    {
      name: "wingify-table-v2",
      // v1: the Gantt default moved from "week" to "month". Sessions persisted at v0
      // hold the old default, so adopt the new one once on upgrade.
      version: 1,
      migrate: (state, version) => {
        const s = state as Partial<TableState>;
        if (version < 1) return { ...s, ganttZoom: "month" as GanttZoom };
        return s;
      },
      partialize: (s) => ({
        pageSize: s.pageSize,
        ganttZoom: s.ganttZoom,
        rowDensity: s.rowDensity,
      }),
    }
  )
);
