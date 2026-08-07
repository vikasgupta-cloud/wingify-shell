// Shared filter → search → sort pipeline for survey table and card layouts.

import { useMemo } from "react";
import type { Survey } from "@/data/surveys";
import type { SurveyColumnId } from "@/config/surveyColumns";
import { applySurveyFilters } from "@/config/surveyFilters";
import { useVisibleSurveys } from "@/store/surveyRows";
import { useSurveyTableStore } from "@/store/surveyTable";
import { useActiveSurveyViewState } from "@/store/surveyViews";

function sortValue(
  s: Survey,
  column: SurveyColumnId
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

export function sortSurveys(
  rows: Survey[],
  sort: { column: SurveyColumnId; dir: "asc" | "desc" } | null
): Survey[] {
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

export function useSurveyPipeline(): Survey[] {
  const rows = useVisibleSurveys();
  const search = useSurveyTableStore((s) => s.search);
  const { filters, sort } = useActiveSurveyViewState();

  return useMemo(() => {
    const filtered = applySurveyFilters(rows, filters);
    const q = search.trim().toLowerCase();
    const searched = q
      ? filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.url.toLowerCase().includes(q) ||
            s.id.includes(q)
        )
      : filtered;
    return sortSurveys(searched, sort);
  }, [rows, filters, search, sort]);
}
