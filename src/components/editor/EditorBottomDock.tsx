import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { CopyPlus, GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditorIcon } from "./EditorIcon";
import type { EditorMode } from "./EditorCanvas";
import type { EditorLeftTool } from "@/config/editorScenarios";
import {
  useEditorPanelsStore,
  type EditorDockEdge,
  type EditorDockPlacement,
} from "@/store/editorPanels";

import paletteIcon from "@/assets/editor/palette.svg";
import cursorIcon from "@/assets/editor/cursor-04.svg";
import codeIcon from "@/assets/editor/code-02.svg";
import metricsIcon from "@/assets/editor/metrics.svg";

const MODES: { id: EditorMode; label: string; icon: string }[] = [
  { id: "design", label: "Design", icon: paletteIcon },
  { id: "navigate", label: "Navigate", icon: cursorIcon },
  { id: "code", label: "Code", icon: codeIcon },
];

const SHOW_DELAY_MS = 400;
const HIDE_DELAY_MS = 200;
const PREVIEW_IFRAME_SELECTOR = 'iframe[title="Website preview"]';
const DRAG_THRESHOLD_PX = 6;
/** Drop near these edges to re-dock; otherwise stay free anywhere. */
const SNAP_ZONE_PX = 72;

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

function snapTargetFromPoint(
  x: number,
  y: number
): { kind: "edge"; edge: EditorDockEdge } | { kind: "free"; edge: "bottom" } {
  const { innerHeight: h } = window;
  if (x <= SNAP_ZONE_PX) return { kind: "edge", edge: "left" };
  if (y >= h - SNAP_ZONE_PX) return { kind: "edge", edge: "bottom" };
  // Free float stays horizontal — vertical only when docked to the left.
  return { kind: "free", edge: "bottom" };
}

function clampPos(
  x: number,
  y: number,
  size: { width: number; height: number }
): { x: number; y: number } {
  const margin = 8;
  const maxX = Math.max(margin, window.innerWidth - size.width - margin);
  const maxY = Math.max(margin, window.innerHeight - size.height - margin);
  return {
    x: Math.min(Math.max(margin, Math.round(x)), maxX),
    y: Math.min(Math.max(margin, Math.round(y)), maxY),
  };
}

