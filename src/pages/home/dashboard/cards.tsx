// Static dashboard card presentational components.
// Layout mirrors product screenshots 1:1; token-only styling for theming later.
// Nothing functional except Wandz hero → existing chat store.
// Heatmaps list uses row dividers; session rows show country flags (not initials).

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Flag,
  Flame,
  FlaskConical,
  Lightbulb,
  Mic,
  Monitor,
  PenLine,
  Play,
  Plus,
  SendHorizontal,
  Sparkles,
  Layers,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useWandzStore } from "@/store/wandz";
import {
  ACTIVE_TESTS,
  FORMS_REPORT,
  FUNNEL_REPORTS,
  HEATMAP_PAGES,
  HYPOTHESIS_MORE_STAGES,
  HYPOTHESIS_PIPELINE,
  METRIC_REPORT_RANGE,
  METRIC_REPORTS,
  PERSONALIZATION,
  ROLLED_OUT,
  SESSION_RECORDINGS,
  SURVEYS_REPORT,
  TOTAL_EXPERIENCES,
  UNTESTED_HYPOTHESES,
  WANDZ_CTAS,
  WANDZ_DEFAULT_PROMPT,
  WANDZ_RECENT_CHATS,
} from "@/data/dashboard";
import { cn } from "@/lib/utils";
import {
  CHART,
  chartSeries,
  chartSeriesAlpha,
} from "@/config/chartTokens";

const WANDZ_CTA_ICONS = {
  analyze: BarChart3,
  friction: Layers,
  ideas: Lightbulb,
  explore: Flag,
} as const;

function CountBadge({ count }: { count: number | string }) {
  return (
    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium text-secondary-foreground">
      {count}
    </span>
  );
}

function RangeToggle({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border text-xs">
      {options.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "border-r border-border px-2.5 py-1.5 last:border-r-0 transition-colors",
            value === r
              ? "bg-secondary font-medium text-foreground"
              : "bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function Pager({ pages, active }: { pages: number; active: number }) {
  return (
    <div className="mt-auto flex items-center justify-center gap-2 pt-5">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground"
        aria-label="Previous"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: pages }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full",
              i === active ? "bg-foreground" : "bg-border"
            )}
          />
        ))}
      </div>
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground"
        aria-label="Next"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

