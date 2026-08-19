// Toolbar panels for the heatmap viewer — the popovers, dialogs, and side panel
// behind each control in the bottom bar. Presentational over dummy data.

import { useState } from "react";
import type { DateRange as DayPickerRange } from "react-day-picker";
import {
  MessageSquare,
  CircleHelp,
  Copy,
  Download,
  Funnel,
  Mail,
  MoreVertical,
  Plus,
  Flag,
  Search,
  Sparkles,
  Wand2,
  X,
  ChevronUp,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CAMPAIGN_TYPES,
  FRICTION_TYPE_IDS,
  FRICTION_TYPE_LABELS,
  METRIC_PRESETS,
  WANDZ_REPORT,
  type FrictionTypeId,
} from "@/data/heatmapViewer";
import { useHeatmapsStore } from "@/store/heatmaps";

/** Cancel / Apply footer every panel in this toolbar ends with. */
export function PanelFooter({
  onCancel,
  onApply,
  applyLabel = "Apply",
  onReset,
  resetDisabled = true,
  applyDisabled = false,
}: {
  onCancel: () => void;
  onApply: () => void;
  applyLabel?: string;
  onReset?: () => void;
  resetDisabled?: boolean;
  applyDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 px-4 py-3">
      {onReset ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={resetDisabled}
          onClick={onReset}
        >
          Reset
        </Button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={applyDisabled}
          onClick={onApply}
        >
          {applyLabel}
        </Button>
      </div>
    </div>
  );
}

/** Shared "cap the payload" row — every scope panel offers the same trade-off. */
function LatestOnlyRow({
  noun,
  mapName,
  checked,
  onChange,
}: {
  noun: string;
  mapName: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-1 px-4 py-4">
      <div className="flex items-center gap-3">
        <Switch
          id={`latest-${noun}`}
          checked={checked}
          onCheckedChange={onChange}
        />
        <Label htmlFor={`latest-${noun}`} className="text-sm font-normal">
          Only show latest 5000 {noun}
        </Label>
      </div>
      <p className="pl-12 text-xs text-muted-foreground">
        Helps the {mapName} load quicker
      </p>
    </div>
  );
}

/** Click scope — All clicks vs. the first N clicks of a session. */
export function ClickScopePanel({ onClose }: { onClose: () => void }) {
  // Panels are drafts: they open seeded from committed state and only write
  // back on Apply, so Cancel is a genuine discard.
  const committed = useHeatmapsStore();
  const [mode, setMode] = useState<"all" | "first">(committed.clickScope);
  const [firstN, setFirstN] = useState(String(committed.firstNClicks));
  const [latestOnly, setLatestOnly] = useState(committed.latestOnly);

  const apply = () => {
    committed.applyClickScope(mode, Number(firstN) || 1, latestOnly);
    onClose();
  };

  return (
    <div className="w-[380px]">
      <RadioGroup
        value={mode}
        onValueChange={(v) => setMode(v as "all" | "first")}
        className="gap-3 p-4"
      >
        <div className="flex items-center gap-3">
          <RadioGroupItem value="all" id="clicks-all" />
          <Label htmlFor="clicks-all" className="text-sm font-normal">
            All clicks
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="first" id="clicks-first" />
          <Label
            htmlFor="clicks-first"
            className="flex items-center gap-2 text-sm font-normal"
          >
            First
            <Input
              value={firstN}
              onChange={(e) => setFirstN(e.target.value)}
              onFocus={() => setMode("first")}
              inputMode="numeric"
              aria-label="Number of clicks"
              className="h-7 w-14 text-center"
            />
            clicks
            <CircleHelp className="size-3.5 text-muted-foreground" aria-hidden />
          </Label>
        </div>
      </RadioGroup>
      <Separator />
      <LatestOnlyRow
        noun="clicks"
        mapName="Heatmap"
        checked={latestOnly}
        onChange={setLatestOnly}
      />
      <PanelFooter onCancel={onClose} onApply={apply} />
    </div>
  );
}

export function HoverScopePanel({ onClose }: { onClose: () => void }) {
  const applyHoverScope = useHeatmapsStore((s) => s.applyHoverScope);
  const hoverLatestOnly = useHeatmapsStore((s) => s.hoverLatestOnly);
  const [latestOnly, setLatestOnly] = useState(hoverLatestOnly);

  return (
    <div className="w-[380px]">
      <LatestOnlyRow
        noun="hovers"
        mapName="hovermap"
        checked={latestOnly}
        onChange={setLatestOnly}
      />
      <PanelFooter
        onCancel={onClose}
        onApply={() => {
          applyHoverScope(latestOnly);
          onClose();
        }}
      />
    </div>
  );
}

export function FrictionScopePanel({ onClose }: { onClose: () => void }) {
  const applyFrictionTypes = useHeatmapsStore((s) => s.applyFrictionTypes);
  const committedTypes = useHeatmapsStore((s) => s.frictionTypes);
  const committedLatest = useHeatmapsStore((s) => s.latestOnly);
  const [selected, setSelected] = useState<FrictionTypeId[]>(committedTypes);
  const [latestOnly, setLatestOnly] = useState(committedLatest);

  const toggle = (type: FrictionTypeId, on: boolean) =>
    setSelected((prev) =>
      on ? [...prev, type] : prev.filter((t) => t !== type)
    );

  return (
    <div className="w-[380px]">
      <div className="space-y-3 p-4">
        <p className="text-sm text-muted-foreground">Friction Type</p>
        {FRICTION_TYPE_IDS.map((type) => (
          <div key={type} className="flex items-center gap-3">
            <Checkbox
              id={type}
              checked={selected.includes(type)}
              onCheckedChange={(v) => toggle(type, v === true)}
            />
            <Label htmlFor={type} className="text-sm font-normal">
              {FRICTION_TYPE_LABELS[type]}
            </Label>
          </div>
        ))}
      </div>
      <Separator />
      <LatestOnlyRow
        noun="clicks"
        mapName="Frictionmap"
        checked={latestOnly}
        onChange={setLatestOnly}
      />
      <PanelFooter
        onCancel={onClose}
        onApply={() => {
          applyFrictionTypes(selected, latestOnly);
          onClose();
        }}
        applyDisabled={selected.length === 0}
      />
    </div>
  );
}

const DATE_PRESETS = [
  "Last 30 days",
  "Last 15 days",
  "Last 7 days",
  "Yesterday",
  "Today",
];

/** Date range + visitor segment, the two filters the viewer supports. */
export function FiltersPanel({ onClose }: { onClose: () => void }) {
  const applyDateFilter = useHeatmapsStore((s) => s.applyDateFilter);
  const committedDate = useHeatmapsStore((s) => s.dateLabel);
  const committedSegment = useHeatmapsStore((s) => s.segment);
  const today = new Date();
  const [preset, setPreset] = useState(committedDate);
  const [segment, setSegment] = useState(committedSegment);
  const [range, setRange] = useState<DayPickerRange | undefined>({
    from: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate() + 2),
    to: today,
  });
  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth() - 1, 1)
  );

  const label =
    range?.from && range?.to
      ? `${range.from.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} - ${range.to.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`
      : "Select a range";

  return (
    <div className="w-[1000px] max-w-[calc(100vw-2rem)]">
      <div className="flex items-stretch border-b border-border">
        <div className="flex shrink-0 items-center border-r border-border px-5">
          <Funnel className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-2 border-r border-border px-4 py-3">
          <span className="min-w-0">
            <span className="block truncate text-sm text-foreground">
              {label}
            </span>
            <span className="block text-xs text-muted-foreground">
              Date Filter
            </span>
          </span>
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </div>
        <Select value={segment} onValueChange={setSegment}>
          <SelectTrigger className="h-auto min-w-0 flex-1 rounded-none border-0 px-4 py-3 shadow-none focus:ring-0">
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm text-foreground">
                {segment}
              </span>
              <span className="block text-xs text-muted-foreground">
                Visitor Segments
              </span>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Visitors">All Visitors</SelectItem>
            <SelectItem value="New Visitors">New Visitors</SelectItem>
            <SelectItem value="Returning Visitors">Returning Visitors</SelectItem>
            <SelectItem value="Mobile Visitors">Mobile Visitors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-h-[320px]">
        <ul className="w-[220px] shrink-0 border-r border-border py-3">
          {DATE_PRESETS.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => setPreset(item)}
                className={cn(
                  "w-full px-5 py-2.5 text-left text-sm text-foreground hover:bg-muted",
                  preset === item && "bg-muted font-medium"
                )}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-1 items-start justify-center p-4">
          <Calendar
            mode="range"
            numberOfMonths={2}
            month={month}
            onMonthChange={setMonth}
            selected={range}
            onSelect={setRange}
          />
        </div>
      </div>

      <PanelFooter
        onCancel={onClose}
        onApply={() => {
          applyDateFilter(preset, segment);
          onClose();
        }}
        applyLabel="Filter"
        onReset={() => setRange(undefined)}
        resetDisabled={!range?.from}
      />
    </div>
  );
}

