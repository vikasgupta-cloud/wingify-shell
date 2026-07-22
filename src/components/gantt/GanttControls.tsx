import {
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { useTableStore, type GanttZoom } from "../../store/table";
import { cn } from "../../lib/utils";

// Zoom toggle + Today, lifted out of the Gantt footer to sit beside the layout
// switcher in the page toolbar. Zoom is global store state; "Today" bumps a store
// signal the mounted GanttChart watches to re-centre its scroll (see pingGanttToday).
// Icon-only to stay compact — labels live in the tooltip / aria-label.
const ZOOMS: { value: GanttZoom; label: string; icon: LucideIcon }[] = [
  { value: "day", label: "Day", icon: CalendarClock },
  { value: "week", label: "Week", icon: CalendarRange },
  { value: "month", label: "Month", icon: CalendarDays },
];

export default function GanttControls() {
  const { ganttZoom, setGanttZoom, pingGanttToday } = useTableStore();
  const itemClass =
    "flex h-auto w-auto items-center justify-center rounded-md p-1.5 transition-all duration-150 [&_svg]:size-4";
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md bg-muted p-0.5">
      {ZOOMS.map(({ value, label, icon: Icon }) => {
        const active = ganttZoom === value;
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => setGanttZoom(value)}
            className={cn(
              itemClass,
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon />
          </button>
        );
      })}
      {/* Today is an action, not a zoom state — same group, but no pressed state. */}
      <div className="mx-0.5 h-4 w-px bg-border" aria-hidden />
      <button
        type="button"
        title="Jump to today"
        aria-label="Jump to today"
        onClick={pingGanttToday}
        className={cn(itemClass, "text-muted-foreground hover:text-foreground")}
      >
        <CalendarCheck />
      </button>
    </div>
  );
}
