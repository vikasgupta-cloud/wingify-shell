/**
 * Chart tokens — data-viz palette for graphs.
 *
 * Colors resolve through the `--chart-*` CSS variables in `src/index.css`
 * (VWO chart light/dark 1–8). Theme / CTA / button colours never override these.
 * Prefer Tailwind (`bg-chart-1`, …) in markup; use these exports for JS
 * (series arrays, SVG fills, scales).
 *
 * Note: `var(--…)` strings work anywhere the DOM/SVG resolves CSS —
 * they will NOT work on a raw <canvas>; read the computed style first there.
 */

const chartVar = (name: string) => `var(--chart-${name})`;
const chartVarAlpha = (name: string, alpha: number) =>
  `rgb(from var(--chart-${name}) r g b / ${alpha})`;

/** Unique semantic chart slots (Figma chart light/dark 1–8). */
export const CHART_SERIES_COUNT = 8;

/**
 * Aesthetic categorical order (1-based `--chart-N` indices).
 * Finalized series draw order from design review.
 *
 * 7 purple → 8 orchid → 6 blue → 5 teal → 4 forest → 3 lime → 2 mustard → 1 brown
 */
export const CHART_AESTHETIC_ORDER = [7, 8, 6, 5, 4, 3, 2, 1] as const;

/** Hue ring in token number order (brown → … → orchid). */
const CHART_HUE_RING = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function balancedHueWalk(tokens: readonly number[]): number[] {
  const n = tokens.length;
  if (n === 0) return [];
  if (n === 1) return [tokens[0]!];
  const coprimeSteps = [3, 5, 7, 1].filter((s) => s < n && n % s !== 0);
  const steps = coprimeSteps.length > 0 ? coprimeSteps : [1];
  const start = Math.floor(Math.random() * n);
  const step = steps[Math.floor(Math.random() * steps.length)]!;
  const next = Array.from(
    { length: n },
    (_, i) => tokens[(start + i * step) % n]!
  );
  if (Math.random() < 0.5) next.reverse();
  return next;
}

function sameOrder(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((n, i) => n === b[i]);
}

/**
 * Random series order that keeps tonal balance: walk the hue ring with a
 * spaced step so neighbors stay distinct. Same eight tokens every time.
 * Pass `locked` indices to pin those positions to `previous` values.
 */
export function randomBalancedChartOrder(
  previous?: readonly number[],
  locked?: ReadonlySet<number>
): number[] {
  const locks = locked ?? new Set<number>();
  const base = previous ?? [...CHART_AESTHETIC_ORDER];

  if (locks.size === 0) {
    for (let attempt = 0; attempt < 32; attempt++) {
      const next = balancedHueWalk(CHART_HUE_RING);
      if (!sameOrder(next, base)) return next;
    }
    return [...CHART_AESTHETIC_ORDER];
  }

  // Prefer a full balanced walk that already matches locked slots.
  for (let attempt = 0; attempt < 80; attempt++) {
    const candidate = balancedHueWalk(CHART_HUE_RING);
    const respectsLocks = [...locks].every((i) => candidate[i] === base[i]);
    if (respectsLocks && !sameOrder(candidate, base)) return candidate;
  }

  // Fallback: keep locked tokens, rebalance only the free pool into open slots.
  const next = [...base];
  const openSlots = Array.from({ length: CHART_SERIES_COUNT }, (_, i) => i).filter(
    (i) => !locks.has(i)
  );
  const lockedTokens = new Set([...locks].map((i) => base[i]!));
  const freeTokens = CHART_HUE_RING.filter((t) => !lockedTokens.has(t));
  const walked = balancedHueWalk(freeTokens);
  openSlots.forEach((slot, i) => {
    next[slot] = walked[i] ?? next[slot]!;
  });
  if (!sameOrder(next, base)) return next;

  // Last resort: rotate the free pool by one while preserving locks.
  if (openSlots.length > 1 && walked.length > 1) {
    const rotated = [...walked.slice(1), walked[0]!];
    openSlots.forEach((slot, i) => {
      next[slot] = rotated[i]!;
    });
  }
  return next;
}

/** Resolve `--chart-N` for series index using a 1-based order. */
export function chartSeriesAt(
  order: readonly number[],
  index: number
): string {
  const n = order.length || CHART_SERIES_COUNT;
  const i = ((index % n) + n) % n;
  return chartVar(`${order[i]}`);
}

/** Alpha fill for `chartSeriesAt`. */
export function chartSeriesAlphaAt(
  order: readonly number[],
  index: number,
  alpha: number
): string {
  const n = order.length || CHART_SERIES_COUNT;
  const i = ((index % n) + n) % n;
  return chartVarAlpha(`${order[i]}`, alpha);
}

/** Keys theme/CTA used to inline — applyBrand always clears them. */
export const CHART_CSS_VARS_NEVER_INLINE: readonly string[] = [
  ...Array.from({ length: 20 }, (_, i) => `--chart-${i + 1}`),
  ...Array.from({ length: 20 }, (_, i) => `--chart-${i + 1}-fg`),
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

/** 0-based slot indices in aesthetic draw order. */
const SERIES_ORDER = CHART_AESTHETIC_ORDER.map((n) => n - 1);

/**
 * Categorical series — semantic chart-1…chart-8 in token number order.
 * Prefer `chartSeries(i)` for plotted series (uses aesthetic order).
 */
export const CHART_CATEGORICAL: readonly string[] = Array.from(
  { length: CHART_SERIES_COUNT },
  (_, i) => chartVar(`${i + 1}`)
);

/** Aesthetic draw order as CSS vars — use when rendering a full-palette chart. */
export const CHART_CATEGORICAL_AESTHETIC: readonly string[] =
  CHART_AESTHETIC_ORDER.map((n) => chartVar(`${n}`));

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
    ((index % CHART_SERIES_COUNT) + CHART_SERIES_COUNT) % CHART_SERIES_COUNT;
  return SERIES_ORDER[i]!;
}

/** Categorical series color by index — aesthetic chart-palette order. */
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
