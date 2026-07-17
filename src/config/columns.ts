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
  /** Default width in px; a view's columnWidths override takes precedence. */
  width: number;
};

export const COLUMNS: ColumnDef[] = [
  { id: "name", label: "Campaign name", locked: true, sortable: true, width: 320 },
  { id: "status", label: "Status", sortable: true, width: 140 },
  { id: "conclusion", label: "Conclusion", sortable: true, width: 140 },
  { id: "vitals", label: "Vitals", sortable: true, width: 90 },
  { id: "variations", label: "Variations", sortable: true, align: "right", width: 110 },
  { id: "visitors", label: "Visitors", sortable: true, align: "right", width: 110 },
  { id: "uniqueConversion", label: "Unique Conversion", sortable: true, align: "right", width: 150 },
  { id: "createdOnBy", label: "Created on/by", sortable: true, width: 160 },
  { id: "startedOn", label: "Started on", sortable: true, width: 130 },
  { id: "expectedImprovement", label: "Expected Improvement", sortable: true, align: "right", width: 170 },
  { id: "primaryMetric", label: "Primary Metric", sortable: true, width: 160 },
  { id: "leadingVariation", label: "Leading variation", sortable: true, width: 150 },
  { id: "hypothesis", label: "Hypothesis", sortable: false, width: 260 },
  { id: "labels", label: "Labels", sortable: false, width: 160 },
  { id: "lastUpdated", label: "Last Updated", sortable: true, width: 130 },
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
