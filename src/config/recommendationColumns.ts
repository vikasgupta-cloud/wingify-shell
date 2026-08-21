export type RecommendationColumnId =
  | "name"
  | "location"
  | "revenueShare"
  | "ctr"
  | "rpvUplift"
  | "tags"
  | "creator"
  | "creation"
  | "lastEdit";

export type RecommendationColumnDef = {
  id: RecommendationColumnId;
  label: string;
  locked?: boolean;
  sortable: boolean;
  align?: "left" | "right" | "center";
  width: number;
};

/** Labels match Figma Reco list headers. */
export const RECOMMENDATION_COLUMNS: RecommendationColumnDef[] = [
  {
    id: "name",
    label: "Recommendation name",
    locked: true,
    sortable: true,
    width: 320,
  },
  { id: "location", label: "Location", sortable: true, width: 140 },
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
    label: "RPV uplift",
    sortable: true,
    align: "right",
    width: 110,
  },
  { id: "tags", label: "Tag(s)", sortable: false, width: 160 },
  { id: "creator", label: "Creator", sortable: true, width: 100 },
  { id: "creation", label: "Creation", sortable: true, width: 150 },
  { id: "lastEdit", label: "Last edit", sortable: true, width: 150 },
];

export const RECOMMENDATION_DEFAULT_VISIBLE: RecommendationColumnId[] =
  RECOMMENDATION_COLUMNS.map((c) => c.id);
