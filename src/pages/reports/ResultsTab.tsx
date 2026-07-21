import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Award,
  CalendarRange,
  ChevronDown,
  Columns3,
  HelpCircle,
  Layers,
  LayoutPanelTop,
  MousePointerClick,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  PieChart,
  Star,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import type { Campaign, Variant } from "../../data/campaigns";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  REPORT_DIMENSION_OPTIONS,
  fromYmd,
  toYmd,
  useReportActiveViewState,
  useReportViewsStore,
  useIsReportViewDirty,
  type ReportDateRange,
} from "../../store/reportViews";
import DateRangeDropdown, { type DateRange } from "./DateRangeDropdown";
import ReportViewBar from "./ReportViewBar";
import ReportViewSaveActions from "./ReportViewSaveActions";
import { SegmentsSelector } from "./SegmentsDrawer";
import {
  filterMetricSeedSuffix,
  reportVisitorScale,
  type ReportFilterContext,
} from "./reportFilters";

const WINNER_THRESHOLD = 95;

// Column template shared by the header, sub-head and every data row so the
// whole table stays aligned.
const GRID = {
  gridTemplateColumns:
    "minmax(220px,1.6fr) 110px 120px minmax(190px,1.2fr) minmax(300px,1.5fr) 40px",
} as const;

const formatNumber = (n: number) => n.toLocaleString("en-US");

