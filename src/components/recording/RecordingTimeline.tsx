// Scrub bar for the session player. The Slider carries the a11y and keyboard
// behaviour; page loads sit above the track and event ticks sit on it.

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
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 px-4 pb-2 pt-2">
      {/* Page loads sit above the bar — the session's navigation spine. */}
      <div className="relative h-5">
        {pages
          // Skip the first page marker — it sits on the origin and reads as noise.
          .filter((page) => page.startsAt > 0)
          .map((page) => (
          <Tooltip key={page.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Seek to ${page.url}`}
                onClick={() => onSeek(page.startsAt * durationMs)}
                className="absolute bottom-0 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border border-panel-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
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
      <div aria-hidden />

      {/* Track + clock share one row so the time lines up with the bar. */}
      <div className="relative flex h-4 items-center">
        {/* Track well behind markers. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-[hsl(var(--appearance-sliders-track,_var(--muted)))]"
          aria-hidden
        />

        {/* Event markers on the track, under the range + thumb. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] h-2.5 -translate-y-1/2">
          {events.map((event) => (
            <Tooltip key={event.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Seek to ${event.title}`}
                  onClick={() => onSeek(event.t * durationMs)}
                  className="pointer-events-auto absolute top-0 h-full w-2 -translate-x-1/2 px-[3px]"
                  style={{ left: `${event.t * 100}%` }}
                >
                  <span
                    className={cn(
                      "block h-full w-0.5 rounded-full transition-colors",
                      event.kind === "friction"
                        ? "bg-danger-fg"
                        : "bg-muted-foreground/60 hover:bg-foreground"
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

        <Slider
          min={0}
          max={durationMs}
          step={100}
          value={[Math.min(timeMs, durationMs)]}
          onValueChange={([value]) => onSeek(value ?? 0)}
          aria-label="Playback position"
          className="relative z-10 [&_[data-slot=slider-track]]:h-2.5 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:bg-background [&_[data-slot=slider-thumb]]:transition-transform [&_[data-slot=slider-thumb]]:hover:scale-125"
        />
      </div>

      <p className="flex h-4 shrink-0 items-center self-start text-[11px] tabular-nums text-muted-foreground">
        {formatClock(timeMs)} / {formatClock(durationMs)}
      </p>
    </div>
  );
}
