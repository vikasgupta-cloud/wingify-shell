import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import type {
  EditorDockAlign,
  EditorDockDensity,
  EditorDockEdge,
} from "@/store/editorPanels";

const MIN_HEIGHT = 280;
const MAX_HEIGHT = 640;
const DEFAULT_HEIGHT = 420;
const MIN_WIDTH = 280;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 400;
const STEP = 40;
/** Caps side-sheet height so it doesn’t span the full viewport. */
const SIDE_SHEET_MAX_HEIGHT = 480;
/** Clears the floating bottom dock (bottom-5 + h-11 + gap). */
const DOCK_CLEARANCE_BOTTOM = 80;
/** Clears the floating top dock (top-5 + h-11 + gap). */
const DOCK_CLEARANCE_TOP = 80;
/** Clears the floating left dock (left-5 + icon rail + gap). */
const DOCK_CLEARANCE_LEFT = 72;
/** Clears the floating left dock when labels are shown (stacked column). */
const DOCK_CLEARANCE_LEFT_LABELED = 84;
/** Clears the floating right dock (right-5 + icon rail + gap). */
const DOCK_CLEARANCE_RIGHT = 72;
/** Clears the floating right dock when labels are shown (stacked column). */
const DOCK_CLEARANCE_RIGHT_LABELED = 84;
const EXIT_MS = 300;

function isSideEdge(edge: EditorDockEdge): boolean {
  return edge === "left" || edge === "right";
}

/**
 * Tool sheet for Add / Metrics / Variations.
 * Slides in from the same edge the dock is parked on.
 */
