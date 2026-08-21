// Recommendations table — WE pagination / chrome; Figma columns; row actions navigate.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  EllipsisVertical,
  Pencil,
  Trash2,
  X,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
const PAGE_SIZES = [10, 25, 50];
const PAGER_BUTTON =
  "h-7 w-7 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40";

const DENSITY_PAD = {
  compact: "py-2",
  default: "py-3",
  comfortable: "py-4",
} as const;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const NULL_DASH = <span className="text-sm text-muted-foreground">–</span>;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const hours = d.getUTCHours();
  const mins = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${date} ${h12}:${mins} ${ampm}`;
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
    setPageSize,
    setSort,
  } = useRecommendationTableStore();
  const remove = useRecommendationRowsStore((s) => s.remove);
  const removeTag = useRecommendationRowsStore((s) => s.removeTag);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set());
  }, [sorted]);

  const columns = visibleColumns
    .map((id) => RECOMMENDATION_COLUMNS.find((c) => c.id === id))
    .filter((c): c is RecommendationColumnDef => c !== undefined);

  const effWidth = (col: RecommendationColumnDef) =>
    columnWidths[col.id] ?? col.width;
  const tableWidth =
    CHECKBOX_COL_WIDTH + columns.reduce((sum, col) => sum + effWidth(col), 0);

  const grouped = groups !== null;
  const totalResults = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = grouped
    ? sorted
    : sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalResults);
  const showControls = !grouped && totalResults > pageSize;

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
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-medium text-foreground group-hover:underline">
              {r.name}
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
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
      case "location":
        return (
          <span className="inline-flex rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground">
            {r.location}
          </span>
        );
      case "revenueShare":
        return `${r.revenueShare.toFixed(1)}%`;
      case "ctr":
        return `${r.ctr.toFixed(1)}%`;
      case "rpvUplift":
        return `x${r.rpvUplift.toFixed(1)}`;
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
      case "lastEdit":
        return (
          <span className="tabular-nums text-foreground">
            {formatDateTime(r.lastEdit)}
          </span>
        );
      default:
        return NULL_DASH;
    }
  };

  const hasSelection = selected.size > 0;

  const renderRow = (r: Recommendation, i: number) => (
    <tr
      key={r.id}
      className={cn(
        "group border-b border-border last:border-b-0 hover:bg-[hsl(var(--table-row-hover,_var(--muted)/0.4))]",
        i % 2 === 1 && "bg-muted/20"
      )}
    >
      <td className={cn("px-3 align-middle", DENSITY_PAD[rowDensity])}>
        <Checkbox
          checked={selected.has(r.id)}
          onCheckedChange={() => toggleRow(r.id)}
          aria-label={`Select ${r.name}`}
        />
      </td>
      {columns.map((col) => (
        <td
          key={col.id}
          className={cn(
            "px-3 align-middle text-sm text-foreground",
            DENSITY_PAD[rowDensity],
            col.align === "right" && "text-right",
            col.align === "center" && "text-center"
          )}
        >
          {renderCell(r, col)}
        </td>
      ))}
      <td aria-hidden />
    </tr>
  );

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="overflow-x-auto">
          <table
            className="w-full table-fixed border-collapse text-sm"
            style={{ minWidth: tableWidth }}
          >
            <colgroup>
              <col style={{ width: CHECKBOX_COL_WIDTH }} />
              {columns.map((col) => (
                <col key={col.id} style={{ width: effWidth(col) }} />
              ))}
              <col />
            </colgroup>
            <thead>
              {hasSelection ? (
                <tr className="border-b border-border bg-muted/50">
                  <td colSpan={columns.length + 2} className="px-3 py-2">
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
                  <th className="px-3 py-2.5">
                    <Checkbox
                      checked={headerState}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className={cn(
                        "whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-listing-header-foreground",
                        col.align === "right" && "text-right",
                        col.sortable && "cursor-pointer select-none"
                      )}
                      onClick={() => toggleSort(col)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortIcon(col)}
                      </span>
                    </th>
                  ))}
                  <th aria-hidden />
                </tr>
              )}
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
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
                      colSpan={columns.length + 2}
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
      </div>

      {totalResults > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">
            {showControls
              ? `${rangeStart}–${rangeEnd} of ${totalResults}`
              : `${totalResults} recommendation${totalResults === 1 ? "" : "s"}`}
          </span>

          {showControls && (
            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger
                  aria-label="Rows per page"
                  className="h-auto w-auto gap-1 bg-background px-2 py-1 text-sm text-foreground shadow-none hover:bg-muted focus:ring-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {totalPages > 1 && (
                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="First page"
                    disabled={currentPage === 1}
                    onClick={() => setPage(1)}
                    className={PAGER_BUTTON}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Previous page"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    className={PAGER_BUTTON}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {pageWindow(currentPage, totalPages).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        "min-w-[28px] rounded-md px-2 py-1 text-sm tabular-nums transition-colors",
                        p === currentPage
                          ? "bg-secondary font-medium text-secondary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Next page"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className={PAGER_BUTTON}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Last page"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(totalPages)}
                    className={PAGER_BUTTON}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
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
