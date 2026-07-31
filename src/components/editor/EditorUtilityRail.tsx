import { HelpCircle, Pencil, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UTILITY_RAIL_WIDTH } from "@/lib/nav";

export type EditorSidePanelId = "copilot" | "edition";

const RAIL_ITEMS: {
  id: EditorSidePanelId;
  label: string;
  icon: typeof Sparkles;
}[] = [
  { id: "copilot", label: "Wandz Copilot", icon: Sparkles },
  { id: "edition", label: "Edition", icon: Pencil },
];

/**
 * Reports-style utility rail: icon bar on the right; click toggles a section panel.
 * Multiple panels can be active when some are detached.
 */
export function EditorUtilityRail({
  activeIds,
  onToggle,
}: {
  activeIds: EditorSidePanelId[];
  onToggle: (id: EditorSidePanelId) => void;
}) {
  const railButton = (active: boolean) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted",
      active && "bg-accent text-foreground"
    );

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        className="flex h-full shrink-0 flex-col items-center gap-3 border-l border-border bg-rail py-4"
        style={{ width: UTILITY_RAIL_WIDTH }}
      >
        {RAIL_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeIds.includes(id);
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={active}
                  onClick={() => onToggle(id)}
                  className={railButton(active)}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
          );
        })}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Help"
              className={cn(railButton(false), "mt-auto")}
            >
              <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Help</TooltipContent>
        </Tooltip>
      </nav>
    </TooltipProvider>
  );
}
