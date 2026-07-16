import { Equal, ThumbsUp, Trophy, type LucideIcon } from "lucide-react";
import type { Decision } from "../../data/campaigns";
import { cn } from "../../lib/utils";

// One of the few colored surfaces in the app: Winner/Baseline carry the two
// decision tokens; Inconclusive stays neutral; No decision renders nothing.
const ICONS: Partial<Record<Decision, { icon: LucideIcon; className: string }>> = {
  Winner: { icon: Trophy, className: "text-decision-winner-fg" },
  Baseline: { icon: ThumbsUp, className: "text-decision-baseline-fg" },
  Inconclusive: { icon: Equal, className: "text-muted-foreground" },
};

export default function DecisionIcon({ decision }: { decision: Decision }) {
  const entry = ICONS[decision];
  if (!entry) return null;
  const { icon: Icon, className } = entry;
  return (
    <span title={decision} className="inline-flex" aria-label={decision}>
      <Icon className={cn("h-4 w-4 shrink-0", className)} />
    </span>
  );
}
