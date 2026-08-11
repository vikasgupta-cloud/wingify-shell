import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  REPORT_PRESET_TABS,
  type ReportPresetId,
  useActiveCustomViewId,
  useActiveReportPresetId,
  useIsReportViewDirty,
  useReportCampaignSlice,
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

function ViewMenu({
  label,
  active,
  onEdit,
  onRename,
  onDelete,
  deleteDisabled,
}: {
  label: string;
  active: boolean;
  onEdit: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`${label} options`}
          className={cn(
            "h-auto w-auto shrink-0 p-1 text-muted-foreground hover:text-foreground focus-visible:opacity-100 [&_svg]:size-3.5",
            active ? "opacity-100" : "opacity-70 hover:opacity-100"
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
            onSelect={onEdit}
            className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
          >
            Edit
          </DropdownMenu.Item>
          {onRename ? (
            <DropdownMenu.Item
              onSelect={onRename}
              className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
            >
              Rename
            </DropdownMenu.Item>
          ) : null}
          {onDelete ? (
            <DropdownMenu.Item
              disabled={deleteDisabled}
              onSelect={onDelete}
              className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-accent"
            >
              Delete
            </DropdownMenu.Item>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default function ReportViewBar({
  campaignId,
  trailing,
}: {
  campaignId: string;
  /** Optional control on the tab row (e.g. Group by). */
  trailing?: ReactNode;
}) {
  const activePresetId = useActiveReportPresetId(campaignId);
  const activeCustomViewId = useActiveCustomViewId(campaignId);
  const customViews = useReportCustomViews(campaignId);
  const campaignSlice = useReportCampaignSlice(campaignId);
  const setActivePreset = useReportViewsStore((s) => s.setActivePreset);
  const setActiveCustomView = useReportViewsStore((s) => s.setActiveCustomView);
  const renameCustomView = useReportViewsStore((s) => s.renameCustomView);
  const deleteCustomView = useReportViewsStore((s) => s.deleteCustomView);
  const renamePreset = useReportViewsStore((s) => s.renamePreset);
  const deletePreset = useReportViewsStore((s) => s.deletePreset);
  const reorderCustomViews = useReportViewsStore((s) => s.reorderCustomViews);
  const requestOpenViewSettings = useReportViewsStore(
    (s) => s.requestOpenViewSettings
  );
  const columnDrafts = useReportViewsStore(
    (s) => s.draftsByCampaign[campaignId]
  );
  const isDirty = useIsReportViewDirty(campaignId);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "custom"; id: string; name: string }
    | { kind: "preset"; id: ReportPresetId; name: string }
    | null
  >(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    REPORT_PRESET_TABS.length
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const moreCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLSpanElement>(null);

  const openMore = () => {
    if (moreCloseTimer.current) {
      clearTimeout(moreCloseTimer.current);
      moreCloseTimer.current = null;
    }
    setMoreOpen(true);
  };

  const scheduleCloseMore = () => {
    if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current);
    moreCloseTimer.current = setTimeout(() => setMoreOpen(false), 120);
  };

  const dirtyForViewKey = (key: string) => Boolean(columnDrafts?.[key]);

  const items: TabItem[] = useMemo(() => {
    const presets = REPORT_PRESET_TABS.filter(
      (tab) => !campaignSlice.hiddenPresetIds.includes(tab.id)
    ).map((tab) => ({
      kind: "preset" as const,
      key: `preset:${tab.id}`,
      id: tab.id as ReportPresetId,
      label: campaignSlice.presetLabels[tab.id] ?? tab.label,
    }));
    return [
      ...presets,
      ...customViews.map((view, index) => ({
        kind: "custom" as const,
        key: view.id,
        id: view.id,
        label: view.name,
        view,
        index,
      })),
    ];
  }, [
    customViews,
    campaignSlice.hiddenPresetIds,
    campaignSlice.presetLabels,
  ]);

  const canDeleteTab = items.length > 1;

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };
  const commitRename = () => {
    if (renamingId) {
      if (renamingId.startsWith("preset:")) {
        const presetId = renamingId.slice("preset:".length) as ReportPresetId;
        renamePreset(campaignId, presetId, renameValue);
      } else {
        renameCustomView(campaignId, renamingId, renameValue);
      }
    }
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
      const widths = tabEls.map((el) => el.offsetWidth);

      if (widths.length === 0) {
        setVisibleCount(0);
        return;
      }

      const tabsTotal =
        widths.reduce((sum, w) => sum + w, 0) +
        TAB_GAP_PX * Math.max(0, widths.length - 1);

      if (tabsTotal <= available) {
        setVisibleCount(widths.length);
        return;
      }

      // Overflowing — reserve More.
      const budget = Math.max(0, available - moreWidth - TAB_GAP_PX);
      let used = 0;
      let count = 0;
      for (let i = 0; i < widths.length; i++) {
        const next = used + (count > 0 ? TAB_GAP_PX : 0) + widths[i]!;
        if (next > budget) break;
        used = next;
        count += 1;
      }
      setVisibleCount(Math.max(1, Math.min(count, widths.length - 1)));
    };

    const ro = new ResizeObserver(sync);
    ro.observe(container);
    sync();
    return () => {
      ro.disconnect();
      if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current);
    };
  }, [items, renamingId, renameValue]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const showMore = overflowItems.length > 0;
  const moreActive = overflowItems.some(isItemActive);
  const renamingInOverflow =
    renamingId !== null &&
    overflowItems.some((item) => item.key === renamingId);

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
          <ViewMenu
            label={view.name}
            active={active}
            onEdit={() => {
              setActiveCustomView(campaignId, view.id);
              requestOpenViewSettings();
            }}
            onRename={() => startRename(view.id, view.name)}
            onDelete={() =>
              setDeleteTarget({
                kind: "custom",
                id: view.id,
                name: view.name,
              })
            }
            deleteDisabled={!canDeleteTab}
          />
        )}
        {!renaming && opts.measuring && (
          <span className="inline-flex p-1 opacity-0" aria-hidden>
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
    const renaming = renamingId === item.key;
    return (
      <div
        key={item.key}
        className={cn(
          "group relative -mb-px flex shrink-0 items-center border-b-2 transition-colors",
          active
            ? "border-foreground text-foreground"
            : "border-transparent text-foreground/70 hover:text-foreground"
        )}
      >
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
                : () => setActivePreset(campaignId, item.id)
            }
            className="relative flex items-center py-2 pl-1 pr-1 text-sm"
          >
            {item.label}
            {active && dirtyForViewKey(item.key) ? <DirtyDot /> : null}
          </button>
        )}
        {!renaming && !opts.measuring ? (
          <ViewMenu
            label={item.label}
            active={active}
            onEdit={() => {
              setActivePreset(campaignId, item.id);
              requestOpenViewSettings();
            }}
            onRename={() => startRename(item.key, item.label)}
            onDelete={() =>
              setDeleteTarget({
                kind: "preset",
                id: item.id,
                name: item.label,
              })
            }
            deleteDisabled={!canDeleteTab}
          />
        ) : null}
        {!renaming && opts.measuring && (
          <span className="inline-flex p-1 opacity-0" aria-hidden>
            <MoreVertical className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    );
  };

  const renderTab = (item: TabItem, opts?: { measuring?: boolean }) =>
    item.kind === "preset"
      ? renderPresetTab(item, opts)
      : renderCustomTab(item, opts);

  return (
    <>
      <div className="mb-0 flex min-h-[36px] items-end justify-between gap-4">
        <div ref={containerRef} className="relative min-w-0 flex-1 overflow-visible">
          {/* Offscreen measure row — same tab chrome, used only for widths */}
          <div
            ref={measureRef}
            aria-hidden
            className="pointer-events-none invisible absolute left-0 top-0 flex w-max items-end gap-5"
          >
            {items.map((item) => renderTab(item, { measuring: true }))}
            <span ref={moreMeasureRef} className="shrink-0 px-1 pb-2 text-sm">
              More
            </span>
          </div>

          <div className="flex min-w-0 items-end gap-5 overflow-visible">
            {visibleItems.map((item) => renderTab(item))}
            {showMore ? (
              <Popover
                open={moreOpen || renamingInOverflow}
                onOpenChange={(open) => {
                  if (!open && renamingInOverflow) return;
                  setMoreOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onMouseEnter={openMore}
                    onMouseLeave={scheduleCloseMore}
                    className={cn(
                      "relative shrink-0 px-1 pb-2 text-sm transition-colors",
                      moreActive
                        ? activeTabClass
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    More
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  onMouseEnter={openMore}
                  onMouseLeave={() => {
                    if (!renamingInOverflow) scheduleCloseMore();
                  }}
                  className="w-auto min-w-[200px] p-1"
                >
                  {overflowItems.map((item) => {
                    const active = isItemActive(item);
                    if (item.kind === "preset") {
                      if (renamingId === item.key) {
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
                                if (e.key === "Escape") {
                                  setRenamingId(null);
                                  setMoreOpen(false);
                                }
                              }}
                              className="w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none"
                            />
                          </div>
                        );
                      }
                      return (
                        <div
                          key={item.key}
                          className="flex items-center gap-1 rounded-sm hover:bg-accent"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActivePreset(campaignId, item.id);
                              setMoreOpen(false);
                            }}
                            className={cn(
                              "relative min-w-0 flex-1 truncate px-3 py-2 text-left text-sm",
                              active
                                ? "font-medium text-foreground"
                                : "text-foreground/80"
                            )}
                          >
                            {item.label}
                            {active && dirtyForViewKey(item.key) ? (
                              <span
                                aria-hidden
                                className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground align-middle"
                              />
                            ) : null}
                          </button>
                          <ViewMenu
                            label={item.label}
                            active
                            onEdit={() => {
                              setActivePreset(campaignId, item.id);
                              setMoreOpen(false);
                              requestOpenViewSettings();
                            }}
                            onRename={() => startRename(item.key, item.label)}
                            onDelete={() =>
                              setDeleteTarget({
                                kind: "preset",
                                id: item.id,
                                name: item.label,
                              })
                            }
                            deleteDisabled={!canDeleteTab}
                          />
                        </div>
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
                              if (e.key === "Escape") {
                                setRenamingId(null);
                                setMoreOpen(false);
                              }
                            }}
                            className="w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none"
                          />
                        </div>
                      );
                    }
                    return (
                      <div
                        key={item.key}
                        className="group flex items-center gap-1 rounded-sm hover:bg-accent"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCustomView(campaignId, item.id);
                            setMoreOpen(false);
                          }}
                          className={cn(
                            "relative min-w-0 flex-1 truncate px-3 py-2 text-left text-sm",
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
                        <ViewMenu
                          label={item.view.name}
                          active
                          onEdit={() => {
                            setActiveCustomView(campaignId, item.id);
                            setMoreOpen(false);
                            requestOpenViewSettings();
                          }}
                          onRename={() =>
                            startRename(item.view.id, item.view.name)
                          }
                          onDelete={() =>
                            setDeleteTarget({
                              kind: "custom",
                              id: item.view.id,
                              name: item.view.name,
                            })
                          }
                          deleteDisabled={!canDeleteTab}
                        />
                      </div>
                    );
                  })}
                </PopoverContent>
              </Popover>
            ) : null}
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center justify-end gap-3 self-end pb-2">
          {isDirty ? (
            <div className="flex h-7 items-center justify-end">
              <ReportViewSaveActions campaignId={campaignId} />
            </div>
          ) : (
            <ReportViewSavedHint campaignId={campaignId} />
          )}
          {trailing ? (
            <div className="flex items-center gap-2">{trailing}</div>
          ) : null}
        </div>
      </div>

      <AlertDialog.Root
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <AlertDialog.Title className="text-sm font-medium text-foreground">
              Delete view?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              “{deleteTarget?.name}” will be removed from this campaign.
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
                    if (deleteTarget?.kind === "custom") {
                      deleteCustomView(campaignId, deleteTarget.id);
                    } else if (deleteTarget?.kind === "preset") {
                      deletePreset(campaignId, deleteTarget.id);
                    }
                    setDeleteTarget(null);
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
