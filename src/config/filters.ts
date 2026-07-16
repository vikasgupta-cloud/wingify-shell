import type {
  Campaign,
  CampaignStatus,
  CampaignType,
  Decision,
} from "../data/campaigns";

export type FilterField = "status" | "type" | "decision" | "createdBy" | "labels";
export type FilterOp = "isAnyOf" | "isNoneOf" | "is";
export type Filter = {
  field: FilterField;
  op: FilterOp;
  value: string[] | string;
};

export type FilterFieldDef = { field: FilterField; label: string; options: string[] };

// Workflow order for statuses — used both here and for group sorting.
const STATUS_ORDER: CampaignStatus[] = [
  "Draft",
  "In QA",
  "Ready to launch",
  "Running",
  "In Analysis",
  "Paused",
  "Ended",
];
const TYPE_ORDER: CampaignType[] = ["A/B", "MVT", "Split URL", "Multipage"];
const DECISION_ORDER: Decision[] = [
  "Winner",
  "Baseline",
  "Inconclusive",
  "No decision",
];

export function getFilterFields(rows: Campaign[]): FilterFieldDef[] {
  const creators = [...new Set(rows.map((r) => r.createdBy))].sort((a, b) =>
    a.localeCompare(b)
  );
  const labels = [...new Set(rows.flatMap((r) => r.labels))].sort((a, b) =>
    a.localeCompare(b)
  );
  return [
    { field: "status", label: "Status", options: [...STATUS_ORDER] },
    { field: "type", label: "Campaign type", options: [...TYPE_ORDER] },
    { field: "decision", label: "Decision", options: [...DECISION_ORDER] },
    { field: "createdBy", label: "Creator", options: creators },
    { field: "labels", label: "Labels", options: labels },
  ];
}

function rowValue(row: Campaign, field: FilterField): string | string[] {
  switch (field) {
    case "status":
      return row.status;
    case "type":
      return row.type;
    case "decision":
      return row.decision;
    case "createdBy":
      return row.createdBy;
    case "labels":
      return row.labels;
  }
}

function matches(row: Campaign, filter: Filter): boolean {
  const value = rowValue(row, filter.field);
  if (filter.op === "is") {
    // Strict equality against a single string.
    return value === filter.value;
  }
  // isAnyOf: row's value included in filter.value[]. For labels (an array),
  // true if ANY label matches. isNoneOf is the negation of isAnyOf.
  const allowed = Array.isArray(filter.value) ? filter.value : [filter.value];
  const isAnyOf = Array.isArray(value)
    ? value.some((v) => allowed.includes(v))
    : allowed.includes(value);
  return filter.op === "isNoneOf" ? !isAnyOf : isAnyOf;
}

export function applyFilters(rows: Campaign[], filters: Filter[]): Campaign[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((filter) => {
      // An empty value array is a no-op for that filter.
      if (Array.isArray(filter.value) && filter.value.length === 0) return true;
      return matches(row, filter);
    })
  );
}
