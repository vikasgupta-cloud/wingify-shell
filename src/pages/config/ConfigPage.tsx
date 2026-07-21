import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Columns2,
  Files,
  GitBranch,
  Grid2x2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CampaignType } from "../../data/campaigns";
import { useVisibleCampaigns } from "../../store/rows";
import { useConfigStore } from "../../store/config";
import { SECTIONS, type SectionId } from "../../config/configSections";
import MainInformation from "./MainInformation";
import PagesSection from "./PagesSection";
import VariationsSection from "./VariationsSection";
import MetricsSection from "./MetricsSection";
import IntegrationsSection from "./IntegrationsSection";
import CollapsibleSection from "./CollapsibleSection";
import AdditionalSettings from "./AdditionalSettings";
import QaAssistant from "./QaAssistant";
import DotNav from "./DotNav";
import GuidedStepHeader from "./GuidedStepHeader";
import WorkflowMode from "./workflow/WorkflowMode";
import WandzPanel from "../../components/wandz/WandzPanel";
import { useWandzStore } from "../../store/wandz";

const TYPE_ICONS: Record<CampaignType, LucideIcon> = {
  "A/B": Columns2,
  MVT: Grid2x2,
  "Split URL": GitBranch,
  Multipage: Files,
};

// The body for a single step section. Shared by Scroll (all sections) and
// Guided (one section) so the two views always render identical content — the
// same config store, the same components (Workflow Mode included).
function SectionBody({ sectionId, id }: { sectionId: string; id: string }) {
  switch (sectionId) {
    case "main":
      return <MainInformation id={id} />;
    case "pages":
      return <PagesSection id={id} />;
    case "variations":
      return <VariationsSection id={id} />;
    case "metrics":
      return <MetricsSection id={id} />;
    case "integrations":
      return <IntegrationsSection id={id} />;
    case "additional":
      return (
        <CollapsibleSection id="additional" title="Additional Settings" optional>
          <AdditionalSettings id={id} />
        </CollapsibleSection>
      );
    case "qa":
      return (
        <CollapsibleSection id="qa" title="QA Assistant" optional>
          <QaAssistant id={id} />
        </CollapsibleSection>
      );
    default:
      return null;
  }
}

