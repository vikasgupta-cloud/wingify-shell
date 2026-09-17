// @summary Board/report canvas with dummy KPI + SVG charts (range-aware).
// Boards list linked reports; nested reports link back to their parent board.
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Calendar,
  LayoutGrid,
  LineChart,
  Plus,
} from "@/components/icons/protoLucide";
import {
  BarBreakdownCard,
  DonutCard,
  KpiStrip,
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
  analyticsItemPath,
  getAnalyticsItem,
  getAnalyticsParentBoard,
  getReportsForBoard,
  type AnalyticsOverviewItem,
} from "@/data/analyticsOverview";
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

function LinkedReportsCard({ reports }: { reports: AnalyticsOverviewItem[] }) {
  if (reports.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">
          Reports on this board ({reports.length})
        </p>
        <p className="text-xs text-muted-foreground">
          Open any linked report — return via Part of board or the Board tab
        </p>
      </div>
      <ul className="divide-y divide-border">
        {reports.map((report) => (
          <li key={report.id}>
            <Link
              to={analyticsItemPath(report.id)}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                <LineChart className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {report.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {report.editedLabel}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParentBoardCard({ board }: { board: AnalyticsOverviewItem }) {
  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">Part of board</p>
      </div>
      <Link
        to={analyticsItemPath(board.id)}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--info-bg)] text-[var(--info-fg)]">
          <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {board.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Open board · switch sibling reports from the name menu
          </span>
        </span>
      </Link>
    </div>
  );
}

export default function AnalyticsItemDetailPage() {
  const { entityId = "" } = useParams();
  const item = getAnalyticsItem(entityId);
  const [range, setRange] = useState<AnalyticsRange>("7D");
  const [description, setDescription] = useState("");

  if (!item) {
    return <Navigate to="/analytics/overview" replace />;
  }

  const boardData =
    item.kind === "board" ? getBoardChartData(item.id, range) : null;
  const reportData =
    item.kind === "report" ? getReportChartData(item.id, range) : null;
  const linkedReports =
    item.kind === "board" ? getReportsForBoard(item.id) : [];
  const parentBoard =
    item.kind === "report" ? getAnalyticsParentBoard(item) : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-8 pb-16 pt-8">
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
          {boardData ? (
            <>
              <LinkedReportsCard reports={linkedReports} />
              <KpiStrip items={boardData.kpis} />
              <div className="grid gap-4 lg:grid-cols-2">
                <LineTrendCard
                  title="Sessions over time"
                  subtitle={`Range · ${range}`}
                  points={boardData.traffic}
                />
                <DonutCard title="Traffic mix" slices={boardData.mix} />
              </div>
              <BarBreakdownCard title="Funnel" rows={boardData.funnels} />
            </>
          ) : null}

          {reportData ? (
            <>
              {parentBoard ? <ParentBoardCard board={parentBoard} /> : null}
              <KpiStrip items={reportData.kpis} />
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
