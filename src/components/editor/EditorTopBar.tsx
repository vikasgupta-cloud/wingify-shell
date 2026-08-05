import { ArrowLeft, LayoutTemplate } from "lucide-react";
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
import { EditorIcon } from "./EditorIcon";
import {
  EDITOR_SCENARIOS,
  type EditorScenarioId,
} from "@/config/editorScenarios";
import type { CampaignStatus } from "@/data/campaigns";

import saveIcon from "@/assets/editor/save-01.svg";
import paletteIcon from "@/assets/editor/palette.svg";
import cursorIcon from "@/assets/editor/cursor-04.svg";
import codeIcon from "@/assets/editor/code-02.svg";

type Mode = "design" | "navigate" | "code";

export type { Mode as EditorTopBarMode };

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: "design", label: "Design", icon: paletteIcon },
  { id: "navigate", label: "Navigate", icon: cursorIcon },
  { id: "code", label: "Code", icon: codeIcon },
];

export function EditorTopBar({
  campaignName = "Campaign",
  status,
  scenarioId,
  onScenarioChange,
  mode = "design",
  onModeChange,
}: {
  campaignName?: string;
  status?: CampaignStatus;
  scenarioId?: EditorScenarioId;
  onScenarioChange?: (id: EditorScenarioId) => void;
  mode?: Mode;
  onModeChange?: (mode: Mode) => void;
}) {
  const activeScenario =
    EDITOR_SCENARIOS.find((s) => s.id === scenarioId) ?? EDITOR_SCENARIOS[0]!;

  return (
    <header className="relative flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-2">
      <div className="flex h-7 items-center gap-1.5 pl-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 rounded-md"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
        </Button>
        <p className="max-w-[220px] truncate text-[13px] font-medium leading-none text-foreground">
          {campaignName}
        </p>
        {status ? (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-border bg-muted px-2.5 text-xs font-medium leading-none text-foreground">
            {status}
          </span>
        ) : (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-border bg-muted px-2.5 text-xs font-medium leading-none text-muted-foreground">
            —
          </span>
        )}
      </div>

      <div className="absolute left-1/2 top-1/2 flex h-6 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-muted p-px">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange?.(m.id)}
              className={cn(
                "inline-flex h-[22px] items-center gap-2 rounded-md px-3 text-xs font-semibold outline-none transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <EditorIcon src={m.icon} size={14} />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex h-7 items-center gap-2">
        {onScenarioChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                title="Demo scenarios"
              >
                <LayoutTemplate className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="max-w-[120px] truncate leading-none">
                  {activeScenario.label}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Demo scenarios</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EDITOR_SCENARIOS.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => onScenarioChange(s.id)}
                  className={cn(
                    s.id === activeScenario.id && "bg-accent font-semibold"
                  )}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-7 shrink-0 rounded-md"
          aria-label="Save"
        >
          <EditorIcon src={saveIcon} size={14} />
        </Button>
        <div className="h-4 w-px shrink-0 bg-border" aria-hidden />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 rounded-md px-2.5 text-[13px] font-semibold"
        >
          Preview
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-7 rounded-md px-2.5 text-[13px] font-semibold"
        >
          Save & Next
        </Button>
      </div>
    </header>
  );
}
