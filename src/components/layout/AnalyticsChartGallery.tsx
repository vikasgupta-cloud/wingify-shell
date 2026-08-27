import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ANALYTICS_CHART_CATEGORIES,
  ANALYTICS_CHARTS,
  type AnalyticsChartFilter,
  type AnalyticsChartId,
} from "../../config/analyticsCharts";
import {
  CHART,
  CHART_AESTHETIC_ORDER,
  CHART_SERIES_COUNT,
  chartSeriesAt,
  chartSeriesAlphaAt,
  chartSequential,
  randomBalancedChartOrder,
} from "../../config/chartTokens";
import { CHART_PALETTE_SUGGESTIONS } from "../../config/chartPaletteSuggestions";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Lock,
  LockOpen,
  RefreshCw,
  RotateCcw,
} from "@/components/icons/protoLucide";

const PREVIEW_W = 280;
const PREVIEW_H = 140;

function withAlpha(color: string, alpha: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

function ChartPreview({
  id,
  order,
  paletteColors,
}: {
  id: AnalyticsChartId;
  order: readonly number[];
  /** Optional proposal colors (not tokens) — overrides chart series for preview. */
  paletteColors?: readonly string[] | null;
}) {
  const axis = CHART.axisLine;
  const chartSeries = (i: number) =>
    paletteColors && paletteColors.length > 0
      ? paletteColors[((i % paletteColors.length) + paletteColors.length) % paletteColors.length]!
      : chartSeriesAt(order, i);
  const chartSeriesAlpha = (i: number, alpha: number) =>
    paletteColors && paletteColors.length > 0
      ? withAlpha(
          paletteColors[((i % paletteColors.length) + paletteColors.length) % paletteColors.length]!,
          alpha
        )
      : chartSeriesAlphaAt(order, i, alpha);
  const s0 = chartSeries(0);
  const s1 = chartSeries(1);
  const s2 = chartSeries(2);
  const s3 = chartSeries(3);
  const f0 = chartSeriesAlpha(0, 0.28);
  const f1 = chartSeriesAlpha(1, 0.28);
  const f2 = chartSeriesAlpha(2, 0.22);

  switch (id) {
    case "palette": {
      const heights = [92, 64, 108, 78, 54, 96, 70, 118];
      const count = paletteColors?.length ?? CHART_SERIES_COUNT;
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {Array.from({ length: count }, (_, i) => {
            const h = heights[i % heights.length]!;
            const x = 22 + i * 32;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={124 - h}
                  width="22"
                  height={h}
                  rx="3"
                  fill={chartSeries(i)}
                />
                <text
                  x={x + 11}
                  y={136}
                  textAnchor="middle"
                  fill={CHART.label}
                  fontSize="7"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {paletteColors ? i + 1 : order[i]}
                </text>
              </g>
            );
          })}
          <line x1="16" y1="124" x2="268" y2="124" stroke={axis} strokeWidth="1" />
        </svg>
      );
    }
    case "line":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <polyline
            fill="none"
            stroke={s0}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="20,110 55,82 95,92 140,52 185,68 230,36 260,48"
          />
          <line x1="20" y1="124" x2="260" y2="124" stroke={axis} strokeWidth="1" />
        </svg>
      );
    case "multi-line":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <polyline
            fill="none"
            stroke={s0}
            strokeWidth="2.5"
            points="20,100 60,72 110,84 160,48 210,58 260,38"
          />
          <polyline
            fill="none"
            stroke={s1}
            strokeWidth="2.5"
            points="20,112 60,104 110,90 160,96 210,78 260,84"
          />
          <polyline
            fill="none"
            stroke={s2}
            strokeWidth="2.5"
            strokeDasharray="4 3"
            points="20,88 60,92 110,70 160,74 210,62 260,55"
          />
          <line x1="20" y1="124" x2="260" y2="124" stroke={axis} strokeWidth="1" />
        </svg>
      );
    case "area":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <path
            d="M20,112 L55,78 L95,88 L140,48 L185,62 L230,34 L260,42 L260,124 L20,124 Z"
            fill={f0}
          />
          <polyline
            fill="none"
            stroke={s0}
            strokeWidth="2.5"
            points="20,112 55,78 95,88 140,48 185,62 230,34 260,42"
          />
        </svg>
      );
    case "stacked-area":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <path
            d="M20,124 L20,92 L90,80 L160,88 L230,70 L260,76 L260,124 Z"
            fill={f2}
          />
          <path
            d="M20,92 L90,80 L160,88 L230,70 L260,76 L260,50 L200,46 L130,58 L70,54 L20,70 Z"
            fill={f1}
          />
          <path
            d="M20,70 L70,54 L130,58 L200,46 L260,50 L260,28 L190,30 L120,40 L60,36 L20,48 Z"
            fill={f0}
          />
          <polyline
            fill="none"
            stroke={s0}
            strokeWidth="1.75"
            points="20,48 60,36 120,40 190,30 260,28"
          />
        </svg>
      );
    case "bar":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {[48, 78, 58, 100, 70, 112, 64, 88].map((h, i) => (
            <rect
              key={i}
              x={24 + i * 30}
              y={124 - h}
              width="20"
              height={h}
              rx="3"
              fill={chartSeries(i)}
            />
          ))}
        </svg>
      );
    case "grouped-bar":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {[0, 1, 2, 3].map((g) => (
            <g key={g}>
              <rect
                x={32 + g * 58}
                y={124 - (68 + g * 6)}
                width="14"
                height={68 + g * 6}
                rx="2"
                fill={s0}
              />
              <rect
                x={48 + g * 58}
                y={124 - (48 + g * 8)}
                width="14"
                height={48 + g * 8}
                rx="2"
                fill={s1}
              />
              <rect
                x={64 + g * 58}
                y={124 - (36 + g * 5)}
                width="14"
                height={36 + g * 5}
                rx="2"
                fill={s2}
              />
            </g>
          ))}
        </svg>
      );
    case "stacked-bar":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const bottom = 28 + (i % 3) * 8;
            const mid = 24 + (i % 2) * 10;
            const top = 20 + ((i + 1) % 3) * 8;
            const y3 = 124 - bottom;
            const y2 = y3 - mid;
            const y1 = y2 - top;
            return (
              <g key={i}>
                <rect x={28 + i * 40} y={y3} width="24" height={bottom} fill={s2} />
                <rect x={28 + i * 40} y={y2} width="24" height={mid} fill={s1} />
                <rect x={28 + i * 40} y={y1} width="24" height={top} rx="2" fill={s0} />
              </g>
            );
          })}
        </svg>
      );
    case "horizontal-bar":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {[200, 168, 140, 112, 88, 64].map((w, i) => (
            <rect
              key={i}
              x="20"
              y={16 + i * 18}
              width={w}
              height="12"
              rx="3"
              fill={chartSeries(i)}
            />
          ))}
        </svg>
      );
    case "donut":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <circle cx="140" cy="70" r="42" fill="none" stroke={chartSeriesAlpha(3, 0.35)} strokeWidth="16" />
          <circle
            cx="140"
            cy="70"
            r="42"
            fill="none"
            stroke={s0}
            strokeWidth="16"
            strokeDasharray="160 264"
            strokeDashoffset="0"
            transform="rotate(-90 140 70)"
          />
          <circle
            cx="140"
            cy="70"
            r="42"
            fill="none"
            stroke={s1}
            strokeWidth="16"
            strokeDasharray="70 264"
            strokeDashoffset="-160"
            transform="rotate(-90 140 70)"
          />
          <circle
            cx="140"
            cy="70"
            r="42"
            fill="none"
            stroke={s2}
            strokeWidth="16"
            strokeDasharray="34 264"
            strokeDashoffset="-230"
            transform="rotate(-90 140 70)"
          />
          <text
            x="140"
            y="74"
            textAnchor="middle"
            fill={CHART.labelStrong}
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            62%
          </text>
        </svg>
      );
    case "pie":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <circle cx="140" cy="70" r="48" fill={s3} />
          <path d="M140 70 L140 22 A48 48 0 0 1 182 92 Z" fill={s0} />
          <path d="M140 70 L182 92 A48 48 0 0 1 108 112 Z" fill={s1} />
          <path d="M140 70 L108 112 A48 48 0 0 1 140 22 Z" fill={s2} />
        </svg>
      );
    case "treemap":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <rect x="16" y="14" width="140" height="112" rx="4" fill={s0} />
          <rect x="162" y="14" width="102" height="64" rx="4" fill={s1} />
          <rect x="162" y="84" width="48" height="42" rx="4" fill={s2} />
          <rect x="216" y="84" width="48" height="42" rx="4" fill={s3} />
        </svg>
      );
    case "funnel":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => {
            const w = 220 - i * 32;
            const x = (PREVIEW_W - w) / 2;
            return (
              <rect
                key={i}
                x={x}
                y={14 + i * 24}
                width={w}
                height="18"
                rx="3"
                fill={chartSeries(i)}
              />
            );
          })}
        </svg>
      );
    case "sankey":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <path
            d="M36 28 C120 28, 120 42, 220 40"
            fill="none"
            stroke={s0}
            strokeWidth="14"
            opacity="0.85"
          />
          <path
            d="M36 64 C120 64, 120 78, 220 82"
            fill="none"
            stroke={s1}
            strokeWidth="12"
            opacity="0.85"
          />
          <path
            d="M36 100 C120 100, 120 108, 220 112"
            fill="none"
            stroke={s2}
            strokeWidth="10"
            opacity="0.85"
          />
          <rect x="20" y="20" width="16" height="92" rx="3" fill={s3} opacity="0.7" />
          <rect x="244" y="32" width="16" height="88" rx="3" fill={chartSeries(4)} opacity="0.7" />
        </svg>
      );
    case "retention-curve":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <polyline
            fill="none"
            stroke={s0}
            strokeWidth="2.5"
            points="24,28 55,52 90,66 130,76 170,84 210,90 250,94"
          />
          <polyline
            fill="none"
            stroke={s1}
            strokeWidth="2.5"
            points="24,36 55,58 90,72 130,82 170,90 210,96 250,100"
          />
          <line x1="24" y1="118" x2="250" y2="118" stroke={axis} strokeWidth="1" />
          <line x1="24" y1="24" x2="24" y2="118" stroke={axis} strokeWidth="1" />
        </svg>
      );
    case "cohort-heatmap": {
      const cells = [
        [1, 0.85, 0.7, 0.55, 0.4, 0.3],
        [1, 0.8, 0.62, 0.48, 0.35, 0.25],
        [1, 0.75, 0.58, 0.42, 0.3, 0.22],
        [1, 0.7, 0.5, 0.38, 0.28, 0.18],
        [1, 0.65, 0.45, 0.32, 0.24, 0.15],
      ];
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {cells.map((row, r) =>
            row.map((v, cIdx) => (
              <rect
                key={`${r}-${cIdx}`}
                x={28 + cIdx * 40}
                y={16 + r * 22}
                width="34"
                height="18"
                rx="3"
                fill={chartSequential(Math.round(v * 4))}
                opacity={0.45 + v * 0.55}
              />
            ))
          )}
        </svg>
      );
    }
    case "histogram":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {[28, 48, 72, 98, 110, 88, 60, 40, 26, 18].map((h, i) => (
            <rect
              key={i}
              x={24 + i * 24}
              y={124 - h}
              width="18"
              height={h}
              rx="2"
              fill={i === 4 ? s0 : s1}
              opacity={i === 4 ? 1 : 0.75}
            />
          ))}
        </svg>
      );
    case "box-plot":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {[0, 1, 2, 3].map((i) => {
            const x = 48 + i * 56;
            const color = chartSeries(i);
            return (
              <g key={i}>
                <line x1={x} y1="24" x2={x} y2="112" stroke={axis} strokeWidth="1.5" />
                <rect
                  x={x - 16}
                  y={40 + i * 2}
                  width="32"
                  height={44 - i * 2}
                  rx="3"
                  fill={chartSeriesAlpha(i, 0.25)}
                  stroke={color}
                  strokeWidth="2"
                />
                <line
                  x1={x - 16}
                  y1={58 + i}
                  x2={x + 16}
                  y2={58 + i}
                  stroke={color}
                  strokeWidth="2.5"
                />
              </g>
            );
          })}
        </svg>
      );
    case "scatter":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <line x1="28" y1="116" x2="256" y2="116" stroke={axis} strokeWidth="1" />
          <line x1="28" y1="24" x2="28" y2="116" stroke={axis} strokeWidth="1" />
          {[
            [44, 92, 0],
            [62, 80, 1],
            [80, 86, 2],
            [98, 64, 0],
            [118, 58, 1],
            [138, 68, 3],
            [158, 46, 0],
            [178, 52, 2],
            [198, 38, 1],
            [218, 44, 0],
            [74, 100, 3],
            [148, 78, 2],
            [188, 70, 1],
            [230, 34, 0],
          ].map(([x, y, series], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill={chartSeries(series)} />
          ))}
        </svg>
      );
    case "flow":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <rect x="20" y="54" width="44" height="32" rx="4" fill={s0} />
          <path d="M64 70 H88" stroke={axis} strokeWidth="2" />
          <rect x="88" y="28" width="44" height="28" rx="4" fill={s1} />
          <rect x="88" y="84" width="44" height="28" rx="4" fill={s2} />
          <path d="M132 42 H156" stroke={axis} strokeWidth="2" />
          <path d="M132 98 H156" stroke={axis} strokeWidth="2" />
          <rect x="156" y="18" width="44" height="24" rx="4" fill={s3} />
          <rect x="156" y="52" width="44" height="24" rx="4" fill={chartSeries(4)} />
          <rect x="156" y="96" width="44" height="24" rx="4" fill={s1} />
          <path d="M110 56 V84" stroke={axis} strokeWidth="2" fill="none" />
          <path d="M200 30 H224" stroke={axis} strokeWidth="2" />
          <rect x="224" y="18" width="36" height="24" rx="4" fill={chartSeries(5)} />
        </svg>
      );
    case "session-heatmap": {
      const grid = Array.from({ length: 7 }, (_, r) =>
        Array.from({ length: 12 }, (_, cIdx) => ((r * 3 + cIdx * 2) % 7) / 7)
      );
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          {grid.map((row, r) =>
            row.map((v, cIdx) => (
              <rect
                key={`${r}-${cIdx}`}
                x={24 + cIdx * 20}
                y={16 + r * 16}
                width="16"
                height="12"
                rx="2"
                fill={chartSequential(Math.round(v * 4))}
                opacity={0.35 + v * 0.65}
              />
            ))
          )}
        </svg>
      );
    }
    case "kpi-sparkline":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <text
            x="24"
            y="58"
            fill={CHART.labelStrong}
            style={{ fontSize: 32, fontWeight: 600 }}
          >
            24.8k
          </text>
          <text
            x="24"
            y="82"
            fill={CHART.positive}
            style={{ fontSize: 13, fontWeight: 500 }}
          >
            +12.4%
          </text>
          <polyline
            fill="none"
            stroke={s0}
            strokeWidth="2.5"
            points="160,96 178,82 196,88 214,64 232,70 250,46"
          />
        </svg>
      );
    case "gauge":
      return (
        <svg viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`} className="h-full w-full" aria-hidden>
          <path
            d="M50 108 A90 90 0 0 1 230 108"
            fill="none"
            stroke={chartSeriesAlpha(3, 0.3)}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M50 108 A90 90 0 0 1 190 42"
            fill="none"
            stroke={CHART.positive}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <text
            x="140"
            y="100"
            textAnchor="middle"
            fill={CHART.labelStrong}
            style={{ fontSize: 22, fontWeight: 600 }}
          >
            74%
          </text>
        </svg>
      );
    default:
      return null;
  }
}

export default function AnalyticsChartGallery({
  className,
  compact = false,
  category: categoryProp,
  onCategoryChange,
}: {
  className?: string;
  compact?: boolean;
  /** Controlled filter; omit for internal state (standalone gallery pages). */
  category?: AnalyticsChartFilter;
  onCategoryChange?: (category: AnalyticsChartFilter) => void;
}) {
  const [internalCategory, setInternalCategory] =
    useState<AnalyticsChartFilter>("All");
  const [order, setOrder] = useState<number[]>(() => [...CHART_AESTHETIC_ORDER]);
  const [locked, setLocked] = useState<Set<number>>(() => new Set());
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [suggestionId, setSuggestionId] = useState<string | null>(null);
  const category = categoryProp ?? internalCategory;
  const setCategory = onCategoryChange ?? setInternalCategory;

  const activeSuggestion = CHART_PALETTE_SUGGESTIONS.find(
    (s) => s.id === suggestionId
  );
  const paletteColors = activeSuggestion?.colors ?? null;
  const usingSuggestion = Boolean(paletteColors);
  const isDefaultOrder =
    order.length === CHART_AESTHETIC_ORDER.length &&
    order.every((token, i) => token === CHART_AESTHETIC_ORDER[i]);
  const canReset = !usingSuggestion && (!isDefaultOrder || locked.size > 0);

  const resetSeriesOrder = () => {
    setOrder([...CHART_AESTHETIC_ORDER]);
    setLocked(new Set());
    endDrag();
  };

  const charts = useMemo(() => {
    if (category === "All") return ANALYTICS_CHARTS;
    return ANALYTICS_CHARTS.filter((c) => c.category === category);
  }, [category]);

  const toggleLock = (index: number) => {
    setLocked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const endDrag = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const reorderSlots = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved!);
      return next;
    });
    setLocked((prev) => {
      const flags = Array.from({ length: CHART_SERIES_COUNT }, (_, i) =>
        prev.has(i)
      );
      const [movedFlag] = flags.splice(from, 1);
      flags.splice(to, 0, movedFlag!);
      return new Set(flags.flatMap((on, i) => (on ? [i] : [])));
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Series order
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {canReset && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5"
                onClick={resetSeriesOrder}
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reset
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5"
              disabled={usingSuggestion || locked.size >= CHART_SERIES_COUNT}
              onClick={() => setOrder(randomBalancedChartOrder(order, locked))}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              Randomize
            </Button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {usingSuggestion
            ? `Previewing “${activeSuggestion?.name}” — proposals only, not in tokens.`
            : "Drag to rearrange. Lock a chip to pin its color through Randomize."}
        </p>
        {!usingSuggestion && (
        <div className="flex flex-wrap gap-1.5">
          {order.map((token, i) => {
            const isLocked = locked.has(i);
            const isDragging = dragIndex === i;
            const isDropTarget = dragIndex !== null && dropIndex === i;
            return (
              <div
                key={`slot-${i}`}
                draggable
                onDragStart={(e) => {
                  setDragIndex(i);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(i));
                }}
                onDragOver={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dropIndex !== i) setDropIndex(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIndex !== null) reorderSlots(dragIndex, i);
                  endDrag();
                }}
                onDragEnd={endDrag}
                className={cn(
                  "relative inline-flex cursor-grab items-center gap-1 rounded-md border bg-background py-1 pl-1 pr-1 active:cursor-grabbing",
                  isLocked
                    ? "border-foreground/25 bg-muted"
                    : "border-border",
                  isDragging && "opacity-45",
                  isDropTarget && "ring-1 ring-foreground"
                )}
              >
                <GripVertical
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: chartSeriesAt(order, i) }}
                  aria-hidden
                />
                <span className="text-[11px] tabular-nums text-foreground">
                  {i + 1}. chart-{token}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(i);
                  }}
                  aria-pressed={isLocked}
                  aria-label={
                    isLocked
                      ? `Unlock position ${i + 1}, chart-${token}`
                      : `Lock position ${i + 1}, chart-${token}`
                  }
                  className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {isLocked ? (
                    <Lock className="size-3 text-[var(--neutral-700)]" aria-hidden />
                  ) : (
                    <LockOpen className="size-3" aria-hidden />
                  )}
                </button>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-foreground">
              Suggested palettes
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Theme-matched alternatives — preview only, not written to tokens.
            </p>
          </div>
          {usingSuggestion && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7"
              onClick={() => setSuggestionId(null)}
            >
              Use chart tokens
            </Button>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {CHART_PALETTE_SUGGESTIONS.map((suggestion) => {
            const active = suggestion.id === suggestionId;
            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() =>
                  setSuggestionId(active ? null : suggestion.id)
                }
                className={cn(
                  "rounded-md border p-2.5 text-left transition-colors",
                  active
                    ? "border-foreground/30 bg-background"
                    : "border-border bg-background hover:bg-muted/60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">
                    {suggestion.name}
                  </p>
                  {active && (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Previewing
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {suggestion.note}
                </p>
                <div className="mt-2 flex overflow-hidden rounded-md border border-border">
                  {suggestion.colors.map((color) => (
                    <span
                      key={color}
                      className="h-5 min-w-0 flex-1"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setCategory("All")}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
            category === "All"
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          All
        </button>
        {ANALYTICS_CHART_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              category === cat
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "grid gap-4",
          compact
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        )}
      >
        {charts.map((chart) => (
          <article
            key={chart.id}
            className="overflow-hidden rounded-xl border border-border bg-background"
          >
            <div className="border-b border-border bg-muted/30 px-4 py-4">
              <div className={cn(compact ? "h-[88px]" : "h-[140px]")}>
                <ChartPreview
                  id={chart.id}
                  order={order}
                  paletteColors={paletteColors}
                />
              </div>
            </div>
            <div className="space-y-1.5 px-4 py-3.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {chart.label}
                </h3>
                <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {chart.category}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {chart.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {chart.tools.includes("Both")
                  ? "Mixpanel · Amplitude"
                  : chart.tools.join(" · ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
