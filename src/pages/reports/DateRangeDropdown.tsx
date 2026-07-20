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

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

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

function formatDayLabel(d: Date) {
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${day}, ${d.getUTCFullYear()}`;
}

/** Dummy presets — client-side only, no calendar API. */
export const DEFAULT_DATE_RANGE_PRESETS: DateRange[] = [
  {
    id: "campaign",
    label: "Campaign duration",
    from: utc(2026, 4, 9),
    to: utc(2026, 5, 1),
  },
  {
    id: "last-7",
    label: "Last 7 days",
    from: utc(2026, 4, 25),
    to: utc(2026, 5, 1),
  },
  {
    id: "last-14",
    label: "Last 14 days",
    from: utc(2026, 4, 18),
    to: utc(2026, 5, 1),
  },
  {
    id: "last-30",
    label: "Last 30 days",
    from: utc(2026, 4, 2),
    to: utc(2026, 5, 1),
  },
  {
    id: "today",
    label: "Today",
    from: utc(2026, 5, 1),
    to: utc(2026, 5, 1),
  },
  {
    id: "yesterday",
    label: "Yesterday",
    from: utc(2026, 4, 30),
    to: utc(2026, 4, 30),
  },
];

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
  /** Filter bar chip (compact) vs overview outline control */
  variant?: "filter" | "outline";
  className?: string;
};

export default function DateRangeDropdown({
  presets = DEFAULT_DATE_RANGE_PRESETS,
  defaultPresetId = "campaign",
  value,
  onChange,
  variant = "filter",
  className,
}: DateRangeDropdownProps) {
  const initial = useMemo(
    () => presets.find((p) => p.id === defaultPresetId) ?? presets[0],
    [presets, defaultPresetId]
  );
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
  const [draftPresetId, setDraftPresetId] = useState(selected.id);
  const [month, setMonth] = useState(() => toPickerDay(selected.to));

  useEffect(() => {
    if (!open) return;
    setDraft(toDraftRange(selected));
    setDraftPresetId(selected.id);
    setMonth(toPickerDay(selected.to));
  }, [open, selected]);

  const chipLabel = formatRangeChip(selected.from, selected.to);
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
    setDraft(toDraftRange(preset));
    setDraftPresetId(preset.id);
    setMonth(toPickerDay(preset.to));
  };

  const onCalendarSelect = (range: DayPickerRange | undefined) => {
    if (!range?.from) {
      setDraft({ from: undefined, to: undefined });
      setDraftPresetId(CUSTOM_RANGE_ID);
      return;
    }
    setDraft(range);
    if (range.from && range.to) {
      const from = fromPickerDay(range.from);
      const to = fromPickerDay(range.to);
      const matched = matchPreset(presets, from, to);
      setDraftPresetId(matched?.id ?? CUSTOM_RANGE_ID);
    } else {
      setDraftPresetId(CUSTOM_RANGE_ID);
    }
  };

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
      <PopoverContent
        align="start"
        className="w-auto max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Presets — GA / Mixpanel style sidebar */}
          <div className="flex w-full shrink-0 flex-col border-b border-border sm:w-[168px] sm:border-b-0 sm:border-r">
            <p className="px-3 pb-1 pt-3 text-xs font-medium text-muted-foreground">
              Quick ranges
            </p>
            <ul
              role="listbox"
              aria-label="Date range presets"
              className="flex flex-row gap-0.5 overflow-x-auto p-1.5 sm:flex-col sm:overflow-visible"
            >
              {presets.map((preset) => {
                const active = draftPresetId === preset.id;
                return (
                  <li key={preset.id} className="shrink-0 sm:shrink">
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "w-full rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                        active && "bg-accent font-medium text-foreground"
                      )}
                      onClick={() => selectPreset(preset)}
                    >
                      {preset.label}
                    </button>
                  </li>
                );
              })}
              <li className="shrink-0 sm:shrink">
                <button
                  type="button"
                  role="option"
                  aria-selected={draftPresetId === CUSTOM_RANGE_ID}
                  className={cn(
                    "w-full rounded-sm px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                    draftPresetId === CUSTOM_RANGE_ID &&
                      "bg-accent font-medium text-foreground"
                  )}
                  onClick={() => setDraftPresetId(CUSTOM_RANGE_ID)}
                >
                  Custom
                </button>
              </li>
            </ul>
          </div>

          {/* Dual-month calendar */}
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
