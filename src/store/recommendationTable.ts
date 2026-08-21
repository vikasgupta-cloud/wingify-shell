import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RECOMMENDATION_DEFAULT_VISIBLE,
  type RecommendationColumnId,
} from "../config/recommendationColumns";
import type {
  RecommendationFilter,
  RecommendationGroupField,
} from "../config/recommendationFilters";

export type RecommendationRowDensity = "compact" | "default" | "comfortable";

type RecommendationTableState = {
  search: string;
  pageSize: number;
  page: number;
  rowDensity: RecommendationRowDensity;
  filters: RecommendationFilter[];
  groupBy: RecommendationGroupField;
  sort: { column: RecommendationColumnId; dir: "asc" | "desc" } | null;
  visibleColumns: RecommendationColumnId[];
  columnWidths: Partial<Record<RecommendationColumnId, number>>;
  setSearch: (s: string) => void;
  setPageSize: (n: number) => void;
  setPage: (n: number) => void;
  setRowDensity: (d: RecommendationRowDensity) => void;
  setFilters: (filters: RecommendationFilter[]) => void;
  setGroupBy: (groupBy: RecommendationGroupField) => void;
  setSort: (
    sort: { column: RecommendationColumnId; dir: "asc" | "desc" } | null
  ) => void;
  setVisibleColumns: (cols: RecommendationColumnId[]) => void;
  setColumnWidth: (id: RecommendationColumnId, width: number) => void;
  resetColumns: () => void;
};

export const useRecommendationTableStore = create<RecommendationTableState>()(
  persist(
    (set) => ({
      search: "",
      pageSize: 10,
      page: 1,
      rowDensity: "default",
      filters: [],
      groupBy: "none",
      sort: null,
      visibleColumns: [...RECOMMENDATION_DEFAULT_VISIBLE],
      columnWidths: {},
      setSearch: (search) => set({ search, page: 1 }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setPage: (page) => set({ page }),
      setRowDensity: (rowDensity) => set({ rowDensity }),
      setFilters: (filters) => set({ filters, page: 1 }),
      setGroupBy: (groupBy) => set({ groupBy, page: 1 }),
      setSort: (sort) => set({ sort }),
      setVisibleColumns: (visibleColumns) => set({ visibleColumns }),
      setColumnWidth: (id, width) =>
        set((s) => ({
          columnWidths: { ...s.columnWidths, [id]: width },
        })),
      resetColumns: () =>
        set({
          visibleColumns: [...RECOMMENDATION_DEFAULT_VISIBLE],
          columnWidths: {},
        }),
    }),
    {
      name: "wingify-recommendation-table-v1",
      partialize: (s) => ({
        pageSize: s.pageSize,
        rowDensity: s.rowDensity,
        visibleColumns: s.visibleColumns,
        columnWidths: s.columnWidths,
      }),
    }
  )
);
