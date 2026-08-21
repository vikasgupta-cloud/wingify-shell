// Scrub bar for the session player. The Slider carries the a11y and keyboard
// behaviour; page loads are flagged above the track and events tick below it.

import { FileText, type LucideIcon } from "@/components/icons/protoLucide";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RecordedPage, RecordingEvent } from "@/data/sessionRecordings";

/** Same glyph the panel uses for a page-load divider. */
const PageIcon: LucideIcon = FileText;

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RecordingTimeline({
  timeMs,
  durationMs,
  events,
  pages,
  onSeek,
}: {
  timeMs: number;
  durationMs: number;
  events: RecordingEvent[];
  pages: RecordedPage[];
  onSeek: (ms: number) => void;
}) {
  return (
    <div className="flex items-end gap-4 px-4 pb-1.5 pt-1">
      <div className="min-w-0 flex-1">
        {/* Page loads sit above the bar — the session's navigation spine. */}
        <div className="relative h-5">
          {pages.map((page) => (
            <Tooltip key={page.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Seek to ${page.url}`}
                  onClick={() => onSeek(page.startsAt * durationMs)}
                  className="absolute bottom-0 flex size-5 -translate-x-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  style={{ left: `${page.startsAt * 100}%` }}
                >
                  <PageIcon className="size-3.5" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[20rem]">
                <p className="truncate">{page.url}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Slider
          min={0}
          max={durationMs}
          step={100}
          value={[Math.min(timeMs, durationMs)]}
          onValueChange={([value]) => onSeek(value ?? 0)}
          aria-label="Playback position"
          className="[&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:transition-transform [&_[data-slot=slider-thumb]]:hover:scale-125"
        />

        {/* Event ticks, hung off the bottom of the bar. */}
        <div className="relative h-2">
          {events.map((event) => (
            <Tooltip key={event.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Seek to ${event.title}`}
                  onClick={() => onSeek(event.t * durationMs)}
                  className="absolute top-0 h-2 w-2 -translate-x-1/2 px-[3px]"
                  style={{ left: `${event.t * 100}%` }}
                >
                  <span
                    className={cn(
                      "block h-2 w-0.5 rounded-full transition-colors",
                      event.kind === "friction"
                        ? "bg-danger-fg"
                        : "bg-muted-foreground/40 hover:bg-foreground"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[16rem]">
                <p className="font-medium">
                  {event.title}{" "}
                  <span className="font-normal opacity-70">({event.type})</span>
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <p className="shrink-0 pb-2 text-[11px] tabular-nums text-muted-foreground">
        {formatClock(timeMs)} / {formatClock(durationMs)}
      </p>
    </div>
  );
}
