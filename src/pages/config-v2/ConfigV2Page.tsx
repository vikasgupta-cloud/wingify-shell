import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useVisibleCampaigns } from "../../store/rows";
import {
  useConfigV2Store,
  ACT_ORDER,
  type ActStep,
} from "../../store/configV2";
import ReadinessRail from "./ReadinessRail";
import IdeaAct from "./acts/IdeaAct";
import ReachAct from "./acts/ReachAct";
import VerdictAct from "./acts/VerdictAct";
import LaunchAct from "./acts/LaunchAct";

const ACTS: { id: ActStep; label: string; hint: string }[] = [
  { id: "idea", label: "Idea", hint: "What & why" },
  { id: "reach", label: "Reach", hint: "Who & where" },
  { id: "verdict", label: "Verdict", hint: "How we judge" },
  { id: "launch", label: "Launch", hint: "Before you go" },
];

// Config v2 — the three-act experience (Idea → Reach → Verdict) plus a
// Before-you-launch checklist, with the Readiness rail persistent throughout.
export default function ConfigV2Page() {
  const { entityId } = useParams();
  const id = entityId ?? "";
  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  const ensureConfigV2 = useConfigV2Store((s) => s.ensureConfigV2);
  const actStep = useConfigV2Store((s) => s.actStep[id] ?? "idea");
  const setActStep = useConfigV2Store((s) => s.setActStep);

  useEffect(() => {
    if (campaign) ensureConfigV2(campaign.id, campaign.name, campaign);
  }, [campaign, ensureConfigV2]);

  if (!campaign) {
    return (
      <div className="min-h-full bg-canvas px-6 py-10 text-sm text-muted-foreground">
        Campaign not found.
      </div>
    );
  }

  const activeIndex = ACT_ORDER.indexOf(actStep);
  const nextAct = ACT_ORDER[activeIndex + 1];

  return (
    <div className="min-h-full bg-canvas">
      <div className="mx-auto w-full max-w-[1320px] px-6 py-8">
        {/* ACT NAV */}
        <nav className="mb-8 flex items-stretch gap-2" aria-label="Configuration steps">
          {ACTS.map((act, i) => {
            const active = act.id === actStep;
            const done = i < activeIndex;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setActStep(id, act.id)}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-foreground bg-background"
                    : "border-border bg-background hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                    active
                      ? "bg-foreground text-background"
                      : done
                        ? "bg-muted text-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {act.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {act.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* BODY + RAIL */}
        <div className="flex items-start gap-8">
          <div className="min-w-0 flex-1">
            {actStep === "idea" && <IdeaAct campaignId={id} />}
            {actStep === "reach" && <ReachAct campaignId={id} />}
            {actStep === "verdict" && <VerdictAct campaignId={id} />}
            {actStep === "launch" && <LaunchAct campaignId={id} />}

            {nextAct && (
              <div className="mt-10 flex justify-end border-t border-border pt-6">
                <Button type="button" onClick={() => setActStep(id, nextAct)}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="sticky top-6 w-[320px] shrink-0">
            <ReadinessRail campaignId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
