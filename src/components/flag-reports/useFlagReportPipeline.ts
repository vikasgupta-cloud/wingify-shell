import { useMemo } from "react";
import type {
  FlagReportColumnId,
  FlagReportKind,
  FlagReportRow,
} from "@/config/flagReports";
import { applyFlagReportFilters } from "@/config/flagReportFilters";
import { FLAG_REPORT_ROWS } from "@/data/flagReports";
import { getFlagReportTableStore } from "@/store/flagReportTable";
import { useActiveFlagReportViewState } from "@/store/flagReportViews";

function sortValue(
  row: FlagReportRow,
  column: FlagReportColumnId
): string | number | null {
  switch (column) {
    case "name":
      return row.name.toLowerCase();
    case "id":
      return Number(row.id);
    case "environment":
      return row.environment;
    case "rules":
      return row.rules ?? -1;
    case "variations":
      return row.variations ?? -1;
    case "combinations":
      return row.combinations ?? -1;
    case "visitors":
      return row.visitors;
    case "uniqueConversions":
      return row.uniqueConversions;
    case "startedOn":
      return row.startedOn;
    case "createdOnBy":
      return row.createdOn;
    case "vitals":
      return row.vitals ?? "";
    default:
      return null;
  }
}

function sortRows(
  rows: FlagReportRow[],
  sort: { column: FlagReportColumnId; dir: "asc" | "desc" } | null
): FlagReportRow[] {
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

export function useFlagReportPipeline(kind: FlagReportKind): FlagReportRow[] {
  const rows = FLAG_REPORT_ROWS[kind];
  const search = getFlagReportTableStore(kind)((s) => s.search);
  const { filters, sort } = useActiveFlagReportViewState(kind);

  return useMemo(() => {
    const filtered = applyFlagReportFilters(rows, filters);
    const q = search.trim().toLowerCase();
    const searched = q
      ? filtered.filter(
          (r) => r.name.toLowerCase().includes(q) || r.id.includes(q)
        )
      : filtered;
    return sortRows(searched, sort);
  }, [rows, filters, search, sort]);
}
