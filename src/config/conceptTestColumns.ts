export type ConceptTestColumnId =
  | "name"
  | "id"
  | "status"
  | "displayed"
  | "attempted"
  | "completed"
  | "createdOnBy"
  | "startedOn"
  | "labels"
  | "platform";

export type ConceptTestColumnDef = {
  id: ConceptTestColumnId;
  label: string;
  locked?: boolean;
  sortable: boolean;
  align?: "left" | "right" | "center";
  width: number;
};

export const CONCEPT_TEST_COLUMNS: ConceptTestColumnDef[] = [
  { id: "name", label: "Name", locked: true, sortable: true, width: 300 },
  { id: "id", label: "ID", sortable: true, width: 80 },
  { id: "status", label: "Status", sortable: true, width: 130 },
  { id: "displayed", label: "Displayed", sortable: true, align: "right", width: 110 },
  { id: "attempted", label: "Attempted", sortable: true, align: "right", width: 110 },
  { id: "completed", label: "Completed", sortable: true, align: "right", width: 110 },
  { id: "createdOnBy", label: "Created On", sortable: true, width: 150 },
  { id: "startedOn", label: "Started On", sortable: true, width: 130 },
  { id: "labels", label: "Labels", sortable: false, width: 140 },
  { id: "platform", label: "Platform", sortable: true, width: 110 },
];

export const CONCEPT_TEST_DEFAULT_VISIBLE: ConceptTestColumnId[] = [
  "name",
  "id",
  "status",
  "displayed",
  "attempted",
  "completed",
  "createdOnBy",
  "startedOn",
  "labels",
];
