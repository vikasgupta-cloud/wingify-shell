/** Strategies Filters — Tags / Status / Locations multi-select. */

import { useMemo, useState } from "react";
import { ChevronDown, Filter, RotateCcw } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getRecommendationFilterOptions,
  recommendationFiltersActive,
  type RecommendationFilter,
  type RecommendationFilterField,
} from "@/config/recommendationFilters";
import { useVisibleRecommendations } from "@/store/recommendationRows";
import { useRecommendationTableStore } from "@/store/recommendationTable";
import { cn } from "@/lib/utils";

function MultiSelectField({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const summary =
    selected.length === 0
      ? "Select…"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`;

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="space-y-2">
      <Label className="font-sans text-sm font-medium text-foreground">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm outline-none hover:bg-muted/40",
              open && "border-foreground",
              selected.length === 0 && "text-muted-foreground"
            )}
          >
            <span className="truncate">{summary}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[var(--radix-popover-trigger-width)] p-1"
        >
          <ul className="max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <li key={opt}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm hover:bg-muted">
                  <Checkbox
                    checked={selected.includes(opt)}
                    onCheckedChange={() => toggle(opt)}
                  />
                  <span className="truncate">{opt}</span>
                </label>
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                No options
              </li>
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function valuesFor(
  filters: RecommendationFilter[],
  field: RecommendationFilterField
): string[] {
  const f = filters.find((x) => x.field === field);
  if (!f) return [];
  return Array.isArray(f.value) ? f.value : f.value ? [f.value] : [];
}

export default function RecommendationFilters() {
  const rows = useVisibleRecommendations();
  const filters = useRecommendationTableStore((s) => s.filters);
  const setFilters = useRecommendationTableStore((s) => s.setFilters);
  const options = useMemo(
    () => getRecommendationFilterOptions(rows),
    [rows]
  );
  const active = recommendationFiltersActive(filters);

  const setField = (field: RecommendationFilterField, value: string[]) => {
    const rest = filters.filter((f) => f.field !== field);
    if (value.length === 0) {
      setFilters(rest);
      return;
    }
    setFilters([...rest, { field, op: "isAnyOf", value }]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-2", active && "border-foreground")}
        >
          <Filter className="size-3.5" aria-hidden />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[340px] space-y-5 p-4"
      >
        <PopoverArrow className="fill-popover stroke-border" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-sans text-sm font-semibold text-foreground">
              Filters
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use filters to refine your strategies list.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto shrink-0 gap-1.5 px-2 py-1 text-xs text-muted-foreground"
            disabled={!active}
            onClick={() => setFilters([])}
          >
            <RotateCcw className="size-3.5" />
            Reset filters
          </Button>
        </div>

        <MultiSelectField
          label="Tags"
          options={options.tags}
          selected={valuesFor(filters, "tags")}
          onChange={(v) => setField("tags", v)}
        />
        <MultiSelectField
          label="Status"
          options={options.statuses}
          selected={valuesFor(filters, "status")}
          onChange={(v) => setField("status", v)}
        />
        <MultiSelectField
          label="Locations"
          options={options.locations}
          selected={valuesFor(filters, "location")}
          onChange={(v) => setField("location", v)}
        />
      </PopoverContent>
    </Popover>
  );
}
