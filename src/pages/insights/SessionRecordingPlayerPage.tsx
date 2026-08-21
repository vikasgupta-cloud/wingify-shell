// Full-tab session recording player — opens from Insights → Session Recordings.
// The recorded site replays in an iframe; a synthetic cursor track drives the
// pointer, scroll position and click flashes, and the right panel logs events.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AppWindow,
  Check,
  ChevronDown,
  ChevronsRight,
  Download,
  FileText,
  Globe,
  ImageIcon,
  Maximize2,
  Minimize2,
  MoreVertical,
  MousePointerClick,
  Pause,
  Monitor,
  Play,
  Save,
  Share2,
  UserRound,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EDITOR_PREVIEW_SRC } from "@/components/editor/EditorCanvas";
import RecordingSidePanel from "@/components/recording/RecordingSidePanel";
import RecordingTimeline from "@/components/recording/RecordingTimeline";
import SessionRecordingDesignController from "@/components/recording/SessionRecordingDesignController";
import { DEFAULT_MASCOT_ID, mascotAsset } from "@/config/mascots";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme";
import { useSessionRecordingDesignStore } from "@/store/sessionRecordingDesign";
import { SESSION_RECORDINGS } from "@/data/dashboard";
import {
  SESSION_ROWS,
  buildRecordedPages,
  buildRecordingTrack,
  buildSessionEvents,
  buildSessionLog,
  buildVisitor,
  countryFlagEmoji,
  parseDurationMs,
  sampleTrack,
  type SessionRow,
} from "@/data/sessionRecordings";

const SPEEDS = [0.25, 0.5, 1, 2, 4] as const;
type Speed = (typeof SPEEDS)[number];

/** A gap longer than this counts as a pause worth skipping. */
const PAUSE_MS = 4_000;
/** Trail sample spacing, as a fraction of the whole session. */
const TRAIL_STEP = 0.008;
const TRAIL_LENGTH = 10;

const FALLBACK: SessionRow = {
  id: "sess-1",
  city: "Sunnyvale",
  country: "United States",
  url: "https://vwo.com/campaign/get-started/",
  company: 1,
  duration: "00:00:54",
  events: 20,
  timestamp: "17:54 hrs, 20 Aug, 2026",
};

function resolveSession(id: string | null): SessionRow {
  const fromTable = SESSION_ROWS.find((row) => row.id === id);
  if (fromTable) return fromTable;
  const fromDash = SESSION_RECORDINGS.find((row) => row.id === id);
  if (fromDash) {
    const [city, country = ""] = fromDash.location.split(",").map((p) => p.trim());
    return {
      id: fromDash.id,
      city: city || fromDash.location,
      country: country || "United States",
      url: fromDash.url,
      company: 1,
      duration: fromDash.duration,
      events: 20,
      timestamp: FALLBACK.timestamp,
    };
  }
  return SESSION_ROWS[0] ?? FALLBACK;
}

/** Media skip icons — |◀ and ▶| — match the transport pill reference. */
function SkipBackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M5 4h2v16H5z" />
      <path d="M19 4 9 12l10 8z" />
    </svg>
  );
}

function SkipForwardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17 4h2v16h-2z" />
      <path d="M5 4v16l10-8z" />
    </svg>
  );
}

/** Playback toggle — four of these sit in the control bar. */
function PlayerToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-1.5 text-[11px] leading-none text-muted-foreground transition-colors hover:text-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
      />
      {label}
    </label>
  );
}

