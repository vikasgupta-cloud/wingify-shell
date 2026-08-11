import { Award, CircleDashed, Hourglass, Scale, ThumbsUp, type LucideIcon } from "@/components/icons/protoLucide";
import type { Campaign } from "../../data/campaigns";
import type { ConclusionKind } from "../../data/campaignConclusion";
import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Shared tooltip / a11y text per conclusion kind — reused by listing + report. */
export function conclusionStateLabel(kind: ConclusionKind): string {
  switch (kind) {
    case "collecting":
      return "Collecting data";
    case "progress":
      return "In progress";
    case "winner":
      return "Winner — variation beats baseline";
    case "baseline":
      return "Baseline is best — keep control";
    case "inconclusive":
      return "No significant winner";
  }
}

const ICONS: Record<
  ConclusionKind,
  { icon: LucideIcon; className: string }
> = {
  // Simple dashed-circle glyph — reads as "in progress / not complete yet" and
  // stays calm (no animation) when the collecting state repeats across many
  // table rows at once. Grayscale, like every non-winner state.
  collecting: { icon: CircleDashed, className: "text-muted-foreground" },
  progress: { icon: Hourglass, className: "text-muted-foreground" },
  winner: { icon: Award, className: "text-decision-winner-fg" },
  baseline: { icon: ThumbsUp, className: "text-muted-foreground" },
  inconclusive: { icon: Scale, className: "text-muted-foreground" },
};

/**
 * Single conclusion-state icon wrapped in a shadcn Tooltip. Only the winner uses
 * a decision/success token; every other state is grayscale.
 */
export default function ConclusionStateIcon({
  kind,
  size = 16,
}: {
  kind: ConclusionKind;
  campaign?: Campaign;
  size?: number;
}) {
  const label = conclusionStateLabel(kind);

  const { icon: Icon, className } = ICONS[kind];
  const glyph = (
    <Icon
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center justify-center"
            aria-label={label}
          >
            {glyph}
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
