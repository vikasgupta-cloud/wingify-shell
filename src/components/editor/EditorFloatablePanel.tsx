import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minus, PictureInPicture2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditorPanelChromeMode = "docked" | "floating" | "minimized";

export type EditorPanelChrome = {
  mode: EditorPanelChromeMode;
  pos: { x: number; y: number };
};

export const EDITOR_PANEL_WIDTH = 300;
export const EDITOR_FLOAT_HEIGHT = 560;
export const EDITOR_MINIMIZED_WIDTH = 240;

export type EditorPanelGroupDragHandlers = {
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
};

export type EditorFloatingTab = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type EditorFloatablePanelProps = {
  title: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  bodyClassName?: string;
  chrome: EditorPanelChrome;
  onChromeChange: (next: EditorPanelChrome) => void;
  onReattach?: () => void;
  /** Card inside a shared floating group (no portal). */
  grouped?: boolean;
  /** Hide local chrome — parent tab shell owns header/actions. */
  tabPane?: boolean;
  groupDrag?: EditorPanelGroupDragHandlers;
};

export function defaultFloatPos(): { x: number; y: number } {
  const margin = 72;
  return {
    x: Math.max(
      16,
      (typeof window !== "undefined" ? window.innerWidth : 1200) -
        EDITOR_PANEL_WIDTH -
        margin
    ),
    y: Math.max(
      56,
      Math.round(
        (typeof window !== "undefined" ? window.innerHeight : 800) * 0.12
      )
    ),
  };
}

export function defaultPanelChrome(): EditorPanelChrome {
  return {
    mode: "docked",
    pos: defaultFloatPos(),
  };
}

/**
 * Docked side panel that can float, drag, minimize, and reattach.
 * When `grouped`/`tabPane`, sits inside EditorFloatingPanelGroup.
 */
