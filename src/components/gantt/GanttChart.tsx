import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  Columns2,
  Files,
  GitBranch,
  Grid2x2,
  PanelRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  hasReport,
  phasesFor,
  type Campaign,
  type CampaignStatus,
  type CampaignType,
} from "../../data/campaigns";
import { applyFilters } from "../../config/filters";
import { groupRows } from "../../config/grouping";
import { addDays, diffDays, formatDayHeader, isSameDay, startOfDay } from "../../lib/dates";
import { useTableStore } from "../../store/table";
import { useVisibleCampaigns } from "../../store/rows";
import { useActiveViewState, useViewsStore } from "../../store/views";
import { useQuickViewStore } from "../../store/quickView";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import { VitalsIcon } from "../ui/StatusBadge";
import StatusMenu from "../ui/StatusMenu";
import DecisionIcon from "../ui/DecisionIcon";
import { sortCampaigns } from "../table/CampaignTable";

const DAY_WIDTH = 44;
const FROZEN_WIDTH = 380;
const ROW_HEIGHT = 64;
const BAR_HEIGHT = 28;
const MIN_BAR = 24;
const LABEL_MIN = 48;
const PAGE_SIZES = [10, 25, 50];

const TYPE_ICONS: Record<CampaignType, LucideIcon> = {
  "A/B": Columns2,
  MVT: Grid2x2,
  "Split URL": GitBranch,
  Multipage: Files,
};

// Same colored status tokens the badge uses — the only colour on the bars.
const SEGMENT_CLASSES: Record<CampaignStatus, string> = {
  Draft: "bg-status-draft-bg text-status-draft-fg",
  "In QA": "bg-status-qa-bg text-status-qa-fg",
  "Ready to launch": "bg-status-ready-bg text-status-ready-fg",
  Running: "bg-status-running-bg text-status-running-fg",
  "In Analysis": "bg-status-analysis-bg text-status-analysis-fg",
  Paused: "bg-status-paused-bg text-status-paused-fg",
  Ended: "bg-status-ended-bg text-status-ended-fg",
};

const SCROLL_SHADOW = "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]";
// Hover-revealed row action icons — ghost icon Button sized to the original 28px hit area.
const ROW_ICON_BUTTON =
  "h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground";
const PAGER_BUTTON =
  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

type Axis = { start: Date; end: Date; totalDays: number };

