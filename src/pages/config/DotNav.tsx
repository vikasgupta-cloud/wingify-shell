import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTIONS, isSectionComplete, type SectionId } from "../../config/configSections";
import { useConfigStore } from "../../store/config";

const MANDATORY = SECTIONS.filter((s) => s.mandatory);

function scrollToSection(id: string) {
  const el = document.getElementById(`section-${id}`);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DotNav({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const [active, setActive] = useState<SectionId>("main");
  const [expanded, setExpanded] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  // Track the section currently in view.
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(`section-${s.id}`)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActive(visible[0].target.id.replace("section-", "") as SectionId);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [id]);

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

  return (
    // Anchored to the content column (its positioned ancestor): a full-height
    // track sitting 48px to the LEFT of the column, in the canvas gutter. The
    // inner element sticks to the viewport's vertical centre as the page scrolls
    // and is right-aligned so the dots — and the hover panel — grow into the
    // gutter, never over the content or the Wandz panel.
    <div className="pointer-events-none absolute inset-y-0 right-full z-30 mr-12 flex flex-col items-end">
      <div
        className="pointer-events-auto sticky top-1/2 -translate-y-1/2"
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocus={open}
        onBlur={scheduleClose}
      >
      {/* Collapsed: four dots, one per mandatory section. */}
      {!expanded && (
        <div className="flex flex-col items-center gap-2.5">
          {MANDATORY.map((s) => {
            const done = complete(s.id);
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-label={s.label}
                onClick={() => scrollToSection(s.id)}
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
      )}

      {/* Expanded: full panel listing all six sections. */}
      {expanded && (
        <div
          className={cn(
            "w-56 rounded-lg border border-border bg-popover p-1.5 shadow-lg",
            "duration-150 ease-out animate-in fade-in-0 slide-in-from-left-2",
            "motion-reduce:animate-none"
          )}
        >
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            const showCompletion = s.mandatory;
            return (
              <div key={s.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(s.id)}
                  className={cn(
                    "relative flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm hover:bg-accent",
                    isActive && "bg-accent"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-foreground" />
                  )}
                  <span className="truncate text-left text-foreground">{s.label}</span>
                  {showCompletion &&
                    (complete(s.id) ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success-fg" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ))}
                </button>

                {/* Variations & targets sub-rows. */}
                {s.subs?.map((sub) => {
                  const done = complete("variations");
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => scrollToSection(`${s.id}-${sub.id}`)}
                      className="relative flex w-full items-center justify-between rounded-md py-1.5 pl-6 pr-2.5 text-xs hover:bg-accent"
                    >
                      <span className="truncate text-left text-muted-foreground">
                        {sub.label}
                      </span>
                      {sub.showsCompletion &&
                        (done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-fg" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ))}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
