import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { GripVertical, RotateCcw, Settings } from "lucide-react";
import { useVisibleCampaigns } from "../../store/rows";
import {
  useActiveViewState,
  useViewsStore,
  type BoardColumnConfig as BoardColumnCfg,
} from "../../store/views";
import type { GroupField } from "../../config/grouping";
import { cn } from "../../lib/utils";
import { arrangeKeys, naturalKeys } from "./columns";

const CHECKBOX_CLASS =
  "h-3.5 w-3.5 shrink-0 accent-foreground disabled:cursor-not-allowed";

export default function BoardColumnConfig() {
  const { groupBy, boardColumns } = useActiveViewState();
  const updateDraft = useViewsStore((s) => s.updateActiveViewDraft);
  const campaigns = useVisibleCampaigns();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Operate on the current group field, defaulting to status.
  const field: GroupField = groupBy ?? "status";
  const cfg = boardColumns[field];
  const natural = naturalKeys(field, campaigns);
  const keys = arrangeKeys(natural, cfg);
  const hidden = new Set(cfg?.hidden ?? []);

  const write = (next: BoardColumnCfg) =>
    updateDraft({ boardColumns: { ...boardColumns, [field]: next } });

  const reset = () => {
    const { [field]: _removed, ...rest } = boardColumns;
    updateDraft({ boardColumns: rest });
  };

  const toggle = (key: string) => {
    const nextHidden = hidden.has(key)
      ? [...hidden].filter((k) => k !== key)
      : [...hidden, key];
    write({ order: keys, hidden: nextHidden });
  };

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= keys.length || to >= keys.length)
      return;
    const next = [...keys];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    write({ order: next, hidden: [...hidden] });
  };

  const endDrag = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          title="Configure board columns"
          aria-label="Configure board columns"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[280px] rounded-md border border-border bg-popover p-3 text-sm text-popover-foreground shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Board columns
            </span>
            <button
              type="button"
              title="Reset to default"
              aria-label="Reset to default"
              onClick={reset}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-1.5 flex flex-col">
            {keys.map((key, index) => (
              <div
                key={key}
                draggable
                onDragStart={(e) => {
                  setDragIndex(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  setDropIndex(index);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null && dropIndex !== null)
                    reorder(dragIndex, dropIndex);
                  endDrag();
                }}
                onDragEnd={endDrag}
                className={cn(
                  "relative flex cursor-grab items-center gap-2 rounded-sm px-1.5 py-1.5 hover:bg-muted",
                  dragIndex === index && "opacity-50"
                )}
              >
                {dragIndex !== null && dropIndex === index && (
                  <div className="pointer-events-none absolute inset-x-0 -top-px h-0.5 bg-foreground" />
                )}
                <input
                  type="checkbox"
                  checked={!hidden.has(key)}
                  onChange={() => toggle(key)}
                  className={CHECKBOX_CLASS}
                />
                <span className="flex-1 truncate">{key}</span>
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
