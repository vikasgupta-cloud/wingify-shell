// Shared Feature Management report listing page (rollout / testing / MVT / personalize).

import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FlagReportViewBar from "@/components/flag-reports/FlagReportViewBar";
import FlagReportFilterBar from "@/components/flag-reports/FlagReportFilterBar";
import FlagReportColumnConfig from "@/components/flag-reports/FlagReportColumnConfig";
import FlagReportTable from "@/components/flag-reports/FlagReportTable";
import FlagReportCardList from "@/components/flag-reports/FlagReportCardList";
import {
  FLAG_REPORT_CONFIG,
  type FlagReportKind,
} from "@/config/flagReports";
import { getFlagReportTableStore } from "@/store/flagReportTable";
import {
  FLAG_REPORT_OVERVIEW_ID,
  getFlagReportViewsStore,
  useActiveFlagReportViewState,
} from "@/store/flagReportViews";

export default function FlagReportPage({ kind }: { kind: FlagReportKind }) {
  const config = FLAG_REPORT_CONFIG[kind];
  const Icon = config.icon;
  const tableStore = getFlagReportTableStore(kind);
  const searchValue = tableStore((s) => s.search);
  const setSearchValue = tableStore((s) => s.setSearch);
  const { layout } = useActiveFlagReportViewState(kind);
  const isOverview = getFlagReportViewsStore(kind)(
    (s) => s.activeViewId === FLAG_REPORT_OVERVIEW_ID
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 px-12 pt-10">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background">
            <Icon className="size-4 text-foreground" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h1 className="w-fit cursor-default text-2xl font-semibold tracking-tight text-foreground">
                      {config.title}
                    </h1>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start">
                    {config.subtitle}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto gap-1.5 px-0 py-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                <Sparkles className="size-3.5" aria-hidden />
                Summarize
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-12 pb-12 pt-8">
        <FlagReportViewBar kind={kind} />
        {isOverview ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-border bg-background text-center">
            <p className="text-sm font-medium text-foreground">Coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              An overview of {config.title.toLowerCase()} will live here.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex w-72 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search…"
                  className="h-auto border-0 bg-transparent px-0 py-0 text-foreground shadow-none focus-visible:ring-0"
                />
              </div>
              <FlagReportFilterBar kind={kind} />
              <div className="ml-auto flex items-center gap-2">
                {layout === "table" && <FlagReportColumnConfig kind={kind} />}
              </div>
            </div>

            {layout === "table" ? (
              <FlagReportTable kind={kind} />
            ) : (
              <FlagReportCardList kind={kind} />
            )}
          </>
        )}
      </div>
    </>
  );
}
