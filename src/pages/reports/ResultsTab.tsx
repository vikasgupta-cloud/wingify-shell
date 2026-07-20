import { Fragment, useState, type ReactNode } from "react";
import {
  Award,
  CalendarRange,
  ChevronDown,
  Columns3,
  Compass,
  HelpCircle,
  Layers,
  LayoutPanelTop,
  MousePointerClick,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  PieChart,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import type { Campaign, Variant } from "../../data/campaigns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  REPORT_DIMENSION_OPTIONS,
  REPORT_SEGMENT_OPTIONS,
  fromYmd,
  toYmd,
  useReportActiveViewState,
  useReportViewsStore,
  type ReportDateRange,
} from "../../store/reportViews";
import DateRangeDropdown, { type DateRange } from "./DateRangeDropdown";
import ReportViewBar from "./ReportViewBar";

const WINNER_THRESHOLD = 95;

// Column template shared by the header, sub-head and every data row so the
// whole table stays aligned.
const GRID = {
  gridTemplateColumns:
    "minmax(220px,1.6fr) 110px 120px minmax(190px,1.2fr) minmax(300px,1.5fr) 40px",
} as const;

const formatNumber = (n: number) => n.toLocaleString("en-US");

function variantVisitors(campaign: Campaign, index: number): number {
  const total = campaign.visitors;
  const count = campaign.report.variants.length;
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return base + (index < remainder ? 1 : 0);
}

function variantConversions(variant: Variant, visitors: number): number {
  return Math.max(1, Math.round((visitors * variant.convRate) / 100));
}

function hashMetricSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Per-metric dummy stats — primary uses campaign data; others are seeded by name. */
function metricRowStats(
  campaign: Campaign,
  metricName: string,
  variant: Variant,
  index: number
): { uplift: number | null; confidence: number | null; conversions: number } {
  const visitors = variantVisitors(campaign, index);
  if (metricName === campaign.primaryMetric) {
    return {
      uplift: variant.uplift,
      confidence: variant.confidence,
      conversions: variantConversions(variant, visitors),
    };
  }
  const seed = hashMetricSeed(`${campaign.id}:${metricName}:${variant.id}`);
  const rng = (min: number, max: number) => min + (seed % (max - min + 1));
  const controlRate = rng(15, 120) / 10;
  if (index === 0) {
    return {
      uplift: null,
      confidence: null,
      conversions: Math.max(1, Math.round((visitors * controlRate) / 100)),
    };
  }
  const uplift = Number(((rng(-80, 280) - 100) / 10).toFixed(1));
  const confidence = rng(42, 98);
  const convRate = controlRate * (1 + uplift / 100);
  return {
    uplift,
    confidence,
    conversions: Math.max(1, Math.round((visitors * convRate) / 100)),
  };
}

type BadgeTone = "ctrl" | "v1" | "v2" | "total";

function badgeTone(index: number, isTotal = false): BadgeTone {
  if (isTotal) return "total";
  if (index === 0) return "ctrl";
  return index % 2 === 1 ? "v1" : "v2";
}

function GraphBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex h-5 min-w-[28px] shrink-0 items-center justify-center rounded-full border px-2 text-xs font-medium",
        tone === "ctrl" && "border-border bg-muted text-muted-foreground",
        tone === "v1" && "border-border bg-secondary text-foreground",
        tone === "v2" && "border-foreground/30 bg-background text-foreground",
        tone === "total" && "border-transparent bg-muted-foreground text-background"
      )}
    >
      {children}
    </span>
  );
}

const activeTabClass =
  "-mb-px border-b-2 border-foreground font-medium text-foreground";

// ---------------------------------------------------------------------------
// Filter bar

function FunnelIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1.5 2h11l-4.2 5v4l-2.6 1.3V7z" />
    </svg>
  );
}

