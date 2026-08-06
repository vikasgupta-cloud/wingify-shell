import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 280;
const MAX_HEIGHT = 640;
const DEFAULT_HEIGHT = 420;
const MIN_WIDTH = 280;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 400;
const STEP = 40;
/** Caps left-sheet height so it doesn’t span the full viewport. */
const SIDE_SHEET_MAX_HEIGHT = 480;
/** Clears the floating bottom dock (bottom-5 + h-11 + gap). */
const DOCK_CLEARANCE_BOTTOM = 80;
/** Clears the floating left dock (left-5 + rail + gap). */
const DOCK_CLEARANCE_LEFT = 88;

/**
 * Tool sheet for Add / Metrics / Variations.
 * Bottom dock → rises from the bottom; left dock → slides in from the left.
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
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  defaultHeight?: number;
  onHeightChange?: (height: number) => void;
  defaultWidth?: number;
  onWidthChange?: (width: number) => void;
  dockEdge?: "bottom" | "left";
}) {
  const fromLeft = dockEdge === "left";
  const [height, setHeight] = useState(() =>
    Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(defaultHeight)))
  );
  const [width, setWidth] = useState(() =>
    Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(defaultWidth)))
  );
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
    if (!open) {
      setEntered(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
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
    document.body.style.cursor = fromLeft ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prev;
      document.body.style.userSelect = select;
    };
  }, [dragging, fromLeft]);

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      start: fromLeft ? e.clientX : e.clientY,
      origin: fromLeft ? width : height,
    };
    setDragging(true);
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (fromLeft) {
      commitWidth(drag.origin + (e.clientX - drag.start));
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

  if (!open) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-40",
        fromLeft
          ? "inset-y-0 left-0 flex items-center py-6"
          : "inset-x-0 bottom-0 flex flex-col justify-end px-4",
        className
      )}
      style={
        fromLeft
          ? { paddingLeft: DOCK_CLEARANCE_LEFT }
          : { paddingBottom: DOCK_CLEARANCE_BOTTOM }
      }
      data-bottom-sheet
      data-sheet-edge={dockEdge}
    >
      <button
        type="button"
        aria-label="Dismiss"
        className={cn(
          "pointer-events-auto absolute inset-0 transition-opacity duration-300",
          entered ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: fromLeft
            ? "linear-gradient(to right, hsl(var(--foreground) / 0.42) 0%, hsl(var(--foreground) / 0.08) 42%, transparent 100%)"
            : "linear-gradient(to bottom, transparent 0%, hsl(var(--foreground) / 0.08) 42%, hsl(var(--foreground) / 0.42) 100%)",
        }}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "pointer-events-auto relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_48px_-16px_hsl(var(--foreground)/0.35)] will-change-transform transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          fromLeft ? "group/sheet my-0" : "group/sheet mx-auto w-full max-w-[720px]",
          entered
            ? "translate-x-0 translate-y-0 opacity-100"
            : fromLeft
              ? "-translate-x-4 opacity-0"
              : "translate-y-4 opacity-0"
        )}
        style={
          fromLeft
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
          aria-orientation={fromLeft ? "vertical" : "horizontal"}
          aria-valuenow={fromLeft ? width : height}
          aria-valuemin={fromLeft ? MIN_WIDTH : MIN_HEIGHT}
          aria-valuemax={fromLeft ? MAX_WIDTH : MAX_HEIGHT}
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
            fromLeft
              ? "inset-y-0 right-0 flex w-4 cursor-col-resize items-center justify-end"
              : "inset-x-0 top-0 flex h-4 cursor-row-resize items-start justify-center"
          )}
        >
          <span
            className={cn(
              "rounded-full bg-muted-foreground/30 transition-colors",
              "group-hover/handle:bg-muted-foreground/50",
              dragging && "bg-foreground/55",
              fromLeft ? "mr-1.5 h-10 w-1" : "mt-1.5 h-1 w-10"
            )}
          />
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            fromLeft ? "pr-3" : "pt-3"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
