export type ColumnId =
  | "name"
  | "status"
  | "conclusion"
  | "vitals"
  | "variations"
  | "visitors"
  | "uniqueConversion"
  | "createdOnBy"
  | "startedOn"
  | "expectedImprovement"
  | "primaryMetric"
  | "leadingVariation"
  | "hypothesis"
  | "labels"
  | "lastUpdated";

export type ColumnDef = {
  id: ColumnId;
  label: string;
  /** Always visible, never leaves the first position. */
  locked?: boolean;
  sortable: boolean;
  align?: "left" | "right";
  width?: string;
};

export const COLUMNS: ColumnDef[] = [
  { id: "name", label: "Campaign name", locked: true, sortable: true, width: "320px" },
  { id: "status", label: "Status", sortable: true },
  { id: "conclusion", label: "Conclusion", sortable: true },
  { id: "vitals", label: "Vitals", sortable: true },
  { id: "variations", label: "Variations", sortable: true, align: "right" },
  { id: "visitors", label: "Visitors", sortable: true, align: "right" },
  { id: "uniqueConversion", label: "Unique Conversion", sortable: true, align: "right" },
  { id: "createdOnBy", label: "Created on/by", sortable: true },
  { id: "startedOn", label: "Started on", sortable: true },
  { id: "expectedImprovement", label: "Expected Improvement", sortable: true, align: "right" },
  { id: "primaryMetric", label: "Primary Metric", sortable: true },
  { id: "leadingVariation", label: "Leading variation", sortable: true },
  { id: "hypothesis", label: "Hypothesis", sortable: false, width: "260px" },
  { id: "labels", label: "Labels", sortable: false },
  { id: "lastUpdated", label: "Last Updated", sortable: true },
];

export const DEFAULT_VISIBLE: ColumnId[] = [
  "name",
  "status",
  "conclusion",
  "vitals",
  "variations",
  "visitors",
  "uniqueConversion",
  "createdOnBy",
];
