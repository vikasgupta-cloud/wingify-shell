// Filter chips for flag report listings — Status / Creation Date / Environments / etc.

import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronDown, Plus, Search, X } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FLAG_REPORT_CONFIG,
  FILTER_FIELD_LABEL,
  type FlagReportFilter,
  type FlagReportFilterField,
  type FlagReportFilterOp,
  type FlagReportKind,
} from "@/config/flagReports";
import {
  getFlagReportFilterFields,
  getStatusOptionsWithCounts,
} from "@/config/flagReportFilters";
import { FLAG_REPORT_ROWS } from "@/data/flagReports";
import {
  getFlagReportViewsStore,
  useActiveFlagReportViewState,
} from "@/store/flagReportViews";

const DASHED_BUTTON =
  "h-auto gap-1.5 border-dashed border-input px-2.5 py-1.5 text-sm text-foreground shadow-none hover:border-foreground hover:bg-transparent [&_svg]:size-3.5";

const OP_LABELS: Record<Exclude<FlagReportFilterOp, "is">, string> = {
  isAnyOf: "is any of",
  isNoneOf: "is none of",
};

function opLabel(op: FlagReportFilterOp): string {
  return op === "is" ? "is" : OP_LABELS[op];
}

function filterValueLength(filter: FlagReportFilter): number {
  return Array.isArray(filter.value) ? filter.value.length : filter.value ? 1 : 0;
}

export default function FlagReportFilterBar({
  kind,
}: {
  kind: FlagReportKind;
}) {
  const config = FLAG_REPORT_CONFIG[kind];
  const rows = FLAG_REPORT_ROWS[kind];
  const fields = getFlagReportFilterFields(rows, config.filterFields);
  const { filters } = useActiveFlagReportViewState(kind);
  const updateDraft = getFlagReportViewsStore(kind)(
    (s) => s.updateActiveViewDraft
  );

  const fieldDef = (field: FlagReportFilterField) =>
    fields.find((f) => f.field === field);

  const addFilter = (field: FlagReportFilterField) => {
    if (filters.some((f) => f.field === field)) return;
    updateDraft({
      filters: [...filters, { field, op: "isAnyOf", value: [] }],
    });
  };

  const setFilterAt = (index: number, patch: Partial<FlagReportFilter>) => {
    updateDraft({
      filters: filters.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    });
  };

  const removeFilterAt = (index: number) => {
    updateDraft({ filters: filters.filter((_, i) => i !== index) });
  };

  const activeFields = new Set(filters.map((f) => f.field));
  const availableToAdd = fields.filter((f) => !activeFields.has(f.field));

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter, index) => (
        <FilterChip
          key={`${filter.field}-${index}`}
          filter={filter}
          fieldLabel={FILTER_FIELD_LABEL[filter.field]}
          options={fieldDef(filter.field)?.options ?? []}
          statusCounts={
            filter.field === "status"
              ? getStatusOptionsWithCounts(rows)
              : undefined
          }
          openOnMount={
            filter.op === "isAnyOf" && filterValueLength(filter) === 0
          }
          onChange={(patch) => setFilterAt(index, patch)}
          onRemove={() => removeFilterAt(index)}
        />
      ))}

      {config.quickFilters
        .filter((f) => !activeFields.has(f))
        .map((field) => (
          <Button
            key={field}
            type="button"
            variant="outline"
            size="sm"
            className={DASHED_BUTTON}
            onClick={() => addFilter(field)}
          >
            {FILTER_FIELD_LABEL[field]}
          </Button>
        ))}

      {availableToAdd.length > 0 && (
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
              {availableToAdd.map((f) => (
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
      )}

      {filters.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-0 py-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={() => updateDraft({ filters: [] })}
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
  statusCounts,
  openOnMount,
  onChange,
  onRemove,
}: {
  filter: FlagReportFilter;
  fieldLabel: string;
  options: string[];
  statusCounts?: { option: string; count: number }[];
  openOnMount: boolean;
  onChange: (patch: Partial<FlagReportFilter>) => void;
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

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!openOnMount) return;
    const id = setTimeout(() => setOpen(true), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleValue = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter((v) => v !== option)
      : [...selected, option];
    onChange({ value: next });
  };

  const visibleOptions = (statusCounts ?? options.map((option) => ({ option, count: undefined as number | undefined })))
    .filter((o) =>
      o.option.toLowerCase().includes(query.trim().toLowerCase())
    );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="inline-flex animate-scale-in items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground duration-150">
        <Popover.Trigger asChild>
          <button type="button" className="inline-flex items-center gap-1.5 outline-none">
            <span className="font-medium">{fieldLabel}</span>
            <span className="text-muted-foreground">{opLabel(filter.op)}</span>
            <span className="max-w-[180px] truncate">{summary}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
          className="z-50 w-[260px] rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-lg"
        >
          {filter.field !== "status" && (
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
                  className="z-50 min-w-[160px] rounded-md border border-border bg-popover p-1.5 text-sm shadow-lg"
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
          )}

          {filter.field === "status" && (
            <div className="mb-2 flex items-center gap-2 rounded-md border border-input px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              />
            </div>
          )}

          <div className="max-h-[240px] space-y-0.5 overflow-y-auto">
            {visibleOptions.map(({ option, count }) => {
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
                  <span className="flex-1 truncate text-sm">{option}</span>
                  {typeof count === "number" && (
                    <span className="text-xs text-muted-foreground">{count}</span>
                  )}
                </label>
              );
            })}
          </div>

          {selected.length > 0 && (
            <button
              type="button"
              className="mt-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange({ value: [] })}
            >
              Clear
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
