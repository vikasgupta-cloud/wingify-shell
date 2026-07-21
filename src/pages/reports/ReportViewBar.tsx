import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  REPORT_PRESET_TABS,
  type ReportPresetId,
  useActiveCustomViewId,
  useActiveReportPresetId,
  useIsReportViewDirty,
  useReportCustomViews,
  useReportViewsStore,
  type ReportCustomView,
} from "../../store/reportViews";
import { cn } from "../../lib/utils";
import ReportViewSaveActions from "./ReportViewSaveActions";
import ReportViewSavedHint from "./ReportViewSavedHint";

const activeTabClass =
  "-mb-px border-b-2 border-foreground font-medium text-foreground";

const TAB_GAP_PX = 20; // gap-5

type TabItem =
  | { kind: "preset"; key: string; id: ReportPresetId; label: string }
  | {
      kind: "custom";
      key: string;
      id: string;
      label: string;
      view: ReportCustomView;
      index: number;
    };

function DirtyDot() {
  return (
    <span
      aria-hidden
      className="absolute -right-2.5 top-[0.55rem] h-1.5 w-1.5 rounded-full bg-muted-foreground"
    />
  );
}

function CustomViewMenu({
  view,
  active,
  onRename,
  onDelete,
}: {
  view: ReportCustomView;
  active: boolean;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${view.name} options`}
          className={cn(
            "mr-0.5 h-auto w-auto p-1 text-muted-foreground hover:text-foreground focus-visible:opacity-100 [&_svg]:size-3.5",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[140px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
        >
          <DropdownMenu.Item
            onSelect={onRename}
            className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
          >
            Rename
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={onDelete}
            className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
          >
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function ReportViewBar({ campaignId }: { campaignId: string }) {
  const activePresetId = useActiveReportPresetId(campaignId);
  const activeCustomViewId = useActiveCustomViewId(campaignId);
  const customViews = useReportCustomViews(campaignId);
  const setActivePreset = useReportViewsStore((s) => s.setActivePreset);
  const setActiveCustomView = useReportViewsStore((s) => s.setActiveCustomView);
  const renameCustomView = useReportViewsStore((s) => s.renameCustomView);
  const deleteCustomView = useReportViewsStore((s) => s.deleteCustomView);
  const reorderCustomViews = useReportViewsStore((s) => s.reorderCustomViews);
  const columnDrafts = useReportViewsStore(
    (s) => s.draftsByCampaign[campaignId]
  );
  const isDirty = useIsReportViewDirty(campaignId);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    REPORT_PRESET_TABS.length
  );
  const [moreOpen, setMoreOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLSpanElement>(null);

  const dirtyForViewKey = (key: string) => Boolean(columnDrafts?.[key]);

  const items: TabItem[] = useMemo(
    () => [
      ...REPORT_PRESET_TABS.map((tab) => ({
        kind: "preset" as const,
        key: `preset:${tab.id}`,
        id: tab.id as ReportPresetId,
        label: tab.label,
      })),
      ...customViews.map((view, index) => ({
        kind: "custom" as const,
        key: view.id,
        id: view.id,
        label: view.name,
        view,
        index,
      })),
    ],
    [customViews]
  );

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };
  const commitRename = () => {
    if (renamingId) renameCustomView(campaignId, renamingId, renameValue);
    setRenamingId(null);
    setMoreOpen(false);
  };

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const isItemActive = (item: TabItem) =>
    item.kind === "preset"
      ? activePresetId === item.id && activeCustomViewId === null
      : item.id === activeCustomViewId;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measureRow = measureRef.current;
    if (!container || !measureRow) return;

    const sync = () => {
      const available = container.clientWidth;
      const moreWidth = moreMeasureRef.current?.offsetWidth ?? 40;
      const children = Array.from(measureRow.children) as HTMLElement[];
      // Last child is the More measure span.
      const tabEls = children.slice(0, -1);
      const widths = tabEls.map((el) => el.getBoundingClientRect().width);

      if (widths.length === 0) {
        setVisibleCount(0);
        return;
      }

      const total =
        widths.reduce((sum, w) => sum + w, 0) +
        TAB_GAP_PX * Math.max(0, widths.length - 1);

      if (total <= available) {
        setVisibleCount(widths.length);
        return;
      }

      const budget = available - moreWidth - TAB_GAP_PX;
      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = used + (count > 0 ? TAB_GAP_PX : 0) + widths[i]!;
        if (next > budget) break;
        used = next;
        count += 1;
      }
      setVisibleCount(Math.max(1, count));
    };

    const ro = new ResizeObserver(sync);
    ro.observe(container);
    ro.observe(measureRow);
    sync();
    return () => ro.disconnect();
  }, [items, renamingId, renameValue]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const showMore = overflowItems.length > 0;
  const moreActive = overflowItems.some(isItemActive);
  const renamingInOverflow =
    renamingId !== null &&
    overflowItems.some((item) => item.kind === "custom" && item.id === renamingId);
  const moreVisible = moreOpen || renamingInOverflow;

  const renderCustomTab = (
    item: Extract<TabItem, { kind: "custom" }>,
    opts: { measuring?: boolean } = {}
  ) => {
    const { view, index } = item;
    const active = isItemActive(item);
    const renaming = renamingId === view.id;

    return (
      <div
        key={item.key}
        draggable={!renaming && !opts.measuring}
        onDragStart={
          opts.measuring
            ? undefined
            : (e) => {
                setDragIndex(index);
                e.dataTransfer.effectAllowed = "move";
              }
        }
        onDragOver={
          opts.measuring
            ? undefined
            : (e) => {
                if (dragIndex === null) return;
                e.preventDefault();
                setOverIndex(index);
              }
        }
        onDrop={
          opts.measuring
            ? undefined
            : (e) => {
                e.preventDefault();
                if (dragIndex !== null && overIndex !== null) {
                  reorderCustomViews(campaignId, dragIndex, overIndex);
                }
                endDrag();
              }
        }
        onDragEnd={opts.measuring ? undefined : endDrag}
        className={cn(
          "group relative -mb-px flex shrink-0 items-center border-b-2 transition-colors",
          active
            ? "border-foreground text-foreground"
            : "border-transparent text-foreground/70 hover:text-foreground"
        )}
      >
        {!opts.measuring && dragIndex !== null && overIndex === index && (
          <span className="pointer-events-none absolute inset-y-1 left-0 w-0.5 bg-foreground" />
        )}
        {renaming && !opts.measuring ? (
          <input
            autoFocus
            value={renameValue}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setRenamingId(null);
            }}
            size={Math.max(renameValue.length, 4)}
            className="my-1 ml-1 border-0 bg-transparent p-0 text-sm text-foreground outline-none"
          />
        ) : (
          <button
            type="button"
            tabIndex={opts.measuring ? -1 : undefined}
            onClick={
              opts.measuring
                ? undefined
                : () => setActiveCustomView(campaignId, view.id)
            }
            className="relative flex items-center py-2 pl-1 pr-1 text-sm"
          >
            {view.name}
            {active && dirtyForViewKey(view.id) ? <DirtyDot /> : null}
          </button>
        )}

        {!renaming && !opts.measuring && (
          <CustomViewMenu
            view={view}
            active={active}
            onRename={() => startRename(view.id, view.name)}
            onDelete={() => setDeleteId(view.id)}
          />
        )}
        {!renaming && opts.measuring && (
          <span className="mr-0.5 inline-flex p-1 opacity-0" aria-hidden>
            <MoreVertical className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    );
  };

  const renderPresetTab = (
    item: Extract<TabItem, { kind: "preset" }>,
    opts: { measuring?: boolean } = {}
  ) => {
    const active = isItemActive(item);
    return (
      <button
        key={item.key}
        type="button"
        tabIndex={opts.measuring ? -1 : undefined}
        onClick={
          opts.measuring
            ? undefined
            : () => setActivePreset(campaignId, item.id)
        }
        className={cn(
          "relative shrink-0 px-1 pb-2 text-sm transition-colors",
          active
            ? activeTabClass
            : "text-foreground/70 hover:text-foreground"
        )}
      >
        {item.label}
        {active && dirtyForViewKey(item.key) ? <DirtyDot /> : null}
      </button>
    );
  };

  const renderTab = (item: TabItem, opts?: { measuring?: boolean }) =>
    item.kind === "preset"
      ? renderPresetTab(item, opts)
      : renderCustomTab(item, opts);

  let moreMenu: ReactNode = null;
  if (showMore) {
    moreMenu = (
      <div
        className="relative shrink-0"
        onMouseEnter={() => setMoreOpen(true)}
        onMouseLeave={() => {
          if (!renamingInOverflow) setMoreOpen(false);
        }}
      >
        <button
          type="button"
          className={cn(
            "relative px-1 pb-2 text-sm transition-colors",
            moreActive
              ? activeTabClass
              : "text-foreground/70 hover:text-foreground"
          )}
        >
          More
        </button>
        <div
          className={cn(
            "absolute left-0 top-full z-50 pt-1 transition-opacity",
            moreVisible
              ? "pointer-events-auto visible opacity-100"
              : "pointer-events-none invisible opacity-0"
          )}
        >
          <div className="min-w-[200px] rounded-md border border-border bg-popover py-1 shadow-lg">
            {overflowItems.map((item) => {
              const active = isItemActive(item);
              if (item.kind === "preset") {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActivePreset(campaignId, item.id)}
                    className={cn(
                      "relative flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                      active
                        ? "font-medium text-foreground"
                        : "text-foreground/80"
                    )}
                  >
                    {item.label}
                    {active && dirtyForViewKey(item.key) ? (
                      <span
                        aria-hidden
                        className="ml-2 h-1.5 w-1.5 rounded-full bg-muted-foreground"
                      />
                    ) : null}
                  </button>
                );
              }
              if (renamingId === item.view.id) {
                return (
                  <div key={item.key} className="px-3 py-1.5">
                    <input
                      autoFocus
                      value={renameValue}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none"
                    />
                  </div>
                );
              }
              return (
                <div
                  key={item.key}
                  className="group flex items-center gap-1 px-1 hover:bg-accent"
                >
                  <button
                    type="button"
                    onClick={() => setActiveCustomView(campaignId, item.id)}
                    className={cn(
                      "relative min-w-0 flex-1 truncate px-2 py-2 text-left text-sm",
                      active
                        ? "font-medium text-foreground"
                        : "text-foreground/80"
                    )}
                  >
                    {item.label}
                    {active && dirtyForViewKey(item.id) ? (
                      <span
                        aria-hidden
                        className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground align-middle"
                      />
                    ) : null}
                  </button>
                  <CustomViewMenu
                    view={item.view}
                    active
                    onRename={() => startRename(item.view.id, item.view.name)}
                    onDelete={() => setDeleteId(item.view.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-0 flex min-h-[36px] items-end justify-between gap-4 border-b border-border">
        <div ref={containerRef} className="relative min-w-0 flex-1">
          {/* Offscreen measure row — same tab chrome, used only for widths */}
          <div
            ref={measureRef}
            aria-hidden
            className="pointer-events-none absolute flex items-end gap-5 opacity-0"
            style={{ left: -9999, top: 0 }}
          >
            {items.map((item) => renderTab(item, { measuring: true }))}
            <span ref={moreMeasureRef} className="shrink-0 px-1 pb-2 text-sm">
              More
            </span>
          </div>

          <div className="flex min-w-0 items-end gap-5 overflow-hidden">
            {visibleItems.map((item) => renderTab(item))}
            {moreMenu}
          </div>
        </div>
        <div className="flex h-9 min-w-[11.5rem] shrink-0 items-center justify-end self-end">
          {isDirty ? (
            <ReportViewSaveActions campaignId={campaignId} />
          ) : (
            <ReportViewSavedHint campaignId={campaignId} />
          )}
        </div>
      </div>

      <AlertDialog.Root
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <AlertDialog.Title className="text-sm font-medium text-foreground">
              Delete view?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              “{customViews.find((v) => v.id === deleteId)?.name}” will be removed.
              This can&apos;t be undone.
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button type="button" variant="outline" size="sm">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (deleteId) deleteCustomView(campaignId, deleteId);
                    setDeleteId(null);
                  }}
                >
                  Delete
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
