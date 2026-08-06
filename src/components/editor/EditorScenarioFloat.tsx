import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
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

/**
 * Floating demo switcher — Multipage / MVT only.
 */
export function EditorScenarioFloat({
  scenarioId,
  onScenarioChange,
}: {
  scenarioId?: EditorScenarioId;
  onScenarioChange: (id: EditorScenarioId) => void;
}) {
  const dockPlacement = useEditorPanelsStore((s) => s.dockPlacement);
  const dockOnLeft =
    dockPlacement.mode === "edge" && dockPlacement.edge === "left";
  const active =
    FLOAT_EDITOR_SCENARIOS.find((s) => s.id === scenarioId) ?? null;

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      <div
        className={cn(
          "pointer-events-auto absolute bottom-5",
          dockOnLeft ? "left-[5.75rem]" : "left-4"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-md bg-background px-2.5 text-xs font-medium shadow-none"
              title="Demo scenarios"
            >
              <LayoutTemplate className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="max-w-[140px] truncate leading-none">
                {active?.label ?? "Layout"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-44">
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
