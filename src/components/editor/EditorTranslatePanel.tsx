import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorFloatablePanel } from "./EditorFloatablePanel";
import type {
  EditorPanelChrome,
  EditorPanelGroupDragHandlers,
} from "./EditorFloatablePanel";

/** Translate panel — dockable / detachable shell. */
export function EditorTranslatePanel({
  onClose,
  chrome,
  onChromeChange,
  onReattach,
  grouped,
  tabPane,
  groupDrag,
}: {
  onClose?: () => void;
  chrome: EditorPanelChrome;
  onChromeChange: (next: EditorPanelChrome) => void;
  onReattach?: () => void;
  grouped?: boolean;
  tabPane?: boolean;
  groupDrag?: EditorPanelGroupDragHandlers;
}) {
  return (
    <EditorFloatablePanel
      title="Translate"
      icon={<Languages className="size-3.5 shrink-0" strokeWidth={1.75} />}
      onClose={onClose}
      bodyClassName="min-h-0 overflow-hidden"
      chrome={chrome}
      onChromeChange={onChromeChange}
      onReattach={onReattach}
      grouped={grouped}
      tabPane={tabPane}
      groupDrag={groupDrag}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted">
          <Languages className="size-5 text-muted-foreground" strokeWidth={1.5} />
        </span>
        <p className="text-sm font-semibold text-foreground">
          Translate this page
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          Select languages and sync copy across variations. Full translation
          workflows will appear here.
        </p>
        <Button type="button" size="sm" className="mt-1 h-7 text-xs font-semibold">
          Add language
        </Button>
      </div>
    </EditorFloatablePanel>
  );
}
