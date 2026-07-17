import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { GripVertical, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { COLUMNS, type ColumnId } from "../../config/columns";
import { useActiveViewState, useViewsStore } from "../../store/views";
import { useTableStore, type RowDensity } from "../../store/table";
import { cn } from "../../lib/utils";

const CHECKBOX_CLASS =
  "h-3.5 w-3.5 [&_svg]:size-3 disabled:cursor-not-allowed";

// Row-density options: S / M / L with full names as tooltips.
const DENSITIES: { key: RowDensity; label: string; title: string }[] = [
  { key: "compact", label: "S", title: "Compact" },
  { key: "default", label: "M", title: "Default" },
  { key: "comfortable", label: "L", title: "Comfortable" },
];

const isLocked = (id: ColumnId) =>
  COLUMNS.find((c) => c.id === id)?.locked === true;

export default function ColumnConfig() {
  const { visibleColumns } = useActiveViewState();
  const updateDraft = useViewsStore((s) => s.updateActiveViewDraft);
  const resetColumns = useViewsStore((s) => s.resetActiveViewColumns);
  const rowDensity = useTableStore((s) => s.rowDensity);
  const setRowDensity = useTableStore((s) => s.setRowDensity);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const byId = new Map(COLUMNS.map((c) => [c.id, c]));
  const available = COLUMNS.filter((c) => !visibleColumns.includes(c.id));

  const toggleColumn = (id: ColumnId) => {
    if (isLocked(id)) return;
    const next = visibleColumns.includes(id)
      ? visibleColumns.filter((c) => c !== id)
      : [...visibleColumns, id];
    updateDraft({ visibleColumns: next });
  };

  const reorderColumns = (from: number, to: number) => {
    // Index 0 is the locked "name" column — nothing moves from or to it.
    if (
      from <= 0 ||
      to <= 0 ||
      from >= visibleColumns.length ||
      to >= visibleColumns.length ||
      from === to
    )
      return;
    const next = [...visibleColumns];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateDraft({ visibleColumns: next });
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
          title="Configure columns"
          aria-label="Configure columns"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[280px] rounded-md border border-border bg-popover p-3 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {/* Row height — global preference, not part of the view. */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Row height</span>
            <div className="inline-flex items-center rounded-md bg-muted p-0.5">
              {DENSITIES.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  title={d.title}
                  aria-label={`${d.title} row height`}
                  onClick={() => setRowDensity(d.key)}
                  className={cn(
                    "rounded-[5px] px-2 py-0.5 text-xs transition-colors",
                    rowDensity === d.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="my-2 h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Active view
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Reset to default"
              aria-label="Reset to default"
              onClick={resetColumns}
              className="h-auto w-auto p-1 text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-1.5 flex flex-col">
            {visibleColumns.map((id, index) => {
              const col = byId.get(id);
              if (!col) return null;
              const locked = col.locked === true;
              return (
                <div
                  key={id}
                  draggable={!locked}
                  onDragStart={(e) => {
                    setDragIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    // Nothing can be dropped above the locked first row.
                    if (dragIndex === null || index === 0) return;
                    e.preventDefault();
                    setDropIndex(index);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dropIndex !== null)
                      reorderColumns(dragIndex, dropIndex);
                    endDrag();
                  }}
                  onDragEnd={endDrag}
                  className={cn(
                    "relative flex items-center gap-2 rounded-sm px-1.5 py-1.5",
                    !locked && "cursor-grab hover:bg-muted",
                    dragIndex === index && "opacity-50"
                  )}
                >
                  {dragIndex !== null && dropIndex === index && (
                    <div className="pointer-events-none absolute inset-x-0 -top-px h-0.5 bg-foreground" />
                  )}
                  <Checkbox
                    checked
                    disabled={locked}
                    onCheckedChange={() => toggleColumn(id)}
                    className={CHECKBOX_CLASS}
                  />
                  <span
                    className={cn(
                      "flex-1 truncate",
                      locked && "text-muted-foreground"
                    )}
                  >
                    {col.label}
                  </span>
                  {!locked && (
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="my-2 h-px bg-border" />

          <span className="text-xs font-medium text-muted-foreground">
            Available Columns
          </span>
          <div className="mt-1.5 flex flex-col">
            {available.map((col) => (
              <label
                key={col.id}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1.5 hover:bg-muted"
              >
                <Checkbox
                  checked={false}
                  onCheckedChange={() => toggleColumn(col.id)}
                  className={CHECKBOX_CLASS}
                />
                <span className="flex-1 truncate">{col.label}</span>
              </label>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
