import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronDown, Plus, Rows3, X } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  getFilterFields,
  type Filter,
  type FilterField,
  type FilterOp,
} from "../../config/filters";
import { GROUP_FIELDS, type GroupField } from "../../config/grouping";
import { cn } from "../../lib/utils";
import { useVisibleCampaigns } from "../../store/rows";
import { useActiveViewState, useViewsStore } from "../../store/views";

// Dashed outline (Add filter / Group) — outline with dashed border, foreground text.
const DASHED_BUTTON =
  "h-auto gap-1.5 border-dashed border-input px-2.5 py-1.5 text-sm text-foreground shadow-none hover:border-foreground hover:bg-transparent [&_svg]:size-3.5";
/** Applied filter chip — ~1 shade darker than canvas via color-mix (works light + dark). */
const ACTIVE_FILTER_CHIP =
  "inline-flex animate-scale-in items-center gap-1 rounded-md border border-border bg-[color-mix(in_srgb,var(--canvas)_94%,var(--foreground)_6%)] px-2.5 py-1.5 text-sm text-foreground duration-150";
const ACTIVE_FILTER_CHIP_MUTED = "text-muted-foreground";
const ACTIVE_FILTER_CHIP_CLOSE =
  "rounded-sm text-muted-foreground transition-colors hover:text-foreground";
const OP_LABELS: Record<Exclude<FilterOp, "is">, string> = {
  isAnyOf: "is any of",
  isNoneOf: "is none of",
};

function opLabel(op: FilterOp): string {
  return op === "is" ? "is" : OP_LABELS[op];
}

export default function FilterBar() {
  const rows = useVisibleCampaigns();
  const fields = getFilterFields(rows);
  const { filters, groupBy } = useActiveViewState();
  const updateDraft = useViewsStore((s) => s.updateActiveViewDraft);

  const fieldDef = (field: FilterField) => fields.find((f) => f.field === field);
  const fieldLabel = (field: FilterField) => fieldDef(field)?.label ?? field;

  const addFilter = (field: FilterField) => {
    updateDraft({
      filters: [...filters, { field, op: "isAnyOf", value: [] }],
    });
  };

  const setFilterAt = (index: number, patch: Partial<Filter>) => {
    updateDraft({
      filters: filters.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    });
  };

  const removeFilterAt = (index: number) => {
    updateDraft({ filters: filters.filter((_, i) => i !== index) });
  };

  const groupLabel = GROUP_FIELDS.find((g) => g.id === groupBy)?.label;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter, index) => (
        <FilterChip
          // Filters are positional; index is stable for a given chip instance.
          key={index}
          filter={filter}
          fieldLabel={fieldLabel(filter.field)}
          options={fieldDef(filter.field)?.options ?? []}
          openOnMount={filter.op === "isAnyOf" && filterValueLength(filter) === 0}
          onChange={(patch) => setFilterAt(index, patch)}
          onRemove={() => removeFilterAt(index)}
        />
      ))}

      <Popover.Root>
        <Popover.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={DASHED_BUTTON}
          >
            <Plus className="h-3.5 w-3.5" />
            Add filter
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            className="z-50 min-w-[180px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            {fields.map((f) => (
              <Popover.Close asChild key={f.field}>
                <button
                  type="button"
                  onClick={() => addFilter(f.field)}
                  className="block w-full cursor-pointer rounded-sm px-3 py-1.5 text-left outline-none transition-colors hover:bg-accent"
                >
                  {f.label}
                </button>
              </Popover.Close>
            ))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Group by */}
      {groupBy ? (
        <div className="inline-flex items-center gap-1 rounded-md border border-dashed border-input bg-background px-2.5 py-1.5 text-sm text-foreground">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="inline-flex items-center gap-1.5">
                <Rows3 className="h-3.5 w-3.5" />
                Group: {groupLabel}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <GroupMenu
              value={groupBy}
              onSelect={(g) => updateDraft({ groupBy: g })}
            />
          </DropdownMenu.Root>
          <button
            type="button"
            aria-label="Clear grouping"
            onClick={() => updateDraft({ groupBy: null })}
            className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={DASHED_BUTTON}
            >
              <Rows3 className="h-3.5 w-3.5" />
              Group
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenu.Trigger>
          <GroupMenu value={null} onSelect={(g) => updateDraft({ groupBy: g })} />
        </DropdownMenu.Root>
      )}
    </div>
  );
}

