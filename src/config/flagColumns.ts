export type FlagColumnId =
  | "name"
  | "id"
  | "createdOnBy"
  | "environment"
  | "variations";

export type FlagColumnDef = {
  id: FlagColumnId;
  label: string;
  locked?: boolean;
  sortable: boolean;
  align?: "left" | "right" | "center";
  width: number;
};

export const FLAG_COLUMNS: FlagColumnDef[] = [
  { id: "name", label: "Flag Name", locked: true, sortable: true, width: 320 },
  { id: "id", label: "ID", sortable: true, width: 90 },
  { id: "createdOnBy", label: "Created On", sortable: true, width: 180 },
  { id: "environment", label: "Environment", sortable: true, width: 130 },
  { id: "variations", label: "Variations", sortable: true, align: "right", width: 110 },
];

export const FLAG_DEFAULT_VISIBLE: FlagColumnId[] = [
  "name",
  "id",
  "createdOnBy",
];
