// Config v2 — classic frequentist power maths for A/B sample sizing.
//
// Pure functions only: no React, no store imports, no side effects, no
// randomness. Every result is a deterministic function of its inputs, and each
// function guards against divide-by-zero / NaN by returning Infinity (for
// "unreachable") rather than propagating NaN.

export type PowerInputs = {
  /** Control conversion rate as a percent, e.g. 7.5 for 7.5%. */
  baselineRatePct: number;
  /** Number of variants INCLUDING control (>= 2 for a real test). */
  variants: number;
  /** Percent of eligible traffic allocated to the test, 0–100. */
  trafficAllocationPct: number;
  /** Daily unique visitors on the surface being tested. */
  dailyVisitors: number;
  /** Fraction (0–1) of traffic the targeted segment captures. */
  segmentReach: number;
  /** Relative lift to detect, as a percent (e.g. 5 = detect a 5% relative lift). */
  mde?: number;
  /** Two-tailed significance level (default 0.05). */
  alpha?: number;
  /** Desired statistical power (default 0.8). */
  power?: number;
};

const DEFAULT_MDE = 5;
const DEFAULT_ALPHA = 0.05;
const DEFAULT_POWER = 0.8;

/**
 * Inverse standard-normal CDF (probit) via Acklam's rational approximation.
 * Accurate to ~1e-9 across the open interval (0,1); clamps the boundaries so
 * callers never get ±Infinity for alpha/power at 0 or 1. Keeps alpha/power
 * fully configurable instead of hard-coding 1.96 / 0.8416.
 */
export function invNorm(p: number): number {
  if (!(p > 0 && p < 1)) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    return NaN;
  }
  // Coefficients for the rational approximation.
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
}

function alphaOf(i: PowerInputs): number {
  const a = i.alpha ?? DEFAULT_ALPHA;
  return a > 0 && a < 1 ? a : DEFAULT_ALPHA;
}
function powerOf(i: PowerInputs): number {
  const pw = i.power ?? DEFAULT_POWER;
  return pw > 0 && pw < 1 ? pw : DEFAULT_POWER;
}
function mdeOf(i: PowerInputs): number {
  const m = i.mde ?? DEFAULT_MDE;
  return Number.isFinite(m) ? m : DEFAULT_MDE;
}

/**
 * Two-proportion normal-approximation sample size PER VARIANT:
 *   n = (z_{1-α/2} + z_{1-β})² · ( p1(1-p1) + p2(1-p2) ) / (p2 - p1)²
 * where p1 = baseline (proportion) and p2 = p1·(1 + mde/100).
 * Returns Infinity when the effect is zero / undetectable or inputs are invalid.
 */
export function sampleSizePerVariant(inputs: PowerInputs): number {
  const p1 = inputs.baselineRatePct / 100;
  if (!(p1 > 0 && p1 < 1)) return Infinity;
  const mde = mdeOf(inputs);
  let p2 = p1 * (1 + mde / 100);
  // A rate can't exceed 100%; clamp just below 1 so variance stays defined.
  if (p2 >= 1) p2 = 0.999999;
  const delta = p2 - p1;
  if (delta === 0 || !Number.isFinite(delta)) return Infinity;

  const zA = invNorm(1 - alphaOf(inputs) / 2);
  const zB = invNorm(powerOf(inputs));
  const zSum = zA + zB;
  const numerator = zSum * zSum * (p1 * (1 - p1) + p2 * (1 - p2));
  const n = numerator / (delta * delta);
  if (!Number.isFinite(n) || n <= 0) return Infinity;
  return Math.ceil(n);
}

/** Daily visitors actually entering the test after segment + allocation scaling. */
export function dailyVisitorsIntoTest(inputs: PowerInputs): number {
  const v =
    inputs.dailyVisitors *
    clamp01ish(inputs.segmentReach) *
    (inputs.trafficAllocationPct / 100);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function clamp01ish(x: number): number {
  if (!Number.isFinite(x) || x < 0) return 0;
  return x;
}

/** Whole days to reach significance; Infinity when no traffic enters the test. */
export function daysToSignificance(inputs: PowerInputs): number {
  const perVariant = sampleSizePerVariant(inputs);
  if (!Number.isFinite(perVariant)) return Infinity;
  const denom = dailyVisitorsIntoTest(inputs);
  if (denom <= 0) return Infinity;
  const total = perVariant * Math.max(1, inputs.variants);
  return Math.ceil(total / denom);
}

/** Total sample across all variants; Infinity when undetectable. */
export function totalSampleNeeded(inputs: PowerInputs): number {
  const perVariant = sampleSizePerVariant(inputs);
  if (!Number.isFinite(perVariant)) return Infinity;
  return perVariant * Math.max(1, inputs.variants);
}

/**
 * Smallest relative lift (%) detectable given the sample that accrues in `days`.
 * Inverts daysToSignificance by bisecting mde in [0.5%, 200%]. Returns Infinity
 * when no traffic accrues, or when even a 200% lift needs more sample than is
 * available in the window.
 */
export function minimumDetectableEffect(
  inputs: PowerInputs & { days: number }
): number {
  const perDay = dailyVisitorsIntoTest(inputs);
  const variants = Math.max(1, inputs.variants);
  if (perDay <= 0 || !Number.isFinite(inputs.days) || inputs.days <= 0) {
    return Infinity;
  }
  const availablePerVariant = (perDay * inputs.days) / variants;
  if (availablePerVariant <= 0) return Infinity;

  const LOW = 0.5;
  const HIGH = 200;
  const nAt = (mde: number) =>
    sampleSizePerVariant({ ...inputs, mde });

  // Sample size shrinks as mde grows. If even the largest lift can't fit, or the
  // smallest already fits, short-circuit the bounds.
  if (nAt(HIGH) > availablePerVariant) return Infinity;
  if (nAt(LOW) <= availablePerVariant) return LOW;

  let lo = LOW;
  let hi = HIGH;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (nAt(mid) <= availablePerVariant) {
      hi = mid; // mid is detectable → search for something smaller
    } else {
      lo = mid; // mid needs too much sample → need a bigger lift
    }
  }
  return Math.round(hi * 100) / 100;
}
