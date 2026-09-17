/** Board/report canvas with dummy SVG charts (range-aware).
 *  Board charts open linked reports; report pages skip the KPI strip. */
import { useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { Calendar, Plus } from "@/components/icons/protoLucide";
import {
  BarBreakdownCard,
  DonutCard,
  LineTrendCard,
} from "@/components/analytics/AnalyticsCharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getBoardChartData,
  getReportChartData,
  type AnalyticsRange,
} from "@/data/analyticsCharts";
import {
  analyticsBaseFromPath,
  analyticsItemPath,
  getAnalyticsItem,
  getBoardChartReportIds,
  withAnalyticsNameOverride,
} from "@/data/analyticsOverview";
import { useAnalyticsRowsStore } from "@/store/analyticsRows";
import { cn } from "@/lib/utils";

const RANGE_PRESETS: AnalyticsRange[] = [
  "Today",
  "Yesterday",
  "7D",
  "30D",
  "3M",
  "6M",
  "12M",
];

/** Visual-only add control — no action until widgets are wired. */
function AddStub({ label }: { label: string }) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center self-stretch px-1"
    >
      <span
        title={label}
        className="inline-flex size-9 items-center justify-center rounded-full border border-dashed border-border bg-background text-muted-foreground"
      >
        <Plus className="size-4" strokeWidth={1.75} />
      </span>
    </div>
  );
}

export default function AnalyticsItemDetailPage() {
  const { entityId = "" } = useParams();
  const { pathname } = useLocation();
  const listBase = analyticsBaseFromPath(pathname);
  const nameOverrides = useAnalyticsRowsStore((s) => s.nameOverrides);
  const raw = getAnalyticsItem(entityId);
  const item = raw ? withAnalyticsNameOverride(raw, nameOverrides) : undefined;
  const [range, setRange] = useState<AnalyticsRange>("7D");
  const [description, setDescription] = useState("");

  if (!item) {
    return <Navigate to={listBase} replace />;
  }

  const boardData =
    item.kind === "board" ? getBoardChartData(item.id, range) : null;
  const reportData =
    item.kind === "report" ? getReportChartData(item.id, range) : null;
  const chartReports =
    item.kind === "board" ? getBoardChartReportIds(item.id) : null;
  const reportPath = (reportId: string | undefined) =>
    reportId
      ? analyticsItemPath(reportId, { boardId: item.id, basePath: listBase })
      : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-8 pb-16 pt-8">
      {item.kind === "board" ? (
        <div className="space-y-2">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            aria-label="Description"
            className="h-8 max-w-md border-transparent bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-border focus-visible:bg-background focus-visible:px-2"
          />
          <p className="text-xs text-muted-foreground">
            Created by {item.createdBy}
            <span className="mx-1.5 text-border">·</span>
            {item.lastEditedDetail}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Date range"
          className="inline-flex flex-wrap rounded-md border border-border bg-background p-0.5"
        >
          {RANGE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setRange(preset)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                range === preset
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {preset}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          disabled
          aria-label="Custom date range"
        >
          <Calendar className="size-3.5" strokeWidth={1.75} aria-hidden />
          Custom
        </Button>
      </div>

      <div className="flex items-stretch gap-2">
        <AddStub label="Add widget" />
        <div className="min-w-0 flex-1 space-y-4">
          {boardData && chartReports ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <LineTrendCard
                  title="Sessions over time"
                  subtitle={`Range · ${range}`}
                  points={boardData.traffic}
                  to={reportPath(chartReports.traffic)}
                />
                <DonutCard
                  title="Traffic mix"
                  slices={boardData.mix}
                  to={reportPath(chartReports.mix)}
                />
              </div>
              <BarBreakdownCard
                title="Funnel"
                rows={boardData.funnels}
                to={reportPath(chartReports.funnel)}
              />
            </>
          ) : null}

          {reportData ? (
            <>
              <LineTrendCard
                title="Trend"
                subtitle={`Range · ${range}`}
                points={reportData.series}
              />
              <BarBreakdownCard
                title="Device breakdown"
                rows={reportData.breakdown}
              />
            </>
          ) : null}
        </div>
        <AddStub label="Add widget" />
      </div>
    </div>
  );
}