function MultiSelectFilterChip({
  icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const summary =
    value.length === 0
      ? label
      : value.length === 1
        ? value[0]
        : `${value[0]} +${value.length - 1}`;

  const toggle = (option: string) => {
    onChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option]
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm transition-colors hover:bg-muted/60",
            value.length > 0 ? "text-foreground" : "text-foreground/80"
          )}
        >
          {icon}
          <span className="max-w-[140px] truncate">{summary}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="max-h-[240px] space-y-0.5 overflow-y-auto">
          {options.map((option) => {
            const checked = value.includes(option);
            return (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(option)}
                />
                <span className="truncate">{option}</span>
              </label>
            );
          })}
        </div>
        {value.length > 0 && (
          <div className="mt-2 border-t border-border pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="h-auto px-2 py-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function storedToDateRange(range: ReportDateRange): DateRange {
  return {
    id: range.id,
    label: range.label,
    from: fromYmd(range.from),
    to: fromYmd(range.to),
  };
}

function dateRangeToStored(range: DateRange): ReportDateRange {
  return {
    id: range.id,
    label: range.label,
    from: toYmd(range.from),
    to: toYmd(range.to),
  };
}

function FilterBar({
  campaignId,
  right,
}: {
  campaignId: string;
  right?: ReactNode;
}) {
  const { dateRange, segments, dimensions } =
    useReportActiveViewState(campaignId);
  const updateDraft = useReportViewsStore((s) => s.updateActiveViewDraft);

  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-md border border-border bg-background px-4 py-3">
      <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <FunnelIcon className="h-3.5 w-3.5" />
        Filter by :
      </span>
      <DateRangeDropdown
        variant="filter"
        value={storedToDateRange(dateRange)}
        onChange={(range) =>
          updateDraft(campaignId, { dateRange: dateRangeToStored(range) })
        }
      />
      <MultiSelectFilterChip
        icon={<Compass className="h-3.5 w-3.5" aria-hidden />}
        label="Segments"
        options={REPORT_SEGMENT_OPTIONS}
        value={segments}
        onChange={(next) => updateDraft(campaignId, { segments: next })}
      />
      <MultiSelectFilterChip
        icon={<Layers className="h-3.5 w-3.5" aria-hidden />}
        label="Dimensions"
        options={REPORT_DIMENSION_OPTIONS}
        value={dimensions}
        onChange={(next) => updateDraft(campaignId, { dimensions: next })}
      />
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conclusion banner

function ConclusionBanner({ variantName }: { variantName: string }) {
  return (
    <div className="flex items-center gap-3 rounded-t-md border border-border bg-muted/40 px-4 py-3">
      <Award className="h-4 w-4 shrink-0 text-decision-winner-fg" aria-hidden />
      <p className="text-base font-medium text-foreground/80">
        {variantName} is better or equivalent to baseline and the best choice as it gives the
        highest improvement
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric header

function MetricHeader({ metric, isPrimary }: { metric: string; isPrimary: boolean }) {
  return (
    <div className="flex items-start justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <MousePointerClick className="mt-1 h-5 w-5 shrink-0 text-foreground/70" aria-hidden />
        <div className="flex items-center gap-1.5">
          <span className="border-b border-dashed border-muted-foreground pb-0.5 text-base font-medium text-foreground">
            {metric}
          </span>
          {isPrimary && (
            <span className="inline-flex items-center rounded border border-border bg-background px-1.5 py-px text-xs font-medium text-foreground/70">
              Primary
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-md p-1.5">
        <button type="button" className="text-foreground/70 hover:text-foreground" aria-label="Chart view">
          <PieChart className="h-5 w-5" aria-hidden />
        </button>
        <button type="button" className="text-foreground/70 hover:text-foreground" aria-label="Settings">
          <Settings className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner tabs

const INNER_TABS = ["Raw data (visitors)", "Raw data (sessions)", "Statistics"];

function InnerTabs() {
  return (
    <div className="flex items-end gap-4 border-b border-border bg-muted/30 px-4 pt-2">
      <div className="flex flex-1 items-end gap-5">
        {INNER_TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "relative px-1 pb-2 text-sm transition-colors",
              i === 0
                ? activeTabClass
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mb-2 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/50"
        aria-label="Edit"
        disabled
      >
        <Pencil className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table

function HeaderHelp() {
  return (
    <HelpCircle
      className="h-3 w-3 shrink-0 self-center text-muted-foreground"
      aria-hidden
    />
  );
}

function TableHeader() {
  return (
    <>
      {/* Column titles */}
      <div className="grid items-center bg-muted/30" style={GRID}>
        <div className="flex items-center gap-1 py-2 pl-5 pr-4 pt-3">
          <span className="text-xs font-semibold text-foreground/75">Variations</span>
        </div>
        <div className="flex flex-col items-end py-2 pr-2 pt-3">
          <span className="text-right text-xs font-semibold leading-[18px] text-foreground/75">
            Unique
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold leading-[18px] text-foreground/75">
            conversions
            <HeaderHelp />
          </span>
        </div>
        <div className="flex flex-col items-end py-2 pr-2 pt-3">
          <span className="text-right text-xs font-semibold leading-[18px] text-foreground/75">
            Total
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold leading-[18px] text-foreground/75">
            visitors
            <HeaderHelp />
          </span>
        </div>
        <div className="flex flex-col items-center py-2 pt-3">
          <span className="text-center text-xs font-semibold leading-[18px] text-foreground/75">
            Expected
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold leading-[18px] text-foreground/75">
            improvement(v)
            <HeaderHelp />
          </span>
        </div>
        <div className="flex flex-col justify-center gap-0.5 py-2 pl-5 pr-2 pt-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-foreground/75">
              Probability of Better or Equivalent (v)
            </span>
            <HeaderHelp />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            MDE: ± 20%&nbsp;&nbsp;ROPE: 1.5%&nbsp;&nbsp;Power: 80%&nbsp;&nbsp;FPR: 5%
            <Pencil className="h-3 w-3" aria-hidden />
          </div>
        </div>
        <div />
      </div>

      {/* Axis / threshold sub-head */}
      <div className="grid items-stretch border-b border-border bg-muted/60 text-[10px] text-muted-foreground" style={GRID}>
        <div />
        <div />
        <div />
        <div className="flex items-center justify-between px-5 py-0.5">
          <span>-6%</span>
          <span>0%</span>
          <span>6%</span>
        </div>
        <div className="flex items-center justify-end gap-1 pr-1">
          <span>Winner threshold: {WINNER_THRESHOLD}%</span>
          <HeaderHelp />
        </div>
        <div />
      </div>
    </>
  );
}

// The centred mini bar-chart cell for expected improvement. Axis spans -6%..+6%.
function ExpectedImprovementCell({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <div className="flex h-[60px] items-center justify-center border-b border-border">
        <span className="text-xs text-foreground/70">-</span>
      </div>
    );
  }
  const clamped = Math.max(-6, Math.min(6, value));
  const end = ((clamped + 6) / 12) * 100; // position along axis
  const positive = value >= 0;
  const left = Math.min(50, end);
  const width = Math.abs(end - 50);

  return (
    <div className="relative flex h-[60px] items-center border-b border-border px-5">
      <div className="relative h-full flex-1">
        {/* median range band */}
        <div className="absolute inset-y-0 left-1/2 w-[35px] -translate-x-1/2 bg-muted/50" />
        {/* 0% centre line */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
        {/* value bar */}
        <div
          className={cn(
            "absolute top-1/2 h-[15px] -translate-y-1/2 rounded-[1px]",
            positive ? "bg-success-fg" : "bg-danger-fg"
          )}
          style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
        />
        {/* value label */}
        <span
          className="absolute top-[calc(50%-24px)] -translate-x-1/2 whitespace-nowrap text-xs text-foreground/70"
          style={{ left: `${end}%` }}
        >
          {positive ? "" : ""}
          {value.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// The horizontal probability bar. Track spans 0..100%; winner threshold marked.
function ProbabilityCell({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <div className="flex h-[60px] items-center border-b border-border px-5">
        <span className="text-sm font-medium text-foreground/70">-</span>
      </div>
    );
  }
  const isWinner = value >= WINNER_THRESHOLD;
  return (
    <div className="relative flex h-[60px] items-center border-b border-border px-5">
      <div className="relative h-[15px] w-full">
        {isWinner && (
          <span className="absolute -top-[18px] left-0 whitespace-nowrap text-xs font-medium text-success-fg">
            Better than baseline
          </span>
        )}
        {/* track */}
        <div className="absolute inset-0 rounded-[2px] bg-muted" />
        {/* fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-[2px]",
            isWinner ? "bg-success-fg" : "bg-muted-foreground/30"
          )}
          style={{ width: `${value}%` }}
        />
        {/* pct label */}
        <span
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase",
            isWinner ? "text-success-fg" : "text-foreground/70"
          )}
        >
          {value}%
        </span>
        {/* winner-threshold divider spanning the row */}
        <div
          className="absolute top-[-22px] h-[60px] border-r border-dashed border-border"
          style={{ left: `${WINNER_THRESHOLD}%` }}
        />
      </div>
    </div>
  );
}

function DataRow({
  campaign,
  variant,
  index,
  metricName,
}: {
  campaign: Campaign;
  variant: Variant;
  index: number;
  metricName: string;
}) {
  const visitors = variantVisitors(campaign, index);
  const { uplift, confidence, conversions } = metricRowStats(
    campaign,
    metricName,
    variant,
    index
  );
  const tone = badgeTone(index);
  const isControl = index === 0;

  return (
    <div className="grid items-stretch" style={GRID}>
      <div className="flex items-center gap-2 border-b border-border py-3 pl-5 pr-4">
        <GraphBadge tone={tone}>{variant.label}</GraphBadge>
        <span className="text-sm font-medium text-foreground">{variant.name}</span>
        {isControl && (
          <span className="rounded-full bg-muted px-2 text-xs font-medium text-foreground">
            Baseline
          </span>
        )}
      </div>
      <div className="flex items-center justify-end border-b border-border pr-6 text-right text-sm text-foreground">
        {formatNumber(conversions)}
      </div>
      <div className="flex items-center justify-end border-b border-border pr-6 text-right text-sm text-foreground">
        {formatNumber(visitors)}
      </div>
      <ExpectedImprovementCell value={isControl ? null : uplift} />
      <ProbabilityCell value={isControl ? null : confidence} />
      <div className="flex items-center justify-center border-b border-border">
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
          aria-label="Row actions"
        >
          <MoreVertical className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function TotalRow({ conversions, visitors }: { conversions: number; visitors: number }) {
  const cell = "flex items-center border-t border-border py-6";
  return (
    <div className="grid items-stretch" style={GRID}>
      <div className={cn(cell, "gap-2 pl-5 pr-4")}>
        <GraphBadge tone="total">T</GraphBadge>
        <span className="text-sm font-medium text-foreground">Total</span>
      </div>
      <div className={cn(cell, "justify-end pr-6 text-sm text-foreground")}>
        {formatNumber(conversions)}
      </div>
      <div className={cn(cell, "justify-end pr-6 text-sm text-foreground")}>
        {formatNumber(visitors)}
      </div>
      <div className={cn(cell, "justify-center text-sm text-foreground/70")}>-</div>
      <div className={cn(cell, "pl-5 text-sm text-foreground/70")}>-</div>
      <div className={cn(cell, "justify-center")} />
    </div>
  );
}

function ResultsTable({ campaign, metricName }: { campaign: Campaign; metricName: string }) {
  const variants = campaign.report.variants;
  const rows = variants.map((variant, index) => {
    const visitors = variantVisitors(campaign, index);
    const { conversions } = metricRowStats(campaign, metricName, variant, index);
    return { variant, index, visitors, conversions };
  });
  const totalConversions = rows.reduce((sum, r) => sum + r.conversions, 0);
  const totalVisitors = rows.reduce((sum, r) => sum + r.visitors, 0);

  return (
    <div className="overflow-x-auto bg-background">
      <div className="min-w-[900px] shadow-[0px_1px_2px_0px_rgba(65,70,81,0.05)]">
        <TableHeader />
        {rows.map((r) => (
          <DataRow
            key={`${metricName}-${r.variant.id}`}
            campaign={campaign}
            variant={r.variant}
            index={r.index}
            metricName={metricName}
          />
        ))}
        <TotalRow conversions={totalConversions} visitors={totalVisitors} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Graph panel

const GRAPH_TABS = [
  { label: "Date Range Graph", icon: CalendarRange },
  { label: "Expected Improvement Graph", icon: TrendingUp },
];

const Y_AXIS = ["1.00%", "0.90%", "0.80%", "0.70%", "0.60%"];
const X_AXIS = ["Oct 25", "Nov 25", "Dec 25", "Jan 26"];

const CHART_Y_MIN = 0.6;
const CHART_Y_MAX = 1.0;
const CHART_PLOT_H = 172;
const CHART_PLOT_W = 100;
const CHART_POINT_COUNT = 13;
const CHART_MARKER_X = 62;

const CHART_STROKE: Record<Exclude<BadgeTone, "total">, string> = {
  ctrl: "hsl(var(--muted-foreground))",
  v1: "hsl(var(--foreground) / 0.45)",
  v2: "hsl(var(--foreground))",
};

function chartY(value: number): number {
  const t = (value - CHART_Y_MIN) / (CHART_Y_MAX - CHART_Y_MIN);
  return (1 - t) * CHART_PLOT_H;
}

function chartSeriesValues(metricName: string, seriesKey: string): number[] {
  const seed = hashMetricSeed(`${metricName}:date-range:${seriesKey}`);
  const base = seriesKey === "ctrl" ? 0.66 : seriesKey === "v1" ? 0.68 : 0.7;
  const endBias = seriesKey === "ctrl" ? 0.06 : seriesKey === "v1" ? 0.27 : 0.11;
  const values: number[] = [];
  for (let i = 0; i < CHART_POINT_COUNT; i++) {
    const t = i / (CHART_POINT_COUNT - 1);
    const wave = (((seed >> (i % 12)) & 7) - 3.5) * 0.004;
    const v = base + endBias * t + wave;
    values.push(Math.min(CHART_Y_MAX - 0.005, Math.max(CHART_Y_MIN + 0.005, v)));
  }
  return values;
}

function chartLinePath(values: number[]): string {
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * CHART_PLOT_W;
      const y = chartY(v);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function DateRangeLineChart({ metricName }: { metricName: string }) {
  const series: { key: Exclude<BadgeTone, "total">; values: number[] }[] = [
    { key: "ctrl", values: chartSeriesValues(metricName, "ctrl") },
    { key: "v1", values: chartSeriesValues(metricName, "v1") },
    { key: "v2", values: chartSeriesValues(metricName, "v2") },
  ];
  const markerIndex = Math.round((CHART_MARKER_X / CHART_PLOT_W) * (CHART_POINT_COUNT - 1));

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-x-0 top-1.5 h-[172px] w-full"
        viewBox={`0 0 ${CHART_PLOT_W} ${CHART_PLOT_H}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <line
          x1={CHART_MARKER_X}
          x2={CHART_MARKER_X}
          y1={0}
          y2={CHART_PLOT_H}
          stroke="hsl(var(--border))"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          strokeDasharray="4 4"
        />
        {series.map(({ key, values }) => (
          <path
            key={key}
            d={chartLinePath(values)}
            fill="none"
            stroke={CHART_STROKE[key]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div
        className="pointer-events-none absolute inset-x-0 top-1.5 h-[172px]"
        aria-hidden
      >
        {series.map(({ key, values }) => {
          const y = chartY(values[markerIndex] ?? values[values.length - 1]!);
          const topPct = (y / CHART_PLOT_H) * 100;
          return (
            <span
              key={`${key}-marker`}
              className={cn(
                "absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
                key === "ctrl" && "bg-muted-foreground",
                key === "v1" && "bg-foreground/45",
                key === "v2" && "bg-foreground"
              )}
              style={{ left: `${CHART_MARKER_X}%`, top: `${topPct}%` }}
            />
          );
        })}
      </div>
    </>
  );
}

function ChartDropdown({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-1 text-sm font-medium text-foreground"
    >
      {label}
      <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
    </button>
  );
}

function LegendItem({ tone, label, days }: { tone: BadgeTone; label: string; days: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <Checkbox
        defaultChecked
        className="h-5 w-5 rounded-[4px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />
      <span className="flex items-center gap-1.5">
        <GraphBadge tone={tone}>{label}</GraphBadge>
        <span className="text-sm text-foreground">{days}</span>
      </span>
    </label>
  );
}

function GraphPanel({ metricName }: { metricName: string }) {
  return (
    <div className="flex flex-col gap-6 rounded-b-md bg-background px-5 py-6">
      {/* Graph tabs */}
      <div className="flex items-end gap-5 border-b border-border">
        {GRAPH_TABS.map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            type="button"
            className={cn(
              "relative flex items-center gap-1.5 px-1 pb-2 text-sm transition-colors",
              i === 0
                ? activeTabClass
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden />
            {label}
            <HelpCircle className="h-4 w-4 opacity-60" aria-hidden />
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <ChartDropdown label={metricName} />
          <ChartDropdown label="Daily" />
        </div>
        <label className="flex cursor-pointer items-center gap-1.5">
          <Checkbox className="h-4 w-4 rounded-[2px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary" />
          <span className="flex items-center gap-1 text-sm font-medium text-foreground">
            Show ranges
            <HelpCircle className="h-3.5 w-3.5 opacity-60" aria-hidden />
          </span>
        </label>
      </div>

      {/* Chart */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-5">
          {/* Y axis */}
          <div className="flex flex-col justify-between py-1.5 text-right text-xs font-medium text-foreground/70">
            {Y_AXIS.map((v) => (
              <span key={v}>{v}</span>
            ))}
          </div>
          {/* Plot */}
          <div className="relative flex-1">
            <div className="flex flex-col justify-between py-1.5" style={{ height: CHART_PLOT_H }}>
              {Y_AXIS.map((v) => (
                <div key={v} className="h-px w-full bg-border" />
              ))}
            </div>
            <DateRangeLineChart metricName={metricName} />
            {/* X axis */}
            <div className="mt-1.5 flex justify-between px-12 text-xs text-foreground/70">
              {X_AXIS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 pt-2">
          <LegendItem tone="ctrl" label="C" days="30 Days" />
          <LegendItem tone="v1" label="V1" days="14 Days" />
          <LegendItem tone="v2" label="V2" days="7 Days" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric selector (left panel)

const metricsNavAsideClass =
  "sticky top-[var(--reports-tabs-height,0px)] z-10 flex h-[calc(100vh-3.5rem-var(--reports-tabs-height,0px))] shrink-0 self-start flex-col border-r border-border bg-background transition-[width] duration-200 motion-reduce:transition-none";

function MetricsNavShell({
  collapsed,
  onToggleCollapsed,
  children,
  footer,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (collapsed) {
    return (
      <aside className={cn(metricsNavAsideClass, "w-11")}>
        <div className="flex-1" />
        <div className="flex justify-center border-t border-border p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Expand metrics panel"
          >
            <PanelLeftOpen className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn(metricsNavAsideClass, "w-80")}>
      {children}
      <div
        className={cn(
          "flex items-center gap-3 border-t border-border px-5 py-4",
          footer ? "" : "justify-end"
        )}
      >
        {footer}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Collapse metrics panel"
        >
          <PanelLeftClose className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </aside>
  );
}

function MetricListItem({
  icon,
  label,
  active,
  trailing,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  trailing?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-2 rounded px-3 py-2 text-left transition-colors",
        active ? "bg-accent" : "hover:bg-muted/60"
      )}
    >
      <span className={cn("shrink-0", active ? "text-foreground" : "text-foreground/70")}>
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          active ? "font-medium text-foreground" : "text-foreground"
        )}
      >
        {label}
      </span>
      {trailing}
    </button>
  );
}

function MetricGroupLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium text-muted-foreground">{children}</p>;
}

const metricsSidebarScrollClass =
  "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-7";
const metricsSidebarPrimarySectionClass = "flex flex-col gap-1.5";
const metricsSidebarSectionClass = "flex flex-col gap-1";
const metricsSidebarActionStripClass =
  "mt-2 flex min-h-[44px] items-center border-t border-border pt-3";

const cursorIcon = <MousePointerClick className="h-4 w-4" aria-hidden />;

function MetricSelector({
  campaign,
  selectedMetric,
  onSelectMetric,
  onEnterCompare,
  collapsed,
  onToggleCollapsed,
}: {
  campaign: Campaign;
  selectedMetric: string;
  onSelectMetric: (name: string) => void;
  onEnterCompare: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const others = campaign.report.otherMetrics;
  // Guardrails take the bulk of the list; the remainder become Secondary so
  // both groups stay populated regardless of how many metrics exist.
  const splitAt = Math.max(1, others.length - Math.max(1, Math.floor(others.length / 3)));
  const guardrails = others.slice(0, splitAt);
  const secondary = others.slice(splitAt);

  return (
    <MetricsNavShell collapsed={collapsed} onToggleCollapsed={onToggleCollapsed}>
      <div className={metricsSidebarScrollClass}>
        {/* Primary Metric */}
        <div className={metricsSidebarPrimarySectionClass}>
          <MetricGroupLabel>Primary Metric</MetricGroupLabel>
          <MetricListItem
            icon={cursorIcon}
            label={campaign.primaryMetric}
            active={selectedMetric === campaign.primaryMetric}
            onClick={() => onSelectMetric(campaign.primaryMetric)}
            trailing={
              selectedMetric === campaign.primaryMetric ? (
                <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                  Primary
                </span>
              ) : undefined
            }
          />
        </div>

        {/* Guardrails */}
        <div className={metricsSidebarSectionClass}>
          <MetricGroupLabel>Guardrails</MetricGroupLabel>
          {guardrails.map((metric, i) => (
            <MetricListItem
              key={metric.name}
              icon={
                i === 1 ? <LayoutPanelTop className="h-4 w-4" aria-hidden /> : cursorIcon
              }
              label={metric.name}
              active={selectedMetric === metric.name}
              onClick={() => onSelectMetric(metric.name)}
            />
          ))}
        </div>

        {/* Secondary */}
        <div className={metricsSidebarSectionClass}>
          <MetricGroupLabel>Secondary</MetricGroupLabel>
          {secondary.map((metric) => (
            <MetricListItem
              key={metric.name}
              icon={cursorIcon}
              label={metric.name}
              active={selectedMetric === metric.name}
              onClick={() => onSelectMetric(metric.name)}
            />
          ))}
        </div>

        {/* Compare Metrics */}
        <div className={metricsSidebarActionStripClass}>
          <div className="flex w-full justify-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 rounded-md font-medium"
              onClick={onEnterCompare}
            >
              <Columns3 className="h-4 w-4" aria-hidden />
              Compare Metrics
            </Button>
          </div>
        </div>
      </div>
    </MetricsNavShell>
  );
}

// ---------------------------------------------------------------------------
// Compare metrics — left-panel metric picker (checkbox variant)

function CompareCheckItem({
  name,
  checked,
  onToggle,
  badge,
}: {
  name: string;
  checked: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <label
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded px-3 py-2 transition-colors",
        checked ? "bg-accent" : "hover:bg-muted/60"
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle()}
          className="h-4 w-4 rounded-[4px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        />
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          checked ? "font-medium text-foreground" : "text-foreground"
        )}
      >
        {name}
      </span>
      {badge && (
        <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
          {badge}
        </span>
      )}
    </label>
  );
}

function CompareMetricSelector({
  campaign,
  selected,
  onToggle,
  onClear,
  collapsed,
  onToggleCollapsed,
}: {
  campaign: Campaign;
  selected: string[];
  onToggle: (name: string) => void;
  onClear: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const others = campaign.report.otherMetrics;
  const splitAt = Math.max(1, others.length - Math.max(1, Math.floor(others.length / 3)));
  const guardrails = others.slice(0, splitAt);
  const secondary = others.slice(splitAt);
  const primary = campaign.primaryMetric;
  const count = selected.length;

  return (
    <MetricsNavShell collapsed={collapsed} onToggleCollapsed={onToggleCollapsed}>
      <div className={metricsSidebarScrollClass}>
        <div className={metricsSidebarPrimarySectionClass}>
          <MetricGroupLabel>Primary Metric</MetricGroupLabel>
          <CompareCheckItem
            name={primary}
            checked={selected.includes(primary)}
            onToggle={() => onToggle(primary)}
            badge={selected.includes(primary) ? "Primary" : undefined}
          />
        </div>

        <div className={metricsSidebarSectionClass}>
          <MetricGroupLabel>Guardrails</MetricGroupLabel>
          {guardrails.map((metric) => (
            <CompareCheckItem
              key={metric.name}
              name={metric.name}
              checked={selected.includes(metric.name)}
              onToggle={() => onToggle(metric.name)}
            />
          ))}
        </div>

        <div className={metricsSidebarSectionClass}>
          <MetricGroupLabel>Secondary</MetricGroupLabel>
          {secondary.map((metric) => (
            <CompareCheckItem
              key={metric.name}
              name={metric.name}
              checked={selected.includes(metric.name)}
              onToggle={() => onToggle(metric.name)}
            />
          ))}
        </div>

        <div className={cn(metricsSidebarActionStripClass, "justify-between")}>
          <span className="text-sm text-foreground">
            Comparing {count} metric{count === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear
          </button>
        </div>
      </div>
    </MetricsNavShell>
  );
}

// ---------------------------------------------------------------------------
// Compare metrics — table

type CompareMetric = { name: string; isPrimary: boolean };
type GroupBy = "variation" | "metric";

const COMPARE_GRID = {
  gridTemplateColumns:
    "minmax(150px,0.8fr) minmax(220px,1.4fr) 110px 110px minmax(180px,1.1fr) minmax(280px,1.5fr)",
} as const;

function VariantLabel({ variant, index }: { variant: Variant; index: number }) {
  return (
    <>
      <GraphBadge tone={badgeTone(index)}>{variant.label}</GraphBadge>
      <span className="truncate text-sm font-medium text-foreground">{variant.name}</span>
      {index === 0 && (
        <span className="shrink-0 rounded-full bg-muted px-2 text-xs font-medium text-foreground">
          Baseline
        </span>
      )}
    </>
  );
}

function MetricLabel({ name, isPrimary }: { name: string; isPrimary: boolean }) {
  return (
    <>
      <MousePointerClick className="h-4 w-4 shrink-0 text-foreground/60" aria-hidden />
      <span className="truncate text-sm font-medium text-foreground">{name}</span>
      {isPrimary && (
        <span className="shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground/80">
          Primary
        </span>
      )}
    </>
  );
}

function CompareTableHeader() {
  return (
    <>
      <div className="grid items-stretch bg-muted/30" style={COMPARE_GRID}>
        <div className="flex items-center gap-1.5 border-r border-border py-2 pl-5 pr-4 pt-3">
          <span className="text-xs font-semibold text-foreground/75">Metric</span>
          <FunnelIcon className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1.5 py-2 pl-4 pr-4 pt-3">
          <span className="text-xs font-semibold text-foreground/75">Variations</span>
          <FunnelIcon className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex flex-col items-end py-2 pr-2 pt-3">
          <span className="text-right text-xs font-semibold leading-[18px] text-foreground/75">
            Unique
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold leading-[18px] text-foreground/75">
            conversions
            <HeaderHelp />
          </span>
        </div>
        <div className="flex flex-col items-end py-2 pr-2 pt-3">
          <span className="text-right text-xs font-semibold leading-[18px] text-foreground/75">
            Total
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold leading-[18px] text-foreground/75">
            visitors
            <HeaderHelp />
          </span>
        </div>
        <div className="flex flex-col items-center py-2 pt-3">
          <span className="text-center text-xs font-semibold leading-[18px] text-foreground/75">
            Expected
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold leading-[18px] text-foreground/75">
            improvement(v)
            <HeaderHelp />
          </span>
        </div>
        <div className="flex flex-col justify-center gap-0.5 py-2 pl-5 pr-2 pt-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-foreground/75">
              Probability of Better or Equivalent (v)
            </span>
            <HeaderHelp />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            MDE: ± 20%&nbsp;&nbsp;ROPE: 1.5%&nbsp;&nbsp;Power: 80%&nbsp;&nbsp;FPR: 5%
          </div>
        </div>
      </div>

      <div
        className="grid items-stretch border-b border-border bg-muted/60 text-[10px] text-muted-foreground"
        style={COMPARE_GRID}
      >
        <div className="border-r border-border" />
        <div />
        <div />
        <div />
        <div className="flex items-center justify-between px-5 py-0.5">
          <span>-6%</span>
          <span>0%</span>
          <span>6%</span>
        </div>
        <div className="flex items-center justify-end gap-1 pr-1">
          <span>Winner threshold: {WINNER_THRESHOLD}%</span>
          <HeaderHelp />
        </div>
      </div>
    </>
  );
}

type CompareCell = {
  key: string;
  rowLabel: ReactNode;
  conversions: number;
  visitors: number;
  improvement: number | null;
  probability: number | null;
};
type CompareGroup = { key: string; label: ReactNode; rows: CompareCell[] };

function buildGroups(
  campaign: Campaign,
  metrics: CompareMetric[],
  groupBy: GroupBy
): CompareGroup[] {
  const variants = campaign.report.variants;

  if (groupBy === "variation") {
    return variants.map((variant, vi) => ({
      key: variant.id,
      label: <VariantLabel variant={variant} index={vi} />,
      rows: metrics.map((m) => {
        const s = metricRowStats(campaign, m.name, variant, vi);
        return {
          key: m.name,
          rowLabel: <MetricLabel name={m.name} isPrimary={m.isPrimary} />,
          conversions: s.conversions,
          visitors: variantVisitors(campaign, vi),
          improvement: s.uplift,
          probability: s.confidence,
        };
      }),
    }));
  }

  return metrics.map((m) => ({
    key: m.name,
    label: <MetricLabel name={m.name} isPrimary={m.isPrimary} />,
    rows: variants.map((variant, vi) => {
      const s = metricRowStats(campaign, m.name, variant, vi);
      return {
        key: variant.id,
        rowLabel: <VariantLabel variant={variant} index={vi} />,
        conversions: s.conversions,
        visitors: variantVisitors(campaign, vi),
        improvement: s.uplift,
        probability: s.confidence,
      };
    }),
  }));
}

function CompareTable({
  campaign,
  metrics,
  groupBy,
}: {
  campaign: Campaign;
  metrics: CompareMetric[];
  groupBy: GroupBy;
}) {
  const groups = buildGroups(campaign, metrics, groupBy);

  return (
    <div className="overflow-x-auto bg-background">
      <div className="min-w-[900px]">
        <CompareTableHeader />
        <div className="grid" style={COMPARE_GRID}>
          {groups.map((g) => (
            <Fragment key={g.key}>
              <div
                className="flex items-center gap-2 border-b border-r border-border px-5 py-4"
                style={{ gridRow: `span ${g.rows.length}` }}
              >
                {g.label}
              </div>
              {g.rows.map((row) => (
                <Fragment key={row.key}>
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    {row.rowLabel}
                  </div>
                  <div className="flex items-center justify-end border-b border-border pr-6 text-right text-sm text-foreground">
                    {formatNumber(row.conversions)}
                  </div>
                  <div className="flex items-center justify-end border-b border-border pr-6 text-right text-sm text-foreground">
                    {formatNumber(row.visitors)}
                  </div>
                  <ExpectedImprovementCell value={row.improvement} />
                  <ProbabilityCell value={row.probability} />
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compare metrics — card wrapper (table)

function CompareView({
  campaign,
  metrics,
  groupBy,
  onClear,
}: {
  campaign: Campaign;
  metrics: CompareMetric[];
  groupBy: GroupBy;
  onClear: () => void;
}) {
  const count = metrics.length;

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <div className="flex items-start justify-between px-4 py-3">
        <div className="flex items-start gap-3">
          <Columns3 className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
          <div>
            <p className="text-base font-medium text-foreground">Compare Metrics</p>
            <p className="text-sm text-muted-foreground">
              {count} metric{count === 1 ? "" : "s"} selected
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
          Clear
        </button>
      </div>

      {count === 0 ? (
        <div className="flex h-[360px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Select one or more metrics from the left to compare.
        </div>
      ) : (
        <CompareTable campaign={campaign} metrics={metrics} groupBy={groupBy} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

const resultsRootClass = "font-sans antialiased";

export default function ResultsTab({ campaign }: { campaign: Campaign }) {
  const [selectedMetric, setSelectedMetric] = useState(campaign.primaryMetric);
  const [compareMode, setCompareMode] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("variation");

  const secondaryMetrics = campaign.report.otherMetrics;
  const [compareSelected, setCompareSelected] = useState<string[]>([]);
  const [metricsNavCollapsed, setMetricsNavCollapsed] = useState(false);

  const enterCompare = () => {
    setCompareSelected([]);
    setCompareMode(true);
  };
  const toggleCompare = (name: string) =>
    setCompareSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  // Canonical order: primary first, then secondary metrics in list order.
  const allMetrics: CompareMetric[] = [
    { name: campaign.primaryMetric, isPrimary: true },
    ...secondaryMetrics.map((m) => ({ name: m.name, isPrimary: false })),
  ];
  const orderedCompareMetrics = allMetrics.filter((m) =>
    compareSelected.includes(m.name)
  );

  const variants = campaign.report.variants;
  const best =
    variants.find((v) => v.isBest) ??
    [...variants]
      .filter((v) => v.confidence !== null)
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] ??
    variants[variants.length - 1];

  return (
    <div className={cn("flex min-h-full items-start", resultsRootClass)}>
      {compareMode ? (
        <CompareMetricSelector
          campaign={campaign}
          selected={compareSelected}
          onToggle={toggleCompare}
          onClear={() => setCompareMode(false)}
          collapsed={metricsNavCollapsed}
          onToggleCollapsed={() => setMetricsNavCollapsed((c) => !c)}
        />
      ) : (
        <MetricSelector
          campaign={campaign}
          selectedMetric={selectedMetric}
          onSelectMetric={setSelectedMetric}
          onEnterCompare={enterCompare}
          collapsed={metricsNavCollapsed}
          onToggleCollapsed={() => setMetricsNavCollapsed((c) => !c)}
        />
      )}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1120px] space-y-4 px-7 py-6">
          <ReportViewBar campaignId={campaign.id} />
          {compareMode ? (
            <>
              <FilterBar
                campaignId={campaign.id}
                right={
                  <>
                    <span className="text-sm text-muted-foreground">Group by :</span>
                    <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                      <SelectTrigger className="h-7 w-[122px] gap-1 rounded-md border-border text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="variation">Variation</SelectItem>
                        <SelectItem value="metric">Metric</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                }
              />
              <CompareView
                campaign={campaign}
                metrics={orderedCompareMetrics}
                groupBy={groupBy}
                onClear={() => setCompareMode(false)}
              />
            </>
          ) : (
            <>
              <FilterBar campaignId={campaign.id} />
              <div>
                <ConclusionBanner variantName={best.name} />
                <div className="overflow-hidden rounded-b-md border border-border border-t-0 bg-background">
                  <MetricHeader
                    metric={selectedMetric}
                    isPrimary={selectedMetric === campaign.primaryMetric}
                  />
                  <InnerTabs />
                  <ResultsTable campaign={campaign} metricName={selectedMetric} />
                  <GraphPanel metricName={selectedMetric} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