export function EditorFloatablePanel({
  title,
  icon,
  onClose,
  children,
  bodyClassName,
  chrome,
  onChromeChange,
  onReattach,
  grouped = false,
  tabPane = false,
  groupDrag,
}: EditorFloatablePanelProps) {
  const titleId = useId();
  const { mode, pos } = chrome;
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (mode === "docked") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  const setMode = useCallback(
    (nextMode: EditorPanelChromeMode, nextPos?: { x: number; y: number }) => {
      onChromeChange({
        mode: nextMode,
        pos: nextPos ?? pos,
      });
    },
    [onChromeChange, pos]
  );

  const placeNearRight = useCallback(() => defaultFloatPos(), []);

  useEffect(() => {
    if (mode === "docked" || grouped) return;
    const onResize = () => {
      onChromeChange({
        mode,
        pos: {
          x: Math.min(pos.x, Math.max(8, window.innerWidth - 80)),
          y: Math.min(pos.y, Math.max(8, window.innerHeight - 48)),
        },
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [grouped, mode, onChromeChange, pos.x, pos.y]);

  const floatPanel = () => {
    setMode("floating", placeNearRight());
  };

  const reattach = () => {
    setMode("docked");
    onReattach?.();
  };

  const minimize = () => {
    const nextPos = mode === "docked" ? placeNearRight() : pos;
    setMode("minimized", nextPos);
  };

  const expand = () => {
    setMode("floating");
  };

  const onHeaderPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (mode === "docked") return;
    if ((e.target as HTMLElement).closest("button")) return;
    if (grouped && groupDrag) {
      groupDrag.onPointerDown(e);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
    setDragging(true);
  };

  const onHeaderPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (grouped && groupDrag) {
      groupDrag.onPointerMove(e);
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    onChromeChange({
      mode,
      pos: {
        x: Math.min(
          Math.max(8, drag.originX + (e.clientX - drag.startX)),
          window.innerWidth - 48
        ),
        y: Math.min(
          Math.max(8, drag.originY + (e.clientY - drag.startY)),
          window.innerHeight - 40
        ),
      },
    });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (grouped && groupDrag) {
      groupDrag.onPointerUp(e);
      return;
    }
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

  const headerActions = (
    <div className="flex shrink-0 items-center gap-0.5">
      {mode !== "minimized" && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 rounded-lg"
          aria-label="Minimize panel"
          onClick={minimize}
        >
          <Minus className="size-4" strokeWidth={1.75} />
        </Button>
      )}
      {mode === "minimized" && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 rounded-lg"
          aria-label="Expand panel"
          onClick={expand}
        >
          <Maximize2 className="size-3.5" strokeWidth={1.75} />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-lg"
        aria-label={mode === "docked" ? "Float panel" : "Reattach panel"}
        title={mode === "docked" ? "Float panel" : "Reattach panel"}
        onClick={mode === "docked" ? floatPanel : reattach}
      >
        <PictureInPicture2 className="size-4" strokeWidth={1.75} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 rounded-lg"
        aria-label="Close panel"
        onClick={onClose}
      >
        <X className="size-4" strokeWidth={1.75} />
      </Button>
    </div>
  );

  const titleRow = (
    <div className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-foreground">
      {icon}
      {typeof title === "string" ? (
        <span className="truncate">{title}</span>
      ) : (
        title
      )}
    </div>
  );

  if (mode === "docked") {
    return (
      <aside
        className="flex w-[300px] shrink-0 flex-col border-l border-border bg-background shadow-none"
        aria-labelledby={titleId}
      >
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
          <div id={titleId}>{titleRow}</div>
          {headerActions}
        </div>
        <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>
          {children}
        </div>
      </aside>
    );
  }

  // Tab pane: body only — shell owns chrome.
  if (grouped && tabPane) {
    return (
      <div
        className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}
        aria-labelledby={titleId}
      >
        <span id={titleId} className="sr-only">
          {title}
        </span>
        {children}
      </div>
    );
  }

  const card = (
    <div
      role="dialog"
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col overflow-hidden bg-background",
        grouped
          ? "h-full min-h-0 w-full"
          : "fixed z-50 rounded-lg border border-border shadow-none",
        !grouped && dragging && "cursor-grabbing select-none"
      )}
      style={
        grouped
          ? undefined
          : {
              left: pos.x,
              top: pos.y,
              width:
                mode === "minimized"
                  ? EDITOR_MINIMIZED_WIDTH
                  : EDITOR_PANEL_WIDTH,
              height: mode === "minimized" ? 36 : EDITOR_FLOAT_HEIGHT,
              maxHeight: mode === "minimized" ? 36 : "calc(100vh - 24px)",
            }
      }
    >
      <div
        className={cn(
          "flex h-9 shrink-0 items-center justify-between border-b border-border px-3",
          "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={mode === "minimized" ? expand : undefined}
      >
        <div id={titleId} className="min-w-0 flex-1">
          {titleRow}
        </div>
        {headerActions}
      </div>
      {mode === "floating" && (
        <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>
          {children}
        </div>
      )}
    </div>
  );

  if (grouped) return card;
  return createPortal(card, document.body);
}

type EditorFloatingPanelGroupProps = {
  pos: { x: number; y: number };
  onPosChange: (pos: { x: number; y: number }) => void;
  tabs: EditorFloatingTab[];
  activeId: string;
  onActiveIdChange: (id: string) => void;
  minimized?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
  onReattachActive?: () => void;
  onCloseActive?: () => void;
  drag: EditorPanelGroupDragHandlers;
  dragging?: boolean;
  children: ReactNode;
};

/** Shared floating shell — multiple detached panels as tabs in one window. */
export function EditorFloatingPanelGroup({
  pos,
  onPosChange,
  tabs,
  activeId,
  onActiveIdChange,
  minimized = false,
  onMinimize,
  onExpand,
  onReattachActive,
  onCloseActive,
  drag,
  dragging,
  children,
}: EditorFloatingPanelGroupProps) {
  useEffect(() => {
    const onResize = () => {
      onPosChange({
        x: Math.min(pos.x, Math.max(8, window.innerWidth - 80)),
        y: Math.min(pos.y, Math.max(8, window.innerHeight - 48)),
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onPosChange, pos.x, pos.y]);

  const showTabs = tabs.length > 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseActive?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCloseActive]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tabs.find((t) => t.id === activeId)?.label ?? "Panel"}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-none",
        dragging && "cursor-grabbing select-none"
      )}
      style={{
        left: pos.x,
        top: pos.y,
        width: minimized ? EDITOR_MINIMIZED_WIDTH : EDITOR_PANEL_WIDTH,
        height: minimized ? 36 : EDITOR_FLOAT_HEIGHT,
        maxHeight: minimized ? 36 : "calc(100vh - 24px)",
      }}
    >
      <div
        className={cn(
          "flex h-9 shrink-0 items-center gap-1 border-b border-border px-1.5",
          "cursor-grab active:cursor-grabbing"
        )}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerCancel={drag.onPointerUp}
        onDoubleClick={minimized ? onExpand : undefined}
      >
        {showTabs ? (
          <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onActiveIdChange(tab.id)}
                className={cn(
                  "inline-flex h-7 min-w-0 max-w-[50%] items-center gap-1 truncate rounded-md px-2 text-xs font-semibold outline-none transition-colors",
                  tab.id === activeId
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-1.5 px-1.5 text-sm font-semibold text-foreground">
            {tabs[0]?.icon}
            <span className="truncate">{tabs[0]?.label}</span>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-0.5">
          {!minimized && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg"
              aria-label="Minimize panel"
              onClick={onMinimize}
            >
              <Minus className="size-4" strokeWidth={1.75} />
            </Button>
          )}
          {minimized && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-lg"
              aria-label="Expand panel"
              onClick={onExpand}
            >
              <Maximize2 className="size-3.5" strokeWidth={1.75} />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
            aria-label="Reattach panel"
            title="Reattach panel"
            onClick={onReattachActive}
          >
            <PictureInPicture2 className="size-4" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-lg"
            aria-label="Close panel"
            onClick={onCloseActive}
          >
            <X className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {!minimized && (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      )}
    </div>,
    document.body
  );
}

/** Hook helpers for group dragging — owned by EditorPage. */
export function useFloatingGroupDrag(
  pos: { x: number; y: number },
  onPosChange: (pos: { x: number; y: number }) => void
): { drag: EditorPanelGroupDragHandlers; dragging: boolean } {
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const drag: EditorPanelGroupDragHandlers = {
    onPointerDown: (e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: pos.x,
        originY: pos.y,
      };
      setDragging(true);
    },
    onPointerMove: (e) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      onPosChange({
        x: Math.min(
          Math.max(8, d.originX + (e.clientX - d.startX)),
          window.innerWidth - 48
        ),
        y: Math.min(
          Math.max(8, d.originY + (e.clientY - d.startY)),
          window.innerHeight - 40
        ),
      });
    },
    onPointerUp: (e) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      dragRef.current = null;
      setDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    },
  };

  return { drag, dragging };
}
