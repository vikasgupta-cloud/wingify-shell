import type { Recommendation } from "../data/recommendations";

export type RecommendationFilterField = "location" | "tags" | "status";

export type RecommendationFilterOp = "isAnyOf" | "isNoneOf" | "is";

export type RecommendationFilter = {
  field: RecommendationFilterField;
  op: RecommendationFilterOp;
  value: string[] | string;
};

export type RecommendationGroupField = "location" | "status" | "none";

export const RECOMMENDATION_GROUP_FIELDS: {
  id: RecommendationGroupField;
  label: string;
}[] = [
  { id: "location", label: "Location" },
  { id: "status", label: "Status" },
];

export const RECOMMENDATION_STATUS_OPTIONS = [
  "Draft",
  "Deployed",
  "Deployed (Draft Waiting…)",
] as const;

export function getRecommendationFilterOptions(rows: Recommendation[]): {
  tags: string[];
  statuses: string[];
  locations: string[];
} {
  const locations = [...new Set(rows.map((r) => r.location))].sort((a, b) =>
    a.localeCompare(b)
  );
  const tags = [...new Set(rows.flatMap((r) => r.tags))].sort((a, b) =>
    a.localeCompare(b)
  );
  const statuses = [...new Set(rows.map((r) => r.status))].sort((a, b) =>
    a.localeCompare(b)
  );
  return { tags, statuses, locations };
}

function matches(
  row: Recommendation,
  filter: RecommendationFilter
): boolean {
  const allowed = Array.isArray(filter.value)
    ? filter.value
    : filter.value
      ? [filter.value]
      : [];
  if (allowed.length === 0) return true;

  if (filter.field === "tags") {
    const hit = allowed.some((t) => row.tags.includes(t));
    return filter.op === "isNoneOf" ? !hit : hit;
  }

  const value =
    filter.field === "location"
      ? row.location
      : filter.field === "status"
        ? row.status
        : "";

  if (filter.op === "is") return value === filter.value;
  const isAnyOf = allowed.includes(value);
  return filter.op === "isNoneOf" ? !isAnyOf : isAnyOf;
}

export function applyRecommendationFilters(
  rows: Recommendation[],
  filters: RecommendationFilter[]
): Recommendation[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((filter) => {
      if (Array.isArray(filter.value) && filter.value.length === 0) return true;
      return matches(row, filter);
    })
  );
}

export function groupRecommendations(
  rows: Recommendation[],
  groupBy: RecommendationGroupField
): { key: string; rows: Recommendation[] }[] | null {
  if (groupBy === "none") return null;
  const map = new Map<string, Recommendation[]>();
  for (const row of rows) {
    const key = groupBy === "location" ? row.location : row.status;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupRows]) => ({ key, rows: groupRows }));
}

export function recommendationFiltersActive(
  filters: RecommendationFilter[]
): boolean {
  return filters.some((f) =>
    Array.isArray(f.value) ? f.value.length > 0 : !!f.value
  );
}
