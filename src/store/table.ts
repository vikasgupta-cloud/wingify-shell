import { create } from "zustand";
import { persist } from "zustand/middleware";

type TableState = {
  search: string;
  pageSize: number;
  page: number;
  setSearch: (s: string) => void;
  setPageSize: (n: number) => void;
  setPage: (n: number) => void;
};

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      search: "",
      pageSize: 10,
      page: 1,
      setSearch: (search) => set({ search, page: 1 }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setPage: (page) => set({ page }),
    }),
    {
      name: "wingify-table-v2",
      partialize: (s) => ({ pageSize: s.pageSize }),
    }
  )
);
