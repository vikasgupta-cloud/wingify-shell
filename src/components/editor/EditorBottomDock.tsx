import { useEffect, useRef, useState, type WheelEvent as ReactWheelEvent } from "react";
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

const SHOW_DELAY_MS = 900;
const PREVIEW_IFRAME_SELECTOR = 'iframe[title="Website preview"]';

function readPreviewScrollY(): number | null {
  const iframe = document.querySelector<HTMLIFrameElement>(
    PREVIEW_IFRAME_SELECTOR
  );
  const win = iframe?.contentWindow;
  const doc = iframe?.contentDocument;
  if (!win || !doc?.documentElement) return null;
  return (
    win.pageYOffset ||
    win.scrollY ||
    doc.documentElement.scrollTop ||
    doc.body.scrollTop ||
    0
  );
}

/**
 * Floating bottom chrome — modes and primary tools.
 * Hides while the preview is scrolling (either direction).
 */
export function EditorBottomDock({
  mode,
  onModeChange,
  leftTool,
  onToggleLeftTool,
}: {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  leftTool: EditorLeftTool | null;
  onToggleLeftTool: (id: EditorLeftTool) => void;
}) {
  const [hidden, setHidden] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const sheetOpen =
    leftTool === "add" || leftTool === "metrics" || leftTool === "variations";
  const sheetOpenRef = useRef(sheetOpen);
  sheetOpenRef.current = sheetOpen;

  useEffect(() => {
    if (sheetOpen) {
      setHidden(false);
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    }
  }, [sheetOpen]);

  // Poll the preview scroll position from the shell. This stays reliable across
  // hide/show cycles (iframe wheel/scroll listeners were only firing once).
  useEffect(() => {
    let lastY: number | null = null;
    let raf = 0;

    const scheduleShow = () => {
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        setHidden(false);
        idleTimerRef.current = null;
      }, SHOW_DELAY_MS);
    };

    const onScrollActivity = () => {
      if (sheetOpenRef.current) return;
      setHidden(true);
      scheduleShow();
    };

    const tick = () => {
      const y = readPreviewScrollY();
      if (y != null) {
        if (lastY != null && y !== lastY) {
          onScrollActivity();
        }
        lastY = y;
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, []);

  const forwardWheelToPreview = (e: ReactWheelEvent<HTMLDivElement>) => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      PREVIEW_IFRAME_SELECTOR
    );
    const win = iframe?.contentWindow;
    if (!win) return;
    e.preventDefault();
    win.scrollBy({
      top: e.deltaY,
      left: e.deltaX,
      behavior: "instant" as ScrollBehavior,
    });
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-5 z-50 flex justify-center px-4 will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden ? "translate-y-[calc(100%+1.75rem)]" : "translate-y-0"
      )}
      aria-hidden={hidden || undefined}
    >
      <div
        onWheel={forwardWheelToPreview}
        className={cn(
          "pointer-events-auto inline-flex h-11 items-center gap-1 rounded-xl border border-border bg-background p-1 shadow-[0_8px_28px_-6px_hsl(var(--foreground)/0.28),0_0_0_1px_hsl(var(--foreground)/0.04)]",
          hidden && "pointer-events-none"
        )}
      >
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              tabIndex={hidden ? -1 : undefined}
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
          tabIndex={hidden ? -1 : undefined}
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
          tabIndex={hidden ? -1 : undefined}
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
          tabIndex={hidden ? -1 : undefined}
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