function pageWindow(current: number, total: number): number[] {
  const size = 5;
  let start = Math.max(1, current - 2);
  const end = Math.min(total, start + size - 1);
  start = Math.max(1, end - size + 1);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

// The circular chip both the decision and vitals markers sit in.
function MarkerChip({ left, children }: { left: number; children: React.ReactNode }) {
  return (
    <div
      className="absolute z-20 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background"
      style={{ left, top: (ROW_HEIGHT - 24) / 2 }}
    >
      {children}
    </div>
  );
}

function GanttRow({
  c,
  axis,
  today,
  isScrolled,
  showTodayLabel,
}: {
  c: Campaign;
  axis: Axis;
  today: Date;
  isScrolled: boolean;
  showTodayLabel: boolean;
}) {
  const TypeIcon = TYPE_ICONS[c.type];
  const openQuickView = useQuickViewStore((s) => s.open);
  const phases = phasesFor(c);

  const segs = phases.map((ph, idx) => {
    const from = new Date(ph.from);
    const to = ph.to ? new Date(ph.to) : addDays(today, 1);
    const left = diffDays(axis.start, from) * DAY_WIDTH;
    const width = Math.max(diffDays(from, to) * DAY_WIDTH, MIN_BAR);
    return { ph, idx, left, width, isFirst: idx === 0, isLast: idx === phases.length - 1 };
  });

  // Boundary where the campaign LEFT Running = the `from` of the first phase after
  // the last Running phase.
  let lastRunning = -1;
  phases.forEach((p, i) => {
    if (p.status === "Running") lastRunning = i;
  });
  const decisionX =
    c.decision !== "No decision" && lastRunning >= 0 && lastRunning < phases.length - 1
      ? diffDays(axis.start, new Date(phases[lastRunning + 1].from)) * DAY_WIDTH
      : null;

  const lastSeg = segs[segs.length - 1];
  const vitalsX = c.vitals === "unhealthy" && lastSeg ? lastSeg.left + lastSeg.width : null;

  const todayX = diffDays(axis.start, today) * DAY_WIDTH + DAY_WIDTH / 2;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="group flex border-b border-border" style={{ height: ROW_HEIGHT }}>
      {/* Frozen left column */}
      <div
        className={cn(
          "sticky left-0 z-30 flex shrink-0 items-center gap-2.5 border-r border-border bg-background px-3 transition-shadow duration-150",
          isScrolled && SCROLL_SHADOW
        )}
        style={{ width: FROZEN_WIDTH }}
      >
        <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={c.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/web-experiment/c/${c.id}`}
              title={c.name}
              className="truncate text-sm font-medium text-foreground hover:underline"
            >
              {c.name}
            </Link>
            <span className="shrink-0">
              <VitalsIcon vitals={c.vitals} />
            </span>
          </div>
          <div className="truncate text-xs text-muted-foreground">{c.url}</div>
        </div>
        {/* Hover-revealed actions */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {/* TODO: wire up Summarise with Wandz */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Summarise with Wandz"
            aria-label="Summarise with Wandz"
            onClick={stop}
            className={ROW_ICON_BUTTON}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Quick view"
            aria-label="Quick view"
            onClick={(e) => {
              stop(e);
              openQuickView(c.id);
            }}
            className={ROW_ICON_BUTTON}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
          {hasReport(c.status) && (
            <Button asChild variant="ghost" size="icon" className={ROW_ICON_BUTTON}>
              <Link
                to={`/web-experiment/c/${c.id}/reports`}
                title="Reports"
                aria-label="Reports"
                onClick={stop}
              >
                <BarChart3 className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <div className="shrink-0">
          <StatusMenu campaign={c} />
        </div>
      </div>

      {/* Timeline */}
      <div
        className="relative shrink-0"
        style={{
          width: axis.totalDays * DAY_WIDTH,
          backgroundImage: `repeating-linear-gradient(to right, var(--border) 0, var(--border) 1px, transparent 1px, transparent ${DAY_WIDTH}px)`,
        }}
      >
        {/* Status-coloured segments — one continuous bar */}
        {segs.map(({ ph, idx, left, width, isFirst, isLast }) => (
          <div
            key={idx}
            title={ph.status}
            className={cn(
              "absolute flex items-center justify-center overflow-hidden px-1",
              SEGMENT_CLASSES[ph.status],
              isFirst && "rounded-l-md",
              isLast && "rounded-r-md"
            )}
            style={{ left, width, top: (ROW_HEIGHT - BAR_HEIGHT) / 2, height: BAR_HEIGHT }}
          >
            {width >= LABEL_MIN && <span className="truncate text-xs">{ph.status}</span>}
          </div>
        ))}

        {/* Decision marker where the campaign left Running */}
        {decisionX !== null && (
          <MarkerChip left={decisionX}>
            <DecisionIcon decision={c.decision} />
          </MarkerChip>
        )}

        {/* Vitals marker at the right edge of the last segment */}
        {vitalsX !== null && (
          <MarkerChip left={vitalsX}>
            <VitalsIcon vitals="unhealthy" />
          </MarkerChip>
        )}

        {/* TODAY line */}
        <div
          className="absolute bottom-0 top-0 z-10 w-0.5 bg-vitals-unhealthy"
          style={{ left: todayX }}
        >
          {showTodayLabel && (
            <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b bg-vitals-unhealthy px-1 text-[9px] font-semibold leading-4 text-background">
              TODAY
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function GanttGroupHeader({
  group,
  isCollapsed,
  onToggle,
  width,
  isScrolled,
}: {
  group: { key: string; rows: Campaign[] };
  isCollapsed: boolean;
  onToggle: () => void;
  width: number;
  isScrolled: boolean;
}) {
  return (
    <div className="flex border-b border-border bg-muted" style={{ width }}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "sticky left-0 z-30 flex items-center gap-2 bg-muted px-3 py-2 text-sm transition-shadow duration-150",
          isScrolled && SCROLL_SHADOW
        )}
        style={{ width: FROZEN_WIDTH }}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-medium text-foreground">{group.key}</span>
        <span className="text-muted-foreground">({group.rows.length})</span>
      </button>
    </div>
  );
}

export default function GanttChart() {
  const { search, page, pageSize, setPage, setPageSize } = useTableStore();
  const { filters, sort, groupBy } = useActiveViewState();
  const updateDraft = useViewsStore((s) => s.updateActiveViewDraft);
  const campaigns = useVisibleCampaigns();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setIsScrolled(el.scrollLeft > 0);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Collapse state resets when the grouping field changes.
  useEffect(() => {
    setCollapsed(new Set());
  }, [groupBy]);

  const filtered = useMemo(() => {
    const byFilters = applyFilters(campaigns, filters);
    const q = search.trim().toLowerCase();
    if (!q) return byFilters;
    return byFilters.filter(
      (c) => c.name.toLowerCase().includes(q) || c.url.toLowerCase().includes(q)
    );
  }, [campaigns, filters, search]);

  const sorted = useMemo(() => sortCampaigns(filtered, sort), [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const grouped = groupBy !== null;
  const groups = useMemo(
    () => (grouped ? groupRows(pageRows, groupBy) : []),
    [grouped, pageRows, groupBy]
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  // Axis spans the earliest createdOn across the visible page to 14 days past the
  // latest phase end (or today, whichever is later).
  const axis = useMemo<Axis>(() => {
    if (pageRows.length === 0) {
      return { start: today, end: addDays(today, 14), totalDays: 14 };
    }
    let earliest = startOfDay(new Date(pageRows[0].createdOn));
    let latestEnd = today;
    for (const c of pageRows) {
      const created = startOfDay(new Date(c.createdOn));
      if (created < earliest) earliest = created;
      for (const ph of phasesFor(c)) {
        const end = ph.to ? new Date(ph.to) : today;
        if (end > latestEnd) latestEnd = end;
      }
    }
    const start = earliest;
    const end = addDays(startOfDay(latestEnd), 14);
    return { start, end, totalDays: diffDays(start, end) };
  }, [pageRows, today]);

  const innerWidth = FROZEN_WIDTH + axis.totalDays * DAY_WIDTH;

  const days = useMemo(
    () => Array.from({ length: axis.totalDays }, (_, i) => addDays(axis.start, i)),
    [axis.start, axis.totalDays]
  );

  const scrollToToday = () => {
    const el = scrollRef.current;
    if (!el) return;
    const todayX = FROZEN_WIDTH + diffDays(axis.start, today) * DAY_WIDTH;
    el.scrollLeft = todayX - el.clientWidth * 0.6;
  };

  // Auto-centre on today on first mount and whenever the axis shifts.
  useEffect(() => {
    scrollToToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis.start, axis.totalDays]);

  const cycleSort = () => {
    if (sort?.column !== "name") updateDraft({ sort: { column: "name", dir: "asc" } });
    else if (sort.dir === "asc") updateDraft({ sort: { column: "name", dir: "desc" } });
    else updateDraft({ sort: null });
  };
  const sortIcon =
    sort?.column !== "name" ? (
      <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-60" />
    ) : sort.dir === "asc" ? (
      <ChevronUp className="h-3 w-3 shrink-0" />
    ) : (
      <ChevronDown className="h-3 w-3 shrink-0" />
    );

  const toggleGroup = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // First rendered campaign row carries the TODAY pill.
  let firstRowSeen = false;
  const renderCampaignRow = (c: Campaign) => {
    const showTodayLabel = !firstRowSeen;
    firstRowSeen = true;
    return (
      <GanttRow
        key={c.id}
        c={c}
        axis={axis}
        today={today}
        isScrolled={isScrolled}
        showTodayLabel={showTodayLabel}
      />
    );
  };

  const isEmpty = sorted.length === 0;

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto rounded-lg border border-border">
        <div style={{ width: innerWidth }}>
          {/* Header */}
          <div className="sticky top-0 z-40 flex border-b border-border bg-background">
            <div
              className={cn(
                "sticky left-0 z-10 flex shrink-0 items-center border-r border-border bg-background px-3 py-2.5 transition-shadow duration-150",
                isScrolled && SCROLL_SHADOW
              )}
              style={{ width: FROZEN_WIDTH }}
            >
              <button
                type="button"
                onClick={cycleSort}
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                  sort?.column === "name" && "text-foreground"
                )}
              >
                Campaign name
                {sortIcon}
              </button>
            </div>
            <div className="flex shrink-0" style={{ width: axis.totalDays * DAY_WIDTH }}>
              {days.map((d, i) => {
                const { top, bottom } = formatDayHeader(d);
                const isToday = isSameDay(d, today);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-center border-r border-border py-1",
                      isToday && "bg-vitals-unhealthy/10"
                    )}
                    style={{ width: DAY_WIDTH }}
                  >
                    <span className="text-[11px] text-muted-foreground">{top}</span>
                    <span className="text-xs tabular-nums text-foreground">{bottom}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body */}
          {isEmpty ? (
            <div
              className="sticky left-0 px-3 py-16 text-center text-muted-foreground"
              style={{ width: FROZEN_WIDTH }}
            >
              {search.trim()
                ? "No campaigns match your search."
                : "Nothing here yet."}
            </div>
          ) : grouped ? (
            groups.map((group) => {
              const isCollapsed = collapsed.has(group.key);
              return (
                <div key={group.key}>
                  <GanttGroupHeader
                    group={group}
                    isCollapsed={isCollapsed}
                    onToggle={() => toggleGroup(group.key)}
                    width={innerWidth}
                    isScrolled={isScrolled}
                  />
                  {!isCollapsed && group.rows.map(renderCampaignRow)}
                </div>
              );
            })
          ) : (
            pageRows.map(renderCampaignRow)
          )}
        </div>
      </div>

      {/* Controls + pagination */}
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={scrollToToday}
            className="rounded-md border border-input px-2.5 py-1 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Today
          </button>
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Results per page"
              className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground outline-none transition-colors hover:bg-muted"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>results</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="First page"
            disabled={currentPage === 1}
            onClick={() => setPage(1)}
            className={PAGER_BUTTON}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className={PAGER_BUTTON}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageWindow(currentPage, totalPages).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                "min-w-[28px] rounded-md px-2 py-1 text-sm transition-colors",
                p === currentPage
                  ? "bg-secondary font-medium text-secondary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            className={PAGER_BUTTON}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Last page"
            disabled={currentPage === totalPages}
            onClick={() => setPage(totalPages)}
            className={PAGER_BUTTON}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
