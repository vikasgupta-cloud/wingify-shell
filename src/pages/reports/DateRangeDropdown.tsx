import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
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

export type DateRange = {
  id: string;
  label: string;
  from: Date;
  to: Date;
};

export const CUSTOM_RANGE_ID = "custom";

/** Local calendar "today" stored as UTC midnight (matches picker conversion). */
function localTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/** Client-side presets relative to today — recomputed whenever called. */
export function getDateRangePresets(opts?: {
  campaignFrom?: Date;
  campaignTo?: Date;
}): DateRange[] {
  const today = localTodayUtc();
  const yesterday = addUtcDays(today, -1);
  return [
    { id: "today", label: "Today", from: today, to: today },
    { id: "yesterday", label: "Yesterday", from: yesterday, to: yesterday },
    {
      id: "last-7",
      label: "Last 7 days",
      from: addUtcDays(today, -6),
      to: today,
    },
    {
      id: "last-14",
      label: "Last 14 days",
      from: addUtcDays(today, -13),
      to: today,
    },
    {
      id: "last-15",
      label: "Last 15 days",
      from: addUtcDays(today, -14),
      to: today,
    },
    {
      id: "last-30",
      label: "Last 30 days",
      from: addUtcDays(today, -29),
      to: today,
    },
    {
      id: "campaign",
      label: "Campaign duration",
      from: opts?.campaignFrom ?? addUtcDays(today, -22),
      to: opts?.campaignTo ?? today,
    },
  ];
}

