import { CopyPlus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";
import type { EditorMode } from "./EditorCanvas";
import type { EditorLeftTool } from "@/config/editorScenarios";

import paletteIcon from "@/assets/editor/palette.svg";
import cursorIcon from "@/assets/editor/cursor-04.svg";
import codeIcon from "@/assets/editor/code-02.svg";
import metricsIcon from "@/assets/editor/metrics.svg";

const MODES: { id: EditorMode; label: string; icon: string }[] = [
  { id: "design", label: "Design", icon: paletteIcon },
  { id: "navigate", label: "Navigate", icon: cursorIcon },
  { id: "code", label: "Code", icon: codeIcon },
];

/**
 * Floating bottom chrome — modes and primary tools.
 */
export function EditorBottomDock({
  mode,
  onModeChange,
  leftTool,
  onToggleLeftTool,
  hidden = false,
}: {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  leftTool: EditorLeftTool | null;
  onToggleLeftTool: (id: EditorLeftTool) => void;
  /** Slide off-screen while the preview is being scrolled. */
  hidden?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-5 z-50 flex justify-center px-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden
          ? "translate-y-[calc(100%+1.75rem)]"
          : "translate-y-0"
      )}
      aria-hidden={hidden || undefined}
    >
      <div
        className={cn(
          "pointer-events-auto inline-flex h-11 items-center gap-1 rounded-xl border border-border bg-background p-1 shadow-[0_8px_28px_-6px_hsl(var(--foreground)/0.28),0_0_0_1px_hsl(var(--foreground)/0.04)] transition-opacity duration-300",
          hidden && "pointer-events-none opacity-0"
        )}
      >
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold outline-none transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <EditorIcon src={m.icon} size={14} />
              {m.label}
            </button>
          );
        })}

        <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />

        <button
          type="button"
          onClick={() => onToggleLeftTool("add")}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold outline-none transition-colors",
            leftTool === "add"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
          Add
        </button>
        <button
          type="button"
          onClick={() => onToggleLeftTool("metrics")}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold outline-none transition-colors",
            leftTool === "metrics"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <EditorIcon src={metricsIcon} size={14} />
          Metrics
        </button>

        <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />

        <button
          type="button"
          onClick={() => onToggleLeftTool("variations")}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold outline-none transition-colors",
            leftTool === "variations"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <CopyPlus className="size-3.5" strokeWidth={1.75} />
          Variations
        </button>
      </div>
    </div>
  );
}
