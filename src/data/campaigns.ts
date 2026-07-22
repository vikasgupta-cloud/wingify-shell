export type CampaignStatus =
  | "Draft"
  | "In QA"
  | "Ready to launch"
  | "Running"
  | "In Analysis"
  | "Paused"
  | "Ended";
export type Decision = "Winner" | "Baseline" | "Inconclusive" | "No decision";
export type CampaignType = "A/B" | "MVT" | "Split URL" | "Multipage";
export type Phase = { status: CampaignStatus; from: string /*ISO*/; to: string | null /*null = ongoing*/ };

export type MetricPerf = { name: string; uplift: number | null }; // null renders "No improvement"
export type Variant = {
  id: string;
  label: string /* "C" | "V1" | "V2" */;
  name: string /* "Control" | "Variation 1" */;
  convRate: number;
  uplift: number | null /* null for control */;
  confidence: number | null;
  isBest: boolean;
};
export type Report = {
  estimatedEndDate: string | null;
  elapsedDays: number;
  requiredDays: number;
  requiredVisitors: number;
  requiredConversions: number;
  traffic: number /* percent */;
  trafficSplit: "Equal" | "Custom";
  audience: string;
  otherMetrics: MetricPerf[];
  variants: Variant[];
};

// The statuses that carry live report data (mirrors the Reports/Quick view rules).
export const REPORTABLE_STATUSES: CampaignStatus[] = ["Running", "In Analysis", "Ended"];
export const hasReport = (status: CampaignStatus): boolean =>
  REPORTABLE_STATUSES.includes(status);

export type Campaign = {
  id: string;
  name: string;
  url: string;
  type: CampaignType;
  status: CampaignStatus;
  decision: Decision;
  vitals: "healthy" | "unhealthy" | null;
  variations: number;
  visitors: number;
  uniqueConversions: number;
  createdOn: string; // ISO
  createdBy: string;
  startedOn: string | null; // ISO
  expectedImprovement: number; // percent
  primaryMetric: string;
  leadingVariation: string;
  hypothesis: string;
  addresses: string; // the "will address …" half of the hypothesis
  labels: string[];
  lastUpdated: string; // ISO
  phases: Phase[];
  report: Report;
};

const CREATORS = [
  "Siddharth Sangal",
  "Nilesh Chaudari",
  "VWO support team",
  "Priya Menon",
  "Arjun Rao",
  "Lena Fischer",
];

const METRICS = [
  "Conversion rate",
  "Revenue per visitor",
  "Add to cart rate",
  "Signup rate",
  "Click-through rate",
  "Bounce rate",
];

const HYPOTHESES = [
  "Highlighting the primary CTA with stronger contrast will increase clicks and downstream conversions.",
  "Reducing visual clutter around the buy box will help visitors focus and lift add-to-cart rate.",
  "Showing social proof near the decision point will increase trust and checkout completions.",
  "Shortening the funnel by removing an intermediate step will reduce drop-off.",
  "Surfacing shipping costs earlier will reduce surprise at checkout and cut abandonment.",
  "A more prominent search experience will help visitors find products faster and convert more.",
  "Personalized content above the fold will improve engagement for returning visitors.",
  "Clearer progress feedback during checkout will reduce anxiety and improve completion rate.",
];

// The "will address …" clause, parallel to HYPOTHESES by index.
const ADDRESSES = [
  "the low click-through we see on the current low-contrast CTA.",
  "the drop in add-to-cart rate caused by a cluttered buy box.",
  "the hesitation visitors show at the point of decision.",
  "the drop-off we measure at the intermediate funnel step.",
  "the checkout abandonment driven by late shipping-cost surprises.",
  "the difficulty visitors have finding relevant products quickly.",
  "the weak engagement returning visitors show above the fold.",
  "the checkout anxiety that lowers our completion rate.",
];

const AUDIENCES = [
  "All visitors",
  "New visitors",
  "Returning visitors",
  "Mobile users",
  "Desktop users",
  "US traffic",
];

const OTHER_METRIC_POOL = [
  "Revenue per visitor",
  "Bounce rate",
  "Add to cart rate",
  "Average order value",
  "Pages per session",
  "Cart abandonment rate",
  "Click-through rate",
];

type BaseRow = {
  name: string;
  path: string;
  type: CampaignType;
  status: CampaignStatus;
  decision: Decision;
  labels: string[];
};

