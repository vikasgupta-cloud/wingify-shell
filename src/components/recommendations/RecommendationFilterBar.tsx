// Recommendation filter chips + Group — same UX as WE FilterBar.

import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronDown, Plus, Rows3, X } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  getRecommendationFilterFields,
  RECOMMENDATION_GROUP_FIELDS,
  type RecommendationFilter,
  type RecommendationFilterField,
  type RecommendationFilterOp,
  type RecommendationGroupField,
} from "@/config/recommendationFilters";
import { useVisibleRecommendations } from "@/store/recommendationRows";
import { useRecommendationTableStore } from "@/store/recommendationTable";

const DASHED_BUTTON =
  "h-auto gap-1.5 border-dashed border-input px-2.5 py-1.5 text-sm text-foreground shadow-none hover:border-foreground hover:bg-transparent [&_svg]:size-3.5";

const OP_LABELS: Record<Exclude<RecommendationFilterOp, "is">, string> = {
  isAnyOf: "is any of",
  isNoneOf: "is none of",
};

function opLabel(op: RecommendationFilterOp): string {
  return op === "is" ? "is" : OP_LABELS[op];
}

function filterValueLength(filter: RecommendationFilter): number {
  return Array.isArray(filter.value) ? filter.value.length : filter.value ? 1 : 0;
}

export default function RecommendationFilterBar() {
  const rows = useVisibleRecommendations();
  const fields = getRecommendationFilterFields(rows);
  const filters = useRecommendationTableStore((s) => s.filters);
  const groupBy = useRecommendationTableStore((s) => s.groupBy);
  const setFilters = useRecommendationTableStore((s) => s.setFilters);
  const setGroupBy = useRecommendationTableStore((s) => s.setGroupBy);

  const fieldDef = (field: RecommendationFilterField) =>
    fields.find((f) => f.field === field);
  const fieldLabel = (field: RecommendationFilterField) =>
    fieldDef(field)?.label ?? field;

  const addFilter = (field: RecommendationFilterField) => {
    setFilters([...filters, { field, op: "isAnyOf", value: [] }]);
  };

  const setFilterAt = (index: number, patch: Partial<RecommendationFilter>) => {
    setFilters(filters.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const removeFilterAt = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const groupLabel = RECOMMENDATION_GROUP_FIELDS.find(
    (g) => g.id === groupBy
  )?.label;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter, index) => (
        <FilterChip
          key={index}
          filter={filter}
          fieldLabel={fieldLabel(filter.field)}
          options={fieldDef(filter.field)?.options ?? []}
          openOnMount={
            filter.op === "isAnyOf" && filterValueLength(filter) === 0
          }
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
            className="z-50 min-w-[180px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
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

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={DASHED_BUTTON}
          >
            <Rows3 className="h-3.5 w-3.5" />
            {groupBy === "none" ? "Group" : groupLabel}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={4}
            className="z-50 min-w-[180px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
          >
            {RECOMMENDATION_GROUP_FIELDS.map((g) => (
              <DropdownMenu.Item
                key={g.id}
                onSelect={() =>
                  setGroupBy(g.id as RecommendationGroupField)
                }
                className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
              >
                {g.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {filters.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-0 py-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={() => setFilters([])}
        >
          Clear All
        </Button>
      )}
    </div>
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
  filter: RecommendationFilter;
  fieldLabel: string;
  options: string[];
  openOnMount: boolean;
  onChange: (patch: Partial<RecommendationFilter>) => void;
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
        : `${selected[0]}, ${selected.length - 1} more…`;

  const toggleValue = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((v) => v !== option)
      : [...selected, option];
    onChange({ value: next });
  };

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!openOnMount) return;
    const id = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="inline-flex animate-scale-in items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground duration-150">
        <Popover.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 outline-none"
          >
            <span className="font-medium">{fieldLabel}</span>
            <span className="text-muted-foreground">{opLabel(filter.op)}</span>
            <span className="max-w-[180px] truncate">{summary}</span>
          </button>
        </Popover.Trigger>
        <button
          type="button"
          aria-label={`Remove ${fieldLabel} filter`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[240px] rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-lg"
        >
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
                className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
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

          <div className="max-h-[240px] space-y-0.5 overflow-y-auto">
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                >
                  <Checkbox.Root
                    checked={checked}
                    onCheckedChange={() => toggleValue(option)}
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  >
                    <Checkbox.Indicator>
                      <Check className="h-3 w-3" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span className="truncate text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
