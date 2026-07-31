import { useState } from "react";
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
import { EditorIcon } from "./EditorIcon";
import {
  EDITOR_SCENARIOS,
  type EditorScenarioId,
} from "@/config/editorScenarios";

import arrowLeft from "@/assets/editor/arrow-left.svg";
import wingifyLogo from "@/assets/wingify-logo.png";
import saveIcon from "@/assets/editor/save-01.svg";
import paletteIcon from "@/assets/editor/palette.svg";
import cursorIcon from "@/assets/editor/cursor-04.svg";
import codeIcon from "@/assets/editor/code-02.svg";

type Mode = "design" | "navigate" | "code";

const MODES: { id: Mode; label: string; icon: string }[] = [
  { id: "design", label: "Design", icon: paletteIcon },
  { id: "navigate", label: "Navigate", icon: cursorIcon },
  { id: "code", label: "Code", icon: codeIcon },
];

export function EditorTopBar({
  campaignName = "My Super Duper Campaign Name",
  statusLabel = "Status",
  scenarioId,
  onScenarioChange,
}: {
  campaignName?: string;
  statusLabel?: string;
  scenarioId?: EditorScenarioId;
  onScenarioChange?: (id: EditorScenarioId) => void;
}) {
  const [mode, setMode] = useState<Mode>("design");
  const activeScenario =
    EDITOR_SCENARIOS.find((s) => s.id === scenarioId) ?? EDITOR_SCENARIOS[0]!;

  return (
    <header className="relative flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-2">
      <div className="flex h-7 items-center gap-3 pl-1">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            aria-label="Back"
          >
            <EditorIcon src={arrowLeft} size={20} />
          </Button>
          <img
            src={wingifyLogo}
            alt="Wingify"
            className="h-5 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-2 pl-1">
          <p className="max-w-[180px] truncate text-[13px] font-medium text-foreground">
            {campaignName}
          </p>
          <span className="inline-flex h-5 items-center rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">
            {statusLabel}
          </span>
          {onScenarioChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 rounded px-2 text-xs font-semibold"
                >
                  <LayoutTemplate className="size-3.5" strokeWidth={1.75} />
                  <span className="max-w-[120px] truncate">
                    {activeScenario.label}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Editor scenarios</DropdownMenuLabel>
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
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 flex h-6 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-muted p-px">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
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

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-8 rounded"
            aria-label="Save"
          >
            <EditorIcon src={saveIcon} size={16} />
          </Button>
          <div className="h-6 w-px bg-border" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded px-2.5 text-[13px] font-semibold"
          >
            Preview
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 rounded px-2.5 text-[13px] font-semibold"
          >
            Save & Next
          </Button>
        </div>
      </div>
    </header>
  );
}
