import type { Recommendation } from "../data/recommendations";

export type RecommendationFilterField =
  | "location"
  | "creator"
  | "tags"
  | "creationDate";

export type RecommendationFilterOp = "isAnyOf" | "isNoneOf" | "is";

export type RecommendationFilter = {
  field: RecommendationFilterField;
  op: RecommendationFilterOp;
  value: string[] | string;
};

export type RecommendationFilterFieldDef = {
  field: RecommendationFilterField;
  label: string;
  options: string[];
};

export type RecommendationGroupField = "location" | "creator" | "none";

export const RECOMMENDATION_GROUP_FIELDS: {
  id: RecommendationGroupField;
  label: string;
}[] = [
  { id: "none", label: "No grouping" },
  { id: "location", label: "Location" },
  { id: "creator", label: "Creator" },
];

const CREATION_DATE_OPTIONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
];

export function getRecommendationFilterFields(
  rows: Recommendation[]
): RecommendationFilterFieldDef[] {
  const locations = [...new Set(rows.map((r) => r.location))].sort((a, b) =>
    a.localeCompare(b)
  );
  const creators = [...new Set(rows.map((r) => r.creator))].sort((a, b) =>
    a.localeCompare(b)
  );
  const tags = [...new Set(rows.flatMap((r) => r.tags))].sort((a, b) =>
    a.localeCompare(b)
  );
  return [
    { field: "location", label: "Location", options: locations },
    { field: "creator", label: "Creator", options: creators },
    { field: "tags", label: "Tag(s)", options: tags },
    {
      field: "creationDate",
      label: "Creation",
      options: [...CREATION_DATE_OPTIONS],
    },
  ];
}

function daysAgo(n: number): number {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

function matchesCreationDate(iso: string, bucket: string): boolean {
  const t = new Date(iso).getTime();
  switch (bucket) {
    case "Last 7 days":
      return t >= daysAgo(7);
    case "Last 30 days":
      return t >= daysAgo(30);
    case "Last 90 days":
      return t >= daysAgo(90);
    case "This year":
      return new Date(iso).getUTCFullYear() === new Date().getUTCFullYear();
    default:
      return true;
  }
}

function matches(
  row: Recommendation,
  filter: RecommendationFilter
): boolean {
  if (filter.field === "creationDate") {
    const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
    if (allowed.length === 0) return true;
    const hit = allowed.some((b) => matchesCreationDate(row.createdOn, b));
    return filter.op === "isNoneOf" ? !hit : hit;
  }

  if (filter.field === "tags") {
    const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
    if (allowed.length === 0) return true;
    const hit = allowed.some((t) => row.tags.includes(t));
    return filter.op === "isNoneOf" ? !hit : hit;
  }

  const value =
    filter.field === "location" ? row.location : row.creator;

  if (filter.op === "is") return value === filter.value;
  const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
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
    const key = groupBy === "location" ? row.location : row.creator;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupRows]) => ({ key, rows: groupRows }));
}
