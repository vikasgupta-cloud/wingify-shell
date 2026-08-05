// Summary: Merge left EditorToolRail tools into the right utility rail (icons only).
// Edition stays on top; tool icons follow; Undo/Redo + Help sit at the bottom.
// Reuses UTILITY_RAIL_WIDTH so the right rail width does not change.
//
// @undo revert: restore Edition-only rail and re-enable separate EditorToolRail on the left.

import type { ComponentType } from "react";
import { HelpCircle, Languages, Pencil, Plus, Redo2, Undo2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UTILITY_RAIL_WIDTH } from "@/lib/nav";
import { EditorIcon } from "./EditorIcon";
import type { EditorLeftTool } from "@/config/editorScenarios";

import layers from "@/assets/editor/layers.svg";
import metrics from "@/assets/editor/metrics.svg";
import changes from "@/assets/editor/changes.svg";

export type EditorSidePanelId = "copilot" | "edition";

type RailIcon =
  | { kind: "asset"; src: string }
  | {
      kind: "lucide";
      Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    };

const TOP_TOOLS: { id: EditorLeftTool; label: string; icon: RailIcon }[] = [
  { id: "layers", label: "Layers", icon: { kind: "asset", src: layers } },
  { id: "add", label: "Add", icon: { kind: "lucide", Icon: Plus } },
];

const MID_TOOLS: { id: EditorLeftTool; label: string; icon: RailIcon }[] = [
  { id: "metrics", label: "Metrics", icon: { kind: "asset", src: metrics } },
  {
    id: "translate",
    label: "Translate",
    icon: { kind: "lucide", Icon: Languages },
  },
];

const CHANGES_TOOL: { id: EditorLeftTool; label: string; icon: RailIcon } = {
  id: "changes",
  label: "Changes",
  icon: { kind: "asset", src: changes },
};

function RailDivider() {
  return <div className="mx-auto h-px w-8 shrink-0 bg-border" aria-hidden />;
}

const HISTORY_ACTIONS: {
  id: "undo" | "redo";
  label: string;
  icon: RailIcon;
}[] = [
  { id: "undo", label: "Undo", icon: { kind: "lucide", Icon: Undo2 } },
  { id: "redo", label: "Redo", icon: { kind: "lucide", Icon: Redo2 } },
];

/**
 * Editor utility rail (right): Edition + former left-tool icons (no labels).
 * Width stays UTILITY_RAIL_WIDTH.
 */
export function EditorUtilityRail({
  activeIds,
  onToggle,
  activeTool = null,
  onSelectTool,
}: {
  activeIds: EditorSidePanelId[];
  onToggle: (id: EditorSidePanelId) => void;
  activeTool?: EditorLeftTool | null;
  onSelectTool?: (id: EditorLeftTool) => void;
}) {
  const railButton = (active: boolean, disabled?: boolean) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
      disabled
        ? "cursor-not-allowed text-muted-foreground/40"
        : active
          ? "bg-accent text-foreground"
          : "text-foreground hover:bg-muted"
    );

  const renderIcon = (icon: RailIcon) =>
    icon.kind === "asset" ? (
      <EditorIcon src={icon.src} size={18} />
    ) : (
      <icon.Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
    );

  const renderToolButton = ({
    id,
    label,
    icon,
  }: {
    id: EditorLeftTool;
    label: string;
    icon: RailIcon;
  }) => {
    const active = activeTool === id;
    return (
      <Tooltip key={id}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => onSelectTool?.(id)}
            className={railButton(active)}
          >
            {renderIcon(icon)}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">{label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        className="flex h-full shrink-0 flex-col items-center gap-3 border-l border-border bg-background py-4 shadow-none"
        style={{ width: UTILITY_RAIL_WIDTH }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Edition"
              aria-pressed={activeIds.includes("edition")}
              onClick={() => onToggle("edition")}
              className={railButton(activeIds.includes("edition"))}
            >
              <Pencil className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Edition</TooltipContent>
        </Tooltip>

        {TOP_TOOLS.map(renderToolButton)}
        {MID_TOOLS.map(renderToolButton)}

        <div className="mt-auto flex flex-col items-center gap-3">
          {renderToolButton(CHANGES_TOOL)}
          <RailDivider />
          {HISTORY_ACTIONS.map(({ id, label, icon }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${label} (unavailable)`}
                  aria-disabled
                  disabled
                  className={railButton(false, true)}
                >
                  {renderIcon(icon)}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Help"
                className={railButton(false)}
              >
                <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Help</TooltipContent>
          </Tooltip>
        </div>
      </nav>
    </TooltipProvider>
  );
}
