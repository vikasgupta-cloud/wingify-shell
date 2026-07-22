import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  Award,
  CalendarClock,
  CalendarRange,
  ChevronDown,
  Columns3,
  Compass,
  Construction,
  Crosshair,
  Download,
  FlaskConical,
  GripVertical,
  HelpCircle,
  Info,
  Layers,
  LayoutPanelTop,
  LineChart,
  MousePointerClick,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Percent,
  PieChart,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Settings,
  TrendingUp,
  Wrench,
  ChevronRight,
  X,
} from "lucide-react";
import type { Campaign, Variant } from "../../data/campaigns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VitalsGlyph } from "@/components/ui/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import learningIcon from "@/assets/icons/learning.png";
import {
  REPORT_DIMENSION_OPTIONS,
  REPORT_PRESET_IDS,
  REPORT_BASE_FILTERS,
  fromYmd,
  toYmd,
  useActiveReportPresetId,
  useActiveReportPresetState,
  useActiveResultsRowDensity,
  useActiveResultsTableColumns,
  useReportMetricsNavCollapsed,
  useReportSelectedMetric,
  useReportViewsStore,
  type ReportDateRange,
} from "../../store/reportViews";
import DateRangeDropdown, { type DateRange } from "./DateRangeDropdown";
import ReportViewBar from "./ReportViewBar";
import {
  DEFAULT_REPORT_VIEW_SETTINGS,
  type ReportViewSettings,
  type ResultsLayout,
  type ResultsGraphDefault,
  type ResultsRowDensity,
  type ResultsTableColumnId,
  RESULTS_TABLE_COLUMN_IDS,
  DEFAULT_RESULTS_TABLE_COLUMNS,
} from "./reportViewTypes";
import { SegmentsSelector } from "./SegmentsDrawer";
import { filterMetricSeedSuffix, type ReportFilterContext } from "./reportFilters";
import { useReportData } from "./reportDataContext";
import type { ReportConclusionSnapshot } from "./reportDataContext";
import {
  formatNumber,
  hashMetricSeed,
  metricRowStats,
  type MetricRowStats,
  type ReportDataMode,
} from "./reportMetrics";

const WINNER_THRESHOLD = 95;

type ResultsGroupBy = "variation" | "segment";

const RESULTS_TABLE_COLUMN_META: Record<
  ResultsTableColumnId,
  { label: string; gridWidth: string; minWidthPx: number }
> = {
  "unique-conversions": {
    label: "Unique conversions",
    gridWidth: "minmax(152px, 1fr)",
    minWidthPx: 152,
  },
  "total-visitors": {
    label: "Total visitors",
    gridWidth: "minmax(132px, 1fr)",
    minWidthPx: 132,
  },
  "expected-improvement": {
    label: "Expected improvement(v)",
    gridWidth: "minmax(200px, 1.2fr)",
    minWidthPx: 200,
  },
  probability: {
    label: "Probability of Better or Equivalent (v)",
    gridWidth: "minmax(320px, 1.5fr)",
    minWidthPx: 320,
  },
  "conversion-rate": {
    label: "Conversion rate",
    gridWidth: "minmax(148px, 1fr)",
    minWidthPx: 148,
  },
  "revenue-per-visitor": {
    label: "Revenue per visitor",
    gridWidth: "minmax(184px, 1fr)",
    minWidthPx: 184,
  },
};

function resultsTableMinWidth(
  columns: ResultsTableColumnId[],
  grouped = false
) {
  const metrics = columns.reduce(
    (sum, id) => sum + RESULTS_TABLE_COLUMN_META[id].minWidthPx,
    0
  );
  return (grouped ? 180 + 220 : 220) + metrics + 40;
}

function buildResultsGrid(columns: ResultsTableColumnId[], grouped = false) {
  const widths = columns
    .map((id) => RESULTS_TABLE_COLUMN_META[id].gridWidth)
    .join(" ");
  return {
    gridTemplateColumns: grouped
      ? `180px 220px ${widths} 40px`
      : `220px ${widths} 40px`,
  } as const;
}

/** Opaque sticky header fill — matches muted/50 over white without letting scroll content bleed through. */
const STICKY_HEADER_BG =
  "bg-[color-mix(in_srgb,hsl(var(--muted))_50%,hsl(var(--background)))]";

function stickyGroupCellClass(showEdgeShadow: boolean) {
  return cn(
    "sticky left-0 z-30 w-[180px] min-w-[180px] max-w-[180px] overflow-hidden border-r border-border bg-background",
    showEdgeShadow && "shadow-[6px_0_12px_-8px_hsl(var(--border))]"
  );
}

function stickyGroupHeaderClass(showEdgeShadow: boolean) {
  return cn(
    "sticky left-0 z-30 w-[180px] min-w-[180px] max-w-[180px] overflow-hidden border-r border-border",
    STICKY_HEADER_BG,
    showEdgeShadow && "shadow-[6px_0_12px_-8px_hsl(var(--border))]"
  );
}

function stickyNestedCellClass(showEdgeShadow: boolean) {
  return cn(
    "sticky left-[180px] z-30 w-[220px] min-w-[220px] max-w-[220px] overflow-hidden border-r border-border bg-background group-hover:bg-[color-mix(in_srgb,hsl(var(--muted))_50%,hsl(var(--background)))]",
    showEdgeShadow && "shadow-[6px_0_12px_-8px_hsl(var(--border))]"
  );
}

function stickyNestedHeaderClass(showEdgeShadow: boolean) {
  return cn(
    "sticky left-[180px] z-30 w-[220px] min-w-[220px] max-w-[220px] overflow-hidden border-r border-border",
    STICKY_HEADER_BG,
    showEdgeShadow && "shadow-[6px_0_12px_-8px_hsl(var(--border))]"
  );
}

function stickyVariationsCellClass(showEdgeShadow: boolean) {
  return cn(
    "sticky left-0 z-30 w-[220px] min-w-[220px] max-w-[220px] overflow-hidden border-r border-border bg-background group-hover:bg-[color-mix(in_srgb,hsl(var(--muted))_50%,hsl(var(--background)))]",
    showEdgeShadow && "shadow-[6px_0_12px_-8px_hsl(var(--border))]"
  );
}

function stickyVariationsHeaderClass(showEdgeShadow: boolean) {
  return cn(
    "sticky left-0 z-30 w-[220px] min-w-[220px] max-w-[220px] overflow-hidden border-r border-border",
    STICKY_HEADER_BG,
    showEdgeShadow && "shadow-[6px_0_12px_-8px_hsl(var(--border))]"
  );
}

function stickyActionsCellClass(showEdgeShadow: boolean) {
  return cn(
    "sticky right-0 z-30 w-10 min-w-[40px] max-w-[40px] overflow-hidden border-l border-border bg-background group-hover:bg-[color-mix(in_srgb,hsl(var(--muted))_50%,hsl(var(--background)))]",
    showEdgeShadow && "shadow-[-6px_0_12px_-8px_hsl(var(--border))]"
  );
}

function stickyActionsHeaderClass(showEdgeShadow: boolean) {
  return cn(
    "sticky right-0 z-30 w-10 min-w-[40px] max-w-[40px] overflow-hidden border-l border-border",
    STICKY_HEADER_BG,
    showEdgeShadow && "shadow-[-6px_0_12px_-8px_hsl(var(--border))]"
  );
}

type StickyEdgeShadows = { left: boolean; right: boolean };

const NO_STICKY_EDGE_SHADOWS: StickyEdgeShadows = { left: false, right: false };

function measureStickyEdgeShadows(el: HTMLDivElement): StickyEdgeShadows {
  const { scrollLeft, scrollWidth, clientWidth } = el;
  const canScroll = scrollWidth > clientWidth + 1;
  if (!canScroll) return NO_STICKY_EDGE_SHADOWS;
  return {
    left: scrollLeft > 1,
    right: scrollLeft + clientWidth < scrollWidth - 1,
  };
}

const resultsTableMetricCellClass = "relative z-0 min-w-0";

const resultsTableHeaderLabelClass =
  "text-xs font-medium leading-none text-muted-foreground";

const resultsTableSubheadClass =
  "text-[11px] leading-snug text-muted-foreground tabular-nums";

const REPORT_COLUMN_CHECKBOX_CLASS =
  "h-3.5 w-3.5 [&_svg]:size-3 disabled:cursor-not-allowed";

const REPORT_ROW_DENSITIES: {
  key: ResultsRowDensity;
  label: string;
  title: string;
}[] = [
  { key: "compact", label: "S", title: "Compact" },
  { key: "default", label: "M", title: "Default" },
  { key: "comfortable", label: "L", title: "Comfortable" },
];

/** Shared row height for variation + total rows across S / M / L. */
const RESULTS_ROW_H: Record<ResultsRowDensity, string> = {
  compact: "h-[52px]",
  default: "h-[68px]",
  comfortable: "h-[84px]",
};

const RESULTS_CHART_H = RESULTS_ROW_H;

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
        tone === "ctrl" && "border-border bg-muted text-foreground",
        tone === "v1" && "border-border bg-secondary text-foreground",
        tone === "v2" && "border-foreground/30 bg-background text-foreground",
        tone === "total" && "border-border bg-muted/50 text-foreground"
      )}
    >
      {children}
    </span>
  );
}

const MAX_VISITOR_DIMENSIONS = 2;

const filterPanelRowClass = "flex items-start gap-x-1";
const filterPanelLabelClass =
  "flex w-[6.75rem] shrink-0 items-center gap-1.5 pt-1 text-sm text-muted-foreground";
const filterPanelChipsClass =
  "flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-2.5";
const filterPanelInsetClass = "px-5 py-4";

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
  maxSelections,
}: {
  icon: ReactNode;
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  maxSelections?: number;
}) {
  const summary =
    value.length === 0
      ? label
      : value.length === 1
        ? value[0]
        : `${label}(${value.length})`;

  const toggle = (option: string) => {
    const isSelected = value.includes(option);
    if (!isSelected && maxSelections !== undefined && value.length >= maxSelections) return;
    onChange(
      isSelected
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
            "inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm transition-colors hover:bg-muted/60 data-[state=open]:bg-muted/60",
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
            const blocked =
              !checked &&
              maxSelections !== undefined &&
              value.length >= maxSelections;
            return (
              <label
                key={option}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                  blocked
                    ? "cursor-not-allowed text-muted-foreground/60"
                    : "cursor-pointer hover:bg-accent"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(option)}
                  disabled={blocked}
                />
                <span className="truncate">{option}</span>
              </label>
            );
          })}
        </div>
        {maxSelections !== undefined && (
          <p className="mt-2 text-xs text-muted-foreground">
            You can select up to {maxSelections} dimensions.
          </p>
        )}
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
  const from =
    typeof range.from === "string" ? range.from : REPORT_BASE_FILTERS.dateRange.from;
  const to =
    typeof range.to === "string" ? range.to : REPORT_BASE_FILTERS.dateRange.to;
  return {
    id: range.id ?? REPORT_BASE_FILTERS.dateRange.id,
    label: range.label ?? REPORT_BASE_FILTERS.dateRange.label,
    from: fromYmd(from),
    to: fromYmd(to),
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
    useActiveReportPresetState(campaignId);
  const updateActivePreset = useReportViewsStore((s) => s.updateActivePreset);
  const showTrailing = Boolean(right);

  return (
    <div className={filterPanelRowClass}>
      <span className={filterPanelLabelClass}>
        <FunnelIcon className="h-3.5 w-3.5 shrink-0" />
        Filter by :
      </span>
      <div className={filterPanelChipsClass}>
        <DateRangeDropdown
          variant="filter"
          value={storedToDateRange(dateRange)}
          onChange={(range) =>
            updateActivePreset(campaignId, {
              dateRange: dateRangeToStored(range),
            })
          }
        />
        <SegmentsSelector
          value={segments}
          onChange={(next) => updateActivePreset(campaignId, { segments: next })}
        />
        <MultiSelectFilterChip
          icon={<Layers className="h-3.5 w-3.5" aria-hidden />}
          label="Dimensions"
          options={REPORT_DIMENSION_OPTIONS}
          value={dimensions}
          onChange={(next) =>
            updateActivePreset(campaignId, { dimensions: next })
          }
          maxSelections={MAX_VISITOR_DIMENSIONS}
        />
      </div>
      {showTrailing && (
        <div className="flex shrink-0 items-center gap-2 self-center">
          {right}
        </div>
      )}
    </div>
  );
}

