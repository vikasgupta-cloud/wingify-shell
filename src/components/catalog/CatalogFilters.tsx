/** Catalog Filters popover — Id multi-select + numeric ranges. */

import { useMemo, useState } from "react";
import { Filter, RotateCcw, Search } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CATALOG_PRODUCTS } from "@/data/catalogProducts";
import {
  catalogFiltersActive,
  useCatalogTableStore,
  type CatalogRangeFilter,
} from "@/store/catalogTable";
import { cn } from "@/lib/utils";

function RangeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CatalogRangeFilter;
  onChange: (next: CatalogRangeFilter) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Min"
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
          className="h-9"
        />
        <span className="shrink-0 text-sm text-muted-foreground">to</span>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="Max"
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
          className="h-9"
        />
      </div>
    </div>
  );
}

export default function CatalogFilters() {
  const filters = useCatalogTableStore((s) => s.filters);
  const setFilters = useCatalogTableStore((s) => s.setFilters);
  const resetFilters = useCatalogTableStore((s) => s.resetFilters);
  const [idQuery, setIdQuery] = useState("");
  const active = catalogFiltersActive(filters);

  const ids = useMemo(() => {
    const q = idQuery.trim();
    const all = CATALOG_PRODUCTS.map((p) => p.id);
    if (!q) return all;
    return all.filter((id) => id.includes(q));
  }, [idQuery]);

  const toggleId = (id: string) => {
    const next = filters.ids.includes(id)
      ? filters.ids.filter((x) => x !== id)
      : [...filters.ids, id];
    setFilters({ ids: next });
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
          {active ? (
            <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium tabular-nums text-foreground">
              {[
                filters.ids.length ? 1 : 0,
                filters.price.min || filters.price.max ? 1 : 0,
                filters.pageviews.min || filters.pageviews.max ? 1 : 0,
                filters.purchases.min || filters.purchases.max ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[360px] max-h-[min(75vh,560px)] overflow-y-auto p-4"
      >
        <PopoverArrow className="fill-popover stroke-border" />
        <div className="mb-1 flex items-start justify-between gap-3">
          <div>
            <p className="font-sans text-sm font-semibold text-foreground">Filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You can only filter displayed catalog fields of type text, number
              or boolean.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto shrink-0 gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={resetFilters}
            disabled={!active}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset filters
          </Button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Id</Label>
            <div className="rounded-md border border-input">
              <div className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
                <Input
                  value={idQuery}
                  onChange={(e) => setIdQuery(e.target.value)}
                  placeholder="Select…"
                  className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
                />
                <Search
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <ul className="max-h-40 overflow-y-auto py-1">
                {ids.map((id) => (
                  <li key={id}>
                    <label className="flex cursor-pointer items-center gap-2.5 px-2.5 py-1.5 text-sm hover:bg-muted/60">
                      <Checkbox
                        checked={filters.ids.includes(id)}
                        onCheckedChange={() => toggleId(id)}
                        aria-label={`Filter id ${id}`}
                      />
                      <span className="truncate tabular-nums text-foreground">
                        {id}
                      </span>
                    </label>
                  </li>
                ))}
                {ids.length === 0 && (
                  <li className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                    No matching ids
                  </li>
                )}
              </ul>
            </div>
          </div>

          <RangeField
            label="Price"
            value={filters.price}
            onChange={(price) => setFilters({ price })}
          />
          <RangeField
            label="Pageviews last 30 days"
            value={filters.pageviews}
            onChange={(pageviews) => setFilters({ pageviews })}
          />
          <RangeField
            label="Purchases last 30 days"
            value={filters.purchases}
            onChange={(purchases) => setFilters({ purchases })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
