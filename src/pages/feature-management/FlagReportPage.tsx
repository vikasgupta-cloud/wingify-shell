// Shared Feature Management report listing page (rollout / testing / MVT / personalize).
// Page title header removed — product pages rely on breadcrumb / sub-nav.

import { Search } from "@/components/icons/protoLucide";
import { Input } from "@/components/ui/input";
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
  const tableStore = getFlagReportTableStore(kind);
  const searchValue = tableStore((s) => s.search);
  const setSearchValue = tableStore((s) => s.setSearch);
  const { layout } = useActiveFlagReportViewState(kind);
  const isOverview = getFlagReportViewsStore(kind)(
    (s) => s.activeViewId === FLAG_REPORT_OVERVIEW_ID
  );

  return (
    <div className="px-12 pb-12 pt-10">
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
  );
}
