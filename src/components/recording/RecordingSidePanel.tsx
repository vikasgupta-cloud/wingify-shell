// Right-hand panel of the session player: visitor identity, the event log for
// the session being replayed, the visitor's other sessions, and observations.

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  AppWindow,
  Braces,
  Eye,
  FileText,
  Funnel,
  FlaskConical,
  Globe,
  Info,
  ListFilter,
  Monitor,
  MoreVertical,
  MousePointerClick,
  Play,
  Share2,
  Target,
  UserRound,
  type LucideIcon,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  countryFlagEmoji,
  type RecordedPage,
  type RecordingEvent,
  type RecordingEventKind,
  type SessionLogEntry,
  type SessionRow,
  type SessionVisitor,
} from "@/data/sessionRecordings";

/** One glyph per event kind — the log reads by shape, not by colour. */
const KIND_ICONS: Record<RecordingEventKind, LucideIcon> = {
  experience: FlaskConical,
  metric: Target,
  funnel: Funnel,
  custom: Braces,
  engagement: Activity,
  friction: AlertTriangle,
  click: MousePointerClick,
  tab: AppWindow,
};

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Chat bubble with sparkle — matches the Summarize outline CTA. */
function SummarizeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
      <path d="m11.817 10.821-2.841.503 2.01 2.07-.43 2.876 2.444-1.429 2.441 1.43-.43-2.877L16.99 11.32l-2.84-.504L12.74 8.5z" />
    </svg>
  );
}

/** Icon-only affordance with a tooltip — used across the panel chrome. */
function PanelIcon({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={onClick}
          className="size-7 rounded-md text-muted-foreground hover:text-foreground"
        >
          <Icon className="size-4" aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

function StatChip({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      {value}
    </span>
  );
}

function EventRow({
  index,
  event,
  atMs,
  active,
  onSeek,
}: {
  index: number;
  event: RecordingEvent;
  atMs: number;
  active: boolean;
  onSeek: () => void;
}) {
  const Icon = KIND_ICONS[event.kind];
  const friction = event.kind === "friction";
  return (
    <li data-active={active ? "" : undefined}>
      <button
        type="button"
        onClick={onSeek}
        className={cn(
          "group relative grid w-full grid-cols-[1.25rem_1.5rem_1fr_auto] items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted",
          active && "bg-muted"
        )}
      >
        {active ? (
          <span
            className="absolute inset-y-0 left-0 w-0.5 bg-foreground"
            aria-hidden
          />
        ) : null}
        <span
          className={cn(
            "pt-0.5 text-[11px] tabular-nums text-muted-foreground",
            active && "text-foreground"
          )}
        >
          {index}
        </span>
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full border border-panel-border bg-background",
            active && "border-foreground",
            friction && "border-danger-fg bg-danger-bg"
          )}
          aria-hidden
        >
          <Icon
            className={cn(
              "size-3.5",
              friction ? "text-danger-fg" : "text-muted-foreground"
            )}
          />
        </span>
        <span className="min-w-0 self-center">
          <span className="flex min-w-0 items-center gap-1 text-[13px] leading-5">
            <span className="truncate font-medium text-foreground">
              {event.title}
            </span>
            <span className="shrink-0 text-muted-foreground">
              ({event.type})
            </span>
            {event.hint ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="shrink-0" tabIndex={0}>
                    <Info className="size-3 text-muted-foreground" aria-label={event.hint} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">{event.hint}</TooltipContent>
              </Tooltip>
            ) : null}
          </span>
          {event.detail ? (
            <span className="mt-0.5 block truncate text-[11px] leading-4 text-muted-foreground">
              {event.detail}
            </span>
          ) : null}
        </span>
        <span className="self-center text-[11px] tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {formatClock(atMs)}
        </span>
      </button>
    </li>
  );
}

/** Navigation marker — every page load splits the log and restarts numbering. */
function PageDivider({
  page,
  onSeek,
}: {
  page: RecordedPage;
  onSeek: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSeek}
        className="grid w-full grid-cols-[1.25rem_1.5rem_1fr] items-start gap-2.5 border-y border-panel-border bg-muted px-3 py-2 text-left transition-colors hover:bg-secondary"
      >
        <span aria-hidden />
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md border border-panel-border bg-background"
          aria-hidden
        >
          <FileText className="size-3.5 text-muted-foreground" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-medium leading-5 text-foreground">
            Page Load ({page.loadSeconds}s)
          </span>
          <span className="mt-0.5 block truncate text-[11px] leading-4 text-muted-foreground">
            {page.url}
          </span>
        </span>
      </button>
    </li>
  );
}

export type RecordingSidePanelProps = {
  session: SessionRow;
  visitor: SessionVisitor;
  log: SessionLogEntry[];
  durationMs: number;
  activeEventId: string | null;
  playing: boolean;
  autoplay: boolean;
  onAutoplayChange: (next: boolean) => void;
  onSeek: (ms: number) => void;
  onTogglePlay: () => void;
};