// 40 rows spread across all 7 statuses, 4 types, and 4 decisions.
const BASE: BaseRow[] = [
  { name: "Yellow button test", path: "/product/classic-tee", type: "A/B", status: "Running", decision: "No decision", labels: ["cro-sprint"] },
  { name: "Homepage hero CTA", path: "/", type: "A/B", status: "Running", decision: "No decision", labels: ["homepage"] },
  { name: "Checkout progress bar", path: "/checkout", type: "A/B", status: "In Analysis", decision: "No decision", labels: ["checkout"] },
  { name: "Multipage AB - blue button", path: "/collections/summer", type: "Multipage", status: "Draft", decision: "No decision", labels: [] },
  { name: "PDP gallery zoom", path: "/product/leather-wallet", type: "A/B", status: "Ended", decision: "Winner", labels: ["pdp"] },
  { name: "Free shipping banner", path: "/", type: "A/B", status: "Running", decision: "No decision", labels: ["homepage", "promo"] },
  { name: "Cart upsell widget", path: "/cart", type: "MVT", status: "In QA", decision: "No decision", labels: ["checkout"] },
  { name: "Pricing page layout", path: "/pricing", type: "Split URL", status: "Ended", decision: "Inconclusive", labels: [] },
  { name: "Sticky add-to-cart", path: "/product/canvas-sneakers", type: "A/B", status: "Paused", decision: "No decision", labels: ["pdp", "mobile"] },
  { name: "Search autosuggest v2", path: "/search", type: "A/B", status: "Running", decision: "No decision", labels: [] },
  { name: "Testimonial carousel", path: "/", type: "MVT", status: "Draft", decision: "No decision", labels: ["homepage"] },
  { name: "Exit intent popup", path: "/collections/all", type: "A/B", status: "Ended", decision: "Winner", labels: ["promo"] },
  { name: "One-page checkout", path: "/checkout", type: "Split URL", status: "In Analysis", decision: "Winner", labels: ["checkout", "q3-roadmap"] },
  { name: "Trust badges near CTA", path: "/product/denim-jacket", type: "A/B", status: "Running", decision: "No decision", labels: ["pdp"] },
  { name: "Product video on PDP", path: "/product/running-shoes", type: "A/B", status: "In QA", decision: "No decision", labels: ["pdp"] },
  { name: "Navigation mega menu", path: "/", type: "MVT", status: "Paused", decision: "No decision", labels: ["navigation"] },
  { name: "Urgency timer on cart", path: "/cart", type: "A/B", status: "Ended", decision: "Baseline", labels: ["checkout"] },
  { name: "Social proof toast", path: "/collections/bestsellers", type: "A/B", status: "Running", decision: "No decision", labels: [] },
  { name: "Guest checkout emphasis", path: "/checkout", type: "A/B", status: "Ready to launch", decision: "No decision", labels: ["checkout"] },
  { name: "Homepage personalization", path: "/", type: "Multipage", status: "Draft", decision: "No decision", labels: ["homepage", "q3-roadmap"] },
  { name: "Reviews above fold", path: "/product/wool-scarf", type: "A/B", status: "In Analysis", decision: "Inconclusive", labels: ["pdp"] },
  { name: "Mini cart redesign", path: "/cart", type: "A/B", status: "Paused", decision: "No decision", labels: [] },
  { name: "Coupon field placement", path: "/checkout", type: "A/B", status: "Ended", decision: "No decision", labels: ["checkout", "promo"] },
  { name: "Size guide modal", path: "/product/slim-chinos", type: "A/B", status: "In QA", decision: "No decision", labels: ["pdp"] },
  { name: "Category page filters", path: "/collections/shoes", type: "MVT", status: "Running", decision: "No decision", labels: ["navigation"] },
  { name: "Payment icons test", path: "/checkout", type: "A/B", status: "Ready to launch", decision: "No decision", labels: ["checkout"] },
  { name: "Headline copy sprint", path: "/landing/summer-sale", type: "MVT", status: "Ended", decision: "Winner", labels: ["promo", "cro-sprint"] },
  { name: "Mobile sticky footer CTA", path: "/product/travel-mug", type: "A/B", status: "Running", decision: "No decision", labels: ["mobile"] },
  { name: "Multipage funnel - green theme", path: "/landing/onboarding", type: "Multipage", status: "In Analysis", decision: "No decision", labels: [] },
  { name: "Landing page v3", path: "/landing/spring-launch", type: "Split URL", status: "Paused", decision: "No decision", labels: ["promo"] },
  { name: "Newsletter modal delay", path: "/", type: "A/B", status: "Draft", decision: "No decision", labels: ["homepage"] },
  { name: "Product badge labels", path: "/collections/new-arrivals", type: "A/B", status: "In QA", decision: "No decision", labels: [] },
  { name: "Shipping calculator", path: "/cart", type: "A/B", status: "Ready to launch", decision: "No decision", labels: ["checkout"] },
  { name: "Order bump at checkout", path: "/checkout", type: "A/B", status: "Ended", decision: "Inconclusive", labels: ["checkout", "cro-sprint"] },
  { name: "FAQ accordion on PDP", path: "/product/desk-lamp", type: "A/B", status: "Draft", decision: "No decision", labels: ["pdp"] },
  { name: "Related products rail", path: "/product/ceramic-mug", type: "MVT", status: "Running", decision: "No decision", labels: ["pdp"] },
  { name: "Hero video autoplay", path: "/", type: "A/B", status: "Paused", decision: "No decision", labels: ["homepage"] },
  { name: "Two-step signup", path: "/signup", type: "Split URL", status: "In QA", decision: "No decision", labels: [] },
  { name: "Breadcrumb visibility", path: "/collections/accessories", type: "A/B", status: "Draft", decision: "No decision", labels: ["navigation"] },
  { name: "Loyalty banner test", path: "/account/loyalty", type: "A/B", status: "Ready to launch", decision: "No decision", labels: ["promo"] },
];

