import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  REPORT_BASE_STATE,
  REPORT_BASE_VIEW_ID,
  isReportViewDirty,
  useIsReportViewDirty,
  useReportCampaignSlice,
  useReportViewsStore,
} from "../../store/reportViews";
import { cn } from "../../lib/utils";

function DirtyDot() {
  return (
    <span
      aria-hidden
      className="ml-1.5 inline-block h-1.5 w-1.5 animate-scale-in rounded-full bg-muted-foreground duration-150"
    />
  );
}

export default function ReportViewBar({ campaignId }: { campaignId: string }) {
  const { views, activeViewId } = useReportCampaignSlice(campaignId);
  const drafts = useReportViewsStore((s) => s.drafts);
  const setActiveView = useReportViewsStore((s) => s.setActiveView);
  const renameView = useReportViewsStore((s) => s.renameView);
  const deleteView = useReportViewsStore((s) => s.deleteView);
  const reorderViews = useReportViewsStore((s) => s.reorderViews);
  const isDirty = useIsReportViewDirty(campaignId);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const hasStrip = views.length > 0;

  if (!hasStrip && !isDirty) return null;

  const dirtyFor = (id: string) => {
    const draft = drafts[`${campaignId}::${id}`];
    if (!draft) return false;
    const saved =
      id === REPORT_BASE_VIEW_ID
        ? REPORT_BASE_STATE
        : views.find((v) => v.id === id)?.state ?? REPORT_BASE_STATE;
    return isReportViewDirty(draft, saved);
  };

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };
  const commitRename = () => {
    if (renamingId) renameView(campaignId, renamingId, renameValue);
    setRenamingId(null);
  };

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <>
      <div
        className={cn(
          "mb-3 flex min-h-[36px] items-end justify-between gap-4",
          hasStrip && "border-b border-border"
        )}
      >
        {hasStrip ? (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setActiveView(campaignId, REPORT_BASE_VIEW_ID)}
              className={cn(
                "-mb-px flex items-center border-b-2 px-3 py-2 text-sm transition-colors",
                activeViewId === REPORT_BASE_VIEW_ID
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Default
              {dirtyFor(REPORT_BASE_VIEW_ID) && <DirtyDot />}
            </button>

            {views.map((view, index) => {
              const active = view.id === activeViewId;
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
                    if (dragIndex !== null && overIndex !== null)
                      reorderViews(campaignId, dragIndex, overIndex);
                    endDrag();
                  }}
                  onDragEnd={endDrag}
                  className={cn(
                    "group relative -mb-px flex items-center border-b-2 transition-colors",
                    active
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
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
                      className="my-1 ml-3 border-0 bg-transparent p-0 text-sm text-foreground outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveView(campaignId, view.id)}
                      className="flex items-center py-2 pl-3 pr-1 text-sm"
                    >
                      {view.name}
                      {dirtyFor(view.id) && <DirtyDot />}
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
                            "mr-1.5 h-auto w-auto p-1 text-muted-foreground hover:text-foreground focus-visible:opacity-100 [&_svg]:size-3.5",
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
        ) : (
          <div />
        )}
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
              “{views.find((v) => v.id === deleteId)?.name}” will be removed. This
              can't be undone.
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
                    if (deleteId) deleteView(campaignId, deleteId);
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
