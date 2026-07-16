import type { Campaign, CampaignStatus } from "../data/campaigns";

export type GroupField =
  | "createdBy"
  | "status"
  | "type"
  | "decision"
  | "monthStarted"
  | "monthCreated";

export const GROUP_FIELDS: { id: GroupField; label: string }[] = [
  { id: "createdBy", label: "Creator" },
  { id: "status", label: "Status" },
  { id: "type", label: "Campaign type" },
  { id: "decision", label: "Decision" },
  { id: "monthStarted", label: "Month (Started)" },
  { id: "monthCreated", label: "Month (Created)" },
];

const STATUS_ORDER: CampaignStatus[] = [
  "Draft",
  "In QA",
  "Ready to launch",
  "Running",
  "In Analysis",
  "Paused",
  "Ended",
];

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

// Sortable numeric stamp for a "MMM yyyy" key; NULL sorts last.
const monthStamp = (key: string): number => {
  if (key === NULL_KEY) return -Infinity;
  const [mon, year] = key.split(" ");
  return Number(year) * 12 + MONTHS.indexOf(mon);
};

function groupKey(row: Campaign, field: GroupField): string {
  switch (field) {
    case "createdBy":
      return row.createdBy;
    case "status":
      return row.status;
    case "type":
      return row.type;
    case "decision":
      return row.decision;
    case "monthStarted":
      return monthKey(row.startedOn);
    case "monthCreated":
      return monthKey(row.createdOn);
  }
}

export function groupRows(
  rows: Campaign[],
  field: GroupField
): { key: string; rows: Campaign[] }[] {
  const buckets = new Map<string, Campaign[]>();
  for (const row of rows) {
    const key = groupKey(row, field);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  }

  const entries = [...buckets.entries()].map(([key, rows]) => ({ key, rows }));

  if (field === "status") {
    entries.sort((a, b) => STATUS_ORDER.indexOf(a.key as CampaignStatus) - STATUS_ORDER.indexOf(b.key as CampaignStatus));
  } else if (field === "monthStarted" || field === "monthCreated") {
    entries.sort((a, b) => monthStamp(b.key) - monthStamp(a.key));
  } else {
    entries.sort((a, b) => a.key.localeCompare(b.key));
  }

  return entries;
}
