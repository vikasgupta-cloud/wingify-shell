import { HelpCircle, Pencil, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfigStore } from "../../store/config";

// Small help "?" affordance with a stubbed tooltip.
function HelpTip() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
          </span>
        </TooltipTrigger>
        {/* TODO: real help copy */}
        <TooltipContent>More info</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// One "label above value" cell used in the SmartStats read-only grids.
function StatCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export default function AdditionalSettings({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const patch = useConfigStore((s) => s.patch);

  if (!config) return null;

  const { smartStats } = config;

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex flex-col gap-10">
        {/* A — Mutually exclusive groups. */}
        <div>
          <div className="mb-3 text-base font-medium text-foreground">
            Mutually exclusive groups
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Add to mutually exclusive group
              </span>
              <HelpTip />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Prevent overlap with other campaigns, each visitor is included in only one
              campaign in the group.
            </p>
            <div className="mt-3">
              {config.mutuallyExclusiveGroup === null ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  // TODO: create-group flow arrives in a later prompt
                >
                  <PlusCircle />
                  Create a mutually exclusive group
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-1 text-xs text-foreground">
                  {config.mutuallyExclusiveGroup}
                  <button
                    type="button"
                    aria-label="Clear group"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => patch(id, { mutuallyExclusiveGroup: null })}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* B — SmartStats configurations. */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-base font-medium text-foreground">
              SmartStats configurations
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              // TODO: edit SmartStats flow arrives in a later prompt
            >
              <Pencil />
              Edit
            </Button>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="pb-4">
              <div className="mb-3 text-sm font-medium text-foreground">
                SmartStats engine
              </div>
              <div className="grid grid-cols-3 gap-6">
                <StatCell label="Stats model" value={smartStats.statsModel} />
                <StatCell label="Testing Approach" value={smartStats.testingApproach} />
                <StatCell
                  label="Multiple testing correction"
                  value={smartStats.multipleTestingCorrection}
                />
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="mb-3 text-sm font-medium text-foreground">
                Observatory mode
              </div>
              <div className="grid grid-cols-3 gap-6">
                <StatCell
                  label="Min visitors / variations"
                  value={smartStats.minVisitorsPerVariation}
                />
                <StatCell
                  label="Min conversion / variations"
                  value={smartStats.minConversionsPerVariation}
                />
                <StatCell
                  label="Convert after"
                  value={`${smartStats.convertAfterDays} days`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* C — Additional options. */}
        <div>
          <div className="mb-3 text-base font-medium text-foreground">
            Additional options
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="pb-4">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Campaign</div>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={config.trackAcrossDomains}
                  onCheckedChange={(v) => patch(id, { trackAcrossDomains: v === true })}
                />
                <span className="text-sm text-foreground">
                  Track visitors across multiple domains
                </span>
                <HelpTip />
              </label>
            </div>
            <div className="border-t border-border pt-4">
              <div className="mb-2 text-sm font-medium text-muted-foreground">Privacy</div>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={config.hideCampaignNames}
                  onCheckedChange={(v) => patch(id, { hideCampaignNames: v === true })}
                />
                <span className="text-sm text-foreground">
                  Hide campaign names in visitor settings
                </span>
                <HelpTip />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