function variantVisitors(
  campaign: Campaign,
  index: number,
  filters: ReportFilterContext,
  mode: "visitors" | "sessions" = "visitors"
): number {
  const scale = reportVisitorScale(filters);
  const total = Math.max(1, Math.round(campaign.visitors * scale));
  const count = campaign.report.variants.length;
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  const visitors = base + (index < remainder ? 1 : 0);
  return mode === "sessions" ? Math.max(1, Math.round(visitors * 1.32)) : visitors;
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
  index: number,
  filters: ReportFilterContext,
  dataMode: "visitors" | "sessions" = "visitors"
): { uplift: number | null; confidence: number | null; conversions: number } {
  const visitors = variantVisitors(campaign, index, filters, dataMode);
  const suffix = filterMetricSeedSuffix(filters);
  if (metricName === campaign.primaryMetric) {
    const uplift =
      variant.uplift === null
        ? null
        : Number((variant.uplift * reportVisitorScale(filters)).toFixed(1));
    const confidence =
      variant.confidence === null
        ? null
        : Math.min(
            99,
            Math.max(
              1,
              Math.round(variant.confidence * (0.85 + reportVisitorScale(filters) * 0.15))
            )
          );
    return {
      uplift,
      confidence,
      conversions: variantConversions(variant, visitors),
    };
  }
  const seed = hashMetricSeed(
    `${campaign.id}:${metricName}:${variant.id}:${suffix}:${dataMode}`
  );
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
const MAX_VISITOR_DIMENSIONS = 2;

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
  const isDirty = useIsReportViewDirty(campaignId);
  const showTrailing = Boolean(right) || isDirty;

  return (
    <div className="flex items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
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
        <SegmentsSelector
          value={segments}
          onChange={(next) => updateDraft(campaignId, { segments: next })}
        />
        <MultiSelectFilterChip
          icon={<Layers className="h-3.5 w-3.5" aria-hidden />}
          label="Dimensions"
          options={REPORT_DIMENSION_OPTIONS}
          value={dimensions}
          onChange={(next) => updateDraft(campaignId, { dimensions: next })}
          maxSelections={MAX_VISITOR_DIMENSIONS}
        />
      </div>
      {showTrailing && (
        <div className="flex shrink-0 items-center gap-2 self-center">
          {right}
          <ReportViewSaveActions campaignId={campaignId} />
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
    <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-border bg-background pl-2.5 pr-1.5 text-sm text-foreground">
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
  const { segments } = useReportActiveViewState(campaignId);
  const updateDraft = useReportViewsStore((s) => s.updateActiveViewDraft);
  if (segments.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5">
      <span className="mr-1 text-sm text-muted-foreground">Segments :</span>
      {segments.map((name) => (
        <AppliedSegmentChip
          key={name}
          name={name}
          onRemove={() =>
            updateDraft(campaignId, {
              segments: segments.filter((s) => s !== name),
            })
          }
        />
      ))}
      <button
        type="button"
        onClick={() => updateDraft(campaignId, { segments: [] })}
        className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Clear All
      </button>
    </div>
  );
}

function AppliedDimensionsRow({ campaignId }: { campaignId: string }) {
  const { dimensions } = useReportActiveViewState(campaignId);
  const updateDraft = useReportViewsStore((s) => s.updateActiveViewDraft);
  if (dimensions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5">
      <span className="mr-1 text-sm text-muted-foreground">Dimensions :</span>
      {dimensions.map((name) => (
        <AppliedSegmentChip
          key={name}
          name={name}
          onRemove={() =>
            updateDraft(campaignId, {
              dimensions: dimensions.filter((d) => d !== name),
            })
          }
        />
      ))}
      <button
        type="button"
        onClick={() => updateDraft(campaignId, { dimensions: [] })}
        className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
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
}: {
  campaignId: string;
  right?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="px-4 py-3">
        <FilterBar campaignId={campaignId} right={right} />
      </div>
      <AppliedSegmentsRow campaignId={campaignId} />
      <AppliedDimensionsRow campaignId={campaignId} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conclusion banner

function ConclusionBanner({ variantName }: { variantName: string }) {
  return (
    <div className="flex items-center gap-3 rounded-t-lg border border-report-green-border bg-report-green-tint px-5 py-3.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-report-green-border bg-report-green-badge">
        <Award className="h-4 w-4 text-decision-winner-fg" aria-hidden />
      </span>
      <p className="text-sm font-medium leading-snug text-foreground">
        {variantName} is better or equivalent to baseline and the best choice as it gives the
        highest improvement
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View settings dialog

type ResultsLayout = "table-first" | "graphs-first";
type ResultsGraphDefault = "date-range" | "expected-improvement";

type ReportViewSettings = {
  layout: ResultsLayout;
  defaultGraph: ResultsGraphDefault;
  showExpectedConversionRateRange: boolean;
  showExpectedImprovementRange: boolean;
  showTotalRow: boolean;
  showDisabledVariationRows: boolean;
};

const DEFAULT_REPORT_VIEW_SETTINGS: ReportViewSettings = {
  layout: "table-first",
  defaultGraph: "date-range",
  showExpectedConversionRateRange: true,
  showExpectedImprovementRange: true,
  showTotalRow: true,
  showDisabledVariationRows: true,
};

function SettingsHelp({ label }: { label: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
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
                  <RadioGroupItem value="expected-improvement" />
                  <span className="text-sm text-foreground">Expected Improvement</span>
                </label>
                <label className="flex cursor-not-allowed items-center gap-3 opacity-45">
                  <RadioGroupItem value="expected-conversion-rate" disabled />
                  <span className="text-sm text-foreground">Expected Conversion Rate</span>
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
// Statistical configuration dialog

function StatisticalConfigurationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px] border-0 bg-transparent p-0 shadow-none sm:rounded-lg [&>button]:hidden">
        <div className="rounded-xl border border-border bg-background p-8 shadow-sm">
          <div className="space-y-3">
            <h2 className="text-[34px] font-semibold leading-tight tracking-tight text-foreground">
              Statistical Configuration
            </h2>
            <p className="text-base leading-6 text-muted-foreground">
              These are advanced statistical adjustments used to fine tune your
              experiment.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground">
                  Campaign Specific
                </h3>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label="Edit campaign specific"
                  onClick={() => {
                    // UI-only mock: editing flows are out of scope for this modal.
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-base text-foreground/80">
                    Testing approach
                  </span>
                  <span className="flex items-center gap-3 text-base text-foreground">
                    <span className="text-muted-foreground">•</span> Sequential
                  </span>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span className="text-base text-foreground/80">
                    Multiple Testing Correction
                  </span>
                  <span className="flex items-center gap-3 text-base text-foreground">
                    <span className="text-muted-foreground">•</span> None
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground">
                  Metric Specific
                </h3>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label="Edit metric specific"
                  onClick={() => {
                    // UI-only mock: editing flows are out of scope for this modal.
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-md border border-report-blue-border bg-report-blue-bg px-3 py-1 text-sm font-semibold text-report-blue-fg">
                    <Star className="h-4 w-4" aria-hidden />
                    M4
                  </span>
                  <span className="text-base font-medium text-foreground">
                    Page Visit To Live-Session-Recording
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-baseline justify-between gap-6">
                  <span className="text-base text-foreground/80">
                    Testing Objective
                  </span>
                  <span className="text-base font-medium text-foreground">
                    <span className="mr-3 text-muted-foreground">•</span> Better
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <span className="text-base text-foreground/80">
                    Minimum Detectable Effect (MDE)
                  </span>
                  <span className="text-base font-medium text-foreground">
                    <span className="mr-3 text-muted-foreground">•</span> ±5% of
                    baseline average
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <span className="text-base text-foreground/80">
                    Region of Practical Equivalence (ROPE)
                  </span>
                  <span className="text-base font-medium text-foreground">
                    <span className="mr-3 text-muted-foreground">•</span> ±1%
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <span className="text-base text-foreground/80">
                    Statistical Power (1 - β)
                  </span>
                  <span className="text-base font-medium text-foreground">
                    <span className="mr-3 text-muted-foreground">•</span> 80%
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <span className="text-base text-foreground/80">
                    False Positive Rate (α)
                  </span>
                  <span className="text-base font-medium text-foreground">
                    <span className="mr-3 text-muted-foreground">•</span> 10%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Metric header

function MetricHeader({
  metric,
  isPrimary,
  onOpenChartView,
  onOpenSettings,
}: {
  metric: string;
  isPrimary: boolean;
  onOpenChartView: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="flex items-start justify-between px-5 py-4">
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
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenChartView}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="Chart view"
        >
          <PieChart className="h-[18px] w-[18px]" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner tabs

const INNER_TABS = ["Raw data (visitors)", "Raw data (sessions)", "Statistics"] as const;
type InnerDataTab = (typeof INNER_TABS)[number];

function InnerTabs({
  active,
  onChange,
}: {
  active: InnerDataTab;
  onChange: (tab: InnerDataTab) => void;
}) {
  return (
    <div className="flex items-end gap-4 border-b border-border px-5 pt-1">
      <div className="flex flex-1 items-end gap-5">
        {INNER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={cn(
              "relative px-1 pb-2 text-sm transition-colors",
              active === tab
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

function ExpectedConversionRateHelp() {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            aria-label="What is expected conversion rate"
          >
            <HelpCircle className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={10}
          className="relative max-w-[640px] overflow-visible rounded-xl border border-border bg-background px-8 py-7 text-left text-foreground shadow-xl"
        >
          <span
            className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 border-b border-r border-border bg-background"
            aria-hidden
          />
          <div className="space-y-3">
            <p className="text-[18px] font-semibold leading-tight text-foreground">
              Expected Conversion Rate
            </p>
            <p className="text-[14px] leading-6 text-foreground/80">
              This is the median conversion rate you can expect from the
              variation. The 'best case' and 'worst case' conversion rates
              represent the expected interval of the conversion rate.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TableHeader() {
  return (
    <>
      {/* Column titles — top-aligned so every label shares one baseline */}
      <div className="grid items-start bg-muted/30" style={GRID}>
        <div className="flex items-center gap-1 px-5 pb-2 pt-3">
          <span className="text-xs font-semibold text-foreground/75">Variations</span>
        </div>
        <div className="flex items-center justify-end gap-1 px-2 pb-2 pt-3">
          <span className="text-right text-xs font-semibold text-foreground/75">
            Unique conversions
          </span>
          <ExpectedConversionRateHelp />
        </div>
        <div className="flex items-center justify-end gap-1 px-2 pb-2 pt-3">
          <span className="text-right text-xs font-semibold text-foreground/75">
            Total visitors
          </span>
          <HeaderHelp />
        </div>
        <div className="flex items-center justify-center gap-1 px-2 pb-2 pt-3">
          <span className="text-center text-xs font-semibold text-foreground/75">
            Expected improvement(v)
          </span>
          <HeaderHelp />
        </div>
        <div className="flex flex-col gap-0.5 px-5 pb-2 pt-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-foreground/75">
              Probability of Better or Equivalent (v)
            </span>
            <HeaderHelp />
          </div>
          <div className="flex items-center gap-1 text-[10px] leading-none text-muted-foreground">
            MDE: ± 20%&nbsp;&nbsp;ROPE: 1.5%&nbsp;&nbsp;Power: 80%&nbsp;&nbsp;FPR: 5%
            <Pencil className="h-3 w-3 shrink-0" aria-hidden />
          </div>
        </div>
        <div />
      </div>

      {/* Axis / threshold sub-head — same grid, shared baseline */}
      <div
        className="grid items-center border-b border-border bg-muted/40 text-[10px] leading-none text-muted-foreground"
        style={GRID}
      >
        <div className="h-5" />
        <div className="h-5" />
        <div className="h-5" />
        <div className="flex h-5 items-center justify-between px-5">
          <span>-6%</span>
          <span>0%</span>
          <span>6%</span>
        </div>
        <div className="flex h-5 items-center justify-end gap-1 pr-5">
          <span>Winner threshold: {WINNER_THRESHOLD}%</span>
          <HeaderHelp />
        </div>
        <div className="h-5" />
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
            "absolute top-1/2 h-[15px] -translate-y-1/2",
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
        <div className="absolute inset-0 bg-muted" />
        {/* fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0",
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
  filters,
  dataMode,
}: {
  campaign: Campaign;
  variant: Variant;
  index: number;
  metricName: string;
  filters: ReportFilterContext;
  dataMode: "visitors" | "sessions";
}) {
  const visitors = variantVisitors(campaign, index, filters, dataMode);
  const { uplift, confidence, conversions } = metricRowStats(
    campaign,
    metricName,
    variant,
    index,
    filters,
    dataMode
  );
  const tone = badgeTone(index);
  const isControl = index === 0;

  return (
    <div className="group grid items-stretch transition-colors hover:bg-muted/30" style={GRID}>
      <div className="flex items-center gap-2 border-b border-border py-3 pl-5 pr-4">
        <GraphBadge tone={tone}>{variant.label}</GraphBadge>
        <span className="text-sm font-medium text-foreground">{variant.name}</span>
        {isControl && (
          <span className="rounded-full bg-muted px-2 text-xs font-medium text-foreground">
            Baseline
          </span>
        )}
      </div>
      <div className="flex items-center justify-end border-b border-border pr-6 text-right text-sm tabular-nums text-foreground">
        {formatNumber(conversions)}
      </div>
      <div className="flex items-center justify-end border-b border-border pr-6 text-right text-sm tabular-nums text-foreground">
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
      <div className={cn(cell, "justify-end pr-6 text-sm tabular-nums text-foreground")}>
        {formatNumber(conversions)}
      </div>
      <div className={cn(cell, "justify-end pr-6 text-sm tabular-nums text-foreground")}>
        {formatNumber(visitors)}
      </div>
      <div className={cn(cell, "justify-center text-sm text-foreground/70")}>-</div>
      <div className={cn(cell, "pl-5 text-sm text-foreground/70")}>-</div>
      <div className={cn(cell, "justify-center")} />
    </div>
  );
}

function ResultsTable({
  campaign,
  metricName,
  filters,
  dataMode,
  showTotalRow,
}: {
  campaign: Campaign;
  metricName: string;
  filters: ReportFilterContext;
  dataMode: "visitors" | "sessions";
  showTotalRow: boolean;
}) {
  const variants = campaign.report.variants;
  const rows = variants.map((variant, index) => {
    const visitors = variantVisitors(campaign, index, filters, dataMode);
    const { conversions } = metricRowStats(
      campaign,
      metricName,
      variant,
      index,
      filters,
      dataMode
    );
    return { variant, index, visitors, conversions };
  });
  const totalConversions = rows.reduce((sum, r) => sum + r.conversions, 0);
  const totalVisitors = rows.reduce((sum, r) => sum + r.visitors, 0);

  return (
    <div className="overflow-x-auto bg-background">
      <div className="min-w-[900px]">
        <TableHeader />
        {rows.map((r) => (
          <DataRow
            key={`${metricName}-${r.variant.id}`}
            campaign={campaign}
            variant={r.variant}
            index={r.index}
            metricName={metricName}
            filters={filters}
            dataMode={dataMode}
          />
        ))}
        {showTotalRow ? (
          <TotalRow conversions={totalConversions} visitors={totalVisitors} />
        ) : null}
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

const CHART_Y_MIN = 0.6;
const CHART_Y_MAX = 1.0;
const CHART_PLOT_H = 172;
const CHART_PLOT_W = 100;
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

type ChartSeriesKey = Exclude<BadgeTone, "total">;
type ChartInterval = "Daily" | "Weekly";

function chartSeriesValues(
  metricName: string,
  seriesKey: string,
  filters: ReportFilterContext,
  interval: ChartInterval,
  pointCount: number
): number[] {
  const seed = hashMetricSeed(
    `${metricName}:date-range:${seriesKey}:${filterMetricSeedSuffix(filters)}:${interval}`
  );
  const scale = reportVisitorScale(filters);
  const base = seriesKey === "ctrl" ? 0.66 : seriesKey === "v1" ? 0.68 : 0.7;
  const endBias =
    (seriesKey === "ctrl" ? 0.06 : seriesKey === "v1" ? 0.27 : 0.11) * scale;
  const values: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = i / (pointCount - 1);
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

function DateRangeLineChart({
  metricName,
  filters,
  interval,
  visible,
}: {
  metricName: string;
  filters: ReportFilterContext;
  interval: ChartInterval;
  visible: Record<ChartSeriesKey, boolean>;
}) {
  const pointCount = interval === "Daily" ? 13 : 7;
  const series: { key: ChartSeriesKey; values: number[] }[] = (
    [
      { key: "ctrl" as const, values: chartSeriesValues(metricName, "ctrl", filters, interval, pointCount) },
      { key: "v1" as const, values: chartSeriesValues(metricName, "v1", filters, interval, pointCount) },
      { key: "v2" as const, values: chartSeriesValues(metricName, "v2", filters, interval, pointCount) },
    ] as const
  ).filter((s) => visible[s.key]);
  const markerIndex = Math.round((CHART_MARKER_X / CHART_PLOT_W) * (pointCount - 1));

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

function ExpectedImprovementChart({
  campaign,
  metricName,
  filters,
}: {
  campaign: Campaign;
  metricName: string;
  filters: ReportFilterContext;
}) {
  const variants = campaign.report.variants.slice(0, 3);
  const uplifts = variants.map((v, i) => {
    const s = metricRowStats(campaign, metricName, v, i, filters);
    return s.uplift ?? 0;
  });
  const max = Math.max(6, ...uplifts.map((u) => Math.abs(u)));

  return (
    <div className="flex h-[172px] items-end justify-around gap-4 px-8 pt-6">
      {variants.map((v, i) => {
        const uplift = uplifts[i] ?? 0;
        const h = Math.max(8, (Math.abs(uplift) / max) * 120);
        const positive = uplift >= 0;
        return (
          <div key={v.id} className="flex flex-col items-center gap-2">
            <span className="text-xs tabular-nums text-muted-foreground">
              {uplift === 0 ? "—" : `${positive ? "+" : ""}${uplift.toFixed(1)}%`}
            </span>
            <div
              className={cn(
                "w-10",
                positive ? "bg-success-fg" : "bg-danger-fg"
              )}
              style={{ height: h }}
            />
            <GraphBadge tone={badgeTone(i)}>{v.label}</GraphBadge>
          </div>
        );
      })}
    </div>
  );
}

function IntervalDropdown({
  value,
  onChange,
}: {
  value: ChartInterval;
  onChange: (v: ChartInterval) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-1 text-sm font-medium text-foreground"
        >
          {value}
          <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-36 p-1">
        {(["Daily", "Weekly"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "flex w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
              value === opt && "bg-accent font-medium"
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
}: {
  campaign: Campaign;
  metricName: string;
  filters: ReportFilterContext;
  defaultGraph: ResultsGraphDefault;
}) {
  const [graphTab, setGraphTab] = useState(
    defaultGraph === "expected-improvement" ? 1 : 0
  );
  const [interval, setInterval] = useState<ChartInterval>("Daily");
  const [showRanges, setShowRanges] = useState(false);
  const [visible, setVisible] = useState<Record<ChartSeriesKey, boolean>>({
    ctrl: true,
    v1: true,
    v2: true,
  });

  useEffect(() => {
    setGraphTab(defaultGraph === "expected-improvement" ? 1 : 0);
  }, [defaultGraph]);

  const xLabels =
    interval === "Daily"
      ? ["Oct 25", "Nov 25", "Dec 25", "Jan 26"]
      : ["Week 1", "Week 2", "Week 3", "Week 4"];

  return (
    <div className="flex flex-col gap-6 rounded-b-lg bg-background px-5 py-6">
      <div className="flex items-end gap-5 border-b border-border">
        {GRAPH_TABS.map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setGraphTab(i)}
            className={cn(
              "relative flex items-center gap-1.5 px-1 pb-2 text-sm transition-colors",
              graphTab === i
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

      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3">
          <span className="px-1 text-sm font-medium text-foreground">{metricName}</span>
          <IntervalDropdown value={interval} onChange={setInterval} />
        </div>
        {graphTab === 0 && (
          <label className="flex cursor-pointer items-center gap-1.5">
            <Checkbox
              checked={showRanges}
              onCheckedChange={(v) => setShowRanges(v === true)}
              className="h-4 w-4 rounded-[2px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
            />
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              Show ranges
              <HelpCircle className="h-3.5 w-3.5 opacity-60" aria-hidden />
            </span>
          </label>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {graphTab === 0 ? (
          <div className="flex gap-5">
            <div className="flex flex-col justify-between py-1.5 text-right text-xs font-medium text-foreground/70">
              {Y_AXIS.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <div className="relative flex-1">
              <div className="flex flex-col justify-between py-1.5" style={{ height: CHART_PLOT_H }}>
                {Y_AXIS.map((v) => (
                  <div key={v} className="h-px w-full bg-border" />
                ))}
              </div>
              {showRanges && (
                <div
                  className="pointer-events-none absolute inset-x-[12%] top-1.5 h-[172px] rounded-md bg-muted/30"
                  aria-hidden
                />
              )}
              <DateRangeLineChart
                metricName={metricName}
                filters={filters}
                interval={interval}
                visible={visible}
              />
              <div className="mt-1.5 flex justify-between px-12 text-xs text-foreground/70">
                {xLabels.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ExpectedImprovementChart
            campaign={campaign}
            metricName={metricName}
            filters={filters}
          />
        )}

        {graphTab === 0 && (
          <div className="flex flex-wrap items-center gap-5 pt-2">
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
        )}
      </div>
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
        "flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-sm text-foreground transition-colors hover:bg-muted",
        active && "bg-accent text-accent-foreground"
      )}
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
}

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
              : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
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

  return (
    <MetricsNavShell
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      collapsedContent={collapsedContent}
    >
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
              <span
                className={cn(
                  "rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground",
                  selectedMetric !== campaign.primaryMetric && "invisible"
                )}
                aria-hidden={selectedMetric !== campaign.primaryMetric}
              >
                Primary
              </span>
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
      <div className="grid items-start bg-muted/30" style={COMPARE_GRID}>
        <div className="flex items-center gap-1.5 border-r border-border px-5 pb-2 pt-3">
          <span className="text-xs font-semibold text-foreground/75">Metric</span>
          <FunnelIcon className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1.5 px-4 pb-2 pt-3">
          <span className="text-xs font-semibold text-foreground/75">Variations</span>
          <FunnelIcon className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-end gap-1 px-2 pb-2 pt-3">
          <span className="text-right text-xs font-semibold text-foreground/75">
            Unique conversions
          </span>
          <ExpectedConversionRateHelp />
        </div>
        <div className="flex items-center justify-end gap-1 px-2 pb-2 pt-3">
          <span className="text-right text-xs font-semibold text-foreground/75">
            Total visitors
          </span>
          <HeaderHelp />
        </div>
        <div className="flex items-center justify-center gap-1 px-2 pb-2 pt-3">
          <span className="text-center text-xs font-semibold text-foreground/75">
            Expected improvement(v)
          </span>
          <HeaderHelp />
        </div>
        <div className="flex flex-col gap-0.5 px-5 pb-2 pt-3">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-foreground/75">
              Probability of Better or Equivalent (v)
            </span>
            <HeaderHelp />
          </div>
          <div className="flex items-center gap-1 text-[10px] leading-none text-muted-foreground">
            MDE: ± 20%&nbsp;&nbsp;ROPE: 1.5%&nbsp;&nbsp;Power: 80%&nbsp;&nbsp;FPR: 5%
          </div>
        </div>
      </div>

      <div
        className="grid items-center border-b border-border bg-muted/40 text-[10px] leading-none text-muted-foreground"
        style={COMPARE_GRID}
      >
        <div className="h-5 border-r border-border" />
        <div className="h-5" />
        <div className="h-5" />
        <div className="h-5" />
        <div className="flex h-5 items-center justify-between px-5">
          <span>-6%</span>
          <span>0%</span>
          <span>6%</span>
        </div>
        <div className="flex h-5 items-center justify-end gap-1 pr-5">
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
  groupBy: GroupBy,
  filters: ReportFilterContext
): CompareGroup[] {
  const variants = campaign.report.variants;

  if (groupBy === "variation") {
    return variants.map((variant, vi) => ({
      key: variant.id,
      label: <VariantLabel variant={variant} index={vi} />,
      rows: metrics.map((m) => {
        const s = metricRowStats(campaign, m.name, variant, vi, filters);
        return {
          key: m.name,
          rowLabel: <MetricLabel name={m.name} isPrimary={m.isPrimary} />,
          conversions: s.conversions,
          visitors: variantVisitors(campaign, vi, filters),
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
      const s = metricRowStats(campaign, m.name, variant, vi, filters);
      return {
        key: variant.id,
        rowLabel: <VariantLabel variant={variant} index={vi} />,
        conversions: s.conversions,
        visitors: variantVisitors(campaign, vi, filters),
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
  filters,
}: {
  campaign: Campaign;
  metrics: CompareMetric[];
  groupBy: GroupBy;
  filters: ReportFilterContext;
}) {
  const groups = buildGroups(campaign, metrics, groupBy, filters);

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
  filters,
  onClear,
}: {
  campaign: Campaign;
  metrics: CompareMetric[];
  groupBy: GroupBy;
  filters: ReportFilterContext;
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
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function ResultsTab({ campaign }: { campaign: Campaign }) {
  const [selectedMetric, setSelectedMetric] = useState(campaign.primaryMetric);
  const [compareMode, setCompareMode] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("variation");
  const [innerTab, setInnerTab] = useState<InnerDataTab>(INNER_TABS[0]);
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [viewSettings, setViewSettings] = useState(DEFAULT_REPORT_VIEW_SETTINGS);
  const [statConfigOpen, setStatConfigOpen] = useState(false);

  const viewState = useReportActiveViewState(campaign.id);
  const filters: ReportFilterContext = useMemo(
    () => ({
      segments: viewState.segments,
      dimensions: viewState.dimensions,
      dateRange: viewState.dateRange,
    }),
    [viewState.segments, viewState.dimensions, viewState.dateRange]
  );
  const dataMode: "visitors" | "sessions" =
    innerTab === "Raw data (sessions)" ? "sessions" : "visitors";

  const others = campaign.report.otherMetrics;
  const splitAt = Math.max(1, others.length - Math.max(1, Math.floor(others.length / 3)));
  const compareableMetrics = others.slice(splitAt);
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
    ...compareableMetrics.map((m) => ({ name: m.name, isPrimary: false })),
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
    <div className="flex min-h-full items-start">
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
        <div className="mx-auto max-w-[1120px] space-y-4 px-12 py-8">
          <ViewSettingsDialog
            open={viewSettingsOpen}
            onOpenChange={setViewSettingsOpen}
            settings={viewSettings}
            onSave={setViewSettings}
          />
          <StatisticalConfigurationDialog
            open={statConfigOpen}
            onOpenChange={setStatConfigOpen}
          />
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
                onClear={() => setCompareMode(false)}
              />
            </>
          ) : (
            <>
              <ResultsFilterPanel campaignId={campaign.id} />
              <div>
                <ConclusionBanner variantName={best.name} />
                <div className="overflow-hidden rounded-b-lg border border-border border-t-0 bg-background">
                  <MetricHeader
                    metric={selectedMetric}
                    isPrimary={selectedMetric === campaign.primaryMetric}
                    onOpenChartView={() => setStatConfigOpen(true)}
                    onOpenSettings={() => setViewSettingsOpen(true)}
                  />
                  <InnerTabs active={innerTab} onChange={setInnerTab} />
                  {innerTab !== "Statistics" ? viewSettings.layout === "graphs-first" ? (
                    <>
                      <GraphPanel
                        campaign={campaign}
                        metricName={selectedMetric}
                        filters={filters}
                        defaultGraph={viewSettings.defaultGraph}
                      />
                      <ResultsTable
                        campaign={campaign}
                        metricName={selectedMetric}
                        filters={filters}
                        dataMode={dataMode}
                        showTotalRow={viewSettings.showTotalRow}
                      />
                    </>
                  ) : (
                    <>
                      <ResultsTable
                        campaign={campaign}
                        metricName={selectedMetric}
                        filters={filters}
                        dataMode={dataMode}
                        showTotalRow={viewSettings.showTotalRow}
                      />
                      <GraphPanel
                        campaign={campaign}
                        metricName={selectedMetric}
                        filters={filters}
                        defaultGraph={viewSettings.defaultGraph}
                      />
                    </>
                  ) : (
                    <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      Summary statistics for {selectedMetric} with current filters.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
