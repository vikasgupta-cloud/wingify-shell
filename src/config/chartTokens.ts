/**
 * Chart tokens — data-viz palette for graphs.
 *
 * Colors resolve through the `--chart-*` CSS variables in `src/index.css`
 * (VWO primitives only). Theme / CTA / button colours never override these.
 * Categorical series pick a random order from chart-1…chart-20 (stable for
 * the browser session). Prefer Tailwind (`bg-chart-1`, …) in markup; use
 * these exports for JS (series arrays, SVG fills, scales).
 *
 * Note: `hsl(var(--…))` strings work anywhere the DOM/SVG resolves CSS —
 * they will NOT work on a raw <canvas>; read the computed style first there.
 */

const chartVar = (name: string) => `hsl(var(--chart-${name}))`;
const chartVarAlpha = (name: string, alpha: number) =>
  `hsl(var(--chart-${name}) / ${alpha})`;

const CATEGORICAL_COUNT = 20;

/** Keys theme/CTA used to inline — applyBrand always clears them. */
export const CHART_CSS_VARS_NEVER_INLINE: readonly string[] = [
  ...Array.from({ length: CATEGORICAL_COUNT }, (_, i) => `--chart-${i + 1}`),
  ...Array.from(
    { length: CATEGORICAL_COUNT },
    (_, i) => `--chart-${i + 1}-fg`
  ),
  "--chart-info",
  "--chart-info-bg",
  "--chart-highlight",
  "--chart-positive",
  "--chart-positive-bg",
  "--chart-seq-1",
  "--chart-seq-2",
  "--chart-seq-3",
  "--chart-seq-4",
  "--chart-seq-5",
  "--chart-seq-6",
  "--chart-seq-7",
];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function readSessionSeed(): number {
  if (typeof sessionStorage === "undefined") {
    return Date.now() >>> 0;
  }
  try {
    const raw = sessionStorage.getItem("wingify-chart-series-seed");
    if (raw) {
      const n = Number(raw);
      if (Number.isFinite(n)) return n >>> 0;
    }
    const next = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    sessionStorage.setItem("wingify-chart-series-seed", String(next));
    return next;
  } catch {
    return Date.now() >>> 0;
  }
}

/** Fisher–Yates shuffle of 0…n-1, session-stable. */
function shuffledSlots(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  const rand = mulberry32(readSessionSeed());
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SERIES_ORDER = shuffledSlots(CATEGORICAL_COUNT);

/**
 * Categorical series rotation — all 20 chart tokens, shuffled so charts
 * do not start on a theme/CTA hue.
 */
export const CHART_CATEGORICAL: readonly string[] = Array.from(
  { length: CATEGORICAL_COUNT },
  (_, i) => chartVar(`${i + 1}`)
);

/** Single-hue sequential ramp from CSS (not theme/CTA). */
export const CHART_SEQUENTIAL: readonly string[] = Array.from(
  { length: 7 },
  (_, i) => chartVar(`seq-${i + 1}`)
);

/** Ocean ↔ cherry diverging ramp; index 3 is the neutral midpoint. */
export const CHART_DIVERGING: readonly string[] = Array.from(
  { length: 7 },
  (_, i) => chartVar(`div-${i + 1}`)
);

/** Semantic + scaffolding roles for axes, grids, annotations, tooltips. */
export const CHART = {
  positive: chartVar("positive"),
  positiveBg: chartVar("positive-bg"),
  negative: chartVar("negative"),
  negativeBg: chartVar("negative-bg"),
  warning: chartVar("warning"),
  warningBg: chartVar("warning-bg"),
  info: chartVar("info"),
  infoBg: chartVar("info-bg"),
  baseline: chartVar("baseline"),
  baselineBg: chartVar("baseline-bg"),
  highlight: chartVar("highlight"),
  threshold: chartVar("threshold"),
  annotation: chartVar("annotation"),
  grid: chartVar("grid"),
  gridStrong: chartVar("grid-strong"),
  axisLine: chartVar("axis-line"),
  axisTick: chartVar("axis-tick"),
  label: chartVar("label"),
  labelStrong: chartVar("label-strong"),
  tooltipBg: chartVar("tooltip-bg"),
  tooltipText: chartVar("tooltip-text"),
  tooltipTextSecondary: chartVar("tooltip-text-secondary"),
} as const;

function slot(index: number): number {
  const i =
    ((index % CATEGORICAL_COUNT) + CATEGORICAL_COUNT) % CATEGORICAL_COUNT;
  return SERIES_ORDER[i]!;
}

/** Categorical series color by index — random chart-palette order. */
export function chartSeries(index: number): string {
  return CHART_CATEGORICAL[slot(index)]!;
}

/** AA-safe label color on a solid `chartSeries(index)` fill. */
export function chartSeriesOn(index: number): string {
  return chartVar(`${slot(index) + 1}-fg`);
}

/** Categorical series with alpha — for area fills / heatmap cells. */
export function chartSeriesAlpha(index: number, alpha: number): string {
  return chartVarAlpha(`${slot(index) + 1}`, alpha);
}

/** Sequential ramp by index (wraps). */
export function chartSequential(index: number): string {
  const i =
    ((index % CHART_SEQUENTIAL.length) + CHART_SEQUENTIAL.length) %
    CHART_SEQUENTIAL.length;
  return CHART_SEQUENTIAL[i]!;
}

/** Diverging ramp by index (0…6, midpoint 3). */
export function chartDiverging(index: number): string {
  const i =
    ((index % CHART_DIVERGING.length) + CHART_DIVERGING.length) %
    CHART_DIVERGING.length;
  return CHART_DIVERGING[i]!;
}
