import { useState } from "react";
import { Monitor, Settings, Smartphone, Tablet } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfigStore } from "../../../store/config";

const VIEWS: { id: "desktop" | "mobile" | "tablet"; icon: typeof Monitor }[] = [
  { id: "desktop", icon: Monitor },
  { id: "tablet", icon: Tablet },
  { id: "mobile", icon: Smartphone },
];

// The editor bar pinned inside the Workflow Mode canvas body. Mirrors the
// Variations section's editor bar behaviour on the same config fields.
export default function EditorBar({ campaignId }: { campaignId: string }) {
  const config = useConfigStore((s) => s.configs[campaignId]);
  const patch = useConfigStore((s) => s.patch);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (!config) return null;

  const startEditing = () => {
    setDraft(config.editorUrl);
    setEditing(true);
  };
  const commit = () => {
    patch(campaignId, { editorUrl: draft });
    setEditing(false);
  };

  return (
    <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-sm text-muted-foreground">Editor URL</span>
        {config.editorUrl && !editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="truncate text-sm text-foreground hover:underline"
          >
            {config.editorUrl}
          </button>
        ) : (
          <Input
            autoFocus={editing}
            placeholder="https://"
            value={editing ? draft : config.editorUrl}
            onChange={(e) => {
              setDraft(e.target.value);
              if (!editing) patch(campaignId, { editorUrl: e.target.value });
            }}
            onFocus={() => {
              if (!editing) startEditing();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            onBlur={commit}
            className="h-8 w-[280px]"
          />
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm text-muted-foreground">Editor view:</span>
        <div className="flex items-center rounded-md border border-border p-0.5">
          {VIEWS.map(({ id: view, icon: Icon }) => (
            <Button
              key={view}
              type="button"
              variant={config.editorView === view ? "secondary" : "ghost"}
              size="icon"
              aria-label={view}
              className="h-7 w-7"
              onClick={() => patch(campaignId, { editorView: view })}
            >
              <Icon />
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Editor settings"
          className="h-8 w-8 text-muted-foreground"
          // TODO: editor settings
        >
          <Settings />
        </Button>
      </div>
    </div>
  );
}
