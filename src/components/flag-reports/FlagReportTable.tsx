import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VitalsGlyph } from "@/components/ui/StatusBadge";
import {
  FLAG_REPORT_CONFIG,
  type FlagReportColumnDef,
  type FlagReportColumnId,
  type FlagReportKind,
  type FlagReportRow,
} from "@/config/flagReports";
import {
  getFlagReportViewsStore,
  useActiveFlagReportViewState,
} from "@/store/flagReportViews";
import { getFlagReportTableStore } from "@/store/flagReportTable";
import { cn } from "@/lib/utils";
import { useFlagReportPipeline } from "./useFlagReportPipeline";

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

function formatDate(iso: string | null) {
  if (!iso) return NULL_DASH;
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function FlagReportTable({ kind }: { kind: FlagReportKind }) {
  const config = FLAG_REPORT_CONFIG[kind];
  const Icon = config.icon;
  const sorted = useFlagReportPipeline(kind);
  const { visibleColumns, sort, columnWidths } =
    useActiveFlagReportViewState(kind);
  const updateDraft = getFlagReportViewsStore(kind)(
    (s) => s.updateActiveViewDraft
  );
  const tableStore = getFlagReportTableStore(kind);
  const page = tableStore((s) => s.page);
  const pageSize = tableStore((s) => s.pageSize);
  const rowDensity = tableStore((s) => s.rowDensity);
  const setPage = tableStore((s) => s.setPage);
  const setPageSize = tableStore((s) => s.setPageSize);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    setSelected(new Set());
  }, [sorted]);

  const columns = visibleColumns
    .map((id) => config.columns.find((c) => c.id === id))
    .filter((c): c is FlagReportColumnDef => c !== undefined);

  const effWidth = (col: FlagReportColumnDef) =>
    columnWidths[col.id] ?? col.width;
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

  const toggleSort = (col: FlagReportColumnDef) => {
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

  const sortIcon = (col: FlagReportColumnDef) => {
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

  const renderCell = (row: FlagReportRow, col: FlagReportColumnDef) => {
    switch (col.id as FlagReportColumnId) {
      case "name":
        return (
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
              <Icon className="size-3.5 text-foreground" aria-hidden />
            </span>
            <span className="truncate font-medium text-foreground">
              {row.name}
            </span>
          </div>
        );
      case "id":
        return row.id;
      case "vitals":
        if (!row.vitals) return NULL_DASH;
        return (
          <VitalsGlyph
            size={16}
            className={
              row.vitals === "healthy"
                ? "text-vitals-healthy"
                : "text-vitals-unhealthy"
            }
          />
        );
      case "environment":
        return (
          <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
            {row.environment}
          </span>
        );
      case "rules":
        return row.rules ?? NULL_DASH;
      case "variations":
        return row.variations ?? NULL_DASH;
      case "combinations":
        return row.combinations ?? NULL_DASH;
      case "visitors":
        return row.visitors;
      case "uniqueConversions":
        return row.uniqueConversions;
      case "startedOn":
        return formatDate(row.startedOn);
      case "createdOnBy":
        return (
          <span>
            <span className="block leading-snug">
              {formatDate(row.createdOn)}
            </span>
            <span className="block text-xs text-muted-foreground">
              by {row.createdBy}
            </span>
          </span>
        );
      default:
        return NULL_DASH;
    }
  };

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
              <tr className="border-b border-border bg-muted">
                <th className="px-3 py-2.5">
                  <Checkbox
                    checked={headerState}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                    disabled={pageRows.length === 0}
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted-foreground",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
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
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-3 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <SearchX className="size-10 opacity-50" aria-hidden />
                      <p className="text-sm font-medium text-foreground">
                        No data found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-border last:border-b-0 hover:bg-muted/40"
                  >
                    <td
                      className={cn(
                        "px-3 align-middle",
                        DENSITY_PAD[rowDensity]
                      )}
                    >
                      <Checkbox
                        checked={selected.has(row.id)}
                        onCheckedChange={() => toggleRow(row.id)}
                        aria-label={`Select ${row.name}`}
                      />
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "px-3 align-middle",
                          DENSITY_PAD[rowDensity],
                          col.align === "right" && "text-right tabular-nums",
                          col.align === "center" && "text-center",
                          col.id !== "name" && "overflow-hidden"
                        )}
                      >
                        {renderCell(row, col)}
                      </td>
                    ))}
                    <td aria-hidden />
                  </tr>
                ))
              )}
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
            {totalResults > 0 && (
              <span className="text-foreground">
                {rangeStart}–{rangeEnd} of {totalResults}
              </span>
            )}
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
