import type { Campaign, CampaignStatus } from "../../data/campaigns";
import { cn } from "../../lib/utils";
import vitalsIcon from "@/assets/icons/vitals.png";

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
 * Heart + pulse vitals glyph. Color via currentColor (text-vitals-* / text-foreground).
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
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      title={title}
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        width: size,
        height: size,
        maskImage: `url(${vitalsIcon})`,
        WebkitMaskImage: `url(${vitalsIcon})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function VitalsIcon({ vitals }: { vitals: Campaign["vitals"] }) {
  if (vitals === null) return <span className="text-sm text-muted-foreground">–</span>;
  const label = vitals === "healthy" ? "Vitals healthy" : "Vitals unhealthy";
  return (
    <VitalsGlyph
      size={16}
      title={label}
      className={cn(
        vitals === "healthy" ? "text-vitals-healthy" : "text-vitals-unhealthy"
      )}
    />
  );
}
