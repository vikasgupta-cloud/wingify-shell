import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  Columns2,
  EllipsisVertical,
  Files,
  GitBranch,
  Grid2x2,
  PanelRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  campaignLandingPath,
  phasesFor,
  type Campaign,
  type CampaignStatus,
  type CampaignType,
} from "../../data/campaigns";
import { applyFilters } from "../../config/filters";
import { groupRows } from "../../config/grouping";
import { addDays, diffDays, formatDayHeader, startOfDay } from "../../lib/dates";
import { useTableStore, type GanttZoom } from "../../store/table";
import { useVisibleCampaigns } from "../../store/rows";
import { useActiveViewState, useViewsStore } from "../../store/views";
import { useQuickViewStore } from "../../store/quickView";
import { useWandzStore } from "../../store/wandz";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import { VitalsIcon } from "../ui/StatusBadge";
import StatusMenu from "../ui/StatusMenu";
import DecisionIcon from "../ui/DecisionIcon";
import { sortCampaigns } from "../table/CampaignTable";

// Horizontal scale (px per calendar day) by zoom — a week reads ~84px, a month ~120px.
const PX_PER_DAY: Record<GanttZoom, number> = { day: 44, week: 12, month: 4 };
const MONTHS_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const FROZEN_WIDTH = 380;
const ROW_HEIGHT = 64;
const BAR_HEIGHT = 28;
const MIN_BAR = 24;
const LABEL_MIN = 48;
const PAGE_SIZES = [10, 25, 50];

const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

