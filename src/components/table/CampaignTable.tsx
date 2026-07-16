import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import {
  Archive,
  BarChart3,
  Check,
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
  Minus,
  PanelRight,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { hasReport, type Campaign, type CampaignType } from "../../data/campaigns";
import { COLUMNS, type ColumnDef, type ColumnId } from "../../config/columns";
import { applyFilters } from "../../config/filters";
import { groupRows } from "../../config/grouping";
import { useTableStore } from "../../store/table";
import { useRowsStore, useVisibleCampaigns } from "../../store/rows";
import { useActiveViewState, useViewsStore } from "../../store/views";
import { useQuickViewStore } from "../../store/quickView";
import { cn } from "../../lib/utils";
import { VitalsIcon } from "../ui/StatusBadge";
import StatusMenu from "../ui/StatusMenu";
import DecisionIcon from "../ui/DecisionIcon";

const TYPE_ICONS: Record<CampaignType, LucideIcon> = {
  "A/B": Columns2,
  MVT: Grid2x2,
  "Split URL": GitBranch,
  Multipage: Files,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (isoDate: string | null) => {
  if (!isoDate) return "—";
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

const ROW_ICON_BUTTON =
  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

// Pinned first two columns (checkbox + campaign name). Every sticky cell keeps an
// explicit OPAQUE background in all states — default bg-background, and the SAME
// opaque bg-muted the rest of the row uses on hover — so scrolling columns never
// bleed through the pinned region. (An alpha hover like bg-muted/50 would let the
// content scrolling underneath show through the pinned cells.)
const STICKY_CHECKBOX_BODY =
  "sticky left-0 z-10 w-[44px] bg-background group-hover:bg-muted";
const STICKY_NAME_BODY =
  "sticky left-[44px] z-10 border-r border-border bg-background group-hover:bg-muted";
const STICKY_CHECKBOX_HEAD = "sticky left-0 z-10 w-[44px] bg-background";
const STICKY_NAME_HEAD =
  "sticky left-[44px] z-10 border-r border-border bg-background";
// Right-edge shadow cast by the pinned name column once the table is scrolled.
const SCROLL_SHADOW = "shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]";

function NameCell({ campaign }: { campaign: Campaign }) {
  const TypeIcon = TYPE_ICONS[campaign.type];
  const openQuickView = useQuickViewStore((s) => s.open);
  return (
    <div className="flex items-center gap-2.5">
      <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={campaign.type} />
      <div className="min-w-0 flex-1">
        <Link
          to={`/web-experiment/c/${campaign.id}`}
          className="block truncate text-sm font-medium text-foreground hover:underline"
        >
          {campaign.name}
        </Link>
        <div className="truncate text-xs text-muted-foreground">{campaign.url}</div>
      </div>
      {/* Hover-revealed row actions */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        {/* TODO: wire up Summarise with Wandz */}
        <button
          type="button"
          title="Summarise with Wandz"
          aria-label="Summarise with Wandz"
          className={ROW_ICON_BUTTON}
        >
          <Sparkles className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => openQuickView(campaign.id)}
          title="Quick view"
          aria-label="Quick view"
          className={ROW_ICON_BUTTON}
        >
          <PanelRight className="h-4 w-4" />
        </button>
        {hasReport(campaign.status) && (
          <Link
            to={`/web-experiment/c/${campaign.id}/reports`}
            title="Reports"
            aria-label="Reports"
            className={ROW_ICON_BUTTON}
          >
            <BarChart3 className="h-4 w-4" />
          </Link>
        )}
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button type="button" title="More" aria-label="More" className={ROW_ICON_BUTTON}>
              <EllipsisVertical className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
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
      return (
        <div className="flex items-center gap-2">
          <DecisionIcon decision={c.decision} />
          <span className="text-foreground">{c.decision}</span>
        </div>
      );
    case "vitals":
      return <VitalsIcon vitals={c.vitals} />;
    case "variations":
      return formatNumber(c.variations);
    case "visitors":
      return formatNumber(c.visitors);
    case "uniqueConversion":
      return formatNumber(c.uniqueConversions);
    case "createdOnBy":
      return (
        <div className="whitespace-nowrap">
          <div>{formatDate(c.createdOn)}</div>
          <div className="text-xs text-muted-foreground">by {c.createdBy}</div>
        </div>
      );
    case "startedOn":
      return <span className="whitespace-nowrap">{formatDate(c.startedOn)}</span>;
    case "expectedImprovement":
      return formatImprovement(c.expectedImprovement);
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
        <span className="text-muted-foreground">—</span>
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
      return <span className="whitespace-nowrap">{formatDate(c.lastUpdated)}</span>;
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
  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

const SELECT_BOX =
  "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-input bg-background data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=indeterminate]:border-foreground data-[state=indeterminate]:bg-foreground";

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
    <Checkbox.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={SELECT_BOX}
    >
      <Checkbox.Indicator>
        {checked === "indeterminate" ? (
          <Minus className="h-2.5 w-2.5 text-background" />
        ) : (
          <Check className="h-2.5 w-2.5 text-background" />
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

export default function CampaignTable() {
  const { search, page, pageSize, setPage, setPageSize } = useTableStore();
  const { filters, sort, groupBy, visibleColumns } = useActiveViewState();
  const activeViewId = useViewsStore((s) => s.activeViewId);
  const updateDraft = useViewsStore((s) => s.updateActiveViewDraft);
  const campaigns = useVisibleCampaigns();
  const archive = useRowsStore((s) => s.archive);
  const remove = useRowsStore((s) => s.remove);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Track horizontal scroll so the pinned name column can cast a shadow over the
  // scrolling content once scrollLeft > 0.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setIsScrolled(el.scrollLeft > 0);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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
  // checkbox column + the visible data columns (name is one of them).
  const totalColSpan = columns.length + 1;

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
      return <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-60" />;
    return sort.dir === "asc" ? (
      <ChevronUp className="h-3 w-3 shrink-0" />
    ) : (
      <ChevronDown className="h-3 w-3 shrink-0" />
    );
  };

  const hasSelection = selected.size > 0;

  const renderRow = (c: Campaign) => (
    <tr
      key={c.id}
      className="group border-b border-border last:border-b-0 hover:bg-muted"
    >
      <td className={cn("px-3 py-2.5 align-middle", STICKY_CHECKBOX_BODY)}>
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
            "px-3 py-2.5 align-middle",
            col.id === "name" && STICKY_NAME_BODY,
            col.id === "name" && "transition-shadow duration-150",
            col.id === "name" && isScrolled && SCROLL_SHADOW,
            col.align === "right" && "text-right tabular-nums"
          )}
        >
          {renderCell(c, col)}
        </td>
      ))}
    </tr>
  );

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            {hasSelection ? (
              <tr className="border-b border-border bg-muted/50">
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
                    <button
                      type="button"
                      onClick={doArchive}
                      className="inline-flex items-center gap-1.5 rounded-md border border-input px-2.5 py-1 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-input px-2.5 py-1 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Clear selection
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr className="border-b border-border">
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
                    style={col.width ? { minWidth: col.width } : undefined}
                    className={cn(
                      "whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted-foreground",
                      col.id === "name" && STICKY_NAME_HEAD,
                      col.id === "name" && "transition-shadow duration-150",
                      col.id === "name" && isScrolled && SCROLL_SHADOW,
                      col.align === "right" && "text-right"
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => setSort(col.id)}
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                          sort?.column === col.id && "text-foreground"
                        )}
                      >
                        {col.label}
                        {sortIcon(col)}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
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

      {/* Pagination — hidden entirely while grouped */}
      {!grouped && (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
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
      <tr className="border-b border-border bg-muted">
        <td colSpan={colSpan} className="px-3 py-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 text-sm"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium text-foreground">{group.key}</span>
            <span className="text-muted-foreground">({group.rows.length})</span>
          </button>
        </td>
      </tr>
      {!isCollapsed && group.rows.map(renderRow)}
    </>
  );
}
