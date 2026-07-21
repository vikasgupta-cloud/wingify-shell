import type { Campaign, CampaignStatus } from "../../data/campaigns";
import { cn } from "../../lib/utils";

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
 * VWO `icon--vitals` glyph (viewBox 0 0 32 32).
 * Heart with pulse — color via currentColor (text-vitals-* / text-foreground).
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
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 27.8c-.32 0-.64-.1-.9-.32C13.4 26 4.2 18.2 4.2 11.7 4.2 7.55 7.4 4.2 11.35 4.2c2.05 0 3.92.98 5.1 2.58 1.18-1.6 3.05-2.58 5.1-2.58 3.95 0 7.15 3.35 7.15 7.5 0 6.5-9.2 14.3-10.9 15.78-.26.22-.58.32-.9.32h-.1ZM8.4 15.2h3.1l1.55-2.85c.28-.52 1.02-.55 1.35-.05L16.3 15.2h3.1c.55 0 1 .45 1 1s-.45 1-1 1h-3.55c-.3 0-.58-.14-.76-.38l-1.2-1.65-1.55 2.85c-.17.32-.5.52-.86.52-.35 0-.67-.19-.84-.5l-1.4-2.54H8.4c-.55 0-1-.45-1-1s.45-1 1-1Z"
      />
    </svg>
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