/** Picker works in local calendar days; stored ranges stay UTC midnight. */
function toPickerDay(d: Date): Date {
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function fromPickerDay(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

function sameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function formatRangeChip(from: Date, to: Date) {
  const part = (d: Date) => {
    const y = String(d.getUTCFullYear()).slice(-2);
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${MONTHS[d.getUTCMonth()]} ${day}, ${y}'`;
  };
  return `${part(from)} - ${part(to)}`;
}

/** Compact range label for the inline preset bar (e.g. "1 Jan 24 - 1 Dec 24"). */
function formatRangeBar(from: Date, to: Date) {
  const part = (d: Date) => {
    const y = String(d.getUTCFullYear()).slice(-2);
    return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${y}`;
  };
  return `${part(from)} - ${part(to)}`;
}

function formatDayLabel(d: Date) {
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${day}, ${d.getUTCFullYear()}`;
}

/** Inline filter-bar presets shown before the custom range picker. */
const FILTER_BAR_PRESET_IDS = [
  "today",
  "yesterday",
  "last-7",
  "last-15",
] as const;

const FILTER_BAR_PRESET_LABELS: Record<
  (typeof FILTER_BAR_PRESET_IDS)[number],
  string
> = {
  today: "Today",
  yesterday: "Yesterday",
  "last-7": "7 days",
  "last-15": "15 days",
};

/** @deprecated Prefer getDateRangePresets() — dates are relative to today. */
export const DEFAULT_DATE_RANGE_PRESETS = getDateRangePresets();

function resolvePresetById(
  presets: DateRange[],
  id: string
): DateRange | undefined {
  return presets.find((p) => p.id === id) ?? getDateRangePresets().find((p) => p.id === id);
}

function matchPreset(
  presets: DateRange[],
  from: Date,
  to: Date
): DateRange | null {
  return (
    presets.find(
      (p) => sameUtcDay(p.from, from) && sameUtcDay(p.to, to)
    ) ?? null
  );
}

function toDraftRange(range: DateRange): DayPickerRange {
  return { from: toPickerDay(range.from), to: toPickerDay(range.to) };
}

type DateRangeDropdownProps = {
  presets?: DateRange[];
  defaultPresetId?: string;
  /** Controlled value — when set, changes go through onChange. */
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  /** Filter bar chip, inline preset bar, or overview outline control */
  variant?: "filter" | "presets" | "outline";
  className?: string;
};

export default function DateRangeDropdown({
  presets: presetsProp,
  defaultPresetId = "campaign",
  value,
  onChange,
  variant = "filter",
  className,
}: DateRangeDropdownProps) {
  const presets = presetsProp ?? getDateRangePresets();
  const initial = useMemo(
    () => presets.find((p) => p.id === defaultPresetId) ?? presets[0],
    [presets, defaultPresetId]
  );
  const filterBarPresets = useMemo(() => {
    const byId = new Map(presets.map((p) => [p.id, p]));
    return FILTER_BAR_PRESET_IDS.flatMap((id) => {
      const preset = byId.get(id);
      return preset ? [preset] : [];
    });
  }, [presets]);
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState<DateRange>(initial);
  const selected = value ?? uncontrolled;

  const commit = (range: DateRange) => {
    onChange?.(range);
    if (value === undefined) setUncontrolled(range);
  };

  const [draft, setDraft] = useState<DayPickerRange>(() =>
    toDraftRange(selected)
  );
  const [month, setMonth] = useState(() => toPickerDay(selected.to));

  useEffect(() => {
    if (!open) return;
    setDraft(toDraftRange(selected));
    setMonth(toPickerDay(selected.to));
  }, [open, selected]);

  const chipLabel = formatRangeChip(selected.from, selected.to);
  const barLabel = formatRangeBar(selected.from, selected.to);
  const isFilterBarPreset = FILTER_BAR_PRESET_IDS.includes(
    selected.id as (typeof FILTER_BAR_PRESET_IDS)[number]
  );
  const draftFrom = draft.from ? fromPickerDay(draft.from) : null;
  const draftTo = draft.to
    ? fromPickerDay(draft.to)
    : draft.from
      ? fromPickerDay(draft.from)
      : null;
  const canApply = draftFrom !== null && draftTo !== null;

  const applyDraft = () => {
    if (!draftFrom || !draftTo) return;
    const from = draftFrom <= draftTo ? draftFrom : draftTo;
    const to = draftFrom <= draftTo ? draftTo : draftFrom;
    const matched = matchPreset(presets, from, to);
    commit(
      matched ?? {
        id: CUSTOM_RANGE_ID,
        label: "Custom range",
        from,
        to,
      }
    );
    setOpen(false);
  };

  const selectPreset = (preset: DateRange) => {
    commit(resolvePresetById(presets, preset.id) ?? preset);
    setOpen(false);
  };

  const onCalendarSelect = (range: DayPickerRange | undefined) => {
    if (!range?.from) {
      setDraft({ from: undefined, to: undefined });
      return;
    }
    setDraft(range);
  };

  // Calendar-only picker — quick ranges live on the filter bar outside.
  const pickerPanel = (
    <PopoverContent
      align="start"
      className="w-auto max-w-[calc(100vw-2rem)] p-0"
    >
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Selected range</p>
            <p className="truncate text-sm font-medium text-foreground">
              {draftFrom && draftTo
                ? `${formatDayLabel(draftFrom)} – ${formatDayLabel(draftTo)}`
                : draftFrom
                  ? `${formatDayLabel(draftFrom)} – …`
                  : "Pick a start date"}
            </p>
          </div>
        </div>

        <Calendar
          mode="range"
          numberOfMonths={2}
          month={month}
          onMonthChange={setMonth}
          selected={draft}
          onSelect={onCalendarSelect}
          defaultMonth={toPickerDay(selected.to)}
          className="p-3"
        />

        <Separator />

        <div className="flex items-center justify-end gap-2 px-3 py-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canApply}
            onClick={applyDraft}
            className="rounded-md px-5 shadow"
          >
            Apply
          </Button>
        </div>
      </div>
    </PopoverContent>
  );

  const presetSegmentClass = (active: boolean) =>
    cn(
      "inline-flex h-full shrink-0 items-center px-3 text-sm text-foreground/80 transition-colors hover:bg-muted/60",
      active && "bg-muted/60 font-medium text-foreground"
    );

  if (variant === "presets") {
    return (
      <div
        className={cn(
          "inline-flex h-8 items-stretch overflow-hidden rounded-md border border-border bg-background text-sm",
          className
        )}
      >
        {filterBarPresets.map((preset, index) => {
          const label =
            FILTER_BAR_PRESET_LABELS[
              preset.id as (typeof FILTER_BAR_PRESET_IDS)[number]
            ] ?? preset.label;
          return (
            <div key={preset.id} className="flex h-full items-stretch">
              {index > 0 && (
                <div className="w-px shrink-0 self-stretch bg-border" aria-hidden />
              )}
              <button
                type="button"
                className={presetSegmentClass(selected.id === preset.id)}
                onClick={() => selectPreset(preset)}
              >
                {label}
              </button>
            </div>
          );
        })}
        <div className="w-px shrink-0 self-stretch bg-border" aria-hidden />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              className={cn(
                "inline-flex h-full items-center gap-2 px-3 text-foreground/80 transition-colors hover:bg-muted/60",
                (!isFilterBarPreset || open) &&
                  "bg-muted/60 font-medium text-foreground"
              )}
            >
              <span className="whitespace-nowrap">{barLabel}</span>
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          </PopoverTrigger>
          {pickerPanel}
        </Popover>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "gap-2 border-border bg-background font-normal text-foreground/80 shadow-none hover:bg-muted/60",
            variant === "filter" && "h-7 rounded-md px-2.5 text-sm gap-1.5",
            variant === "outline" &&
              "h-[34px] rounded-md px-3 text-sm shadow-none",
            className
          )}
        >
          <CalendarDays
            className={cn(
              "shrink-0 text-foreground/70",
              variant === "filter" ? "h-3.5 w-3.5" : "h-[15px] w-[15px]"
            )}
            aria-hidden
          />
          <span className="whitespace-nowrap">{chipLabel}</span>
          <ChevronDown
            className={cn(
              "shrink-0 opacity-50",
              variant === "filter"
                ? "h-3.5 w-3.5"
                : "h-[13px] w-[13px] opacity-60"
            )}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      {pickerPanel}
    </Popover>
  );
}