function AppliedSegmentChip({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  const isCustom = /^Custom \d+$/.test(name);
  return (
    <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-border bg-background pl-3 pr-2 text-sm text-foreground">
      <span className="max-w-[160px] truncate">{name}</span>
      {isCustom && (
        <Pencil className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}

function AppliedSegmentsRow({ campaignId }: { campaignId: string }) {
  const { segments } = useActiveReportPresetState(campaignId);
  const updateActivePreset = useReportViewsStore((s) => s.updateActivePreset);
  if (segments.length === 0) return null;

  return (
    <div
      className={cn(
        filterPanelRowClass,
        "border-t border-border",
        filterPanelInsetClass
      )}
    >
      <span className={filterPanelLabelClass}>
        <Compass className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Segments :
      </span>
      <div className={filterPanelChipsClass}>
        {segments.map((name) => (
          <AppliedSegmentChip
            key={name}
            name={name}
            onRemove={() =>
              updateActivePreset(campaignId, {
                segments: segments.filter((s) => s !== name),
              })
            }
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => updateActivePreset(campaignId, { segments: [] })}
        className="inline-flex shrink-0 items-center gap-1 self-center pt-1 text-sm font-medium text-foreground hover:underline"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Clear All
      </button>
    </div>
  );
}

function AppliedDimensionsRow({ campaignId }: { campaignId: string }) {
  const { dimensions } = useActiveReportPresetState(campaignId);
  const updateActivePreset = useReportViewsStore((s) => s.updateActivePreset);
  if (dimensions.length === 0) return null;

  return (
    <div
      className={cn(
        filterPanelRowClass,
        "border-t border-border",
        filterPanelInsetClass
      )}
    >
      <span className={filterPanelLabelClass}>
        <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Dimensions :
      </span>
      <div className={filterPanelChipsClass}>
        {dimensions.map((name) => (
          <AppliedSegmentChip
            key={name}
            name={name}
            onRemove={() =>
              updateActivePreset(campaignId, {
                dimensions: dimensions.filter((d) => d !== name),
              })
            }
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => updateActivePreset(campaignId, { dimensions: [] })}
        className="inline-flex shrink-0 items-center gap-1 self-center pt-1 text-sm font-medium text-foreground hover:underline"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Clear All
      </button>
    </div>
  );
}

function ResultsFilterPanel({
  campaignId,
  right,
  embedded,
}: {
  campaignId: string;
  right?: ReactNode;
  /** When true, sits inside the results/table card (no outer border/radius). */
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(
        embedded
          ? "border-b border-border bg-background"
          : "overflow-hidden rounded-lg border border-border bg-background"
      )}
    >
      <div className={filterPanelInsetClass}>
        <FilterBar campaignId={campaignId} right={right} />
      </div>
      <AppliedSegmentsRow campaignId={campaignId} />
      <AppliedDimensionsRow campaignId={campaignId} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conclusion banner — mirrors listing / quickview decision

function ConclusionBanner({
  conclusion,
  variantName,
  embedded,
}: {
  conclusion: ReportConclusionSnapshot;
  variantName: string;
  /** When true, sits inside the results/table card (no outer border/radius). */
  embedded?: boolean;
}) {
  const { kind, title, progress } = conclusion;
  const shell = embedded
    ? "bg-background"
    : "overflow-hidden rounded-lg border border-border bg-background shadow-sm";

  if (kind === "collecting") {
    return (
      <div className={cn(shell, "px-8 py-6")}>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Too early for a conclusion. Wait for the minimum runtime and sample.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-x-10 gap-y-4">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Minimum duration</div>
            <div className="mt-2 tabular-nums">
              <span className="text-base font-semibold text-foreground">
                {progress.elapsedDays}
              </span>{" "}
              <span className="text-sm text-muted-foreground">
                / {progress.minRuntimeDays} days
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Minimum unique visitors</div>
            <div className="mt-2 tabular-nums">
              <span className="text-base font-semibold text-foreground">
                {formatNumber(progress.visitors)}
              </span>{" "}
              <span className="text-sm text-muted-foreground">
                / {formatNumber(progress.minVisitors)}
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Minimum conversions</div>
            <div className="mt-2 tabular-nums">
              <span className="text-base font-semibold text-foreground">
                {formatNumber(progress.uniqueConversions)}
              </span>{" "}
              <span className="text-sm text-muted-foreground">
                / {formatNumber(progress.minConversions)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "progress") {
    return (
      <div className={cn(shell, "px-6 py-4")}>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="mt-1 tabular-nums">
              <span className="text-base font-semibold text-foreground">
                {progress.elapsedDays}
              </span>{" "}
              <span className="text-sm text-muted-foreground">
                / {progress.requiredDays} days
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Unique visitors</div>
            <div className="mt-1 tabular-nums">
              <span className="text-base font-semibold text-foreground">
                {formatNumber(progress.visitors)}
              </span>{" "}
              <span className="text-sm text-muted-foreground">
                / {formatNumber(progress.requiredVisitors)} required
              </span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Conversions</div>
            <div className="mt-1 tabular-nums">
              <span className="text-base font-semibold text-foreground">
                {formatNumber(progress.uniqueConversions)}
              </span>{" "}
              <span className="text-sm text-muted-foreground">
                / {formatNumber(progress.requiredConversions)} required
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "inconclusive") {
    return (
      <div className={cn(shell, "flex items-center gap-3.5 px-6 py-4")}>
        <p className="text-sm font-medium leading-snug text-muted-foreground">
          No clear winner. Results are inconclusive across variations.
        </p>
      </div>
    );
  }

  const decisionTail =
    kind === "baseline"
      ? "remains better or equivalent to every variation, the strongest choice to keep as baseline."
      : "is better or equivalent to baseline and gives the highest improvement, the strongest choice to roll out.";

  return (
    <div
      className={cn(
        "flex items-center gap-4 overflow-hidden bg-gradient-to-r from-report-green-badge/70 via-report-green-tint to-report-green-tint px-6 py-5",
        embedded
          ? "border-0"
          : "rounded-xl border border-report-green-border shadow-sm"
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-report-green-border bg-background shadow-sm">
        <Award className="h-5 w-5 text-decision-winner-fg" aria-hidden />
      </span>
      <p className="min-w-0 text-sm leading-relaxed text-foreground/80">
        <span className="font-semibold text-foreground">{variantName}</span>{" "}
        {decisionTail}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View settings dialog

function SettingsHelp({ label }: { label: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            tabIndex={-1}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            aria-label={label}
          >
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function LayoutOptionCard({
  value,
  selected,
  title,
  linesFirst,
}: {
  value: ResultsLayout;
  selected: boolean;
  title: string;
  linesFirst: boolean;
}) {
  const tablePreview = (
    <div className="grid grid-cols-5 gap-1.5">
      {Array.from({ length: 10 }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 rounded-sm",
            index % 3 === 0 ? "bg-report-purple-bg" : "bg-muted"
          )}
        />
      ))}
    </div>
  );

  const graphPreview = (
    <div className="rounded-md bg-report-purple-bg/60 px-2 py-2">
      <svg viewBox="0 0 120 48" className="h-12 w-full">
        <path
          d={
            linesFirst
              ? "M4 36 L22 26 L38 32 L58 18 L78 22 L102 10"
              : "M4 30 L22 34 L40 22 L58 26 L78 18 L102 12"
          }
          fill="none"
          stroke="hsl(var(--report-brand))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={
            linesFirst
              ? "M4 24 L22 34 L40 28 L58 32 L78 24 L102 16"
              : "M4 36 L22 24 L40 34 L58 20 L78 28 L102 22"
          }
          fill="none"
          stroke="hsl(var(--report-purple-border))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-colors",
        selected
          ? "border-report-brand shadow-[inset_0_0_0_1px_hsl(var(--report-brand))]"
          : "border-border bg-muted/20 hover:border-muted-foreground/30"
      )}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value={value} />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <div className="rounded-md border border-report-brand/35 bg-background p-2.5">
        <div className="space-y-2">
          {linesFirst ? (
            <>
              {graphPreview}
              {tablePreview}
            </>
          ) : (
            <>
              {tablePreview}
              {graphPreview}
            </>
          )}
        </div>
      </div>
    </label>
  );
}

function ViewSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ReportViewSettings;
  onSave: (settings: ReportViewSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1006px] gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-10 py-6">
          <DialogTitle className="text-[18px] font-semibold text-foreground">
            View Settings
          </DialogTitle>
          <DialogDescription className="sr-only">
            Configure the results report layout, graph, and table display options.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-12 px-10 py-8 md:grid-cols-[1.05fr_1fr]">
          <section className="space-y-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-[13px] font-semibold text-foreground">Layout options</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Report layout</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a layout order based on your preference
                  </p>
                </div>
                <RadioGroup
                  value={draft.layout}
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, layout: value as ResultsLayout }))
                  }
                  className="grid grid-cols-2 gap-3"
                >
                  <LayoutOptionCard
                    value="table-first"
                    selected={draft.layout === "table-first"}
                    title="Table first"
                    linesFirst={false}
                  />
                  <LayoutOptionCard
                    value="graphs-first"
                    selected={draft.layout === "graphs-first"}
                    title="Graphs first"
                    linesFirst={true}
                  />
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground">Default graph</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select the graph you want to see first on the report
                </p>
              </div>
              <RadioGroup
                value={draft.defaultGraph}
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, defaultGraph: value as ResultsGraphDefault }))
                }
                className="gap-4"
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="date-range" />
                  <span className="text-sm text-foreground">Date Range</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="expected-conversion-rate" />
                  <span className="text-sm text-foreground">Expected Conversion Rate</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <RadioGroupItem value="expected-improvement" />
                  <span className="text-sm text-foreground">Expected Improvement</span>
                </label>
                <label className="flex cursor-not-allowed items-center gap-3 opacity-45">
                  <RadioGroupItem value="funnel-graph" disabled />
                  <span className="text-sm text-foreground">Funnel Graph</span>
                </label>
              </RadioGroup>
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-[13px] font-semibold text-foreground">Table options</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground">Bayesian ranges</p>
                    <SettingsHelp label="Choose which rows display Bayesian ranges." />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select table items for which you want to see Bayesian ranges along with
                    absolute numbers
                  </p>
                </div>
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={draft.showExpectedConversionRateRange}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        showExpectedConversionRateRange: checked === true,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">Expected Conversion Rate</span>
                </label>
                <label className="flex items-center gap-3">
                  <Checkbox
                    checked={draft.showExpectedImprovementRange}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        showExpectedImprovementRange: checked === true,
                      }))
                    }
                  />
                  <span className="text-sm text-foreground">Expected Improvement</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Other options</p>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={draft.showTotalRow}
                  onCheckedChange={(checked) =>
                    setDraft((prev) => ({ ...prev, showTotalRow: checked === true }))
                  }
                />
                <span className="flex items-center gap-1.5 text-sm text-foreground">
                  Show 'total' row
                  <SettingsHelp label="Show the aggregate totals row at the bottom of the table." />
                </span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={draft.showDisabledVariationRows}
                  onCheckedChange={(checked) =>
                    setDraft((prev) => ({
                      ...prev,
                      showDisabledVariationRows: checked === true,
                    }))
                  }
                />
                <span className="text-sm text-foreground">
                  Show rows for disabled variations
                </span>
              </label>
            </div>
          </section>
        </div>

        <DialogFooter className="border-t border-border px-10 py-5 sm:justify-between sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraft(DEFAULT_REPORT_VIEW_SETTINGS)}
          >
            Restore Defaults
          </Button>
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-report-brand text-report-brand hover:bg-report-brand-tint hover:text-report-brand-fg"
              onClick={() => {
                onSave(draft);
                onOpenChange(false);
              }}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Statistical configuration tooltip (hover on metric-header icon)

type StatisticalConfigSnapshot = {
  statisticalModel: string;
  testingApproach: string;
  multipleTestingCorrection: string;
  metricCode: string;
  metricName: string;
  testingObjective: string;
  mde: string;
  rope: string;
  power: string;
  falsePositiveRate: string;
};

function statisticalConfigFor(
  campaign: Campaign,
  metricName: string
): StatisticalConfigSnapshot {
  const seed = hashMetricSeed(`${campaign.id}:${metricName}:stat-config`);
  const mdePct = Math.max(
    5,
    Math.min(20, Math.round(Math.abs(campaign.expectedImprovement) || 5))
  );
  const ropePct = mdePct <= 5 ? 1 : Number((mdePct / 5).toFixed(1));
  const fpr = seed % 2 === 0 ? 5 : 10;
  const metricNum =
    5000 + (Number.parseInt(campaign.id, 10) % 900 || seed % 900);
  const approaches = ["Sequential", "Fixed horizon"] as const;
  const corrections = ["None", "Bonferroni", "FDR"] as const;

  return {
    statisticalModel: "Bayesian",
    testingApproach: approaches[seed % approaches.length]!,
    multipleTestingCorrection: corrections[seed % corrections.length]!,
    metricCode: `M${metricNum}`,
    metricName,
    testingObjective: "Better",
    mde: `±${mdePct}% of baseline average`,
    rope: `±${ropePct}%`,
    power: "80%",
    falsePositiveRate: `${fpr}%`,
  };
}

function StatConfigRow({
  label,
  value,
  valueBold,
}: {
  label: string;
  value: string;
  valueBold?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1 text-sm leading-5">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "ml-auto text-foreground",
          valueBold ? "font-semibold" : "font-medium"
        )}
      >
        : {value}
      </span>
    </div>
  );
}

