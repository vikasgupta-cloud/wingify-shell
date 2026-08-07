import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SurveyRowDensity = "compact" | "default" | "comfortable";

type SurveyTableState = {
  search: string;
  pageSize: number;
  page: number;
  rowDensity: SurveyRowDensity;
  setSearch: (s: string) => void;
  setPageSize: (n: number) => void;
  setPage: (n: number) => void;
  setRowDensity: (d: SurveyRowDensity) => void;
};

export const useSurveyTableStore = create<SurveyTableState>()(
  persist(
    (set) => ({
      search: "",
      pageSize: 10,
      page: 1,
      rowDensity: "default",
      setSearch: (search) => set({ search, page: 1 }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setPage: (page) => set({ page }),
      setRowDensity: (rowDensity) => set({ rowDensity }),
    }),
    {
      name: "wingify-survey-table-v1",
      partialize: (s) => ({
        pageSize: s.pageSize,
        rowDensity: s.rowDensity,
      }),
    }
  )
);
