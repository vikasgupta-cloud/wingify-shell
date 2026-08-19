/**
 * Save / load named design themes from the appearance panel.
 * Stores the current palette, theme, component colours, fonts, and icons.
 */
import { useState } from "react";
import { Bookmark, Check, Trash2 } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSavedThemesStore } from "@/store/savedThemes";
import { cn } from "@/lib/utils";

export default function SavedThemesPicker({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const themes = useSavedThemesStore((s) => s.themes);
  const activeThemeId = useSavedThemesStore((s) => s.activeThemeId);
  const saveCurrent = useSavedThemesStore((s) => s.saveCurrent);
  const applyTheme = useSavedThemesStore((s) => s.applyTheme);
  const deleteTheme = useSavedThemesStore((s) => s.deleteTheme);
  const [name, setName] = useState("");
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

  const onSave = () => {
    const saved = saveCurrent(name);
    if (!saved) return;
    setName("");
    setJustSavedId(saved.id);
    window.setTimeout(() => setJustSavedId(null), 1600);
  };

  return (
    <div className={cn(compact ? "px-1.5 py-2.5" : "px-3 py-3.5", className)}>
      <div className={cn("space-y-0.5", compact ? "px-2" : "px-0.5")}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Saved themes
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Save your current palette, theme, component colours, fonts, and icons.
          Same name overwrites the earlier save.
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSave();
            }
          }}
          placeholder="Name this theme"
          aria-label="Saved theme name"
          className="h-8"
        />
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 gap-1.5"
          disabled={!name.trim()}
          onClick={onSave}
        >
          <Bookmark className="size-3.5" strokeWidth={1.75} />
          Save
        </Button>
      </div>

      {themes.length === 0 ? (
        <p
          className={cn(
            "mt-3 text-xs text-muted-foreground",
            compact ? "px-2" : "px-0.5"
          )}
        >
          No saved themes yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {themes.map((theme) => {
            const active = theme.id === activeThemeId;
            const justSaved = theme.id === justSavedId;
            return (
              <li
                key={theme.id}
                className={cn(
                  "flex items-center gap-1 rounded-md border px-2 py-1.5",
                  active
                    ? "border-foreground bg-accent"
                    : "border-border bg-background"
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate text-left text-xs font-medium text-foreground"
                  onClick={() => applyTheme(theme.id)}
                  title={`Apply ${theme.name}`}
                >
                  {theme.name}
                </button>
                {justSaved ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Check className="size-3" strokeWidth={1.75} />
                    Saved
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground"
                  aria-label={`Delete ${theme.name}`}
                  onClick={() => deleteTheme(theme.id)}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
