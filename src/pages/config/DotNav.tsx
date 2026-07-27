import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, CheckCircle2, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SECTIONS,
  SECTION_GROUPS,
  isSectionComplete,
  type SectionId,
} from "../../config/configSections";
import { useConfigStore } from "../../store/config";

const MANDATORY = SECTIONS.filter((s) => s.mandatory);

function scrollToSection(id: string) {
  const el = document.getElementById(`section-${id}`);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DotNav({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const dockState = useConfigStore((s) => s.dockState);
  const setDockState = useConfigStore((s) => s.setDockState);
  const viewMode = useConfigStore((s) => s.viewMode);
  const activeStepId = useConfigStore((s) => s.activeStepId);
  const setActiveStepId = useConfigStore((s) => s.setActiveStepId);
  const setSectionOpen = useConfigStore((s) => s.setSectionOpen);
  const [scrollActive, setScrollActive] = useState<SectionId>("main");
  // Scroll view highlights the section under the scroll position; Guided view
  // highlights the step the user picked (activeStepId).
  const active = (viewMode === "guided" ? activeStepId : scrollActive) as SectionId;
  const [expanded, setExpanded] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  // Track the section currently in view (scroll view only). A deterministic
  // scan against a reference line ~25% down the scroll area picks the last
  // section whose top has passed that line — i.e. the one you're reading.
  //
  // This replaces IntersectionObserver-by-ratio, which failed for a very tall
  // section (Target and Variation): its intersection ratio is capped well below
  // the observer thresholds, so it never won the "highest ratio" comparison and
  // the previous section stayed stuck as active while scrolling through it.
  useEffect(() => {
    if (viewMode !== "scroll") return;
    const scroller = document.querySelector("main");
    if (!scroller) return;

    let raf = 0;
    const compute = () => {
      const rect = scroller.getBoundingClientRect();
      // Reading line ~25% down the scroll area. clientHeight guards against a
      // transient 0-height rect collapsing the line onto the top edge.
      const height = scroller.clientHeight || rect.height || 640;
      const line = rect.top + Math.min(height * 0.25, 200);
      let current: SectionId = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(`section-${s.id}`);
        if (el && el.getBoundingClientRect().top - line <= 0) current = s.id;
      }
      setScrollActive(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [id, dockState, viewMode]);

  // Close the panel on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!config) return null;

  const open = () => {
    window.clearTimeout(closeTimer.current);
    setExpanded(true);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setExpanded(false), 150);
  };

  const complete = (sid: SectionId) => isSectionComplete(sid, config);

  // Guided swaps the shown step (no scrolling — only one step is rendered);
  // Scroll jumps to the section anchor. Frictionless: any step, anytime.
  // Collapsible sections (Additional Settings / QA Assistant) are opened first
  // so the click both reveals and scrolls to their content; the expand happens
  // before the scroll settles so the target offset is correct.
  const COLLAPSIBLE: SectionId[] = ["additional", "qa"];
  const goToStep = (sid: SectionId) => {
    if (viewMode === "guided") {
      setActiveStepId(sid);
      return;
    }
    // Select immediately so the click always highlights its target — the scroll
    // observer only re-selects when a section is actually within its active
    // band, so it never fights this (and the last section, which lands above
    // that band, stays selected).
    setScrollActive(sid);
    if (COLLAPSIBLE.includes(sid)) setSectionOpen(sid, true);
    // Scroll immediately: a section header's offset is stable (opening its
    // accordion only adds height below it), and the trailing scroll spacer
    // guarantees room to bring any section — including the last — to the top.
    scrollToSection(sid);
  };

  // A single grouped step list, shared by the expanded flyout and the docked
  // panel. Derives entirely from SECTIONS / SECTION_GROUPS so a step added
  // later shows up in both states automatically. Top-level steps keep their
  // completion indicator; sub-steps show their label only.
  const StepList = () => (
    <div className="flex flex-col gap-3">
      {SECTION_GROUPS.map((group) => {
        const groupSections = SECTIONS.filter((s) => s.group === group.id);
        if (groupSections.length === 0) return null;
        return (
          <div key={group.id}>
            <div className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
            </div>
            {groupSections.map((s) => {
              const isActive = active === s.id;
              return (
                <div key={s.id}>
                  <button
                    type="button"
                    onClick={() => goToStep(s.id)}
                    className={cn(
                      "relative flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-foreground" />
                    )}
                    <span className="truncate text-left text-foreground">{s.label}</span>
                    {s.mandatory &&
                      (complete(s.id) ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-success-fg" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ))}
                  </button>

                  {/* Sub-rows: label only, no completion indicator. */}
                  {s.subs?.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() =>
                        viewMode === "guided"
                          ? goToStep(s.id)
                          : scrollToSection(`${s.id}-${sub.id}`)
                      }
                      className="relative flex w-full items-center rounded-md py-1.5 pl-6 pr-2.5 text-xs hover:bg-accent"
                    >
                      <span className="truncate text-left text-muted-foreground">
                        {sub.label}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  const DockToggle = ({ label }: { label: "Dock" | "Undock" }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground"
            aria-label={label}
            onClick={() =>
              setDockState(dockState === "docked" ? "undocked" : "docked")
            }
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // DOCKED: full-height sidebar in the content flow (same chrome as Reports
  // metrics nav). Sticky top-0 — main already sits below the detail header.
  if (dockState === "docked") {
    return (
      <aside
        className={cn(
          "sticky top-0 z-30 flex h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-panel-border bg-panel text-panel-foreground",
          "duration-150 ease-out animate-in slide-in-from-left-2 motion-reduce:animate-none"
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pt-4">
          <StepList />
        </div>
        <div className="flex shrink-0 items-center justify-end px-3 py-2">
          <DockToggle label="Undock" />
        </div>
      </aside>
    );
  }

  // UNDOCKED: far-left dots that expand into a hover flyout. The flyout is a
  // Radix Popover ANCHORED to the dots (side="left" align="center"): it opens
  // physically beside the dots, in the left gutter, vertically centred on the
  // dots' midpoint so it fans out evenly above and below them, with NO
  // hand-computed top/left/transform. Radix portals the content (escaping the
  // ancestor `overflow-y-auto` on <main>) and, with collisionPadding, clamps it
  // fully inside the viewport when centring would overflow;
  // `--radix-popover-content-available-height` caps its height so a long list
  // scrolls INSIDE. Position never depends on the active step.
  return (
    // Full-height track 48px to the LEFT of the content column, in the canvas
    // gutter; the inner element sticks to the viewport's vertical centre.
    <Popover open={expanded} onOpenChange={setExpanded}>
      <div className="pointer-events-none absolute inset-y-0 right-full z-30 mr-12 flex flex-col items-end">
        <PopoverAnchor asChild>
          <div
            className="pointer-events-auto sticky top-1/2 -translate-y-1/2"
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
            onFocus={open}
            onBlur={scheduleClose}
          >
            {/* Collapsed dots, one per mandatory section. Kept mounted while the
                flyout is open (hidden via opacity, not unmounted) so the anchor
                box never collapses and the flyout stays put. */}
            <div
              className={cn(
                "flex flex-col items-center gap-2.5 transition-opacity",
                expanded && "opacity-0"
              )}
            >
              {MANDATORY.map((s) => {
                const done = complete(s.id);
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={s.label}
                    onClick={() => goToStep(s.id)}
                    className={cn(
                      "flex items-center justify-center rounded-full transition-all duration-200",
                      done
                        ? "h-3.5 w-3.5 bg-success-fg text-white"
                        : "h-2 w-2 bg-muted-foreground/40",
                      isActive && "ring-2 ring-foreground/20 ring-offset-2 ring-offset-canvas"
                    )}
                  >
                    {done && <Check className="h-[9px] w-[9px]" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverAnchor>
      </div>

      {/* Full step list grouped by DEFINE / REVIEW, opening beside the dots. */}
      {expanded && (
        <PopoverContent
          side="left"
          align="center"
          sideOffset={12}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onMouseEnter={open}
          onMouseLeave={scheduleClose}
          className={cn(
            "z-40 flex max-h-[var(--radix-popover-content-available-height)] w-56 flex-col border border-panel-border bg-panel p-1.5 text-panel-foreground shadow-md",
            "motion-reduce:animate-none"
          )}
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <StepList />
          </div>
          <div className="flex shrink-0 justify-end pt-1">
            <DockToggle label="Dock" />
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