/**
 * Floating tool dock — free-drag stays horizontal; vertical only when
 * snapped to the left edge.
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
  const dockPlacement = useEditorPanelsStore((s) => s.dockPlacement);
  const setDockPlacement = useEditorPanelsStore((s) => s.setDockPlacement);
  const [hidden, setHidden] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverSnap, setHoverSnap] = useState<ReturnType<
    typeof snapTargetFromPoint
  > | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const scrollStartedAtRef = useRef<number | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const sheetOpen =
    leftTool === "add" || leftTool === "metrics" || leftTool === "variations";
  const sheetOpenRef = useRef(sheetOpen);
  sheetOpenRef.current = sheetOpen;

  const free = dockPlacement.mode === "free";
  // Vertical only when docked on the left — free float stays horizontal.
  const vertical =
    dockPlacement.mode === "edge" && dockPlacement.edge === "left";

  useEffect(() => {
    if (sheetOpen) {
      setHidden(false);
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      scrollStartedAtRef.current = null;
    }
  }, [sheetOpen]);

  useEffect(() => {
    let lastY: number | null = null;
    let raf = 0;

    const scheduleShow = () => {
      if (idleTimerRef.current != null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        scrollStartedAtRef.current = null;
        setHidden(false);
        idleTimerRef.current = null;
      }, SHOW_DELAY_MS);
    };

    const onScrollActivity = () => {
      if (sheetOpenRef.current) return;
      const now = performance.now();
      if (scrollStartedAtRef.current == null) {
        scrollStartedAtRef.current = now;
      }
      if (now - scrollStartedAtRef.current >= HIDE_DELAY_MS) {
        setHidden(true);
      }
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

  const onGripPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
  };

  const onGripPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
    if (!drag.moved) {
      drag.moved = true;
      setDragging(true);
      setHidden(false);
    }
    const x = e.clientX - drag.offsetX;
    const y = e.clientY - drag.offsetY;
    setDragPos({ x, y });
    setHoverSnap(snapTargetFromPoint(e.clientX, e.clientY));
  };

  const endGripDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (drag.moved) {
      const snap = snapTargetFromPoint(e.clientX, e.clientY);
      const willBeVertical = snap.kind === "edge" && snap.edge === "left";
      const bar = barRef.current;
      const size = bar
        ? {
            width: bar.offsetWidth || (willBeVertical ? 60 : 520),
            height: bar.offsetHeight || (willBeVertical ? 320 : 44),
          }
        : {
            width: willBeVertical ? 60 : 520,
            height: willBeVertical ? 320 : 44,
          };
      const rawX = e.clientX - drag.offsetX;
      const rawY = e.clientY - drag.offsetY;
      const pos = clampPos(rawX, rawY, size);
      const next: EditorDockPlacement =
        snap.kind === "edge"
          ? { mode: "edge", edge: snap.edge, pos }
          : { mode: "free", edge: "bottom", pos };
      setDockPlacement(next);
    }
    setDragging(false);
    setDragPos(null);
    setHoverSnap(null);
  };

  const renderItems = (opts: {
    layoutVertical: boolean;
    interactive: boolean;
  }) => {
    const { layoutVertical, interactive } = opts;
    const itemClass = (active: boolean) =>
      cn(
        "rounded-lg text-[10px] font-semibold outline-none transition-colors",
        layoutVertical
          ? "flex w-full flex-col items-center gap-1.5 px-1.5 py-2"
          : "inline-flex h-9 items-center gap-1.5 px-3 text-xs",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      );
    const labelClass = layoutVertical
      ? "max-w-full truncate leading-none"
      : undefined;
    const separatorClass = layoutVertical
      ? "mx-1.5 my-1.5 h-px w-auto shrink-0 bg-border"
      : "mx-1 h-6 w-px shrink-0 bg-border";
    const tabOff = !interactive || (hidden && !dragging) ? -1 : undefined;

    const withTip = (label: string, node: ReactElement) => {
      if (!layoutVertical || !interactive) return node;
      return (
        <Tooltip>
          <TooltipTrigger asChild>{node}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      );
    };

    // Disabled buttons don't receive hover — wrap so tips still show.
    const withTipMaybeDisabled = (
      label: string,
      disabled: boolean,
      node: ReactElement
    ) => {
      if (!layoutVertical || !interactive) return node;
      if (!disabled) return withTip(label, node);
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex w-full">{node}</span>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      );
    };

    const toolsDisabled = mode === "navigate";
    const showEditTools = mode !== "code";
    const toolItemClass = (active: boolean, disabled: boolean) =>
      cn(
        itemClass(active && !disabled),
        disabled &&
          "cursor-not-allowed text-muted-foreground/45 hover:bg-transparent hover:text-muted-foreground/45"
      );

    const items = (
      <>
        {interactive ? (
          withTip(
            "Drag anywhere · snap to edges",
            <button
              type="button"
              aria-label="Move dock"
              onPointerDown={onGripPointerDown}
              onPointerMove={onGripPointerMove}
              onPointerUp={endGripDrag}
              onPointerCancel={endGripDrag}
              tabIndex={tabOff}
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground",
                layoutVertical
                  ? "h-7 w-full cursor-grab active:cursor-grabbing"
                  : "h-9 w-7 cursor-grab active:cursor-grabbing"
              )}
            >
              <GripVertical
                className={cn("size-3.5", layoutVertical && "rotate-90")}
                strokeWidth={1.75}
              />
            </button>
          )
        ) : (
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-lg text-muted-foreground",
              layoutVertical ? "h-7 w-full" : "h-9 w-7"
            )}
            aria-hidden
          >
            <GripVertical
              className={cn("size-3.5", layoutVertical && "rotate-90")}
              strokeWidth={1.75}
            />
          </span>
        )}

        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <div key={m.id} className="contents">
              {withTip(
                m.label,
                <button
                  type="button"
                  aria-label={m.label}
                  onClick={interactive ? () => onModeChange(m.id) : undefined}
                  tabIndex={tabOff}
                  className={itemClass(active)}
                >
                  <EditorIcon src={m.icon} size={14} />
                  <span className={labelClass}>{m.label}</span>
                </button>
              )}
            </div>
          );
        })}

        {showEditTools ? (
          <>
            <span className={separatorClass} aria-hidden />

            {withTipMaybeDisabled(
              toolsDisabled ? "Switch to Design to add" : "Add",
              toolsDisabled,
              <button
                type="button"
                aria-label="Add"
                title={toolsDisabled ? "Switch to Design to add" : "Add"}
                aria-disabled={toolsDisabled || undefined}
                disabled={toolsDisabled}
                onClick={
                  interactive && !toolsDisabled
                    ? () => onToggleLeftTool("add")
                    : undefined
                }
                tabIndex={toolsDisabled ? -1 : tabOff}
                className={toolItemClass(leftTool === "add", toolsDisabled)}
              >
                <Plus className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className={labelClass}>Add</span>
              </button>
            )}
            {withTipMaybeDisabled(
              toolsDisabled ? "Switch to Design for Metrics" : "Metrics",
              toolsDisabled,
              <button
                type="button"
                aria-label="Metrics"
                title={
                  toolsDisabled ? "Switch to Design for Metrics" : "Metrics"
                }
                aria-disabled={toolsDisabled || undefined}
                disabled={toolsDisabled}
                onClick={
                  interactive && !toolsDisabled
                    ? () => onToggleLeftTool("metrics")
                    : undefined
                }
                tabIndex={toolsDisabled ? -1 : tabOff}
                className={toolItemClass(leftTool === "metrics", toolsDisabled)}
              >
                <EditorIcon
                  src={metricsIcon}
                  size={14}
                  className={cn(toolsDisabled && "opacity-45")}
                />
                <span className={labelClass}>Metrics</span>
              </button>
            )}
          </>
        ) : null}

        <span className={separatorClass} aria-hidden />

        {withTip(
          "Variations",
          <button
            type="button"
            aria-label="Variations"
            onClick={
              interactive ? () => onToggleLeftTool("variations") : undefined
            }
            tabIndex={tabOff}
            className={itemClass(leftTool === "variations")}
          >
            <CopyPlus className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className={labelClass}>Variations</span>
          </button>
        )}
      </>
    );

    if (layoutVertical && interactive) {
      return (
        <TooltipProvider delayDuration={200}>{items}</TooltipProvider>
      );
    }
    return items;
  };

  const barClass = (layoutVertical: boolean, inert: boolean) =>
    cn(
      "rounded-xl border border-border bg-background p-1 shadow-[0_8px_28px_-6px_hsl(var(--foreground)/0.28),0_0_0_1px_hsl(var(--foreground)/0.04)]",
      layoutVertical
        ? "inline-flex w-[3.75rem] flex-col gap-1.5"
        : "inline-flex h-11 items-center gap-1",
      inert ? "pointer-events-none" : "pointer-events-auto"
    );

  const ghostVertical =
    hoverSnap?.kind === "edge" && hoverSnap.edge === "left";
  const snapHighlight =
    hoverSnap?.kind === "edge" ? hoverSnap.edge : null;

  const parkedStyle =
    free && !dragging
      ? {
          left: dockPlacement.pos.x,
          top: dockPlacement.pos.y,
        }
      : undefined;

  return (
    <>
      {dragging ? (
        <div className="pointer-events-none absolute inset-0 z-50">
          <div
            className={cn(
              "absolute inset-y-0 left-0 transition-colors duration-150",
              "w-[72px]",
              snapHighlight === "left"
                ? "bg-foreground/[0.07]"
                : "bg-transparent"
            )}
          />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 transition-colors duration-150",
              "h-[72px]",
              snapHighlight === "bottom"
                ? "bg-foreground/[0.07]"
                : "bg-transparent"
            )}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute z-50 will-change-transform",
          !dragging &&
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          !free &&
            !dragging &&
            (vertical
              ? "left-5 top-1/2 -translate-y-1/2"
              : "inset-x-0 bottom-5 flex justify-center px-4"),
          free && !dragging && "left-0 top-0",
          !dragging &&
            hidden &&
            (vertical
              ? "-translate-x-[calc(100%+1.75rem)] -translate-y-1/2"
              : "translate-y-[calc(100%+1.75rem)]"),
          dragging && "opacity-40"
        )}
        style={parkedStyle}
        aria-hidden={hidden || dragging || undefined}
      >
        <div
          ref={barRef}
          onWheel={forwardWheelToPreview}
          className={barClass(vertical, hidden && !dragging)}
        >
          {renderItems({ layoutVertical: vertical, interactive: true })}
        </div>
      </div>

      {dragging && dragPos ? (
        <div
          className="pointer-events-none absolute z-[60]"
          style={{ left: dragPos.x, top: dragPos.y }}
        >
          <div
            className={cn(barClass(ghostVertical, true), "opacity-95")}
          >
            {renderItems({
              layoutVertical: ghostVertical,
              interactive: false,
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}
