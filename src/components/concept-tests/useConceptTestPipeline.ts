// Shared filter → search → sort pipeline for conceptTest table and card layouts.

import { useMemo } from "react";
import type { ConceptTest } from "@/data/conceptTests";
import type { ConceptTestColumnId } from "@/config/conceptTestColumns";
import { applyConceptTestFilters } from "@/config/conceptTestFilters";
import { useVisibleConceptTests } from "@/store/conceptTestRows";
import { useConceptTestTableStore } from "@/store/conceptTestTable";
import { useActiveConceptTestViewState } from "@/store/conceptTestViews";

function sortValue(
  s: ConceptTest,
  column: ConceptTestColumnId
): string | number | null {
  switch (column) {
    case "name":
      return s.name.toLowerCase();
    case "id":
      return Number(s.id);
    case "status":
      return s.status;
    case "displayed":
      return s.displayed;
    case "attempted":
      return s.attempted;
    case "completed":
      return s.completed;
    case "createdOnBy":
      return s.createdOn;
    case "startedOn":
      return s.startedOn;
    case "labels":
      return s.labels.join(",");
    case "platform":
      return s.platform;
    default:
      return null;
  }
}

export function sortConceptTests(
  rows: ConceptTest[],
  sort: { column: ConceptTestColumnId; dir: "asc" | "desc" } | null
): ConceptTest[] {
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

export function useConceptTestPipeline(): ConceptTest[] {
  const rows = useVisibleConceptTests();
  const search = useConceptTestTableStore((s) => s.search);
  const { filters, sort } = useActiveConceptTestViewState();

  return useMemo(() => {
    const filtered = applyConceptTestFilters(rows, filters);
    const q = search.trim().toLowerCase();
    const searched = q
      ? filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.url.toLowerCase().includes(q) ||
            s.id.includes(q)
        )
      : filtered;
    return sortConceptTests(searched, sort);
  }, [rows, filters, search, sort]);
}
