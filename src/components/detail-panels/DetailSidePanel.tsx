import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import {
  DETAIL_PANEL_META,
  useDetailPanelsStore,
  type DetailPanelId,
} from "../../store/detailPanels";
import {
  SIDE_PANEL_WIDTH,
  useSidePanelWidthStore,
} from "../../store/sidePanelWidth";
import { useVisibleCampaigns } from "../../store/rows";
import ActivityTimeline from "./ActivityTimeline";
import SuggestionsPanel from "./SuggestionsPanel";

/**
 * Cap the docked panel to the space between its live top edge and the bottom of
 * the scroll viewport — same approach as Wandz / Quick View.
 */
function useViewportCappedMaxHeight(
  rootRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      setMaxHeight(undefined);
      return;
    }
    const el = rootRef.current;
    if (!el) return;

    const sync = () => {
      const top = el.getBoundingClientRect().top;
      const bottom =
        (el.closest("main") as HTMLElement | null)?.getBoundingClientRect()
          .bottom ?? window.innerHeight;
      setMaxHeight(Math.max(240, Math.floor(bottom - top - 8)));
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(document.documentElement);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [enabled, rootRef]);

  return maxHeight;
}

function useDragResizeWidth(
  onWidth: (width: number) => void,
  currentWidth: number
) {
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const next = drag.startWidth + (drag.startX - e.clientX);
      onWidth(next);
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [onWidth]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: currentWidth };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return onPointerDown;
}

function panelTitle(id: DetailPanelId): string {
  if (id === "activity" || id === "comments") return "Activity Timeline";
  return DETAIL_PANEL_META[id].title;
}

export default function DetailSidePanel({
  className,
}: {
  className?: string;
}) {
  const { entityId } = useParams();
  const openId = useDetailPanelsStore((s) => s.openId);
  const close = useDetailPanelsStore((s) => s.close);
  const width = useSidePanelWidthStore((s) => s.width);
  const setWidth = useSidePanelWidthStore((s) => s.setWidth);
  const campaigns = useVisibleCampaigns();
  const campaign =
    campaigns.find((c) => c.id === entityId) ?? null;
  const rootRef = useRef<HTMLDivElement>(null);
  const maxHeight = useViewportCappedMaxHeight(rootRef, Boolean(openId));
  const onDragStart = useDragResizeWidth(setWidth, width);

  if (!openId) return null;

  const title = panelTitle(openId);
  const showTimeline = openId === "activity" || openId === "comments";
  const showInsights = openId === "suggestions";

  return (
    <aside
      ref={rootRef}
      aria-label={title}
      className={cn(
        "relative sticky top-4 z-30 flex shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm",
        "max-h-[calc(100dvh-8rem)]",
        className
      )}
      style={{
        width,
        ...(maxHeight != null ? { maxHeight, height: maxHeight } : {}),
      }}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        aria-valuenow={width}
        aria-valuemin={SIDE_PANEL_WIDTH.min}
        aria-valuemax={SIDE_PANEL_WIDTH.max}
        onPointerDown={onDragStart}
        className="absolute inset-y-0 left-0 z-10 w-1.5 cursor-col-resize touch-none hover:bg-foreground/10"
      />

      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="min-w-0 truncate text-sm font-medium text-foreground">
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Close ${title}`}
          className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground"
          onClick={close}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {showTimeline && campaign ? (
        <ActivityTimeline
          campaignId={campaign.id}
          initialFilter={openId === "comments" ? "comment" : "all"}
        />
      ) : showTimeline ? (
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Open a campaign to view activity and comments.
          </p>
        </div>
      ) : showInsights ? (
        <SuggestionsPanel key={campaign?.id ?? "none"} campaign={campaign} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="text-sm text-muted-foreground">
            {DETAIL_PANEL_META[openId].title} content coming soon.
          </p>
        </div>
      )}
    </aside>
  );
}
