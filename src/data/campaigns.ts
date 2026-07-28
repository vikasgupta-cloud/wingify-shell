export type CampaignStatus =
  | "Draft"
  | "In QA"
  | "Ready to launch"
  | "Running"
  | "In Analysis"
  | "Paused"
  | "Ended";
// All statuses in lifecycle order — for status pickers / filters.
export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "Draft",
  "In QA",
  "Ready to launch",
  "Running",
  "In Analysis",
  "Paused",
  "Ended",
];
export type Decision = "Winner" | "Baseline" | "Inconclusive" | "No decision";
// Explicit report-state tag per campaign. Every reportable state is deliberately
// represented (see BASE) so coverage is guaranteed, not incidental. Decision is
// DERIVED from this (decisionForScenario), never the reverse.
export type Scenario =
  | "winner-strong"
  | "winner-marginal"
  | "baseline"
  | "inconclusive"
  | "progress"
  | "collecting-early"
  | "collecting-mixed"
  | "all-disabled"
  | "not-started";
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
  /**
   * Whether this variation has been disabled from the report. Optional; a later
   * data tweak can flip some to true. Undefined/false means active.
   */
  disabled?: boolean;
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

// Where clicking a campaign name lands: post-launch statuses open Reports directly;
// pre-launch statuses (Draft, In QA, Ready to launch) open Configuration.
const REPORTS_LANDING_STATUSES: CampaignStatus[] = [
  "Running",
  "Paused",
  "In Analysis",
  "Ended",
];
export const campaignLandingPath = (c: {
  id: string;
  status: CampaignStatus;
}): string =>
  REPORTS_LANDING_STATUSES.includes(c.status)
    ? `/web-experiment/c/${c.id}/reports`
    : `/web-experiment/c/${c.id}`;

export type Campaign = {
  id: string;
  name: string;
  url: string;
  type: CampaignType;
  status: CampaignStatus;
  /** The report state this campaign is engineered to demonstrate. */
  scenario: Scenario;
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
  "Ava Thornton",
  "Priya Nair",
  "Marco Bianchi",
  "Growth team",
  "Sofia Almeida",
  "Ren Takahashi",
];

// Metric NAMES must match the metrics.ts catalog exactly, so campaignToConfig's
// name→id lookup resolves to a real Metric id. Accessories-flavored names that
// had no catalog entry were mapped to their closest catalog name.
const METRICS = [
  "Add to cart clicks",
  "Checkout completion",
  "Link click rate",
  "Signup button click",
  "Wishlist adds",
  "Revenue per visitor",
  "Transaction rate",
];

const HYPOTHESES = [
  "Showing a sticky Add to Bag on mobile PDPs will keep the buy button in reach and lift add-to-bag rate.",
  "Leading the homepage hero with the new-season scarf edit will pull more shoppers into collections.",
  "Offering express checkout (Shop Pay) will shorten the path to purchase and lift checkout completion.",
  "Surfacing a free-shipping threshold banner will nudge shoppers to add another accessory to qualify.",
  "Placing trust badges and reviews near the buy button will reassure first-time jewelry shoppers.",
  "Bundling matching pieces (earring + necklace sets) will raise average order value and bundle attach rate.",
  "A clearer size & fit guide on ring PDPs will reduce hesitation and returns on sized items.",
  "Capturing back-in-stock and wishlist emails will recover demand we currently lose on sold-out styles.",
];

// The "will address …" clause, parallel to HYPOTHESES by index.
const ADDRESSES = [
  "the drop-off where mobile shoppers lose the buy button while scrolling long PDPs.",
  "the weak entry into collections from a static, off-season homepage hero.",
  "the checkout friction that pushes mobile shoppers to abandon before paying.",
  "the low average order value from shoppers who buy a single accessory and leave.",
  "the hesitation new visitors show before adding higher-consideration jewelry to the bag.",
  "the missed cross-sell when complementary pieces aren't shown together.",
  "the size uncertainty that stalls ring purchases and drives avoidable returns.",
  "the demand we lose when popular styles go out of stock with no way to notify shoppers.",
];

