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
const STEP = 40;
/** Clears the floating bottom dock (bottom-5 + h-11 + gap). */
const DOCK_CLEARANCE = 80;

/**
 * Bottom sheet for Add — floats above the dock with a top-faded scrim.
 * Drag the top edge to resize (arrow keys when handle focused).
 */
export function EditorBottomSheet({
  open,
  onClose,
  children,
  className,
  defaultHeight = DEFAULT_HEIGHT,
  onHeightChange,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  defaultHeight?: number;
  onHeightChange?: (height: number) => void;
}) {
  const [height, setHeight] = useState(() =>
    Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(defaultHeight)))
  );
  const [entered, setEntered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    originH: number;
  } | null>(null);

  const clamp = useCallback(
    (h: number) => Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(h))),
    []
  );

  const commitHeight = useCallback(
    (h: number) => {
      const next = clamp(h);
      setHeight(next);
      onHeightChange?.(next);
    },
    [clamp, onHeightChange]
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
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prev;
      document.body.style.userSelect = select;
    };
  }, [dragging]);

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      originH: height,
    };
    setDragging(true);
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    commitHeight(drag.originH - (e.clientY - drag.startY));
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
        "pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col justify-end px-4",
        className
      )}
      style={{ paddingBottom: DOCK_CLEARANCE }}
      data-bottom-sheet
    >
      <button
        type="button"
        aria-label="Dismiss"
        className={cn(
          "pointer-events-auto absolute inset-0 transition-opacity duration-300",
          entered ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, hsl(var(--foreground) / 0.08) 42%, hsl(var(--foreground) / 0.42) 100%)",
        }}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "pointer-events-auto relative mx-auto flex w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_48px_-16px_hsl(var(--foreground)/0.35)] will-change-transform transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          entered
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        )}
        style={{ height }}
      >
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-valuenow={height}
          aria-valuemin={MIN_HEIGHT}
          aria-valuemax={MAX_HEIGHT}
          aria-label="Resize sheet"
          tabIndex={0}
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              commitHeight(height + STEP);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              commitHeight(height - STEP);
            }
          }}
          className={cn(
            "group/handle absolute inset-x-0 top-0 z-10 flex h-4 cursor-row-resize items-start justify-center outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          )}
        >
          <span
            className={cn(
              "mt-1.5 h-1 w-10 rounded-full bg-muted-foreground/30 transition-colors",
              "group-hover/handle:bg-muted-foreground/50",
              dragging && "bg-foreground/55"
            )}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col pt-3">{children}</div>
      </div>
    </div>
  );
}
