import type { FeatureFlag } from "../data/featureFlags";

export type FlagFilterField = "createdBy" | "creationDate" | "environment";
export type FlagFilterOp = "isAnyOf" | "isNoneOf" | "is";

export type FlagFilter = {
  field: FlagFilterField;
  op: FlagFilterOp;
  value: string[] | string;
};

export type FlagFilterFieldDef = {
  field: FlagFilterField;
  label: string;
  options: string[];
};

const CREATION_DATE_OPTIONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
];

export function getFlagFilterFields(rows: FeatureFlag[]): FlagFilterFieldDef[] {
  const creators = [...new Set(rows.map((r) => r.createdBy))].sort((a, b) =>
    a.localeCompare(b)
  );
  const environments = [
    ...new Set(
      rows.map((r) => r.environment).filter((e): e is string => e !== null)
    ),
  ].sort((a, b) => a.localeCompare(b));
  return [
    { field: "creationDate", label: "Creation Date", options: [...CREATION_DATE_OPTIONS] },
    { field: "createdBy", label: "Campaign Creator", options: creators },
    { field: "environment", label: "Environment", options: environments },
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

function matches(row: FeatureFlag, filter: FlagFilter): boolean {
  if (filter.field === "creationDate") {
    const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
    if (allowed.length === 0) return true;
    const hit = allowed.some((b) => matchesCreationDate(row.createdOn, b));
    return filter.op === "isNoneOf" ? !hit : hit;
  }

  let value: string | string[];
  if (filter.field === "createdBy") value = row.createdBy;
  else value = row.environment ?? "";

  if (filter.op === "is") return value === filter.value;
  const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
  const isAnyOf = allowed.includes(value as string);
  return filter.op === "isNoneOf" ? !isAnyOf : isAnyOf;
}

export function applyFlagFilters(
  rows: FeatureFlag[],
  filters: FlagFilter[]
): FeatureFlag[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((filter) => {
      if (Array.isArray(filter.value) && filter.value.length === 0) return true;
      return matches(row, filter);
    })
  );
}
