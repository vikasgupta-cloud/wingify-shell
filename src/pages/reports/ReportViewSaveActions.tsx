import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  reportPresetLabel,
  useActiveCustomViewId,
  useActiveReportPresetId,
  useIsReportViewDirty,
  useReportCustomViews,
  useReportViewsStore,
} from "../../store/reportViews";

export default function ReportViewSaveActions({
  campaignId,
}: {
  campaignId: string;
}) {
  const isDirty = useIsReportViewDirty(campaignId);
  const activePresetId = useActiveReportPresetId(campaignId);
  const activeCustomViewId = useActiveCustomViewId(campaignId);
  const customViews = useReportCustomViews(campaignId);
  const saveDraft = useReportViewsStore((s) => s.saveDraftToActiveView);
  const saveAsNew = useReportViewsStore((s) => s.saveReportViewAsNew);
  const discardDraft = useReportViewsStore((s) => s.discardActiveViewDraft);

  const activeCustomView = customViews.find((v) => v.id === activeCustomViewId);
  const saveTargetLabel =
    activeCustomView?.name ?? reportPresetLabel(activePresetId);

  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState("New view");

  const openSaveAs = () => {
    setSaveAsName("New view");
    setSaveAsOpen(true);
  };

  if (!isDirty) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => discardDraft(campaignId)}
        >
          Discard
        </Button>
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
                onSelect={() => saveDraft(campaignId)}
                className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
              >
                Save changes to “{saveTargetLabel}”
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
      </div>

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
                saveAsNew(campaignId, saveAsName);
                setSaveAsOpen(false);
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
