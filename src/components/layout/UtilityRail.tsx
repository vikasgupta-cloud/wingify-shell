// @summary Right utility rail (Ask Wingz, Activity, Help) — shared by DetailShell and Wingz canvas form.
import type { ComponentType } from "react";
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

/** Right utility rail: Ask Wingz, then Activity; Help pinned to the bottom. */
export default function UtilityRail({ entityId }: { entityId?: string }) {
  const wingzOpen = useWingzStore((s) => s.open);

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
    <TooltipProvider delayDuration={200}>
      <nav
        className="flex h-full shrink-0 flex-col items-center gap-3 border-l border-border bg-rail py-4"
        style={{ width: UTILITY_RAIL_WIDTH }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Ask Wingz"
              aria-pressed={wingzOpen}
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
            className={cn(railButton(false), "mt-auto")}
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>
        </HelpSupportPopover>
      </nav>
    </TooltipProvider>
  );
}
