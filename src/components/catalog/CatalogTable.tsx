/** Commerce Catalog data table + pagination. Name (and Image) sticky on H-scroll. */

import type { CSSProperties, ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  CATALOG_COLUMN_BY_ID,
  type CatalogColumnDef,
  type CatalogColumnId,
} from "@/config/catalogColumns";
import type { CatalogProduct } from "@/data/catalogProducts";
import {
  useCatalogPipeline,
  useCatalogTableStore,
} from "@/store/catalogTable";
import { cn } from "@/lib/utils";
import CatalogProductThumb from "./CatalogProductThumb";

const IMAGE_STICKY_WIDTH = 64;
const NAME_STICKY_WIDTH = 220;

/** Opaque sticky fills — alpha backgrounds let scrolling cells bleed through. */
const STICKY_BODY =
  "bg-background group-hover:bg-[var(--table-row-hover,_var(--muted))]";
const STICKY_HEAD = "bg-listing-header";
/** Edge divider+shadow on a 1px overlay — cell box-shadow is suppressed by border-collapse. */
const NAME_EDGE_OVERLAY =
  "pointer-events-none absolute inset-y-0 right-0 w-px [box-shadow:1px_0_0_0_var(--border),6px_0_10px_-2px_rgba(0,0,0,0.12)]";

function formatEuro(n: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function formatBool(v: boolean): string {
  return v ? "true" : "false";
}

function cellValue(p: CatalogProduct, id: CatalogColumnId): ReactNode {
  switch (id) {
    case "image":
      return <CatalogProductThumb seed={p.imageSeed} name={p.name} />;
    case "name":
      return <span className="font-medium text-foreground">{p.name}</span>;
    case "id":
      return <span className="tabular-nums text-foreground">{p.id}</span>;
    case "price":
      return formatEuro(p.price);
    case "pageviews_last_30_days":
      return p.pageviewsLast30Days.toLocaleString();
    case "purchases_last_30_days":
      return p.purchasesLast30Days.toLocaleString();
    case "revenues_last_30_days":
      return formatEuro(p.revenuesLast30Days);
    case "booster_search_low":
      return p.boosterSearchLow.toFixed(2);
    case "item_pageview_key":
      return p.itemPageviewKey;
    case "stroke_price":
      return p.strokePrice == null ? "—" : formatEuro(p.strokePrice);
    case "price_range_min":
      return formatEuro(p.priceRangeMin);
    case "img_link":
      return p.imgLink;
    case "is_recommendable":
      return formatBool(p.isRecommendable);
    case "categories_ids":
      return p.categoriesIds;
    case "tags":
      return p.tags;
    case "published_at":
      return p.publishedAt;
    case "absolute_link":
      return (
        <a
          href={p.absoluteLink}
          className="text-foreground underline-offset-2 hover:underline"
          onClick={(e) => e.preventDefault()}
        >
          {p.absoluteLink}
        </a>
      );
    case "categories":
      return p.categories;
    case "score_price":
      return p.scorePrice.toFixed(2);
    case "catalog_page_path":
      return p.catalogPagePath;
    case "color":
      return p.color;
    case "created_at":
      return p.createdAt;
    case "description":
      return (
        <span className="line-clamp-2 max-w-[240px]">{p.description}</span>
      );
    case "discount_rate":
      return `${Math.round(p.discountRate * 100)}%`;
    case "has_discount":
      return formatBool(p.hasDiscount);
    case "has_options":
      return formatBool(p.hasOptions);
    case "options":
      return p.options || "—";
    case "score_purchases_last_7_days":
      return p.scorePurchasesLast7Days.toFixed(2);
    case "score_pageviews_last_30_days":
      return p.scorePageviewsLast30Days.toFixed(2);
    case "score_revenues_last_30_days":
      return p.scoreRevenuesLast30Days.toFixed(2);
    case "item_purchase_key":
      return p.itemPurchaseKey;
    case "price_range_max":
      return formatEuro(p.priceRangeMax);
    case "global_search_score":
      return p.globalSearchScore.toFixed(2);
    default:
      return "—";
  }
}

/** Sticky offsets so Name stays put; Image sticks with it when visible. */
function stickyStyle(
  col: CatalogColumnDef,
  columns: CatalogColumnDef[]
): CSSProperties | undefined {
  const imageVisible = columns.some((c) => c.id === "image");
  if (col.id === "image") {
    return {
      position: "sticky",
      left: 0,
      width: IMAGE_STICKY_WIDTH,
      minWidth: IMAGE_STICKY_WIDTH,
      zIndex: 10,
    };
  }
  if (col.id === "name") {
    return {
      position: "sticky",
      left: imageVisible ? IMAGE_STICKY_WIDTH : 0,
      width: NAME_STICKY_WIDTH,
      minWidth: NAME_STICKY_WIDTH,
      zIndex: 10,
    };
  }
  return col.width ? { width: col.width, minWidth: col.width } : undefined;
}

function stickyCellClass(colId: CatalogColumnId, isHead: boolean) {
  if (colId !== "image" && colId !== "name") return undefined;
  return cn(
    isHead ? STICKY_HEAD : STICKY_BODY,
    colId === "name" && "relative"
  );
}

export default function CatalogTable() {
  const rows = useCatalogPipeline();
  const visibleColumns = useCatalogTableStore((s) => s.visibleColumns);
  const page = useCatalogTableStore((s) => s.page);
  const pageSize = useCatalogTableStore((s) => s.pageSize);
  const setPage = useCatalogTableStore((s) => s.setPage);

  const columns = visibleColumns
    .map((id) => CATALOG_COLUMN_BY_ID[id])
    .filter(Boolean);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-listing-header text-listing-header-foreground">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "px-3 py-2.5 text-left text-xs font-medium text-listing-header-foreground",
                    col.align === "right" && "text-right",
                    stickyCellClass(col.id, true)
                  )}
                  style={stickyStyle(col, columns)}
                >
                  {col.label}
                  {col.id === "name" && (
                    <span className={NAME_EDGE_OVERLAY} aria-hidden />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => (
              <tr
                key={p.id}
                className="group border-b border-border last:border-b-0 hover:bg-[var(--table-row-hover,_var(--muted))]"
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "px-3 py-2.5 align-middle text-foreground",
                      col.align === "right" && "text-right tabular-nums",
                      stickyCellClass(col.id, false)
                    )}
                    style={stickyStyle(col, columns)}
                  >
                    {cellValue(p, col.id)}
                    {col.id === "name" && (
                      <span className={NAME_EDGE_OVERLAY} aria-hidden />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-3 py-16 text-center text-sm text-muted-foreground"
                >
                  No products match your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="flex items-center justify-end gap-1 border-t border-border px-2 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-muted-foreground"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft className="size-3.5" />
            Prev
          </Button>
          {pageNumbers.map((n) => (
            <Button
              key={n}
              type="button"
              variant={n === currentPage ? "default" : "ghost"}
              size="sm"
              className="size-8 p-0 tabular-nums"
              onClick={() => setPage(n)}
              aria-current={n === currentPage ? "page" : undefined}
            >
              {n}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 text-muted-foreground"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
