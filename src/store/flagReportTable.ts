import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlagReportKind } from "../config/flagReports";

export type FlagReportRowDensity = "compact" | "default" | "comfortable";

type FlagReportTableState = {
  search: string;
  pageSize: number;
  page: number;
  rowDensity: FlagReportRowDensity;
  setSearch: (s: string) => void;
  setPageSize: (n: number) => void;
  setPage: (n: number) => void;
  setRowDensity: (d: FlagReportRowDensity) => void;
};

const tableStores = new Map<
  FlagReportKind,
  ReturnType<typeof createFlagReportTableStore>
>();

function createFlagReportTableStore(kind: FlagReportKind) {
  return create<FlagReportTableState>()(
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
        name: `wingify-flag-report-table-${kind}-v1`,
        partialize: (s) => ({
          pageSize: s.pageSize,
          rowDensity: s.rowDensity,
        }),
      }
    )
  );
}

export function getFlagReportTableStore(kind: FlagReportKind) {
  let store = tableStores.get(kind);
  if (!store) {
    store = createFlagReportTableStore(kind);
    tableStores.set(kind, store);
  }
  return store;
}
