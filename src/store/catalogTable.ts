/** Commerce Catalog table state — columns, search, filters, pagination. */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CATALOG_DEFAULT_VISIBLE,
  type CatalogColumnId,
} from "../config/catalogColumns";
import { CATALOG_PRODUCTS, type CatalogProduct } from "../data/catalogProducts";

export type CatalogRangeFilter = {
  min: string;
  max: string;
};

export type CatalogFilters = {
  ids: string[];
  price: CatalogRangeFilter;
  pageviews: CatalogRangeFilter;
  purchases: CatalogRangeFilter;
};

const EMPTY_RANGE: CatalogRangeFilter = { min: "", max: "" };

export const EMPTY_CATALOG_FILTERS: CatalogFilters = {
  ids: [],
  price: { ...EMPTY_RANGE },
  pageviews: { ...EMPTY_RANGE },
  purchases: { ...EMPTY_RANGE },
};

type CatalogTableState = {
  search: string;
  filters: CatalogFilters;
  visibleColumns: CatalogColumnId[];
  page: number;
  pageSize: number;
  setSearch: (search: string) => void;
  setFilters: (patch: Partial<CatalogFilters>) => void;
  resetFilters: () => void;
  setVisibleColumns: (cols: CatalogColumnId[]) => void;
  toggleColumn: (id: CatalogColumnId) => void;
  moveColumn: (id: CatalogColumnId, dir: -1 | 1) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
};

export const useCatalogTableStore = create<CatalogTableState>()(
  persist(
    (set, get) => ({
      search: "",
      filters: {
        ids: [],
        price: { ...EMPTY_RANGE },
        pageviews: { ...EMPTY_RANGE },
        purchases: { ...EMPTY_RANGE },
      },
      visibleColumns: [...CATALOG_DEFAULT_VISIBLE],
      page: 1,
      pageSize: 10,
      setSearch: (search) => set({ search, page: 1 }),
      setFilters: (patch) =>
        set((s) => ({
          filters: {
            ...s.filters,
            ...patch,
            price: patch.price ?? s.filters.price,
            pageviews: patch.pageviews ?? s.filters.pageviews,
            purchases: patch.purchases ?? s.filters.purchases,
            ids: patch.ids ?? s.filters.ids,
          },
          page: 1,
        })),
      resetFilters: () =>
        set({
          filters: {
            ids: [],
            price: { ...EMPTY_RANGE },
            pageviews: { ...EMPTY_RANGE },
            purchases: { ...EMPTY_RANGE },
          },
          page: 1,
        }),
      setVisibleColumns: (visibleColumns) => set({ visibleColumns }),
      toggleColumn: (id) => {
        const { visibleColumns } = get();
        if (visibleColumns.includes(id)) {
          set({
            visibleColumns: visibleColumns.filter((c) => c !== id),
          });
        } else {
          set({ visibleColumns: [...visibleColumns, id] });
        }
      },
      moveColumn: (id, dir) => {
        const { visibleColumns } = get();
        const from = visibleColumns.indexOf(id);
        if (from < 0) return;
        const to = from + dir;
        if (to < 0 || to >= visibleColumns.length) return;
        // Keep locked Image/Name at the front of the visible list.
        if (to < 2) return;
        if (from < 2) return;
        const next = [...visibleColumns];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        set({ visibleColumns: next });
      },
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    }),
    {
      name: "wingify-catalog-table-v1",
      partialize: (s) => ({
        visibleColumns: s.visibleColumns,
        pageSize: s.pageSize,
      }),
    }
  )
);

function parseBound(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function inRange(value: number, range: CatalogRangeFilter): boolean {
  const min = parseBound(range.min);
  const max = parseBound(range.max);
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

export function applyCatalogFilters(
  rows: CatalogProduct[],
  filters: CatalogFilters,
  search: string
): CatalogProduct[] {
  const q = search.trim().toLowerCase();
  return rows.filter((p) => {
    if (filters.ids.length && !filters.ids.includes(p.id)) return false;
    if (!inRange(p.price, filters.price)) return false;
    if (!inRange(p.pageviewsLast30Days, filters.pageviews)) return false;
    if (!inRange(p.purchasesLast30Days, filters.purchases)) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.includes(q) ||
      p.categories.toLowerCase().includes(q) ||
      p.tags.toLowerCase().includes(q)
    );
  });
}

export function useCatalogPipeline(): CatalogProduct[] {
  const search = useCatalogTableStore((s) => s.search);
  const filters = useCatalogTableStore((s) => s.filters);
  return applyCatalogFilters(CATALOG_PRODUCTS, filters, search);
}

export function catalogFiltersActive(filters: CatalogFilters): boolean {
  return (
    filters.ids.length > 0 ||
    !!filters.price.min ||
    !!filters.price.max ||
    !!filters.pageviews.min ||
    !!filters.pageviews.max ||
    !!filters.purchases.min ||
    !!filters.purchases.max
  );
}
