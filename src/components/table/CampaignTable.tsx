import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  EllipsisVertical,
  PanelRight,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { campaignLandingPath, hasReport, type Campaign } from "../../data/campaigns";
import { conclusionKind } from "../../data/campaignConclusion";
import ConclusionStateIcon from "../reports/ConclusionStateIcon";
import { COLUMNS, type ColumnDef, type ColumnId } from "../../config/columns";
import { applyFilters } from "../../config/filters";
import { groupRows } from "../../config/grouping";
import { useTableStore, type RowDensity } from "../../store/table";
import { useRowsStore, useVisibleCampaigns } from "../../store/rows";
import { useActiveViewState, useViewsStore } from "../../store/views";
import { useQuickViewStore } from "../../store/quickView";
import { useWandzStore } from "../../store/wandz";
import { cn } from "../../lib/utils";
import { TYPE_ICONS } from "../icons/campaignTypeIcons";
import { VitalsIcon } from "../ui/StatusBadge";
import StatusMenu from "../ui/StatusMenu";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Subtle placeholder for any null cell — a small en-dash, not a graphic em-dash.
const NULL_DASH = <span className="text-sm text-muted-foreground">–</span>;
const formatDate = (isoDate: string | null): React.ReactNode => {
  if (!isoDate) return NULL_DASH;
  const d = new Date(isoDate);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const formatNumber = (n: number) => n.toLocaleString("en-US");
const formatImprovement = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

const ROW_ACTIONS = ["Clone", "Timeline", "Archive", "Delete"];
const PAGE_SIZES = [10, 25, 50];

export function sortValue(c: Campaign, column: ColumnId): string | number | null {
  switch (column) {
    case "name": return c.name.toLowerCase();
    case "status": return c.status;
    case "conclusion": return c.decision;
    case "vitals": return c.vitals;
    case "variations": return c.variations;
    case "visitors": return c.visitors;
    case "uniqueConversion": return c.uniqueConversions;
    case "createdOnBy": return c.createdOn;
    case "startedOn": return c.startedOn;
    case "expectedImprovement": return c.expectedImprovement;
    case "primaryMetric": return c.primaryMetric;
    case "leadingVariation": return c.leadingVariation;
    case "lastUpdated": return c.lastUpdated;
    default: return null;
  }
}

// Shared by the table and the Kanban board so both order rows identically.
export function sortCampaigns(
  rows: Campaign[],
  sort: { column: ColumnId; dir: "asc" | "desc" } | null
): Campaign[] {
  if (!sort) return rows;
  const { column, dir } = sort;
  return [...rows].sort((a, b) => {
    const av = sortValue(a, column);
    const bv = sortValue(b, column);
    // Nulls sort last regardless of direction.
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
    return dir === "asc" ? cmp : -cmp;
  });
}

// Hover-revealed row action icons — ghost icon Buttons sized to the original 28px hit
// area (p-1.5 around a 16px icon) instead of the default 36px icon size.
const ROW_ICON_BUTTON =
  "h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground";

// Pinned first two columns (checkbox + campaign name). Every sticky cell keeps an
// explicit OPAQUE background in all states — default bg-background, and the SAME
// opaque bg-muted the rest of the row uses on hover — so scrolling columns never
// bleed through the pinned region. (An alpha hover like bg-muted/50 would let the
// content scrolling underneath show through the pinned cells.)
const STICKY_CHECKBOX_BODY =
  "sticky left-0 z-10 w-[44px] bg-background group-hover:bg-muted group-data-[selected=true]:bg-muted";
const STICKY_NAME_BODY =
  "sticky left-[44px] z-10 bg-background group-hover:bg-muted group-data-[selected=true]:bg-muted";
const STICKY_CHECKBOX_HEAD = "sticky left-0 z-10 w-[44px] bg-background";
const STICKY_NAME_HEAD = "sticky left-[44px] z-10 bg-background";
// The pinned name column's right edge. It CANNOT be a box-shadow on the <td>/<th>:
// the table is `border-collapse`, which suppresses cell box-shadows entirely (no
// z-index rescues them). Instead we overlay a 1px-wide absolutely-positioned element
// pinned to the cell's right edge and hang the shadow off THAT — a normal block paints
// its shadow fine, and living inside the z-10 sticky cell it draws over the scrolling
// columns. A 1px line plus a soft always-on drop shadow, matching Gantt's fixed column.
// Arbitrary *property* (not shadow-[…]) so Tailwind's ring-color processing doesn't
// mangle the multi-shadow value.
const NAME_EDGE_OVERLAY =
  "pointer-events-none absolute inset-y-0 right-0 w-px [box-shadow:1px_0_0_0_hsl(var(--border)),6px_0_10px_-2px_rgba(0,0,0,0.18)]";

// Vertical padding for body cells by the global row-density preference.
const DENSITY_PAD: Record<RowDensity, string> = {
  compact: "py-2",
  default: "py-3",
  comfortable: "py-5",
};

const MIN_COL_WIDTH = 80;
const CHECKBOX_COL_WIDTH = 44;

function NameCell({ campaign }: { campaign: Campaign }) {
  const TypeIcon = TYPE_ICONS[campaign.type];
  const quickViewOpen = useQuickViewStore((s) => s.openId === campaign.id);
  const openQuickView = useQuickViewStore((s) => s.toggle);
  const openWandz = useWandzStore((s) => s.toggleWandz);
  return (
    <div className="flex items-center gap-2.5">
      <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={campaign.type} />
      <div className="min-w-0 flex-1">
        <Link
          to={campaignLandingPath(campaign)}
          className="block truncate text-sm font-medium text-foreground hover:underline"
        >
          {campaign.name}
        </Link>
        <div className="truncate text-xs text-muted-foreground">{campaign.url}</div>
      </div>
      {/* Hover-revealed row actions — Quick view stays visible while this row is open */}
      <div
        className={cn(
          "shrink-0 items-center gap-0.5",
          quickViewOpen
            ? "flex"
            : "hidden group-focus-within:flex group-hover:flex group-has-[[data-state=open]]:flex"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Summarise with Wandz"
          aria-label="Summarise with Wandz"
          onClick={(e) => {
            e.stopPropagation();
            openWandz({ kind: "campaign", campaignId: campaign.id });
          }}
          className={ROW_ICON_BUTTON}
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => openQuickView(campaign.id)}
          title="Quick view"
          aria-label="Quick view"
          aria-pressed={quickViewOpen}
          className={cn(ROW_ICON_BUTTON, quickViewOpen && "text-foreground")}
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
              {/* TODO: wire up row actions (Clone / Timeline / Archive / Delete) */}
              {ROW_ACTIONS.map((action) => (
                <DropdownMenu.Item
                  key={action}
                  className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                >
                  {action}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

function renderCell(c: Campaign, column: ColumnDef) {
  switch (column.id) {
    case "name":
      return <NameCell campaign={c} />;
    case "status":
      // StatusMenu is standalone and can be reused in the level-2 detail top bar later.
      return <StatusMenu campaign={c} />;
    case "conclusion":
      // Only reportable campaigns have an intrinsic conclusion state. The two
      // report-only overrides (filtersApplied / allDisabled) never surface here.
      return hasReport(c.status) ? (
        <div className="flex items-center justify-center">
          <ConclusionStateIcon kind={conclusionKind(c)} />
        </div>
      ) : (
        NULL_DASH
      );
    case "vitals":
      return <VitalsIcon campaign={c} />;
    case "variations":
      return <span className="tabular-nums">{formatNumber(c.variations)}</span>;
    case "visitors":
      return <span className="tabular-nums">{formatNumber(c.visitors)}</span>;
    case "uniqueConversion":
      return <span className="tabular-nums">{formatNumber(c.uniqueConversions)}</span>;
    case "createdOnBy":
      return (
        <div className="whitespace-nowrap">
          <div className="tabular-nums">{formatDate(c.createdOn)}</div>
          <div className="text-xs text-muted-foreground">by {c.createdBy}</div>
        </div>
      );
    case "startedOn":
      return <span className="whitespace-nowrap tabular-nums">{formatDate(c.startedOn)}</span>;
    case "expectedImprovement":
      return <span className="tabular-nums">{formatImprovement(c.expectedImprovement)}</span>;
    case "primaryMetric":
      return <span className="whitespace-nowrap">{c.primaryMetric}</span>;
    case "leadingVariation":
      return <span className="whitespace-nowrap">{c.leadingVariation}</span>;
    case "hypothesis":
      return (
        <span title={c.hypothesis} className="block max-w-[240px] truncate">
          {c.hypothesis}
        </span>
      );
    case "labels":
      return c.labels.length === 0 ? (
        NULL_DASH
      ) : (
        <div className="flex flex-wrap gap-1">
          {c.labels.map((label) => (
            <span
              key={label}
              className="whitespace-nowrap rounded-full border border-input px-2 py-0.5 text-xs text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      );
    case "lastUpdated":
      return <span className="whitespace-nowrap tabular-nums">{formatDate(c.lastUpdated)}</span>;
  }
}

function pageWindow(current: number, total: number): number[] {
  const size = 5;
  let start = Math.max(1, current - 2);
  const end = Math.min(total, start + size - 1);
  start = Math.max(1, end - size + 1);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

const PAGER_BUTTON =
  "h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40";

// The compact 14px select box — shadcn Checkbox restyled to the original neutral look
// (light border, foreground fill, 10px check/minus) rather than the default variant.
const SELECT_BOX =
  "h-4 w-4 rounded-[3px] border-input bg-background shadow-none data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background data-[state=indeterminate]:border-foreground data-[state=indeterminate]:bg-foreground data-[state=indeterminate]:text-background [&_svg]:size-2.5";

function SelectCheckbox({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean | "indeterminate";
  onCheckedChange: () => void;
  label: string;
}) {
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={SELECT_BOX}
    />
  );
}

export default function CampaignTable() {
  const { search, page, pageSize, setPage, setPageSize, rowDensity } = useTableStore();
  const { filters, sort, groupBy, visibleColumns, columnWidths } = useActiveViewState();
  const activeViewId = useViewsStore((s) => s.activeViewId);
  const updateDraft = useViewsStore((s) => s.updateActiveViewDraft);
  const campaigns = useVisibleCampaigns();
  const archive = useRowsStore((s) => s.archive);
  const remove = useRowsStore((s) => s.remove);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Column resize: live widths during a drag (local only); committed to the view
  // draft once on mouseup. Older persisted views may predate columnWidths.
  const savedWidths = columnWidths ?? {};
  const [liveWidths, setLiveWidths] = useState<Partial<Record<ColumnId, number>>>({});
  const effWidth = (col: ColumnDef): number =>
    liveWidths[col.id] ?? savedWidths[col.id] ?? col.width;

  const startResize = (e: React.MouseEvent, col: ColumnDef) => {
    e.preventDefault();
    e.stopPropagation();
    const id = col.id;
    const startX = e.clientX;
    const startW = effWidth(col);
    const widthAt = (ev: MouseEvent) =>
      Math.max(MIN_COL_WIDTH, startW + (ev.clientX - startX));
    const onMove = (ev: MouseEvent) =>
      setLiveWidths((prev) => ({ ...prev, [id]: widthAt(ev) }));
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setLiveWidths((prev) => {
        const { [id]: _dropped, ...rest } = prev;
        return rest;
      });
      updateDraft({ columnWidths: { ...savedWidths, [id]: widthAt(ev) } });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Double-click on a handle resets that column to its default width.
  const resetWidth = (id: ColumnId) => {
    const { [id]: _dropped, ...rest } = savedWidths;
    updateDraft({ columnWidths: rest });
  };

  // Track horizontal scroll so the pinned name column can cast a shadow over the
  // scrolling content once scrollLeft > 0.
  const scrollRef = useRef<HTMLDivElement>(null);

  const setSort = (id: ColumnId) => {
    if (sort?.column !== id) {
      updateDraft({ sort: { column: id, dir: "asc" } });
    } else if (sort.dir === "asc") {
      updateDraft({ sort: { column: id, dir: "desc" } });
    } else {
      updateDraft({ sort: null });
    }
  };

  const filtered = useMemo(() => {
    const byFilters = applyFilters(campaigns, filters);
    const q = search.trim().toLowerCase();
    if (!q) return byFilters;
    return byFilters.filter(
      (c) => c.name.toLowerCase().includes(q) || c.url.toLowerCase().includes(q)
    );
  }, [campaigns, filters, search]);

  const sorted = useMemo(() => sortCampaigns(filtered, sort), [filtered, sort]);

  // Selection clears when the view, filters, search, or grouping changes.
  useEffect(() => {
    setSelected(new Set());
  }, [activeViewId, filters, search, groupBy]);

  // Collapse state resets when the grouping field changes.
  useEffect(() => {
    setCollapsed(new Set());
  }, [groupBy]);

  const columns = visibleColumns
    .map((id) => COLUMNS.find((c) => c.id === id))
    .filter((c): c is ColumnDef => c !== undefined);
  // checkbox column + the visible data columns (name is one of them) + the filler.
  const totalColSpan = columns.length + 2;
  // table-layout: fixed needs an explicit width. This is the natural (min) width;
  // the table stretches to w-full and the filler column absorbs any extra space, so
  // there is no white gap when the columns are narrower than the card.
  const tableWidth =
    CHECKBOX_COL_WIDTH + columns.reduce((sum, col) => sum + effWidth(col), 0);

  const grouped = groupBy !== null;
  const groups = useMemo(
    () => (grouped ? groupRows(sorted, groupBy) : []),
    [grouped, sorted, groupBy]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = grouped
    ? sorted
    : sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Real result count (post search/filter) and the visible range on this page —
  // the footer reports these, never the page-size value.
  const totalResults = sorted.length;
  const rangeStart = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalResults);
  // Pagination controls only earn their space once the list is long enough to
  // split (grouped view shows everything at once, so never). Short lists just
  // state their count.
  const showControls = !grouped && totalResults > PAGE_SIZES[0];

  // Rows the select-all checkbox governs: whole page, or all visible when grouped.
  const selectableRows = pageRows;
  const selectedVisible = selectableRows.filter((r) => selected.has(r.id)).length;
  const allSelected =
    selectableRows.length > 0 && selectedVisible === selectableRows.length;
  const headerState: boolean | "indeterminate" = allSelected
    ? true
    : selectedVisible > 0
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
      if (allSelected) selectableRows.forEach((r) => next.delete(r.id));
      else selectableRows.forEach((r) => next.add(r.id));
      return next;
    });
  const clearSelection = () => setSelected(new Set());

  const toggleGroup = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const doArchive = () => {
    archive([...selected]);
    clearSelection();
  };
  const doDelete = () => {
    remove([...selected]);
    clearSelection();
    setConfirmDelete(false);
  };

  const sortIcon = (col: ColumnDef) => {
    if (sort?.column !== col.id)
      return (
        <ChevronsUpDown
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      );
    // Single chevron that rotates between asc/desc so the flip animates rather than swaps.
    return (
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
          sort.dir === "asc" && "rotate-180"
        )}
        aria-hidden
      />
    );
  };

  const hasSelection = selected.size > 0;
  const quickViewId = useQuickViewStore((s) => s.openId);

  const renderRow = (c: Campaign) => {
    const isQuickView = quickViewId === c.id;
    return (
    <tr
      key={c.id}
      data-selected={isQuickView || undefined}
      aria-current={isQuickView ? "true" : undefined}
      className={cn(
        "group border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted",
        isQuickView && "bg-muted"
      )}
    >
      <td className={cn("px-3 align-middle", DENSITY_PAD[rowDensity], STICKY_CHECKBOX_BODY)}>
        <SelectCheckbox
          checked={selected.has(c.id)}
          onCheckedChange={() => toggleRow(c.id)}
          label={`Select ${c.name}`}
        />
      </td>
      {columns.map((col) => (
        <td
          key={col.id}
          className={cn(
            "px-3 align-middle",
            // Name cell hosts the edge overlay, so it must NOT clip overflow;
            // its content truncates via inner `truncate` classes instead.
            col.id === "name" ? "relative" : "overflow-hidden",
            DENSITY_PAD[rowDensity],
            col.id === "name" && STICKY_NAME_BODY,
            col.align === "right" && "text-right tabular-nums",
            col.align === "center" && "text-center"
          )}
        >
          {renderCell(c, col)}
          {col.id === "name" && <span aria-hidden className={NAME_EDGE_OVERLAY} />}
        </td>
      ))}
      {/* Filler cell so the row spans the full card width when columns are narrow. */}
      <td aria-hidden />
    </tr>
    );
  };

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {/* Horizontal scroll only — the card grows vertically and the PAGE scrolls it. */}
        <div ref={scrollRef} className="overflow-x-auto">
          <table
            className="w-full table-fixed border-collapse text-sm"
            style={{ minWidth: tableWidth }}
          >
            <colgroup>
              <col style={{ width: CHECKBOX_COL_WIDTH }} />
              {columns.map((col) => (
                <col key={col.id} style={{ width: effWidth(col) }} />
              ))}
              {/* Filler column (auto width) absorbs space beyond the fixed columns. */}
              <col />
            </colgroup>
          <thead>
            {hasSelection ? (
              <tr className="animate-fade-in border-b border-border bg-muted/50 duration-150">
                <td colSpan={totalColSpan} className="sticky left-0 z-10 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <SelectCheckbox
                      checked={headerState}
                      onCheckedChange={toggleAll}
                      label="Select all"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {selected.size} selected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={doArchive}
                      className="h-auto gap-1.5 bg-transparent px-2.5 py-1 text-sm text-foreground shadow-none hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(true)}
                      className="h-auto gap-1.5 bg-transparent px-2.5 py-1 text-sm text-foreground shadow-none hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="ml-auto h-auto px-0 py-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
                    >
                      Clear selection
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr className="border-b border-border bg-background">
                <th className={cn("px-3 py-2.5", STICKY_CHECKBOX_HEAD)}>
                  <SelectCheckbox
                    checked={headerState}
                    onCheckedChange={toggleAll}
                    label="Select all"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn(
                      "relative whitespace-nowrap px-3 py-2.5 text-left text-sm font-medium text-muted-foreground",
                      col.id === "name" && STICKY_NAME_HEAD,
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {col.id === "name" && (
                      <span aria-hidden className={NAME_EDGE_OVERLAY} />
                    )}
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => setSort(col.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 transition-colors hover:text-foreground",
                          sort?.column === col.id && "text-foreground"
                        )}
                      >
                        {col.label}
                        {sortIcon(col)}
                      </button>
                    ) : (
                      col.label
                    )}
                    {/* Drag to resize; double-click to reset to the default width. */}
                    <div
                      role="separator"
                      aria-label={`Resize ${col.label} column`}
                      onMouseDown={(e) => startResize(e, col)}
                      onDoubleClick={() => resetWidth(col.id)}
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-border"
                    />
                  </th>
                ))}
                {/* Filler header cell, matches the filler column. */}
                <th aria-hidden />
              </tr>
            )}
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColSpan}
                  className="px-3 py-16 text-center text-muted-foreground"
                >
                  {search.trim()
                    ? "No campaigns match your search."
                    : "Nothing here yet."}
                </td>
              </tr>
            ) : grouped ? (
              groups.map((group) => {
                const isCollapsed = collapsed.has(group.key);
                return (
                  <GroupSection
                    key={group.key}
                    group={group}
                    isCollapsed={isCollapsed}
                    onToggle={() => toggleGroup(group.key)}
                    colSpan={totalColSpan}
                    renderRow={renderRow}
                  />
                );
              })
            ) : (
              pageRows.map(renderRow)
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer — short/grouped lists state their count; only once the list is
          long enough to page do the range, page-size, and pager appear. */}
      {totalResults > 0 && (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">
            {showControls
              ? `${rangeStart}–${rangeEnd} of ${totalResults}`
              : `${totalResults} result${totalResults === 1 ? "" : "s"}`}
          </span>

          {showControls && (
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger
                aria-label="Rows per page"
                className="h-auto w-auto gap-1 bg-background px-2 py-1 text-sm text-foreground shadow-none hover:bg-muted focus:ring-0"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          {totalPages > 1 && (
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="First page"
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
              className={PAGER_BUTTON}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className={PAGER_BUTTON}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageWindow(currentPage, totalPages).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  "min-w-[28px] rounded-md px-2 py-1 text-sm tabular-nums transition-colors",
                  p === currentPage
                    ? "bg-secondary font-medium text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              className={PAGER_BUTTON}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Last page"
              disabled={currentPage === totalPages}
              onClick={() => setPage(totalPages)}
              className={PAGER_BUTTON}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
          )}
          </div>
          )}
        </div>
      )}

      {/* Bulk delete confirmation */}
      <AlertDialog.Root open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <AlertDialog.Title className="text-sm font-medium text-foreground">
              Delete {selected.size} campaign{selected.size === 1 ? "" : "s"}?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              This can't be undone.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={doDelete}
                  className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

function GroupSection({
  group,
  isCollapsed,
  onToggle,
  colSpan,
  renderRow,
}: {
  group: { key: string; rows: Campaign[] };
  isCollapsed: boolean;
  onToggle: () => void;
  colSpan: number;
  renderRow: (c: Campaign) => React.ReactNode;
}) {
  return (
    <>
      <tr className="border-b border-border bg-canvas">
        <td colSpan={colSpan} className="p-0">
          {/* The label sticks to the left edge while the band spans the full row,
              so "Draft (6)" stays in view when the table scrolls horizontally. */}
          <button
            type="button"
            onClick={onToggle}
            className="sticky left-0 flex w-max max-w-full items-center gap-2 bg-canvas px-3 py-2 text-sm"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isCollapsed && "-rotate-90"
              )}
            />
            <span className="text-sm font-medium text-foreground">{group.key}</span>
            <span className="text-muted-foreground">({group.rows.length})</span>
          </button>
        </td>
      </tr>
      {!isCollapsed && group.rows.map(renderRow)}
    </>
  );
}