/** Add Pages — collect several URLs into one collective heatmap. */
export function PagesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const applyPageRule = useHeatmapsStore((s) => s.applyPageRule);
  const pageRule = useHeatmapsStore((s) => s.pageRule);
  const [matcher, setMatcher] = useState(pageRule?.matcher ?? "matches");
  const [url, setUrl] = useState(pageRule?.url ?? "https://vwo.com/engage/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] gap-0 p-0">
        <DialogHeader className="space-y-1.5 px-6 pt-6 text-left">
          <DialogTitle>Add Pages</DialogTitle>
          <DialogDescription>
            Add multiple pages to see a collective heatmap for a bunch of similar
            pages.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="configure" className="px-6 pt-4">
          <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="configure"
              className="rounded-none border-b-2 border-transparent px-0 pb-2.5 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Configure
            </TabsTrigger>
            <TabsTrigger
              value="copilot"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-0 pb-2.5 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Sparkles className="size-4" aria-hidden />
              Copilot
              <CircleHelp className="size-3.5 text-muted-foreground" aria-hidden />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="px-6 py-5">
          <div className="rounded-lg border border-border p-5">
            <p className="text-sm font-medium text-foreground">
              Include pages where
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Select value={matcher} onValueChange={setMatcher}>
                <SelectTrigger className="h-10 w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matches">URL matches</SelectItem>
                  <SelectItem value="contains">URL contains</SelectItem>
                  <SelectItem value="starts">URL starts with</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-10 flex-1"
                aria-label="Page URL"
              />
              <Button variant="ghost" size="icon" aria-label="More options">
                <MoreVertical className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-6">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Plus className="size-4" aria-hidden />
                Include pages
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Plus className="size-4" aria-hidden />
                Exclude pages
              </Button>
            </div>
          </div>
        </div>

        <PanelFooter
          onCancel={() => onOpenChange(false)}
          onApply={() => {
            applyPageRule(matcher, url);
            onOpenChange(false);
          }}
          onReset={() => setUrl("")}
          resetDisabled={!url}
          applyDisabled={!url.trim()}
        />
      </DialogContent>
    </Dialog>
  );
}

