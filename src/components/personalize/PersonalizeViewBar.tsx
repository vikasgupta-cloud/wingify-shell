import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { ChevronRight, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import SplitSaveButton from "@/components/ui/SplitSaveButton";
import {
  PERSONALIZE_LAYOUT_LABEL,
  PERSONALIZE_OVERVIEW_ID,
  isDirtyIgnoringLayout,
  useIsActiveViewDirty,
  useIsActiveViewUnsaved,
  usePersonalizeViewsStore,
  type PersonalizeLayout,
} from "../../store/personalizeViews";
import { cn } from "../../lib/utils";

const LAYOUTS: PersonalizeLayout[] = ["table", "gantt", "kanban"];

function DirtyDot() {
  return (
    <span
      aria-hidden
      className="ml-1.5 inline-block h-1.5 w-1.5 animate-scale-in rounded-full bg-muted-foreground duration-150"
    />
  );
}

const TAB_BASE =
  "group relative -mb-px flex items-center border-b-2 transition-colors";
const KEBAB_BASE =
  "mr-1.5 h-auto w-auto p-1 text-muted-foreground hover:text-foreground focus-visible:opacity-100 [&_svg]:size-3.5";
const MENU_CONTENT =
  "z-50 min-w-[180px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg";
const MENU_ITEM =
  "cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent data-[disabled]:cursor-default data-[disabled]:opacity-50";

export default function PersonalizeViewBar() {
  const views = usePersonalizeViewsStore((s) => s.views);
  const draftViews = usePersonalizeViewsStore((s) => s.draftViews);
  const activeViewId = usePersonalizeViewsStore((s) => s.activeViewId);
  const defaultViewId = usePersonalizeViewsStore((s) => s.defaultViewId);
  const drafts = usePersonalizeViewsStore((s) => s.drafts);
  const setActiveView = usePersonalizeViewsStore((s) => s.setActiveView);
  const setDefaultView = usePersonalizeViewsStore((s) => s.setDefaultView);
  const saveDraftToActiveView = usePersonalizeViewsStore((s) => s.saveDraftToActiveView);
  const saveDraftAsNewView = usePersonalizeViewsStore((s) => s.saveDraftAsNewView);
  const discardActiveViewDraft = usePersonalizeViewsStore((s) => s.discardActiveViewDraft);
  const createDraftView = usePersonalizeViewsStore((s) => s.createDraftView);
  const saveInNewLayout = usePersonalizeViewsStore((s) => s.saveInNewLayout);
  const renameView = usePersonalizeViewsStore((s) => s.renameView);
  const deleteView = usePersonalizeViewsStore((s) => s.deleteView);
  const reorderViews = usePersonalizeViewsStore((s) => s.reorderViews);
  const isDirty = useIsActiveViewDirty();
  const isUnsaved = useIsActiveViewUnsaved();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const activeView =
    views.find((v) => v.id === activeViewId) ??
    draftViews.find((v) => v.id === activeViewId);
  const canDelete = views.length > 1;

  const dirtyFor = (id: string) => {
    const draft = drafts[id];
    if (!draft) return false;
    const saved = views.find((v) => v.id === id)?.state;
    return saved ? isDirtyIgnoringLayout(draft, saved) : true;
  };

  const startRename = (id: string, name: string) => {
    setRenamingId(id);
    setRenameValue(name);
  };
  const commitRename = () => {
    if (renamingId) renameView(renamingId, renameValue);
    setRenamingId(null);
  };
  // Enter edit mode once the tab that owns the name is mounted. Deferred a tick so
  // the dropdown that triggered it finishes closing and doesn't reclaim focus.
  const startRenameSoon = (id: string, name: string) =>
    setTimeout(() => startRename(id, name), 0);

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  // Shared inline name editor: type to rename, Enter / click-out commits, Esc reverts.
  const renameInput = (
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
  );

  const showSaveControls = isUnsaved || isDirty;

  return (
    <>
      <div className="mb-4 flex min-h-[36px] items-end justify-between gap-4 border-b border-border">
        <div className="flex items-end">
          {/* Overview — fixed lead tab, not a view */}
          <div
            className={cn(
              TAB_BASE,
              activeViewId === PERSONALIZE_OVERVIEW_ID
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <button
              type="button"
              onClick={() => setActiveView(PERSONALIZE_OVERVIEW_ID)}
              className="flex items-center py-2 px-3 text-sm"
            >
              Overview
            </button>
          </div>

          {views.map((view, index) => {
            const active = view.id === activeViewId;
            const renaming = renamingId === view.id;
            const otherLayouts = LAYOUTS.filter((l) => l !== view.state.layout);
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
                  TAB_BASE,
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {dragIndex !== null && overIndex === index && (
                  <span className="pointer-events-none absolute inset-y-1 left-0 w-0.5 bg-foreground" />
                )}
                {renaming ? (
                  renameInput
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    onDoubleClick={() => startRename(view.id, view.name)}
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
                          KEBAB_BASE,
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
                        className={MENU_CONTENT}
                      >
                        <DropdownMenu.Item
                          onSelect={() => startRenameSoon(view.id, view.name)}
                          className={MENU_ITEM}
                        >
                          Rename
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          disabled={defaultViewId === view.id}
                          onSelect={() => setDefaultView(view.id)}
                          className={MENU_ITEM}
                        >
                          {defaultViewId === view.id
                            ? "Default view"
                            : "Make default"}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          disabled={!canDelete}
                          onSelect={() => {
                            if (canDelete) setDeleteId(view.id);
                          }}
                          className={MENU_ITEM}
                        >
                          Delete
                        </DropdownMenu.Item>
                        <DropdownMenu.Sub>
                          <DropdownMenu.SubTrigger
                            className={cn(
                              MENU_ITEM,
                              "flex items-center justify-between gap-2"
                            )}
                          >
                            Save in new layout
                            <ChevronRight className="h-3.5 w-3.5" />
                          </DropdownMenu.SubTrigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.SubContent
                              sideOffset={4}
                              className={MENU_CONTENT}
                            >
                              {otherLayouts.map((l) => (
                                <DropdownMenu.Item
                                  key={l}
                                  onSelect={() => saveInNewLayout(view.id, l)}
                                  className={MENU_ITEM}
                                >
                                  {PERSONALIZE_LAYOUT_LABEL[l]}
                                </DropdownMenu.Item>
                              ))}
                            </DropdownMenu.SubContent>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Sub>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>
            );
          })}

          {/* Unsaved draft views spawned from "+" — inline-named, no kebab. */}
          {draftViews.map((view) => {
            const active = view.id === activeViewId;
            const renaming = renamingId === view.id;
            return (
              <div
                key={view.id}
                className={cn(
                  TAB_BASE,
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {renaming ? (
                  renameInput
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    onDoubleClick={() => startRename(view.id, view.name)}
                    className="flex items-center py-2 px-3 text-sm italic"
                  >
                    {view.name}
                    <DirtyDot />
                  </button>
                )}
              </div>
            );
          })}

          {/* "+" — create a new draft view locked to the chosen layout, named inline */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="New view"
                className="mb-1 ml-1 h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground [&_svg]:size-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={4}
                className={MENU_CONTENT}
                // Keep focus on the freshly-mounted rename input instead of
                // letting Radix return it to the trigger (which would blur and
                // commit the name immediately).
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {LAYOUTS.map((l) => (
                  <DropdownMenu.Item
                    key={l}
                    onSelect={() => {
                      const id = createDraftView(l);
                      startRenameSoon(id, `${PERSONALIZE_LAYOUT_LABEL[l]} view`);
                    }}
                    className={MENU_ITEM}
                  >
                    {PERSONALIZE_LAYOUT_LABEL[l]}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* SAVE CONTROLS — right-aligned, while the active view is dirty or unsaved */}
        {showSaveControls && (
          <div className="mb-1 flex shrink-0 animate-fade-in items-center gap-2 duration-150">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={discardActiveViewDraft}
            >
              Discard
            </Button>
            {isUnsaved ? (
              <Button
                type="button"
                size="sm"
                onClick={() => saveDraftAsNewView(activeView?.name ?? "New view")}
              >
                Save view
              </Button>
            ) : (
              <SplitSaveButton
                existingLabel={activeView?.name ?? "View"}
                onSaveExisting={() => saveDraftToActiveView()}
                onSaveAsNew={() => {
                  const copyName = `${activeView?.name ?? "View"} copy`;
                  const id = saveDraftAsNewView(copyName);
                  startRenameSoon(id, copyName);
                }}
                // "Save as new view" opens the inline name editor — don't let
                // Radix pull focus back to the trigger and blur it.
                onCloseAutoFocus={(e) => e.preventDefault()}
                menuClassName={MENU_CONTENT}
              />
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
    </>
  );
}
