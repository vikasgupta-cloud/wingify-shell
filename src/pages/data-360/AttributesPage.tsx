// Data 360 → Attributes — table layout (search + filters); action icon opens detail sheet.
// No views/overview/column config. Create stays on the shell TopBar.

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ListFilter,
  PanelRight,
  Plus,
  Search,
  X,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layout/PageHeader";
import { iconForPath, pageLabel } from "@/lib/nav";
import {
  ATTRIBUTES,
  type Attribute,
  type AttributeDataType,
  type AttributeKind,
} from "@/data/attributes";
import AttributeDetailSheet from "./AttributeDetailSheet";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

type FilterKey = "kind" | "dataType" | "createdBy";

const FILTER_LABELS: Record<FilterKey, string> = {
  kind: "Type",
  dataType: "Data Type",
  createdBy: "Created by",
};

const DASHED_BUTTON =
  "h-auto gap-1.5 border-dashed border-input px-2.5 py-1.5 text-sm text-foreground shadow-none hover:border-foreground hover:bg-transparent [&_svg]:size-3.5";

function MultiFilterChip({
  label,
  options,
  selected,
  onChange,
  onRemove,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  onRemove: () => void;
}) {
  const summary =
    selected.length === 0
      ? "…"
      : selected.length === 1
        ? selected[0]
        : `${selected[0]}, ${selected.length - 1} more…`;

  const toggle = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter((v) => v !== option)
        : [...selected, option]
    );
  };

  return (
    <Popover.Root>
      <div className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm">
        <Popover.Trigger asChild>
          <button type="button" className="inline-flex items-center gap-1.5 outline-none">
            <span className="font-medium">{label}</span>
            <span className="text-muted-foreground">is</span>
            <span className="max-w-[160px] truncate">{summary}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </Popover.Trigger>
        <button
          type="button"
          aria-label={`Remove ${label} filter`}
          onClick={onRemove}
          className="rounded-sm text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[220px] rounded-md border border-border bg-popover p-2 text-sm shadow-lg"
        >
          <div className="max-h-[240px] space-y-0.5 overflow-y-auto">
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                >
                  <CheckboxPrimitive.Root
                    checked={checked}
                    onCheckedChange={() => toggle(option)}
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  >
                    <CheckboxPrimitive.Indicator>
                      <Check className="h-3 w-3" />
                    </CheckboxPrimitive.Indicator>
                  </CheckboxPrimitive.Root>
                  <span className="truncate">{option}</span>
                </label>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default function AttributesPage() {
  const { pathname } = useLocation();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<
    Partial<Record<FilterKey, string[]>>
  >({});
  const [selected, setSelected] = useState<Attribute | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const creators = useMemo(
    () => [...new Set(ATTRIBUTES.map((a) => a.createdBy))].sort(),
    []
  );
  const kinds: AttributeKind[] = ["Standard", "My Attribute"];
  const dataTypes: AttributeDataType[] = ["Text", "Number", "Boolean", "Date"];

  const filterOptions: Record<FilterKey, string[]> = {
    kind: kinds,
    dataType: dataTypes,
    createdBy: creators,
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ATTRIBUTES.filter((a) => {
      if (q) {
        const hay = `${a.name} ${a.apiName} ${a.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      for (const [key, values] of Object.entries(activeFilters) as [
        FilterKey,
        string[] | undefined,
      ][]) {
        if (!values || values.length === 0) continue;
        if (key === "kind" && !values.includes(a.kind)) return false;
        if (key === "dataType" && !values.includes(a.dataType)) return false;
        if (key === "createdBy" && !values.includes(a.createdBy)) return false;
      }
      return true;
    });
  }, [search, activeFilters]);

  const openDetail = (attr: Attribute) => {
    setSelected(attr);
    setSheetOpen(true);
  };

  const addFilter = (key: FilterKey) => {
    if (activeFilters[key]) return;
    setActiveFilters((prev) => ({ ...prev, [key]: [] }));
  };

  const clearAll = () => setActiveFilters({});

  const activeKeys = Object.keys(activeFilters) as FilterKey[];
  const availableKeys = (Object.keys(FILTER_LABELS) as FilterKey[]).filter(
    (k) => !activeFilters[k]
  );

  return (
    <>
      <PageHeader
        title={pageLabel(pathname)}
        icon={iconForPath(pathname)}
        description="Define visitor's characteristics as per your need to visualize their unique identity."
      />

      <div className="px-12 pb-12 pt-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex w-72 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attributes…"
              className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {activeKeys.map((key) => (
            <MultiFilterChip
              key={key}
              label={FILTER_LABELS[key]}
              options={filterOptions[key]}
              selected={activeFilters[key] ?? []}
              onChange={(next) =>
                setActiveFilters((prev) => ({ ...prev, [key]: next }))
              }
              onRemove={() =>
                setActiveFilters((prev) => {
                  const { [key]: _, ...rest } = prev;
                  return rest;
                })
              }
            />
          ))}

          {availableKeys.length > 0 && (
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
                  className="z-50 min-w-[180px] rounded-md border border-border bg-popover p-1.5 text-sm shadow-lg"
                >
                  {availableKeys.map((key) => (
                    <Popover.Close asChild key={key}>
                      <button
                        type="button"
                        onClick={() => addFilter(key)}
                        className="block w-full rounded-sm px-3 py-1.5 text-left hover:bg-accent"
                      >
                        {FILTER_LABELS[key]}
                      </button>
                    </Popover.Close>
                  ))}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}

          {activeKeys.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-0 py-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={clearAll}
            >
              Clear All
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <ListFilter className="size-3.5" aria-hidden />
            {rows.length} attributes
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-listing-header text-left text-xs font-medium text-listing-header-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">API Name</th>
                  <th className="px-4 py-3">Data Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Created by</th>
                  <th className="px-4 py-3">Created on</th>
                  <th className="w-14 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((attr) => (
                  <tr
                    key={attr.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/40"
                  >
                    <td className="max-w-[220px] px-4 py-3 align-middle">
                      <span className="block truncate font-medium text-foreground">
                        {attr.name}
                      </span>
                      {attr.displayName && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {attr.displayName}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <Badge variant="secondary" className="font-medium">
                        {attr.kind}
                      </Badge>
                    </td>
                    <td className="max-w-[160px] px-4 py-3 align-middle">
                      <span className="block truncate font-mono text-xs text-muted-foreground">
                        {attr.apiName}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-foreground">
                      {attr.dataType}
                    </td>
                    <td className="max-w-[280px] px-4 py-3 align-middle">
                      <span
                        className={cn(
                          "block truncate text-muted-foreground",
                          !attr.description && "italic"
                        )}
                        title={attr.description || undefined}
                      >
                        {attr.description || "–"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle text-foreground">
                      {attr.createdBy}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle text-foreground">
                      {formatDate(attr.createdOn)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Open details for ${attr.name}`}
                        onClick={() => openDetail(attr)}
                      >
                        <PanelRight className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-16 text-center text-sm text-muted-foreground"
                    >
                      No attributes match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AttributeDetailSheet
        attribute={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
