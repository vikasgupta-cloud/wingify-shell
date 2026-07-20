import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function formatRangeChip(from: Date, to: Date) {
  const part = (d: Date) => {
    const y = String(d.getUTCFullYear()).slice(-2);
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${MONTHS[d.getUTCMonth()]} ${day}, ${y}'`;
  };
  return `${part(from)} - ${part(to)}`;
}

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

function toInputValue(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return utc(Number(match[1]), Number(match[2]), Number(match[3]));
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
];

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
  const setSelected = (range: DateRange) => {
    onChange?.(range);
    if (value === undefined) setUncontrolled(range);
  };

  const [draftFrom, setDraftFrom] = useState(() => toInputValue(selected.from));
  const [draftTo, setDraftTo] = useState(() => toInputValue(selected.to));

  useEffect(() => {
    if (open) {
      setDraftFrom(toInputValue(selected.from));
      setDraftTo(toInputValue(selected.to));
    }
  }, [open, selected.from, selected.to]);

  const chipLabel = formatRangeChip(selected.from, selected.to);
  const customActive = selected.id === CUSTOM_RANGE_ID;
  const canApplyCustom =
    fromInputValue(draftFrom) !== null && fromInputValue(draftTo) !== null;

  const applyCustom = () => {
    let from = fromInputValue(draftFrom);
    let to = fromInputValue(draftTo);
    if (!from || !to) return;
    if (from > to) {
      const swap = from;
      from = to;
      to = swap;
    }
    setSelected({
      id: CUSTOM_RANGE_ID,
      label: "Custom range",
      from,
      to,
    });
    setOpen(false);
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
              "h-[34px] rounded-lg px-3 text-sm shadow-sm",
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
              variant === "filter" ? "h-3.5 w-3.5" : "h-[13px] w-[13px] opacity-60"
            )}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <ul role="listbox" aria-label="Date range presets" className="flex flex-col gap-0.5 p-1">
          {presets.map((preset) => {
            const active = preset.id === selected.id;
            return (
              <li key={preset.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    "flex w-full flex-col rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                    active && "bg-accent font-medium text-foreground"
                  )}
                  onClick={() => {
                    setSelected(preset);
                    setOpen(false);
                  }}
                >
                  <span>{preset.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRangeChip(preset.from, preset.to)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <Separator />

        <div
          className={cn("space-y-3 p-3", customActive && "bg-accent/40")}
        >
          <p className="text-sm font-medium text-foreground">Custom range</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date-range-from" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="date-range-from"
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date-range-to" className="text-xs text-muted-foreground">
                To
              </Label>
              <Input
                id="date-range-to"
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={!canApplyCustom}
            onClick={applyCustom}
          >
            Apply custom range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
