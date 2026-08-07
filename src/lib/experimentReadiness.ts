// Config v2 — turns a configuration into practitioner-facing readiness verdicts.
//
// Pure functions only: no React, no store, no JSX. Each function returns a
// plain-language finding (or null when there's nothing to flag). Copy is
// written for an experimentation practitioner, not an engineer.

import type { Campaign } from "../data/campaigns";
import {
  surfaceForUrl,
  type PageSurface,
} from "../data/siteAnalytics";

export type ReadinessLevel = "ok" | "warn" | "blocked";

export type ReadinessFinding = {
  id: string;
  level: ReadinessLevel;
  title: string;
  detail: string;
};

// Linear funnel order for proximity reasoning. Surfaces off the main funnel
// (account, landing) have no position and are skipped for proximity checks.
const FUNNEL_ORDER: Partial<Record<PageSurface, number>> = {
  home: 0,
  collection: 1,
  product: 2,
  cart: 3,
  checkout: 4,
};

// The surface each metric most naturally belongs to — its "home" in the funnel.
// Only metrics with a clear funnel home are listed; others yield no proximity
// finding.
const METRIC_NATURAL_SURFACE: Record<string, PageSurface> = {
  "Banner click rate": "home",
  "Search usage": "collection",
  "Pages per session": "collection",
  "Bounce rate": "collection",
  "Add to cart clicks": "product",
  "Wishlist adds": "product",
  "Video play rate": "product",
  "CTA button click rate": "product",
  "Checkout completion": "checkout",
  "Transaction rate": "checkout",
  "Revenue per visitor": "checkout",
  "Average order value": "checkout",
  "Coupon usage": "checkout",
};

const STEP_WORD = (n: number) => (n === 1 ? "step" : "steps");

/**
 * Warn when the success metric sits far DOWN the funnel from the surface being
 * changed — e.g. editing a product page but measuring "Checkout completion".
 * "Far" means the metric's natural surface is 2+ funnel steps below the page.
 */
export function metricProximityFinding(
  metricName: string,
  surface: PageSurface
): ReadinessFinding | null {
  const natural = METRIC_NATURAL_SURFACE[metricName];
  if (!natural) return null;
  const metricPos = FUNNEL_ORDER[natural];
  const pagePos = FUNNEL_ORDER[surface];
  if (metricPos == null || pagePos == null) return null;

  const steps = metricPos - pagePos;
  if (steps < 2) return null;

  return {
    id: "metric-proximity",
    level: "warn",
    title: "Success metric is far downstream",
    detail: `This metric is ${steps} ${STEP_WORD(
      steps
    )} below the change you're making, so the effect will be diluted by everything that happens in between. Consider a metric closer to the change, or expect a smaller, slower signal.`,
  };
}

/**
 * Warn above 4 observation metrics — every extra metric you watch inflates the
 * chance of a false positive somewhere (multiple-comparisons risk).
 */
export function observationOverloadFinding(
  count: number
): ReadinessFinding | null {
  if (count <= 4) return null;
  return {
    id: "observation-overload",
    level: "warn",
    title: "Too many observation metrics",
    detail: `You're watching ${count} observation metrics. The more you track, the more likely one moves by chance alone — pick the few that matter and treat the rest as directional.`,
  };
}

/**
 * Duration verdict. Blocked when a test can't realistically conclude
 * (unreachable or > 90 days), warn for long (43–90) or very short (< 7) runs,
 * ok for a healthy 7–42 day window.
 */
export function durationFinding(days: number): ReadinessFinding | null {
  if (!Number.isFinite(days) || days > 90) {
    return {
      id: "duration",
      level: "blocked",
      title: "Test can't reach significance in a reasonable window",
      detail: !Number.isFinite(days)
        ? "At this traffic, allocation and effect size the test never accumulates enough sample. Increase traffic allocation, widen the audience, or aim for a larger effect."
        : `This test needs about ${days} days to conclude — beyond a practical window. Increase traffic allocation, widen the audience, or target a larger effect.`,
    };
  }
  if (days > 42) {
    return {
      id: "duration",
      level: "warn",
      title: "Long run to significance",
      detail: `Plan for roughly ${days} days. That's workable but long — seasonality and site changes can creep in over that span.`,
    };
  }
  if (days < 7) {
    return {
      id: "duration",
      level: "warn",
      title: "Runs less than a full week",
      detail: `This reaches significance in about ${days} ${
        days === 1 ? "day" : "days"
      }. Run at least a full weekly cycle so weekday/weekend behaviour is represented before you call it.`,
    };
  }
  return {
    id: "duration",
    level: "ok",
    title: "Healthy test duration",
    detail: `On track to conclude in about ${days} days — a solid window that covers at least one weekly cycle.`,
  };
}

/**
 * Warn when per-variant daily traffic is very thin (< 100/day) — small daily
 * cells make the test noisy and slow, and a single odd day skews the read.
 */
export function trafficFinding(
  dailyIntoTest: number,
  variants: number
): ReadinessFinding | null {
  const cells = Math.max(1, variants);
  const perVariant = dailyIntoTest / cells;
  if (!Number.isFinite(perVariant) || perVariant >= 100) return null;
  return {
    id: "traffic",
    level: "warn",
    title: "Thin daily traffic per variant",
    detail: `Only about ${Math.max(
      0,
      Math.floor(perVariant)
    )} visitors/day reach each variant. Low daily volume makes results noisy and slow — consider raising allocation or widening the audience.`,
  };
}

/**
 * Warn when other RUNNING campaigns target the same funnel surface, since
 * overlapping traffic can confound the read. Compares surfaces via
 * surfaceForUrl and excludes the campaign itself.
 */
export function collisionFindings(
  campaignId: string,
  url: string,
  allCampaigns: Campaign[]
): ReadinessFinding[] {
  const surface = surfaceForUrl(url);
  const overlapping = allCampaigns.filter(
    (c) =>
      c.id !== campaignId &&
      c.status === "Running" &&
      surfaceForUrl(c.url) === surface
  );
  if (overlapping.length === 0) return [];
  const n = overlapping.length;
  return [
    {
      id: "collision",
      level: "warn",
      title: "Overlapping tests on the same surface",
      detail: `${n} other running ${
        n === 1 ? "test targets" : "tests target"
      } the ${surface} surface. Visitors caught by more than one test can confound each other's results — stagger them or split traffic deliberately.`,
    },
  ];
}
