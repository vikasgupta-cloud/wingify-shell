import { cn } from "@/lib/utils";
import { EditorIcon } from "./EditorIcon";

import layers from "@/assets/editor/layers.svg";
import plus from "@/assets/editor/plus.svg";
import metrics from "@/assets/editor/metrics.svg";
import translate from "@/assets/editor/translate.svg";
import changes from "@/assets/editor/changes.svg";
import undo from "@/assets/editor/undo.svg";
import redo from "@/assets/editor/redo.svg";

const TOP = [
  { id: "layers", label: "Layers", icon: layers },
  { id: "add", label: "Add", icon: plus },
] as const;

const MID = [
  { id: "metrics", label: "Metrics", icon: metrics },
  { id: "translate", label: "Translate", icon: translate },
] as const;

const BOTTOM = [
  { id: "changes", label: "Changes", icon: changes },
  { id: "undo", label: "Undo", icon: undo },
  { id: "redo", label: "Redo", icon: redo },
] as const;

function RailItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col items-center gap-0.5 outline-none",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg p-2",
          active && "bg-muted"
        )}
      >
        <EditorIcon src={icon} size={20} />
      </span>
      <span className="text-center text-[10px] font-semibold leading-none">
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
    <aside className="relative flex w-[60px] shrink-0 flex-col border-r border-border bg-background px-1.5 pb-3 pt-2">
      <div className="flex flex-col items-center gap-3">
        <div className="flex w-full flex-col items-center gap-0.5">
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
        <div className="flex w-full flex-col items-center gap-3">
          {MID.map((t) => (
            <RailItem key={t.id} label={t.label} icon={t.icon} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 left-1.5 flex w-12 flex-col items-center gap-2">
        {BOTTOM.map((t) => (
          <RailItem key={t.id} label={t.label} icon={t.icon} />
        ))}
      </div>
    </aside>
  );
}
