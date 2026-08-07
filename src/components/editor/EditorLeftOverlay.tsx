// Summary: Tool-panel overlay for Layers/Add/etc. Supports left or right
// anchoring — right is used now that tools live on the utility rail.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 240;
const MAX_WIDTH = 640;
const DEFAULT_WIDTH = 300;
const STEP = 40;

/**
 * Overlay shell for tool panels — sits on the canvas without pushing layout.
 * `side="right"` places the panel on the canvas’s right edge (next to the rail).
 * Drag the inner edge to resize (arrow keys when handle focused).
 */
export function EditorLeftOverlay({
  children,
  className,
  side = "left",
  defaultWidth = DEFAULT_WIDTH,
  onWidthChange,
}: {
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
  defaultWidth?: number;
  onWidthChange?: (width: number) => void;
}) {
  const [width, setWidth] = useState(() =>
    Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(defaultWidth)))
  );
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    originW: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const isRight = side === "right";

  const clamp = useCallback(
    (w: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(w))),
    []
  );

  const commitWidth = useCallback(
    (w: number) => {
      const next = clamp(w);
      setWidth(next);
      onWidthChange?.(next);
    },
    [clamp, onWidthChange]
  );

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      originW: width,
    };
    setDragging(true);
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const delta = e.clientX - drag.startX;
    // Left panel grows to the right; right panel grows to the left.
    commitWidth(drag.originW + (isRight ? -delta : delta));
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

  useEffect(() => {
    if (!dragging) return;
    const prev = document.body.style.cursor;
    const select = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prev;
      document.body.style.userSelect = select;
    };
  }, [dragging]);

  return (
    <div
      className={cn("relative flex h-full", className)}
      style={{ width }}
      data-left-overlay={side}
    >
      <div
        className={cn(
          "flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-background",
          isRight ? "border-l border-border" : "border-r border-border"
        )}
      >
        {children}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={width}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-label="Resize panel"
        tabIndex={0}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            commitWidth(width + (isRight ? STEP : -STEP));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            commitWidth(width + (isRight ? -STEP : STEP));
          }
        }}
        className={cn(
          "group/handle absolute inset-y-0 z-10 flex w-4 cursor-col-resize items-center justify-center outline-none",
          isRight ? "-left-2" : "-right-2",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-foreground/0 transition-colors",
            "group-hover/handle:bg-foreground/20",
            dragging && "bg-foreground/35"
          )}
        />
        <span
          className={cn(
            "pointer-events-none relative h-8 w-1 rounded-full bg-muted-foreground/0 transition-all duration-150",
            "group-hover/handle:h-10 group-hover/handle:bg-muted-foreground/45",
            dragging && "h-12 bg-foreground/55"
          )}
        />
      </div>
    </div>
  );
}