function StatisticalConfigurationTooltip({
  campaign,
  metricName,
  children,
}: {
  campaign: Campaign;
  metricName: string;
  children: ReactNode;
}) {
  const config = statisticalConfigFor(campaign, metricName);

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        sideOffset={10}
        className="relative w-[min(100vw-2rem,420px)] overflow-visible rounded-xl border border-border bg-background p-0 text-left text-foreground shadow-xl"
      >
        <span
          className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-l border-t border-border bg-background"
          aria-hidden
        />
        <div className="space-y-5 px-5 py-4">
          <div className="space-y-1.5">
            <p className="text-base font-semibold text-foreground">
              Statistical Configuration
            </p>
            <p className="text-sm leading-5 text-muted-foreground">
              These are advanced statistical adjustments used to fine tune your
              experiment.
            </p>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-foreground">
                Campaign Specific
              </h3>
              <span
                className="flex h-6 w-6 items-center justify-center text-muted-foreground"
                aria-hidden
              >
                <Pencil className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="space-y-2">
              <StatConfigRow
                label="Statistical Model"
                value={config.statisticalModel}
              />
              <StatConfigRow
                label="Testing approach"
                value={config.testingApproach}
              />
              <StatConfigRow
                label="Multiple Testing Correction"
                value={config.multipleTestingCorrection}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-foreground">
                Metric Specific
              </h3>
              <span
                className="flex h-6 w-6 items-center justify-center text-muted-foreground"
                aria-hidden
              >
                <Pencil className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="flex items-center gap-2.5 rounded-md bg-muted/50 px-3 py-2.5">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-report-blue-bg px-2.5 py-0.5 text-xs font-semibold text-report-blue-fg">
                <Star className="h-3 w-3" aria-hidden />
                {config.metricCode}
              </span>
              <span className="min-w-0 truncate text-sm font-medium text-foreground">
                {config.metricName}
              </span>
            </div>

            <div className="space-y-2">
              <StatConfigRow
                label="Testing Objective"
                value={config.testingObjective}
                valueBold
              />
              <StatConfigRow
                label="Minimum Detectable Effect (MDE)"
                value={config.mde}
                valueBold
              />
              <StatConfigRow
                label="Region of Practical Equivalence (ROPE)"
                value={config.rope}
                valueBold
              />
              <StatConfigRow
                label="Statistical Power (1 - β)"
                value={config.power}
                valueBold
              />
              <StatConfigRow
                label="False Positive Rate (α)"
                value={config.falsePositiveRate}
                valueBold
              />
            </div>
          </section>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Metric header

function MetricHeader({
  campaign,
  metric,
  isPrimary,
  onOpenSettings,
  onOpenLearnings,
  onViewVitalsDetails,
}: {
  campaign: Campaign;
  metric: string;
  isPrimary: boolean;
  onOpenSettings: () => void;
  onOpenLearnings: () => void;
  onViewVitalsDetails: () => void;
}) {
  const metricTitleClass =
    "border-b border-dashed border-muted-foreground text-lg font-semibold leading-tight tracking-tight text-foreground";

  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <MousePointerClick
          className="h-5 w-5 shrink-0 text-foreground"
          aria-hidden
        />
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          {metric === "Conversion rate" ? (
            <MetricDefinitionTooltip side="bottom">
              <button type="button" className={metricTitleClass}>
                {metric}
              </button>
            </MetricDefinitionTooltip>
          ) : (
            <span className={metricTitleClass}>{metric}</span>
          )}
          {isPrimary && (
            <span className="inline-flex items-center rounded border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground/70">
              Primary
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatisticalConfigurationTooltip
          campaign={campaign}
          metricName={metric}
        >
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted/60"
            aria-label="Statistical configuration"
          >
            <PieChart className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </StatisticalConfigurationTooltip>
        <ExperimentVitalsPopover onViewDetails={onViewVitalsDetails} />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onOpenLearnings}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted/60"
              aria-label="Campaign learnings"
            >
              <LearningIcon className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Learnings
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => downloadCsvSummary(metric)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted/60"
              aria-label="Download CSV Summary"
            >
              <Download className="h-[18px] w-[18px]" aria-hidden />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            Download CSV Summary
          </TooltipContent>
        </Tooltip>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted/60"
          aria-label="Settings"
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden />
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-md font-medium"
          aria-label="Campaign summary"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Campaign summary
        </Button>
      </div>
    </div>
  );
}

function LearningIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        maskImage: `url(${learningIcon})`,
        WebkitMaskImage: `url(${learningIcon})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

function downloadCsvSummary(metricName: string) {
  const slug = metricName.toLowerCase().replace(/\s+/g, "-");
  const csv = [
    "Note",
    '"This file will be populated with real data."',
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug}-summary.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

const IMPACT_OPTIONS = ["Positive", "Neutral", "Negative", "Inconclusive"] as const;
const OUTCOME_OPTIONS = [
  "Surprising",
  "Expected",
  "Undefined",
  "Biased",
  "Push further",
  "No impact",
] as const;

type ImpactOption = (typeof IMPACT_OPTIONS)[number];
type OutcomeOption = (typeof OUTCOME_OPTIONS)[number];

function SegmentedChoiceGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: readonly T[];
  value: T | null;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap overflow-hidden rounded-md border border-border"
    >
      {options.map((option, index) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "px-3.5 py-2 text-sm transition-colors",
              index > 0 && "border-l border-border",
              selected
                ? "bg-muted font-medium text-foreground"
                : "bg-background text-foreground/80 hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function LearningsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [impact, setImpact] = useState<ImpactOption | null>(null);
  const [outcome, setOutcome] = useState<OutcomeOption | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [draftNote, setDraftNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!open) return;
    setImpact(null);
    setOutcome(null);
    setNotes([]);
    setDraftNote("");
    setAddingNote(false);
  }, [open]);

  const canSave = impact !== null || outcome !== null || notes.length > 0;

  const commitNote = () => {
    const trimmed = draftNote.trim();
    if (!trimmed) return;
    setNotes((prev) => [...prev, trimmed]);
    setDraftNote("");
    setAddingNote(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[720px] gap-0 overflow-hidden p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-8 pb-2 pt-7">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Share your campaign learnings
          </DialogTitle>
          <DialogDescription className="sr-only">
            Capture overall campaign assessment and learning notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 px-8 py-5">
          <section className="space-y-6 rounded-xl bg-canvas px-5 py-5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold text-foreground">
                Overall campaign assessment
              </h3>
              <SettingsHelp label="Summarize how this campaign performed overall." />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-foreground">
                What is the overall impact of the campaign?
              </p>
              <SegmentedChoiceGroup
                options={IMPACT_OPTIONS}
                value={impact}
                onChange={setImpact}
                ariaLabel="Overall impact"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-foreground">
                How would you describe the outcome overall?
              </p>
              <SegmentedChoiceGroup
                options={OUTCOME_OPTIONS}
                value={outcome}
                onChange={setOutcome}
                ariaLabel="Overall outcome"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-semibold text-foreground">
                  Log a learning note
                </h3>
                <SettingsHelp label="Capture qualitative notes and insights from this campaign." />
              </div>
              <button
                type="button"
                onClick={() => setAddingNote(true)}
                className="inline-flex items-center gap-1 text-sm font-medium text-report-brand-fg transition-colors hover:text-report-brand"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add learning note
              </button>
            </div>

            {addingNote ? (
              <div className="space-y-3 rounded-lg border border-border bg-background p-4">
                <textarea
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="Write your learning note…"
                  rows={3}
                  className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraftNote("");
                      setAddingNote(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-report-brand text-report-brand-fg hover:bg-report-brand-tint hover:text-report-brand-fg"
                    disabled={!draftNote.trim()}
                    onClick={commitNote}
                  >
                    Add note
                  </Button>
                </div>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex min-h-[88px] items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  You have not added any learnings yet.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {notes.map((note, index) => (
                  <li
                    key={`${note}-${index}`}
                    className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-foreground"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <DialogFooter className="border-t border-border px-8 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-report-brand text-report-brand-fg hover:bg-report-brand-tint hover:text-report-brand-fg disabled:border-border disabled:text-muted-foreground"
            disabled={!canSave}
            onClick={() => onOpenChange(false)}
          >
            Save learning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const VITAL_ITEMS: {
  id: string;
  label: string;
  icon: typeof LineChart;
  help: string;
  alert?: boolean;
}[] = [
  {
    id: "data-tracking",
    label: "Data Tracking",
    icon: LineChart,
    help: "Confirms that visitor and event data is being collected as expected.",
  },
  {
    id: "conversion-tracking",
    label: "Conversion Tracking",
    icon: Download,
    help: "Checks that conversion events for your metrics are firing correctly.",
  },
  {
    id: "minimum-runtime",
    label: "Minimum Runtime Alert",
    icon: CalendarClock,
    help: "Warns if the campaign has not run long enough for reliable decisions.",
  },
  {
    id: "guardrails",
    label: "Guardrails",
    icon: Construction,
    help: "Monitors protection metrics so regressions are caught early.",
  },
  {
    id: "experimentation-conduct",
    label: "Experimentation Conduct",
    icon: FlaskConical,
    help: "Flags configuration changes that can invalidate running experiment data.",
    alert: true,
  },
];

function ExperimentVitalsPopover({
  onViewDetails,
}: {
  onViewDetails: () => void;
}) {
  const [open, setOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpenTimer = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const clearTimers = () => {
    clearOpenTimer();
    clearCloseTimer();
  };

  const scheduleOpen = () => {
    clearCloseTimer();
    if (open || openTimerRef.current) return;
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      setOpen(true);
    }, 300);
  };

  const openPanel = () => {
    clearTimers();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearOpenTimer();
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearTimers(), []);

  const goToVitals = () => {
    clearTimers();
    setOpen(false);
    onViewDetails();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted/60"
          aria-label="Experiment vitals"
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={openPanel}
          onBlur={scheduleClose}
        >
          <VitalsGlyph size={18} className="text-current" />
          <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-vitals-unhealthy px-0.5 text-[9px] font-semibold leading-none text-background">
            1
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,420px)] rounded-xl border border-border p-0 shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={openPanel}
        onMouseLeave={scheduleClose}
      >
        <div className="space-y-3 border-b border-border px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-foreground">
              Experiment Vitals
            </h3>
            <button
              type="button"
              onClick={goToVitals}
              className="shrink-0 text-sm font-medium text-report-brand-fg transition-colors hover:text-report-brand"
            >
              View Details
            </button>
          </div>
          <p className="text-sm leading-5 text-muted-foreground">
            These vitals serve as checks and balances to maintain the integrity
            of the campaign.{" "}
            <button
              type="button"
              className="font-medium text-report-brand-fg transition-colors hover:text-report-brand"
            >
              Learn more
            </button>
          </p>
        </div>

        <ul className="px-2 py-2">
          {VITAL_ITEMS.map(({ id, label, icon: Icon, help, alert }) => (
            <li key={id}>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-foreground">
                  <Icon className="h-4 w-4" aria-hidden />
                  {alert ? (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-vitals-unhealthy text-background">
                      <X className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                  {label}
                </span>
                <SettingsHelp label={help} />
              </div>
              {alert ? (
                <div className="mx-3 mb-2 space-y-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Recommendation
                  </span>
                  <p className="text-sm font-semibold leading-snug text-vitals-unhealthy">
                    Fault in experiment configuration as Metric was changed in a
                    running campaign.
                  </p>
                  <p className="text-sm leading-5 text-muted-foreground">
                    We recommend you to flush data in this campaign for reliable
                    results.{" "}
                    <button
                      type="button"
                      onClick={goToVitals}
                      className="font-medium text-report-brand-fg transition-colors hover:text-report-brand"
                    >
                      View details →
                    </button>
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button type="button" variant="outline" size="sm">
                      Flush Data
                    </Button>
                    <Button type="button" variant="outline" size="sm">
                      Ignore
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function StatisticsEmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 140"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="36"
        y1="108"
        x2="204"
        y2="108"
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="32"
        x2="36"
        y2="108"
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="52"
        x2="204"
        y2="52"
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth="1"
      />
      <line
        x1="36"
        y1="72"
        x2="204"
        y2="72"
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth="1"
      />
      <line
        x1="36"
        y1="92"
        x2="204"
        y2="92"
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth="1"
      />
      <rect
        x="52"
        y="74"
        width="22"
        height="34"
        rx="4"
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeOpacity={0.22}
        strokeWidth="1.2"
      />
      <rect
        x="84"
        y="58"
        width="22"
        height="50"
        rx="4"
        fill="currentColor"
        fillOpacity={0.14}
        stroke="currentColor"
        strokeOpacity={0.22}
        strokeWidth="1.2"
      />
      <rect
        x="116"
        y="44"
        width="22"
        height="64"
        rx="4"
        fill="currentColor"
        fillOpacity={0.18}
        stroke="currentColor"
        strokeOpacity={0.28}
        strokeWidth="1.2"
      />
      <rect
        x="148"
        y="62"
        width="22"
        height="46"
        rx="4"
        fill="currentColor"
        fillOpacity={0.12}
        stroke="currentColor"
        strokeOpacity={0.22}
        strokeWidth="1.2"
      />
      <rect
        x="180"
        y="80"
        width="22"
        height="28"
        rx="4"
        fill="currentColor"
        fillOpacity={0.08}
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth="1.2"
      />
      <path
        d="M48 82 C72 52, 96 38, 127 38 C158 38, 182 54, 196 78"
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="127" cy="38" r="4" fill="currentColor" fillOpacity={0.35} />
      <line
        x1="127"
        y1="42"
        x2="127"
        y2="108"
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
    </svg>
  );
}

function StatisticsPresetEmptyState({ metricName }: { metricName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <StatisticsEmptyIllustration className="h-[130px] w-[240px] text-foreground" />
      <p className="max-w-md text-sm text-muted-foreground">
        Summary statistics for {metricName} with current filters.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table

function TableColumnHelp({
  title,
  body,
  ariaLabel,
}: {
  title: string;
  body: string;
  ariaLabel: string;
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            aria-label={ariaLabel}
          >
            <HelpCircle className="size-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={12}
          className="relative max-w-[640px] overflow-visible rounded-xl border border-border bg-background px-8 py-7 text-left text-foreground shadow-xl"
        >
          <span
            className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-border bg-background"
            aria-hidden
          />
          <div className="space-y-3">
            <p className="text-[18px] font-semibold leading-tight text-foreground">
              {title}
            </p>
            <p className="text-[14px] leading-6 text-foreground/80">{body}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function UniqueConversionsHelp() {
  return (
    <TableColumnHelp
      title="Unique conversions"
      ariaLabel="What are unique conversions"
      body="The number of distinct visitors who recorded at least one conversion for this metric in the selected date range. Each visitor is counted once, even if they convert multiple times."
    />
  );
}

function TotalVisitorsHelp() {
  return (
    <TableColumnHelp
      title="Total visitors"
      ariaLabel="What is total visitors"
      body="The number of visitors who were exposed to each variation for this metric during the selected date range. Used as the denominator when interpreting conversion counts and rates."
    />
  );
}

function ExpectedImprovementHelp() {
  return (
    <TableColumnHelp
      title="Expected improvement (v)"
      ariaLabel="What is expected improvement"
      body="Estimated relative lift of the variation compared to the control (baseline), shown as a percentage. The mini chart positions the estimate on a scale from −6% to +6% relative to no change."
    />
  );
}

function ProbabilityBetterOrEquivalentHelp() {
  return (
    <TableColumnHelp
      title="Probability of Better or Equivalent (v)"
      ariaLabel="What is probability of better or equivalent"
      body="The probability that this variation performs at least as well as the control, given your data and statistical settings (MDE, ROPE, statistical power, and false positive rate). Higher values indicate stronger evidence in favor of the variation."
    />
  );
}

function WinnerThresholdHelp() {
  return (
    <TableColumnHelp
      title={`Winner threshold: ${WINNER_THRESHOLD}%`}
      ariaLabel="What is the winner threshold"
      body={`A variation is highlighted as the winner when its probability of better or equivalent reaches at least ${WINNER_THRESHOLD}%. This threshold is shown on the probability bar for reference.`}
    />
  );
}

function ResultsTableColumnHelp({ columnId }: { columnId: ResultsTableColumnId }) {
  switch (columnId) {
    case "unique-conversions":
      return <UniqueConversionsHelp />;
    case "total-visitors":
      return <TotalVisitorsHelp />;
    case "expected-improvement":
      return <ExpectedImprovementHelp />;
    case "probability":
      return <ProbabilityBetterOrEquivalentHelp />;
    case "conversion-rate":
      return (
        <TableColumnHelp
          title="Conversion rate"
          ariaLabel="What is conversion rate"
          body="Unique conversions divided by total visitors for the variation, expressed as a percentage for the selected metric and date range."
        />
      );
    case "revenue-per-visitor":
      return (
        <TableColumnHelp
          title="Revenue per visitor"
          ariaLabel="What is revenue per visitor"
          body="Average revenue attributed to each visitor in the variation for the selected metric window. Useful when the success metric is tied to monetary value."
        />
      );
    default:
      return null;
  }
}

function reorderResultsColumns(
  columns: ResultsTableColumnId[],
  from: number,
  to: number
): ResultsTableColumnId[] {
  if (
    from < 0 ||
    to < 0 ||
    from >= columns.length ||
    to >= columns.length ||
    from === to
  ) {
    return columns;
  }
  const next = [...columns];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function ReportResultsColumnConfig({
  columns,
  onColumnsChange,
  rowDensity,
  onRowDensityChange,
}: {
  columns: ResultsTableColumnId[];
  onColumnsChange: (next: ResultsTableColumnId[]) => void;
  rowDensity: ResultsRowDensity;
  onRowDensityChange: (next: ResultsRowDensity) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const available = RESULTS_TABLE_COLUMN_IDS.filter((id) => !columns.includes(id));

  const endDrag = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const toggleColumn = (id: ResultsTableColumnId) => {
    if (columns.includes(id)) {
      if (columns.length <= 1) return;
      onColumnsChange(columns.filter((c) => c !== id));
      return;
    }
    onColumnsChange([...columns, id]);
  };

  const resetColumns = () => {
    onColumnsChange([...DEFAULT_RESULTS_TABLE_COLUMNS]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Configure columns"
          aria-label="Configure columns"
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <Columns3 className="size-3.5" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[280px] p-3 text-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Row height</span>
          <div className="inline-flex items-center rounded-md bg-muted p-0.5">
            {REPORT_ROW_DENSITIES.map((d) => (
              <button
                key={d.key}
                type="button"
                title={d.title}
                aria-label={`${d.title} row height`}
                onClick={() => onRowDensityChange(d.key)}
                className={cn(
                  "rounded-[5px] px-2 py-0.5 text-xs transition-colors",
                  rowDensity === d.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="my-2 h-px bg-border" />

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Active view
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Reset to default"
            aria-label="Reset to default"
            onClick={resetColumns}
            className="h-auto w-auto p-1 text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>

        <div className="mt-1.5 flex flex-col">
          {columns.map((id, index) => (
            <div
              key={id}
              draggable
              onDragStart={(e) => {
                setDragIndex(index);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                setDropIndex(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dropIndex !== null) {
                  onColumnsChange(
                    reorderResultsColumns(columns, dragIndex, dropIndex)
                  );
                }
                endDrag();
              }}
              onDragEnd={endDrag}
              className={cn(
                "relative flex cursor-grab items-center gap-2 rounded-sm px-1.5 py-1.5 hover:bg-muted",
                dragIndex === index && "opacity-50"
              )}
            >
              {dragIndex !== null && dropIndex === index && (
                <div className="pointer-events-none absolute inset-x-0 -top-px h-0.5 bg-foreground" />
              )}
              <Checkbox
                checked
                onCheckedChange={() => toggleColumn(id)}
                className={REPORT_COLUMN_CHECKBOX_CLASS}
              />
              <span className="flex-1 truncate">
                {RESULTS_TABLE_COLUMN_META[id].label}
              </span>
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>

        {available.length > 0 ? (
          <>
            <div className="my-2 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              Available Columns
            </span>
            <div className="mt-1.5 flex flex-col">
              {available.map((id) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1.5 hover:bg-muted"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => toggleColumn(id)}
                    className={REPORT_COLUMN_CHECKBOX_CLASS}
                  />
                  <span className="flex-1 truncate">
                    {RESULTS_TABLE_COLUMN_META[id].label}
                  </span>
                </label>
              ))}
            </div>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function TableHeader({
  columns,
  onColumnsChange,
  rowDensity,
  onRowDensityChange,
  edgeShadows,
  grouped,
  groupBy,
}: {
  columns: ResultsTableColumnId[];
  onColumnsChange: (next: ResultsTableColumnId[]) => void;
  rowDensity: ResultsRowDensity;
  onRowDensityChange: (next: ResultsRowDensity) => void;
  edgeShadows: StickyEdgeShadows;
  grouped?: boolean;
  groupBy?: ResultsGroupBy;
}) {
  const isGrouped = Boolean(grouped);
  const gridStyle = {
    ...buildResultsGrid(columns, isGrouped),
    gridTemplateRows: "auto auto",
  } as const;

  const titleCellClass =
    "flex items-center gap-1.5 overflow-hidden bg-muted/50 px-3 pb-1.5 pt-3";
  const subheadCellClass =
    "flex items-start overflow-hidden bg-muted/50 px-3 pb-3 pt-1";

  const groupTitle =
    groupBy === "variation" ? "Variations" : "Segment";
  const nestedTitle =
    groupBy === "variation" ? "Segment" : "Variations";

  return (
    <div
      className="grid items-stretch border-b border-border bg-muted/50"
      style={gridStyle}
    >
      {/* Title row — shared baseline across columns */}
      {isGrouped ? (
        <>
          <div
            className={cn(
              stickyGroupHeaderClass(edgeShadows.left),
              "flex min-w-0 items-center gap-1.5 px-4 pb-1.5 pt-3"
            )}
          >
            <span className={cn(resultsTableHeaderLabelClass, "min-w-0 truncate")}>
              {groupTitle}
            </span>
          </div>
          <div
            className={cn(
              stickyNestedHeaderClass(edgeShadows.left),
              "flex min-w-0 items-center justify-between gap-2 px-4 pb-1.5 pt-3"
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className={cn(resultsTableHeaderLabelClass, "min-w-0 truncate")}
              >
                {nestedTitle}
              </span>
              <FunnelIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
            </span>
            <ReportResultsColumnConfig
              columns={columns}
              onColumnsChange={onColumnsChange}
              rowDensity={rowDensity}
              onRowDensityChange={onRowDensityChange}
            />
          </div>
        </>
      ) : (
        <div
          className={cn(
            stickyVariationsHeaderClass(edgeShadows.left),
            "flex min-w-0 items-center justify-between gap-2 px-4 pb-1.5 pt-3"
          )}
        >
          <span className={cn(resultsTableHeaderLabelClass, "min-w-0 truncate")}>
            Variations
          </span>
          <ReportResultsColumnConfig
            columns={columns}
            onColumnsChange={onColumnsChange}
            rowDensity={rowDensity}
            onRowDensityChange={onRowDensityChange}
          />
        </div>
      )}
      {columns.map((id) => {
        const meta = RESULTS_TABLE_COLUMN_META[id];
        const alignCenter = id === "expected-improvement";
        const isProbability = id === "probability";
        return (
          <div
            key={`title-${id}`}
            className={cn(
              resultsTableMetricCellClass,
              titleCellClass,
              alignCenter && "justify-center px-5",
              !alignCenter && !isProbability && "justify-end",
              isProbability && "justify-start px-4"
            )}
          >
            <span
              className={cn(
                resultsTableHeaderLabelClass,
                "min-w-0 truncate",
                alignCenter && "text-center",
                !alignCenter && !isProbability && "text-right",
                isProbability && "text-left"
              )}
              title={meta.label}
            >
              {meta.label}
            </span>
            <span className="inline-flex shrink-0 items-center">
              <ResultsTableColumnHelp columnId={id} />
            </span>
          </div>
        );
      })}
      <div
        className={cn(
          stickyActionsHeaderClass(edgeShadows.right),
          "pb-1.5 pt-3"
        )}
      />

      {/* Subhead row — shared baseline across columns */}
      {isGrouped ? (
        <>
          <div
            className={cn(
              stickyGroupHeaderClass(edgeShadows.left),
              "px-4 pb-3 pt-1"
            )}
          />
          <div
            className={cn(
              stickyNestedHeaderClass(edgeShadows.left),
              "px-6 pb-3 pt-1"
            )}
          />
        </>
      ) : (
        <div
          className={cn(
            stickyVariationsHeaderClass(edgeShadows.left),
            "px-6 pb-3 pt-1"
          )}
        />
      )}
      {columns.map((id) => {
        if (id === "expected-improvement") {
          return (
            <div
              key={`sub-${id}`}
              className={cn(
                resultsTableMetricCellClass,
                subheadCellClass,
                "justify-between gap-2 px-5"
              )}
            >
              <span className={resultsTableSubheadClass}>-6%</span>
              <span
                className={cn(
                  resultsTableSubheadClass,
                  "font-medium text-foreground/70"
                )}
              >
                0%
              </span>
              <span className={resultsTableSubheadClass}>6%</span>
            </div>
          );
        }
        if (id === "probability") {
          return (
            <div
              key={`sub-${id}`}
              className={cn(
                resultsTableMetricCellClass,
                subheadCellClass,
                "flex-col gap-0.5 px-4"
              )}
            >
              <div className="flex min-w-0 items-center gap-1">
                <span className={cn(resultsTableSubheadClass, "truncate")}>
                  MDE ±20% · ROPE 1.5% · Power 80% · FPR 5%
                </span>
                <Pencil
                  className="h-3 w-3 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <div className="flex items-center gap-1">
                <span className={resultsTableSubheadClass}>
                  Winner threshold: {WINNER_THRESHOLD}%
                </span>
                <WinnerThresholdHelp />
              </div>
            </div>
          );
        }
        return (
          <div
            key={`sub-${id}`}
            className={cn(resultsTableMetricCellClass, subheadCellClass)}
          />
        );
      })}
      <div
        className={cn(
          stickyActionsHeaderClass(edgeShadows.right),
          "pb-3 pt-1"
        )}
      />
    </div>
  );
}

function revenuePerVisitor(
  campaign: Campaign,
  metricName: string,
  variant: Variant,
  index: number,
  filters: ReportFilterContext
): number {
  const seed = hashMetricSeed(
    `${campaign.id}:${metricName}:${variant.id}:rpv:${filterMetricSeedSuffix(filters)}`
  );
  const base = 1.2 + (seed % 400) / 100;
  const lift = index === 0 ? 0 : ((seed >> 8) % 120) / 100;
  return base + lift;
}

function ResultsMetricCell({
  columnId,
  isControl,
  conversions,
  visitors,
  conversionRate,
  uplift,
  confidence,
  revenuePerVisitorValue,
  rowDensity,
}: {
  columnId: ResultsTableColumnId;
  isControl: boolean;
  conversions: number;
  visitors: number;
  conversionRate: number;
  uplift: number | null;
  confidence: number | null;
  revenuePerVisitorValue: number;
  rowDensity: ResultsRowDensity;
}) {
  const metricCell = cn(
    resultsTableMetricCellClass,
    "overflow-hidden bg-background group-hover:bg-[color-mix(in_srgb,hsl(var(--muted))_50%,hsl(var(--background)))]"
  );
  const rowH = RESULTS_ROW_H[rowDensity];
  switch (columnId) {
    case "unique-conversions":
      return (
        <div
          className={cn(
            metricCell,
            rowH,
            "flex items-center justify-end border-b border-border pr-6 text-right text-sm tabular-nums text-foreground"
          )}
        >
          {formatNumber(conversions)}
        </div>
      );
    case "total-visitors":
      return (
        <div
          className={cn(
            metricCell,
            rowH,
            "flex items-center justify-end border-b border-border pr-6 text-right text-sm tabular-nums text-foreground"
          )}
        >
          {formatNumber(visitors)}
        </div>
      );
    case "expected-improvement":
      return (
        <div className={cn(metricCell, "overflow-visible")}>
          <ExpectedImprovementCell
            value={isControl ? null : uplift}
            rowDensity={rowDensity}
          />
        </div>
      );
    case "probability":
      return (
        <div className={metricCell}>
          <ProbabilityCell
            value={isControl ? null : confidence}
            rowDensity={rowDensity}
          />
        </div>
      );
    case "conversion-rate": {
      return (
        <div
          className={cn(
            metricCell,
            rowH,
            "flex items-center justify-end border-b border-border pr-6 text-right text-sm tabular-nums text-foreground"
          )}
        >
          {conversionRate.toFixed(2)}%
        </div>
      );
    }
    case "revenue-per-visitor":
      return (
        <div
          className={cn(
            metricCell,
            rowH,
            "flex items-center justify-end border-b border-border pr-6 text-right text-sm tabular-nums text-foreground"
          )}
        >
          ${revenuePerVisitorValue.toFixed(2)}
        </div>
      );
    default:
      return null;
  }
}

function ResultsTotalMetricCell({
  columnId,
  conversions,
  visitors,
  rowDensity,
}: {
  columnId: ResultsTableColumnId;
  conversions: number;
  visitors: number;
  rowDensity: ResultsRowDensity;
}) {
  const cell = cn(
    resultsTableMetricCellClass,
    RESULTS_ROW_H[rowDensity],
    "flex items-center border-b border-border",
    STICKY_HEADER_BG
  );
  switch (columnId) {
    case "unique-conversions":
      return (
        <div className={cn(cell, "justify-end pr-6 text-sm tabular-nums text-foreground")}>
          {formatNumber(conversions)}
        </div>
      );
    case "total-visitors":
      return (
        <div className={cn(cell, "justify-end pr-6 text-sm tabular-nums text-foreground")}>
          {formatNumber(visitors)}
        </div>
      );
    case "expected-improvement":
      return (
        <div className={cn(cell, "justify-center text-sm text-foreground/70")}>-</div>
      );
    case "probability":
      return (
        <div className={cn(cell, "pl-5 text-sm text-foreground/70")}>-</div>
      );
    case "conversion-rate": {
      const rate = visitors > 0 ? (conversions / visitors) * 100 : 0;
      return (
        <div className={cn(cell, "justify-end pr-6 text-sm tabular-nums text-foreground")}>
          {rate.toFixed(2)}%
        </div>
      );
    }
    case "revenue-per-visitor":
      return (
        <div className={cn(cell, "justify-end pr-6 text-sm tabular-nums text-foreground")}>
          —
        </div>
      );
    default:
      return null;
  }
}

function RowActionsCell({
  className,
  edgeShadows,
  rowDensity,
}: {
  className?: string;
  edgeShadows: StickyEdgeShadows;
  rowDensity: ResultsRowDensity;
}) {
  return (
    <div
      className={cn(
        stickyActionsCellClass(edgeShadows.right),
        RESULTS_ROW_H[rowDensity],
        "flex items-center justify-center border-b border-border bg-background group-hover:bg-[color-mix(in_srgb,hsl(var(--muted))_50%,hsl(var(--background)))]",
        className
      )}
    >
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60"
        aria-label="Row actions"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// The centred mini bar-chart cell for expected improvement. Axis spans -6%..+6%.
function ExpectedImprovementCell({
  value,
  rowDensity,
}: {
  value: number | null;
  rowDensity: ResultsRowDensity;
}) {
  const heightClass = RESULTS_CHART_H[rowDensity];
  if (value === null) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border-b border-border",
          heightClass
        )}
      >
        <span className="text-xs text-foreground/70">-</span>
      </div>
    );
  }
  const clamped = Math.max(-6, Math.min(6, value));
  const end = ((clamped + 6) / 12) * 100; // position along axis
  const positive = value >= 0;
  const left = Math.min(50, end);
  const width = Math.abs(end - 50);
  const nearRight = end >= 88;
  const nearLeft = end <= 12;

  return (
    <div
      className={cn(
        "relative flex items-center overflow-visible border-b border-border px-5",
        heightClass
      )}
    >
      <div className="relative h-full w-full min-w-0 flex-1 overflow-visible">
        {/* median range band */}
        <div className="absolute inset-y-0 left-1/2 w-[35px] -translate-x-1/2 rounded-md bg-muted/50" />
        {/* 0% centre line */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
        {/* value bar — clipped so the fill never spills the cell */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute top-1/2 h-[15px] -translate-y-1/2 rounded-[3px]",
              positive ? "bg-success-fg" : "bg-danger-fg"
            )}
            style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
          />
        </div>
        {/* value label — kept fully inside the cell near the edges */}
        <span
          className={cn(
            "absolute top-[calc(50%-24px)] whitespace-nowrap text-xs tabular-nums text-foreground/70",
            !nearLeft && !nearRight && "-translate-x-1/2"
          )}
          style={
            nearRight
              ? { right: 0 }
              : nearLeft
                ? { left: 0 }
                : { left: `${end}%` }
          }
        >
          {value.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// The horizontal probability bar. Track spans 0..100%; winner threshold marked.
function ProbabilityCell({
  value,
  rowDensity,
}: {
  value: number | null;
  rowDensity: ResultsRowDensity;
}) {
  const heightClass = RESULTS_CHART_H[rowDensity];
  if (value === null) {
    return (
      <div
        className={cn(
          "flex items-center border-b border-border px-5",
          heightClass
        )}
      >
        <span className="text-sm font-medium text-foreground/70">-</span>
      </div>
    );
  }
  const isWinner = value >= WINNER_THRESHOLD;
  return (
    <div
      className={cn(
        "relative flex items-center overflow-hidden border-b border-border px-5",
        heightClass
      )}
    >
      <div className="relative h-[15px] w-full">
        {isWinner && (
          <span className="absolute -top-[18px] left-0 whitespace-nowrap text-xs font-medium text-success-fg">
            Better than baseline
          </span>
        )}
        {/* track */}
        <div className="absolute inset-0 rounded-[3px] bg-muted" />
        {/* fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-[3px]",
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
          className={cn(
            "absolute top-[-26px] border-r border-dashed border-border",
            RESULTS_CHART_H[rowDensity]
          )}
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
  filters,
  dataMode,
  columns,
  edgeShadows,
  rowDensity,
}: {
  campaign: Campaign;
  variant: Variant;
  index: number;
  metricName: string;
  filters: ReportFilterContext;
  dataMode: "visitors" | "sessions";
  columns: ResultsTableColumnId[];
  edgeShadows: StickyEdgeShadows;
  rowDensity: ResultsRowDensity;
}) {
  const { uplift, confidence, conversions, conversionRate, visitors } =
    metricRowStats(campaign, metricName, variant, index, filters, dataMode);
  const tone = badgeTone(index);
  const isControl = index === 0;
  const gridStyle = buildResultsGrid(columns);
  const rpv = revenuePerVisitor(campaign, metricName, variant, index, filters);

  return (
    <div
      className="group grid items-stretch transition-colors"
      style={gridStyle}
    >
      <div
        className={cn(
          stickyVariationsCellClass(edgeShadows.left),
          RESULTS_ROW_H[rowDensity],
          "flex min-w-0 items-center gap-2 border-b border-border pl-6 pr-3"
        )}
      >
        <GraphBadge tone={tone}>{variant.label}</GraphBadge>
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {variant.name}
        </span>
        {isControl && (
          <span className="shrink-0 rounded-full bg-muted px-2 text-xs font-medium text-foreground">
            Baseline
          </span>
        )}
      </div>
      {columns.map((columnId) => (
        <ResultsMetricCell
          key={columnId}
          columnId={columnId}
          isControl={isControl}
          conversions={conversions}
          visitors={visitors}
          conversionRate={conversionRate}
          uplift={uplift}
          confidence={confidence}
          revenuePerVisitorValue={rpv}
          rowDensity={rowDensity}
        />
      ))}
      <RowActionsCell edgeShadows={edgeShadows} rowDensity={rowDensity} />
    </div>
  );
}

function TotalRow({
  conversions,
  visitors,
  columns,
  edgeShadows,
  rowDensity,
}: {
  conversions: number;
  visitors: number;
  columns: ResultsTableColumnId[];
  edgeShadows: StickyEdgeShadows;
  rowDensity: ResultsRowDensity;
}) {
  const cell = cn(
    "flex items-center border-b border-border",
    STICKY_HEADER_BG,
    RESULTS_ROW_H[rowDensity]
  );
  const gridStyle = buildResultsGrid(columns);
  return (
    <div className="group grid items-stretch" style={gridStyle}>
      <div
        className={cn(
          stickyVariationsCellClass(edgeShadows.left),
          cell,
          "min-w-0 gap-2.5 pl-6 pr-4"
        )}
      >
        <GraphBadge tone="total">T</GraphBadge>
        <span className="min-w-0 truncate text-sm font-semibold text-foreground">
          Total
        </span>
      </div>
      {columns.map((columnId) => (
        <ResultsTotalMetricCell
          key={columnId}
          columnId={columnId}
          conversions={conversions}
          visitors={visitors}
          rowDensity={rowDensity}
        />
      ))}
      <div
        className={cn(
          stickyActionsCellClass(edgeShadows.right),
          RESULTS_ROW_H[rowDensity],
          "flex items-center justify-center border-b border-border",
          STICKY_HEADER_BG
        )}
      />
    </div>
  );
}

function isAllTrafficSegment(name: string) {
  return /^all (visitors|traffic)$/i.test(name.trim());
}

function SegmentLabel({
  name,
  linked = false,
}: {
  name: string;
  linked?: boolean;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {!isAllTrafficSegment(name) ? (
        <Crosshair
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          "min-w-0 truncate text-sm font-medium text-foreground",
          linked &&
            "border-b border-dashed border-muted-foreground/70 pb-px"
        )}
      >
        {name}
      </span>
    </span>
  );
}

function VariationLabelContent({
  variant,
  index,
}: {
  variant: Variant;
  index: number;
}) {
  return (
    <>
      <GraphBadge tone={badgeTone(index)}>{variant.label}</GraphBadge>
      <span className="min-w-0 truncate text-sm font-medium text-foreground">
        {variant.name}
      </span>
      {index === 0 ? (
        <span className="shrink-0 rounded-full bg-muted px-2 text-xs font-medium text-foreground">
          Baseline
        </span>
      ) : null}
    </>
  );
}

function GroupedMetricCells({
  campaign,
  variant,
  index,
  metricName,
  filters,
  dataMode,
  columns,
  rowDensity,
}: {
  campaign: Campaign;
  variant: Variant;
  index: number;
  metricName: string;
  filters: ReportFilterContext;
  dataMode: "visitors" | "sessions";
  columns: ResultsTableColumnId[];
  rowDensity: ResultsRowDensity;
}) {
  const { uplift, confidence, conversions, conversionRate, visitors } =
    metricRowStats(campaign, metricName, variant, index, filters, dataMode);
  const rpv = revenuePerVisitor(campaign, metricName, variant, index, filters);
  const isControl = index === 0;
  return (
    <>
      {columns.map((columnId) => (
        <ResultsMetricCell
          key={columnId}
          columnId={columnId}
          isControl={isControl}
          conversions={conversions}
          visitors={visitors}
          conversionRate={conversionRate}
          uplift={uplift}
          confidence={confidence}
          revenuePerVisitorValue={rpv}
          rowDensity={rowDensity}
        />
      ))}
    </>
  );
}

function GroupedResultsBlock({
  groupBy,
  groupLabel,
  groupNode,
  rowCount,
  columns,
  edgeShadows,
  children,
}: {
  groupBy: ResultsGroupBy;
  groupLabel: string;
  groupNode: ReactNode;
  rowCount: number;
  columns: ResultsTableColumnId[];
  edgeShadows: StickyEdgeShadows;
  children: ReactNode;
}) {
  return (
    <div
      className="grid items-stretch"
      style={{
        ...buildResultsGrid(columns, true),
        gridTemplateRows: `repeat(${rowCount}, auto)`,
      }}
    >
      <div
        className={cn(
          stickyGroupCellClass(edgeShadows.left),
          "flex items-center border-b border-border px-4 py-3"
        )}
        style={{ gridRow: `span ${rowCount}` }}
      >
        {groupBy === "variation" ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {groupNode}
          </div>
        ) : (
          <SegmentLabel name={groupLabel} />
        )}
      </div>
      {children}
    </div>
  );
}

function ResultsTable({
  campaign,
  metricName,
  filters,
  dataMode,
  showTotalRow,
  columns,
  onColumnsChange,
  rowDensity,
  onRowDensityChange,
  groupBy,
}: {
  campaign: Campaign;
  metricName: string;
  filters: ReportFilterContext;
  dataMode: "visitors" | "sessions";
  showTotalRow: boolean;
  columns: ResultsTableColumnId[];
  onColumnsChange: (next: ResultsTableColumnId[]) => void;
  rowDensity: ResultsRowDensity;
  onRowDensityChange: (next: ResultsRowDensity) => void;
  groupBy: ResultsGroupBy;
}) {
  const variants = campaign.report.variants;
  const selectedSegments = filters.segments;
  const isGrouped = selectedSegments.length > 0;
  const minWidth = resultsTableMinWidth(columns, isGrouped);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edgeShadows, setEdgeShadows] =
    useState<StickyEdgeShadows>(NO_STICKY_EDGE_SHADOWS);

  const syncEdgeShadows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdgeShadows(measureStickyEdgeShadows(el));
  }, []);

  useLayoutEffect(() => {
    syncEdgeShadows();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncEdgeShadows);
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner) ro.observe(inner);
    return () => ro.disconnect();
  }, [
    syncEdgeShadows,
    columns,
    showTotalRow,
    metricName,
    campaign.id,
    groupBy,
    selectedSegments.length,
  ]);

  const variationTotals = (() => {
    let conversions = 0;
    let visitors = 0;
    for (let i = 0; i < variants.length; i++) {
      const stats = metricRowStats(
        campaign,
        metricName,
        variants[i]!,
        i,
        filters,
        dataMode
      );
      conversions += stats.conversions;
      visitors += stats.visitors;
    }
    return { conversions, visitors };
  })();

  return (
    <div
      ref={scrollRef}
      onScroll={syncEdgeShadows}
      className="isolate overflow-x-auto bg-background [scrollbar-gutter:stable]"
    >
      <div style={{ minWidth }}>
        <TableHeader
          columns={columns}
          onColumnsChange={onColumnsChange}
          rowDensity={rowDensity}
          onRowDensityChange={onRowDensityChange}
          edgeShadows={edgeShadows}
          grouped={isGrouped}
          groupBy={groupBy}
        />

        {!isGrouped ? (
          <>
            {variants.map((variant, index) => (
              <DataRow
                key={`${metricName}-${variant.id}`}
                campaign={campaign}
                variant={variant}
                index={index}
                metricName={metricName}
                filters={filters}
                dataMode={dataMode}
                columns={columns}
                edgeShadows={edgeShadows}
                rowDensity={rowDensity}
              />
            ))}
            {showTotalRow ? (
              <TotalRow
                conversions={variationTotals.conversions}
                visitors={variationTotals.visitors}
                columns={columns}
                edgeShadows={edgeShadows}
                rowDensity={rowDensity}
              />
            ) : null}
          </>
        ) : groupBy === "segment" ? (
          selectedSegments.map((segment) => {
            const segmentFilters: ReportFilterContext = {
              ...filters,
              segments: [segment],
            };
            return (
              <GroupedResultsBlock
                key={segment}
                groupBy={groupBy}
                groupLabel={segment}
                groupNode={null}
                rowCount={variants.length}
                columns={columns}
                edgeShadows={edgeShadows}
              >
                {variants.map((variant, index) => (
                  <Fragment key={`${segment}-${variant.id}`}>
                    <div
                      className={cn(
                        stickyNestedCellClass(edgeShadows.left),
                        RESULTS_ROW_H[rowDensity],
                        "group flex min-w-0 items-center gap-2 border-b border-border pl-4 pr-3"
                      )}
                    >
                      <VariationLabelContent variant={variant} index={index} />
                    </div>
                    <GroupedMetricCells
                      campaign={campaign}
                      variant={variant}
                      index={index}
                      metricName={metricName}
                      filters={segmentFilters}
                      dataMode={dataMode}
                      columns={columns}
                      rowDensity={rowDensity}
                    />
                    <RowActionsCell
                      edgeShadows={edgeShadows}
                      rowDensity={rowDensity}
                    />
                  </Fragment>
                ))}
              </GroupedResultsBlock>
            );
          })
        ) : (
          variants.map((variant, index) => (
            <GroupedResultsBlock
              key={variant.id}
              groupBy={groupBy}
              groupLabel={variant.name}
              groupNode={
                <VariationLabelContent variant={variant} index={index} />
              }
              rowCount={selectedSegments.length}
              columns={columns}
              edgeShadows={edgeShadows}
            >
              {selectedSegments.map((segment) => {
                const segmentFilters: ReportFilterContext = {
                  ...filters,
                  segments: [segment],
                };
                return (
                  <Fragment key={`${variant.id}-${segment}`}>
                    <div
                      className={cn(
                        stickyNestedCellClass(edgeShadows.left),
                        RESULTS_ROW_H[rowDensity],
                        "group flex min-w-0 items-center border-b border-border pl-4 pr-3"
                      )}
                    >
                      <SegmentLabel name={segment} linked />
                    </div>
                    <GroupedMetricCells
                      campaign={campaign}
                      variant={variant}
                      index={index}
                      metricName={metricName}
                      filters={segmentFilters}
                      dataMode={dataMode}
                      columns={columns}
                      rowDensity={rowDensity}
                    />
                    <RowActionsCell
                      edgeShadows={edgeShadows}
                      rowDensity={rowDensity}
                    />
                  </Fragment>
                );
              })}
            </GroupedResultsBlock>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Graph panel

const GRAPH_TABS = [
  {
    id: "date-range" as const,
    label: "Date Range Graph",
    icon: CalendarRange,
    helpTitle: "Date Range Graph",
    helpAria: "About the date range graph",
    helpBody:
      "Shows how the metric rate changes over the selected date range for each variation. Use the interval control to view daily or cumulative points and compare trends over time.",
  },
  {
    id: "expected-conversion-rate" as const,
    label: "Expected Conversion Rate",
    icon: Percent,
    helpTitle: "Expected Conversion Rate",
    helpAria: "About the expected conversion rate graph",
    helpBody:
      "Shows the posterior probability density of conversion rate for each variation. Peaks mark the most likely rate; overlap between curves reflects shared uncertainty.",
  },
  {
    id: "expected-improvement" as const,
    label: "Expected Improvement Graph",
    icon: TrendingUp,
    helpTitle: "Expected Improvement Graph",
    helpAria: "About the expected improvement graph",
    helpBody:
      "Shows the posterior density of relative improvement versus control. The worse and better regions highlight negative and positive lift; the peak is the most likely improvement.",
  },
] as const;

type GraphTabId = (typeof GRAPH_TABS)[number]["id"];

function graphTabIndexFromDefault(defaultGraph: ResultsGraphDefault): number {
  const idx = GRAPH_TABS.findIndex((t) => t.id === defaultGraph);
  return idx >= 0 ? idx : 0;
}

const CHART_PLOT_H = 172;
const CHART_PLOT_W = 100;
const CHART_MARKER_X = 62;

const CHART_STROKE: Record<Exclude<BadgeTone, "total">, string> = {
  ctrl: "hsl(var(--muted-foreground))",
  v1: "hsl(var(--foreground) / 0.45)",
  v2: "hsl(var(--foreground))",
};

const CHART_RANGE_FILL: Record<Exclude<BadgeTone, "total">, string> = {
  ctrl: "hsl(var(--muted-foreground) / 0.18)",
  v1: "hsl(var(--foreground) / 0.1)",
  v2: "hsl(var(--foreground) / 0.14)",
};

function chartY(value: number, yMin: number, yMax: number): number {
  const span = Math.max(0.0001, yMax - yMin);
  const t = (value - yMin) / span;
  return (1 - t) * CHART_PLOT_H;
}

type ChartSeriesKey = Exclude<BadgeTone, "total">;
type ChartInterval = "Daily" | "Cumulative";

const GRAPH_METRIC_OPTIONS = [
  "Conversion Rate (v)",
  "Conversions (v)",
  "Visitors",
  "Sessions",
  "Total Conversions (s)",
] as const;
type GraphMetricOption = (typeof GRAPH_METRIC_OPTIONS)[number];

const GRAPH_DROPDOWN_ITEM_CLASS =
  "flex w-full rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted";
const GRAPH_DROPDOWN_ITEM_ACTIVE_CLASS =
  "bg-muted font-medium text-foreground hover:bg-muted";

const SERIES_INDEX: Record<ChartSeriesKey, number> = {
  ctrl: 0,
  v1: 1,
  v2: 2,
};

/** Endpoint value for a graph series — same numbers as the results table. */
function graphSeriesEndpoint(
  campaign: Campaign,
  tableMetric: string,
  graphMetric: GraphMetricOption,
  seriesKey: ChartSeriesKey,
  statsFor: (metricName: string, variantIndex: number) => MetricRowStats
): number {
  const index = SERIES_INDEX[seriesKey];
  const variantIndex = Math.min(index, campaign.report.variants.length - 1);
  const stats = statsFor(tableMetric, variantIndex);
  switch (graphMetric) {
    case "Conversions (v)":
    case "Total Conversions (s)":
      return stats.conversions;
    case "Visitors":
    case "Sessions":
      return stats.visitors;
    case "Conversion Rate (v)":
    default:
      return stats.conversionRate;
  }
}

function chartSeriesValues(
  endpoint: number,
  metricKey: string,
  seriesKey: string,
  filters: ReportFilterContext,
  interval: ChartInterval,
  pointCount: number
): number[] {
  const seed = hashMetricSeed(
    `${metricKey}:date-range:${seriesKey}:${filterMetricSeedSuffix(filters)}:${interval}`
  );
  const start = endpoint * (interval === "Cumulative" ? 0.55 : 0.72);
  const values: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = i / Math.max(1, pointCount - 1);
    const wave = (((seed >> (i % 12)) & 7) - 3.5) * endpoint * 0.008;
    values.push(Math.max(0, start + (endpoint - start) * t + wave));
  }
  // Pin the last point to the table value so the chart matches the table.
  if (values.length > 0) values[values.length - 1] = endpoint;
  return values;
}

/** Half-width of CI band at each point — wider early, tighter as data accumulates. */
function chartSeriesRangeHalf(
  endpoint: number,
  metricKey: string,
  seriesKey: string,
  filters: ReportFilterContext,
  interval: ChartInterval,
  pointCount: number
): number[] {
  const seed = hashMetricSeed(
    `${metricKey}:date-range-band:${seriesKey}:${filterMetricSeedSuffix(filters)}:${interval}`
  );
  const halves: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = i / Math.max(1, pointCount - 1);
    const jitter = (((seed >> (i % 8)) & 3) + 1) * endpoint * 0.004;
    halves.push(endpoint * 0.08 * (1 - t * 0.55) + jitter);
  }
  return halves;
}

function chartLinePath(
  values: number[],
  yMin: number,
  yMax: number
): string {
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * CHART_PLOT_W;
      const y = chartY(v, yMin, yMax);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function chartRangeBandPath(
  values: number[],
  halves: number[],
  yMin: number,
  yMax: number
): string {
  const n = values.length;
  if (n < 2) return "";
  const upper: string[] = [];
  const lower: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * CHART_PLOT_W;
    const half = halves[i] ?? 0.04;
    const v = values[i]!;
    const yTop = chartY(Math.min(yMax, v + half), yMin, yMax);
    const yBot = chartY(Math.max(yMin, v - half), yMin, yMax);
    upper.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${yTop.toFixed(2)}`);
    lower.push(`L ${x.toFixed(2)} ${yBot.toFixed(2)}`);
  }
  return `${upper.join(" ")} ${lower.reverse().join(" ")} Z`;
}