/** View Campaign Heatmaps — scope the map to a campaign + variation. */
export function CampaignDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const applyCampaign = useHeatmapsStore((s) => s.applyCampaign);
  const committedType = useHeatmapsStore((s) => s.campaignTypeId);
  const [type, setType] = useState(committedType ?? "");
  const [campaign, setCampaign] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] gap-0 p-0">
        <DialogHeader className="space-y-1.5 px-6 pt-6 text-left">
          <DialogTitle>View Campaign Heatmaps</DialogTitle>
          <DialogDescription>
            Filter heatmaps by selecting the campaign and variation you want to
            analyze
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-6">
          <div className="grid grid-cols-[140px_1fr] items-center gap-4">
            <Label htmlFor="campaign-type" className="text-sm font-normal">
              Campaign type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="campaign-type" className="h-10">
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_TYPES.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <span className="inline-flex items-center gap-2">
                      {option.id === "web" ? (
                        <Wand2 className="size-4" aria-hidden />
                      ) : (
                        <Flag className="size-4" aria-hidden />
                      )}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[140px_1fr] items-center gap-4">
            <Label htmlFor="campaign" className="text-sm font-normal">
              Campaign
            </Label>
            {/* No campaigns exist for this dummy account — the picker still
                shows its search affordance and an honest empty state. */}
            <Select value={campaign} onValueChange={setCampaign} disabled={!type}>
              <SelectTrigger id="campaign" className="h-10">
                <SelectValue placeholder="Select campaign" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5">
                  <Input
                    placeholder="Search"
                    className="h-9"
                    aria-label="Search campaigns"
                  />
                </div>
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No results
                </p>
              </SelectContent>
            </Select>
          </div>

          <Button variant="link" className="h-auto gap-1.5 p-0" disabled>
            <Plus className="size-4" aria-hidden />
            Add another campaign
          </Button>
        </div>

        <PanelFooter
          onCancel={() => onOpenChange(false)}
          onApply={() => {
            applyCampaign(type || null);
            onOpenChange(false);
          }}
          onReset={() => {
            setType("");
            setCampaign("");
            applyCampaign(null);
          }}
          resetDisabled={!type && !campaign}
          applyDisabled={!type}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Metrics picker behind the zonalmap's "Click distribution" control. */