/** ISO alpha-2 → regional-indicator flag emoji (dummy UI, no external assets). */
function countryFlagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function CardShell({
  title,
  count,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  count?: number | string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn("flex flex-col shadow-none", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-5">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {title}
          {count !== undefined && <CountBadge count={count} />}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent
        className={cn("flex min-h-0 flex-1 flex-col", contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}

export function WandzHero() {
  const [prompt, setPrompt] = useState(WANDZ_DEFAULT_PROMPT);
  const openWandzAndAsk = useWandzStore((s) => s.openWandzAndAsk);
  const openWandz = useWandzStore((s) => s.openWandz);

  const ask = (text: string) => {
    const body = text.trim();
    if (!body) {
      openWandz({ kind: "general" });
      return;
    }
    openWandzAndAsk({ kind: "general" }, body);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2.5">
          <Sparkles className="size-6 text-foreground" aria-hidden />
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Meet Wandz
          </h2>
        </div>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Ask about campaigns, recordings, heatmaps, and test ideas. All in one
          conversation.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="rounded-xl border border-border bg-background">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="min-h-[88px] resize-none border-0 bg-transparent px-4 pt-4 text-sm shadow-none focus-visible:ring-0"
            placeholder="Ask Wandz…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(prompt);
              }
            }}
          />
          <div className="flex items-center justify-between gap-3 px-3 pb-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              aria-label="Add attachment"
            >
              <Plus className="size-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium"
              >
                Thinking
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                aria-label="Voice input"
              >
                <Mic className="size-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-8"
                aria-label="Send to Wandz"
                onClick={() => ask(prompt)}
              >
                <SendHorizontal className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {WANDZ_CTAS.map((cta) => {
            const Icon = WANDZ_CTA_ICONS[cta.id];
            return (
              <Button
                key={cta.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto gap-2 rounded-lg bg-background px-3.5 py-2 text-sm font-normal shadow-none"
                onClick={() => ask(cta.prompt)}
              >
                <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                {cta.label}
              </Button>
            );
          })}
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-muted-foreground">
            Your recent chats
          </p>
          <ul className="space-y-2">
            {WANDZ_RECENT_CHATS.map((chat) => (
              <li key={chat.id}>
                <button
                  type="button"
                  onClick={() => ask(chat.prompt)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <p className="min-w-0 truncate text-sm font-medium text-foreground">
                    {chat.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {chat.ago}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function MetricReportsCard() {
  const [range, setRange] = useState<(typeof METRIC_REPORT_RANGE)[number]>(
    "Last 7 days"
  );
  const [active, setActive] = useState(0);
  const w = 360;
  const h = 160;
  const padX = 12;
  const padTop = 16;
  const padBottom = 28;
  const plotH = h - padTop - padBottom;
  const points = METRIC_REPORTS.chartPoints;
  const max = Math.max(...points, 1);
  const coords = points.map((v, i) => {
    const x =
      padX +
      (points.length === 1
        ? (w - padX * 2) / 2
        : (i / (points.length - 1)) * (w - padX * 2));
    const y = padTop + plotH - (v / max) * plotH;
    return { x, y };
  });
  const linePoints = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = [
    `M ${coords[0]?.x ?? padX} ${h - padBottom}`,
    ...coords.map((p) => `L ${p.x} ${p.y}`),
    `L ${coords[coords.length - 1]?.x ?? w - padX} ${h - padBottom}`,
    "Z",
  ].join(" ");

  return (
    <CardShell
      title="Metric reports"
      count={METRIC_REPORTS.count}
      action={<RangeToggle options={METRIC_REPORT_RANGE} value={range} onChange={(v) => setRange(v as typeof range)} />}
    >
      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <div className="mb-1 flex justify-end">
            <div className="text-right">
              <p className="text-xs font-medium text-foreground">
                {points[points.length - 1] ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {METRIC_REPORTS.chartLabel}
              </p>
            </div>
          </div>
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="h-40 w-full"
            role="img"
            aria-label="Unique visitors chart"
          >
            {[0, 1, 2, 3, 4].map((i) => {
              const gy = padTop + i * (plotH / 4);
              return (
                <line
                  key={i}
                  x1={padX}
                  x2={w - padX}
                  y1={gy}
                  y2={gy}
                  stroke={CHART.grid}
                  strokeWidth="1"
                />
              );
            })}
            <path d={areaPath} fill={chartSeriesAlpha(0, 0.18)} />
            <polyline
              fill="none"
              stroke={chartSeries(0)}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePoints}
            />
            <line
              x1={padX}
              x2={w - padX}
              y1={h - padBottom}
              y2={h - padBottom}
              stroke={CHART.axisLine}
              strokeWidth="1.5"
            />
          </svg>
          <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground">
            {METRIC_REPORTS.dayLabels.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-0.5 flex justify-between px-1 text-[10px] text-muted-foreground">
            <span>{METRIC_REPORTS.dateStart}</span>
            <span>{METRIC_REPORTS.dateEnd}</span>
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border">
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            {METRIC_REPORTS.items.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50",
                    i === active && "bg-muted"
                  )}
                >
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-sm px-1.5 font-mono text-[10px]"
                  >
                    {item.id}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground underline-offset-2 hover:underline">
                    View Report
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border py-2">
            <Pager pages={METRIC_REPORTS.pages} active={METRIC_REPORTS.activePage} />
          </div>
        </div>
      </div>
    </CardShell>
  );
}

export function FunnelReportsCard() {
  const [range, setRange] = useState<(typeof METRIC_REPORT_RANGE)[number]>(
    "Last 7 days"
  );
  const funnel = FUNNEL_REPORTS.items[0];

  return (
    <CardShell
      title="Funnel reports"
      count={FUNNEL_REPORTS.count}
      action={<RangeToggle options={METRIC_REPORT_RANGE} value={range} onChange={(v) => setRange(v as typeof range)} />}
    >
      <button
        type="button"
        title={`View report of ${funnel.name}`}
        className="mb-4 flex items-center gap-2 text-left text-sm font-medium text-foreground hover:underline"
      >
        <Filter className="size-3.5 shrink-0 text-muted-foreground" />
        {funnel.name}
      </button>

      <div className="grid flex-1 gap-6 sm:grid-cols-[0.9fr_1.4fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <p className="mt-0.5 text-xl font-semibold text-foreground">
              {funnel.conversionRate}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {funnel.maxDropoffLabel}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xl font-semibold text-foreground">
              {funnel.maxDropoffRate}
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <ArrowDown className="size-3" />
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-end gap-1">
          {funnel.steps.map((step, i) => (
            <div key={`${step.label}-${i}`} className="flex flex-1 items-end gap-1">
              <div className="flex w-full flex-col items-center">
                <p className="mb-1 text-[10px] font-medium text-foreground">
                  {step.percent.toFixed(1)}%
                </p>
                <div className="relative flex h-24 w-full flex-col justify-end overflow-hidden rounded-sm bg-muted">
                  <div
                    className="w-full"
                    style={{
                      height: `${Math.max(step.percent, 0)}%`,
                      backgroundColor: chartSeries(i),
                    }}
                  />
                </div>
                <p className="mt-2 truncate text-center text-[10px] text-muted-foreground">
                  {step.label}
                </p>
              </div>
              {i < funnel.steps.length - 1 && (
                <ArrowRight className="mb-10 size-3.5 shrink-0 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Pager pages={FUNNEL_REPORTS.pages} active={FUNNEL_REPORTS.activePage} />
    </CardShell>
  );
}

export function HypothesisCard() {
  return (
    <CardShell title="Hypothesis">
      <div className="flex flex-wrap items-stretch gap-2">
        {HYPOTHESIS_PIPELINE.map((stage, i) => (
          <div key={stage.id} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="w-full rounded-md bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">{stage.label}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {stage.count}
              </p>
            </div>
            {i < HYPOTHESIS_PIPELINE.length - 1 && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
        <div className="flex items-center">
          <ChevronRight className="mr-2 size-4 shrink-0 text-muted-foreground" />
          <button
            type="button"
            className="whitespace-nowrap text-sm font-medium text-foreground underline-offset-2 hover:underline"
          >
            + {HYPOTHESIS_MORE_STAGES} more stages
          </button>
        </div>
      </div>
    </CardShell>
  );
}

export function UntestedHypothesesCard() {
  return (
    <CardShell
      title="Untested hypotheses"
      count={UNTESTED_HYPOTHESES.count}
      className="h-full"
    >
      <div className="mb-4 grid grid-cols-2 gap-2">
        {UNTESTED_HYPOTHESES.stats.map((s) => (
          <div key={s.id} className="rounded-md bg-muted px-3 py-3">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {s.count}
            </p>
          </div>
        ))}
      </div>

      <ul className="divide-y divide-border border-t border-border">
        {UNTESTED_HYPOTHESES.items.map((h) => (
          <li key={h.id} className="space-y-2 py-3">
            <div className="flex items-start gap-2">
              <Badge
                variant="secondary"
                className="shrink-0 rounded-sm px-1.5 font-mono text-[10px]"
              >
                {h.id}
              </Badge>
              <p className="text-sm font-medium text-foreground">{h.title}</p>
            </div>
            {h.description ? (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {h.description}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {h.stage}
              </Badge>
              <span className="text-xs text-muted-foreground">{h.score}</span>
            </div>
          </li>
        ))}
      </ul>

      <Pager
        pages={UNTESTED_HYPOTHESES.pages}
        active={UNTESTED_HYPOTHESES.activePage}
      />
    </CardShell>
  );
}

export function ActiveTestsCard() {
  return (
    <CardShell title="Active tests" count={ACTIVE_TESTS.count}>
      <ul className="divide-y divide-border border-t border-border">
        {ACTIVE_TESTS.items.map((t, i) => (
          <li key={t.id} className="flex items-start gap-3 py-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
              {i === 0 ? (
                <PenLine className="size-3.5" />
              ) : (
                <FlaskConical className="size-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              {t.hypothesis ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.hypothesis}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 space-y-1 text-right text-xs">
              {t.rows.map((r) => (
                <div
                  key={r.badge}
                  className="flex items-center justify-end gap-1.5 text-muted-foreground"
                >
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-foreground">
                    {r.badge}
                  </span>
                  <span>
                    {r.conversions} conversions / {r.visitors} visitors
                  </span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <Pager pages={ACTIVE_TESTS.pages} active={ACTIVE_TESTS.activePage} />
    </CardShell>
  );
}

export function PersonalizationCard() {
  const total = PERSONALIZATION.donut.reduce((a, b) => a + b, 0) || 1;
  const r = 26;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = PERSONALIZATION.donut.map((value, i) => {
    const len = (value / total) * c;
    const dash = { len, offset };
    offset += len;
    return { ...dash, color: chartSeries(i) };
  });

  return (
    <CardShell title="Personalization" count={PERSONALIZATION.count}>
      <div className="mb-4 flex items-center gap-2">
        <UserRound className="size-4 text-muted-foreground" />
        <p className="truncate text-sm font-medium text-foreground">
          {PERSONALIZATION.name}
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 72 72" className="size-16" aria-hidden>
            <circle
              cx="36"
              cy="36"
              r={r}
              fill="none"
              stroke={CHART.grid}
              strokeWidth="9"
            />
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx="36"
                cy="36"
                r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth="9"
                strokeDasharray={`${arc.len} ${c - arc.len}`}
                strokeDashoffset={-arc.offset}
                transform="rotate(-90 36 36)"
              />
            ))}
          </svg>
          <p className="mt-1 text-[10px] text-muted-foreground">Visitor Split</p>
        </div>

        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
          {PERSONALIZATION.experiences.map((e, i) => (
            <div key={e.id} className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-flex size-5 items-center justify-center rounded-full text-[10px] font-medium text-primary-foreground"
                  style={{ backgroundColor: chartSeries(i) }}
                >
                  {e.id}
                </span>
                <p className="truncate text-sm font-medium text-foreground">
                  {e.label}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {e.visitors} Visitors
              </p>
              <p className="text-xs text-muted-foreground">
                Conversion Rate: {e.conversionRate}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Segment: {e.segment}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="ml-auto shrink-0 text-xs font-medium text-foreground underline-offset-2 hover:underline"
        >
          +{PERSONALIZATION.moreExperiences} more Experiences
        </button>
      </div>

      <Pager pages={PERSONALIZATION.pages} active={PERSONALIZATION.activePage} />
    </CardShell>
  );
}

export function RolledOutCard() {
  return (
    <CardShell title="Rolled out experiences">
      <ul className="divide-y divide-border border-t border-border">
        {ROLLED_OUT.items.map((r) => (
          <li key={r.id} className="flex items-center gap-2.5 py-3 text-sm">
            <Monitor className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-foreground">{r.name}</span>
          </li>
        ))}
      </ul>
      <Pager pages={ROLLED_OUT.pages} active={ROLLED_OUT.activePage} />
    </CardShell>
  );
}

export function TotalExperiencesCard() {
  return (
    <CardShell title="Total experiences">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-muted py-12">
        <p className="text-5xl font-semibold tracking-tight text-foreground">
          {TOTAL_EXPERIENCES}
        </p>
      </div>
    </CardShell>
  );
}

export function HeatmapsCard() {
  return (
    <CardShell title="Heatmaps for most clicked pages">
      <ul className="divide-y divide-border border-t border-border">
        {HEATMAP_PAGES.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-2 py-2.5 text-left hover:bg-muted"
            >
              <Flame className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono text-xs text-foreground">
                {p.url}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

export function SessionRecordingsCard() {
  return (
    <CardShell
      title="Latest Session Recordings"
      action={
        <button
          type="button"
          className="text-xs font-medium text-foreground underline-offset-2 hover:underline"
        >
          View All
        </button>
      }
    >
      <ul className="divide-y divide-border border-t border-border">
        {SESSION_RECORDINGS.map((s) => (
          <li
            key={s.id}
            className="flex items-center gap-3 py-3 text-sm"
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-base leading-none"
              aria-label={s.countryCode}
              title={s.countryCode}
            >
              {countryFlagEmoji(s.countryCode)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{s.location}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {s.url}
              </p>
            </div>
            <Monitor className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="w-4 shrink-0 text-center text-muted-foreground">
              {s.sessions}
            </span>
            <span className="w-[64px] shrink-0 font-mono text-xs text-foreground">
              {s.duration}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="size-7 shrink-0 rounded-full"
              aria-label="Play recording"
            >
              <Play className="size-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

export function FormsCard() {
  const [range, setRange] = useState<(typeof FORMS_REPORT.ranges)[number]>(
    "Last 7 days"
  );

  return (
    <CardShell
      title="Forms"
      count={FORMS_REPORT.count}
      action={
        <RangeToggle
          options={FORMS_REPORT.ranges}
          value={range}
          onChange={(v) => setRange(v as typeof range)}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardList className="size-3.5 shrink-0 text-muted-foreground" />
          <p className="truncate text-sm font-medium text-foreground">
            {FORMS_REPORT.name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {FORMS_REPORT.submitsHighlight}
          </span>{" "}
          Form Submits in Last 7 days
        </p>
      </div>

      <div className="flex items-end gap-2">
        {FORMS_REPORT.steps.map((step, i) => (
          <div key={step.label} className="flex flex-1 items-end gap-2">
            <div className="flex w-full flex-col items-center">
              <p className="mb-1 text-[10px] font-medium text-foreground">
                {step.percent}%
              </p>
              <div className="relative flex h-20 w-full flex-col justify-end overflow-hidden rounded-sm bg-muted">
                <div
                  className="w-full"
                  style={{
                    height:
                      step.fill === "full"
                        ? "100%"
                        : `${Math.max(step.percent, 4)}%`,
                    backgroundColor:
                      step.fill === "full"
                        ? chartSeries(0)
                        : chartSeriesAlpha(0, 0.45),
                  }}
                />
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {step.label}
              </p>
            </div>
            {i < FORMS_REPORT.steps.length - 1 && (
              <ArrowRight className="mb-8 size-3.5 shrink-0 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <Pager pages={FORMS_REPORT.pages} active={FORMS_REPORT.activePage} />
    </CardShell>
  );
}

export function SurveysCard() {
  const max = Math.max(...SURVEYS_REPORT.answers.map((a) => a.value), 1);

  return (
    <CardShell title="Surveys" count={SURVEYS_REPORT.count}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-3.5 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {SURVEYS_REPORT.name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {SURVEYS_REPORT.responsesHighlight}
          </span>{" "}
          Responses till date
        </p>
      </div>

      <div className="mb-3 flex items-start gap-2">
        <Badge variant="secondary" className="rounded-sm px-1.5 text-[10px]">
          {SURVEYS_REPORT.questionId}
        </Badge>
        <p className="text-sm text-foreground">{SURVEYS_REPORT.question}</p>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-1 items-end gap-4 rounded-lg bg-muted p-4">
          <div className="flex h-20 items-end gap-1.5">
            {SURVEYS_REPORT.answers.map((a, i) => (
              <div key={a.n} className="flex flex-col items-center gap-1">
                <div
                  className="w-4 rounded-t-sm"
                  style={{
                    height: `${(a.value / max) * 64}px`,
                    backgroundColor: chartSeries(i),
                  }}
                />
                <span className="text-[10px] text-muted-foreground">{a.n}</span>
              </div>
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {SURVEYS_REPORT.answers.map((a) => (
              <p key={a.n} className="truncate text-xs text-muted-foreground">
                {a.n}. {a.label}
              </p>
            ))}
            <p className="text-xs text-muted-foreground">
              +{SURVEYS_REPORT.moreChoices} more choices
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-foreground underline-offset-2 hover:underline"
        >
          +{SURVEYS_REPORT.moreQuestions} more Questions
        </button>
      </div>

      <Pager pages={SURVEYS_REPORT.pages} active={SURVEYS_REPORT.activePage} />
    </CardShell>
  );
}

// @undo — greeting moved to PageHeader description tooltip on DashboardPage
// export function DashboardGreeting() {
//   return (
//     <p className="text-sm text-muted-foreground">
//       Hi {DASHBOARD_USER_NAME}. Here&apos;s an overview of all your experiments on
//       your journey.
//     </p>
//   );
// }

