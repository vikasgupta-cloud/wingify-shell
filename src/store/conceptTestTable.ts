import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConceptTestRowDensity = "compact" | "default" | "comfortable";

type ConceptTestTableState = {
  search: string;
  pageSize: number;
  page: number;
  rowDensity: ConceptTestRowDensity;
  setSearch: (s: string) => void;
  setPageSize: (n: number) => void;
  setPage: (n: number) => void;
  setRowDensity: (d: ConceptTestRowDensity) => void;
};

export const useConceptTestTableStore = create<ConceptTestTableState>()(
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
      name: "wingify-concept-test-table-v1",
      partialize: (s) => ({
        pageSize: s.pageSize,
        rowDensity: s.rowDensity,
      }),
    }
  )
);
