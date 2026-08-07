/**
 * Chart tokens — data-viz palette for graphs.
 *
 * Colors resolve through the `--chart-*` CSS variables in `src/index.css`
 * (VWO primitives only), so every value is automatically correct for the
 * active color mode. Prefer the Tailwind classes (`text-chart-positive`,
 * `bg-chart-1`, …) in markup; use these exports where a chart needs color
 * values in JS (series arrays, SVG fills, scales).
 *
 * Note: `hsl(var(--…))` strings work anywhere the DOM/SVG resolves CSS —
 * they will NOT work on a raw <canvas>; read the computed style first there.
 */

const chartVar = (name: string) => `hsl(var(--chart-${name}))`;
const chartVarAlpha = (name: string, alpha: number) =>
  `hsl(var(--chart-${name}) / ${alpha})`;

/**
 * Categorical series rotation — all 8 VWO families, mode-tuned steps.
 * Series 8+ are reserve colors for dense charts; avoid them for thin lines.
 */
export const CHART_CATEGORICAL: readonly string[] = Array.from(
  { length: 20 },
  (_, i) => chartVar(`${i + 1}`)
);

/** Single-hue (cherry) ramp, low → high intensity. */
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

/** Categorical series color by index (wraps). */
export function chartSeries(index: number): string {
  const i =
    ((index % CHART_CATEGORICAL.length) + CHART_CATEGORICAL.length) %
    CHART_CATEGORICAL.length;
  return CHART_CATEGORICAL[i];
}

/** Categorical series with alpha — for area fills / heatmap cells. */
export function chartSeriesAlpha(index: number, alpha: number): string {
  const i = ((index % 20) + 20) % 20;
  return chartVarAlpha(`${i + 1}`, alpha);
}

/** Sequential ramp by index (wraps). */
export function chartSequential(index: number): string {
  const i =
    ((index % CHART_SEQUENTIAL.length) + CHART_SEQUENTIAL.length) %
    CHART_SEQUENTIAL.length;
  return CHART_SEQUENTIAL[i];
}

/** Diverging ramp by index (0…6, midpoint 3). */
export function chartDiverging(index: number): string {
  const i =
    ((index % CHART_DIVERGING.length) + CHART_DIVERGING.length) %
    CHART_DIVERGING.length;
  return CHART_DIVERGING[i];
}
