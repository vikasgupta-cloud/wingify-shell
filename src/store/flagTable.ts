import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FlagRowDensity = "compact" | "default" | "comfortable";

type FlagTableState = {
  search: string;
  pageSize: number;
  page: number;
  rowDensity: FlagRowDensity;
  setSearch: (s: string) => void;
  setPageSize: (n: number) => void;
  setPage: (n: number) => void;
  setRowDensity: (d: FlagRowDensity) => void;
};

export const useFlagTableStore = create<FlagTableState>()(
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
      name: "wingify-flag-table-v1",
      partialize: (s) => ({
        pageSize: s.pageSize,
        rowDensity: s.rowDensity,
      }),
    }
  )
);
