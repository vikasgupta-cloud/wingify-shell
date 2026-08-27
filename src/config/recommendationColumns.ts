export type RecommendationColumnId =
  | "name"
  | "status"
  | "location"
  | "revenueShare"
  | "ctr"
  | "rpvUplift"
  | "tags"
  | "creator"
  | "creation"
  | "lastEdit"
  | "id";

export type RecommendationColumnDef = {
  id: RecommendationColumnId;
  label: string;
  locked?: boolean;
  sortable: boolean;
  align?: "left" | "right" | "center";
  width: number;
};

/** Labels match Strategies list screenshots. */
export const RECOMMENDATION_COLUMNS: RecommendationColumnDef[] = [
  {
    id: "name",
    label: "Recommendation name",
    locked: true,
    sortable: true,
    width: 280,
  },
  {
    id: "status",
    label: "Status",
    locked: true,
    sortable: true,
    width: 120,
  },
  {
    id: "location",
    label: "Location",
    locked: true,
    sortable: true,
    width: 140,
  },
  {
    id: "revenueShare",
    label: "% of revenue",
    sortable: true,
    align: "right",
    width: 120,
  },
  { id: "ctr", label: "CTR", sortable: true, align: "right", width: 90 },
  {
    id: "rpvUplift",
    label: "RPV Uplift",
    sortable: true,
    align: "right",
    width: 110,
  },
  { id: "tags", label: "Tag(s)", sortable: false, width: 160 },
  { id: "creator", label: "Creator", sortable: true, width: 100 },
  { id: "creation", label: "Creation", sortable: true, width: 160 },
  { id: "lastEdit", label: "Last edit", sortable: true, width: 160 },
  { id: "id", label: "Id", sortable: true, width: 100 },
];

export const RECOMMENDATION_DEFAULT_VISIBLE: RecommendationColumnId[] = [
  "name",
  "status",
  "location",
  "revenueShare",
  "ctr",
  "rpvUplift",
  "tags",
  "creator",
  "creation",
  "lastEdit",
];

export const RECOMMENDATION_COLUMN_BY_ID = Object.fromEntries(
  RECOMMENDATION_COLUMNS.map((c) => [c.id, c])
) as Record<RecommendationColumnId, RecommendationColumnDef>;
