import { useMemo } from "react";
import type { FeatureFlag } from "@/data/featureFlags";
import type { FlagColumnId } from "@/config/flagColumns";
import { applyFlagFilters } from "@/config/flagFilters";
import { useVisibleFeatureFlags } from "@/store/flagRows";
import { useFlagTableStore } from "@/store/flagTable";
import { useActiveFlagViewState } from "@/store/flagViews";

function sortValue(
  f: FeatureFlag,
  column: FlagColumnId
): string | number | null {
  switch (column) {
    case "name":
      return f.name.toLowerCase();
    case "id":
      return Number(f.id);
    case "createdOnBy":
      return f.createdOn;
    case "environment":
      return f.environment ?? "";
    case "variations":
      return f.variations ?? -1;
    default:
      return null;
  }
}

export function sortFeatureFlags(
  rows: FeatureFlag[],
  sort: { column: FlagColumnId; dir: "asc" | "desc" } | null
): FeatureFlag[] {
  if (!sort) return rows;
  const { column, dir } = sort;
  return [...rows].sort((a, b) => {
    const av = sortValue(a, column);
    const bv = sortValue(b, column);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
    return dir === "asc" ? cmp : -cmp;
  });
}

export function useFlagPipeline(): FeatureFlag[] {
  const rows = useVisibleFeatureFlags();
  const search = useFlagTableStore((s) => s.search);
  const { filters, sort } = useActiveFlagViewState();

  return useMemo(() => {
    const filtered = applyFlagFilters(rows, filters);
    const q = search.trim().toLowerCase();
    const searched = q
      ? filtered.filter(
          (f) => f.name.toLowerCase().includes(q) || f.id.includes(q)
        )
      : filtered;
    return sortFeatureFlags(searched, sort);
  }, [rows, filters, search, sort]);
}
