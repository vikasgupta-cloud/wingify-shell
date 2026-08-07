import type { Campaign, CampaignStatus } from "../../data/campaigns";
import { breachedVitalFor } from "../../data/campaignConclusion";
import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// The only place (with VitalsIcon below) that uses the colored status tokens.
const STATUS_CLASSES: Record<CampaignStatus, string> = {
  Draft: "bg-status-draft-bg text-status-draft-fg",
  "In QA": "bg-status-qa-bg text-status-qa-fg",
  "Ready to launch": "bg-status-ready-bg text-status-ready-fg",
  Running: "bg-status-running-bg text-status-running-fg",
  "In Analysis": "bg-status-analysis-bg text-status-analysis-fg",
  Paused: "bg-status-paused-bg text-status-paused-fg",
  Ended: "bg-status-ended-bg text-status-ended-fg",
};

export default function StatusBadge({
  status,
  className,
  children,
}: {
  status: CampaignStatus;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status],
        className
      )}
    >
      {status}
      {children}
    </span>
  );
}

/**
 * Heart + pulse vitals glyph (inline SVG). Color via currentColor
 * (`text-vitals-healthy` / `text-vitals-unhealthy` / `text-foreground`).
 */
export function VitalsGlyph({
  className,
  size = 20,
  title,
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M19.5 12.572 12 20 4.5 12.572a5 5 0 1 1 7.5-6.966 5 5 0 1 1 7.5 6.966Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M7.25 12.25h2.1l1.35-2.75 2.1 5.5 1.35-2.75h2.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VitalsIcon({
  campaign,
}: {
  campaign: { vitals: "healthy" | "unhealthy" | null; id?: string };
}) {
  const vitals = campaign.vitals;
  // null vitals (pre-launch) render as today — a muted dash, no tooltip.
  if (vitals === null) return <span className="text-sm text-muted-foreground">–</span>;
  const breachDetail =
    campaign.id && "scenario" in campaign
      ? breachedVitalFor(campaign as Campaign)
      : "metric guardrail";
  const label =
    vitals === "healthy" ? "Vitals healthy" : `Vitals breach: ${breachDetail}`;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" aria-label={label}>
            <VitalsGlyph
              size={16}
              className={cn(
                vitals === "healthy"
                  ? "text-vitals-healthy"
                  : "text-vitals-unhealthy"
              )}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
