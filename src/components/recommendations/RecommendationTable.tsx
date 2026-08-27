// Strategies list table — sticky checkbox+name (Catalog-style widths), status pills, pager.

import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  EllipsisVertical,
  Pencil,
  Trash2,
  X,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RECOMMENDATION_COLUMNS,
  type RecommendationColumnDef,
  type RecommendationColumnId,
} from "@/config/recommendationColumns";
import {
  recommendationLandingPath,
  recommendationReportsPath,
  type Recommendation,
} from "@/data/recommendations";
import { useRecommendationRowsStore } from "@/store/recommendationRows";
import { useRecommendationTableStore } from "@/store/recommendationTable";
import { cn } from "@/lib/utils";
import {
  useRecommendationGroups,
  useRecommendationPipeline,
} from "./useRecommendationPipeline";

const CHECKBOX_COL_WIDTH = 44;
const NAME_STICKY_WIDTH = 280;

const DENSITY_PAD = {
  compact: "py-2",
  default: "py-3",
  comfortable: "py-4",
} as const;

const NULL_DASH = <span className="text-sm text-muted-foreground">–</span>;

/** Opaque sticky fills — alpha backgrounds let scrolling cells bleed through. */
const STICKY_BODY =
  "bg-background group-hover:bg-[var(--table-row-hover,_var(--muted))]";
const STICKY_HEAD = "bg-listing-header";
/** Edge divider+shadow on a 1px overlay — cell box-shadow is suppressed by border-collapse. */
const NAME_EDGE_OVERLAY =
  "pointer-events-none absolute inset-y-0 right-0 w-px [box-shadow:1px_0_0_0_var(--border),6px_0_10px_-2px_rgba(0,0,0,0.12)]";

function formatDateTime(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const date = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const mins = String(d.getUTCMinutes()).padStart(2, "0");
  return `${date} ${hours}:${mins}`;
}

function StatusPill({ status }: { status: Recommendation["status"] }) {
  const deployed = status.startsWith("Deployed");
  return (
    <span
      className={cn(
        "inline-flex max-w-full truncate rounded-full px-2.5 py-0.5 text-xs font-medium",
        deployed
          ? "bg-status-running-bg text-status-running-fg"
          : "border border-border bg-background text-foreground"
      )}
      title={status}
    >
      {status}
    </span>
  );
}

function stickyCheckboxStyle(isHead: boolean): CSSProperties {
  return {
    position: "sticky",
    left: 0,
    width: CHECKBOX_COL_WIDTH,
    minWidth: CHECKBOX_COL_WIDTH,
    maxWidth: CHECKBOX_COL_WIDTH,
    zIndex: isHead ? 21 : 11,
  };
}

function stickyNameStyle(
  width: number,
  isHead: boolean
): CSSProperties {
  return {
    position: "sticky",
    left: CHECKBOX_COL_WIDTH,
    width,
    minWidth: width,
    maxWidth: width,
    zIndex: isHead ? 20 : 10,
  };
}

function columnStyle(col: RecommendationColumnDef, width: number): CSSProperties {
  if (col.id === "name") return stickyNameStyle(width, false);
  return { width, minWidth: width };
}

function pageWindow(current: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2)
    return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
}

