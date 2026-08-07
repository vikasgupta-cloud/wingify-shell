// Personalize listing filters — Status, Creation Date, Creator, Start Date, Approval pending.

import type { Personalization } from "../data/personalizations";
import { PERSONALIZATION_STATUSES } from "../data/personalizations";
import type { CampaignStatus } from "../data/campaigns";

export type PersonalizeFilterField =
  | "status"
  | "createdBy"
  | "creationDate"
  | "startDate"
  | "approvalPending";

export type PersonalizeFilterOp = "isAnyOf" | "isNoneOf" | "is";

export type PersonalizeFilter = {
  field: PersonalizeFilterField;
  op: PersonalizeFilterOp;
  value: string[] | string;
};

export type PersonalizeFilterFieldDef = {
  field: PersonalizeFilterField;
  label: string;
  options: string[];
};

const STATUS_ORDER: CampaignStatus[] = [...PERSONALIZATION_STATUSES];

const CREATION_DATE_OPTIONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
];

function withinRange(iso: string | null, option: string): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  const now = Date.now();
  const day = 86400000;
  switch (option) {
    case "Last 7 days":
      return now - t <= 7 * day;
    case "Last 30 days":
      return now - t <= 30 * day;
    case "Last 90 days":
      return now - t <= 90 * day;
    case "This year":
      return new Date(iso).getUTCFullYear() === new Date().getUTCFullYear();
    default:
      return true;
  }
}

export function getPersonalizeFilterFields(
  rows: Personalization[]
): PersonalizeFilterFieldDef[] {
  const creators = [...new Set(rows.map((r) => r.createdBy))].sort((a, b) =>
    a.localeCompare(b)
  );
  return [
    { field: "status", label: "Status", options: [...STATUS_ORDER] },
    { field: "creationDate", label: "Creation Date", options: [...CREATION_DATE_OPTIONS] },
    { field: "createdBy", label: "Campaign Creator", options: creators },
    { field: "startDate", label: "Start Date", options: [...CREATION_DATE_OPTIONS] },
    {
      field: "approvalPending",
      label: "Approval pending",
      options: ["Yes", "No"],
    },
  ];
}

function matches(row: Personalization, filter: PersonalizeFilter): boolean {
  if (filter.field === "creationDate") {
    const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
    if (allowed.length === 0) return true;
    const hit = allowed.some((opt) => withinRange(row.createdOn, opt));
    return filter.op === "isNoneOf" ? !hit : hit;
  }
  if (filter.field === "startDate") {
    const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
    if (allowed.length === 0) return true;
    const hit = allowed.some((opt) => withinRange(row.startedOn, opt));
    return filter.op === "isNoneOf" ? !hit : hit;
  }
  if (filter.field === "approvalPending") {
    const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
    if (allowed.length === 0) return true;
    const label = row.approvalPending ? "Yes" : "No";
    const hit = allowed.includes(label);
    return filter.op === "isNoneOf" ? !hit : hit;
  }
  if (filter.field === "status") {
    const value = row.status;
    if (filter.op === "is") return value === filter.value;
    const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
    const hit = allowed.includes(value);
    return filter.op === "isNoneOf" ? !hit : hit;
  }
  // createdBy
  const value = row.createdBy;
  if (filter.op === "is") return value === filter.value;
  const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
  const hit = allowed.includes(value);
  return filter.op === "isNoneOf" ? !hit : hit;
}

export function applyPersonalizeFilters(
  rows: Personalization[],
  filters: PersonalizeFilter[]
): Personalization[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((filter) => {
      if (Array.isArray(filter.value) && filter.value.length === 0) return true;
      return matches(row, filter);
    })
  );
}
