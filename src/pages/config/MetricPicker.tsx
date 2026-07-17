import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  PlusCircle,
  Search,
  Shield,
  Star,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import {
  METRICS,
  METRIC_CATEGORIES,
  categoryIcon,
  metricById,
  type Metric,
  type MetricCategory,
} from "../../data/metrics";

type Mode = "success" | "observation" | "protection";

const MODE_META: Record<
  Mode,
  { icon: LucideIcon; title: string; suffix?: string; description: string }
> = {
  success: {
    icon: Star,
    title: "Success Metric",
    suffix: "(Mandatory)",
    description: "Decisions will be based on this metric.",
  },
  observation: {
    icon: Eye,
    title: "Observation Metric",
    suffix: "(Optional)",
    description: "Track additional metrics for deeper campaign insights.",
  },
  protection: {
    icon: Shield,
    title: "Protection Metric",
    description:
      "These metrics help identify and mitigate risk. Protection metrics are also tracked as observational metrics.",
  },
};

// The read-only definition rows shown in the right pane.
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[150px_auto_1fr] items-start gap-2 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function MetricDetail({ metric }: { metric: Metric }) {
  const Icon = categoryIcon(metric.category);
  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
        <h3 className="text-lg font-semibold text-foreground">{metric.name}</h3>
      </div>
      <div className="mt-4">
        <DetailRow label="Metric tracks" value={metric.tracks} />
        <DetailRow label={metric.whereLabel} value={metric.whereOperator} />
        {metric.conditions.map((c, i) => (
          <div
            key={i}
            className="grid grid-cols-[150px_auto_1fr] items-start gap-2 py-1.5"
          >
            <span />
            <span />
            <div className="pl-4 text-sm">
              <span className="text-muted-foreground">{c.label} </span>
              <span className="font-medium text-foreground">{c.value}</span>
            </div>
          </div>
        ))}
        <DetailRow label="Metric Calculates" value={metric.calculates} />
        <DetailRow label="Conversion window" value={metric.conversionWindow} />
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <div className="grid grid-cols-[150px_auto_1fr] items-start gap-2">
          <span className="text-sm text-muted-foreground">Created by</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-sm font-medium text-foreground">
            {metric.createdBy}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MetricPicker({
  open,
  onOpenChange,
  mode,
  campaignId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  campaignId: string;
}) {
  const config = useConfigStore((s) => s.configs[campaignId]);
  const setSuccessMetric = useConfigStore((s) => s.setSuccessMetric);
  const setObservationMetrics = useConfigStore((s) => s.setObservationMetrics);
  const setProtectionMetrics = useConfigStore((s) => s.setProtectionMetrics);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MetricCategory | "All">(
    "All"
  );
  const [draft, setDraft] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const meta = MODE_META[mode];
  const multi = mode !== "success";

  // Seed the draft from the current config each time the dialog opens.
  useEffect(() => {
    if (!open || !config) return;
    if (mode === "success") {
      setDraft(config.successMetric ? [config.successMetric] : []);
    } else if (mode === "observation") {
      setDraft(config.observationMetrics);
    } else {
      setDraft(config.protectionMetrics);
    }
    setQuery("");
    setActiveCategory("All");
    setHoveredId(null);
  }, [open, mode, config]);

  const counts = useMemo(() => {
    const map = new Map<MetricCategory, number>();
    for (const c of METRIC_CATEGORIES) map.set(c, 0);
    for (const m of METRICS) map.set(m.category, (map.get(m.category) ?? 0) + 1);
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return METRICS.filter((m) => {
      if (activeCategory !== "All" && m.category !== activeCategory) return false;
      if (q && !m.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, activeCategory]);

  // The metric shown in the right pane: the hovered row, else the sole
  // selected (success), else the first filtered row.
  const activeId =
    hoveredId ??
    (mode === "success" ? draft[0] : undefined) ??
    filtered[0]?.id ??
    null;
  const activeMetric = activeId ? metricById(activeId) : undefined;

  if (!config) return null;

  const toggle = (id: string) => {
    if (mode === "success") {
      setDraft([id]);
    } else {
      setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
    }
  };

  const confirm = () => {
    if (mode === "success") {
      setSuccessMetric(campaignId, draft[0] ?? null);
    } else if (mode === "observation") {
      setObservationMetrics(campaignId, draft);
    } else {
      setProtectionMetrics(campaignId, draft);
    }
    onOpenChange(false);
  };

  const HeaderIcon = meta.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-[900px] flex-col gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="shrink-0 px-6 pb-0 pt-6">
          <DialogTitle asChild>
            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
              <HeaderIcon className="h-4 w-4" aria-hidden />
              {meta.title}
              {meta.suffix && (
                <span className="text-sm font-normal text-muted-foreground">
                  {meta.suffix}
                </span>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="mt-1">{meta.description}</DialogDescription>
        </div>

        <Tabs defaultValue="metrics" className="flex min-h-0 flex-1 flex-col">
          {/* Tabs */}
          <div className="shrink-0 px-6 pt-4">
            <TabsList>
              <TabsTrigger value="metrics">Metrics ({METRICS.length})</TabsTrigger>
              <TabsTrigger value="funnels">Funnels (0)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="metrics"
            className="mt-0 flex min-h-0 flex-1 flex-col"
          >
            {/* Search */}
            <div className="shrink-0 px-6 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search metrics and funnels"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category chips */}
            <div className="flex shrink-0 flex-wrap gap-2 px-6 pb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full",
                  activeCategory === "All" &&
                    "border-accent bg-accent text-foreground"
                )}
                onClick={() => setActiveCategory("All")}
              >
                All
              </Button>
              {METRIC_CATEGORIES.map((c) => {
                const Icon = categoryIcon(c);
                return (
                  <Button
                    key={c}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full",
                      activeCategory === c &&
                        "border-accent bg-accent text-foreground"
                    )}
                    onClick={() => setActiveCategory(c)}
                  >
                    <Icon />
                    {c} ({counts.get(c) ?? 0})
                  </Button>
                );
              })}
            </div>

            {/* Body */}
            <div className="grid min-h-0 flex-1 grid-cols-[1fr_1fr] border-t border-border">
              {/* Left: list */}
              <div className="overflow-y-auto border-r border-border p-2">
                {filtered.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      No metrics found.
                    </p>
                  </div>
                ) : (
                  filtered.map((m) => {
                    const Icon = categoryIcon(m.category);
                    const selected = draft.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggle(m.id)}
                        onMouseEnter={() => setHoveredId(m.id)}
                        onFocus={() => setHoveredId(m.id)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted",
                          mode === "success" && selected && "bg-muted"
                        )}
                      >
                        {multi && (
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => toggle(m.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm text-foreground">{m.name}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right: detail */}
              <div className="overflow-y-auto p-6">
                {activeMetric ? (
                  <MetricDetail metric={activeMetric} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Select a metric to see its details.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="funnels"
            className="mt-0 flex min-h-0 flex-1 items-center justify-center border-t border-border"
          >
            <p className="text-sm text-muted-foreground">No funnels yet.</p>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-3">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="px-0"
            // TODO: create a new metric
          >
            <PlusCircle />
            Create a Metric
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={multi && draft.length === 0}
              onClick={confirm}
            >
              {mode === "success"
                ? "Select"
                : `Add ${draft.length} metric${draft.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
