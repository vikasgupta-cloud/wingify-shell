import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bookmark, GripVertical, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useActiveSavedFilterId,
  useIsSavedFilterDirty,
  useReportSavedFilters,
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

const KEBAB_BASE =
  "h-auto w-auto overflow-hidden p-0 text-muted-foreground transition-[width,padding,margin,opacity] hover:text-foreground focus-visible:opacity-100 [&_svg]:size-3.5";
const MENU_CONTENT =
  "z-50 min-w-[160px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg";
const MENU_ITEM =
  "cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent";

export default function SavedFilterBarClassic({
  campaignId,
  embedded,
}: {
  campaignId: string;
  /** When true, renders as a row inside another card (no outer chrome). */
  embedded?: boolean;
}) {
  const savedFilters = useReportSavedFilters(campaignId);
  const activeId = useActiveSavedFilterId(campaignId);
  const isDirty = useIsSavedFilterDirty(campaignId);
  const applySavedFilter = useReportViewsStore((s) => s.applySavedFilter);
  const saveActive = useReportViewsStore((s) => s.saveActiveSavedFilter);
  const saveAsNew = useReportViewsStore((s) => s.saveAsNewSavedFilter);
  const discard = useReportViewsStore((s) => s.discardSavedFilterChanges);
  const renameSavedFilter = useReportViewsStore((s) => s.renameSavedFilter);
  const deleteSavedFilter = useReportViewsStore((s) => s.deleteSavedFilter);
  const reorderSavedFilters = useReportViewsStore((s) => s.reorderSavedFilters);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState("New saved filter");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [rearranging, setRearranging] = useState(false);

  const hasSaved = savedFilters.length > 0;
  const canRearrange = savedFilters.length > 1;
  const activeFilter = savedFilters.find((f) => f.id === activeId);
  const onSaved = Boolean(activeFilter);

  if (!hasSaved && !isDirty) return null;

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };
  // Defer so the dropdown finishes closing and doesn't reclaim focus.
  const startRenameSoon = (id: string, name: string) => {
    window.setTimeout(() => startRename(id, name), 0);
  };
  const commitRename = () => {
    if (renamingId) renameSavedFilter(campaignId, renamingId, renameValue);
    setRenamingId(null);
  };

  const openSaveAs = () => {
    setSaveAsName(`Saved filter ${savedFilters.length + 1}`);
    setSaveAsOpen(true);
  };
  const submitSaveAs = () => {
    saveAsNew(campaignId, saveAsName.trim() || "New saved filter");
    setSaveAsOpen(false);
  };

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <>
      <div
        className={cn(
          "flex h-10 flex-wrap items-center gap-2.5",
          embedded
            ? "border-b border-surface-border bg-muted/40 px-5"
            : "rounded-lg border border-border bg-muted/40 px-3"
        )}
      >
        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          <Bookmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Saved filter</span>
        </div>

        <div className="hidden h-5 w-px shrink-0 bg-border sm:block" aria-hidden />

        <div
          className={cn(
            "flex min-w-0 flex-wrap items-center gap-2",
            (isDirty || rearranging) && "flex-1"
          )}
        >
          {savedFilters.map((filter, index) => {
            const active = filter.id === activeId;
            const renaming = renamingId === filter.id;
            const showDirty = active && isDirty;
            const menuOpen = menuOpenId === filter.id;
            return (
              <div
                key={filter.id}
                draggable={rearranging && !renaming}
                onDragStart={(e) => {
                  if (!rearranging) return;
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!rearranging || dragIndex === null) return;
                  e.preventDefault();
                  setOverIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (
                    rearranging &&
                    dragIndex !== null &&
                    overIndex !== null
                  ) {
                    reorderSavedFilters(campaignId, dragIndex, overIndex);
                  }
                  endDrag();
                }}
                onDragEnd={endDrag}
                className={cn(
                  "group relative inline-flex max-w-full items-center rounded-full border text-sm transition-colors",
                  rearranging && "cursor-grab active:cursor-grabbing",
                  active
                    ? "border-foreground bg-transparent font-medium text-foreground"
                    : "border-border bg-transparent text-foreground hover:bg-muted/50"
                )}
              >
                {dragIndex !== null && overIndex === index && (
                  <span className="pointer-events-none absolute inset-y-1 left-0 w-0.5 rounded-full bg-foreground" />
                )}
                {rearranging && !renaming ? (
                  <span
                    className="flex h-full items-center pl-2 text-muted-foreground"
                    aria-hidden
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </span>
                ) : null}
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
                    className="my-0.5 ml-3 mr-2 max-w-[180px] border-0 bg-transparent p-0 text-sm text-foreground outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (rearranging) return;
                      applySavedFilter(campaignId, filter.id);
                    }}
                    onDoubleClick={() => {
                      if (rearranging) return;
                      startRename(filter.id, filter.name);
                    }}
                    className={cn(
                      "inline-flex max-w-[180px] items-center truncate py-0.5 text-[13px] leading-5",
                      rearranging ? "pl-1.5 pr-2" : "px-2.5"
                    )}
                  >
                    <span className="truncate">{filter.name}</span>
                    {showDirty ? <DirtyDot /> : null}
                  </button>
                )}

                {!renaming && !rearranging ? (
                  <DropdownMenu.Root
                    open={menuOpen}
                    onOpenChange={(open) =>
                      setMenuOpenId(open ? filter.id : null)
                    }
                  >
                    <DropdownMenu.Trigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${filter.name} options`}
                        className={cn(
                          KEBAB_BASE,
                          menuOpen
                            ? "mr-1 w-auto p-1 opacity-100"
                            : "w-0 opacity-0 group-hover:mr-1 group-hover:w-auto group-hover:p-1 group-hover:opacity-100"
                        )}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5 shrink-0" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        sideOffset={4}
                        className={MENU_CONTENT}
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        <DropdownMenu.Item
                          onSelect={() =>
                            startRenameSoon(filter.id, filter.name)
                          }
                          className={MENU_ITEM}
                        >
                          Rename
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          disabled={!canRearrange}
                          onSelect={() => setRearranging(true)}
                          className={cn(
                            MENU_ITEM,
                            "data-[disabled]:cursor-default data-[disabled]:opacity-50"
                          )}
                        >
                          Rearrange
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => setDeleteId(filter.id)}
                          className={MENU_ITEM}
                        >
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                ) : null}
              </div>
            );
          })}
        </div>

        {rearranging || isDirty ? (
        <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
          {rearranging ? (
            <Button
              type="button"
              size="sm"
              className="h-7"
              onClick={() => {
                setRearranging(false);
                endDrag();
              }}
            >
              Done
            </Button>
          ) : null}
          {isDirty && !rearranging ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={() => discard(campaignId)}
              >
                Discard
              </Button>
              {onSaved ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button type="button" size="sm" className="h-7">
                      Save
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      sideOffset={4}
                      className="z-50 min-w-[220px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
                    >
                      <DropdownMenu.Item
                        onSelect={() => saveActive(campaignId)}
                        className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                      >
                        Save changes to “{activeFilter?.name}”
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onSelect={openSaveAs}
                        className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                      >
                        Save as new filter
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="h-7"
                  onClick={openSaveAs}
                >
                  Save
                </Button>
              )}
            </>
          ) : null}
        </div>
        ) : null}
      </div>

      <AlertDialog.Root
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <AlertDialog.Title className="text-sm font-medium text-foreground">
              Delete saved filter?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              “{savedFilters.find((f) => f.id === deleteId)?.name}” will be
              removed. This can&apos;t be undone.
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
                    if (deleteId) deleteSavedFilter(campaignId, deleteId);
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

      <Dialog.Root open={saveAsOpen} onOpenChange={setSaveAsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <Dialog.Title className="text-sm font-medium text-foreground">
              Save filter
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
              Saves your current filters and selected metric.
            </Dialog.Description>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSaveAs();
              }}
            >
              <label className="mt-4 block text-xs font-medium text-muted-foreground">
                Filter name
              </label>
              <input
                autoFocus
                value={saveAsName}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setSaveAsName(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />
              <div className="mt-5 flex justify-end gap-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
