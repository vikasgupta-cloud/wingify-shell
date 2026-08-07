// Personalize listing columns — matches product screenshots (Experiences, not Variations).

export type PersonalizeColumnId =
  | "name"
  | "id"
  | "status"
  | "vitals"
  | "experiences"
  | "visitors"
  | "uniqueConversion"
  | "createdOnBy"
  | "startedOn"
  | "labels"
  | "lastUpdated";

export type PersonalizeColumnDef = {
  id: PersonalizeColumnId;
  label: string;
  locked?: boolean;
  sortable: boolean;
  align?: "left" | "right" | "center";
  width: number;
};

export const PERSONALIZE_COLUMNS: PersonalizeColumnDef[] = [
  { id: "name", label: "Name", locked: true, sortable: true, width: 320 },
  { id: "id", label: "ID", sortable: true, width: 90 },
  { id: "status", label: "Status", sortable: true, width: 140 },
  { id: "vitals", label: "Vitals", sortable: true, align: "center", width: 90 },
  { id: "experiences", label: "Experiences", sortable: true, align: "right", width: 120 },
  { id: "visitors", label: "Visitors", sortable: true, align: "right", width: 110 },
  {
    id: "uniqueConversion",
    label: "Unique Conversions",
    sortable: true,
    align: "right",
    width: 160,
  },
  { id: "createdOnBy", label: "Created On", sortable: true, width: 200 },
  { id: "startedOn", label: "Started On", sortable: true, width: 130 },
  { id: "labels", label: "Labels", sortable: false, width: 160 },
  { id: "lastUpdated", label: "Last Updated", sortable: true, width: 130 },
];

export const PERSONALIZE_DEFAULT_VISIBLE: PersonalizeColumnId[] = [
  "name",
  "id",
  "status",
  "vitals",
  "experiences",
  "visitors",
  "uniqueConversion",
  "createdOnBy",
];