// Guided-only footer: step-to-step navigation matching the design's
// "Prev" / "Save and Next" controls. Prev is disabled on the first step and
// Next on the last, so the pair never advances past the ends.
function StepNav({
  activeStepId,
  onGo,
}: {
  activeStepId: SectionId;
  onGo: (id: SectionId) => void;
}) {
  const order = SECTIONS.map((s) => s.id);
  const idx = Math.max(0, order.indexOf(activeStepId));
  const isFirst = idx === 0;
  const isLast = idx === order.length - 1;
  return (
    <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
      <Button
        variant="outline"
        disabled={isFirst}
        onClick={() => onGo(order[idx - 1])}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      <Button
        variant="outline"
        disabled={isLast}
        onClick={() => onGo(order[idx + 1])}
      >
        Save and Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function ConfigPage() {
  const { entityId } = useParams();
  const id = entityId ?? "";
  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === id);
  const ensureConfig = useConfigStore((s) => s.ensureConfig);
  const workflowOpen = useConfigStore((s) => s.workflowOpen[id] ?? false);
  const dockState = useConfigStore((s) => s.dockState);
  const viewMode = useConfigStore((s) => s.viewMode);
  const activeStepId = useConfigStore((s) => s.activeStepId);
  const setActiveStepId = useConfigStore((s) => s.setActiveStepId);
  const wandzOpen = useWandzStore((s) => s.open);
  const wasWorkflowOpen = useRef(false);

  useEffect(() => {
    if (campaign) ensureConfig(campaign.id, campaign.name);
  }, [campaign, ensureConfig]);

  // Always land on the first step when the campaign changes. activeStepId is
  // session-global (not per-campaign), so without this a new or freshly-opened
  // campaign would inherit whatever step the previous one was left on.
  useEffect(() => {
    setActiveStepId("main");
  }, [id, setActiveStepId]);

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

  // Guided-only keyboard step-nav: ↑ prev, ↓/Enter next; clamp at ends (no
  // wrap); ←/→ do nothing. Inert while focus is in a text field / contenteditable
  // or an open select/combobox/dropdown/popover (Radix portals a popper wrapper
  // when one is open) so those keys behave normally there. Scroll never advances.
  useEffect(() => {
    if (viewMode !== "guided") return;
    const order = SECTIONS.map((s) => s.id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Enter") return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      if (
        el?.getAttribute("role") === "combobox" ||
        el?.getAttribute("aria-expanded") === "true" ||
        el?.closest('[role="menu"],[role="listbox"],[role="dialog"]')
      )
        return;
      // Any open Radix select/dropdown/popover portals this wrapper.
      if (document.querySelector("[data-radix-popper-content-wrapper]")) return;
      // Let Enter activate a focused button/link rather than advancing.
      if (
        e.key === "Enter" &&
        (tag === "BUTTON" || tag === "A" || el?.getAttribute("role") === "button")
      )
        return;

      const cur = useConfigStore.getState().activeStepId;
      const idx = Math.max(0, order.indexOf(cur));
      const nextIdx = e.key === "ArrowUp" ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= order.length) return; // clamp; allow default
      e.preventDefault();
      useConfigStore.getState().setActiveStepId(order[nextIdx]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewMode]);

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
      {/* When docked, the DotNav is a fixed 16rem (w-64) sidebar that overlays
          the left gutter. Reserve that width here so the centred content column
          (and the Wandz panel) never slide under it and never force a
          horizontal scroll. */}
      <div className={cn(dockState === "docked" && "pl-64")}>
      {/* Content column + the Wandz panel sit side by side; the panel pushes the
          content, which stays capped at 860px. DotNav floats in the left canvas
          gutter, anchored to the content column, and does not overlap either. */}
      <div
        className={cn(
          "mx-auto flex w-full items-start gap-6 px-6 py-10",
          wandzOpen ? "max-w-[1380px]" : "max-w-[860px]"
        )}
      >
        {/* Docked: DotNav is a flex sibling, so it pushes the content right. */}
        {dockState === "docked" && <DotNav id={id} />}
        <div className="relative min-w-0 max-w-[860px] flex-1">
        {/* Undocked: DotNav floats in the left gutter of the content column. */}
        {dockState === "undocked" && <DotNav id={id} />}
        {/* Bespoke page header — product-type icon + name only (ID is in the
            breadcrumb). Suppressed in guided, where the title lives in the
            step header and the name is already in the breadcrumb. */}
        {viewMode === "scroll" && (
          <div className="flex items-center gap-3">
            <TypeIcon className="h-6 w-6 text-foreground" aria-hidden />
            <h1 className="text-2xl font-semibold text-foreground">{campaign.name}</h1>
          </div>
        )}

        {viewMode === "guided" ? (
          // GUIDED: one focused step, using the SAME content column width as
          // Scroll. Re-keyed on activeStepId so a 200ms fade/slide plays on each
          // swap (disabled under prefers-reduced-motion). The composed step
          // (header + body) is vertically centred within the height below the
          // global header when it's shorter than that space (justify-center over
          // a min-height); a taller step grows past the min-height, so it
          // top-aligns and scrolls in <main> — never clipped. The step body's
          // own h2 heading (+ its Ask-Wandz sparkle) is hidden so the title
          // shows once, in the guided header.
          <div
            key={activeStepId}
            className="flex min-h-[calc(100vh-8.5rem)] flex-col duration-200 animate-in fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none"
          >
            <div className="flex flex-1 flex-col justify-center">
              <GuidedStepHeader section={SECTIONS[Math.max(0, SECTIONS.findIndex((s) => s.id === activeStepId))]} />
              <div className="[&_h2+button]:hidden [&_h2]:hidden">
                <SectionBody sectionId={activeStepId} id={id} />
              </div>
            </div>
            <StepNav activeStepId={activeStepId} onGo={setActiveStepId} />
          </div>
        ) : (
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
                  <SectionBody sectionId={section.id} id={id} />
                </div>
              );
            })}
          </div>
        )}
        </div>

        {/* Mutual exclusion keeps Quick view and Wandz from both rendering. */}
        {wandzOpen && <WandzPanel />}
      </div>
      </div>
    </div>
  );
}
