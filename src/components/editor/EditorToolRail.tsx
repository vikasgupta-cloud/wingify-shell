import type { ComponentType } from "react";
import { Languages, Plus, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";
import type { EditorLeftTool } from "@/config/editorScenarios";

import layers from "@/assets/editor/layers.svg";
import metrics from "@/assets/editor/metrics.svg";
import changes from "@/assets/editor/changes.svg";

const ICON_PX = 18;
const STROKE = 1.75;

type RailIcon =
  | { kind: "asset"; src: string }
  | {
      kind: "lucide";
      Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
    };

const TOP: { id: EditorLeftTool; label: string; icon: RailIcon }[] = [
  { id: "layers", label: "Layers", icon: { kind: "asset", src: layers } },
  { id: "add", label: "Add", icon: { kind: "lucide", Icon: Plus } },
];

const MID: { id: EditorLeftTool; label: string; icon: RailIcon }[] = [
  { id: "metrics", label: "Metrics", icon: { kind: "asset", src: metrics } },
  {
    id: "translate",
    label: "Translate",
    icon: { kind: "lucide", Icon: Languages },
  },
];

const BOTTOM_TOOLS: { id: EditorLeftTool; label: string; icon: RailIcon }[] = [
  { id: "changes", label: "Changes", icon: { kind: "asset", src: changes } },
];

const BOTTOM_ACTIONS: {
  id: "undo" | "redo";
  label: string;
  icon: RailIcon;
}[] = [
  { id: "undo", label: "Undo", icon: { kind: "lucide", Icon: Undo2 } },
  { id: "redo", label: "Redo", icon: { kind: "lucide", Icon: Redo2 } },
];

function RailDivider() {
  return <div className="mx-auto h-px w-8 shrink-0 bg-border" aria-hidden />;
}

function RailItem({
  label,
  icon,
  active,
  onClick,
  disabled,
}: {
  label: string;
  icon: RailIcon;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-disabled={disabled}
      title={disabled ? `${label} (unavailable)` : label}
      className={cn(
        "flex w-full flex-col items-center gap-1.5 outline-none transition-colors",
        disabled
          ? "cursor-not-allowed text-muted-foreground/40"
          : active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
          !disabled && !active && "hover:bg-muted",
          active && "bg-muted"
        )}
      >
        {icon.kind === "asset" ? (
          <EditorIcon src={icon.src} size={ICON_PX} />
        ) : (
          <icon.Icon
            className="size-[18px]"
            strokeWidth={STROKE}
            aria-hidden
          />
        )}
      </span>
      <span className="w-full truncate text-center text-[10px] font-medium leading-none tracking-tight">
        {label}
      </span>
    </button>
  );
}

export function EditorToolRail({
  activeTool = null,
  onSelect,
}: {
  activeTool?: EditorLeftTool | null;
  onSelect?: (id: EditorLeftTool) => void;
}) {
  return (
    <aside className="relative flex w-[60px] shrink-0 flex-col border-r border-border bg-background px-1.5 pb-3 pt-3">
      <div className="flex w-full flex-col items-stretch gap-2.5">
        {TOP.map((t) => (
          <RailItem
            key={t.id}
            label={t.label}
            icon={t.icon}
            active={activeTool === t.id}
            onClick={() => onSelect?.(t.id)}
          />
        ))}
        <RailDivider />
        {MID.map((t) => (
          <RailItem
            key={t.id}
            label={t.label}
            icon={t.icon}
            active={activeTool === t.id}
            onClick={() => onSelect?.(t.id)}
          />
        ))}
      </div>

      <div className="mt-auto flex w-full flex-col items-stretch gap-2.5 pt-3">
        {BOTTOM_TOOLS.map((t) => (
          <RailItem
            key={t.id}
            label={t.label}
            icon={t.icon}
            active={activeTool === t.id}
            onClick={() => onSelect?.(t.id)}
          />
        ))}
        <RailDivider />
        {BOTTOM_ACTIONS.map((t) => (
          <RailItem key={t.id} label={t.label} icon={t.icon} disabled />
        ))}
      </div>
    </aside>
  );
}
