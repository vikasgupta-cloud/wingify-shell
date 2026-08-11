import {
  HelpCircle,
  History,
  Languages,
  ListTree,
  Pencil,
  Redo2,
  Sparkles,
  Undo2,
} from "@/components/icons/protoLucide";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UTILITY_RAIL_WIDTH } from "@/lib/nav";
import { EditorIcon } from "./EditorIcon";
import layersIcon from "@/assets/editor/layers.svg";

export type EditorSidePanelId =
  | "layers"
  | "copilot"
  | "edition"
  | "translate"
  | "changes"
  | "history";

export const EDITOR_SIDE_PANEL_ORDER: EditorSidePanelId[] = [
  "layers",
  "copilot",
  "edition",
  "translate",
  "changes",
  "history",
];

const SIDE_ITEMS: {
  id: EditorSidePanelId;
  label: string;
  icon: typeof Sparkles;
}[] = [
  { id: "copilot", label: "AI thread", icon: Sparkles },
  { id: "edition", label: "Edition", icon: Pencil },
];

const TOOL_ITEMS: {
  id: EditorSidePanelId;
  label: string;
  icon: typeof Sparkles;
}[] = [{ id: "translate", label: "Translate", icon: Languages }];

const CHANGE_ITEMS: {
  id: EditorSidePanelId;
  label: string;
  icon: typeof Sparkles;
}[] = [{ id: "changes", label: "Changes", icon: ListTree }];

/**
 * Right utility rail — Layers + panels; one docked panel at a time.
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

  const renderItems = (
    items: { id: EditorSidePanelId; label: string; icon: typeof Sparkles }[]
  ) =>
    items.map(({ id, label, icon: Icon }) => {
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
    });

  const historyActive = activeIds.includes("history");
  const layersActive = activeIds.includes("layers");

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
              aria-label="Layers"
              aria-pressed={layersActive}
              onClick={() => onToggle("layers")}
              className={railButton(layersActive)}
            >
              <EditorIcon src={layersIcon} size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Layers</TooltipContent>
        </Tooltip>

        <div className="h-px w-8 bg-border" aria-hidden />
        {renderItems(SIDE_ITEMS)}
        <div className="h-px w-8 bg-border" aria-hidden />
        {renderItems(TOOL_ITEMS)}
        <div className="h-px w-8 bg-border" aria-hidden />
        {renderItems(CHANGE_ITEMS)}

        <div className="mt-auto flex flex-col items-center gap-3">
          <div className="h-px w-8 bg-border" aria-hidden />
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Undo (unavailable)"
                disabled
                className={cn(railButton(false), "opacity-40")}
              >
                <Undo2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Redo (unavailable)"
                disabled
                className={cn(railButton(false), "opacity-40")}
              >
                <Redo2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Redo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Version history"
                aria-pressed={historyActive}
                onClick={() => onToggle("history")}
                className={railButton(historyActive)}
              >
                <History className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Version history</TooltipContent>
          </Tooltip>
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
