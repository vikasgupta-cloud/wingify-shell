import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 240;
const MAX_WIDTH = 560;
const DEFAULT_WIDTH = 300;
const STEP = 40;

/**
 * Overlay shell for left tool panels — sits on the canvas without pushing layout.
 * Drag the right edge or use +/- to resize.
 */
export function EditorLeftOverlay({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    originW: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const clamp = useCallback(
    (w: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(w))),
    []
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
    setWidth(clamp(drag.originW + (e.clientX - drag.startX)));
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
      data-left-overlay
    >
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden border-r border-border bg-background shadow-[6px_0_16px_-4px_rgba(0,0,0,0.14)]">
        {children}
      </div>

      {/* Resize handle */}
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
            setWidth((w) => clamp(w - STEP));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setWidth((w) => clamp(w + STEP));
          }
        }}
        className={cn(
          "group absolute inset-y-0 -right-1 z-10 flex w-3 cursor-col-resize items-center justify-center",
          dragging && "bg-foreground/5"
        )}
      >
        <span
          className={cn(
            "h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-foreground/40",
            dragging && "bg-foreground/50"
          )}
        />
      </div>

      {/* Size controls */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-0.5 rounded-md border border-border bg-background/95 p-0.5 shadow-sm backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Decrease panel width"
          disabled={width <= MIN_WIDTH}
          onClick={() => setWidth((w) => clamp(w - STEP))}
        >
          <Minus className="size-3.5" strokeWidth={1.75} />
        </Button>
        <span className="min-w-[2.5rem] text-center text-[10px] font-medium tabular-nums text-muted-foreground">
          {width}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Increase panel width"
          disabled={width >= MAX_WIDTH}
          onClick={() => setWidth((w) => clamp(w + STEP))}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  );
}
