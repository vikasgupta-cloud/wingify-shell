import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Bookmark, GripVertical, Plus, Trash2, X } from "lucide-react";
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

export default function SavedFilterBar({
  campaignId,
}: {
  campaignId: string;
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
  const [manageOpen, setManageOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const hasSaved = savedFilters.length > 0;
  const activeFilter = savedFilters.find((f) => f.id === activeId);
  const onSaved = Boolean(activeFilter);

  if (!hasSaved && !isDirty) return null;

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
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
      <div className="flex min-h-10 flex-wrap items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <Bookmark className="h-4 w-4 shrink-0" aria-hidden />
          <span className="font-medium text-foreground">Saved filter</span>
        </div>

        <div className="hidden h-5 w-px shrink-0 bg-border sm:block" aria-hidden />

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {savedFilters.map((filter, index) => {
            const active = filter.id === activeId;
            const renaming = renamingId === filter.id;
            const showDirty = active && isDirty;
            return (
              <div
                key={filter.id}
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
                    reorderSavedFilters(campaignId, dragIndex, overIndex);
                  }
                  endDrag();
                }}
                onDragEnd={endDrag}
                className={cn(
                  "group relative inline-flex max-w-full items-center rounded-full border text-sm transition-colors",
                  active
                    ? "border-foreground bg-background font-medium text-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted/60"
                )}
              >
                {dragIndex !== null && overIndex === index && (
                  <span className="pointer-events-none absolute inset-y-1 left-0 w-0.5 rounded-full bg-foreground" />
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
                    className="my-0.5 ml-3 mr-1 max-w-[180px] border-0 bg-transparent p-0 text-sm text-foreground outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => applySavedFilter(campaignId, filter.id)}
                    className="inline-flex max-w-[200px] items-center truncate px-3 py-1"
                  >
                    <span className="truncate">{filter.name}</span>
                    {showDirty ? <DirtyDot /> : null}
                  </button>
                )}
              </div>
            );
          })}

          {isDirty ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground"
                onClick={() => discard(campaignId)}
              >
                Discard
              </Button>
              {onSaved ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 font-medium text-foreground"
                    onClick={() => saveActive(campaignId)}
                  >
                    Save “{activeFilter?.name}”
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 font-medium text-foreground"
                    onClick={openSaveAs}
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Save as new filter
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 font-medium text-foreground"
                  onClick={openSaveAs}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Save current filter
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {hasSaved ? (
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            className="shrink-0 text-sm font-medium text-foreground underline-offset-2 hover:underline"
          >
            Manage filters
          </button>
        ) : null}
      </div>

      <Dialog.Root open={manageOpen} onOpenChange={setManageOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[440px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-sm font-medium text-foreground">
                  Manage saved filters
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  Rename, reorder, or delete saved filters. Each one stores your
                  filters and selected metric.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <ul className="mt-4 max-h-[320px] space-y-1 overflow-y-auto">
              {savedFilters.map((filter, index) => {
                const renaming = renamingId === filter.id;
                return (
                  <li
                    key={filter.id}
                    onDragOver={(e) => {
                      if (dragIndex === null) return;
                      e.preventDefault();
                      setOverIndex(index);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null) {
                        reorderSavedFilters(campaignId, dragIndex, index);
                      }
                      endDrag();
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border border-border px-2 py-2",
                      dragIndex !== null &&
                        overIndex === index &&
                        "border-foreground"
                    )}
                  >
                    <button
                      type="button"
                      draggable={!renaming}
                      aria-label={`Reorder ${filter.name}`}
                      title="Drag to reorder"
                      onDragStart={(e) => {
                        setDragIndex(index);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", filter.id);
                      }}
                      onDragEnd={endDrag}
                      className="inline-flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        applySavedFilter(campaignId, filter.id);
                        setManageOpen(false);
                      }}
                      className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground"
                    >
                      {renaming ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                        />
                      ) : (
                        filter.name
                      )}
                    </button>
                    {!renaming ? (
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => startRename(filter.id, filter.name)}
                        >
                          Rename
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          aria-label={`Delete ${filter.name}`}
                          onClick={() => setDeleteId(filter.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
