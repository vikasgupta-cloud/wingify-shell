import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SearchX,
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
  FLAG_REPORT_CONFIG,
  type FlagReportKind,
} from "@/config/flagReports";
import { getFlagReportTableStore } from "@/store/flagReportTable";
import { useFlagReportPipeline } from "./useFlagReportPipeline";

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

function formatDate(iso: string | null) {
  if (!iso) return "–";
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function FlagReportCardList({
  kind,
}: {
  kind: FlagReportKind;
}) {
  const config = FLAG_REPORT_CONFIG[kind];
  const Icon = config.icon;
  const sorted = useFlagReportPipeline(kind);
  const tableStore = getFlagReportTableStore(kind);
  const page = tableStore((s) => s.page);
  const pageSize = tableStore((s) => s.pageSize);
  const setPage = tableStore((s) => s.setPage);
  const setPageSize = tableStore((s) => s.setPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelected(new Set());
  }, [sorted]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-3">
      {pageRows.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background text-muted-foreground">
          <SearchX className="size-10 opacity-50" aria-hidden />
          <p className="text-sm font-medium text-foreground">No data found.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pageRows.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-border bg-background"
            >
              <div className="flex flex-wrap items-start gap-3 px-4 py-4">
                <Checkbox
                  checked={selected.has(row.id)}
                  onCheckedChange={() => toggleRow(row.id)}
                  aria-label={`Select ${row.name}`}
                  className="mt-0.5"
                />
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {row.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    ID {row.id} · Created by {row.createdBy} on{" "}
                    {formatDate(row.createdOn)}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                      {row.environment}
                    </span>
                    {row.rules !== null && (
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {row.rules}
                        </span>{" "}
                        Rules
                      </span>
                    )}
                    {row.variations !== null && (
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {row.variations}
                        </span>{" "}
                        Variations
                      </span>
                    )}
                    {row.combinations !== null && (
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {row.combinations}
                        </span>{" "}
                        Combinations
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {row.visitors}
                      </span>{" "}
                      Visitors
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
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
  );
}