export function MetricsPanel({ onClose }: { onClose: () => void }) {
  const applyMetric = useHeatmapsStore((s) => s.applyMetric);
  const committedMetric = useHeatmapsStore((s) => s.metricId);
  const [selected, setSelected] = useState(committedMetric);
  const [query, setQuery] = useState("");

  const filtered = METRIC_PRESETS.filter((m) =>
    m.label.toLowerCase().includes(query.trim().toLowerCase())
  );
  const active = METRIC_PRESETS.find((m) => m.id === selected);

  return (
    <div className="w-[920px] max-w-[calc(100vw-2rem)]">
      <div className="relative px-4 py-3">
        <Search
          className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="h-10 pl-9"
        />
      </div>

      <Tabs defaultValue="presets" className="px-4">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="presets"
            className="rounded-none border-b-2 border-transparent px-0 pb-2.5 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Presets
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            className="rounded-none border-b-2 border-transparent px-0 pb-2.5 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Metrics
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex min-h-[260px]">
        <div className="w-[420px] shrink-0 border-r border-border py-3">
          <p className="px-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Presets
          </p>
          <ul>
            {filtered.map((metric) => (
              <li key={metric.id}>
                <button
                  type="button"
                  onClick={() => setSelected(metric.id)}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted",
                    metric.id === selected && "bg-muted"
                  )}
                >
                  <span className="flex-1">{metric.label}</span>
                  {metric.isNew ? (
                    <span className="rounded-md bg-success-bg px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-success-fg">
                      New
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 p-5">
          {active ? (
            <>
              <p className="text-base font-semibold text-foreground">
                {active.label}
              </p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                {active.description}
              </p>
            </>
          ) : null}
        </div>
      </div>

      <PanelFooter
        onCancel={onClose}
        onApply={() => {
          applyMetric(selected);
          onClose();
        }}
      />
    </div>
  );
}

/** Kebab menu — share link, help, download. */
export function SettingsPanel() {
  return (
    <div className="w-[320px]">
      <div className="space-y-2 p-4">
        <p className="text-sm font-medium text-foreground">Share</p>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value="https://app.wingify.com/#/analyze/heatmap"
            className="h-9 flex-1"
            aria-label="Share link"
          />
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Copy className="size-3.5" aria-hidden />
            Copy
          </Button>
        </div>
      </div>
      <Separator />
      <div className="p-1.5">
        <Button variant="ghost" className="w-full justify-start gap-2.5">
          <CircleHelp className="size-4 text-muted-foreground" aria-hidden />
          Help
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2.5">
          <Download className="size-4 text-muted-foreground" aria-hidden />
          Download
        </Button>
      </div>
    </div>
  );
}

/** Wandz analysis report, docked right. */
export function WandzReportPanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className="absolute bottom-0 right-0 top-0 flex w-[720px] max-w-[calc(100vw-2rem)] flex-col border-l border-border bg-background shadow-xl">
      <header className="flex shrink-0 items-start justify-between gap-4 px-6 pt-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Heatmap Analysis Report
          </h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Wand2 className="size-4" aria-hidden />
            Wandz
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" aria-label="Email report">
            <Mail className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Download report">
            <Download className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Give feedback">
            <MessageSquare className="size-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close report"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-5">
        <section className="rounded-lg border border-border p-4">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            Refine Report
            <CircleHelp className="size-3.5 text-muted-foreground" aria-hidden />
          </p>
          <Textarea
            className="mt-3 min-h-[88px] resize-none"
            placeholder="For example: 'Focus on checkout errors' or 'Analyze Black Friday sessions only'"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {WANDZ_REPORT.suggestions.map((chip) => (
              <Button
                key={chip}
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Sparkles className="size-3.5" aria-hidden />
                {chip}
              </Button>
            ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm">
              Discard
            </Button>
            <Button type="button" size="sm" disabled>
              Update &amp; Refine
            </Button>
          </div>
        </section>

        <h3 className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          Key Findings
        </h3>

        <section className="mt-3 rounded-lg bg-success-bg p-4">
          <p className="text-sm font-semibold text-foreground">Positives</p>
          <ul className="mt-3 space-y-3">
            {WANDZ_REPORT.positives.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-5 text-foreground">
                <Sparkles
                  className="mt-0.5 size-4 shrink-0 text-success-fg"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 rounded-lg bg-danger-bg p-4">
          <p className="text-sm font-semibold text-foreground">Negatives</p>
          <ul className="mt-3 space-y-3">
            {WANDZ_REPORT.negatives.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-5 text-foreground">
                <Sparkles
                  className="mt-0.5 size-4 shrink-0 text-danger-fg"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <h3 className="mt-6 text-sm font-medium text-foreground">
          Observations ({WANDZ_REPORT.observations.length})
        </h3>
        <ul className="mt-3 space-y-2">
          {WANDZ_REPORT.observations.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 rounded-lg border border-border p-4 text-sm font-semibold leading-5 text-foreground"
            >
              <Sparkles
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/**
 * Observation mode: coach mark, then a form anchored where the user clicked.
 * Saved notes land in the shared store and show up on the Heatmaps page.
 */
export function ObservationLayer({
  viz,
  onExit,
}: {
  viz: string;
  onExit: () => void;
}) {
  const url = useHeatmapsStore((s) => s.url);
  const addObservation = useHeatmapsStore((s) => s.addObservation);
  const [coachOpen, setCoachOpen] = useState(true);
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");

  const placePin = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    setPin({
      x: ((e.clientX - box.left) / box.width) * 100,
      y: ((e.clientY - box.top) / box.height) * 100,
    });
  };

  const dismiss = () => {
    setPin(null);
    setText("");
    onExit();
  };

  const submit = () => {
    if (pin && text.trim()) {
      addObservation({ text: text.trim(), x: pin.x, y: pin.y, viz, url });
    }
    dismiss();
  };

  return (
    <div className="absolute inset-0 z-30">
      {coachOpen ? (
        <div className="absolute left-1/2 top-[22%] w-[400px] -translate-x-1/2 rounded-xl border border-border bg-background p-5 shadow-2xl">
          <p className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <CircleHelp className="size-4 text-muted-foreground" aria-hidden />
            Observation
          </p>
          <p className="mt-3 text-sm leading-5 text-muted-foreground">
            Click anywhere on the page to create an observation
          </p>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={() => setCoachOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 cursor-crosshair" onClick={placePin} />
      )}

      {pin ? (
        <>
          <span
            className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            aria-hidden
          />
          <Dialog open onOpenChange={(open) => !open && dismiss()}>
            <DialogContent className="max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Create an Observation</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="observation" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="observation"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[140px] resize-none"
                  placeholder="Enter Observation here. E.g. There is a huge drop in the e-mail field. I think users are hesitant to fill it."
                />
                <Button variant="link" className="h-auto gap-1.5 p-0">
                  <Plus className="size-4" aria-hidden />
                  Add Label
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={dismiss}>
                  Cancel
                </Button>
                <Button type="button" disabled={!text.trim()} onClick={submit}>
                  Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}

/** Pins for observations already recorded on this page. */
export function ObservationPins() {
  const observations = useHeatmapsStore((s) => s.observations);
  if (observations.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {observations.map((o, i) => (
        <span
          key={o.id}
          className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background shadow-md ring-2 ring-background"
          style={{ left: `${o.x}%`, top: `${o.y}%` }}
          title={o.text}
        >
          {i + 1}
        </span>
      ))}
    </div>
  );
}
