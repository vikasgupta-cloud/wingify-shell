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
  setSearch: (s: string) => void;
  setPageSize: (n: number) => void;
  setPage: (n: number) => void;
  setGanttZoom: (z: GanttZoom) => void;
  setRowDensity: (d: RowDensity) => void;
};

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      search: "",
      pageSize: 10,
      page: 1,
      // Global display preferences — deliberately NOT part of ViewState, so
      // changing them never marks the active view dirty.
      ganttZoom: "week",
      rowDensity: "default",
      setSearch: (search) => set({ search, page: 1 }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setPage: (page) => set({ page }),
      setGanttZoom: (ganttZoom) => set({ ganttZoom }),
      setRowDensity: (rowDensity) => set({ rowDensity }),
    }),
    {
      name: "wingify-table-v2",
      partialize: (s) => ({
        pageSize: s.pageSize,
        ganttZoom: s.ganttZoom,
        rowDensity: s.rowDensity,
      }),
    }
  )
);
