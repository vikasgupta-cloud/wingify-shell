import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Columns2,
  Files,
  GitBranch,
  Grid2x2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignType } from "../../data/campaigns";
import { useVisibleCampaigns } from "../../store/rows";
import { useConfigStore } from "../../store/config";
import { SECTIONS } from "../../config/configSections";
import MainInformation from "./MainInformation";
import PagesSection from "./PagesSection";
import VariationsSection from "./VariationsSection";
import MetricsSection from "./MetricsSection";
import CollapsibleSection from "./CollapsibleSection";
import AdditionalSettings from "./AdditionalSettings";
import QaAssistant from "./QaAssistant";
import DotNav from "./DotNav";
import WorkflowMode from "./workflow/WorkflowMode";
import WandzPanel from "../../components/wandz/WandzPanel";
import { useWandzStore } from "../../store/wandz";

const TYPE_ICONS: Record<CampaignType, LucideIcon> = {
  "A/B": Columns2,
  MVT: Grid2x2,
  "Split URL": GitBranch,
  Multipage: Files,
};

export default function ConfigPage() {
  const { entityId } = useParams();
  const id = entityId ?? "";
  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  const ensureConfig = useConfigStore((s) => s.ensureConfig);
  const workflowOpen = useConfigStore((s) => s.workflowOpen[id] ?? false);
  const wandzOpen = useWandzStore((s) => s.open);
  const wasWorkflowOpen = useRef(false);

  useEffect(() => {
    if (campaign) ensureConfig(campaign.id, campaign.name);
  }, [campaign, ensureConfig]);

  // On closing Workflow Mode, return the reader to the variations section.
  // Defer to the next frame so the freshly-mounted section list has laid out.
  useEffect(() => {
    if (wasWorkflowOpen.current && !workflowOpen) {
      const t = setTimeout(() => {
        document
          .getElementById("section-variations")
          ?.scrollIntoView({ behavior: "auto", block: "start" });
      }, 120);
      wasWorkflowOpen.current = workflowOpen;
      return () => clearTimeout(t);
    }
    wasWorkflowOpen.current = workflowOpen;
  }, [workflowOpen]);

  if (!campaign) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[campaign.type];

  // Workflow Mode is a second editing surface over the SAME config; it replaces
  // the entire section list (header + DotNav + all sections). The DetailShell
  // chrome around ConfigPage is untouched.
  if (workflowOpen) {
    return (
      <div className="h-full bg-canvas">
        <WorkflowMode id={id} />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-canvas">
      {/* Content column + the Wandz panel sit side by side; the panel pushes the
          content, which stays capped at 860px. DotNav floats in the left canvas
          gutter, anchored to the content column, and does not overlap either. */}
      <div
        className={cn(
          "mx-auto flex w-full items-start gap-6 px-6 py-10",
          wandzOpen ? "max-w-[1380px]" : "max-w-[860px]"
        )}
      >
        <div className="relative min-w-0 max-w-[860px] flex-1">
        <DotNav id={id} />
        {/* Bespoke page header — product-type icon + name only (ID is in the breadcrumb). */}
        <div className="flex items-center gap-3">
          <TypeIcon className="h-6 w-6 text-foreground" aria-hidden />
          <h1 className="text-2xl font-semibold text-foreground">{campaign.name}</h1>
        </div>

        <div className="mt-10 flex flex-col gap-10">
          {SECTIONS.map((section, i) => {
            // Collapsible sections own their own `section-<id>` anchor, so the
            // spacing wrapper here must not also set the id (no duplicates).
            const isCollapsible = section.id === "additional" || section.id === "qa";
            return (
              <div
                key={section.id}
                id={isCollapsible ? undefined : `section-${section.id}`}
                className={cn(
                  !isCollapsible && "scroll-mt-20",
                  i > 0 && "border-t border-border pt-10"
                )}
              >
                {section.id === "main" && <MainInformation id={id} />}
                {section.id === "pages" && <PagesSection id={id} />}
                {section.id === "variations" && <VariationsSection id={id} />}
                {section.id === "metrics" && <MetricsSection id={id} />}
                {section.id === "additional" && (
                  <CollapsibleSection id="additional" title="Additional Settings" optional>
                    <AdditionalSettings id={id} />
                  </CollapsibleSection>
                )}
                {section.id === "qa" && (
                  <CollapsibleSection id="qa" title="QA Assistant" optional>
                    <QaAssistant id={id} />
                  </CollapsibleSection>
                )}
              </div>
            );
          })}
        </div>
        </div>

        {/* Mutual exclusion keeps Quick view and Wandz from both rendering. */}
        {wandzOpen && <WandzPanel />}
      </div>
    </div>
  );
}
