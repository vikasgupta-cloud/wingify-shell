import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Columns2,
  Files,
  GitBranch,
  Grid2x2,
  PanelRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { hasReport, type Campaign, type CampaignStatus, type CampaignType } from "../../data/campaigns";
import { cn } from "../../lib/utils";
import { useQuickViewStore } from "../../store/quickView";
import { VitalsIcon } from "../ui/StatusBadge";
import StatusMenu from "../ui/StatusMenu";

const TYPE_ICONS: Record<CampaignType, LucideIcon> = {
  "A/B": Columns2,
  MVT: Grid2x2,
  "Split URL": GitBranch,
  Multipage: Files,
};

// Left edge bar uses the status foreground token as its fill.
const STATUS_BAR: Record<CampaignStatus, string> = {
  Draft: "bg-status-draft-fg",
  "In QA": "bg-status-qa-fg",
  "Ready to launch": "bg-status-ready-fg",
  Running: "bg-status-running-fg",
  "In Analysis": "bg-status-analysis-fg",
  Paused: "bg-status-paused-fg",
  Ended: "bg-status-ended-fg",
};

const CARD_ICON_BUTTON =
  "rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

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

export default function KanbanCard({
  campaign,
  showStatus,
}: {
  campaign: Campaign;
  showStatus: boolean;
}) {
  const navigate = useNavigate();
  const openQuickView = useQuickViewStore((s) => s.open);
  const TypeIcon = TYPE_ICONS[campaign.type];
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/web-experiment/c/${campaign.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/web-experiment/c/${campaign.id}`);
        }
      }}
      className="group relative cursor-pointer rounded-lg border border-border bg-background p-3 pl-4 transition-shadow transition-colors hover:border-foreground/20 hover:shadow-sm"
    >
      {/* Status-colored left edge bar */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] rounded-full",
          STATUS_BAR[campaign.status]
        )}
      />

      {showStatus && (
        <div className="mb-2.5">
          <StatusMenu campaign={campaign} />
        </div>
      )}

      {/* Title row */}
      <div className="flex items-center gap-2">
        <TypeIcon
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-label={campaign.type}
        />
        <span
          title={campaign.name}
          className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
        >
          {campaign.name}
        </span>
        <VitalsIcon vitals={campaign.vitals} />
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          {/* TODO: wire up Summarise with Wandz */}
          <button
            type="button"
            title="Summarise with Wandz"
            aria-label="Summarise with Wandz"
            onClick={stop}
            className={CARD_ICON_BUTTON}
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Quick view"
            aria-label="Quick view"
            onClick={(e) => {
              stop(e);
              openQuickView(campaign.id);
            }}
            className={CARD_ICON_BUTTON}
          >
            <PanelRight className="h-4 w-4" />
          </button>
          {hasReport(campaign.status) && (
            <Link
              to={`/web-experiment/c/${campaign.id}/reports`}
              title="Reports"
              aria-label="Reports"
              onClick={stop}
              className={CARD_ICON_BUTTON}
            >
              <BarChart3 className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat value={campaign.variations} label="Variations" />
        <Stat value={campaign.visitors} label="Visitors" />
        <Stat value={campaign.uniqueConversions} label="U.Conversions" />
      </div>
    </div>
  );
}
