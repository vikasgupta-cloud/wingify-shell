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
  type EditorDockAlign,
  type EditorDockEdge,
  type EditorDockPlacement,
} from "@/store/editorPanels";

import paletteIcon from "@/assets/editor/palette.svg";
import cursorIcon from "@/assets/editor/cursor-04.svg";
import codeIcon from "@/assets/editor/code-02.svg";
import metricsIcon from "@/assets/editor/metrics.svg";

const MODES: {
  id: EditorMode;
  label: string;
  icon: string;
  shortcut: string;
  /** key matching KeyboardEvent.key (lowercase) */
  key: string;
}[] = [
  { id: "design", label: "Design", icon: paletteIcon, shortcut: "D", key: "d" },
  {
    id: "navigate",
    label: "Navigate",
    icon: cursorIcon,
    shortcut: "N",
    key: "n",
  },
  { id: "code", label: "Code", icon: codeIcon, shortcut: "C", key: "c" },
];

const TOOLS: {
  id: EditorLeftTool;
  label: string;
  shortcut: string;
  key: string;
  designOnly?: boolean;
}[] = [
  { id: "add", label: "Add", shortcut: "A", key: "a", designOnly: true },
  {
    id: "metrics",
    label: "Metrics",
    shortcut: "M",
    key: "m",
    designOnly: true,
  },
  { id: "variations", label: "Variations", shortcut: "V", key: "v" },
];

const SHOW_DELAY_MS = 400;
const HIDE_DELAY_MS = 200;
const PREVIEW_IFRAME_SELECTOR = 'iframe[title="Website preview"]';
const DRAG_THRESHOLD_PX = 6;
/** Drop near these edges to re-dock; otherwise stay free anywhere. */
const SNAP_ZONE_PX = 72;
/** Along an edge, outer thirds snap to the extreme; middle stays centered. */
const ALIGN_EDGE_RATIO = 0.33;

/** All edge dock slots — shown as silhouettes while dragging. */
const DOCK_SLOTS: { edge: EditorDockEdge; align: EditorDockAlign }[] = [
  { edge: "left", align: "start" },
  { edge: "left", align: "center" },
  { edge: "left", align: "end" },
  { edge: "bottom", align: "start" },
  { edge: "bottom", align: "center" },
  { edge: "bottom", align: "end" },
];

type SnapTarget =
  | { kind: "edge"; edge: EditorDockEdge; align: EditorDockAlign }
  | { kind: "free"; edge: "bottom"; align: "center" };

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [role='textbox']"
    )
  );
}

function DockTip({
  label,
  shortcut,
}: {
  label: string;
  shortcut?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{label}</span>
      {shortcut ? (
        <kbd className="rounded border border-primary-foreground/30 bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none tracking-wide text-primary-foreground">
          {shortcut}
        </kbd>
      ) : null}
    </span>
  );
}

function alignAlongAxis(value: number, size: number): EditorDockAlign {
  if (value <= size * ALIGN_EDGE_RATIO) return "start";
  if (value >= size * (1 - ALIGN_EDGE_RATIO)) return "end";
  return "center";
}

function snapTargetFromPoint(
  clientX: number,
  clientY: number,
  bounds: DOMRect
): SnapTarget {
  const x = clientX - bounds.left;
  const y = clientY - bounds.top;
  const w = bounds.width;
  const h = bounds.height;
  const nearLeft = x <= SNAP_ZONE_PX;
  const nearBottom = y >= h - SNAP_ZONE_PX;
  const nearTop = y <= SNAP_ZONE_PX;
  const nearRight = x >= w - SNAP_ZONE_PX;

  // Corners — pick the nearer edge and park at that extreme.
  if (nearLeft && nearBottom) {
    return x <= h - y
      ? { kind: "edge", edge: "left", align: "end" }
      : { kind: "edge", edge: "bottom", align: "start" };
  }
  if (nearLeft && nearTop) {
    return { kind: "edge", edge: "left", align: "start" };
  }
  if (nearRight && nearBottom) {
    return { kind: "edge", edge: "bottom", align: "end" };
  }

  if (nearLeft) {
    return {
      kind: "edge",
      edge: "left",
      align: alignAlongAxis(y, h),
    };
  }
  if (nearBottom) {
    return {
      kind: "edge",
      edge: "bottom",
      align: alignAlongAxis(x, w),
    };
  }

  return { kind: "free", edge: "bottom", align: "center" };
}

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

