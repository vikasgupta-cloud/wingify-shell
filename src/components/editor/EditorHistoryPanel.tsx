import { useState } from "react";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatSaveRelative,
  selectActiveVersion,
  selectLatestVersion,
  useEditorSavesStore,
  versionTitle,
} from "@/store/editorSaves";
import { EditorFloatablePanel } from "./EditorFloatablePanel";
import type {
  EditorPanelChrome,
  EditorPanelGroupDragHandlers,
} from "./EditorFloatablePanel";

/** History panel — version history with switch / restore. */
export function EditorHistoryPanel({
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
  const versions = useEditorSavesStore((s) => s.versions);
  const activeVersionId = useEditorSavesStore((s) => s.activeVersionId);
  const switchTo = useEditorSavesStore((s) => s.switchTo);
  const restoreAsCurrent = useEditorSavesStore((s) => s.restoreAsCurrent);
  const exitToLatest = useEditorSavesStore((s) => s.exitToLatest);

  const latest = selectLatestVersion(versions);
  const active = selectActiveVersion(versions, activeVersionId);
  const viewingOlder = Boolean(latest && active && latest.id !== active.id);
  const [now] = useState(() => Date.now());

  return (
    <EditorFloatablePanel
      title="Version history"
      icon={<History className="size-3.5 shrink-0" strokeWidth={1.75} />}
      onClose={onClose}
      bodyClassName="min-h-0 overflow-hidden"
      chrome={chrome}
      onChromeChange={onChromeChange}
      onReattach={onReattach}
      grouped={grouped}
      tabPane={tabPane}
      groupDrag={groupDrag}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
          {versions.map((version, index) => {
            const isActive = version.id === active?.id;
            const titled = version.message.trim().length > 0;
            return (
              <li key={version.id}>
                <button
                  type="button"
                  onClick={() => switchTo(version.id)}
                  className={cn(
                    "flex w-full flex-col gap-1.5 rounded-md px-2 py-2 text-left outline-none transition-colors",
                    isActive ? "bg-accent" : "hover:bg-muted"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                      {versionTitle(version)}
                    </span>
                    {index === 0 && (
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Latest
                      </span>
                    )}
                    {isActive && index !== 0 && (
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Viewing
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold",
                        isActive
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                      )}
                      aria-hidden
                    >
                      {version.author.initials}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {version.author.name}
                      {titled
                        ? ` · ${formatSaveRelative(version.createdAt, now)}`
                        : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {viewingOlder && active && (
          <div className="flex shrink-0 gap-2 border-t border-border p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 flex-1 text-xs font-semibold"
              onClick={exitToLatest}
            >
              Back to latest
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 flex-1 text-xs font-semibold"
              onClick={() => restoreAsCurrent(active.id)}
            >
              Restore
            </Button>
          </div>
        )}
      </div>
    </EditorFloatablePanel>
  );
}
