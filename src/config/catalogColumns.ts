/** Commerce Catalog table columns — Display settings visible/hidden lists. */

export type CatalogColumnId =
  | "image"
  | "name"
  | "id"
  | "price"
  | "pageviews_last_30_days"
  | "purchases_last_30_days"
  | "revenues_last_30_days"
  | "booster_search_low"
  | "item_pageview_key"
  | "stroke_price"
  | "price_range_min"
  | "img_link"
  | "is_recommendable"
  | "categories_ids"
  | "tags"
  | "published_at"
  | "absolute_link"
  | "categories"
  | "score_price"
  | "catalog_page_path"
  | "color"
  | "created_at"
  | "description"
  | "discount_rate"
  | "has_discount"
  | "has_options"
  | "options"
  | "score_purchases_last_7_days"
  | "score_pageviews_last_30_days"
  | "score_revenues_last_30_days"
  | "item_purchase_key"
  | "price_range_max"
  | "global_search_score";

export type CatalogColumnDef = {
  id: CatalogColumnId;
  /** Snake_case label as shown in Display settings / headers. */
  label: string;
  /** Locked columns stay visible and cannot be toggled off. */
  locked?: boolean;
  align?: "left" | "right";
  width?: number;
};

export const CATALOG_COLUMNS: CatalogColumnDef[] = [
  { id: "image", label: "Image", locked: true, width: 64 },
  { id: "name", label: "Name", locked: true, width: 220 },
  { id: "id", label: "id", width: 160 },
  { id: "price", label: "price", align: "right", width: 88 },
  {
    id: "pageviews_last_30_days",
    label: "pageviews_last_30_days",
    align: "right",
    width: 160,
  },
  {
    id: "purchases_last_30_days",
    label: "purchases_last_30_days",
    align: "right",
    width: 160,
  },
  {
    id: "revenues_last_30_days",
    label: "revenues_last_30_days",
    align: "right",
    width: 160,
  },
  { id: "booster_search_low", label: "booster_search_low" },
  { id: "item_pageview_key", label: "item_pageview_key" },
  { id: "stroke_price", label: "stroke_price", align: "right" },
  { id: "price_range_min", label: "price_range_min", align: "right" },
  { id: "img_link", label: "img_link" },
  { id: "is_recommendable", label: "is_recommendable" },
  { id: "categories_ids", label: "categories_ids" },
  { id: "tags", label: "tags" },
  { id: "published_at", label: "published_at" },
  { id: "absolute_link", label: "absolute_link" },
  { id: "categories", label: "categories" },
  { id: "score_price", label: "score_price", align: "right" },
  { id: "catalog_page_path", label: "catalog_page_path" },
  { id: "color", label: "color" },
  { id: "created_at", label: "created_at" },
  { id: "description", label: "description" },
  { id: "discount_rate", label: "discount_rate", align: "right" },
  { id: "has_discount", label: "has_discount" },
  { id: "has_options", label: "has_options" },
  { id: "options", label: "options" },
  {
    id: "score_purchases_last_7_days",
    label: "score_purchases_last_7_days",
    align: "right",
  },
  {
    id: "score_pageviews_last_30_days",
    label: "score_pageviews_last_30_days",
    align: "right",
  },
  {
    id: "score_revenues_last_30_days",
    label: "score_revenues_last_30_days",
    align: "right",
  },
  { id: "item_purchase_key", label: "item_purchase_key" },
  { id: "price_range_max", label: "price_range_max", align: "right" },
  { id: "global_search_score", label: "global_search_score", align: "right" },
];

export const CATALOG_DEFAULT_VISIBLE: CatalogColumnId[] = [
  "image",
  "name",
  "id",
  "price",
  "pageviews_last_30_days",
  "purchases_last_30_days",
  "revenues_last_30_days",
];

export const CATALOG_COLUMN_BY_ID = Object.fromEntries(
  CATALOG_COLUMNS.map((c) => [c.id, c])
) as Record<CatalogColumnId, CatalogColumnDef>;