function clampPos(
  x: number,
  y: number,
  size: { width: number; height: number },
  bounds: { width: number; height: number }
): { x: number; y: number } {
  const margin = 8;
  const maxX = Math.max(margin, bounds.width - size.width - margin);
  const maxY = Math.max(margin, bounds.height - size.height - margin);
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
  const [hoverSnap, setHoverSnap] = useState<SnapTarget | null>(null);
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
  const hostRef = useRef<HTMLDivElement>(null);
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
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if (e.shiftKey) return;

      const modeMatch = MODES.find((m) => m.key === key);
      if (modeMatch) {
        e.preventDefault();
        onModeChange(modeMatch.id);
        return;
      }

      const toolMatch = TOOLS.find((t) => t.key === key);
      if (!toolMatch) return;
      if (toolMatch.designOnly && mode !== "design") return;
      e.preventDefault();
      onToggleLeftTool(toolMatch.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onModeChange, onToggleLeftTool]);

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
    const host = hostRef.current?.getBoundingClientRect();
    if (!host) return;
    const bar = barRef.current;
    const approxSize = {
      width: bar?.offsetWidth || 520,
      height: bar?.offsetHeight || 44,
    };
    const rawX = e.clientX - drag.offsetX - host.left;
    const rawY = e.clientY - drag.offsetY - host.top;
    setDragPos(clampPos(rawX, rawY, approxSize, host));
    setHoverSnap(snapTargetFromPoint(e.clientX, e.clientY, host));
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
      const host = hostRef.current?.getBoundingClientRect();
      if (host) {
        const snap = snapTargetFromPoint(e.clientX, e.clientY, host);
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
        const rawX = e.clientX - drag.offsetX - host.left;
        const rawY = e.clientY - drag.offsetY - host.top;
        const pos = clampPos(rawX, rawY, size, host);
        const next: EditorDockPlacement =
          snap.kind === "edge"
            ? { mode: "edge", edge: snap.edge, align: snap.align, pos }
            : { mode: "free", edge: "bottom", align: "center", pos };
        setDockPlacement(next);
      }
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
    const tipSide = layoutVertical ? "right" : "top";
    const itemClass = (active: boolean) =>
      cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg outline-none transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      );
    const separatorClass = layoutVertical
      ? "mx-auto my-0.5 h-px w-5 shrink-0 bg-border"
      : "mx-0.5 h-5 w-px shrink-0 bg-border";
    const tabOff = !interactive || (hidden && !dragging) ? -1 : undefined;

    const withTip = (
      label: string,
      node: ReactElement,
      shortcut?: string
    ) => {
      if (!interactive) return node;
      return (
        <Tooltip>
          <TooltipTrigger asChild>{node}</TooltipTrigger>
          <TooltipContent side={tipSide} sideOffset={8}>
            <DockTip label={label} shortcut={shortcut} />
          </TooltipContent>
        </Tooltip>
      );
    };

    // Disabled buttons don't receive hover — wrap so tips still show.
    const withTipMaybeDisabled = (
      label: string,
      disabled: boolean,
      node: ReactElement,
      shortcut?: string
    ) => {
      if (!interactive) return node;
      if (!disabled) return withTip(label, node, shortcut);
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{node}</span>
          </TooltipTrigger>
          <TooltipContent side={tipSide} sideOffset={8}>
            <DockTip label={label} shortcut={shortcut} />
          </TooltipContent>
        </Tooltip>
      );
    };

    const toolsDisabled = mode === "navigate" || mode === "code";
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
            "Move dock",
            <button
              type="button"
              aria-label="Move dock"
              onPointerDown={onGripPointerDown}
              onPointerMove={onGripPointerMove}
              onPointerUp={endGripDrag}
              onPointerCancel={endGripDrag}
              tabIndex={tabOff}
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground",
                "!cursor-grab active:!cursor-grabbing"
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
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground"
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
                  aria-label={`${m.label} (${m.shortcut})`}
                  onClick={interactive ? () => onModeChange(m.id) : undefined}
                  tabIndex={tabOff}
                  className={itemClass(active)}
                >
                  <EditorIcon src={m.icon} size={14} />
                </button>,
                m.shortcut
              )}
            </div>
          );
        })}

        <span className={separatorClass} aria-hidden />

        {withTipMaybeDisabled(
          toolsDisabled ? "Switch to Design to add" : "Add",
          toolsDisabled,
          <button
            type="button"
            aria-label={
              toolsDisabled ? "Add (unavailable)" : "Add (A)"
            }
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
          </button>,
          toolsDisabled ? undefined : "A"
        )}
        {withTipMaybeDisabled(
          toolsDisabled ? "Switch to Design for Metrics" : "Metrics",
          toolsDisabled,
          <button
            type="button"
            aria-label={
              toolsDisabled ? "Metrics (unavailable)" : "Metrics (M)"
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
          </button>,
          toolsDisabled ? undefined : "M"
        )}

        <span className={separatorClass} aria-hidden />

        {withTip(
          "Variations",
          <button
            type="button"
            aria-label="Variations (V)"
            onClick={
              interactive ? () => onToggleLeftTool("variations") : undefined
            }
            tabIndex={tabOff}
            className={itemClass(leftTool === "variations")}
          >
            <CopyPlus className="size-3.5 shrink-0" strokeWidth={1.75} />
          </button>,
          "V"
        )}
      </>
    );

    if (interactive) {
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
        ? "inline-flex w-11 max-h-[calc(100%-2.5rem)] flex-col items-center gap-0.5 overflow-y-auto"
        : "inline-flex h-11 max-w-[calc(100%-2.5rem)] items-center gap-0.5",
      inert ? "pointer-events-none" : "pointer-events-auto"
    );

  const silhouetteClass = (layoutVertical: boolean, active: boolean) =>
    cn(
      "rounded-xl border border-dashed transition-[opacity,border-color,background-color,transform] duration-150",
      active
        ? cn(
            "border-foreground/45 bg-background/80 opacity-80 shadow-sm",
            layoutVertical
              ? "inline-flex w-11 flex-col items-center gap-0.5 p-1"
              : "inline-flex h-11 items-center gap-0.5 p-1"
          )
        : cn(
            "border-foreground/25 bg-foreground/[0.05] opacity-40",
            // Compact markers so left slots don’t stack into a double bar
            layoutVertical ? "h-10 w-2.5" : "h-2.5 w-10"
          )
    );

  const ghostVertical =
    hoverSnap?.kind === "edge" && hoverSnap.edge === "left";
  const parkedAlign = dockPlacement.align ?? "center";
  const activeSlot =
    hoverSnap?.kind === "edge"
      ? { edge: hoverSnap.edge, align: hoverSnap.align }
      : null;

  const placementClass = (
    edge: EditorDockEdge,
    align: EditorDockAlign
  ): string => {
    if (edge === "left") {
      if (align === "start") return "left-5 top-5";
      if (align === "end") return "left-5 bottom-5";
      return "left-5 top-1/2 -translate-y-1/2";
    }
    if (align === "start") return "bottom-5 left-5";
    if (align === "end") return "bottom-5 right-5";
    return "inset-x-0 bottom-5 flex justify-center px-4";
  };

  const parkedStyle =
    free && !dragging
      ? {
          left: dockPlacement.pos.x,
          top: dockPlacement.pos.y,
        }
      : undefined;

  const edgeParkedClass =
    !free && !dragging
      ? placementClass(dockPlacement.edge, parkedAlign)
      : null;

  const hiddenSlideClass = (() => {
    if (!hidden || dragging) return null;
    if (vertical) {
      if (parkedAlign === "start") {
        return "-translate-x-[calc(100%+1.75rem)]";
      }
      if (parkedAlign === "end") {
        return "-translate-x-[calc(100%+1.75rem)]";
      }
      return "-translate-x-[calc(100%+1.75rem)] -translate-y-1/2";
    }
    return "translate-y-[calc(100%+1.75rem)]";
  })();

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 z-50">
      {/* Slot hints: compact markers everywhere; full dock silhouette only on active target */}
      {dragging
        ? DOCK_SLOTS.map((slot) => {
            const isVertical = slot.edge === "left";
            const active =
              activeSlot?.edge === slot.edge &&
              activeSlot.align === slot.align;
            return (
              <div
                key={`${slot.edge}-${slot.align}`}
                className={cn(
                  "pointer-events-none absolute z-[55]",
                  placementClass(slot.edge, slot.align)
                )}
                aria-hidden
              >
                <div className={silhouetteClass(isVertical, active)}>
                  {active
                    ? renderItems({
                        layoutVertical: isVertical,
                        interactive: false,
                      })
                    : null}
                </div>
              </div>
            );
          })
        : null}

      {/* Keep this node mounted while dragging so grip pointer-capture isn’t lost */}
      <div
        className={cn(
          "pointer-events-none absolute z-50 will-change-transform",
          !dragging &&
            "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          edgeParkedClass,
          free && !dragging && "left-0 top-0",
          hiddenSlideClass,
          dragging && "invisible"
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
          <div className={cn(barClass(ghostVertical, true), "opacity-95")}>
            {renderItems({
              layoutVertical: ghostVertical,
              interactive: false,
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
