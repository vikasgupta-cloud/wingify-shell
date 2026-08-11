import { MoreHorizontal, Plus, X } from "@/components/icons/protoLucide";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createNextVariation,
  type EditorVariationTab,
  type VariationId,
} from "@/components/editor/EditorVariationBar";
import { resolveFirstFold } from "@/config/editorFirstFold";

/** Bottom-sheet variations picker — thumbnail tiles with overflow actions. */
export function EditorVariationsPanel({
  variations,
  activeVariationId,
  onSelect,
  onVariationsChange,
  versionFoldKey = "initial",
  onClose,
  compact = false,
}: {
  variations: EditorVariationTab[];
  activeVariationId: VariationId;
  onSelect: (id: VariationId) => void;
  onVariationsChange: (next: EditorVariationTab[]) => void;
  versionFoldKey?: string;
  onClose?: () => void;
  compact?: boolean;
}) {
  const addVariation = () => {
    const next = createNextVariation(variations);
    onVariationsChange([...variations, next]);
    onSelect(next.id);
  };

  const duplicate = (id: VariationId) => {
    const source = variations.find((v) => v.id === id);
    if (!source) return;
    const next = createNextVariation(variations);
    onVariationsChange([
      ...variations,
      { ...next, label: `${source.label} copy` },
    ]);
    onSelect(next.id);
  };

  const remove = (id: VariationId) => {
    if (id === "control") return;
    if (variations.length <= 1) return;
    const next = variations.filter((v) => v.id !== id);
    onVariationsChange(next);
    if (activeVariationId === id) {
      onSelect(next[0]?.id ?? "control");
    }
  };

  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div
        className={cn(
          "flex h-10 shrink-0 items-center justify-between border-b border-border",
          compact ? "gap-2 px-3" : "gap-3 px-4"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Variations</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {variations.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 rounded-md px-2 text-xs font-semibold"
            onClick={addVariation}
          >
            <Plus className="size-3.5" strokeWidth={1.75} />
            {compact ? "New" : "New variation"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md"
            aria-label="Close variations"
            onClick={onClose}
          >
            <X className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          compact ? "p-3" : "p-4"
        )}
      >
        <ul
          className={cn(
            "grid gap-2.5",
            compact
              ? "grid-cols-1 min-[360px]:grid-cols-2"
              : "grid-cols-2 gap-3 sm:grid-cols-3"
          )}
        >
          {variations.map((v) => {
            const active = v.id === activeVariationId;
            const fold = resolveFirstFold(v.id, versionFoldKey);
            return (
              <li key={v.id} className="min-w-0">
                <div
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-xl border bg-background transition-colors",
                    active
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border hover:border-foreground/40"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(v.id)}
                    className="w-full text-left outline-none"
                  >
                    <span
                      className="relative block aspect-[16/10] overflow-hidden border-b border-border"
                      style={{ background: fold.heroSurface }}
                    >
                      <span className="absolute inset-y-0 left-0 w-[42%] bg-muted">
                        <span className="absolute inset-0 bg-muted-foreground/10" />
                      </span>
                      <span className="absolute inset-y-3 right-3 left-[46%] flex flex-col justify-center gap-1.5">
                        <span className="h-1 w-10 rounded-full bg-muted-foreground/35" />
                        <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-foreground">
                          {fold.heading}
                        </span>
                        <span className="h-1 w-14 rounded-full bg-muted-foreground/25" />
                        <span className="mt-0.5 h-4 w-16 rounded-sm bg-foreground/80" />
                      </span>
                      <span className="absolute left-2 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-border bg-background px-1.5 text-[10px] font-semibold text-foreground shadow-sm">
                        {v.chip}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 px-2.5 py-2 pr-9">
                      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-foreground">
                        {v.label}
                      </span>
                      {active && (
                        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Active
                        </span>
                      )}
                    </span>
                  </button>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-1.5 right-1.5 size-7 rounded-md opacity-70 hover:opacity-100"
                        aria-label={`${v.label} options`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="size-3.5" strokeWidth={1.75} />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        sideOffset={4}
                        className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu.Item
                          className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                          onSelect={() => onSelect(v.id)}
                        >
                          Open
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                          onSelect={() => duplicate(v.id)}
                        >
                          Duplicate
                        </DropdownMenu.Item>
                        {v.id !== "control" && (
                          <DropdownMenu.Item
                            className="cursor-pointer rounded-sm px-3 py-1.5 text-foreground outline-none data-[highlighted]:bg-accent"
                            onSelect={() => remove(v.id)}
                          >
                            Delete
                          </DropdownMenu.Item>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
