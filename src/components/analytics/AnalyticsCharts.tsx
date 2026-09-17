// @summary SVG chart widgets for Journey Analytics boards/reports (dummy data).
// Uses chart-* CSS tokens; no chart library dependency.
import { cn } from "@/lib/utils";
import type {
  AnalyticsBarRow,
  AnalyticsDonutSlice,
  AnalyticsKpi,
  AnalyticsSeriesPoint,
} from "@/data/analyticsCharts";

const PLOT_W = 400;
const PLOT_H = 160;

function linePath(points: AnalyticsSeriesPoint[]): string {
  if (points.length === 0) return "";
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const span = Math.max(max - min, 1);
  return points
    .map((p, i) => {
      const x = points.length === 1 ? PLOT_W / 2 : (i / (points.length - 1)) * PLOT_W;
      const y = PLOT_H - ((p.value - min) / span) * (PLOT_H - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function areaPath(points: AnalyticsSeriesPoint[]): string {
  const line = linePath(points);
  if (!line || points.length === 0) return "";
  return `${line} L${PLOT_W},${PLOT_H} L0,${PLOT_H} Z`;
}

export function KpiStrip({ items }: { items: AnalyticsKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-xl border border-border bg-background px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
          <p className="mt-1 font-title text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {kpi.value}
          </p>
          <p
            className={cn(
              "mt-1 text-xs font-medium tabular-nums",
              kpi.up
                ? "text-[var(--success-fg)]"
                : "text-[var(--danger-fg)]"
            )}
          >
            {kpi.delta}
          </p>
        </div>
      ))}
    </div>
  );
}

export function LineTrendCard({
  title,
  subtitle,
  points,
}: {
  title: string;
  subtitle?: string;
  points: AnalyticsSeriesPoint[];
}) {
  const d = linePath(points);
  const fill = areaPath(points);

  return (
    <div className="flex min-h-[280px] flex-col rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-3 pt-4">
        <svg
          viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
          className="h-[160px] w-full"
          role="img"
          aria-label={title}
        >
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={0}
              x2={PLOT_W}
              y1={PLOT_H * t}
              y2={PLOT_H * t}
              stroke="var(--border)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={fill} fill="var(--chart-1)" fillOpacity={0.12} stroke="none" />
          <path
            d={d}
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          {points.map((p) => (
            <span key={p.label} className="tabular-nums">
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DonutCard({
  title,
  slices,
}: {
  title: string;
  slices: AnalyticsDonutSlice[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex min-h-[280px] flex-col rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <div className="flex flex-1 items-center gap-6 px-4 py-6">
        <svg
          viewBox="0 0 140 140"
          className="size-36 shrink-0"
          role="img"
          aria-label={title}
        >
          <g transform="translate(70,70)">
            {slices.map((slice) => {
              const len = (slice.value / total) * c;
              const el = (
                <circle
                  key={slice.label}
                  r={r}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={18}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90)"
                />
              );
              offset += len;
              return el;
            })}
            <circle r={36} fill="var(--background)" />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-[14px] font-semibold"
            >
              {total}%
            </text>
          </g>
        </svg>
        <ul className="min-w-0 flex-1 space-y-2.5">
          {slices.map((slice) => (
            <li
              key={slice.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ background: slice.color }}
                  aria-hidden
                />
                <span className="truncate text-muted-foreground">{slice.label}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums text-foreground">
                {slice.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function BarBreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: AnalyticsBarRow[];
}) {
  return (
    <div className="flex min-h-[280px] flex-col rounded-xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-4 px-4 py-5">
        {rows.map((row) => {
          const pct = Math.min(100, (row.value / row.max) * 100);
          return (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium tabular-nums text-foreground">
                  {row.value}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[var(--chart-2)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