export default function SessionRecordingPlayerPage() {
  const [params, setParams] = useSearchParams();
  const colorMode = useThemeStore((s) => s.colorMode);
  const panelSeparator = useSessionRecordingDesignStore((s) => s.panelSeparator);

  const session = useMemo(() => resolveSession(params.get("id")), [params]);
  const durationMs = parseDurationMs(session.duration);
  const track = useMemo(
    () => buildRecordingTrack(session.id, durationMs),
    [session.id, durationMs]
  );
  const events = useMemo(() => buildSessionEvents(session.id), [session.id]);
  const pages = useMemo(() => buildRecordedPages(session), [session]);
  const visitor = useMemo(() => buildVisitor(session), [session]);
  const log = useMemo(() => buildSessionLog(pages, events), [pages, events]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastTick = useRef<number | null>(null);
  const lastFlashAt = useRef(-1);

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [clickFlash, setClickFlash] = useState(false);
  const [showClicks, setShowClicks] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [skipPauses, setSkipPauses] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [expanded, setExpanded] = useState(false);
  /** The stage can take the full window by folding the detail panel away. */
  const [panelOpen, setPanelOpen] = useState(true);

  const progress = durationMs > 0 ? Math.min(1, timeMs / durationMs) : 0;
  const pose = sampleTrack(track, progress);

  const sessionIndex = SESSION_ROWS.findIndex((row) => row.id === session.id);
  const goToSession = useCallback(
    (delta: number) => {
      if (sessionIndex < 0) return;
      const next = SESSION_ROWS[sessionIndex + delta];
      if (!next) return;
      setTimeMs(0);
      setParams({ id: next.id });
    },
    [sessionIndex, setParams]
  );

  const seek = useCallback(
    (ms: number) => setTimeMs(Math.min(durationMs, Math.max(0, ms))),
    [durationMs]
  );

  useEffect(() => {
    document.title = `Session · ${session.city}, ${session.country}`;
  }, [session.city, session.country]);

  // Playback clock. Skip Pauses fast-forwards any stretch with no event in it.
  useEffect(() => {
    if (!playing) {
      lastTick.current = null;
      return;
    }
    let raf = 0;
    const step = (now: number) => {
      if (lastTick.current == null) lastTick.current = now;
      const delta = (now - lastTick.current) * speed;
      lastTick.current = now;
      setTimeMs((prev) => {
        let next = prev + delta;
        if (skipPauses) {
          const upcoming = events.find((e) => e.t * durationMs > next);
          const gap = upcoming ? upcoming.t * durationMs - next : 0;
          if (gap > PAUSE_MS) next = upcoming!.t * durationMs - 800;
        }
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, durationMs, skipPauses, events]);

  // Drive the recorded page's scroll position from the cursor track.
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      const doc = win.document.documentElement;
      const max = Math.max(0, doc.scrollHeight - win.innerHeight);
      win.scrollTo({ top: pose.scroll * max, behavior: "auto" });
    } catch {
      /* preview not ready */
    }
  }, [pose.scroll]);

  // Ripple whenever playback crosses a keyframe marked as a click.
  useEffect(() => {
    const hit = track.find((k) => k.click && Math.abs(k.t - progress) < 0.018);
    if (!hit || lastFlashAt.current === hit.t) return;
    lastFlashAt.current = hit.t;
    setClickFlash(true);
    const t = window.setTimeout(() => setClickFlash(false), 420);
    return () => window.clearTimeout(t);
  }, [progress, track]);

  // Autoplay Next Recording — roll into the following row when this one ends.
  useEffect(() => {
    if (!autoplay || playing || timeMs < durationMs) return;
    goToSession(1);
  }, [autoplay, playing, timeMs, durationMs, goToSession]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        // Replay from the top when the session has already run out.
        setTimeMs((t) => (t >= durationMs ? 0 : t));
        setPlaying((v) => !v);
      }
      if (e.code === "ArrowLeft") seek(timeMs - 5_000);
      if (e.code === "ArrowRight") seek(timeMs + 5_000);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [seek, timeMs, durationMs]);

  const trail = useMemo(() => {
    if (!showTrail) return [];
    return Array.from({ length: TRAIL_LENGTH }, (_, i) => {
      const t = progress - (i + 1) * TRAIL_STEP;
      return t <= 0 ? null : { ...sampleTrack(track, t), key: i };
    }).filter(Boolean) as (ReturnType<typeof sampleTrack> & { key: number })[];
  }, [progress, showTrail, track]);

  const activeEvent = useMemo(() => {
    const passed = events.filter((e) => e.t <= progress);
    return passed[passed.length - 1] ?? null;
  }, [events, progress]);

  const pageIndex = Math.max(
    0,
    pages.filter((page) => page.startsAt <= progress).length - 1
  );
  const currentPage = pages[pageIndex] ?? pages[0];

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-canvas text-foreground">
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 p-3 pb-0",
            panelSeparator ? "gap-3" : "gap-0"
          )}
        >
          <div
            className={cn(
              "group/stage relative min-h-0 min-w-0 flex-1 overflow-hidden border border-panel-border bg-background shadow-sm",
              panelSeparator || !panelOpen
                ? "rounded-lg"
                : "rounded-l-lg rounded-r-none border-r-0"
            )}
          >
            <div className="relative h-full w-full overflow-hidden">
              <iframe
                ref={iframeRef}
                title="Recorded session"
                src={EDITOR_PREVIEW_SRC}
                className="pointer-events-none absolute inset-0 h-full w-full border-0"
              />

              {/* Cursor, trail and click ripple — the replay layer. */}
              <div className="pointer-events-none absolute inset-0">
                {trail.map((point) => (
                  <span
                    key={point.key}
                    className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                    style={{
                      left: `${point.x * 100}%`,
                      top: `${point.y * 100}%`,
                      opacity: 0.35 - point.key * 0.03,
                    }}
                    aria-hidden
                  />
                ))}
                {showClicks && clickFlash ? (
                  <>
                    <span
                      className="absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground/50"
                      style={{ left: `${pose.x * 100}%`, top: `${pose.y * 100}%` }}
                      aria-hidden
                    />
                    <span
                      className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/15"
                      style={{ left: `${pose.x * 100}%`, top: `${pose.y * 100}%` }}
                      aria-hidden
                    />
                  </>
                ) : null}
                <span
                  className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-2 ring-background transition-[left,top] duration-75 ease-linear"
                  style={{ left: `${pose.x * 100}%`, top: `${pose.y * 100}%` }}
                  aria-hidden
                />
              </div>

              {/* What the cursor is doing right now, plus the click legend. */}
              <div className="pointer-events-none absolute bottom-3 left-3 flex h-7 items-center gap-1.5 rounded-md border border-panel-border bg-panel/90 px-3 text-[11px] font-medium text-panel-foreground backdrop-blur">
                <MousePointerClick className="size-3.5 text-muted-foreground" aria-hidden />
                {pose.label}
              </div>
              {showClicks ? (
                <div className="pointer-events-none absolute bottom-3 right-3 space-y-1.5 rounded-md border border-panel-border bg-panel/90 px-3 py-2 text-[11px] text-muted-foreground backdrop-blur">
                  <p className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full border border-foreground"
                      aria-hidden
                    />
                    Left click
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-foreground" aria-hidden />
                    Right click
                  </p>
                </div>
              ) : null}

              {/* Fold the detail panel away to hand the stage the full window. */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    aria-label={panelOpen ? "Hide session details" : "Show session details"}
                    onClick={() => setPanelOpen((v) => !v)}
                    className="absolute right-0 top-3 size-8 rounded-l-md rounded-r-none border border-r-0 border-panel-border"
                  >
                    <ChevronsRight
                      className={cn("size-4 transition-transform", !panelOpen && "rotate-180")}
                      aria-hidden
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {panelOpen ? "Hide session details" : "Show session details"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {panelOpen ? (
            <RecordingSidePanel
              session={session}
              visitor={visitor}
              log={log}
              durationMs={durationMs}
              activeEventId={activeEvent?.id ?? null}
              playing={playing}
              autoplay={autoplay}
              onAutoplayChange={setAutoplay}
              flushLeft={!panelSeparator}
              onSeek={(ms) => {
                setPlaying(false);
                seek(ms);
              }}
              onTogglePlay={() => {
                if (timeMs >= durationMs) setTimeMs(0);
                setPlaying((v) => !v);
              }}
            />
          ) : null}
        </div>

        <div
          className={cn(
            "mx-3 mb-3 shrink-0 overflow-hidden rounded-lg border border-panel-border bg-panel text-panel-foreground shadow-sm",
            panelSeparator ? "mt-3" : "mt-0"
          )}
        >
            <RecordingTimeline
              timeMs={timeMs}
              durationMs={durationMs}
              events={events}
              pages={pages}
              onSeek={(ms) => {
                setPlaying(false);
                seek(ms);
              }}
            />

            <div className="flex h-14 items-center border-t border-panel-border px-3">
              <div className="flex h-full shrink-0 items-center px-2">
                <img
                  src={mascotAsset(DEFAULT_MASCOT_ID, colorMode)}
                  alt="Wingify"
                  className="h-5 w-auto shrink-0"
                />
              </div>

              <div
                className="mx-1 hidden w-px shrink-0 self-stretch bg-panel-border sm:block"
                aria-hidden
              />

              <div className="flex h-full shrink-0 items-center gap-1.5 px-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 rounded-full bg-muted text-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                      aria-label="Previous page"
                      disabled={pageIndex <= 0}
                      onClick={() => {
                        const prev = pages[pageIndex - 1];
                        if (!prev) return;
                        setPlaying(false);
                        seek(prev.startsAt * durationMs);
                      }}
                    >
                      <SkipBackIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Previous page</TooltipContent>
                </Tooltip>

                <Button
                  type="button"
                  variant="inverted"
                  size="icon"
                  className="size-9 shrink-0 rounded-full border-foreground bg-foreground text-background shadow-sm transition-[transform,background-color,box-shadow] hover:scale-105 hover:bg-foreground hover:shadow-md active:scale-95"
                  aria-label={playing ? "Pause" : "Play"}
                  onClick={() => {
                    if (timeMs >= durationMs) setTimeMs(0);
                    setPlaying((v) => !v);
                  }}
                >
                  {playing ? (
                    <Pause className="size-4 fill-current" aria-hidden />
                  ) : (
                    <Play className="size-4 fill-current" aria-hidden />
                  )}
                </Button>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 rounded-full bg-muted text-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                      aria-label="Next page"
                      disabled={pageIndex >= pages.length - 1}
                      onClick={() => {
                        const next = pages[pageIndex + 1];
                        if (!next) return;
                        setPlaying(false);
                        seek(next.startsAt * durationMs);
                      }}
                    >
                      <SkipForwardIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Next page</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex h-full shrink-0 items-center px-1">
                <Popover open={speedOpen} onOpenChange={setSpeedOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-11 shrink-0 rounded-full bg-muted px-0 text-xs tabular-nums hover:bg-foreground/10"
                    >
                      {speed}×
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="center"
                    sideOffset={8}
                    className="w-14 overflow-hidden rounded-lg p-1"
                  >
                    {[...SPEEDS].reverse().map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setSpeed(value);
                          setSpeedOpen(false);
                        }}
                        className={cn(
                          "flex w-full justify-center rounded-md px-2 py-1.5 text-sm tabular-nums text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                          value === speed && "bg-accent font-medium text-accent-foreground"
                        )}
                      >
                        {value}×
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              <div
                className="mx-1 hidden w-px shrink-0 self-stretch bg-panel-border md:block"
                aria-hidden
              />

              <div className="flex h-full min-w-0 flex-1 items-center px-1">
                <Popover open={pagesOpen} onOpenChange={setPagesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full min-w-0 max-w-none justify-start gap-2 px-2 font-normal"
                    >
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="shrink-0">
                        Page {pageIndex + 1} of {pages.length}:
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">
                        {currentPage?.url}
                      </span>
                      <ChevronDown className="ml-auto size-3.5 shrink-0 opacity-60" aria-hidden />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    align="start"
                    sideOffset={8}
                    className="w-[--radix-popover-trigger-width] overflow-hidden rounded-lg p-0"
                  >
                    <Command>
                      <CommandInput placeholder="Search pages..." />
                      <CommandList>
                        <CommandEmpty>No page found.</CommandEmpty>
                        <CommandGroup>
                          {pages.map((page, i) => (
                            <CommandItem
                              key={page.id}
                              value={`Page ${i + 1} ${page.url}`}
                              onSelect={() => {
                                seek(page.startsAt * durationMs);
                                setPagesOpen(false);
                              }}
                              className="flex-col items-start gap-0.5 rounded-md px-3 py-2 data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
                            >
                              <span className="flex w-full items-center gap-2">
                                <span className="text-xs font-medium text-foreground">
                                  Page {i + 1}
                                </span>
                                {i === pageIndex ? (
                                  <Check
                                    className="ml-auto size-3.5 text-foreground"
                                    aria-label="Currently playing"
                                  />
                                ) : null}
                              </span>
                              <span className="w-full truncate text-[11px] text-muted-foreground">
                                {page.url}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div
                className="mx-1 hidden w-px shrink-0 self-stretch bg-panel-border lg:block"
                aria-hidden
              />

              <div className="hidden h-full shrink-0 items-center px-1 lg:flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      aria-pressed={panelOpen}
                      aria-label={panelOpen ? "Hide session details" : "Show session details"}
                      onClick={() => setPanelOpen((v) => !v)}
                      className="h-8 gap-1.5 rounded-[8px] px-3 text-[11px] font-medium"
                    >
                      <UserRound className="size-3.5 text-muted-foreground" aria-hidden />
                      Session {sessionIndex < 0 ? 1 : sessionIndex + 1} of{" "}
                      {SESSION_ROWS.length}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {panelOpen ? "Hide session details" : "Show session details"}
                  </TooltipContent>
                </Tooltip>
              </div>

              <div
                className="mx-1 hidden w-px shrink-0 self-stretch bg-panel-border lg:block"
                aria-hidden
              />

              <div className="hidden h-full shrink-0 items-center px-2 lg:flex">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <PlayerToggle
                    label="Show clicks"
                    checked={showClicks}
                    onChange={setShowClicks}
                  />
                  <PlayerToggle
                    label="Skip Pauses"
                    checked={skipPauses}
                    onChange={setSkipPauses}
                  />
                  <PlayerToggle
                    label="Show Mouse Trail"
                    checked={showTrail}
                    onChange={setShowTrail}
                  />
                  <PlayerToggle
                    label="Autoplay Next Recording"
                    checked={autoplay}
                    onChange={setAutoplay}
                  />
                </div>
              </div>

              <div
                className="mx-1 hidden w-px shrink-0 self-stretch bg-panel-border lg:block"
                aria-hidden
              />

              <div className="ml-auto flex h-full shrink-0 items-center gap-2 px-1 lg:ml-0">
                <div className="hidden items-center gap-1 rounded-[8px] bg-muted p-1 lg:flex">
                  {[
                    { icon: Monitor, label: visitor.device },
                    { icon: Globe, label: visitor.browser },
                    { icon: AppWindow, label: visitor.os },
                  ].map((item) => (
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>
                        <span
                          className="flex size-8 cursor-default items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                          tabIndex={0}
                        >
                          <item.icon className="size-4" aria-label={item.label} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{item.label}</TooltipContent>
                    </Tooltip>
                  ))}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="flex size-8 cursor-default items-center justify-center overflow-hidden rounded-[8px] text-base leading-none transition-colors hover:bg-foreground/10"
                        tabIndex={0}
                      >
                        {countryFlagEmoji(visitor.countryCode)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">{visitor.country}</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-1 rounded-[8px] bg-muted p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-[8px] text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                        aria-label={expanded ? "Exit full screen" : "Full screen"}
                        onClick={() => {
                          setExpanded((v) => !v);
                          if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen?.().catch(() => {});
                          } else {
                            document.exitFullscreen?.().catch(() => {});
                          }
                        }}
                      >
                        {expanded ? (
                          <Minimize2 className="size-4" aria-hidden />
                        ) : (
                          <Maximize2 className="size-4" aria-hidden />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {expanded ? "Exit full screen" : "Full screen"}
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-[8px] text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                        aria-label="More options"
                      >
                        <MoreVertical className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-52">
                      <DropdownMenuItem className="gap-2">
                        <Share2 className="size-4" aria-hidden />
                        Share recording
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Download className="size-4" aria-hidden />
                        Download recording
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Save className="size-4" aria-hidden />
                        Save to a view
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <ImageIcon className="size-4" aria-hidden />
                        Capture screenshot
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
      </div>
      <SessionRecordingDesignController />
    </TooltipProvider>
  );
}
