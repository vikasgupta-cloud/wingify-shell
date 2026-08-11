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
import { Maximize2, Minus, PictureInPicture2, X } from "@/components/icons/protoLucide";
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

export const EDITOR_FLOAT_SIZE = {
  minW: 280,
  maxW: 560,
  minH: 360,
  maxH: 840,
  stepW: 40,
  stepH: 60,
  defaultW: EDITOR_PANEL_WIDTH,
  defaultH: EDITOR_FLOAT_HEIGHT,
} as const;

export function clampFloatSize(size: {
  width: number;
  height: number;
}): { width: number; height: number } {
  return {
    width: Math.min(
      EDITOR_FLOAT_SIZE.maxW,
      Math.max(EDITOR_FLOAT_SIZE.minW, Math.round(size.width))
    ),
    height: Math.min(
      EDITOR_FLOAT_SIZE.maxH,
      Math.max(EDITOR_FLOAT_SIZE.minH, Math.round(size.height))
    ),
  };
}

export function defaultFloatSize(): { width: number; height: number } {
  return {
    width: EDITOR_FLOAT_SIZE.defaultW,
    height: EDITOR_FLOAT_SIZE.defaultH,
  };
}

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
  size: { width: number; height: number };
  onSizeChange: (size: { width: number; height: number }) => void;
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
  size,
  onSizeChange,
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
  type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

  const resizeRef = useRef<{
    pointerId: number;
    edge: ResizeEdge;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originW: number;
    originH: number;
  } | null>(null);
  const [resizeEdge, setResizeEdge] = useState<ResizeEdge | null>(null);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);

  const requestClose = useCallback(() => {
    if (exiting) return;
    // Multi-tab: just drop the active tab without dismissing the window.
    if (tabs.length > 1) {
      onCloseActive?.();
      return;
    }
    setExiting(true);
  }, [exiting, onCloseActive, tabs.length]);

  useEffect(() => {
    if (!exiting) return;
    exitTimerRef.current = window.setTimeout(() => {
      onCloseActive?.();
      setExiting(false);
      exitTimerRef.current = null;
    }, 320);
    return () => {
      if (exitTimerRef.current != null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [exiting, onCloseActive]);

  useEffect(() => {
    const onWinResize = () => {
      onPosChange({
        x: Math.min(pos.x, Math.max(8, window.innerWidth - 80)),
        y: Math.min(pos.y, Math.max(8, window.innerHeight - 48)),
      });
    };
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, [onPosChange, pos.x, pos.y]);

  const showTabs = tabs.length > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  const cursorForEdge = (edge: ResizeEdge) => {
    if (edge === "n" || edge === "s") return "ns-resize";
    if (edge === "e" || edge === "w") return "ew-resize";
    if (edge === "ne" || edge === "sw") return "nesw-resize";
    return "nwse-resize";
  };

  useEffect(() => {
    if (!resizeEdge) return;
    const prev = document.body.style.cursor;
    const select = document.body.style.userSelect;
    document.body.style.cursor = cursorForEdge(resizeEdge);
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prev;
      document.body.style.userSelect = select;
    };
  }, [resizeEdge]);

  const beginResize =
    (edge: ResizeEdge) => (e: ReactPointerEvent<HTMLDivElement>) => {
      if (exiting) return;
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizeRef.current = {
        pointerId: e.pointerId,
        edge,
        startX: e.clientX,
        startY: e.clientY,
        originX: pos.x,
        originY: pos.y,
        originW: size.width,
        originH: size.height,
      };
      setResizeEdge(edge);
    };

  const onResizePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== e.pointerId) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    let nextW = state.originW;
    let nextH = state.originH;
    let nextX = state.originX;
    let nextY = state.originY;

    if (state.edge.includes("e")) nextW = state.originW + dx;
    if (state.edge.includes("s")) nextH = state.originH + dy;
    if (state.edge.includes("w")) {
      nextW = state.originW - dx;
      const clampedW = Math.min(
        EDITOR_FLOAT_SIZE.maxW,
        Math.max(EDITOR_FLOAT_SIZE.minW, Math.round(nextW))
      );
      nextX = state.originX + (state.originW - clampedW);
      nextW = clampedW;
    }
    if (state.edge.includes("n")) {
      nextH = state.originH - dy;
      const clampedH = Math.min(
        EDITOR_FLOAT_SIZE.maxH,
        Math.max(EDITOR_FLOAT_SIZE.minH, Math.round(nextH))
      );
      nextY = state.originY + (state.originH - clampedH);
      nextH = clampedH;
    }

    const clamped = clampFloatSize({ width: nextW, height: nextH });
    onSizeChange(clamped);
    if (state.edge.includes("w") || state.edge.includes("n")) {
      onPosChange({
        x: Math.min(Math.max(8, nextX), window.innerWidth - 48),
        y: Math.min(Math.max(8, nextY), window.innerHeight - 40),
      });
    }
  };

  const endResize = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = resizeRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    resizeRef.current = null;
    setResizeEdge(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const edgeProps = (edge: ResizeEdge) => ({
    onPointerDown: beginResize(edge),
    onPointerMove: onResizePointerMove,
    onPointerUp: endResize,
    onPointerCancel: endResize,
  });

  const panelW = minimized ? EDITOR_MINIMIZED_WIDTH : size.width;
  const railInset = 56;
  const slideX = Math.max(
    120,
    (typeof window !== "undefined" ? window.innerWidth : 1200) -
      pos.x -
      panelW / 2 -
      railInset
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tabs.find((t) => t.id === activeId)?.label ?? "Panel"}
      className={cn(
        "fixed z-50 flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-none will-change-transform",
        (dragging || resizeEdge || exiting) && "select-none",
        dragging && "cursor-grabbing",
        exiting && "pointer-events-none"
      )}
      style={{
        left: pos.x,
        top: pos.y,
        width: panelW,
        height: minimized ? 36 : size.height,
        maxHeight: minimized ? 36 : "calc(100vh - 24px)",
        opacity: exiting ? 0 : 1,
        transform: exiting
          ? `translateX(${slideX}px) scale(0.86)`
          : "translateX(0) scale(1)",
        transformOrigin: "right center",
        transition: exiting
          ? "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms ease"
          : undefined,
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
                title={tab.label}
                aria-label={tab.label}
                aria-pressed={tab.id === activeId}
                onClick={() => onActiveIdChange(tab.id)}
                className={cn(
                  "inline-flex size-7 shrink-0 items-center justify-center rounded-md outline-none transition-colors",
                  tab.id === activeId
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.icon}
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
            onClick={requestClose}
          >
            <X className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {!minimized && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      )}

      {!minimized && (
        <>
          <div
            aria-hidden
            {...edgeProps("n")}
            className="absolute inset-x-3 top-0 z-20 h-1.5 cursor-ns-resize"
          />
          <div
            aria-hidden
            {...edgeProps("s")}
            className="absolute inset-x-3 bottom-0 z-20 h-1.5 cursor-ns-resize"
          />
          <div
            aria-hidden
            {...edgeProps("e")}
            className="absolute inset-y-3 right-0 z-20 w-1.5 cursor-ew-resize"
          />
          <div
            aria-hidden
            {...edgeProps("w")}
            className="absolute inset-y-3 left-0 z-20 w-1.5 cursor-ew-resize"
          />
          <div
            aria-hidden
            {...edgeProps("nw")}
            className="absolute left-0 top-0 z-30 size-3 cursor-nwse-resize"
          />
          <div
            aria-hidden
            {...edgeProps("ne")}
            className="absolute right-0 top-0 z-30 size-3 cursor-nesw-resize"
          />
          <div
            aria-hidden
            {...edgeProps("sw")}
            className="absolute bottom-0 left-0 z-30 size-3 cursor-nesw-resize"
          />
          <div
            aria-hidden
            {...edgeProps("se")}
            className="absolute bottom-0 right-0 z-30 flex size-3.5 cursor-nwse-resize items-end justify-end p-0.5"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-sm border-b-2 border-r-2 border-muted-foreground/40 transition-colors",
                resizeEdge === "se" && "border-foreground/70"
              )}
            />
          </div>
        </>
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
