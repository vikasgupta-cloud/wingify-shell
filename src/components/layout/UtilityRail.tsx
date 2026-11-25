// @summary Right utility rail (Ask Wingz, Activity, Help) — peeks in from the
// right edge on hover. Shared by DetailShell and Wingz canvas form.
import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Activity,
  HelpCircle,
  Sparkles,
} from "@/components/icons/protoLucide";
import { UTILITY_RAIL_WIDTH } from "@/lib/nav";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DETAIL_PANEL_META,
  DETAIL_PANEL_RAIL_ORDER,
  useDetailPanelsStore,
  type DetailPanelId,
} from "@/store/detailPanels";
import { useWingzStore } from "@/store/wingz";
import ActivityOverviewPopover from "./ActivityOverviewPopover";
import HelpSupportPopover from "./HelpSupportPopover";

const RAIL_PANEL_ICONS: Record<
  DetailPanelId,
  ComponentType<{ className?: string }>
> = {
  activity: Activity,
};

/** Dwell before peeking the rail open (avoids brush-by opens). */
const EDGE_OPEN_DELAY_MS = 120;
/** Grace before hiding after the cursor leaves the rail / hotzone. */
const EDGE_CLOSE_GRACE_MS = 220;
/** Invisible strip on the right viewport edge that reveals the rail. */
const EDGE_HOTZONE_WIDTH = 12;

/** Right utility rail: Ask Wingz, then Activity; Help pinned to the bottom. */
export default function UtilityRail({ entityId }: { entityId?: string }) {
  const wingzOpen = useWingzStore((s) => s.open);
  const detailOpen = useDetailPanelsStore((s) => s.openId) !== null;
  const [peeked, setPeeked] = useState(false);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);

  // Keep visible while Wingz / a detail panel is open so the controls stay reachable.
  const visible = peeked || wingzOpen || detailOpen;

  const cancelOpen = () => window.clearTimeout(openTimer.current);
  const cancelClose = () => window.clearTimeout(closeTimer.current);

  const scheduleOpen = () => {
    cancelClose();
    cancelOpen();
    openTimer.current = window.setTimeout(
      () => setPeeked(true),
      EDGE_OPEN_DELAY_MS
    );
  };

  const scheduleClose = () => {
    cancelOpen();
    cancelClose();
    closeTimer.current = window.setTimeout(
      () => setPeeked(false),
      EDGE_CLOSE_GRACE_MS
    );
  };

  useEffect(() => {
    return () => {
      cancelOpen();
      cancelClose();
    };
  }, []);

  const railButton = (active: boolean, disabled = false) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors",
      disabled
        ? "cursor-not-allowed text-muted-foreground/40"
        : "hover:bg-muted",
      active && !disabled && "bg-accent text-foreground"
    );

  const handleAskWingz = () => {
    useDetailPanelsStore.getState().close();
    const { open, closeWingz, openWingz } = useWingzStore.getState();
    if (open) closeWingz();
    else openWingz({ kind: "campaign", campaignId: entityId ?? "" });
  };

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-40"
      style={{ width: UTILITY_RAIL_WIDTH }}
    >
      {/* Edge hotzone — always on; reveals the rail when the cursor hits the right side. */}
      <div
        aria-hidden
        className="pointer-events-auto absolute inset-y-0 right-0"
        style={{ width: EDGE_HOTZONE_WIDTH }}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
      />

      <div
        className={cn(
          "pointer-events-auto absolute inset-y-0 right-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
          visible ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
        style={{ width: UTILITY_RAIL_WIDTH }}
        onMouseEnter={() => {
          cancelClose();
          setPeeked(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <TooltipProvider delayDuration={200}>
          <nav
            aria-hidden={!visible}
            className="flex h-full w-full flex-col items-center gap-3 border-l border-border bg-rail py-4 shadow-sm"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Ask Wingz"
                  aria-pressed={wingzOpen}
                  tabIndex={visible ? 0 : -1}
                  onClick={handleAskWingz}
                  className={railButton(wingzOpen)}
                >
                  <Sparkles className="h-[18px] w-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Ask Wingz</TooltipContent>
            </Tooltip>

            {DETAIL_PANEL_RAIL_ORDER.map((id) => {
              const Icon = RAIL_PANEL_ICONS[id];
              const meta = DETAIL_PANEL_META[id];
              const disabled = Boolean(meta.disabled);
              const button = (
                <button
                  type="button"
                  aria-label={meta.label}
                  aria-disabled={disabled}
                  disabled={disabled}
                  tabIndex={visible ? 0 : -1}
                  className={railButton(false, disabled)}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </button>
              );

              if (id === "activity" && !disabled) {
                return (
                  <ActivityOverviewPopover key={id} side="left" align="start">
                    {button}
                  </ActivityOverviewPopover>
                );
              }

              return (
                <Tooltip key={id}>
                  <TooltipTrigger asChild>
                    {disabled ? (
                      <span className="inline-flex">{button}</span>
                    ) : (
                      button
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {disabled ? `${meta.label} (coming soon)` : meta.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}

            <HelpSupportPopover side="left" align="end">
              <button
                type="button"
                aria-label="Help"
                tabIndex={visible ? 0 : -1}
                className={cn(railButton(false), "mt-auto")}
              >
                <HelpCircle className="h-[18px] w-[18px]" />
              </button>
            </HelpSupportPopover>
          </nav>
        </TooltipProvider>
      </div>
    </div>
  );
}
