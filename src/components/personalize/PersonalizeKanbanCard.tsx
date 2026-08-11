import { useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  MoreVertical,
  PanelRight,
  Sparkles,
} from "@/components/icons/protoLucide";
import {
  personalizeLandingPath,
  phasesFor,
  type Personalization,
} from "../../data/personalizations";
import type { CampaignStatus } from "../../data/campaigns";
import { daysSince, formatShortDate, relativeTime } from "../../lib/dates";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import { useWandzStore } from "../../store/wandz";
import { Target } from "@/components/icons/protoLucide";
import StatusBadge, { VitalsIcon } from "../ui/StatusBadge";
import CreatorAvatar from "../ui/CreatorAvatar";

// Statuses whose campaigns have started: they carry vitals, results, and the
// full three-stat row.
const STARTED_STATUSES: CampaignStatus[] = [
  "Running",
  "Paused",
  "In Analysis",
  "Ended",
];

// Same actions as the table row kebab.
const ROW_ACTIONS = ["Clone", "Timeline", "Archive", "Delete"];

const CARD_ICON_BUTTON =
  "h-auto w-auto p-1 text-muted-foreground hover:text-foreground";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-0">
      <div className="text-lg font-semibold tabular-nums text-foreground">
        {value.toLocaleString("en-US")}
      </div>
      <div className="truncate text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function footerText(campaign: Personalization): string {
  const phases = phasesFor(campaign);
  const phaseFrom = phases[phases.length - 1].from;
  switch (campaign.status) {
    case "Draft":
      return `Edited ${relativeTime(campaign.lastUpdated)}`;
    case "In QA":
      return `In QA for ${daysSince(phaseFrom)}d`;
    case "Ready to launch":
      return `Ready for ${daysSince(phaseFrom)}d`;
    case "Running":
      return `Started on ${formatShortDate(campaign.startedOn ?? phaseFrom)}`;
    case "Paused":
      return `Paused on ${formatShortDate(phaseFrom)}`;
    case "In Analysis":
      return `In analysis since ${formatShortDate(phaseFrom)}`;
    case "Ended":
      return `Ended on ${formatShortDate(phaseFrom)}`;
  }
}

export default function PersonalizeKanbanCard({
  campaign,
  showStatus,
}: {
  campaign: Personalization;
  showStatus: boolean;
}) {
  const navigate = useNavigate();
  const openWandz = useWandzStore((s) => s.toggleWandz);
  
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const started = STARTED_STATUSES.includes(campaign.status);
  const showStats = campaign.status !== "Draft";

  return (
    <div
      role="button"
      tabIndex={0}
                  onClick={() => navigate(personalizeLandingPath(campaign))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(personalizeLandingPath(campaign));
        }
      }}
      className={cn(
        "group relative cursor-pointer rounded-lg border bg-background p-3 transition-[box-shadow,background-color,border-color] duration-150 hover:shadow-sm",
        "border-border"
      )}
    >
      {/* A) Title row */}
      <div className="flex items-center gap-2">
        <Target
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-label={campaign.type}
        />
        <span
          title={campaign.name}
          className="min-w-0 truncate text-sm font-medium text-foreground"
        >
          {campaign.name}
        </span>
        {started && (
          <span className="shrink-0">
            <VitalsIcon campaign={campaign} />
          </span>
        )}
        {/* Hover/focus-revealed actions — stay visible while Quick view is open */}
        <div
          className={cn(
            "ml-auto hidden shrink-0 items-center gap-0.5 group-focus-within:flex group-hover:flex group-has-[[data-state=open]]:flex"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Summarise with Wandz"
            aria-label="Summarise with Wandz"
            onClick={(e) => {
              stop(e);
              openWandz({ kind: "general" });
            }}
            className={CARD_ICON_BUTTON}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            title="Quick view (coming soon)"
            aria-label="Quick view (coming soon)"
            onClick={stop}
            className={CARD_ICON_BUTTON}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="More"
                aria-label="More"
                onClick={stop}
                className={CARD_ICON_BUTTON}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                {/* TODO: wire up row actions (Clone / Timeline / Archive / Delete) */}
                {ROW_ACTIONS.map((action) => (
                  <DropdownMenu.Item
                    key={action}
                    onSelect={(e) => e.stopPropagation()}
                    className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                  >
                    {action}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* B) Status badge — omitted when the column already carries the status */}
      {showStatus && (
        <div className="mt-2">
          <StatusBadge status={campaign.status} />
        </div>
      )}

      {/* C) Result line — started campaigns only */}
            {/* D) Stats by status: none / Variations only / all three */}
      {showStats && (
        <div className="mt-3 flex items-start gap-6">
          <Stat value={campaign.experiences} label="Experiences" />
          {started && (
            <>
              <Stat value={campaign.visitors} label="Visitors" />
              <Stat value={campaign.uniqueConversions} label="U.Conversions" />
            </>
          )}
        </div>
      )}

      {/* E) Divider + F) footer */}
      <div className="mt-3 border-t border-border pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{footerText(campaign)}</span>
          <span onClick={stop}>
            <CreatorAvatar name={campaign.createdBy} />
          </span>
        </div>
      </div>
    </div>
  );
}
