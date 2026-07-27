import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Eye,
  Filter,
  Info,
  PlusCircle,
  Search,
  Shield,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { FUNNELS, funnelById, type Funnel } from "../../data/funnels";

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

// The read-only definition rows shown in the metric detail pane.
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

// The funnel detail pane: "Visitors who performed" + numbered steps.
function FunnelDetail({ funnel }: { funnel: Funnel }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {funnel.code}
        </span>
        <h3 className="text-lg font-semibold text-foreground">{funnel.name}</h3>
      </div>
      <p className="italic text-muted-foreground">Visitors who performed</p>
      <div className="mt-4 flex flex-col gap-6">
        {funnel.steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">{step.name}</div>
              <div className="mt-1 w-fit border-b border-dashed border-muted-foreground/50 text-sm text-muted-foreground">
                {step.event}
              </div>
              <div className="mt-1 text-sm">
                <span className="text-muted-foreground">where </span>
                <span className="font-medium text-foreground">{step.whereLabel}</span>
                {step.inline && (
                  <span className="text-foreground">
                    {" "}
                    {step.inline.operator}{" "}
                    <span className="font-medium">{step.inline.value}</span>
                  </span>
                )}
              </div>

              {step.matches && (
                <div className="mt-2 rounded-md border border-border p-3">
                  <div className="text-sm font-semibold text-foreground">
                    Included pages
                  </div>
                  {step.matches.map((m, j) => (
                    <div key={j} className="mt-1 flex items-center gap-1.5 text-sm">
                      <span className="text-muted-foreground">{m.operator} </span>
                      <span className="break-all font-medium text-foreground">
                        {m.value}
                      </span>
                      <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}

              {step.and && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">and where </span>
                  <span className="font-medium text-foreground">{step.and.label}</span>
                  <span className="text-muted-foreground"> {step.and.operator} </span>
                  <span className="font-medium text-foreground">{step.and.value}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MetricPicker({
  mode,
  campaignId,
  trigger,
  align = "start",
}: {
  mode: Mode;
  campaignId: string;
  trigger: ReactNode;
  align?: "start" | "end";
}) {
  const config = useConfigStore((s) => s.configs[campaignId]);
  const setSuccessMetric = useConfigStore((s) => s.setSuccessMetric);
  const setObservationMetrics = useConfigStore((s) => s.setObservationMetrics);
  const setProtectionMetrics = useConfigStore((s) => s.setProtectionMetrics);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Collapse the open (empty) search back to an icon when the user clicks
  // outside it. A document listener rather than the input's onBlur, which Radix
  // Popover's focus trap swallows.
  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: PointerEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        !query.trim()
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [searchOpen, query]);
  const [activeCat, setActiveCat] = useState<MetricCategory | "All" | "funnels">(
    "All"
  );
  const [draft, setDraft] = useState<string[]>([]);
  // The item whose definition shows in the right pane — a metric or a funnel,
  // since funnels are now just another category in the same list.
  const [hovered, setHovered] = useState<
    { kind: "metric" | "funnel"; id: string } | null
  >(null);
  const metricsListRef = useRef<HTMLDivElement>(null);
  const catRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const funnelsRef = useRef<HTMLDivElement>(null);

  const meta = MODE_META[mode];
  const multi = mode !== "success";

  // Seed the draft from the current config each time the picker opens.
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
    setSearchOpen(false);
    setActiveCat("All");
    setHovered(null);
  }, [open, mode, config]);

  const counts = useMemo(() => {
    const map = new Map<MetricCategory, number>();
    for (const c of METRIC_CATEGORIES) map.set(c, 0);
    for (const m of METRICS) map.set(m.category, (map.get(m.category) ?? 0) + 1);
    return map;
  }, []);

  // Metrics grouped by category (each an anchored section); search filters
  // within groups and drops empty ones.
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return METRIC_CATEGORIES.map((cat) => ({
      cat,
      metrics: METRICS.filter(
        (m) => m.category === cat && (!q || m.name.toLowerCase().includes(q))
      ),
    })).filter((g) => g.metrics.length > 0);
  }, [query]);
  const firstMetricId = grouped[0]?.metrics[0]?.id ?? null;

  // Funnels are just another category, filtered by the same search query.
  const funnels = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FUNNELS.filter((f) => !q || f.name.toLowerCase().includes(q));
  }, [query]);

  // The right-pane detail follows the hovered item; with nothing hovered it
  // falls back to the selected/first metric.
  const activeFunnel =
    hovered?.kind === "funnel" ? funnelById(hovered.id) : undefined;
  const activeMetricId =
    hovered?.kind === "metric"
      ? hovered.id
      : (mode === "success" ? draft[0] : undefined) ?? firstMetricId ?? null;
  const activeMetric =
    !activeFunnel && activeMetricId ? metricById(activeMetricId) : undefined;

  // Scroll-spy: highlight the category pill for the group under a reading line.
  useEffect(() => {
    const el = metricsListRef.current;
    if (!el) return;
    const compute = () => {
      const line = el.getBoundingClientRect().top + 48;
      let next: MetricCategory | "All" | "funnels" = "All";
      for (const g of grouped) {
        const ref = catRefs.current[g.cat];
        if (ref && ref.getBoundingClientRect().top <= line) next = g.cat;
      }
      if (
        funnels.length > 0 &&
        funnelsRef.current &&
        funnelsRef.current.getBoundingClientRect().top <= line
      )
        next = "funnels";
      if (el.scrollTop < 4) next = "All";
      setActiveCat(next);
    };
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [open, grouped, funnels]);

  const scrollToCat = (cat: MetricCategory | "All" | "funnels") => {
    setActiveCat(cat);
    const el = metricsListRef.current;
    if (!el) return;
    if (cat === "All") {
      el.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const ref = cat === "funnels" ? funnelsRef.current : catRefs.current[cat];
    if (ref) el.scrollTo({ top: ref.offsetTop - el.offsetTop, behavior: "smooth" });
  };

  if (!config) return null;

  const pickSuccess = (id: string) => {
    setSuccessMetric(campaignId, id);
    setOpen(false);
  };
  const toggleMulti = (id: string) =>
    setDraft((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  const confirmMulti = () => {
    if (mode === "observation") setObservationMetrics(campaignId, draft);
    else setProtectionMetrics(campaignId, draft);
    setOpen(false);
  };

  const HeaderIcon = meta.icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        collisionPadding={16}
        className="flex max-h-[min(80vh,640px)] w-[680px] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <div className="shrink-0 px-6 pb-0 pt-5">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <HeaderIcon className="h-4 w-4" aria-hidden />
            {meta.title}
            {meta.suffix && (
              <span className="text-sm font-normal text-muted-foreground">
                {meta.suffix}
              </span>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {/* Search collapses to an icon that sits before the "All" pill.
              Opening it swaps the category pills for the input; it collapses
              again on Clear or on blur while empty. Funnels are just another
              category pill here, not a separate mode. */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 px-6 py-4">
            {searchOpen ? (
              <div ref={searchRef} className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search metrics and funnels"
                  className="pl-9 pr-9"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
                      setSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Search metrics"
                  className="h-9 w-9 shrink-0 rounded-full"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full",
                    activeCat === "All" && "border-accent bg-accent text-foreground"
                  )}
                  onClick={() => scrollToCat("All")}
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
                        activeCat === c && "border-accent bg-accent text-foreground"
                      )}
                      onClick={() => scrollToCat(c)}
                    >
                      <Icon />
                      {c} ({counts.get(c) ?? 0})
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full",
                    activeCat === "funnels" && "border-accent bg-accent text-foreground"
                  )}
                  onClick={() => scrollToCat("funnels")}
                >
                  <Filter />
                  Funnels ({FUNNELS.length})
                </Button>
              </>
            )}
          </div>

          <div className="flex h-[360px] min-h-0 border-t border-border">
            <div
              ref={metricsListRef}
              className="w-[320px] shrink-0 overflow-y-auto border-r border-border p-2"
            >
              {grouped.length === 0 && funnels.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No metrics found.</p>
                </div>
              ) : (
                <>
                  {grouped.map((g) => {
                    const Icon = categoryIcon(g.cat);
                    return (
                      <div
                        key={g.cat}
                        ref={(node) => {
                          catRefs.current[g.cat] = node;
                        }}
                      >
                        <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {g.cat}
                        </div>
                        {g.metrics.map((m) => {
                          const selected = draft.includes(m.id);
                          return (
                            <div
                              key={m.id}
                              role="button"
                              tabIndex={0}
                              onClick={() =>
                                mode === "success" ? pickSuccess(m.id) : toggleMulti(m.id)
                              }
                              onMouseEnter={() =>
                                setHovered({ kind: "metric", id: m.id })
                              }
                              onFocus={() => setHovered({ kind: "metric", id: m.id })}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted",
                                mode === "success" && selected && "bg-muted"
                              )}
                            >
                              {multi && (
                                <Checkbox
                                  checked={selected}
                                  onCheckedChange={() => toggleMulti(m.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="text-sm text-foreground">{m.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {funnels.length > 0 && (
                    <div ref={funnelsRef}>
                      <div className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Funnels
                      </div>
                      {funnels.map((f) => (
                        <div
                          key={f.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setHovered({ kind: "funnel", id: f.id })}
                          onMouseEnter={() => setHovered({ kind: "funnel", id: f.id })}
                          onFocus={() => setHovered({ kind: "funnel", id: f.id })}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted",
                            hovered?.kind === "funnel" &&
                              hovered.id === f.id &&
                              "bg-muted"
                          )}
                        >
                          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm text-foreground">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {activeFunnel ? (
                <FunnelDetail funnel={activeFunnel} />
              ) : activeMetric ? (
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
        </div>

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
          {multi && (
            <Button
              type="button"
              size="sm"
              disabled={draft.length === 0}
              onClick={confirmMulti}
            >
              Add {draft.length} metric{draft.length === 1 ? "" : "s"}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
