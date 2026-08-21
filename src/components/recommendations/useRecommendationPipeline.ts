import { useMemo } from "react";
import type { Recommendation } from "@/data/recommendations";
import type { RecommendationColumnId } from "@/config/recommendationColumns";
import {
  applyRecommendationFilters,
  groupRecommendations,
} from "@/config/recommendationFilters";
import { useVisibleRecommendations } from "@/store/recommendationRows";
import { useRecommendationTableStore } from "@/store/recommendationTable";

function sortValue(
  r: Recommendation,
  column: RecommendationColumnId
): string | number | null {
  switch (column) {
    case "name":
      return r.name.toLowerCase();
    case "location":
      return r.location;
    case "revenueShare":
      return r.revenueShare;
    case "ctr":
      return r.ctr;
    case "rpvUplift":
      return r.rpvUplift;
    case "creator":
      return r.creator.toLowerCase();
    case "creation":
      return r.createdOn;
    case "lastEdit":
      return r.lastEdit;
    default:
      return null;
  }
}

export function sortRecommendations(
  rows: Recommendation[],
  sort: { column: RecommendationColumnId; dir: "asc" | "desc" } | null
): Recommendation[] {
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

export function useRecommendationPipeline(): Recommendation[] {
  const rows = useVisibleRecommendations();
  const search = useRecommendationTableStore((s) => s.search);
  const filters = useRecommendationTableStore((s) => s.filters);
  const sort = useRecommendationTableStore((s) => s.sort);

  return useMemo(() => {
    const filtered = applyRecommendationFilters(rows, filters);
    const q = search.trim().toLowerCase();
    const searched = q
      ? filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q) ||
            r.creator.toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q))
        )
      : filtered;
    return sortRecommendations(searched, sort);
  }, [rows, filters, search, sort]);
}

export function useRecommendationGroups() {
  const sorted = useRecommendationPipeline();
  const groupBy = useRecommendationTableStore((s) => s.groupBy);
  return useMemo(
    () => groupRecommendations(sorted, groupBy),
    [sorted, groupBy]
  );
}
