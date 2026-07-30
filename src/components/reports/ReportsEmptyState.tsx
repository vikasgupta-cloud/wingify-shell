import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Campaign } from "../../data/campaigns";

export function ReportsEmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 180"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="28"
        y="24"
        width="224"
        height="132"
        rx="12"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        fill="hsl(var(--background))"
      />
      <rect
        x="28"
        y="24"
        width="224"
        height="28"
        rx="12"
        fill="hsl(var(--muted))"
      />
      <rect x="28" y="40" width="224" height="12" fill="hsl(var(--muted))" />
      <circle cx="48" cy="38" r="4" fill="hsl(var(--muted-foreground) / 0.35)" />
      <circle cx="62" cy="38" r="4" fill="hsl(var(--muted-foreground) / 0.25)" />
      <circle cx="76" cy="38" r="4" fill="hsl(var(--muted-foreground) / 0.18)" />

      <path
        d="M56 128 V96 M88 128 V84 M120 128 V104 M152 128 V72 M184 128 V90 M216 128 V78"
        stroke="hsl(var(--border))"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M52 118 C84 108, 108 92, 140 86 C172 80, 196 70, 224 62"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <circle
        cx="224"
        cy="62"
        r="4"
        fill="hsl(var(--foreground))"
        fillOpacity="0.35"
      />

      <rect
        x="96"
        y="148"
        width="88"
        height="10"
        rx="5"
        fill="hsl(var(--muted))"
      />
      <rect
        x="114"
        y="164"
        width="52"
        height="6"
        rx="3"
        fill="hsl(var(--muted))"
        fillOpacity="0.7"
      />
    </svg>
  );
}

/**
 * Shared "no report yet" state. `compact` fits the narrow quick-view panel;
 * the default fills the reports page.
 */
export default function ReportsEmptyState({
  campaign,
  compact = false,
}: {
  campaign: Campaign;
  compact?: boolean;
}) {
  const notStarted =
    campaign.status === "Draft" ||
    campaign.status === "In QA" ||
    campaign.status === "Ready to launch";
  const headline = notStarted
    ? "Reports unlock when this campaign starts"
    : "No report data for this campaign yet";
  const body = notStarted
    ? "You’ll be able to see results, variations, and insights here once the campaign is running and collecting data."
    : "This campaign isn’t in a reportable state right now. Start or resume it to collect data and view results.";

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact
          ? "h-full px-4 py-8"
          : "h-full min-h-[28rem] bg-canvas px-6 py-16"
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col items-center text-center",
          compact ? "max-w-[260px]" : "max-w-lg"
        )}
      >
        <div
          className={cn(
            "w-full text-muted-foreground",
            compact ? "mb-4 max-w-[132px]" : "mb-8 max-w-[280px]"
          )}
        >
          <ReportsEmptyIllustration className="h-auto w-full" />
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-border bg-background font-medium uppercase tracking-wide text-muted-foreground",
            compact
              ? "mb-2 px-2 py-0.5 text-[10px]"
              : "mb-3 px-2.5 py-0.5 text-[11px]"
          )}
        >
          {campaign.status}
        </span>
        <h2
          className={cn(
            "font-semibold tracking-tight text-foreground",
            compact ? "text-sm" : "text-xl"
          )}
        >
          {headline}
        </h2>
        <p
          className={cn(
            "text-muted-foreground",
            compact
              ? "mt-1 text-xs leading-5"
              : "mt-2 max-w-md text-sm leading-6"
          )}
        >
          {body}
        </p>
        <Button
          asChild
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn("rounded-md", compact ? "mt-4" : "mt-6")}
        >
          <Link to={`/web-experiment/c/${campaign.id}`}>
            Open campaign setup
          </Link>
        </Button>
      </div>
    </div>
  );
}
