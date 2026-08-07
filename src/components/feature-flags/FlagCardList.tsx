// Feature Flags card layout — name + created meta; optional env / variation count.

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
import { useFlagTableStore } from "@/store/flagTable";
import { useFlagPipeline } from "./useFlagPipeline";

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

function formatLongDate(iso: string) {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export default function FlagCardList() {
  const sorted = useFlagPipeline();
  const { page, pageSize, setPage, setPageSize } = useFlagTableStore();
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
      <ul className="space-y-3">
        {pageRows.map((f) => (
          <li
            key={f.id}
            className="rounded-lg border border-border bg-background"
          >
            <div className="flex flex-wrap items-start gap-3 px-4 py-4">
              <Checkbox
                checked={selected.has(f.id)}
                onCheckedChange={() => toggleRow(f.id)}
                aria-label={`Select ${f.name}`}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {f.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Created by {f.createdBy} on {formatLongDate(f.createdOn)}
                </p>
                {(f.environment || f.variations !== null) && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm text-foreground">
                    {f.environment && (
                      <span className="font-medium">{f.environment}</span>
                    )}
                    {f.variations !== null && (
                      <span className="tabular-nums text-muted-foreground">
                        {f.variations}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

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
