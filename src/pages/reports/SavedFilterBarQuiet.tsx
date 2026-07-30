import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bookmark, Check, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useActiveSavedFilterId,
  useReportSavedFilters,
  useReportViewsStore,
} from "../../store/reportViews";
import { cn } from "../../lib/utils";

const MENU_CONTENT =
  "z-50 min-w-[200px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg";
const MENU_ITEM =
  "cursor-pointer rounded-sm px-3 py-1.5 text-foreground outline-none data-[highlighted]:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-40";

type SaveMode = "existing" | "new";

/**
 * Quiet saved-filters chrome: subtle current-filter title + kebab.
 * No dirty Save/Discard prompts — save is always user-initiated.
 */
export default function SavedFilterBarQuiet({
  campaignId,
  embedded,
}: {
  campaignId: string;
  /** When true, renders as a row inside another card (no outer chrome). */
  embedded?: boolean;
}) {
  const savedFilters = useReportSavedFilters(campaignId);
  const activeId = useActiveSavedFilterId(campaignId);
  const applySavedFilter = useReportViewsStore((s) => s.applySavedFilter);
  const saveActive = useReportViewsStore((s) => s.saveActiveSavedFilter);
  const saveAsNew = useReportViewsStore((s) => s.saveAsNewSavedFilter);
  const renameSavedFilter = useReportViewsStore((s) => s.renameSavedFilter);
  const deleteSavedFilter = useReportViewsStore((s) => s.deleteSavedFilter);
  const clearActive = useReportViewsStore((s) => s.clearActiveSavedFilter);

  const activeFilter = savedFilters.find((f) => f.id === activeId) ?? null;
  const title = activeFilter?.name ?? "Default filters";

  const [menuOpen, setMenuOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode>("new");
  const [saveAsName, setSaveAsName] = useState("New saved filter");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openSave = () => {
    setSaveMode(activeFilter ? "existing" : "new");
    setSaveAsName(
      activeFilter
        ? `${activeFilter.name} copy`
        : `Saved filter ${savedFilters.length + 1}`
    );
    setSaveOpen(true);
  };

  const submitSave = () => {
    if (saveMode === "existing" && activeFilter) {
      saveActive(campaignId);
    } else {
      saveAsNew(campaignId, saveAsName.trim() || "New saved filter");
    }
    setSaveOpen(false);
  };

  const openRename = () => {
    if (!activeFilter) return;
    setRenameValue(activeFilter.name);
    setRenameOpen(true);
  };

  const submitRename = () => {
    if (!activeFilter) return;
    renameSavedFilter(campaignId, activeFilter.id, renameValue);
    setRenameOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex h-9 items-center gap-2",
          embedded
            ? "border-b border-surface-border px-5"
            : "rounded-lg border border-border px-3"
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
          <Bookmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate font-medium text-foreground/80">{title}</span>
        </div>

        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Saved filter options"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className={MENU_CONTENT}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenu.Item onSelect={openSave} className={MENU_ITEM}>
                Save filter
              </DropdownMenu.Item>

              {savedFilters.length > 0 ? (
                <>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Label className="px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    Switch filter
                  </DropdownMenu.Label>
                  <DropdownMenu.Item
                    onSelect={() => clearActive(campaignId)}
                    className={MENU_ITEM}
                  >
                    <span className="flex w-full items-center justify-between gap-3">
                      Default filters
                      {!activeFilter ? (
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      ) : null}
                    </span>
                  </DropdownMenu.Item>
                  {savedFilters.map((filter) => (
                    <DropdownMenu.Item
                      key={filter.id}
                      onSelect={() => applySavedFilter(campaignId, filter.id)}
                      className={MENU_ITEM}
                    >
                      <span className="flex w-full items-center justify-between gap-3">
                        <span className="truncate">{filter.name}</span>
                        {filter.id === activeId ? (
                          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        ) : null}
                      </span>
                    </DropdownMenu.Item>
                  ))}
                </>
              ) : null}

              {activeFilter ? (
                <>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item onSelect={openRename} className={MENU_ITEM}>
                    Rename
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => setDeleteOpen(true)}
                    className={MENU_ITEM}
                  >
                    Delete
                  </DropdownMenu.Item>
                </>
              ) : null}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <Dialog.Root open={saveOpen} onOpenChange={setSaveOpen}>
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
                submitSave();
              }}
              className="mt-4 space-y-3"
            >
              <fieldset className="space-y-2">
                <legend className="sr-only">Save destination</legend>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-md border border-border px-3 py-2.5",
                    !activeFilter && "cursor-not-allowed opacity-45",
                    saveMode === "existing" && activeFilter && "border-foreground"
                  )}
                >
                  <input
                    type="radio"
                    name="save-mode"
                    className="mt-0.5"
                    checked={saveMode === "existing"}
                    disabled={!activeFilter}
                    onChange={() => setSaveMode("existing")}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      Existing filter
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {activeFilter
                        ? `Update “${activeFilter.name}”`
                        : "Open a saved filter to update it"}
                    </span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-md border border-border px-3 py-2.5",
                    saveMode === "new" && "border-foreground"
                  )}
                >
                  <input
                    type="radio"
                    name="save-mode"
                    className="mt-0.5"
                    checked={saveMode === "new"}
                    onChange={() => setSaveMode("new")}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      New filter
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Create a new saved filter from the current setup
                    </span>
                  </span>
                </label>
              </fieldset>

              {saveMode === "new" ? (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Filter name
                  </label>
                  <input
                    autoFocus
                    value={saveAsName}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setSaveAsName(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-1">
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

      <Dialog.Root open={renameOpen} onOpenChange={setRenameOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <Dialog.Title className="text-sm font-medium text-foreground">
              Rename filter
            </Dialog.Title>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitRename();
              }}
            >
              <label className="mt-4 block text-xs font-medium text-muted-foreground">
                Filter name
              </label>
              <input
                autoFocus
                value={renameValue}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setRenameValue(e.target.value)}
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

      <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <AlertDialog.Title className="text-sm font-medium text-foreground">
              Delete saved filter?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
              “{activeFilter?.name}” will be removed. This can&apos;t be undone.
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
                    if (activeFilter) {
                      deleteSavedFilter(campaignId, activeFilter.id);
                    }
                    setDeleteOpen(false);
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