function filterValueLength(filter: Filter): number {
  return Array.isArray(filter.value) ? filter.value.length : filter.value ? 1 : 0;
}

function GroupMenu({
  value,
  onSelect,
}: {
  value: GroupField | null;
  onSelect: (g: GroupField | null) => void;
}) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="start"
        sideOffset={4}
        className="z-50 min-w-[180px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      >
        <DropdownMenu.Item
          onSelect={() => onSelect(null)}
          className="cursor-pointer rounded-sm px-3 py-1.5 text-foreground outline-none data-[highlighted]:bg-accent"
        >
          None
        </DropdownMenu.Item>
        {GROUP_FIELDS.map((g) => (
          <DropdownMenu.Item
            key={g.id}
            onSelect={() => onSelect(g.id)}
            className="flex cursor-pointer items-center justify-between rounded-sm px-3 py-1.5 text-foreground outline-none data-[highlighted]:bg-accent"
          >
            {g.label}
            {value === g.id && <Check className="h-3.5 w-3.5" />}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

function FilterChip({
  filter,
  fieldLabel,
  options,
  openOnMount,
  onChange,
  onRemove,
}: {
  filter: Filter;
  fieldLabel: string;
  options: string[];
  openOnMount: boolean;
  onChange: (patch: Partial<Filter>) => void;
  onRemove: () => void;
}) {
  const selected = Array.isArray(filter.value)
    ? filter.value
    : filter.value
      ? [filter.value]
      : [];

  const summary =
    selected.length === 0
      ? "…"
      : selected.length === 1
        ? selected[0]
        : `${selected[0]} +${selected.length - 1}`;

  const toggleValue = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((v) => v !== option)
      : [...selected, option];
    onChange({ value: next });
  };

  // Auto-open just-added filters. Deferred a tick so the "Add filter" popover's
  // dismiss layer finishes closing first — otherwise it swallows this open.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!openOnMount) return;
    const id = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(id);
    // Only on mount — openOnMount reflects the initial (empty) state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          ACTIVE_FILTER_CHIP,
          open &&
            "bg-[color-mix(in_srgb,var(--canvas)_90%,var(--foreground)_10%)]"
        )}
      >
        <Popover.Trigger asChild>
          <button type="button" className="inline-flex items-center gap-1.5 outline-none">
            <span className="font-medium">{fieldLabel}</span>
            <span className={ACTIVE_FILTER_CHIP_MUTED}>{opLabel(filter.op)}</span>
            <span className="max-w-[160px] truncate font-medium">{summary}</span>
          </button>
        </Popover.Trigger>
        <button
          type="button"
          aria-label={`Remove ${fieldLabel} filter`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={ACTIVE_FILTER_CHIP_CLOSE}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[240px] rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {/* Op selector */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="mb-2 flex w-full items-center justify-between rounded-md border border-input px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                {opLabel(filter.op)}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={4}
                className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                {(["isAnyOf", "isNoneOf"] as const).map((op) => (
                  <DropdownMenu.Item
                    key={op}
                    onSelect={() => onChange({ op })}
                    className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
                  >
                    {opLabel(op)}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Value checkboxes */}
          <div className="max-h-[240px] space-y-0.5 overflow-y-auto">
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 transition-colors hover:bg-accent"
                >
                  <Checkbox.Root
                    checked={checked}
                    onCheckedChange={() => toggleValue(option)}
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background data-[state=checked]:border-foreground data-[state=checked]:bg-foreground"
                  >
                    <Checkbox.Indicator>
                      <Check className="h-3 w-3 text-background" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span className="truncate">{option}</span>
                </label>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ value: [] })}
              className="h-auto px-0 py-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              Clear
            </Button>
            <Popover.Close asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-auto px-0 py-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              >
                Remove filter
              </Button>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