const AUDIENCES = [
  "All visitors",
  "New visitors",
  "Returning visitors",
  "Mobile shoppers",
  "Desktop shoppers",
  "US traffic",
  "Email subscribers",
];

// Catalog-aligned too (see METRICS note above) so report.otherMetrics[].name
// resolves to catalog ids in campaignToConfig.
const OTHER_METRIC_POOL = [
  "Revenue per visitor",
  "Average order value",
  "Exit rate",
  "Add to cart clicks",
  "Checkout completion",
  "Wishlist adds",
  "Pages per session",
];

type BaseRow = {
  name: string;
  path: string;
  type: CampaignType;
  status: CampaignStatus;
  /**
   * The report state this row is engineered to demonstrate. Status stays
   * lifecycle-legal for the scenario; `decision` is derived from this via
   * decisionForScenario. Reportable statuses (Running / In Analysis / Ended)
   * carry a real report scenario; pre-launch + Paused carry "not-started".
   */
  scenario: Scenario;
  labels: string[];
};

// 40 rows deliberately covering every report state. Scenario matrix:
//   winner-strong ×4, winner-marginal ×2, baseline ×3, inconclusive ×3,
//   progress ×7, collecting-early ×3, collecting-mixed ×2, all-disabled ×2,
//   not-started ×14.
// Reportable scenarios sit on Running / In Analysis / Ended; not-started sits on
// Draft / In QA / Ready to launch / Paused. Decision is derived (not stored).
const BASE: BaseRow[] = [
  { name: "PDP — sticky Add to Bag on mobile", path: "/products/gold-hoop-earrings", type: "A/B", status: "Running", scenario: "progress", labels: ["pdp", "mobile"] },
  { name: "Homepage hero — new-season scarves", path: "/", type: "A/B", status: "Running", scenario: "progress", labels: ["homepage"] },
  { name: "Express checkout (Shop Pay) button", path: "/checkout", type: "A/B", status: "In Analysis", scenario: "winner-strong", labels: ["checkout"] },
  { name: "Editorial lookbook on collection pages", path: "/collections/new-arrivals", type: "Multipage", status: "Draft", scenario: "not-started", labels: ["collection"] },
  { name: "Crossbody bag — PDP gallery zoom", path: "/products/leather-crossbody-bag", type: "A/B", status: "Ended", scenario: "winner-strong", labels: ["pdp"] },
  { name: "Free shipping banner at $75 threshold", path: "/", type: "A/B", status: "Running", scenario: "collecting-early", labels: ["homepage", "sale"] },
  { name: "Necklace layering upsell in cart", path: "/cart", type: "MVT", status: "In QA", scenario: "not-started", labels: ["cart"] },
  { name: "Jewelry collection page layout", path: "/collections/jewelry", type: "Split URL", status: "Ended", scenario: "inconclusive", labels: ["collection"] },
  { name: "Sticky Add to Bag on stacking-rings PDP", path: "/products/stackable-rings", type: "A/B", status: "Paused", scenario: "not-started", labels: ["pdp", "mobile"] },
  { name: "Predictive search for accessories", path: "/search", type: "A/B", status: "Running", scenario: "progress", labels: [] },
  { name: "Homepage testimonial carousel", path: "/", type: "MVT", status: "Draft", scenario: "not-started", labels: ["homepage"] },
  { name: "Exit-intent 10% off popup", path: "/collections/sale", type: "A/B", status: "Ended", scenario: "winner-strong", labels: ["sale", "email"] },
  { name: "One-page checkout flow", path: "/checkout", type: "Split URL", status: "In Analysis", scenario: "winner-marginal", labels: ["checkout", "q3-launch"] },
  { name: "Trust badges on silk scarf PDP", path: "/products/silk-twill-scarf", type: "A/B", status: "Running", scenario: "collecting-mixed", labels: ["pdp"] },
  { name: "Product video on sunglasses PDP", path: "/products/cat-eye-sunglasses", type: "A/B", status: "In QA", scenario: "not-started", labels: ["pdp"] },
  { name: "Mega-menu category navigation", path: "/", type: "MVT", status: "Running", scenario: "all-disabled", labels: ["homepage"] },
  { name: "Urgency timer in cart", path: "/cart", type: "A/B", status: "Ended", scenario: "baseline", labels: ["cart"] },
  { name: "Social proof toast on bestsellers", path: "/collections/bestsellers", type: "A/B", status: "Running", scenario: "progress", labels: ["collection"] },
  { name: "Guest checkout emphasis", path: "/checkout", type: "A/B", status: "Ready to launch", scenario: "not-started", labels: ["checkout"] },
  { name: "Homepage personalization for returning shoppers", path: "/", type: "Multipage", status: "Draft", scenario: "not-started", labels: ["homepage", "q3-launch"] },
  { name: "Reviews above the fold on scarf PDP", path: "/products/cashmere-scarf", type: "A/B", status: "In Analysis", scenario: "inconclusive", labels: ["pdp"] },
  { name: "Mini-cart drawer redesign", path: "/cart", type: "A/B", status: "Paused", scenario: "not-started", labels: ["cart"] },
  { name: "Coupon field placement at checkout", path: "/checkout", type: "A/B", status: "Ended", scenario: "baseline", labels: ["checkout", "sale"] },
  { name: "Size & fit guide on ring PDP", path: "/products/signet-ring", type: "A/B", status: "In QA", scenario: "not-started", labels: ["pdp"] },
  { name: "Collection page filter chips", path: "/collections/bags", type: "MVT", status: "Running", scenario: "progress", labels: ["collection"] },
  { name: "Payment icons near pay button", path: "/checkout", type: "A/B", status: "Ready to launch", scenario: "not-started", labels: ["checkout"] },
  { name: "Summer sale headline copy test", path: "/collections/sale", type: "MVT", status: "Ended", scenario: "winner-strong", labels: ["sale"] },
  { name: "Mobile sticky footer Add to Bag", path: "/products/leather-belt", type: "A/B", status: "Running", scenario: "all-disabled", labels: ["mobile", "pdp"] },
  { name: "Gift-finder guided funnel", path: "/collections/gifts", type: "Multipage", status: "In Analysis", scenario: "winner-marginal", labels: ["gifting"] },
  { name: "Spring launch landing page v3", path: "/collections/new-arrivals", type: "Split URL", status: "Paused", scenario: "not-started", labels: ["new-arrivals"] },
  { name: "Newsletter signup modal delay", path: "/", type: "A/B", status: "Running", scenario: "progress", labels: ["homepage", "email"] },
  { name: "New-arrival product badges", path: "/collections/new-arrivals", type: "A/B", status: "In QA", scenario: "not-started", labels: ["new-arrivals"] },
  { name: "Shipping calculator in cart", path: "/cart", type: "A/B", status: "Ready to launch", scenario: "not-started", labels: ["cart"] },
  { name: "Order bump at checkout", path: "/checkout", type: "A/B", status: "Ended", scenario: "inconclusive", labels: ["checkout", "gifting"] },
  { name: "FAQ accordion on sunglasses PDP", path: "/products/aviator-sunglasses", type: "A/B", status: "Running", scenario: "collecting-early", labels: ["pdp"] },
  { name: "Related products rail on hair-claw PDP", path: "/products/velvet-hair-claw", type: "MVT", status: "Running", scenario: "progress", labels: ["pdp"] },
  { name: "Hero video autoplay", path: "/", type: "A/B", status: "Paused", scenario: "not-started", labels: ["homepage"] },
  { name: "Two-step wishlist signup", path: "/account/wishlist", type: "Split URL", status: "Running", scenario: "collecting-mixed", labels: ["email"] },
  { name: "Breadcrumb visibility on scarf collection", path: "/collections/scarves", type: "A/B", status: "Running", scenario: "collecting-early", labels: ["collection"] },
  { name: "Wishlist reminder banner", path: "/account/wishlist", type: "A/B", status: "Ended", scenario: "baseline", labels: ["email"] },
];

