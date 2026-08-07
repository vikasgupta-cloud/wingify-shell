// Personalize grouping fields for kanban / grouped table.

import type { CampaignStatus } from "../data/campaigns";
import type { Personalization } from "../data/personalizations";
import { PERSONALIZATION_STATUSES } from "../data/personalizations";

export type PersonalizeGroupField =
  | "createdBy"
  | "status"
  | "monthStarted"
  | "monthCreated";

export const PERSONALIZE_GROUP_FIELDS: {
  id: PersonalizeGroupField;
  label: string;
}[] = [
  { id: "createdBy", label: "Creator" },
  { id: "status", label: "Status" },
  { id: "monthStarted", label: "Month (Started)" },
  { id: "monthCreated", label: "Month (Created)" },
];

const STATUS_ORDER: CampaignStatus[] = [...PERSONALIZATION_STATUSES];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const NULL_KEY = "—";

const monthKey = (isoDate: string | null): string => {
  if (!isoDate) return NULL_KEY;
  const d = new Date(isoDate);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const monthStamp = (key: string): number => {
  if (key === NULL_KEY) return -Infinity;
  const [mon, year] = key.split(" ");
  return Number(year) * 12 + MONTHS.indexOf(mon);
};

function groupKey(row: Personalization, field: PersonalizeGroupField): string {
  switch (field) {
    case "createdBy":
      return row.createdBy;
    case "status":
      return row.status;
    case "monthStarted":
      return monthKey(row.startedOn);
    case "monthCreated":
      return monthKey(row.createdOn);
  }
}

export function groupPersonalizeRows(
  rows: Personalization[],
  field: PersonalizeGroupField
): { key: string; rows: Personalization[] }[] {
  const buckets = new Map<string, Personalization[]>();
  for (const row of rows) {
    const key = groupKey(row, field);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  }

  const entries = [...buckets.entries()].map(([key, rows]) => ({ key, rows }));

  if (field === "status") {
    entries.sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.key as CampaignStatus) -
        STATUS_ORDER.indexOf(b.key as CampaignStatus)
    );
  } else if (field === "monthStarted" || field === "monthCreated") {
    entries.sort((a, b) => monthStamp(b.key) - monthStamp(a.key));
  } else {
    entries.sort((a, b) => a.key.localeCompare(b.key));
  }

  return entries;
}
