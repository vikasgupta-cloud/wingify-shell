// Surveys card layout — list cards with URL, metrics, and changeable status.

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
import { formatSurveyMetric, type SurveyStatus } from "@/data/surveys";
import { useSurveyTableStore } from "@/store/surveyTable";
import { cn } from "@/lib/utils";
import SurveyStatusMenu from "./SurveyStatusMenu";
import { useSurveyPipeline } from "./useSurveyPipeline";

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

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const ACCENT: Record<SurveyStatus, string> = {
  Draft: "bg-status-draft-fg",
  Running: "bg-status-running-fg",
  Paused: "bg-status-paused-fg",
};

export default function SurveyCardList() {
  const sorted = useSurveyPipeline();
  const { page, pageSize, setPage, setPageSize } = useSurveyTableStore();
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
        {pageRows.map((s) => (
          <li
            key={s.id}
            className="relative overflow-hidden rounded-lg border border-border bg-background"
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-0 w-1",
                ACCENT[s.status]
              )}
            />
            <div className="flex flex-wrap items-start justify-between gap-4 py-4 pl-5 pr-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <Checkbox
                  checked={selected.has(s.id)}
                  onCheckedChange={() => toggleRow(s.id)}
                  aria-label={`Select ${s.name}`}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {s.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {s.url}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-foreground">
                    <span>
                      <span className="font-medium">
                        {formatSurveyMetric(s.displayed)}
                      </span>{" "}
                      <span className="text-muted-foreground">Displayed</span>
                    </span>
                    <span>
                      <span className="font-medium">
                        {formatSurveyMetric(s.attempted)}
                      </span>{" "}
                      <span className="text-muted-foreground">Attempted</span>
                    </span>
                    <span>
                      <span className="font-medium">
                        {formatSurveyMetric(s.completed)}
                      </span>{" "}
                      <span className="text-muted-foreground">Completed</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-3">
                <SurveyStatusMenu survey={s} />
                <p className="text-xs text-muted-foreground">
                  Created by {s.createdBy} on {formatDate(s.createdOn)}
                </p>
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
