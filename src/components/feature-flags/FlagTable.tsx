// Feature Flags table — WE/Survey interaction model without status.

import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  EllipsisVertical,
  Flag,
  Trash2,
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
  FLAG_COLUMNS,
  type FlagColumnDef,
  type FlagColumnId,
} from "@/config/flagColumns";
import type { FeatureFlag } from "@/data/featureFlags";
import { useFlagRowsStore } from "@/store/flagRows";
import { useFlagTableStore } from "@/store/flagTable";
import {
  useActiveFlagViewState,
  useFlagViewsStore,
} from "@/store/flagViews";
import { cn } from "@/lib/utils";
import { useFlagPipeline } from "./useFlagPipeline";

const CHECKBOX_COL_WIDTH = 44;
const PAGE_SIZES = [10, 25, 50];
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

const DENSITY_PAD = {
  compact: "py-2",
  default: "py-3",
  comfortable: "py-4",
} as const;

const NULL_DASH = <span className="text-sm text-muted-foreground">–</span>;

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function FlagTable() {
  const sorted = useFlagPipeline();
  const { visibleColumns, sort, columnWidths } = useActiveFlagViewState();
  const updateDraft = useFlagViewsStore((s) => s.updateActiveViewDraft);
  const remove = useFlagRowsStore((s) => s.remove);
  const { page, pageSize, rowDensity, setPage, setPageSize } =
    useFlagTableStore();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set());
  }, [sorted]);

  const columns = visibleColumns
    .map((id) => FLAG_COLUMNS.find((c) => c.id === id))
    .filter((c): c is FlagColumnDef => c !== undefined);

  const effWidth = (col: FlagColumnDef) => columnWidths[col.id] ?? col.width;
  const tableWidth =
    CHECKBOX_COL_WIDTH + columns.reduce((sum, col) => sum + effWidth(col), 0);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalResults = sorted.length;
  const rangeStart = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalResults);

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

  const toggleSort = (col: FlagColumnDef) => {
    if (!col.sortable) return;
    if (sort?.column !== col.id) {
      updateDraft({ sort: { column: col.id, dir: "asc" } });
      return;
    }
    if (sort.dir === "asc") {
      updateDraft({ sort: { column: col.id, dir: "desc" } });
      return;
    }
    updateDraft({ sort: null });
  };

  const sortIcon = (col: FlagColumnDef) => {
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

  const renderCell = (f: FeatureFlag, col: FlagColumnDef) => {
    switch (col.id as FlagColumnId) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <Flag className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="truncate font-medium text-foreground">
                  {f.name}
                </span>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 group-hover:opacity-100"
                      aria-label={`${f.name} actions`}
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
                        onSelect={() => remove([f.id])}
                        className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                      >
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
          </div>
        );
      case "id":
        return f.id;
      case "createdOnBy":
        return (
          <span>
            <span className="block leading-snug">{formatDate(f.createdOn)}</span>
            <span className="block text-xs text-muted-foreground">
              by {f.createdBy}
            </span>
          </span>
        );
      case "environment":
        return f.environment ?? NULL_DASH;
      case "variations":
        return f.variations ?? NULL_DASH;
      default:
        return NULL_DASH;
    }
  };

  const hasSelection = selected.size > 0;

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
              {pageRows.map((f, i) => (
                <tr
                  key={f.id}
                  className={cn(
                    "group border-b border-border last:border-b-0 hover:bg-muted/40",
                    i % 2 === 1 && "bg-muted/20"
                  )}
                >
                  <td className={cn("px-3 align-middle", DENSITY_PAD[rowDensity])}>
                    <Checkbox
                      checked={selected.has(f.id)}
                      onCheckedChange={() => toggleRow(f.id)}
                      aria-label={`Select ${f.name}`}
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "px-3 align-middle",
                        DENSITY_PAD[rowDensity],
                        col.align === "right" && "text-right tabular-nums",
                        col.id !== "name" && "overflow-hidden"
                      )}
                    >
                      {renderCell(f, col)}
                    </td>
                  ))}
                  <td aria-hidden />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>Showing results</span>
            <span className="text-foreground">
              {rangeStart}–{rangeEnd} of {totalResults}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage <= 1}
              onClick={() => setPage(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage <= 1}
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 tabular-nums text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
