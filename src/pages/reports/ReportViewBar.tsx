import { useState } from "react";
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
} from "../../store/reportViews";
import { cn } from "../../lib/utils";
import ReportViewSaveActions from "./ReportViewSaveActions";
import ReportViewSavedHint from "./ReportViewSavedHint";

const activeTabClass =
  "-mb-px border-b-2 border-foreground font-medium text-foreground";

function DirtyDot() {
  return (
    <span
      aria-hidden
      className="absolute -right-2.5 top-[0.55rem] h-1.5 w-1.5 rounded-full bg-muted-foreground"
    />
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

  const dirtyForViewKey = (key: string) =>
    Boolean(columnDrafts?.[key]);

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };
  const commitRename = () => {
    if (renamingId) renameCustomView(campaignId, renamingId, renameValue);
    setRenamingId(null);
  };

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <>
      <div className="mb-0 flex min-h-[36px] items-end justify-between gap-4 border-b border-border">
        <div className="flex min-w-0 flex-1 items-end gap-5 overflow-x-auto">
          {REPORT_PRESET_TABS.map((tab) => {
            const active =
              activePresetId === tab.id && activeCustomViewId === null;
            const presetKey = `preset:${tab.id}`;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePreset(campaignId, tab.id as ReportPresetId)}
                className={cn(
                  "relative shrink-0 px-1 pb-2 text-sm transition-colors",
                  active
                    ? activeTabClass
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                {tab.label}
                {active && dirtyForViewKey(presetKey) ? <DirtyDot /> : null}
              </button>
            );
          })}

          {customViews.map((view, index) => {
            const active = view.id === activeCustomViewId;
            const renaming = renamingId === view.id;
            return (
              <div
                key={view.id}
                draggable={!renaming}
                onDragStart={(e) => {
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  setOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && overIndex !== null) {
                    reorderCustomViews(campaignId, dragIndex, overIndex);
                  }
                  endDrag();
                }}
                onDragEnd={endDrag}
                className={cn(
                  "group relative -mb-px flex shrink-0 items-center border-b-2 transition-colors",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-foreground/70 hover:text-foreground"
                )}
              >
                {dragIndex !== null && overIndex === index && (
                  <span className="pointer-events-none absolute inset-y-1 left-0 w-0.5 bg-foreground" />
                )}
                {renaming ? (
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
                    onClick={() => setActiveCustomView(campaignId, view.id)}
                    className="relative flex items-center py-2 pl-1 pr-1 text-sm"
                  >
                    {view.name}
                    {active && dirtyForViewKey(view.id) ? <DirtyDot /> : null}
                  </button>
                )}

                {!renaming && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${view.name} options`}
                        className={cn(
                          "mr-0.5 h-auto w-auto p-1 text-muted-foreground hover:text-foreground focus-visible:opacity-100 [&_svg]:size-3.5",
                          active
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
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
                          onSelect={() => startRename(view.id, view.name)}
                          className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                        >
                          Rename
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => setDeleteId(view.id)}
                          className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                        >
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>
            );
          })}
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