const NOT_STARTED: CampaignStatus[] = ["Draft", "In QA", "Ready to launch"];

const iso = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day)).toISOString();
const addDays = (isoDate: string, days: number) => {
  const d = new Date(isoDate);
  // Reject null/undefined/"" (new Date(null) silently yields the epoch) and any
  // malformed input, so a bad date fails loudly here instead of surfacing as an
  // opaque "RangeError: Invalid time value" from a later .toISOString().
  if (!isoDate || isNaN(d.getTime())) throw new Error("addDays: invalid date");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
};

// Canonical STATUS_WORKFLOW-legal path from Draft to each status. Every hop is a
// legal transition (see src/config/statusWorkflow.ts).
const PHASE_CHAIN: Record<CampaignStatus, CampaignStatus[]> = {
  "Draft": ["Draft"],
  "In QA": ["Draft", "In QA"],
  "Ready to launch": ["Draft", "In QA", "Ready to launch"],
  "Running": ["Draft", "In QA", "Ready to launch", "Running"],
  "In Analysis": ["Draft", "In QA", "Ready to launch", "Running", "In Analysis"],
  "Paused": ["Draft", "In QA", "Ready to launch", "Running", "Paused"],
  "Ended": ["Draft", "In QA", "Ready to launch", "Running", "In Analysis", "Ended"],
};

// FNV-1a — a stable hash of the id so phase gaps are deterministic (no Math.random).
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Split `total` days into `n` integers each ~3–7 days, summing to total, seeded
// by rng. `total` is always >= 3*n so every phase clears the 3-day floor.
function splitDuration(total: number, n: number, rng: (min: number, max: number) => number): number[] {
  const parts = new Array(n).fill(3);
  let rem = total - 3 * n;
  // Hand out the surplus one day at a time, keeping phases at or below 7 so
  // segments stay visibly distinct.
  let guard = 0;
  while (rem > 0 && guard < 10000) {
    const k = rng(0, n - 1);
    if (parts[k] < 7) {
      parts[k] += 1;
      rem -= 1;
    }
    guard += 1;
  }
  // Any leftover (every phase already at 7) spills over — only for very short
  // chains that must still reach `total`.
  let k = 0;
  while (rem > 0) {
    parts[k % n] += 1;
    rem -= 1;
    k += 1;
  }
  return parts;
}