// Decision is a pure function of scenario — the single source of truth.
function decisionForScenario(scenario: Scenario): Decision {
  switch (scenario) {
    case "winner-strong":
    case "winner-marginal":
      return "Winner";
    case "baseline":
      return "Baseline";
    case "inconclusive":
      return "Inconclusive";
    default:
      return "No decision";
  }
}

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

// Phases to render for a campaign. The Gantt MUST use this, not c.phases directly.
//
// Each pill boundary is the real date the status changed (the generated per-hop
// `from`s). The TERMINAL pill is what varies:
//   • Ended      → a short, bounded pill sitting on the date the campaign ended;
//                  it does NOT run to today (the campaign's life is over).
//   • everything → the current pill runs open-ended (to: null → today) so a live
//     else         campaign's state always reaches the present.
// If rows.setStatus overrode c.status so it no longer matches the last generated
// phase, that generated tail is closed at today and the current status appended as
// the new terminal pill (its change date is "now").
const ENDED_PILL_DAYS = 1; // short marker pill; widens to the Gantt's MIN_BAR floor
export function phasesFor(c: Campaign): Phase[] {
  const { phases, status } = c;
  const last = phases[phases.length - 1];
  const today = todayStartISO();

  // Historical chain carrying real change-dates, ending in the current status.
  const chain: Phase[] =
    last.status === status
      ? phases
      : [
          ...phases.slice(0, -1),
          { ...last, to: today },
          { status, from: today, to: today },
        ];

  const idx = chain.length - 1;
  const tail = chain[idx];
  const terminal: Phase =
    status === "Ended"
      ? { ...tail, to: addDays(tail.from, ENDED_PILL_DAYS) }
      : { ...tail, to: null };

  return [...chain.slice(0, idx), terminal];
}