function formatChartAxisValue(value: number, graphMetric: GraphMetricOption): string {
  if (
    graphMetric === "Conversion Rate (v)"
  ) {
    return `${value.toFixed(2)}%`;
  }
  if (value >= 1000) return formatNumber(Math.round(value));
  return String(Math.round(value));
}

function DateRangeLineChart({
  campaign,
  tableMetric,
  graphMetric,
  filters,
  interval,
  visible,
  showRanges,
}: {
  campaign: Campaign;
  tableMetric: string;
  graphMetric: GraphMetricOption;
  filters: ReportFilterContext;
  interval: ChartInterval;
  visible: Record<ChartSeriesKey, boolean>;
  showRanges: boolean;
}) {
  const { statsFor } = useReportData();
  const pointCount = 13;
  const keys = (["ctrl", "v1", "v2"] as const).filter((k) => visible[k]);
  const series = keys.map((key) => {
    const endpoint = graphSeriesEndpoint(
      campaign,
      tableMetric,
      graphMetric,
      key,
      statsFor
    );
    return {
      key,
      endpoint,
      values: chartSeriesValues(
        endpoint,
        `${tableMetric}:${graphMetric}`,
        key,
        filters,
        interval,
        pointCount
      ),
      halves: chartSeriesRangeHalf(
        endpoint,
        `${tableMetric}:${graphMetric}`,
        key,
        filters,
        interval,
        pointCount
      ),
    };
  });

  const allValues = series.flatMap((s) =>
    s.values.flatMap((v, i) => [v, v + (s.halves[i] ?? 0), v - (s.halves[i] ?? 0)])
  );
  const rawMin = allValues.length ? Math.min(...allValues) : 0;
  const rawMax = allValues.length ? Math.max(...allValues) : 1;
  const pad = Math.max((rawMax - rawMin) * 0.12, rawMax * 0.04, 0.05);
  const yMin = Math.max(0, rawMin - pad);
  const yMax = rawMax + pad;
  const yTicks = [yMax, yMin + (yMax - yMin) * 0.75, yMin + (yMax - yMin) * 0.5, yMin + (yMax - yMin) * 0.25, yMin];

  const markerIndex = Math.round((CHART_MARKER_X / CHART_PLOT_W) * (pointCount - 1));

  return (
    <div className="flex gap-6">
      <div className="flex flex-col justify-between py-2 text-right text-xs font-medium tabular-nums text-muted-foreground">
        {yTicks.map((v, i) => (
          <span key={i}>{formatChartAxisValue(v, graphMetric)}</span>
        ))}
      </div>
      <div className="relative min-w-0 flex-1">
        <div
          className="flex flex-col justify-between py-2"
          style={{ height: CHART_PLOT_H }}
        >
          {yTicks.map((_, i) => (
            <div key={i} className="h-px w-full bg-border/80" />
          ))}
        </div>
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
          {showRanges &&
            series.map(({ key, values, halves }) => (
              <path
                key={`${key}-range`}
                d={chartRangeBandPath(values, halves, yMin, yMax)}
                fill={CHART_RANGE_FILL[key]}
                stroke="none"
              />
            ))}
          {series.map(({ key, values }) => (
            <path
              key={key}
              d={chartLinePath(values, yMin, yMax)}
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
            const v = values[markerIndex] ?? values[values.length - 1]!;
            return (
              <span
                key={key}
                className="absolute text-[10px] font-medium tabular-nums text-foreground"
                style={{
                  left: `${CHART_MARKER_X}%`,
                  top: chartY(v, yMin, yMax),
                  transform: "translate(-50%, -120%)",
                }}
              >
                {formatChartAxisValue(v, graphMetric)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function gaussianPdf(x: number, mean: number, std: number): number {
  const z = (x - mean) / std;
  return Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI));
}

function densityCurvePath(
  mean: number,
  std: number,
  xMin: number,
  xMax: number,
  plotW: number,
  plotH: number,
  yMax: number,
  samples = 96
): string {
  const parts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = xMin + (xMax - xMin) * t;
    const y = Math.min(yMax, gaussianPdf(x, mean, std));
    const px = t * plotW;
    const py = (1 - y / yMax) * plotH;
    parts.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  return parts.join(" ");
}

function densityPeak(
  mean: number,
  std: number,
  xMin: number,
  xMax: number,
  plotW: number,
  plotH: number,
  yMax: number
) {
  const t = (mean - xMin) / (xMax - xMin);
  const y = Math.min(yMax, gaussianPdf(mean, mean, std));
  return {
    x: t * plotW,
    y: (1 - y / yMax) * plotH,
    labelXPct: t * 100,
    labelYPct: ((1 - y / yMax) * plotH) / plotH * 100,
  };
}

const DENSITY_PLOT_W = 100;
const DENSITY_PLOT_H = 200;

const DENSITY_STROKE = {
  ctrl: "hsl(var(--muted-foreground))",
  v1: "hsl(var(--foreground) / 0.55)",
} as const;

function UnderstandGraphLink() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      Understand the graph
      <Info className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

function DensitySeriesLegend({
  tone,
  label,
  name,
  checked,
  onCheckedChange,
}: {
  tone: "ctrl" | "v1";
  label: string;
  name: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="h-5 w-5 rounded-[4px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />
      <span
        className={cn(
          "flex h-5 min-w-[28px] shrink-0 items-center justify-center rounded-full border px-2 text-xs font-medium",
          tone === "ctrl" && "border-border bg-muted text-foreground",
          tone === "v1" && "border-border bg-secondary text-foreground"
        )}
      >
        {label}
      </span>
      <span className="text-sm text-muted-foreground">{name}</span>
    </label>
  );
}

function ExpectedConversionRateChart({
  metricName,
  visible,
  onVisibleChange,
}: {
  campaign: Campaign;
  metricName: string;
  filters: ReportFilterContext;
  visible: { ctrl: boolean; v1: boolean };
  onVisibleChange: (key: "ctrl" | "v1", next: boolean) => void;
}) {
  const { statsFor } = useReportData();
  const ctrlStats = statsFor(metricName, 0);
  const v1Stats = statsFor(metricName, 1);
  const ctrlMean = ctrlStats.conversionRate;
  const v1Mean = v1Stats.conversionRate;
  const pad = Math.max(2, Math.abs(v1Mean - ctrlMean) * 0.75 + 1.5);
  const xMin = Math.max(0, Math.min(ctrlMean, v1Mean) - pad);
  const xMax = Math.max(ctrlMean, v1Mean) + pad;
  const std = Math.max(0.6, (xMax - xMin) / 10);
  const yMax =
    Math.max(
      gaussianPdf(ctrlMean, ctrlMean, std),
      gaussianPdf(v1Mean, v1Mean, std)
    ) * 1.12;
  const tickStep = xMax - xMin > 20 ? 4 : xMax - xMin > 10 ? 2 : 1;
  const xTicks: number[] = [];
  for (let t = Math.ceil(xMin); t <= Math.floor(xMax); t += tickStep) {
    xTicks.push(t);
  }
  if (xTicks.length === 0) xTicks.push(Math.round(xMin), Math.round(xMax));
  const series = [
    visible.ctrl
      ? {
          key: "ctrl" as const,
          mean: ctrlMean,
          path: densityCurvePath(
            ctrlMean,
            std,
            xMin,
            xMax,
            DENSITY_PLOT_W,
            DENSITY_PLOT_H,
            yMax
          ),
          peak: densityPeak(
            ctrlMean,
            std,
            xMin,
            xMax,
            DENSITY_PLOT_W,
            DENSITY_PLOT_H,
            yMax
          ),
        }
      : null,
    visible.v1
      ? {
          key: "v1" as const,
          mean: v1Mean,
          path: densityCurvePath(
            v1Mean,
            std,
            xMin,
            xMax,
            DENSITY_PLOT_W,
            DENSITY_PLOT_H,
            yMax
          ),
          peak: densityPeak(
            v1Mean,
            std,
            xMin,
            xMax,
            DENSITY_PLOT_W,
            DENSITY_PLOT_H,
            yMax
          ),
        }
      : null,
  ].filter(Boolean) as {
    key: "ctrl" | "v1";
    mean: number;
    path: string;
    peak: ReturnType<typeof densityPeak>;
  }[];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <UnderstandGraphLink />
      </div>
      <div className="flex gap-3">
        <div className="flex w-6 shrink-0 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-xs font-medium text-muted-foreground">
            Probability Density
          </span>
        </div>
        <div className="relative min-w-0 flex-1">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between"
            style={{ height: DENSITY_PLOT_H }}
            aria-hidden
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-px w-full bg-border/70" />
            ))}
          </div>
          <svg
            className="relative h-[200px] w-full"
            viewBox={`0 0 ${DENSITY_PLOT_W} ${DENSITY_PLOT_H}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {series.map(({ key, path, peak }) => (
              <g key={key}>
                <line
                  x1={peak.x}
                  x2={peak.x}
                  y1={peak.y}
                  y2={DENSITY_PLOT_H}
                  stroke={DENSITY_STROKE[key]}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                  opacity={0.7}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={DENSITY_STROKE[key]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
          </svg>
          {series.map(({ key, mean, peak }) => (
            <span
              key={`${key}-label`}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground shadow-sm"
              style={{
                left: `${peak.labelXPct}%`,
                top: `${Math.max(4, peak.labelYPct - 2)}%`,
              }}
            >
              {mean.toFixed(2)}%
            </span>
          ))}
          <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground">
            {xTicks.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
            Conversion Rate
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <DensitySeriesLegend
            tone="ctrl"
            label="C"
            name="Control"
            checked={visible.ctrl}
            onCheckedChange={(next) => onVisibleChange("ctrl", next)}
          />
          <DensitySeriesLegend
            tone="v1"
            label="V1"
            name="Variation 1"
            checked={visible.v1}
            onCheckedChange={(next) => onVisibleChange("v1", next)}
          />
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <span
            className="inline-block h-3 w-5 shrink-0 rounded-sm"
            style={{
              background:
                "repeating-linear-gradient(-45deg, hsl(var(--border)), hsl(var(--border)) 1px, transparent 1px, transparent 3px)",
            }}
            aria-hidden
          />
          Uncertainty Overlap
          <HelpCircle className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </div>
  );
}

function ExpectedImprovementChart({
  metricName,
  visible,
  onVisibleChange,
}: {
  campaign: Campaign;
  metricName: string;
  filters: ReportFilterContext;
  visible: boolean;
  onVisibleChange: (next: boolean) => void;
}) {
  const { statsFor } = useReportData();
  const stats = statsFor(metricName, 1);
  const mean = stats.uplift ?? 0;
  const std = Math.max(3, Math.abs(mean) * 0.35 + 4);
  const xMin = Math.min(-15, mean - std * 3);
  const xMax = Math.max(15, mean + std * 3);
  const yMax = gaussianPdf(mean, mean, std) * 1.15;
  const path = densityCurvePath(
    mean,
    std,
    xMin,
    xMax,
    DENSITY_PLOT_W,
    DENSITY_PLOT_H,
    yMax
  );
  const peak = densityPeak(
    mean,
    std,
    xMin,
    xMax,
    DENSITY_PLOT_W,
    DENSITY_PLOT_H,
    yMax
  );
  const zeroX = ((0 - xMin) / (xMax - xMin)) * 100;
  const ropeLeft = ((-1.5 - xMin) / (xMax - xMin)) * 100;
  const ropeRight = ((1.5 - xMin) / (xMax - xMin)) * 100;
  const tickStep = xMax - xMin > 40 ? 10 : 5;
  const xTicks: number[] = [];
  for (
    let t = Math.ceil(xMin / tickStep) * tickStep;
    t <= Math.floor(xMax / tickStep) * tickStep;
    t += tickStep
  ) {
    xTicks.push(t);
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <UnderstandGraphLink />
      </div>
      <div className="flex gap-3">
        <div className="flex w-6 shrink-0 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-xs font-medium text-muted-foreground">
            Improvement Density
          </span>
        </div>
        <div className="relative min-w-0 flex-1">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-sm"
            style={{ height: DENSITY_PLOT_H }}
            aria-hidden
          >
            <div
              className="absolute inset-y-0 left-0 bg-muted"
              style={{ width: `${zeroX}%` }}
            />
            <div
              className="absolute inset-y-0 bg-canvas"
              style={{ left: `${zeroX}%`, right: 0 }}
            />
            <div
              className="absolute inset-y-0 bg-border/60"
              style={{ left: `${ropeLeft}%`, width: `${ropeRight - ropeLeft}%` }}
            />
            <span className="absolute left-3 top-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Worse
            </span>
            <span className="absolute right-3 top-2 text-[11px] font-semibold uppercase tracking-wide text-foreground">
              Better
            </span>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute inset-x-0 h-px bg-border/50"
                style={{ top: `${(i / 5) * 100}%` }}
              />
            ))}
          </div>
          {visible ? (
            <>
              <svg
                className="relative h-[200px] w-full"
                viewBox={`0 0 ${DENSITY_PLOT_W} ${DENSITY_PLOT_H}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <line
                  x1={peak.x}
                  x2={peak.x}
                  y1={peak.y}
                  y2={DENSITY_PLOT_H}
                  stroke={DENSITY_STROKE.v1}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                  opacity={0.75}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={DENSITY_STROKE.v1}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <span
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground shadow-sm"
                style={{
                  left: `${peak.labelXPct}%`,
                  top: `${Math.max(4, peak.labelYPct - 2)}%`,
                }}
              >
                {mean.toFixed(2)}%
              </span>
            </>
          ) : (
            <div style={{ height: DENSITY_PLOT_H }} />
          )}
          <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground">
            {xTicks.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
            Improvement
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <DensitySeriesLegend
          tone="v1"
          label="V1"
          name="Variation 1"
          checked={visible}
          onCheckedChange={onVisibleChange}
        />
      </div>
    </div>
  );
}

function GraphMetricDropdown({
  value,
  onChange,
}: {
  value: GraphMetricOption;
  onChange: (v: GraphMetricOption) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-1 text-sm font-medium text-foreground"
        >
          {value}
          <ChevronDown
            className={cn("h-4 w-4 opacity-70 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[220px] p-1">
        {GRAPH_METRIC_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChange(opt);
              setOpen(false);
            }}
            className={cn(
              GRAPH_DROPDOWN_ITEM_CLASS,
              value === opt && GRAPH_DROPDOWN_ITEM_ACTIVE_CLASS
            )}
          >
            {opt}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function IntervalDropdown({
  value,
  onChange,
}: {
  value: ChartInterval;
  onChange: (v: ChartInterval) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-1 text-sm font-medium text-foreground"
        >
          {value}
          <ChevronDown
            className={cn("h-4 w-4 opacity-70 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1">
        {(["Daily", "Cumulative"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChange(opt);
              setOpen(false);
            }}
            className={cn(
              GRAPH_DROPDOWN_ITEM_CLASS,
              value === opt && GRAPH_DROPDOWN_ITEM_ACTIVE_CLASS
            )}
          >
            {opt}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function LegendItem({
  tone,
  label,
  days,
  checked,
  onCheckedChange,
}: {
  tone: BadgeTone;
  label: string;
  days: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="h-5 w-5 rounded-[4px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />
      <span className="flex items-center gap-1.5">
        <GraphBadge tone={tone}>{label}</GraphBadge>
        <span className="text-sm text-foreground">{days}</span>
      </span>
    </label>
  );
}

function GraphPanel({
  campaign,
  metricName,
  filters,
  defaultGraph,
  className,
}: {
  campaign: Campaign;
  metricName: string;
  filters: ReportFilterContext;
  defaultGraph: ResultsGraphDefault;
  className?: string;
}) {
  const [graphTab, setGraphTab] = useState(() =>
    graphTabIndexFromDefault(defaultGraph)
  );
  const [graphMetric, setGraphMetric] = useState<GraphMetricOption>(
    "Conversion Rate (v)"
  );
  const [interval, setInterval] = useState<ChartInterval>("Daily");
  const [showRanges, setShowRanges] = useState(false);
  const [visible, setVisible] = useState<Record<ChartSeriesKey, boolean>>({
    ctrl: true,
    v1: true,
    v2: true,
  });
  const [densityVisible, setDensityVisible] = useState({ ctrl: true, v1: true });
  const [improvementVisible, setImprovementVisible] = useState(true);

  useEffect(() => {
    setGraphTab(graphTabIndexFromDefault(defaultGraph));
  }, [defaultGraph]);

  const activeTabId: GraphTabId = GRAPH_TABS[graphTab]?.id ?? "date-range";
  const xLabels = ["Oct 25", "Nov 25", "Dec 25", "Jan 26"];

  return (
    <div className={cn("px-8 pb-8", className)}>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-1 border-b border-border">
        {GRAPH_TABS.map(({ id, label, icon: Icon, helpTitle, helpBody, helpAria }, i) => (
          <div
            key={id}
            className={cn(
              "relative -mb-px flex items-center gap-1.5 border-b-2 border-transparent px-0.5 pb-2.5",
              graphTab === i
                ? "border-foreground font-medium text-foreground"
                : "text-muted-foreground"
            )}
          >
            <button
              type="button"
              onClick={() => setGraphTab(i)}
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                graphTab === i
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {label}
            </button>
            <TableColumnHelp
              title={helpTitle}
              body={helpBody}
              ariaLabel={helpAria}
            />
          </div>
        ))}
      </div>

      {activeTabId === "date-range" ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <GraphMetricDropdown value={graphMetric} onChange={setGraphMetric} />
            <IntervalDropdown value={interval} onChange={setInterval} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5">
            <Checkbox
              checked={showRanges}
              onCheckedChange={(v) => setShowRanges(v === true)}
              className="h-4 w-4 rounded-[2px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
            />
            <span className="flex items-center gap-1 text-sm text-foreground">
              Show ranges
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            </span>
          </label>
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-border bg-background p-6">
        {activeTabId === "date-range" ? (
          <div className="space-y-2">
            <DateRangeLineChart
              campaign={campaign}
              tableMetric={metricName}
              graphMetric={graphMetric}
              filters={filters}
              interval={interval}
              visible={visible}
              showRanges={showRanges}
            />
            <div className="flex justify-between pl-14 pr-2 text-xs tabular-nums text-muted-foreground">
              {xLabels.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        ) : activeTabId === "expected-conversion-rate" ? (
          <ExpectedConversionRateChart
            campaign={campaign}
            metricName={metricName}
            filters={filters}
            visible={densityVisible}
            onVisibleChange={(key, next) =>
              setDensityVisible((v) => ({ ...v, [key]: next }))
            }
          />
        ) : (
          <ExpectedImprovementChart
            campaign={campaign}
            metricName={metricName}
            filters={filters}
            visible={improvementVisible}
            onVisibleChange={setImprovementVisible}
          />
        )}
      </div>

      {activeTabId === "date-range" ? (
        <div className="mt-6 flex flex-wrap items-center gap-6 pt-5">
          <LegendItem
            tone="ctrl"
            label="C"
            days="30 Days"
            checked={visible.ctrl}
            onCheckedChange={(next) => setVisible((v) => ({ ...v, ctrl: next }))}
          />
          <LegendItem
            tone="v1"
            label="V1"
            days="14 Days"
            checked={visible.v1}
            onCheckedChange={(next) => setVisible((v) => ({ ...v, v1: next }))}
          />
          <LegendItem
            tone="v2"
            label="V2"
            days="7 Days"
            checked={visible.v2}
            onCheckedChange={(next) => setVisible((v) => ({ ...v, v2: next }))}
          />
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Metric selector (left panel)

const metricsNavAsideClass =
  "sticky top-[var(--reports-tabs-height,0px)] z-10 flex h-[calc(100vh-3.5rem-var(--reports-tabs-height,0px))] shrink-0 self-start flex-col border-r border-panel-border bg-panel text-panel-foreground transition-[width] duration-200 motion-reduce:transition-none";

function MetricsNavShell({
  collapsed,
  onToggleCollapsed,
  children,
  collapsedContent,
  footer,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  children: ReactNode;
  collapsedContent?: ReactNode;
  footer?: ReactNode;
}) {
  if (collapsed) {
    return (
      <aside className={cn(metricsNavAsideClass, "w-16")}>
        {collapsedContent ? (
          <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-4">
            {collapsedContent}
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex justify-center border-t border-panel-border p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Expand metrics panel"
          >
            <PanelLeftOpen className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn(metricsNavAsideClass, "w-[248px]")}>
      {children}
      <div
        className={cn(
          "flex items-center gap-3 border-t border-panel-border px-5 py-4",
          footer ? "" : "justify-end"
        )}
      >
        {footer}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Collapse metrics panel"
        >
          <PanelLeftClose className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </aside>
  );
}

const CONVERSION_RATE_DEFINITION = {
  eventName: "Purchase",
  directionOfBetter: "Increase",
  statisticalModel: "Bayesian Model",
  conversionWindow: "Campaign duration",
  category: "Custom",
} as const;

function MetricDefinitionTooltipContent({
  eventName,
  side,
}: {
  eventName: string;
  side: "top" | "right" | "bottom" | "left";
}) {
  const arrowClass =
    side === "bottom"
      ? "absolute -top-2 left-10 h-4 w-4 rotate-45 border-l border-t border-border bg-background"
      : side === "right"
        ? "absolute -left-2 top-6 h-4 w-4 rotate-45 border-b border-l border-border bg-background"
        : "absolute -top-2 left-10 h-4 w-4 rotate-45 border-l border-t border-border bg-background";

  return (
    <TooltipContent
      side={side}
      align={side === "bottom" ? "start" : "start"}
      sideOffset={side === "bottom" ? 10 : 12}
      className="relative w-[min(100vw-2rem,380px)] overflow-visible rounded-xl border border-border bg-background p-0 text-left text-foreground shadow-xl"
    >
      <span className={arrowClass} aria-hidden />
      <div className="px-5 py-4">
        <p className="text-sm font-semibold text-foreground">Definition</p>
        <div className="mt-3 space-y-0.5 text-sm leading-snug text-foreground">
          <p>
            Metric measures{" "}
            <span className="font-semibold">Unique visitors</span>
          </p>
          <p className="pl-4">
            for event{" "}
            <span className="border-b border-dotted border-muted-foreground font-semibold">
              {eventName}
            </span>
          </p>
        </div>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-baseline gap-1">
            <dt className="text-muted-foreground">Direction of Better</dt>
            <dd className="ml-auto font-medium text-foreground">
              : {CONVERSION_RATE_DEFINITION.directionOfBetter}
            </dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="flex items-center gap-1 text-muted-foreground">
              Statistical Model
              <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </dt>
            <dd className="ml-auto font-medium text-foreground">
              : {CONVERSION_RATE_DEFINITION.statisticalModel}
            </dd>
          </div>
          <div className="flex items-baseline gap-1">
            <dt className="text-muted-foreground">Conversion Window</dt>
            <dd className="ml-auto font-medium text-foreground">
              : {CONVERSION_RATE_DEFINITION.conversionWindow}
            </dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="text-muted-foreground">Category</dt>
            <dd className="ml-auto flex items-center gap-1.5 font-medium text-foreground">
              : {CONVERSION_RATE_DEFINITION.category}
              <Wrench className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            </dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-border pt-3">
          <button
            type="button"
            className="flex items-center gap-0.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            Advanced Settings
          </button>
        </div>
      </div>
    </TooltipContent>
  );
}

function MetricDefinitionTooltip({
  children,
  side = "right",
  eventName = CONVERSION_RATE_DEFINITION.eventName,
}: {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  eventName?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <MetricDefinitionTooltipContent eventName={eventName} side={side} />
    </Tooltip>
  );
}

const MetricListItem = forwardRef<
  HTMLButtonElement,
  {
    icon: ReactNode;
    label: string;
    active?: boolean;
    trailing?: ReactNode;
    onClick: () => void;
  } & ButtonHTMLAttributes<HTMLButtonElement>
>(function MetricListItem(
  { icon, label, active, trailing, onClick, className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-foreground transition-colors hover:bg-muted",
        active && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      <span className="shrink-0 text-foreground/70">{icon}</span>
      <span
        className={cn("min-w-0 flex-1 truncate", active && "font-medium")}
      >
        {label}
      </span>
      {trailing ? (
        <span className="flex h-5 shrink-0 items-center">{trailing}</span>
      ) : null}
    </button>
  );
});

function MetricGroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 pb-1 text-sm font-semibold text-foreground">{children}</p>
  );
}

function MetricRailItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-current={active ? "true" : undefined}
          aria-label={label}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            active
              ? "bg-accent text-foreground"
              : "text-foreground hover:bg-muted/60"
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function MetricRailDivider() {
  return <div className="my-1 h-px w-5 bg-border" />;
}

const metricsSidebarScrollClass =
  "flex min-h-0 flex-1 flex-col overflow-y-auto py-6";
const metricsSidebarPrimarySectionClass = "flex flex-col gap-1 px-3";
const metricsSidebarSectionClass = "mt-3 flex flex-col gap-1 border-t border-panel-border px-3 pt-3";
const metricsSidebarActionStripClass =
  "mt-3 flex min-h-[44px] items-center border-t border-panel-border px-3 pt-3";

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

  const collapsedContent = (
    <TooltipProvider delayDuration={200}>
      <MetricRailItem
        icon={cursorIcon}
        label={campaign.primaryMetric}
        active={selectedMetric === campaign.primaryMetric}
        onClick={() => onSelectMetric(campaign.primaryMetric)}
      />
      <MetricRailDivider />
      {guardrails.map((metric, i) => (
        <MetricRailItem
          key={metric.name}
          icon={
            i === 1 ? <LayoutPanelTop className="h-4 w-4" aria-hidden /> : cursorIcon
          }
          label={metric.name}
          active={selectedMetric === metric.name}
          onClick={() => onSelectMetric(metric.name)}
        />
      ))}
      <MetricRailDivider />
      {secondary.map((metric) => (
        <MetricRailItem
          key={metric.name}
          icon={cursorIcon}
          label={metric.name}
          active={selectedMetric === metric.name}
          onClick={() => onSelectMetric(metric.name)}
        />
      ))}
    </TooltipProvider>
  );

  const primaryMetricItem = (
    <MetricListItem
      icon={cursorIcon}
      label={campaign.primaryMetric}
      active={selectedMetric === campaign.primaryMetric}
      onClick={() => onSelectMetric(campaign.primaryMetric)}
    />
  );

  return (
    <TooltipProvider delayDuration={200}>
      <MetricsNavShell
        collapsed={collapsed}
        onToggleCollapsed={onToggleCollapsed}
        collapsedContent={collapsedContent}
      >
        <div className={metricsSidebarScrollClass}>
          {/* Primary Metric */}
          <div className={metricsSidebarPrimarySectionClass}>
            <MetricGroupLabel>Primary Metric</MetricGroupLabel>
            {campaign.primaryMetric === "Conversion rate" ? (
              <MetricDefinitionTooltip side="right">
                {primaryMetricItem}
              </MetricDefinitionTooltip>
            ) : (
              primaryMetricItem
            )}
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
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Compare metrics — left-panel metric picker (checkbox variant)

function CompareCheckItem({
  name,
  checked,
  onToggle,
}: {
  name: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted",
        checked && "bg-accent font-medium text-accent-foreground"
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        <Checkbox
          checked={checked}
          onCheckedChange={() => onToggle()}
          className="h-4 w-4 rounded-[4px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        />
      </span>
      <span className="min-w-0 flex-1 truncate">{name}</span>
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
          />
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

function ResultsGroupByControl({
  value,
  onChange,
}: {
  value: ResultsGroupBy;
  onChange: (next: ResultsGroupBy) => void;
}) {
  return (
    <>
      <span className="text-sm text-muted-foreground">Group by :</span>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as ResultsGroupBy)}
      >
        <SelectTrigger className="h-7 w-[130px] gap-1 rounded-md border-border text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="variation">Variations</SelectItem>
          <SelectItem value="segment">Segments</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

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
    <div
      className="grid items-stretch border-b border-border bg-muted/50"
      style={{ ...COMPARE_GRID, gridTemplateRows: "auto auto" }}
    >
      {/* Title row */}
      <div className="flex items-center gap-1.5 border-r border-border px-5 pb-1.5 pt-3">
        <span className="text-xs font-medium text-muted-foreground">Metric</span>
        <FunnelIcon className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-1.5 px-4 pb-1.5 pt-3">
        <span className="text-xs font-medium text-muted-foreground">Variations</span>
        <FunnelIcon className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="flex items-center justify-end gap-1 px-2 pb-1.5 pt-3">
        <span className="truncate text-right text-xs font-medium text-muted-foreground">
          Unique conversions
        </span>
        <UniqueConversionsHelp />
      </div>
      <div className="flex items-center justify-end gap-1 px-2 pb-1.5 pt-3">
        <span className="truncate text-right text-xs font-medium text-muted-foreground">
          Total visitors
        </span>
        <TotalVisitorsHelp />
      </div>
      <div className="flex items-center justify-center gap-1 px-5 pb-1.5 pt-3">
        <span className="truncate text-center text-xs font-medium text-muted-foreground">
          Expected improvement(v)
        </span>
        <ExpectedImprovementHelp />
      </div>
      <div className="flex items-center gap-1 px-6 pb-1.5 pt-3">
        <span className="truncate text-xs font-medium text-muted-foreground">
          Probability of Better or Equivalent (v)
        </span>
        <ProbabilityBetterOrEquivalentHelp />
      </div>

      {/* Subhead row */}
      <div className="border-r border-border px-5 pb-3 pt-1" />
      <div className="px-4 pb-3 pt-1" />
      <div className="px-2 pb-3 pt-1" />
      <div className="px-2 pb-3 pt-1" />
      <div className="flex items-start justify-between px-5 pb-3 pt-1 text-[10px] leading-none text-muted-foreground">
        <span>-6%</span>
        <span>0%</span>
        <span>6%</span>
      </div>
      <div className="flex flex-col items-start gap-0.5 px-6 pb-3 pt-1 text-[10px] leading-none text-muted-foreground">
        <span className="truncate">
          MDE ±20% · ROPE 1.5% · Power 80% · FPR 5%
        </span>
        <div className="flex items-center gap-1">
          <span>Winner threshold: {WINNER_THRESHOLD}%</span>
          <WinnerThresholdHelp />
        </div>
      </div>
    </div>
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
  groupBy: GroupBy,
  statsFor: (metricName: string, variantIndex: number) => MetricRowStats
): CompareGroup[] {
  const variants = campaign.report.variants;

  if (groupBy === "variation") {
    return variants.map((variant, vi) => ({
      key: variant.id,
      label: <VariantLabel variant={variant} index={vi} />,
      rows: metrics.map((m) => {
        const s = statsFor(m.name, vi);
        return {
          key: m.name,
          rowLabel: <MetricLabel name={m.name} isPrimary={m.isPrimary} />,
          conversions: s.conversions,
          visitors: s.visitors,
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
      const s = statsFor(m.name, vi);
      return {
        key: variant.id,
        rowLabel: <VariantLabel variant={variant} index={vi} />,
        conversions: s.conversions,
        visitors: s.visitors,
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
  filters: ReportFilterContext;
  dataMode?: ReportDataMode;
}) {
  const { statsFor } = useReportData();
  const groups = buildGroups(campaign, metrics, groupBy, statsFor);

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
                  <div className="flex items-center justify-end border-b border-border pr-6 text-right text-sm tabular-nums text-foreground">
                    {formatNumber(row.conversions)}
                  </div>
                  <div className="flex items-center justify-end border-b border-border pr-6 text-right text-sm tabular-nums text-foreground">
                    {formatNumber(row.visitors)}
                  </div>
                  <ExpectedImprovementCell
                    value={row.improvement}
                    rowDensity="default"
                  />
                  <ProbabilityCell
                    value={row.probability}
                    rowDensity="default"
                  />
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
  filters,
  dataMode = "visitors",
  onClear,
}: {
  campaign: Campaign;
  metrics: CompareMetric[];
  groupBy: GroupBy;
  filters: ReportFilterContext;
  dataMode?: ReportDataMode;
  onClear: () => void;
}) {
  const count = metrics.length;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-start justify-between px-5 py-4">
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
        <div className="flex h-[360px] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
            <Columns3 className="h-12 w-12 text-muted-foreground/50" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No metrics selected</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Select one or more metrics from the left to compare.
            </p>
          </div>
        </div>
      ) : (
        <CompareTable
          campaign={campaign}
          metrics={metrics}
          groupBy={groupBy}
          filters={filters}
          dataMode={dataMode}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function ResultsTab({
  campaign,
  onNavigateToVitals,
}: {
  campaign: Campaign;
  onNavigateToVitals: () => void;
}) {
  const reportData = useReportData();
  const { filters, dataMode, best, conclusion } = reportData;

  const [selectedMetric, setSelectedMetric] = useReportSelectedMetric(
    campaign.id,
    campaign.primaryMetric
  );
  const [compareMode, setCompareMode] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("variation");
  const [resultsGroupBy, setResultsGroupBy] =
    useState<ResultsGroupBy>("variation");
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [learningsOpen, setLearningsOpen] = useState(false);
  const [metricsNavCollapsed, setMetricsNavCollapsed] =
    useReportMetricsNavCollapsed(campaign.id);

  const activePresetId = useActiveReportPresetId(campaign.id);
  const viewState = useActiveReportPresetState(campaign.id);
  const viewSettings =
    viewState.viewSettings ?? DEFAULT_REPORT_VIEW_SETTINGS;
  const resultsTableColumns = useActiveResultsTableColumns(campaign.id);
  const resultsRowDensity = useActiveResultsRowDensity(campaign.id);
  const updateActivePreset = useReportViewsStore((s) => s.updateActivePreset);
  const setResultsTableColumnsDraft = useReportViewsStore(
    (s) => s.setResultsTableColumnsDraft
  );
  const setResultsRowDensityDraft = useReportViewsStore(
    (s) => s.setResultsRowDensityDraft
  );
  const setResultsTableColumns = (next: ResultsTableColumnId[]) =>
    setResultsTableColumnsDraft(campaign.id, next);
  const setResultsRowDensity = (next: ResultsRowDensity) =>
    setResultsRowDensityDraft(campaign.id, next);
  const isStatisticsPreset = activePresetId === REPORT_PRESET_IDS.statistics;

  const others = campaign.report.otherMetrics;
  const splitAt = Math.max(1, others.length - Math.max(1, Math.floor(others.length / 3)));
  const compareableMetrics = others.slice(splitAt);
  const [compareSelected, setCompareSelected] = useState<string[]>([]);

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
    ...compareableMetrics.map((m) => ({ name: m.name, isPrimary: false })),
  ];
  const orderedCompareMetrics = allMetrics.filter((m) =>
    compareSelected.includes(m.name)
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-full items-start">
      {compareMode ? (
        <CompareMetricSelector
          campaign={campaign}
          selected={compareSelected}
          onToggle={toggleCompare}
          onClear={() => setCompareMode(false)}
          collapsed={metricsNavCollapsed}
          onToggleCollapsed={() => setMetricsNavCollapsed(!metricsNavCollapsed)}
        />
      ) : (
        <MetricSelector
          campaign={campaign}
          selectedMetric={selectedMetric}
          onSelectMetric={setSelectedMetric}
          onEnterCompare={enterCompare}
          collapsed={metricsNavCollapsed}
          onToggleCollapsed={() => setMetricsNavCollapsed(!metricsNavCollapsed)}
        />
      )}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1120px] space-y-8 px-12 pb-8 pt-12">
          <ViewSettingsDialog
            open={viewSettingsOpen}
            onOpenChange={setViewSettingsOpen}
            settings={viewSettings}
            onSave={(next) => {
              updateActivePreset(campaign.id, { viewSettings: next });
            }}
          />
          <LearningsDialog open={learningsOpen} onOpenChange={setLearningsOpen} />
          <ReportViewBar campaignId={campaign.id} />
          {compareMode ? (
            <>
              <ResultsFilterPanel
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
                filters={filters}
                dataMode={dataMode}
                onClear={() => setCompareMode(false)}
              />
            </>
          ) : (
            <>
              <ResultsFilterPanel
                campaignId={campaign.id}
                right={
                  filters.segments.length > 0 ? (
                    <ResultsGroupByControl
                      value={resultsGroupBy}
                      onChange={setResultsGroupBy}
                    />
                  ) : undefined
                }
              />
              <MetricHeader
                campaign={campaign}
                metric={selectedMetric}
                isPrimary={selectedMetric === campaign.primaryMetric}
                onOpenSettings={() => setViewSettingsOpen(true)}
                onOpenLearnings={() => setLearningsOpen(true)}
                onViewVitalsDetails={onNavigateToVitals}
              />
              <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                <div className="border-b border-border">
                  <ConclusionBanner
                    conclusion={conclusion}
                    variantName={best.name}
                    embedded
                  />
                </div>
                {isStatisticsPreset ? (
                  <StatisticsPresetEmptyState metricName={selectedMetric} />
                ) : viewSettings.layout === "graphs-first" ? (
                  <div className="flex flex-col gap-12">
                    <GraphPanel
                      campaign={campaign}
                      metricName={selectedMetric}
                      filters={filters}
                      defaultGraph={viewSettings.defaultGraph}
                      className="pt-6"
                    />
                    <ResultsTable
                      campaign={campaign}
                      metricName={selectedMetric}
                      filters={filters}
                      dataMode={dataMode}
                      showTotalRow={viewSettings.showTotalRow}
                      columns={resultsTableColumns}
                      onColumnsChange={setResultsTableColumns}
                      rowDensity={resultsRowDensity}
                      onRowDensityChange={setResultsRowDensity}
                      groupBy={resultsGroupBy}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-12">
                    <ResultsTable
                      campaign={campaign}
                      metricName={selectedMetric}
                      filters={filters}
                      dataMode={dataMode}
                      showTotalRow={viewSettings.showTotalRow}
                      columns={resultsTableColumns}
                      onColumnsChange={setResultsTableColumns}
                      rowDensity={resultsRowDensity}
                      onRowDensityChange={setResultsRowDensity}
                      groupBy={resultsGroupBy}
                    />
                    <GraphPanel
                      campaign={campaign}
                      metricName={selectedMetric}
                      filters={filters}
                      defaultGraph={viewSettings.defaultGraph}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
