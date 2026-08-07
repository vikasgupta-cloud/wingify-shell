import { Button } from "@/components/ui/button";
import {
  isViewingOlderVersion,
  selectActiveVersion,
  useEditorSavesStore,
  versionTitle,
} from "@/store/editorSaves";

/** Shown while viewing a historical save — switch back or restore as current. */
export function EditorVersionBanner() {
  const versions = useEditorSavesStore((s) => s.versions);
  const activeVersionId = useEditorSavesStore((s) => s.activeVersionId);
  const exitToLatest = useEditorSavesStore((s) => s.exitToLatest);
  const restoreAsCurrent = useEditorSavesStore((s) => s.restoreAsCurrent);

  const viewingOlder = isViewingOlderVersion(versions, activeVersionId);
  const active = selectActiveVersion(versions, activeVersionId);

  if (!viewingOlder || !active) return null;

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-border bg-muted px-3">
      <p className="min-w-0 truncate text-[12px] text-foreground">
        <span className="font-semibold">Viewing older version</span>
        <span className="text-muted-foreground">
          {" "}
          · {versionTitle(active)} · {active.author.name}
        </span>
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs font-semibold"
          onClick={exitToLatest}
        >
          Back to latest
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-7 text-xs font-semibold"
          onClick={() => restoreAsCurrent(active.id)}
        >
          Restore this version
        </Button>
      </div>
    </div>
  );
}
