// Heatmaps under Insights — layout from product screenshot, grayscale tokens + app spacing.
// Reuses StatusBadge, Button, Input, Checkbox, Label, Select, Tabs.

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Columns2,
  Flame,
  Funnel,
  CircleHelp,
  Mail,
  Plus,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import {
  HEATMAP_ALL_DATA,
  HEATMAP_VIEWS,
  type HeatmapView,
} from "@/data/heatmaps";

function FilterSegment({
  value,
  label,
  mutedValue,
}: {
  value: string;
  label: string;
  mutedValue?: boolean;
}) {
  return (
    <button
      type="button"
      className="flex min-w-0 flex-1 items-center justify-between gap-2 border-r border-border bg-background px-3 py-2 text-left last:border-r-0 hover:bg-accent/40"
    >
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-sm leading-snug",
            mutedValue ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {value}
        </span>
        <span className="block truncate text-xs leading-snug text-muted-foreground">
          {label}
        </span>
      </span>
      <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "simple" | "advanced";
  onChange: (m: "simple" | "advanced") => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      <Button
        type="button"
        variant={mode === "simple" ? "default" : "ghost"}
        size="sm"
        className="h-7"
        onClick={() => onChange("simple")}
      >
        Simple
      </Button>
      <Button
        type="button"
        variant={mode === "advanced" ? "default" : "ghost"}
        size="sm"
        className="h-7"
        onClick={() => onChange("advanced")}
      >
        Advanced
      </Button>
    </div>
  );
}

function ViewsRail({
  views,
  activeId,
  onSelect,
  query,
  onQueryChange,
}: {
  views: HeatmapView[];
  activeId: string | null;
  onSelect: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return views;
    return views.filter(
      (v) =>
        v.name.toLowerCase().includes(q) || v.url.toLowerCase().includes(q)
    );
  }, [views, query]);

  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-3 self-start">
      {/* All Data summary card */}
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">All Data</p>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-7" aria-label="Messages">
              <Mail className="size-3.5" aria-hidden />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" aria-label="Settings">
              <Settings className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Data Retention</p>
            <p className="text-sm font-medium text-foreground">
              {HEATMAP_ALL_DATA.retention}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Clicks</p>
            <p className="text-sm font-medium text-foreground">
              {HEATMAP_ALL_DATA.clicks}
            </p>
          </div>
        </div>
      </div>

      {/* Views / Observations / Timeline */}
      <div className="flex flex-col rounded-lg border border-border bg-background">
        <Tabs defaultValue="views" className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border px-3">
            <TabsList className="h-auto w-full justify-start gap-4 rounded-none bg-transparent p-0">
              {(["views", "observations", "timeline"] as const).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm capitalize shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent
            value="views"
            className="mt-0 flex min-h-0 flex-1 flex-col gap-2.5 p-3"
          >
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by name or URL"
              className="h-9"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full justify-center gap-2"
            >
              <Plus className="size-4" aria-hidden />
              Create View
            </Button>

            <ul className="min-h-0 flex-1 overflow-y-auto">
              <li className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="truncate text-sm font-medium text-foreground">
                  All data
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-status-running-fg">
                  <span
                    className="size-2.5 shrink-0 rounded-sm bg-status-running-fg"
                    aria-hidden
                  />
                  Collecting Data
                </span>
              </li>

              {filtered.map((view) => {
                const active = view.id === activeId;
                return (
                  <li key={view.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(view.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                        active
                          ? "bg-secondary text-foreground"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium leading-snug">
                          {view.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs italic leading-snug text-muted-foreground">
                          {view.url}
                        </span>
                      </span>
                      <StatusBadge status={view.status} className="shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </TabsContent>

          <TabsContent
            value="observations"
            className="mt-0 flex flex-1 items-center justify-center p-6"
          >
            <p className="text-center text-sm text-muted-foreground">
              Observations coming soon
            </p>
          </TabsContent>

          <TabsContent
            value="timeline"
            className="mt-0 flex flex-1 items-center justify-center p-6"
          >
            <p className="text-center text-sm text-muted-foreground">
              Timeline coming soon
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}

export default function HeatmapsPage() {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [url, setUrl] = useState("");
  const [pastVersion, setPastVersion] = useState(false);
  const [visualization, setVisualization] = useState("heatmap");
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [viewQuery, setViewQuery] = useState("");

  const selectView = (id: string) => {
    setActiveViewId(id);
    const view = HEATMAP_VIEWS.find((v) => v.id === id);
    if (view) setUrl(view.url);
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Page header */}
      <div className="flex flex-wrap items-center gap-3 px-12 pb-4 pt-8">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
          <Flame className="size-4 text-foreground" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Heatmaps
            </h1>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Help"
            >
              <CircleHelp className="size-4" aria-hidden />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate a visual report of click behavior on a webpage.{" "}
            <button type="button" className="underline underline-offset-2">
              Learn more
            </button>
            .
          </p>
        </div>
      </div>

      <div className="flex items-start gap-6 px-12 pb-10 pt-2">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Filter bar */}
          <div className="flex overflow-hidden rounded-md border border-border bg-background">
            <div className="flex h-14 shrink-0 items-center border-r border-border px-4">
              <Funnel className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <FilterSegment
              value="Jul 09, 2026 - Aug 07, 2026"
              label="Date Filter"
            />
            <FilterSegment value="All Visitors" label="Visitor Segments" />
            <FilterSegment
              value="Select a campaign"
              label="Campaign Filter"
              mutedValue
            />
          </div>

          {/* Generate form card */}
          <div className="rounded-lg border border-border bg-background p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">
                Generate a heatmap from this data
              </h2>
              <ModeToggle mode={mode} onChange={setMode} />
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="heatmap-url" className="text-sm font-medium">
                    Enter the URL for which you want to see heatmap
                  </Label>
                  <CircleHelp
                    className="size-3.5 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <Input
                  id="heatmap-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  className="h-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="past-version"
                  checked={pastVersion}
                  onCheckedChange={(v) => setPastVersion(v === true)}
                />
                <Label
                  htmlFor="past-version"
                  className="flex cursor-pointer items-center gap-1.5 text-sm font-normal"
                >
                  Select past version
                  <CircleHelp
                    className="size-3.5 text-muted-foreground"
                    aria-hidden
                  />
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visualization" className="text-sm font-medium">
                  Visualization
                </Label>
                <Select value={visualization} onValueChange={setVisualization}>
                  <SelectTrigger id="visualization" className="h-10 w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heatmap">
                      <span className="inline-flex items-center gap-2">
                        <Flame className="size-4" aria-hidden />
                        Heatmap
                      </span>
                    </SelectItem>
                    <SelectItem value="clickmap">Clickmap</SelectItem>
                    <SelectItem value="scrollmap">Scrollmap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button>View Heatmap</Button>
                <Button variant="outline" className="gap-2">
                  <Columns2 className="size-4" aria-hidden />
                  Compare
                </Button>
              </div>
              <Button variant="outline">View Saved Snapshots</Button>
            </div>

            {mode === "advanced" && (
              <p className="mt-4 text-sm text-muted-foreground">
                Advanced options coming soon.
              </p>
            )}
          </div>
        </div>

        <ViewsRail
          views={HEATMAP_VIEWS}
          activeId={activeViewId}
          onSelect={selectView}
          query={viewQuery}
          onQueryChange={setViewQuery}
        />
      </div>
    </div>
  );
}