export default function RecommendationTable() {
  const navigate = useNavigate();
  const sorted = useRecommendationPipeline();
  const groups = useRecommendationGroups();
  const {
    visibleColumns,
    sort,
    columnWidths,
    page,
    pageSize,
    rowDensity,
    search,
    setPage,
    setSort,
  } = useRecommendationTableStore();
  const remove = useRecommendationRowsStore((s) => s.remove);
  const removeTag = useRecommendationRowsStore((s) => s.removeTag);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected((prev) => (prev.size === 0 ? prev : new Set()));
  }, [sorted]);

  const columns = visibleColumns
    .map((id) => RECOMMENDATION_COLUMNS.find((c) => c.id === id))
    .filter((c): c is RecommendationColumnDef => c !== undefined);

  const effWidth = (col: RecommendationColumnDef) =>
    col.id === "name"
      ? Math.max(columnWidths[col.id] ?? col.width, NAME_STICKY_WIDTH)
      : (columnWidths[col.id] ?? col.width);
  const tableWidth =
    CHECKBOX_COL_WIDTH + columns.reduce((sum, col) => sum + effWidth(col), 0);

  const grouped = groups !== null;
  const totalResults = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = grouped
    ? sorted
    : sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = pageWindow(currentPage, totalPages);

  const selectedVisible = pageRows.filter((r) => selected.has(r.id)).length;
  const allSelected =
    pageRows.length > 0 && selectedVisible === pageRows.length;
  const headerState: boolean | "indeterminate" = allSelected
    ? true
    : selectedVisible > 0
      ? "indeterminate"
      : false;

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const toggleSort = (col: RecommendationColumnDef) => {
    if (!col.sortable) return;
    if (sort?.column !== col.id) {
      setSort({ column: col.id, dir: "asc" });
      return;
    }
    if (sort.dir === "asc") {
      setSort({ column: col.id, dir: "desc" });
      return;
    }
    setSort(null);
  };

  const sortIcon = (col: RecommendationColumnDef) => {
    if (sort?.column !== col.id)
      return <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-60" />;
    return (
      <ChevronDown
        className={cn(
          "h-3 w-3 shrink-0 transition-transform duration-150",
          sort.dir === "asc" && "rotate-180"
        )}
      />
    );
  };

  const renderCell = (r: Recommendation, col: RecommendationColumnDef) => {
    switch (col.id as RecommendationColumnId) {
      case "name":
        return (
          <div className="relative flex min-w-0 items-center">
            <span className="truncate pr-1 font-medium text-foreground group-hover:underline group-hover:pr-28">
              {r.name}
            </span>
            <div
              className={cn(
                "absolute inset-y-0 right-0 flex items-center gap-0.5 pl-2",
                "bg-background opacity-0 transition-opacity group-hover:opacity-100",
                "group-hover:bg-[var(--table-row-hover,_var(--muted))]"
              )}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto gap-1 px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(recommendationReportsPath(r));
                }}
              >
                <BarChart3 className="size-3.5" />
                Reporting
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                aria-label={`Edit ${r.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(recommendationLandingPath(r));
                }}
              >
                <Pencil className="size-3.5" />
              </Button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    aria-label={`${r.name} more actions`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EllipsisVertical className="size-3.5" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="start"
                    className="z-50 min-w-[140px] rounded-md border border-border bg-popover p-1.5 text-sm shadow-lg"
                  >
                    <DropdownMenu.Item
                      onSelect={() => navigate(recommendationLandingPath(r))}
                      className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                    >
                      Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => navigate(recommendationReportsPath(r))}
                      className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                    >
                      Reporting
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => remove([r.id])}
                      className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                    >
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        );
      case "status":
        return <StatusPill status={r.status} />;
      case "location":
        return (
          <span className="inline-flex rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground">
            {r.location}
          </span>
        );
      case "revenueShare":
        return r.revenueShare == null
          ? NULL_DASH
          : `${r.revenueShare.toFixed(1)}%`;
      case "ctr":
        return r.ctr == null ? NULL_DASH : `${r.ctr.toFixed(1)}%`;
      case "rpvUplift":
        return r.rpvUplift == null ? NULL_DASH : `x${r.rpvUplift.toFixed(2)}`;
      case "tags":
        return r.tags.length === 0 ? (
          NULL_DASH
        ) : (
          <div className="flex flex-wrap gap-1">
            {r.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-xs text-foreground"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(r.id, tag);
                  }}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        );
      case "creator":
        return (
          <span
            title={r.creator}
            className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground"
          >
            {r.creatorInitials}
          </span>
        );
      case "creation":
        return (
          <span className="tabular-nums text-foreground">
            {formatDateTime(r.createdOn)}
          </span>
        );
      case "lastEdit": {
        const formatted = formatDateTime(r.lastEdit);
        return formatted ? (
          <span className="tabular-nums text-foreground">{formatted}</span>
        ) : (
          NULL_DASH
        );
      }
      case "id":
        return <span className="tabular-nums text-foreground">{r.id}</span>;
      default:
        return NULL_DASH;
    }
  };

  const hasSelection = selected.size > 0;

  const renderRow = (r: Recommendation, _i?: number) => (
    <tr
      key={r.id}
      className="group border-b border-border last:border-b-0 hover:bg-[var(--table-row-hover,_var(--muted))]"
    >
      <td
        className={cn(
          "px-3 align-middle",
          DENSITY_PAD[rowDensity],
          STICKY_BODY
        )}
        style={stickyCheckboxStyle(false)}
      >
        <Checkbox
          checked={selected.has(r.id)}
          onCheckedChange={() => toggleRow(r.id)}
          aria-label={`Select ${r.name}`}
        />
      </td>
      {columns.map((col) => {
        const width = effWidth(col);
        return (
          <td
            key={col.id}
            className={cn(
              "px-3 align-middle text-sm text-foreground",
              DENSITY_PAD[rowDensity],
              col.align === "right" && "text-right",
              col.align === "center" && "text-center",
              col.id === "name" && cn(STICKY_BODY, "relative overflow-hidden")
            )}
            style={columnStyle(col, width)}
          >
            {renderCell(r, col)}
            {col.id === "name" && (
              <span className={NAME_EDGE_OVERLAY} aria-hidden />
            )}
          </td>
        );
      })}
    </tr>
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table
          className="w-max border-collapse text-sm"
          style={{ minWidth: Math.max(tableWidth, 960) }}
        >
          <thead>
            {hasSelection ? (
              <tr className="border-b border-border bg-muted/50">
                <td colSpan={columns.length + 1} className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={headerState}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                    <span className="text-sm font-medium">
                      {selected.size} selected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        remove([...selected]);
                        clearSelection();
                      }}
                      className="h-auto gap-1.5 px-2.5 py-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="ml-auto h-auto px-0 py-0 text-muted-foreground"
                    >
                      Clear selection
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr className="border-b border-border bg-listing-header text-listing-header-foreground">
                <th
                  className={cn("px-3 py-2.5", STICKY_HEAD)}
                  style={stickyCheckboxStyle(true)}
                >
                  <Checkbox
                    checked={headerState}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                {columns.map((col) => {
                  const width = effWidth(col);
                  return (
                    <th
                      key={col.id}
                      className={cn(
                        "whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-listing-header-foreground",
                        col.align === "right" && "text-right",
                        col.sortable && "cursor-pointer select-none",
                        col.id === "name" && cn(STICKY_HEAD, "relative")
                      )}
                      style={
                        col.id === "name"
                          ? stickyNameStyle(width, true)
                          : { width, minWidth: width }
                      }
                      onClick={() => toggleSort(col)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortIcon(col)}
                      </span>
                      {col.id === "name" && (
                        <span className={NAME_EDGE_OVERLAY} aria-hidden />
                      )}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-3 py-16 text-center text-muted-foreground"
                >
                  {search.trim()
                    ? "No recommendations match your search."
                    : "Nothing here yet."}
                </td>
              </tr>
            ) : grouped && groups ? (
              groups.map((group) => {
                const isCollapsed = collapsed.has(group.key);
                return (
                  <GroupSection
                    key={group.key}
                    group={group}
                    isCollapsed={isCollapsed}
                    onToggle={() =>
                      setCollapsed((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.key)) next.delete(group.key);
                        else next.add(group.key);
                        return next;
                      })
                    }
                    colSpan={columns.length + 1}
                    renderRow={renderRow}
                  />
                );
              })
            ) : (
              pageRows.map(renderRow)
            )}
          </tbody>
        </table>
      </div>

      {!grouped && totalResults > 0 && (
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

function GroupSection({
  group,
  isCollapsed,
  onToggle,
  colSpan,
  renderRow,
}: {
  group: { key: string; rows: Recommendation[] };
  isCollapsed: boolean;
  onToggle: () => void;
  colSpan: number;
  renderRow: (r: Recommendation, i: number) => React.ReactNode;
}) {
  return (
    <>
      <tr className="border-b border-border bg-canvas">
        <td colSpan={colSpan} className="p-0">
          <button
            type="button"
            onClick={onToggle}
            className="sticky left-0 flex w-max max-w-full items-center gap-2 bg-canvas px-3 py-2 text-sm"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isCollapsed && "-rotate-90"
              )}
            />
            <span className="text-sm font-medium text-foreground">
              {group.key}
            </span>
            <span className="text-muted-foreground">({group.rows.length})</span>
          </button>
        </td>
      </tr>
      {!isCollapsed && group.rows.map(renderRow)}
    </>
  );
}
