import type {
  FlagReportFilter,
  FlagReportFilterField,
  FlagReportRow,
  FlagReportStatus,
} from "./flagReports";
import { FLAG_REPORT_STATUSES, FILTER_FIELD_LABEL } from "./flagReports";

export type FlagReportFilterFieldDef = {
  field: FlagReportFilterField;
  label: string;
  options: string[];
};

const CREATION_DATE_OPTIONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
];

const START_DATE_OPTIONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "Never started",
];

function daysAgo(n: number): number {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

function matchesDateBucket(iso: string | null, bucket: string): boolean {
  if (bucket === "Never started") return iso === null;
  if (!iso) return false;
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

export function getFlagReportFilterFields(
  rows: FlagReportRow[],
  fields: FlagReportFilterField[]
): FlagReportFilterFieldDef[] {
  const creators = [...new Set(rows.map((r) => r.createdBy))].sort((a, b) =>
    a.localeCompare(b)
  );
  const environments = [...new Set(rows.map((r) => r.environment))].sort((a, b) =>
    a.localeCompare(b)
  );

  const defs: Record<FlagReportFilterField, FlagReportFilterFieldDef> = {
    status: {
      field: "status",
      label: FILTER_FIELD_LABEL.status,
      options: [...FLAG_REPORT_STATUSES],
    },
    creationDate: {
      field: "creationDate",
      label: FILTER_FIELD_LABEL.creationDate,
      options: [...CREATION_DATE_OPTIONS],
    },
    environment: {
      field: "environment",
      label: FILTER_FIELD_LABEL.environment,
      options: environments,
    },
    createdBy: {
      field: "createdBy",
      label: FILTER_FIELD_LABEL.createdBy,
      options: creators,
    },
    startDate: {
      field: "startDate",
      label: FILTER_FIELD_LABEL.startDate,
      options: [...START_DATE_OPTIONS],
    },
  };

  return fields.map((f) => defs[f]);
}

function statusCounts(rows: FlagReportRow[]): Record<FlagReportStatus, number> {
  const counts = Object.fromEntries(
    FLAG_REPORT_STATUSES.map((s) => [s, 0])
  ) as Record<FlagReportStatus, number>;
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

export function getStatusOptionsWithCounts(
  rows: FlagReportRow[]
): { option: FlagReportStatus; count: number }[] {
  const counts = statusCounts(rows);
  return FLAG_REPORT_STATUSES.map((option) => ({
    option,
    count: counts[option],
  }));
}

function matches(row: FlagReportRow, filter: FlagReportFilter): boolean {
  const allowed = Array.isArray(filter.value)
    ? filter.value
    : filter.value
      ? [filter.value]
      : [];
  if (allowed.length === 0) return true;

  if (filter.field === "creationDate") {
    const hit = allowed.some((b) => matchesDateBucket(row.createdOn, b));
    return filter.op === "isNoneOf" ? !hit : hit;
  }
  if (filter.field === "startDate") {
    const hit = allowed.some((b) => matchesDateBucket(row.startedOn, b));
    return filter.op === "isNoneOf" ? !hit : hit;
  }

  let value: string;
  switch (filter.field) {
    case "status":
      value = row.status;
      break;
    case "environment":
      value = row.environment;
      break;
    case "createdBy":
      value = row.createdBy;
      break;
    default:
      value = "";
  }

  if (filter.op === "is") return value === filter.value;
  const isAnyOf = allowed.includes(value);
  return filter.op === "isNoneOf" ? !isAnyOf : isAnyOf;
}

export function applyFlagReportFilters(
  rows: FlagReportRow[],
  filters: FlagReportFilter[]
): FlagReportRow[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((filter) => {
      if (Array.isArray(filter.value) && filter.value.length === 0) return true;
      return matches(row, filter);
    })
  );
}
