import { useEffect, useRef, useState } from "react";
import { LayoutTemplate } from "@/components/icons/protoLucide";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SCENARIO,
  FLOAT_EDITOR_SCENARIOS,
  type EditorScenarioId,
} from "@/config/editorScenarios";
import { useEditorPanelsStore } from "@/store/editorPanels";

const EXPAND_DELAY_MS = 200;

/**
 * Demo layout switcher — peeks from the canvas edge; expands on hover.
 */
export function EditorScenarioFloat({
  scenarioId,
  onScenarioChange,
}: {
  scenarioId?: EditorScenarioId;
  onScenarioChange: (id: EditorScenarioId) => void;
}) {
  const dockPlacement = useEditorPanelsStore((s) => s.dockPlacement);
  const dockDensity = useEditorPanelsStore((s) => s.dockDensity);
  const docked =
    dockPlacement.mode === "edge" ? dockPlacement : null;
  const edge = docked?.edge;
  const align = docked?.align ?? "center";

  const onRight = edge === "bottom" && align === "start";
  const leftInset =
    edge === "left"
      ? dockDensity === "labels"
        ? "left-[6rem]"
        : "left-[5.5rem]"
      : onRight
        ? null
        : "left-3";

  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const expandTimerRef = useRef<number | null>(null);

  const clearExpandTimer = () => {
    if (expandTimerRef.current != null) {
      window.clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  };

  useEffect(() => () => clearExpandTimer(), []);

  useEffect(() => {
    if (menuOpen) {
      clearExpandTimer();
      setExpanded(true);
    }
  }, [menuOpen]);

  const onPointerEnter = () => {
    clearExpandTimer();
    expandTimerRef.current = window.setTimeout(() => {
      setExpanded(true);
      expandTimerRef.current = null;
    }, EXPAND_DELAY_MS);
  };

  const onPointerLeave = () => {
    clearExpandTimer();
    if (!menuOpen) setExpanded(false);
  };

  const active =
    FLOAT_EDITOR_SCENARIOS.find((s) => s.id === scenarioId) ?? null;
  const label = active?.label ?? "Layout";

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <div
        className={cn(
          "pointer-events-auto absolute bottom-0",
          onRight ? "right-3" : leftInset
        )}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="Demo scenarios"
              aria-label={label}
              aria-expanded={expanded || menuOpen}
              className={cn(
                "group flex items-center overflow-hidden border border-border bg-background text-foreground outline-none",
                "rounded-t-md border-b-0 shadow-[0_-4px_16px_-8px_hsl(var(--foreground)/0.18)]",
                "transition-[width,height,padding,gap] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                expanded
                  ? "h-8 gap-1.5 px-2.5"
                  : "h-5 w-5 justify-center px-0"
              )}
            >
              <LayoutTemplate
                className={cn(
                  "shrink-0 transition-[width,height] duration-200",
                  expanded ? "size-3.5" : "size-2.5"
                )}
                strokeWidth={1.75}
              />
              <span
                className={cn(
                  "truncate text-xs font-medium leading-none tracking-tight",
                  "transition-[max-width,opacity,margin] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  expanded
                    ? "ml-0 max-w-[7.5rem] opacity-100"
                    : "ml-0 max-w-0 opacity-0"
                )}
              >
                {label}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={onRight ? "end" : "start"}
            side="top"
            sideOffset={6}
            className="w-44"
          >
            <DropdownMenuLabel>Layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onScenarioChange(DEFAULT_SCENARIO.id)}
              className={cn(!active && "bg-accent font-semibold")}
            >
              Default
            </DropdownMenuItem>
            {FLOAT_EDITOR_SCENARIOS.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => onScenarioChange(s.id)}
                className={cn(
                  s.id === active?.id && "bg-accent font-semibold"
                )}
              >
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
