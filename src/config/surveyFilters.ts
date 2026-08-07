import type { Survey, SurveyStatus } from "../data/surveys";
import { SURVEY_STATUSES } from "../data/surveys";

export type SurveyFilterField =
  | "status"
  | "createdBy"
  | "platform"
  | "labels"
  | "creationDate";

export type SurveyFilterOp = "isAnyOf" | "isNoneOf" | "is";

export type SurveyFilter = {
  field: SurveyFilterField;
  op: SurveyFilterOp;
  value: string[] | string;
};

export type SurveyFilterFieldDef = {
  field: SurveyFilterField;
  label: string;
  options: string[];
};

const CREATION_DATE_OPTIONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
];

export function getSurveyFilterFields(rows: Survey[]): SurveyFilterFieldDef[] {
  const creators = [...new Set(rows.map((r) => r.createdBy))].sort((a, b) =>
    a.localeCompare(b)
  );
  const labels = [...new Set(rows.flatMap((r) => r.labels))].sort((a, b) =>
    a.localeCompare(b)
  );
  const platforms = [...new Set(rows.map((r) => r.platform))].sort((a, b) =>
    a.localeCompare(b)
  );
  return [
    { field: "status", label: "Status", options: [...SURVEY_STATUSES] },
    { field: "creationDate", label: "Creation Date", options: [...CREATION_DATE_OPTIONS] },
    { field: "createdBy", label: "Campaign Creator", options: creators },
    { field: "platform", label: "Platform", options: platforms },
    { field: "labels", label: "Labels", options: labels },
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

function rowValue(row: Survey, field: SurveyFilterField): string | string[] {
  switch (field) {
    case "status":
      return row.status;
    case "createdBy":
      return row.createdBy;
    case "platform":
      return row.platform;
    case "labels":
      return row.labels;
    case "creationDate":
      return row.createdOn;
  }
}

function matches(row: Survey, filter: SurveyFilter): boolean {
  if (filter.field === "creationDate") {
    const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
    if (allowed.length === 0) return true;
    const hit = allowed.some((b) => matchesCreationDate(row.createdOn, b));
    return filter.op === "isNoneOf" ? !hit : hit;
  }

  const value = rowValue(row, filter.field);
  if (filter.op === "is") return value === filter.value;
  const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
  const isAnyOf = Array.isArray(value)
    ? value.some((v) => allowed.includes(v))
    : allowed.includes(value as string);
  return filter.op === "isNoneOf" ? !isAnyOf : isAnyOf;
}

export function applySurveyFilters(
  rows: Survey[],
  filters: SurveyFilter[]
): Survey[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((filter) => {
      if (Array.isArray(filter.value) && filter.value.length === 0) return true;
      return matches(row, filter);
    })
  );
}

export type SurveyStatusTransition = {
  to: SurveyStatus;
  description: string;
};

export const SURVEY_STATUS_WORKFLOW: Record<
  SurveyStatus,
  SurveyStatusTransition[]
> = {
  Draft: [
    { to: "Running", description: "Start collecting responses" },
    { to: "Paused", description: "Keep draft paused" },
  ],
  Running: [
    { to: "Paused", description: "Temporarily stop the survey" },
    { to: "Draft", description: "Move back to draft" },
  ],
  Paused: [
    { to: "Running", description: "Resume collecting responses" },
    { to: "Draft", description: "Move back to draft" },
  ],
};
