import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BASE_STATE,
  BASE_VIEW_ID,
  isDirtyIgnoringLayout,
  useIsActiveViewDirty,
  useViewsStore,
} from "../../store/views";
import { cn } from "../../lib/utils";

function DirtyDot() {
  return (
    <span
      aria-hidden
      className="ml-1.5 inline-block h-1.5 w-1.5 animate-scale-in rounded-full bg-muted-foreground duration-150"
    />
  );
}

export default function ViewBar() {
  const views = useViewsStore((s) => s.views);
  const activeViewId = useViewsStore((s) => s.activeViewId);
  const drafts = useViewsStore((s) => s.drafts);
  const setActiveView = useViewsStore((s) => s.setActiveView);
  const saveDraftToActiveView = useViewsStore((s) => s.saveDraftToActiveView);
  const saveDraftAsNewView = useViewsStore((s) => s.saveDraftAsNewView);
  const discardActiveViewDraft = useViewsStore((s) => s.discardActiveViewDraft);
  const renameView = useViewsStore((s) => s.renameView);
  const deleteView = useViewsStore((s) => s.deleteView);
  const reorderViews = useViewsStore((s) => s.reorderViews);
  const isDirty = useIsActiveViewDirty();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState("New view");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const hasStrip = views.length > 0;
  const activeView = views.find((v) => v.id === activeViewId);

  // One row: tab strip left, Discard/Save right. Renders when either exists;
  // otherwise nothing at all, keeping the header→toolbar gap exactly 32px.
  if (!hasStrip && !isDirty) return null;

  const dirtyFor = (id: string) => {
    const draft = drafts[id];
    if (!draft) return false;
    const saved =
      id === BASE_VIEW_ID
        ? BASE_STATE
        : views.find((v) => v.id === id)?.state ?? BASE_STATE;
    return isDirtyIgnoringLayout(draft, saved);
  };

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };
  const commitRename = () => {
    if (renamingId) renameView(renamingId, renameValue);
    setRenamingId(null);
  };

  const openSaveAs = () => {
    setSaveAsName("New view");
    setSaveAsOpen(true);
  };
  const submitSaveAs = () => {
    saveDraftAsNewView(saveAsName);
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
          "mb-4 flex min-h-[36px] items-end justify-between gap-4",
          hasStrip && "border-b border-border"
        )}
      >
        {/* A) TAB STRIP — only when there is at least one saved view */}
        {hasStrip ? (
          <div className="flex items-end">
            {/* "All" tab */}
            <button
              type="button"
              onClick={() => setActiveView(BASE_VIEW_ID)}
              className={cn(
                "-mb-px flex items-center border-b-2 px-3 py-2 text-sm transition-colors",
                activeViewId === BASE_VIEW_ID
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              All
              {dirtyFor(BASE_VIEW_ID) && <DirtyDot />}
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
                      reorderViews(dragIndex, overIndex);
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
                      onClick={() => setActiveView(view.id)}
                      className="flex items-center py-2 pl-3 pr-1"
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

        {/* B) SAVE CONTROLS — right-aligned, only while the active view is dirty */}
        {isDirty && (
          <div className="mb-1 flex shrink-0 animate-fade-in items-center gap-2 duration-150">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={discardActiveViewDraft}
            >
              Discard
            </Button>
            {activeViewId === BASE_VIEW_ID ? (
              <Button type="button" size="sm" onClick={openSaveAs}>
                Save view
              </Button>
            ) : (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button type="button" size="sm">
                    Save view
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={4}
                    className="z-50 min-w-[200px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
                  >
                    <DropdownMenu.Item
                      onSelect={() => saveDraftToActiveView()}
                      className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                    >
                      Save changes to “{activeView?.name}”
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={openSaveAs}
                      className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                    >
                      Save as new view
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
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
                  onClick={() => {
                    if (deleteId) deleteView(deleteId);
                    setDeleteId(null);
                  }}
                  className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Save-as dialog */}
      <Dialog.Root open={saveAsOpen} onOpenChange={setSaveAsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <Dialog.Title className="text-sm font-medium text-foreground">
              Save view
            </Dialog.Title>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitSaveAs();
              }}
            >
              <label className="mt-4 block text-xs font-medium text-muted-foreground">
                View name
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
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto border border-input px-3 py-1.5 text-foreground hover:bg-muted hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button type="submit" className="h-auto px-3 py-1.5 shadow-none">
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
