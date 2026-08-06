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
  type EditorDockDensity,
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
/** Approx grip center inside the icon dock (size-9 button). */
const GRIP_OFFSET_PX = 18;
/** Measured dock shell while dragging (orientation + density). */
const DOCK_SIZE = {
  icons: {
    horizontal: { width: 320, height: 44 },
    vertical: { width: 44, height: 292 },
  },
  labels: {
    horizontal: { width: 560, height: 44 },
    vertical: { width: 124, height: 292 },
  },
} as const;
/** Pull past this delta (px) from an end handle to flip density. */
const DENSITY_PULL_PX = 28;
/** Drop near these edges to re-dock; otherwise stay free anywhere. */
const SNAP_ZONE_PX = 72;
/** Along an edge, outer thirds snap to the extreme; middle stays centered. */
const ALIGN_EDGE_RATIO = 0.33;

/** All edge dock slots — shown as silhouettes while dragging. */
const DOCK_SLOTS: { edge: EditorDockEdge; align: EditorDockAlign }[] = [
  { edge: "top", align: "start" },
  { edge: "top", align: "center" },
  { edge: "top", align: "end" },
  { edge: "right", align: "start" },
  { edge: "right", align: "center" },
  { edge: "right", align: "end" },
  { edge: "bottom", align: "start" },
  { edge: "bottom", align: "center" },
  { edge: "bottom", align: "end" },
  { edge: "left", align: "start" },
  { edge: "left", align: "center" },
  { edge: "left", align: "end" },
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

function isVerticalEdge(edge: EditorDockEdge): boolean {
  return edge === "left" || edge === "right";
}

function dockShellSize(
  vertical: boolean,
  density: EditorDockDensity
): { width: number; height: number } {
  return vertical ? DOCK_SIZE[density].vertical : DOCK_SIZE[density].horizontal;
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
  const distLeft = x;
  const distRight = w - x;
  const distTop = y;
  const distBottom = h - y;

  const candidates: { edge: EditorDockEdge; dist: number }[] = [];
  if (distLeft <= SNAP_ZONE_PX) candidates.push({ edge: "left", dist: distLeft });
  if (distRight <= SNAP_ZONE_PX)
    candidates.push({ edge: "right", dist: distRight });
  if (distTop <= SNAP_ZONE_PX) candidates.push({ edge: "top", dist: distTop });
  if (distBottom <= SNAP_ZONE_PX)
    candidates.push({ edge: "bottom", dist: distBottom });

  if (candidates.length === 0) {
    return { kind: "free", edge: "bottom", align: "center" };
  }

  candidates.sort((a, b) => a.dist - b.dist);
  const edge = candidates[0]!.edge;
  const align = isVerticalEdge(edge)
    ? alignAlongAxis(y, h)
    : alignAlongAxis(x, w);

  return { kind: "edge", edge, align };
}

function placementClass(
  edge: EditorDockEdge,
  align: EditorDockAlign
): string {
  if (edge === "left") {
    if (align === "start") return "left-5 top-5";
    if (align === "end") return "left-5 bottom-5";
    return "left-5 top-1/2 -translate-y-1/2";
  }
  if (edge === "right") {
    if (align === "start") return "right-5 top-5";
    if (align === "end") return "right-5 bottom-5";
    return "right-5 top-1/2 -translate-y-1/2";
  }
  if (edge === "top") {
    if (align === "start") return "top-5 left-5";
    if (align === "end") return "top-5 right-5";
    return "top-5 left-1/2 -translate-x-1/2";
  }
  // bottom
  if (align === "start") return "bottom-5 left-5";
  if (align === "end") return "bottom-5 right-5";
  return "bottom-5 left-1/2 -translate-x-1/2";
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
 * Floating tool dock — free-drag stays horizontal; vertical when
 * snapped to the left or right edge.
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
  const dockDensity = useEditorPanelsStore((s) => s.dockDensity);
  const setDockDensity = useEditorPanelsStore((s) => s.setDockDensity);
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
    /** Last ghost orientation — when it flips, re-pin the cursor to the grip. */
    ghostVertical: boolean;
  } | null>(null);
  const densityDragRef = useRef<{
    pointerId: number;
    side: "start" | "end";
    startX: number;
    startY: number;
    origin: EditorDockDensity;
  } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const sheetOpen =
    leftTool === "add" || leftTool === "metrics" || leftTool === "variations";
  const sheetOpenRef = useRef(sheetOpen);
  sheetOpenRef.current = sheetOpen;

  const free = dockPlacement.mode === "free";
  // Vertical when docked on left or right — top/bottom/free stay horizontal.
  const vertical =
    dockPlacement.mode === "edge" && isVerticalEdge(dockPlacement.edge);
  const labeled = dockDensity === "labels";
  const tipSide: "top" | "right" | "bottom" | "left" = !free
    ? dockPlacement.edge === "right"
      ? "left"
      : dockPlacement.edge === "left"
        ? "right"
        : dockPlacement.edge === "top"
          ? "bottom"
          : "top"
    : "top";

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
      ghostVertical: vertical,
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
    const snap = snapTargetFromPoint(e.clientX, e.clientY, host);
    const ghostIsVertical =
      snap.kind === "edge" && isVerticalEdge(snap.edge);
    // Orientation flip (left ↔ bottom): keep the cursor on the grip, not mid-bar.
    if (drag.ghostVertical !== ghostIsVertical) {
      drag.ghostVertical = ghostIsVertical;
      drag.offsetX = GRIP_OFFSET_PX;
      drag.offsetY = GRIP_OFFSET_PX;
    }
    const size = ghostIsVertical
      ? dockShellSize(true, dockDensity)
      : dockShellSize(false, dockDensity);
    const rawX = e.clientX - drag.offsetX - host.left;
    const rawY = e.clientY - drag.offsetY - host.top;
    setDragPos(clampPos(rawX, rawY, size, host));
    setHoverSnap(snap);
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
        const willBeVertical =
          snap.kind === "edge" && isVerticalEdge(snap.edge);
        const size = willBeVertical
          ? dockShellSize(true, dockDensity)
          : dockShellSize(false, dockDensity);
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

  const onDensityPointerDown = (
    side: "start" | "end",
    e: ReactPointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    densityDragRef.current = {
      pointerId: e.pointerId,
      side,
      startX: e.clientX,
      startY: e.clientY,
      origin: dockDensity,
    };
  };

  const onDensityPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = densityDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    // Ends of the long axis: left/right on horizontal docks, top/bottom on vertical.
    const signed = vertical
      ? drag.side === "end"
        ? e.clientY - drag.startY
        : drag.startY - e.clientY
      : drag.side === "end"
        ? e.clientX - drag.startX
        : drag.startX - e.clientX;
    if (signed >= DENSITY_PULL_PX) {
      if (dockDensity !== "labels") setDockDensity("labels");
    } else if (signed <= -DENSITY_PULL_PX) {
      if (dockDensity !== "icons") setDockDensity("icons");
    } else if (drag.origin !== dockDensity) {
      setDockDensity(drag.origin);
    }
  };

  const endDensityDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = densityDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    densityDragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const renderItems = (opts: {
    layoutVertical: boolean;
    interactive: boolean;
    showLabels: boolean;
  }) => {
    const { layoutVertical, interactive, showLabels } = opts;
    const itemClass = (active: boolean) =>
      cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg outline-none transition-colors",
        showLabels
          ? layoutVertical
            ? "h-9 w-full justify-start gap-2 px-2"
            : "h-9 gap-1.5 px-2.5"
          : "size-9",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      );
    const labelClass =
      "max-w-[5.5rem] truncate text-left text-[11px] font-medium leading-none tracking-tight";
    const separatorClass = layoutVertical
      ? showLabels
        ? "mx-1.5 my-0.5 h-px w-auto shrink-0 self-stretch bg-border"
        : "mx-auto my-0.5 h-px w-5 shrink-0 bg-border"
      : "mx-0.5 h-5 w-px shrink-0 bg-border";
    const tabOff = !interactive || (hidden && !dragging) ? -1 : undefined;

    const withTip = (
      label: string,
      node: ReactElement,
      shortcut?: string
    ) => {
      if (!interactive || showLabels) return node;
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
      if (!interactive || showLabels) return node;
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

    const ItemLabel = ({ children }: { children: string }) =>
      showLabels ? <span className={labelClass}>{children}</span> : null;

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
                "inline-flex shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground",
                showLabels
                  ? layoutVertical
                    ? "h-9 w-full px-2"
                    : "h-9 px-2"
                  : "size-9",
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
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-lg text-muted-foreground",
              showLabels
                ? layoutVertical
                  ? "h-9 w-full px-2"
                  : "h-9 px-2"
                : "size-9"
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
                  aria-label={`${m.label} (${m.shortcut})`}
                  onClick={interactive ? () => onModeChange(m.id) : undefined}
                  tabIndex={tabOff}
                  className={itemClass(active)}
                >
                  <EditorIcon src={m.icon} size={14} />
                  <ItemLabel>{m.label}</ItemLabel>
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
            <ItemLabel>Add</ItemLabel>
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
            <ItemLabel>Metrics</ItemLabel>
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
            <ItemLabel>Variations</ItemLabel>
          </button>,
          "V"
        )}
      </>
    );

    return items;
  };

  const densityHandle = (
    side: "start" | "end",
    layoutVertical: boolean,
    interactive: boolean
  ) => {
    if (!interactive) return null;
    const expandKey = layoutVertical
      ? side === "start"
        ? "ArrowUp"
        : "ArrowDown"
      : side === "start"
        ? "ArrowLeft"
        : "ArrowRight";
    const collapseKey = layoutVertical
      ? side === "start"
        ? "ArrowDown"
        : "ArrowUp"
      : side === "start"
        ? "ArrowRight"
        : "ArrowLeft";
    return (
      <div
        role="separator"
        aria-orientation={layoutVertical ? "horizontal" : "vertical"}
        aria-label="Expand or collapse dock"
        aria-valuetext={labeled ? "Labels" : "Icons"}
        tabIndex={hidden && !dragging ? -1 : 0}
        onPointerDown={(e) => onDensityPointerDown(side, e)}
        onPointerMove={onDensityPointerMove}
        onPointerUp={endDensityDrag}
        onPointerCancel={endDensityDrag}
        onKeyDown={(e) => {
          if (e.key === expandKey) {
            e.preventDefault();
            setDockDensity("labels");
          } else if (e.key === collapseKey) {
            e.preventDefault();
            setDockDensity("icons");
          }
        }}
        className={cn(
          "group/density absolute z-20 flex outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          layoutVertical
            ? cn(
                "left-0 h-2.5 w-full cursor-ns-resize items-center justify-center",
                side === "start"
                  ? "top-0 -translate-y-1/2"
                  : "bottom-0 translate-y-1/2"
              )
            : cn(
                "top-0 h-full w-2.5 cursor-ew-resize items-center",
                side === "start"
                  ? "left-0 -translate-x-1/2 justify-start"
                  : "right-0 translate-x-1/2 justify-end"
              )
        )}
      >
        <span
          className={cn(
            "rounded-full bg-muted-foreground/0 transition-colors",
            "group-hover/density:bg-muted-foreground/35",
            "group-focus-visible/density:bg-muted-foreground/45",
            layoutVertical ? "h-1 w-5" : "h-5 w-1"
          )}
        />
      </div>
    );
  };

  const barClass = (layoutVertical: boolean, inert: boolean, showLabels: boolean) =>
    cn(
      "relative flex rounded-xl border border-border bg-background p-1 shadow-[0_8px_28px_-6px_hsl(var(--foreground)/0.28),0_0_0_1px_hsl(var(--foreground)/0.04)]",
      layoutVertical
        ? cn(
            "max-h-[calc(100%-2.5rem)] flex-col items-stretch gap-0.5 overflow-y-auto",
            showLabels ? "w-[7.75rem]" : "w-11 items-center"
          )
        : cn(
            "h-11 w-max flex-row items-center gap-0.5",
            showLabels && "px-0.5"
          ),
      inert ? "pointer-events-none" : "pointer-events-auto"
    );

  const silhouetteClass = (
    layoutVertical: boolean,
    active: boolean,
    showLabels: boolean
  ) =>
    cn(
      "rounded-xl border border-dashed transition-[opacity,border-color,background-color,transform,width,height] duration-150",
      active
        ? cn(
            "border-foreground/50 bg-foreground/[0.07] opacity-90",
            layoutVertical
              ? showLabels
                ? "h-[18.25rem] w-[7.75rem]"
                : "h-[18.25rem] w-11"
              : showLabels
                ? "h-11 w-[35rem]"
                : "h-11 w-80"
          )
        : cn(
            "border-foreground/25 bg-foreground/[0.05] opacity-40",
            layoutVertical ? "h-10 w-2.5" : "h-2.5 w-10"
          )
    );

  const ghostVertical =
    hoverSnap?.kind === "edge" && isVerticalEdge(hoverSnap.edge);
  const parkedAlign = dockPlacement.align ?? "center";
  const activeSlot =
    hoverSnap?.kind === "edge"
      ? { edge: hoverSnap.edge, align: hoverSnap.align }
      : null;
  const parkedEdge = dockPlacement.edge;

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
    if (parkedEdge === "left") {
      return parkedAlign === "center"
        ? "-translate-x-[calc(100%+1.75rem)] -translate-y-1/2"
        : "-translate-x-[calc(100%+1.75rem)]";
    }
    if (parkedEdge === "right") {
      return parkedAlign === "center"
        ? "translate-x-[calc(100%+1.75rem)] -translate-y-1/2"
        : "translate-x-[calc(100%+1.75rem)]";
    }
    if (parkedEdge === "top") {
      return parkedAlign === "center"
        ? "-translate-x-1/2 -translate-y-[calc(100%+1.75rem)]"
        : "-translate-y-[calc(100%+1.75rem)]";
    }
    // bottom
    return parkedAlign === "center"
      ? "-translate-x-1/2 translate-y-[calc(100%+1.75rem)]"
      : "translate-y-[calc(100%+1.75rem)]";
  })();

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 z-50">
      {/* Slot hints: compact markers everywhere; stronger shell on active target */}
      {dragging
        ? DOCK_SLOTS.map((slot) => {
            const isVertical = isVerticalEdge(slot.edge);
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
                <div
                  className={silhouetteClass(isVertical, active, labeled)}
                />
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
          className={barClass(vertical, hidden && !dragging, labeled)}
        >
          {densityHandle("start", vertical, true)}
          <TooltipProvider delayDuration={200}>
            {renderItems({
              layoutVertical: vertical,
              interactive: true,
              showLabels: labeled,
            })}
          </TooltipProvider>
          {densityHandle("end", vertical, true)}
        </div>
      </div>

      {dragging && dragPos ? (
        <div
          className="pointer-events-none absolute z-[60]"
          style={{ left: dragPos.x, top: dragPos.y }}
        >
          <div
            className={cn(barClass(ghostVertical, true, labeled), "opacity-95")}
          >
            {renderItems({
              layoutVertical: ghostVertical,
              interactive: false,
              showLabels: labeled,
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