// Snap the axis origin to a zoom-appropriate boundary so week columns start on a
// Monday and month columns start on the 1st (bars stay correct — they're measured
// relative to this origin).
function snapStart(d: Date, zoom: GanttZoom): Date {
  const x = startOfDay(d);
  if (zoom === "week") {
    const dow = x.getDay(); // 0=Sun..6=Sat
    return addDays(x, -((dow + 6) % 7)); // back up to Monday
  }
  if (zoom === "month") {
    return startOfDay(new Date(x.getFullYear(), x.getMonth(), 1));
  }
  return x;
}

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
// Mirrors the Table / Kanban kebab menu. TODO: wire up (Clone / Timeline / Archive / Delete).
const ROW_ACTIONS = ["Clone", "Timeline", "Archive", "Delete"];
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
  pxPerDay,
  gridInterval,
}: {
  c: Campaign;
  axis: Axis;
  today: Date;
  isScrolled: boolean;
  showTodayLabel: boolean;
  pxPerDay: number;
  gridInterval: number;
}) {
  const TypeIcon = TYPE_ICONS[c.type];
  const openQuickView = useQuickViewStore((s) => s.toggle);
  const openWandz = useWandzStore((s) => s.toggleWandz);
  const phases = phasesFor(c);

  const segs = phases.map((ph, idx) => {
    const from = new Date(ph.from);
    const to = ph.to ? new Date(ph.to) : addDays(today, 1);
    const left = diffDays(axis.start, from) * pxPerDay;
    const width = Math.max(diffDays(from, to) * pxPerDay, MIN_BAR);
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
      ? diffDays(axis.start, new Date(phases[lastRunning + 1].from)) * pxPerDay
      : null;

  const todayX = diffDays(axis.start, today) * pxPerDay + pxPerDay / 2;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="group flex border-b border-border" style={{ height: ROW_HEIGHT }}>
      {/* Frozen left column */}
      <div
        className={cn(
          "sticky left-0 z-30 flex shrink-0 items-center gap-2.5 border-r border-border bg-background px-3 transition-[box-shadow,background-color] duration-150 group-hover:bg-muted",
          isScrolled && SCROLL_SHADOW
        )}
        style={{ width: FROZEN_WIDTH }}
      >
        <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={c.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              to={campaignLandingPath(c)}
              title={c.name}
              className="truncate text-sm font-medium text-foreground hover:underline"
            >
              {c.name}
            </Link>
            <span className="shrink-0">
              <VitalsIcon campaign={c} />
            </span>
          </div>
          <div className="truncate text-xs text-muted-foreground">{c.url}</div>
        </div>
        {/* Hover-revealed actions */}
        <div className="hidden shrink-0 items-center gap-0.5 group-focus-within:flex group-hover:flex group-has-[[data-state=open]]:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Summarise with Wandz"
            aria-label="Summarise with Wandz"
            onClick={(e) => {
              stop(e);
              openWandz({ kind: "campaign", campaignId: c.id });
            }}
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
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="More"
                aria-label="More"
                onClick={stop}
                className={ROW_ICON_BUTTON}
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                {ROW_ACTIONS.map((action) => (
                  <DropdownMenu.Item
                    key={action}
                    onSelect={(e) => e.stopPropagation()}
                    className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                  >
                    {action}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        <div className="shrink-0">
          <StatusMenu campaign={c} />
        </div>
      </div>

      {/* Timeline */}
      <div
        className="relative shrink-0"
        style={{
          width: axis.totalDays * pxPerDay,
          backgroundImage: `repeating-linear-gradient(to right, var(--border) 0, var(--border) 1px, transparent 1px, transparent ${gridInterval}px)`,
        }}
      >
        {/* Status-coloured segments — one continuous bar */}
        {segs.map(({ ph, idx, left, width, isFirst, isLast }) => (
          <div
            key={idx}
            title={ph.status}
            className={cn(
              "absolute flex items-center justify-center overflow-hidden px-1 transition-[width,left] duration-200 ease-out",
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

        {/* TODAY line */}
        <div
          className="absolute bottom-0 top-0 z-10 w-0.5 bg-vitals-unhealthy transition-[width,left] duration-200 ease-out"
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
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isCollapsed && "-rotate-90"
          )}
        />
        <span className="font-medium text-foreground">{group.key}</span>
        <span className="text-muted-foreground">({group.rows.length})</span>
      </button>
    </div>
  );
}

export default function GanttChart() {
  const { search, page, pageSize, setPage, setPageSize, ganttZoom, ganttTodayTick } =
    useTableStore();
  const { filters, sort, groupBy } = useActiveViewState();
  const updateDraft = useViewsStore((s) => s.updateActiveViewDraft);
  const campaigns = useVisibleCampaigns();

  const pxPerDay = PX_PER_DAY[ganttZoom];
  // Grid line interval matches the zoom: one line per day / week / ~month.
  const gridInterval =
    ganttZoom === "day" ? pxPerDay : ganttZoom === "week" ? 7 * pxPerDay : 30 * pxPerDay;

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

  // Axis spans the earliest createdOn across the visible page to the later of
  // (14 days past the latest phase end) and the end of the current year, so there's
  // always future runway visible ahead of today. Origin snapped to a zoom-appropriate
  // boundary (Monday for week, 1st for month).
  const yearEnd = useMemo(
    () => startOfDay(new Date(today.getFullYear(), 11, 31)),
    [today]
  );
  const axis = useMemo<Axis>(() => {
    if (pageRows.length === 0) {
      const start = snapStart(today, ganttZoom);
      return { start, end: yearEnd, totalDays: diffDays(start, yearEnd) };
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
    const start = snapStart(earliest, ganttZoom);
    const padded = addDays(startOfDay(latestEnd), 14);
    const end = padded > yearEnd ? padded : yearEnd;
    return { start, end, totalDays: diffDays(start, end) };
  }, [pageRows, today, ganttZoom, yearEnd]);

  const innerWidth = FROZEN_WIDTH + axis.totalDays * pxPerDay;

  // Header columns by zoom. Day → one cell per day; week → one Monday-anchored
  // cell per 7 days (month abbrev on the first week of a month, else blank; day
  // number below); month → one cell per calendar month (year on Jan/first column,
  // month abbrev below). Widths sum to exactly totalDays * pxPerDay so the header
  // stays aligned with the body grid.
  const headerCells = useMemo(() => {
    const cells: { width: number; top: string; bottom: string; highlight: boolean }[] = [];
    const todayOffset = diffDays(axis.start, today);
    if (ganttZoom === "day") {
      for (let o = 0; o < axis.totalDays; o++) {
        const d = addDays(axis.start, o);
        const { top, bottom } = formatDayHeader(d);
        cells.push({ width: pxPerDay, top, bottom, highlight: o === todayOffset });
      }
    } else if (ganttZoom === "week") {
      for (let o = 0; o < axis.totalDays; o += 7) {
        const d = addDays(axis.start, o);
        const span = Math.min(7, axis.totalDays - o);
        const dom = d.getDate();
        cells.push({
          width: span * pxPerDay,
          top: dom <= 7 ? MONTHS_ABBR[d.getMonth()] : "",
          bottom: String(dom),
          highlight: todayOffset >= o && todayOffset < o + span,
        });
      }
    } else {
      let o = 0;
      let first = true;
      while (o < axis.totalDays) {
        const d = addDays(axis.start, o); // always the 1st (origin snapped to a month)
        const dim = daysInMonth(d);
        const span = Math.min(dim, axis.totalDays - o);
        cells.push({
          width: span * pxPerDay,
          top: d.getMonth() === 0 || first ? String(d.getFullYear()) : "",
          bottom: MONTHS_ABBR[d.getMonth()],
          highlight: todayOffset >= o && todayOffset < o + span,
        });
        first = false;
        o += dim;
      }
    }
    return cells;
  }, [ganttZoom, axis.start, axis.totalDays, pxPerDay, today]);

  const scrollToToday = () => {
    const el = scrollRef.current;
    if (!el) return;
    const todayX = FROZEN_WIDTH + diffDays(axis.start, today) * pxPerDay;
    el.scrollLeft = todayX - el.clientWidth * 0.6;
  };

  // Auto-centre on today on first mount and whenever the axis or zoom changes.
  useEffect(() => {
    scrollToToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis.start, axis.totalDays, pxPerDay]);

  // The "Today" control lives in the page toolbar; it bumps ganttTodayTick to ask
  // us to re-centre. Skip the initial value (the mount effect above already did it).
  const firstTick = useRef(true);
  useEffect(() => {
    if (firstTick.current) {
      firstTick.current = false;
      return;
    }
    scrollToToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganttTodayTick]);

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
        pxPerDay={pxPerDay}
        gridInterval={gridInterval}
      />
    );
  };

  const isEmpty = sorted.length === 0;

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto rounded-lg border border-border bg-background">
        <div style={{ width: innerWidth }}>
          {/* Header */}
          <div className="sticky top-0 z-40 flex border-b border-border bg-muted">
            <div
              className={cn(
                "sticky left-0 z-10 flex shrink-0 items-center border-r border-border bg-muted px-3 py-2.5 transition-shadow duration-150",
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
            <div className="flex shrink-0" style={{ width: axis.totalDays * pxPerDay }}>
              {headerCells.map((cell, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col items-center justify-center border-r border-border py-1",
                    cell.highlight && "bg-vitals-unhealthy/10"
                  )}
                  style={{ width: cell.width }}
                >
                  <span className="text-[11px] text-muted-foreground">{cell.top || " "}</span>
                  <span className="text-xs tabular-nums text-foreground">{cell.bottom}</span>
                </div>
              ))}
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