// Compact lifecycle: the whole phase sequence spans 15–25 days (>= 3 per phase),
// deterministic from the id. Every phase — including the last — is a BOUNDED
// window ending L days after createdOn; nothing runs open-ended to today, so a
// Draft row is just a short Draft segment near its createdOn. `startedOn` is not
// an input — it is derived from the generated Running phase in CAMPAIGNS below,
// so the first Running phase's `from` equals startedOn by construction.
function generatePhases(id: string, status: CampaignStatus, createdOn: string): Phase[] {
  const chain = PHASE_CHAIN[status];
  const n = chain.length;
  let seed = hashId(id) || 1;
  const rng = (min: number, max: number) => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return min + (seed % (max - min + 1));
  };

  // 15–25 days, but never below 3 days per phase (a 6-phase Ended chain needs 18).
  const total = Math.min(25, Math.max(3 * n, 15 + (hashId(id) % 11)));
  const durations = splitDuration(total, n, rng);

  const froms: string[] = new Array(n);
  froms[0] = createdOn;
  let acc = 0;
  for (let k = 1; k < n; k++) {
    acc += durations[k - 1];
    froms[k] = addDays(createdOn, acc);
  }
  const lastEnd = addDays(createdOn, total);

  return chain.map((s, k) => ({
    status: s,
    from: froms[k],
    to: k < n - 1 ? froms[k + 1] : lastEnd,
  }));
}

const todayStartISO = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

// Phases to render for a campaign. If rows.setStatus overrode c.status so it no
// longer matches the last generated phase, close that phase at today and append
// the current status. The Gantt MUST use this, not c.phases directly.
export function phasesFor(c: Campaign): Phase[] {
  const { phases } = c;
  const last = phases[phases.length - 1];
  if (last.status === c.status) return phases;
  const today = todayStartISO();
  return [
    ...phases.slice(0, -1),
    { ...last, to: today },
    { status: c.status, from: today, to: null },
  ];
}

// Deterministic report generator — seeded off the id (no Math.random), so every
// reload produces the same numbers. Only reuses fields NOT already on Campaign.
function generateReport(
  id: string,
  decision: Decision,
  variations: number,
  visitors: number,
  uniqueConversions: number,
  primaryMetric: string,
  startedOn: string | null
): Report {
  let seed = hashId(id + "-report") || 1;
  const rng = (min: number, max: number) => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return min + (seed % (max - min + 1));
  };

  const requiredDays = rng(14, 45);
  // A campaign that never started has no elapsed duration — 0, never NaN.
  // Otherwise: no-decision rows must read "Conclusion in N days" with N > 0 → elapsed < required.
  const elapsedDays =
    startedOn === null
      ? 0
      : decision === "No decision"
        ? rng(2, Math.max(3, requiredDays - 2))
        : rng(Math.floor(requiredDays / 2), requiredDays + 8);

  const requiredVisitors = Math.max(visitors, 5000) + rng(3000, 45000);
  const requiredConversions = Math.max(uniqueConversions, 100) + rng(80, 2200);
  const traffic = rng(2, 20) * 5; // 10..100
  const trafficSplit: "Equal" | "Custom" = rng(0, 1) === 0 ? "Equal" : "Custom";
  const audience = AUDIENCES[rng(0, AUDIENCES.length - 1)];
  const estimatedEndDate = startedOn ? addDays(startedOn, requiredDays) : null;

  const controlRate = rng(15, 120) / 10; // 1.5% .. 12.0%
  const variants: Variant[] = [
    {
      id: "control",
      label: "C",
      name: "Control",
      convRate: Number(controlRate.toFixed(2)),
      uplift: null,
      confidence: null,
      isBest: false,
    },
  ];
  // listing `variations` = count of non-control variants; report always
  // includes Control + that many Variation N rows.
  for (let v = 1; v <= variations; v++) {
    const uplift = Number((rng(-120, 350) / 10).toFixed(1)); // -12.0 .. 35.0
    const convRate = Number((controlRate * (1 + uplift / 100)).toFixed(2));
    variants.push({
      id: `v${v}`,
      label: `V${v}`,
      name: `Variation ${v}`,
      convRate,
      uplift,
      confidence: rng(40, 99),
      isBest: false,
    });
  }

  // Exactly one isBest for Winner (a variation) / Baseline (the control);
  // none for Inconclusive / No decision.
  if (decision === "Baseline") {
    variants[0].isBest = true;
  } else if (decision === "Winner") {
    let bestIdx = 1;
    for (let v = 2; v < variants.length; v++) {
      if ((variants[v].confidence ?? 0) > (variants[bestIdx].confidence ?? 0)) bestIdx = v;
    }
    const best = variants[bestIdx];
    best.isBest = true;
    best.confidence = Math.max(95, best.confidence ?? 95);
    if ((best.uplift ?? 0) <= 0) best.uplift = Number((rng(20, 300) / 10).toFixed(1));
    best.convRate = Number((controlRate * (1 + (best.uplift ?? 0) / 100)).toFixed(2));
  }

  const pool = OTHER_METRIC_POOL.filter((m) => m !== primaryMetric);
  const offset = rng(0, pool.length - 1);
  const otherMetrics: MetricPerf[] = [];
  for (let k = 0; k < 3; k++) {
    const isNull = rng(0, 3) === 0;
    otherMetrics.push({
      name: pool[(offset + k) % pool.length],
      uplift: isNull ? null : Number((rng(-180, 380) / 10).toFixed(1)),
    });
  }

  return {
    estimatedEndDate,
    elapsedDays,
    requiredDays,
    requiredVisitors,
    requiredConversions,
    traffic,
    trafficSplit,
    audience,
    otherMetrics,
    variants,
  };
}