export function EditorBottomSheet({
  open,
  onClose,
  children,
  className,
  defaultHeight = DEFAULT_HEIGHT,
  onHeightChange,
  defaultWidth = DEFAULT_WIDTH,
  onWidthChange,
  dockEdge = "bottom",
  dockAlign = "center",
  dockDensity = "icons",
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  defaultHeight?: number;
  onHeightChange?: (height: number) => void;
  defaultWidth?: number;
  onWidthChange?: (width: number) => void;
  dockEdge?: EditorDockEdge;
  dockAlign?: EditorDockAlign;
  dockDensity?: EditorDockDensity;
}) {
  const fromLeft = dockEdge === "left";
  const fromRight = dockEdge === "right";
  const fromTop = dockEdge === "top";
  const side = isSideEdge(dockEdge);
  const [height, setHeight] = useState(() =>
    Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(defaultHeight)))
  );
  const [width, setWidth] = useState(() =>
    Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(defaultWidth)))
  );
  /** Stays true through the exit fade so the overlay can animate out. */
  const [present, setPresent] = useState(open);
  const [entered, setEntered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    start: number;
    origin: number;
  } | null>(null);

  const clampHeight = useCallback(
    (h: number) => Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(h))),
    []
  );
  const clampWidth = useCallback(
    (w: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(w))),
    []
  );

  const commitHeight = useCallback(
    (h: number) => {
      const next = clampHeight(h);
      setHeight(next);
      onHeightChange?.(next);
    },
    [clampHeight, onHeightChange]
  );

  const commitWidth = useCallback(
    (w: number) => {
      const next = clampWidth(w);
      setWidth(next);
      onWidthChange?.(next);
    },
    [clampWidth, onWidthChange]
  );

  useEffect(() => {
    if (open) {
      setPresent(true);
      const id = window.requestAnimationFrame(() => setEntered(true));
      return () => window.cancelAnimationFrame(id);
    }
    setEntered(false);
    const t = window.setTimeout(() => setPresent(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!dragging) return;
    const prev = document.body.style.cursor;
    const select = document.body.style.userSelect;
    document.body.style.cursor = side ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prev;
      document.body.style.userSelect = select;
    };
  }, [dragging, side]);

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      start: side ? e.clientX : e.clientY,
      origin: side ? width : height,
    };
    setDragging(true);
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (fromLeft) {
      commitWidth(drag.origin + (e.clientX - drag.start));
    } else if (fromRight) {
      commitWidth(drag.origin - (e.clientX - drag.start));
    } else if (fromTop) {
      commitHeight(drag.origin + (e.clientY - drag.start));
    } else {
      commitHeight(drag.origin - (e.clientY - drag.start));
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  if (!present) return null;

  const hostClass = (() => {
    if (fromLeft) {
      return cn(
        "inset-y-0 left-0 flex py-6",
        dockAlign === "start" && "items-start",
        dockAlign === "end" && "items-end",
        dockAlign === "center" && "items-center"
      );
    }
    if (fromRight) {
      return cn(
        "inset-y-0 right-0 flex py-6",
        dockAlign === "start" && "items-start",
        dockAlign === "end" && "items-end",
        dockAlign === "center" && "items-center"
      );
    }
    if (fromTop) {
      return cn(
        "inset-x-0 top-0 flex flex-col px-4 justify-start",
        dockAlign === "start" && "items-start",
        dockAlign === "end" && "items-end",
        dockAlign === "center" && "items-center"
      );
    }
    return cn(
      "inset-x-0 bottom-0 flex flex-col px-4 justify-end",
      dockAlign === "start" && "items-start",
      dockAlign === "end" && "items-end",
      dockAlign === "center" && "items-center"
    );
  })();

  const hostPadding = fromLeft
    ? {
        paddingLeft:
          dockDensity === "labels"
            ? DOCK_CLEARANCE_LEFT_LABELED
            : DOCK_CLEARANCE_LEFT,
      }
    : fromRight
      ? {
          paddingRight:
            dockDensity === "labels"
              ? DOCK_CLEARANCE_RIGHT_LABELED
              : DOCK_CLEARANCE_RIGHT,
        }
      : fromTop
        ? { paddingTop: DOCK_CLEARANCE_TOP }
        : { paddingBottom: DOCK_CLEARANCE_BOTTOM };

  const scrimGradient = fromLeft
    ? "linear-gradient(to right, hsl(var(--foreground) / 0.42) 0%, hsl(var(--foreground) / 0.08) 42%, transparent 100%)"
    : fromRight
      ? "linear-gradient(to left, hsl(var(--foreground) / 0.42) 0%, hsl(var(--foreground) / 0.08) 42%, transparent 100%)"
      : fromTop
        ? "linear-gradient(to top, transparent 0%, hsl(var(--foreground) / 0.08) 42%, hsl(var(--foreground) / 0.42) 100%)"
        : "linear-gradient(to bottom, transparent 0%, hsl(var(--foreground) / 0.08) 42%, hsl(var(--foreground) / 0.42) 100%)";

  const exitTransform = fromLeft
    ? "-translate-x-4 opacity-0"
    : fromRight
      ? "translate-x-4 opacity-0"
      : fromTop
        ? "-translate-y-4 opacity-0"
        : "translate-y-4 opacity-0";

  return (
    <div
      className={cn("pointer-events-none absolute z-40", hostClass, className)}
      style={hostPadding}
      data-bottom-sheet
      data-sheet-edge={dockEdge}
      data-sheet-align={dockAlign}
    >
      <button
        type="button"
        aria-label="Dismiss"
        className={cn(
          "pointer-events-auto absolute inset-0 transition-opacity duration-300 ease-out",
          entered ? "opacity-100" : "opacity-0"
        )}
        style={{ background: scrimGradient }}
        onClick={onClose}
        tabIndex={open ? undefined : -1}
        aria-hidden={!open || undefined}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "pointer-events-auto relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_48px_-16px_hsl(var(--foreground)/0.35)] will-change-transform transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          side ? "group/sheet my-0" : "group/sheet w-full max-w-[720px]",
          entered ? "translate-x-0 translate-y-0 opacity-100" : exitTransform
        )}
        style={
          side
            ? {
                width,
                height: `min(${SIDE_SHEET_MAX_HEIGHT}px, calc(100% - 3rem))`,
              }
            : { height }
        }
        data-sheet-edge={dockEdge}
      >
        <div
          role="separator"
          aria-orientation={side ? "vertical" : "horizontal"}
          aria-valuenow={side ? width : height}
          aria-valuemin={side ? MIN_WIDTH : MIN_HEIGHT}
          aria-valuemax={side ? MAX_WIDTH : MAX_HEIGHT}
          aria-label="Resize sheet"
          tabIndex={0}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(e) => {
            if (fromLeft) {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                commitWidth(width + STEP);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                commitWidth(width - STEP);
              }
            } else if (fromRight) {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                commitWidth(width + STEP);
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                commitWidth(width - STEP);
              }
            } else if (fromTop) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                commitHeight(height + STEP);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                commitHeight(height - STEP);
              }
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              commitHeight(height + STEP);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              commitHeight(height - STEP);
            }
          }}
          className={cn(
            "group/handle absolute z-10 outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            fromLeft &&
              "inset-y-0 right-0 flex w-4 cursor-col-resize items-center justify-end",
            fromRight &&
              "inset-y-0 left-0 flex w-4 cursor-col-resize items-center justify-start",
            fromTop &&
              "inset-x-0 bottom-0 flex h-4 cursor-row-resize items-end justify-center",
            !side &&
              !fromTop &&
              "inset-x-0 top-0 flex h-4 cursor-row-resize items-start justify-center"
          )}
        >
          <span
            className={cn(
              "rounded-full bg-muted-foreground/30 transition-colors",
              "group-hover/handle:bg-muted-foreground/50",
              dragging && "bg-foreground/55",
              fromLeft && "mr-1.5 h-10 w-1",
              fromRight && "ml-1.5 h-10 w-1",
              fromTop && "mb-1.5 h-1 w-10",
              !side && !fromTop && "mt-1.5 h-1 w-10"
            )}
          />
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            fromLeft && "pr-3",
            fromRight && "pl-3",
            fromTop && "pb-3",
            !side && !fromTop && "pt-3"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
