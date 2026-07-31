import type { ComponentType } from "react";
import { Languages, Plus, Redo2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";

import layers from "@/assets/editor/layers.svg";
import metrics from "@/assets/editor/metrics.svg";
import changes from "@/assets/editor/changes.svg";

type RailIcon =
  | { kind: "asset"; src: string }
  | { kind: "lucide"; Icon: ComponentType<{ className?: string; strokeWidth?: number }> };

const TOP: { id: string; label: string; icon: RailIcon }[] = [
  { id: "layers", label: "Layers", icon: { kind: "asset", src: layers } },
  { id: "add", label: "Add", icon: { kind: "lucide", Icon: Plus } },
];

const MID: { id: string; label: string; icon: RailIcon }[] = [
  { id: "metrics", label: "Metrics", icon: { kind: "asset", src: metrics } },
  { id: "translate", label: "Translate", icon: { kind: "lucide", Icon: Languages } },
];

const BOTTOM: { id: string; label: string; icon: RailIcon }[] = [
  { id: "changes", label: "Changes", icon: { kind: "asset", src: changes } },
  { id: "undo", label: "Undo", icon: { kind: "lucide", Icon: Undo2 } },
  { id: "redo", label: "Redo", icon: { kind: "lucide", Icon: Redo2 } },
];

function RailItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: RailIcon;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col items-center gap-1 outline-none",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg p-2 transition-colors",
          active && "bg-muted"
        )}
      >
        {icon.kind === "asset" ? (
          <EditorIcon src={icon.src} size={20} />
        ) : (
          <icon.Icon className="size-5" strokeWidth={1.75} />
        )}
      </span>
      <span className="text-center text-[10px] font-medium leading-none">
        {label}
      </span>
    </button>
  );
}

export function EditorToolRail({
  activeTool = "layers",
}: {
  activeTool?: string;
}) {
  return (
    <aside className="relative flex w-[60px] shrink-0 flex-col border-r border-border bg-background px-1.5 pb-3 pt-3">
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col items-center gap-4">
          {TOP.map((t) => (
            <RailItem
              key={t.id}
              label={t.label}
              icon={t.icon}
              active={activeTool === t.id}
            />
          ))}
        </div>
        <div className="h-px w-8 bg-border" />
        <div className="flex w-full flex-col items-center gap-4">
          {MID.map((t) => (
            <RailItem key={t.id} label={t.label} icon={t.icon} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 left-1.5 flex w-12 flex-col items-center gap-3">
        {BOTTOM.map((t) => (
          <RailItem key={t.id} label={t.label} icon={t.icon} />
        ))}
      </div>
    </aside>
  );
}