export default function RecordingSidePanel({
  session,
  visitor,
  log,
  durationMs,
  activeEventId,
  playing,
  autoplay,
  onAutoplayChange,
  onSeek,
  onTogglePlay,
}: RecordingSidePanelProps) {
  const [showMore, setShowMore] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);

  // Follow playback — keep the event the player is on inside the viewport,
  // but only while it is running so a manual scroll isn't yanked back.
  useEffect(() => {
    if (!playing || !activeEventId) return;
    listRef.current
      ?.querySelector("li[data-active]")
      ?.scrollIntoView({ block: "nearest" });
  }, [activeEventId, playing]);

  return (
    <aside className="flex h-full min-h-0 w-[368px] shrink-0 flex-col border-l border-panel-border bg-panel text-panel-foreground 2xl:w-[420px]">
      <header className="flex items-center gap-1 px-4 pb-2 pt-3.5">
        <UserRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <p className="mr-1 truncate text-sm font-semibold tracking-tight text-foreground">
          {visitor.code}
        </p>
        <PanelIcon icon={Monitor} label={visitor.device} />
        <PanelIcon icon={AppWindow} label={visitor.browser} />
        <PanelIcon icon={Globe} label={visitor.os} />
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="ml-0.5 flex size-5 items-center justify-center overflow-hidden text-sm leading-none"
              tabIndex={0}
              aria-hidden
            >
              {countryFlagEmoji(visitor.countryCode)}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{visitor.country}</TooltipContent>
        </Tooltip>
        <div className="ml-auto flex items-center">
          <PanelIcon icon={Share2} label="Share session" />
          <PanelIcon icon={MoreVertical} label="More options" />
        </div>
      </header>

      <div className="flex items-center gap-4 px-4 pb-3">
        <StatChip
          icon={Play}
          value={`${visitor.recordings} Recording${visitor.recordings === 1 ? "" : "s"}`}
        />
        <StatChip
          icon={UserRound}
          value={`${visitor.sessions} Session${visitor.sessions === 1 ? "" : "s"}`}
        />
        <Button
          type="button"
          variant="link"
          className="ml-auto h-auto p-0 text-xs"
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? "Show Less" : "Show More"}
        </Button>
      </div>

      {showMore ? (
        <div className="mx-4 mb-3 rounded-lg border border-panel-border bg-muted px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Custom attributes
          </p>
          <dl className="mt-2 space-y-2">
            {visitor.attributes.map((attribute) => (
              <div key={attribute.label}>
                <dt className="text-[11px] text-muted-foreground">
                  {attribute.label}
                </dt>
                <dd className="text-[13px] font-medium tabular-nums text-foreground">
                  {attribute.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <Tabs
        defaultValue="events"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <TabsList
          variant="underline"
          className="shrink-0 gap-4 px-4 [&>*]:text-[13px]"
        >
          <TabsTrigger value="events">Events of current session</TabsTrigger>
          <TabsTrigger value="sessions">
            All sessions ({visitor.sessions})
          </TabsTrigger>
          <TabsTrigger value="observations" className="ml-auto" aria-label="Observations">
            <Eye className="size-4" aria-hidden />
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="events"
          className="mt-0 hidden min-h-0 flex-1 flex-col overflow-hidden data-[state=active]:flex"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-panel-border bg-muted px-3 py-2">
            <Button type="button" variant="ghost" size="sm" className="gap-1.5">
              <ListFilter className="size-3.5" aria-hidden />
              Filters
            </Button>
            <Button
              type="button"
              variant="aiOutline"
              size="sm"
              className="rounded-full"
            >
              <SummarizeIcon className="size-3.5" />
              Summarize
            </Button>
          </div>
          <div className="flex shrink-0 items-center justify-between border-b border-panel-border px-4 py-1.5">
            <p className="text-xs font-medium text-foreground">
              {session.timestamp}
            </p>
            <Button
              type="button"
              variant="inverted"
              size="sm"
              className="h-6 gap-1.5 px-2.5 text-[11px]"
              onClick={onTogglePlay}
            >
              <Play className="size-3 fill-current" aria-hidden />
              {playing ? "Playing" : "Play"}
            </Button>
          </div>
          <ol
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto pb-4"
          >
            {log.map((entry) =>
              entry.type === "page" ? (
                <PageDivider
                  key={entry.id}
                  page={entry.page}
                  onSeek={() => onSeek(entry.t * durationMs)}
                />
              ) : (
                <EventRow
                  key={entry.id}
                  index={entry.index}
                  event={entry.event}
                  atMs={entry.t * durationMs}
                  active={entry.id === activeEventId}
                  onSeek={() => onSeek(entry.t * durationMs)}
                />
              )
            )}
          </ol>
        </TabsContent>

        <TabsContent
          value="sessions"
          className="mt-0 hidden flex-1 overflow-y-auto p-4 data-[state=active]:block"
        >
          <label className="mb-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={autoplay}
              onCheckedChange={(v) => onAutoplayChange(v === true)}
            />
            Autoplay
          </label>
          <div className="rounded-lg border border-panel-border bg-background p-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Time/Date</p>
                <p className="mt-0.5 text-[13px] font-medium text-foreground">
                  {session.timestamp}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Page(s)</p>
                <p className="mt-0.5 text-[13px] font-medium tabular-nums text-foreground">
                  1
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Duration</p>
                <p className="mt-0.5 text-[13px] font-medium tabular-nums text-foreground">
                  {session.duration}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-panel-border pt-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                <Play className="size-3 fill-current" aria-hidden />
                {playing ? "Playing" : "Paused"}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {session.city}, {session.country}
              </span>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="observations"
          className="mt-0 hidden flex-1 flex-col items-center justify-center gap-3 p-8 text-center data-[state=active]:flex"
        >
          <span
            className="flex size-12 items-center justify-center rounded-full bg-muted"
            aria-hidden
          >
            <Eye className="size-5 text-muted-foreground" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">
              No observations yet!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              How about creating a new one?
            </p>
          </div>
          <Button type="button" variant="inverted" size="sm">
            Create an Observation
          </Button>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