// Deterministic report generator — seeded off the id (no Math.random), so every
// reload produces the same numbers. Only reuses fields NOT already on Campaign.
function generateReport(
  id: string,
  scenario: Scenario,
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
  // Elapsed is engineered per scenario so the conclusion copy reads correctly:
  //   • decided (winner/baseline/inconclusive) → long window (reached target)
  //   • progress / all-disabled → past the wait but elapsed < required, so the
  //     listing reads "Conclusion in N days"
  //   • collecting-* → only a few days in
  //   • not-started (no startedOn) → 0, never NaN
  const elapsedDays =
    startedOn === null
      ? 0
      : scenario === "collecting-early"
        ? rng(1, 4)
        : scenario === "collecting-mixed"
          ? rng(3, 7)
          : scenario === "progress" || scenario === "all-disabled"
            ? rng(5, Math.max(6, requiredDays - 3))
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
  // The single designated winning variation for winner-* scenarios (V1).
  const WINNER_INDEX = 1;
  // listing `variations` = count of non-control variants; report always
  // includes Control + that many Variation N rows. Per-variant uplift +
  // confidence are tuned per scenario so the state provably holds — the winner
  // clears its confidence gate, losers/undecided stay below 95, etc.
  for (let v = 1; v <= variations; v++) {
    const isWinner =
      (scenario === "winner-strong" || scenario === "winner-marginal") &&
      v === WINNER_INDEX;
    let uplift: number;
    let confidence: number;
    switch (scenario) {
      case "winner-strong":
        // Clear winner: ≥97 confidence, +6%..+18% uplift; losers stay well below.
        uplift = isWinner ? rng(60, 180) / 10 : rng(-40, 40) / 10;
        confidence = isWinner ? rng(97, 99) : rng(45, 90);
        break;
      case "winner-marginal":
        // Marginal winner: 95..96 confidence, +2%..+5% uplift.
        uplift = isWinner ? rng(20, 50) / 10 : rng(-30, 20) / 10;
        confidence = isWinner ? rng(95, 96) : rng(45, 88);
        break;
      case "baseline":
        // Control wins: no variation is reliable — all confidence < 95.
        uplift = rng(-50, 50) / 10;
        confidence = rng(70, 92);
        break;
      case "inconclusive":
        // No clear winner: uplifts near zero / conflicting, all confidence < 95.
        uplift = rng(-25, 25) / 10;
        confidence = rng(40, 92);
        break;
      case "progress":
        uplift = rng(-40, 120) / 10;
        confidence = rng(45, 88);
        break;
      case "collecting-early":
      case "collecting-mixed":
        uplift = rng(-50, 120) / 10;
        confidence = rng(30, 80);
        break;
      case "all-disabled":
        uplift = rng(-40, 120) / 10;
        confidence = rng(40, 85);
        break;
      case "not-started":
      default:
        uplift = rng(-40, 60) / 10;
        confidence = rng(40, 90);
        break;
    }
    uplift = Number(uplift.toFixed(1));
    const convRate = Number((controlRate * (1 + uplift / 100)).toFixed(2));
    variants.push({
      id: `v${v}`,
      label: `V${v}`,
      name: `Variation ${v}`,
      convRate,
      uplift,
      confidence,
      isBest: false,
    });
  }

  // Exactly one isBest: the control for baseline, the designated winning
  // variation for winner-*; none for inconclusive / No decision scenarios.
  if (scenario === "baseline") {
    variants[0].isBest = true;
  } else if (scenario === "winner-strong" || scenario === "winner-marginal") {
    variants[WINNER_INDEX].isBest = true;
  }

  // all-disabled: every non-control variation is removed from the report.
  if (scenario === "all-disabled") {
    for (let v = 1; v < variants.length; v++) variants[v].disabled = true;
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
  const variations = (i % 4) + 2;
  const scenario = row.scenario;
  const decision = decisionForScenario(scenario);

  // Per-scenario visitor magnitudes, engineered so the UI's own
  // variantVisitors / variantConversionsAllocated (default no-filter context,
  // where reportVisitorScale === 1 because the date span below is ≥ 23 days)
  // cross exactly the collecting thresholds (COLLECT_MIN_VISITORS = 500,
  // COLLECT_MIN_CONVERSIONS = 1). `count` includes control; visitors are split
  // near-evenly (base or base+1) across variants.
  const count = variations + 1;
  const jitter = hashId(id) % 200; // small deterministic spread, never crosses a gate
  let visitors: number;
  switch (scenario) {
    case "not-started":
      // Draft/QA/Ready to launch never ran (visitors 0); Paused did run, so it
      // keeps a real, cleared sample so its report renders sensibly.
      visitors = started ? 1500 * count + jitter : 0;
      break;
    case "winner-strong":
      visitors = 3000 * count + jitter; // large sample → high confidence is believable
      break;
    case "winner-marginal":
    case "baseline":
    case "inconclusive":
      visitors = 2000 * count + jitter; // all variants well past 500
      break;
    case "progress":
      visitors = 1000 * count + jitter; // baseline + variations all cleared, mid sample
      break;
    case "all-disabled":
      visitors = 1200 * count + jitter;
      break;
    case "collecting-early":
      // Every variant lands ~300 visitors — under 500 — so the baseline never
      // clears and the campaign reads collecting overall.
      visitors = 300 * count + (hashId(id) % 60);
      break;
    case "collecting-mixed":
      // base = 499, remainder = 2 → control (idx 0) and V1 (idx 1) reach 500
      // (cleared); every later variation sits at 499 (still "Collecting data").
      // Campaign is NOT collecting overall (baseline + one variant cleared).
      visitors = 499 * count + 2;
      break;
  }
  const uniqueConversions = Math.round((visitors * ((i % 7) + 3)) / 100);
  const primaryMetric = METRICS[i % METRICS.length];

  const report = generateReport(
    id,
    scenario,
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
    scenario,
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
    // ≥ 23-day span from start → to keeps the default report date range at
    // reportVisitorScale === 1, so the engineered per-variant counts above are
    // exactly what the UI evaluates against the 500/1 thresholds.
    lastUpdated: addDays(startedOn ?? createdOn, 24 + (i % 10)),
    phases,
    report,
  };
});