// All derived fields are pure functions of the row index — deterministic,
// no randomness at runtime.
export const CAMPAIGNS: Campaign[] = BASE.map((row, i) => {
  const started = !NOT_STARTED.includes(row.status);
  const monthOffset = (i * 5) % 17; // Jan 2025 .. May 2026
  const createdOn = iso(
    2025 + Math.floor(monthOffset / 12),
    (monthOffset % 12) + 1,
    ((i * 11) % 27) + 1
  );
  const id = String(7189 + i * 13).padStart(6, "0");
  // Phases drive startedOn: it is exactly the generated Running phase's `from`
  // (null when the chain never reaches Running). createdOn keeps its cross-month
  // spread, so startedOn stays spread across months too.
  const phases = generatePhases(id, row.status, createdOn);
  const startedOn = phases.find((p) => p.status === "Running")?.from ?? null;
  const visitors = started ? ((i * 7919 + 1543) % 91237) + 3000 : 0;
  const variations = (i % 4) + 2;
  const uniqueConversions = Math.round((visitors * ((i % 7) + 3)) / 100);
  const primaryMetric = METRICS[i % METRICS.length];

  // Every Ended campaign MUST conclude — reassign any Ended row still on
  // "No decision" to a real outcome, chosen deterministically from the id.
  let decision = row.decision;
  if (row.status === "Ended" && decision === "No decision") {
    const pick = hashId(id) % 3;
    decision = pick === 0 ? "Winner" : pick === 1 ? "Baseline" : "Inconclusive";
  }

  const report = generateReport(
    id,
    decision,
    variations,
    visitors,
    uniqueConversions,
    primaryMetric,
    startedOn
  );
  // Derive from report + decision (avoid circular import with campaignConclusion).
  let leadingVariation = "—";
  if (started) {
    if (decision === "Baseline") {
      leadingVariation = "Control";
    } else {
      const flagged = report.variants.find((v) => v.isBest);
      if (flagged) {
        leadingVariation = flagged.name;
      } else if (decision === "Winner") {
        const byConf = [...report.variants]
          .filter((v) => v.confidence !== null)
          .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
        leadingVariation = (byConf ?? report.variants[0]!).name;
      }
      // Inconclusive / No decision stay "—"
    }
  }

  return {
    id,
    name: row.name,
    url: `https://mock-multicurrency.myshoprocks.com${row.path}`,
    type: row.type,
    status: row.status,
    decision,
    vitals: !started ? null : (i * 7) % 5 === 0 ? "unhealthy" : "healthy",
    variations,
    visitors,
    uniqueConversions,
    createdOn,
    createdBy: CREATORS[i % CREATORS.length],
    startedOn,
    expectedImprovement: (((i * 137) % 400) - 80) / 10,
    primaryMetric,
    leadingVariation,
    hypothesis: HYPOTHESES[i % HYPOTHESES.length],
    addresses: ADDRESSES[i % ADDRESSES.length],
    labels: row.labels,
    lastUpdated: addDays(startedOn ?? createdOn, (i % 30) + 1),
    phases,
    report,
  };
});
