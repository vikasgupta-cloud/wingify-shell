// Session Recordings under Insights — layout from Figma Recordings "Updated layout",
// restyled with app grayscale tokens and spacing. Reuses StatusBadge, Button, Input, Tabs, Checkbox.

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  EllipsisVertical,
  Funnel,
  Monitor,
  Play,
  Plus,
  Settings,
  Share2,
  Sparkles,
  Video,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ACTIVE_REPORT,
  RECORDING_STATS,
  RECORDING_VIEWS,
  SESSION_ROWS,
  countryFlagEmoji,
  openSessionPlayer,
  type RecordingView,
} from "@/data/sessionRecordings";

const PAGE_SIZE = 10;

function FilterSegment({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex min-w-0 flex-1 items-center justify-between gap-2 border-r border-border bg-background px-3 py-2 text-left last:border-r-0 hover:bg-muted"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm leading-snug text-foreground">
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

function ViewsRail({
  views,
  activeId,
  onSelect,
  query,
  onQueryChange,
}: {
  views: RecordingView[];
  activeId: string;
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
    <aside className="flex w-[300px] shrink-0 flex-col self-start rounded-lg border border-border bg-background">
      <Tabs defaultValue="views" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-4">
          <TabsList
            variant="underline"
            className="h-auto w-full justify-start gap-5 border-b-0"
          >
            <TabsTrigger value="views" className="px-0 pb-2.5 pt-3">
              Views
            </TabsTrigger>
            <TabsTrigger value="timeline" className="px-0 pb-2.5 pt-3">
              Timeline
            </TabsTrigger>
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
          <Button variant="outline" size="sm" className="h-9 w-full justify-center gap-2">
            <Plus className="size-4" aria-hidden />
            Create view
          </Button>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {/* All Recordings is a list header, not a selectable view row */}
            <li className="flex items-center justify-between gap-2 px-3 py-2.5">
              <span className="truncate text-sm font-medium text-foreground">
                All Recordings
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
                        : "text-foreground hover:bg-muted"
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
          value="timeline"
          className="mt-0 flex flex-1 items-center justify-center p-6"
        >
          <p className="text-center text-sm text-muted-foreground">
            Timeline coming soon
          </p>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

export default function SessionRecordingsPage() {
  const [activeViewId, setActiveViewId] = useState("agency");
  const [viewQuery, setViewQuery] = useState("");
  const [listMode, setListMode] = useState<"all" | "saved">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const rows = SESSION_ROWS;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart = rows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, rows.length);

  const selectedOnPage = pageRows.filter((r) => selected.has(r.id)).length;
  const allSelected =
    pageRows.length > 0 && selectedOnPage === pageRows.length;
  const headerChecked: boolean | "indeterminate" = allSelected
    ? true
    : selectedOnPage > 0
      ? "indeterminate"
      : false;

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });

  return (
    <div className="flex min-h-full flex-col">
      {/* Page header — title + blurb left; stats + configuration right */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-12 pb-4 pt-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background">
            <Video className="size-4 text-foreground" aria-hidden />
          </div>
          <div className="min-w-0">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h1 className="font-title w-fit cursor-default text-2xl font-semibold tracking-tight text-foreground">
                    Session Recordings
                  </h1>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  Record and playback visitor sessions on your website.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex flex-wrap items-center gap-3">
            {RECORDING_STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="text-muted-foreground" aria-hidden>
                    ·
                  </span>
                )}
                <div>
                  <p className="text-xs leading-tight text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-sm font-medium leading-tight tabular-nums text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="size-3.5" aria-hidden />
            Configuration
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-6 px-12 pb-10 pt-2">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Active report meta */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">
                  {ACTIVE_REPORT.name}
                </h2>
                <StatusBadge status={ACTIVE_REPORT.status} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Created by {ACTIVE_REPORT.createdBy} on {ACTIVE_REPORT.createdAt}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="size-8" aria-label="Export CSV">
                <Download className="size-4" aria-hidden />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Share">
                <Share2 className="size-4" aria-hidden />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" aria-label="Settings">
                <Settings className="size-4" aria-hidden />
              </Button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex overflow-hidden rounded-md border border-border bg-background">
            <div className="flex h-14 shrink-0 items-center border-r border-border px-4">
              <Funnel className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <FilterSegment value="Jun 25, 2025 - Jul 01, 2025" label="Date Filter" />
            <FilterSegment value="All Visitors" label="Visitor Segments" />
            <FilterSegment
              value="Report Specific Filters"
              label="Report Segments"
            />
          </div>

          {/* Table region */}
          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base font-semibold text-foreground">
                  Session Recordings Report
                </h3>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Sparkles className="size-3.5" aria-hidden />
                  Summarize
                  <Badge variant="secondary" className="rounded-full font-medium">
                    Early access
                  </Badge>
                </Button>
              </div>
              <div className="inline-flex rounded-md border border-border p-0.5">
                <Button
                  type="button"
                  variant={listMode === "all" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => setListMode("all")}
                >
                  View all
                </Button>
                <Button
                  type="button"
                  variant={listMode === "saved" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => setListMode("saved")}
                >
                  Saved
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-listing-header text-left text-xs font-medium text-listing-header-foreground">
                      <th className="w-11 px-3 py-3">
                        <Checkbox
                          checked={headerChecked}
                          onCheckedChange={toggleAll}
                          aria-label="Select all sessions"
                        />
                      </th>
                      <th className="px-3 py-3 font-medium">Location / URL</th>
                      <th className="px-3 py-3 font-medium">Company</th>
                      <th className="px-3 py-3 font-medium">Duration</th>
                      <th className="px-3 py-3 font-medium">Tech</th>
                      <th className="px-3 py-3 font-medium">Events</th>
                      <th className="px-3 py-3 font-medium">Timestamp</th>
                      <th className="w-28 px-3 py-3 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border last:border-b-0 hover:bg-[hsl(var(--table-row-hover,_var(--muted)))]"
                      >
                        <td className="px-3 py-3 align-middle">
                          <Checkbox
                            checked={selected.has(row.id)}
                            onCheckedChange={() => toggleRow(row.id)}
                            aria-label={`Select session ${row.id}`}
                          />
                        </td>
                        <td className="px-3 py-3 align-middle">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-base leading-none"
                              aria-hidden
                            >
                              {countryFlagEmoji("US")}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate leading-snug font-medium text-foreground">
                                {row.city}, {row.country}
                              </span>
                              <span className="block truncate text-xs leading-snug text-muted-foreground">
                                {row.url}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 align-middle text-foreground">
                          {row.company}
                        </td>
                        <td className="px-3 py-3 align-middle tabular-nums text-foreground">
                          {row.duration}
                        </td>
                        <td className="px-3 py-3 align-middle">
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Monitor className="size-4" aria-label="Desktop" />
                            <span className="text-xs" aria-label="Chrome">
                              Chr
                            </span>
                            <span className="text-xs" aria-label="Windows">
                              Win
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3 align-middle tabular-nums text-foreground">
                          {row.events}
                        </td>
                        <td className="px-3 py-3 align-middle whitespace-nowrap text-foreground">
                          {row.timestamp}
                        </td>
                        <td className="px-3 py-3 align-middle">
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-highlight-fg hover:bg-highlight-bg hover:text-highlight-fg"
                              aria-label="AI summary"
                            >
                              <Sparkles className="size-3.5" aria-hidden />
                            </Button>
                            <Button
                              variant="inverted"
                              size="icon"
                              className="size-7"
                              aria-label="Play recording"
                              onClick={() => openSessionPlayer(row.id)}
                            >
                              <Play className="size-3.5 fill-current" aria-hidden />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              aria-label="More actions"
                            >
                              <EllipsisVertical className="size-3.5" aria-hidden />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-sm text-muted-foreground">
                <p>
                  Showing {rangeStart}–{rangeEnd} of {rows.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(1)}
                    aria-label="First page"
                  >
                    <ChevronsLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="px-2 tabular-nums text-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(totalPages)}
                    aria-label="Last page"
                  >
                    <ChevronsRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ViewsRail
          views={RECORDING_VIEWS}
          activeId={activeViewId}
          onSelect={setActiveViewId}
          query={viewQuery}
          onQueryChange={setViewQuery}
        />
      </div>
    </div>
  );
}
