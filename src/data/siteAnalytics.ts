// Config v2 — analytics baseline for the women's-accessories store.
//
// A plausible, funnel-shaped traffic + conversion model used by the config-v2
// power / readiness maths to estimate sample sizes and durations. Everything
// here is a static, hand-tuned baseline — deterministic, no randomness, and no
// dependency on any store or component. Metric names are the real names from
// src/data/metrics.ts; segment labels are the real labels from
// src/config/segments.ts.

export type PageSurface =
  | "home"
  | "collection"
  | "product"
  | "cart"
  | "checkout"
  | "account"
  | "landing";

/**
 * Classify a campaign URL into a funnel surface by its path. Mirrors the paths
 * the 40 campaigns use (/, /collections/*, /products/*, /cart, /checkout,
 * /account/*, /landing/*). Anything unrecognised falls back to "collection".
 */
export function surfaceForUrl(url: string): PageSurface {
  let path = url;
  try {
    path = new URL(url).pathname;
  } catch {
    // Not an absolute URL — strip origin/query heuristically and keep the path.
    const noQuery = url.split(/[?#]/)[0] ?? url;
    const afterHost = noQuery.replace(/^https?:\/\/[^/]+/i, "");
    path = afterHost.startsWith("/") ? afterHost : `/${afterHost}`;
  }
  const p = path.toLowerCase();
  if (p === "/" || p === "") return "home";
  if (p.startsWith("/collections")) return "collection";
  if (p.startsWith("/products") || p.startsWith("/product")) return "product";
  if (p.startsWith("/cart")) return "cart";
  if (p.startsWith("/checkout")) return "checkout";
  if (p.startsWith("/account")) return "account";
  if (p.startsWith("/landing")) return "landing";
  return "collection";
}

/** Plausible daily unique visitors per surface for a mid-market store (funnel-shaped). */
export const DAILY_VISITORS: Record<PageSurface, number> = {
  home: 8200,
  collection: 5400,
  product: 3100,
  cart: 1150,
  checkout: 720,
  account: 260,
  landing: 900,
};

/**
 * Baseline conversion RATE (as a percent) per metric per surface. Keys are the
 * real metric names from metrics.ts. Values are funnel-realistic: the same
 * metric climbs as you move deeper down the funnel (e.g. Checkout completion is
 * ~1.4% measured on a product page but ~46% on the checkout page itself).
 * Not every metric appears on every surface — baselineRate() falls back for the
 * gaps.
 */
export const BASELINE_RATES: Record<PageSurface, Record<string, number>> = {
  home: {
    "CTA button click rate": 4.2,
    "Banner click rate": 3.1,
    "Bounce rate": 38,
    "Search usage": 6.5,
    "Pages per session": 3.4,
    "Add to cart clicks": 1.2,
    "Wishlist adds": 0.6,
  },
  collection: {
    "CTA button click rate": 5.8,
    "Add to cart clicks": 3.4,
    "Wishlist adds": 1.3,
    "Banner click rate": 2.4,
    "Search usage": 9.0,
    "Bounce rate": 31,
    "Pages per session": 4.1,
  },
  product: {
    "Add to cart clicks": 7.5,
    "Wishlist adds": 2.1,
    "Video play rate": 5.2,
    "CTA button click rate": 6.4,
    "Checkout completion": 1.4,
    "Revenue per visitor": 1.1,
  },
  cart: {
    "Checkout completion": 34,
    "Add to cart clicks": 12,
    "Coupon usage": 9.5,
    "Transaction rate": 22,
    "Revenue per visitor": 3.2,
  },
  checkout: {
    "Checkout completion": 46,
    "Transaction rate": 38,
    "Coupon usage": 14,
    "Revenue per visitor": 6.5,
  },
  account: {
    "Signup button click": 12,
    "Wishlist adds": 4.0,
    "CTA button click rate": 8,
  },
  landing: {
    "CTA button click rate": 9,
    "Signup button click": 6.5,
    "Bounce rate": 42,
    "Add to cart clicks": 2.2,
  },
};

/** Fallback baseline rate when a metric/surface pair isn't explicitly listed. */
const DEFAULT_BASELINE_RATE = 2.5;

/** Baseline conversion rate (%) for a metric on a surface, with a sane fallback. */
export function baselineRate(metricName: string, surface: PageSurface): number {
  const forSurface = BASELINE_RATES[surface];
  const rate = forSurface ? forSurface[metricName] : undefined;
  return typeof rate === "number" ? rate : DEFAULT_BASELINE_RATE;
}

/**
 * Fraction of total traffic a segment captures. Keys are the real segment
 * labels from segments.ts (standard segments + my-segments). Used to scale
 * daily visitors when a campaign targets a narrower audience. Unknown labels
 * default to 1.0 (treated as the full audience) — see segmentReach().
 */
export const SEGMENT_REACH: Record<string, number> = {
  // Traffic source
  "All visitors": 1.0,
  "Direct traffic": 0.28,
  "Referral traffic": 0.12,
  "Social traffic": 0.14,
  "Non-paid search traffic": 0.3,
  "Paid search traffic": 0.16,
  "Email traffic": 0.08,
  // Device type
  "Mobile and tablet traffic": 0.68,
  "Mobile traffic": 0.62,
  "Desktop traffic": 0.33,
  "Tablet traffic": 0.06,
  "Desktop and Tablet traffic": 0.39,
  // Visitor type
  "New visitors": 0.55,
  "Returning visitors": 0.45,
  "Logged-in visitors": 0.22,
  "First-time buyers": 0.18,
  // Operating system
  Windows: 0.3,
  macOS: 0.14,
  iOS: 0.34,
  Android: 0.3,
  Linux: 0.02,
  // My segments
  "India Users": 0.12,
  "Mumbai Windows Phone": 0.01,
  Email: 0.08,
};

/** Traffic fraction for a segment label; unknown labels are the full audience. */
export function segmentReach(label: string): number {
  const r = SEGMENT_REACH[label];
  return typeof r === "number" ? r : 1.0;
}
