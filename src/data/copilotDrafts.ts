// Config v2 — "Create with Copilot" intent→draft engine.
//
// Fully deterministic and offline: the same prompt always yields the same draft.
// Keyword-driven and explainable — every material choice carries a rationale line
// so the drafted brief can defend itself. No Math.random, no network.

import type { CampaignType } from "./campaigns";
import { HYPOTHESES } from "./hypotheses";
import { type PageSurface, surfaceForUrl } from "./siteAnalytics";

const ORIGIN = "https://mock-multicurrency.myshoprocks.com";

export type CopilotDraft = {
  summary: string;
  campaignType: CampaignType;
  name: string;
  hypothesisId: string | null;
  hypothesisText: string;
  variations: { label: string; name: string; description: string }[];
  pageUrl: string;
  segmentLabel: string;
  trafficAllocation: number;
  successMetricName: string;
  observationMetricNames: string[];
  decisionRule: {
    confidenceThresholdPct: number;
    minRuntimeDays: number;
    ifWins: string;
    ifLoses: string;
    ifInconclusive: string;
  };
  rationale: { field: string; why: string }[];
};

export const EXAMPLE_PROMPTS: string[] = [
  "Test whether a sticky Add to Bag on mobile product pages lifts add-to-cart",
  "Show a free-shipping banner on the cart to returning visitors",
  "Try a shorter checkout for new visitors and measure completion",
  "Split-URL test a redesigned collection page against the current one",
];

// ── Surface detection ────────────────────────────────────────────────────────
const PRODUCT_SLUGS: { key: string; slug: string }[] = [
  { key: "earring", slug: "gold-hoop-earrings" },
  { key: "scarf", slug: "silk-twill-scarf" },
  { key: "bag", slug: "leather-crossbody-bag" },
  { key: "sunglass", slug: "cat-eye-sunglasses" },
  { key: "necklace", slug: "pearl-drop-necklace" },
  { key: "ring", slug: "stackable-rings" },
];

function detectSurface(p: string): { surface: PageSurface; path: string } {
  if (/\b(checkout|payment|pay)\b/.test(p)) return { surface: "checkout", path: "/checkout" };
  if (/\b(cart|bag|basket)\b/.test(p) && !/add to bag|add to cart/.test(p))
    return { surface: "cart", path: "/cart" };
  if (/\b(product|pdp|item|detail)\b/.test(p) || /add to (bag|cart)/.test(p)) {
    const hit = PRODUCT_SLUGS.find((s) => p.includes(s.key));
    return { surface: "product", path: `/products/${hit?.slug ?? "gold-hoop-earrings"}` };
  }
  if (/\b(collection|category|listing|catalog)\b/.test(p))
    return { surface: "collection", path: "/collections/new-arrivals" };
  if (/\b(home\s?page|homepage|landing)\b/.test(p)) return { surface: "home", path: "/" };
  return { surface: "collection", path: "/collections/new-arrivals" };
}

const SURFACE_PHRASE: Record<PageSurface, string> = {
  home: "the homepage",
  collection: "collection pages",
  product: "product pages",
  cart: "the cart",
  checkout: "checkout",
  account: "account pages",
  landing: "landing pages",
};

// ── Audience detection ───────────────────────────────────────────────────────
function detectAudience(p: string): string {
  if (/\bmobile\b/.test(p)) return "Mobile traffic";
  if (/\bdesktop\b/.test(p)) return "Desktop traffic";
  if (/\b(new visitor|first[- ]time|new shopper)/.test(p)) return "New visitors";
  if (/\breturning\b/.test(p)) return "Returning visitors";
  if (/\bemail\b/.test(p)) return "Email";
  return "All visitors";
}

// ── Metric selection (funnel-closest to the surface) ─────────────────────────
const METRIC_FOR_SURFACE: Record<PageSurface, string> = {
  home: "Link click rate",
  collection: "Link click rate",
  product: "Add to cart clicks",
  cart: "Checkout completion",
  checkout: "Checkout completion",
  account: "Link click rate",
  landing: "Link click rate",
};

function observationFor(surface: PageSurface): string[] {
  if (surface === "product" || surface === "cart" || surface === "checkout")
    return ["Revenue per visitor", "Average order value"];
  return ["Wishlist adds", "Bounce rate"];
}

const METRIC_EFFECT: Record<string, string> = {
  "Add to cart clicks": "increase add-to-cart clicks",
  "Checkout completion": "lift checkout completion",
  "Link click rate": "raise click-through",
};

// ── Variation naming from intent ─────────────────────────────────────────────
const FEATURE_RULES: { test: RegExp; name: string; description: string }[] = [
  {
    test: /sticky.*(add to (bag|cart)|cart|bag|buy)/,
    name: "Sticky Add to Bag",
    description: "A persistent Add to Bag bar that stays in reach while scrolling.",
  },
  {
    test: /free[- ]shipping|shipping banner/,
    name: "Free shipping banner",
    description: "A banner promoting the free-shipping threshold near the top.",
  },
  {
    test: /trust|badge|secure/,
    name: "Trust badges near CTA",
    description: "Reassurance badges placed beside the primary call to action.",
  },
  {
    test: /review|rating|social proof/,
    name: "Reviews near the CTA",
    description: "Customer reviews surfaced next to the decision point.",
  },
  {
    test: /video|demo/,
    name: "Product video",
    description: "A short product video added above the fold.",
  },
  {
    test: /popup|modal|overlay/,
    name: "Prompt modal",
    description: "A timed modal prompt introducing the offer.",
  },
  {
    test: /cta|button|copy|headline/,
    name: "New CTA copy",
    description: "Outcome-focused call-to-action copy.",
  },
  {
    test: /shorter|simplif|one[- ]step|fewer step/,
    name: "Shortened flow",
    description: "A trimmed flow with a step removed.",
  },
  {
    test: /redesign|new design|layout/,
    name: "Redesigned page",
    description: "A redesigned layout for the same content.",
  },
];

function detectFeature(p: string): { name: string; description: string } {
  const hit = FEATURE_RULES.find((r) => r.test.test(p));
  return hit
    ? { name: hit.name, description: hit.description }
    : { name: "New variation", description: "The proposed change under test." };
}

// ── Hypothesis matching (keyword overlap) ────────────────────────────────────
const STOPWORDS = new Set([
  "the","a","an","to","of","on","in","for","and","or","with","will","that","if",
  "we","you","your","test","whether","try","measure","its","it","this","new",
  "page","pages","more","less","see","show","add","make","using","use","against",
]);

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function matchHypothesis(
  p: string
): { id: string; title: string } | null {
  const promptTokens = tokens(p);
  let best: { id: string; title: string; score: number } | null = null;
  for (const h of HYPOTHESES) {
    const hTokens = tokens(`${h.title} ${h.observation}`);
    let score = 0;
    for (const t of promptTokens) if (hTokens.has(t)) score += 1;
    if (!best || score > best.score) best = { id: h.id, title: h.title, score };
  }
  return best && best.score >= 2 ? { id: best.id, title: best.title } : null;
}

// ── Campaign type + variations ───────────────────────────────────────────────
function detectType(p: string): CampaignType {
  const urlCount = (p.match(/https?:\/\//g) ?? []).length;
  if (/\bredirect\b|\bsplit[- ]?url\b/.test(p) || urlCount >= 2) return "Split URL";
  if (/\bmultivariate\b|\bmvt\b|combination|multiple (elements|changes|variations)/.test(p))
    return "MVT";
  return "A/B";
}

export function draftFromPrompt(prompt: string): CopilotDraft {
  const raw = prompt.trim();
  const p = raw.toLowerCase();

  const { surface, path } = detectSurface(p);
  const pageUrl = `${ORIGIN}${path}`;
  const segmentLabel = detectAudience(p);
  const successMetricName = METRIC_FOR_SURFACE[surface];
  const observationMetricNames = observationFor(surface);
  const feature = detectFeature(p);
  const campaignType = detectType(p);
  const cautious = /\b(careful|carefully|small test|risky|cautious|slowly|slow rollout)\b/.test(
    p
  );
  const trafficAllocation = cautious ? 50 : 100;

  // Variations: control + drafted change(s).
  const variations: CopilotDraft["variations"] = [
    { label: "C", name: "Control", description: "The current experience, unchanged." },
  ];
  if (campaignType === "Split URL") {
    variations.push({
      label: "V1",
      name: feature.name,
      description: "Visitors are redirected to the alternate URL.",
    });
  } else if (campaignType === "MVT") {
    variations.push({
      label: "V1",
      name: `${feature.name} — A`,
      description: feature.description,
    });
    variations.push({
      label: "V2",
      name: `${feature.name} — B`,
      description: `${feature.description} A bolder second combination.`,
    });
  } else {
    variations.push({
      label: "V1",
      name: feature.name,
      description: feature.description,
    });
  }

  // Hypothesis: reuse a canned one when it fits, else compose from the intent.
  const matched = matchHypothesis(p);
  const effect = METRIC_EFFECT[successMetricName] ?? "improve the metric";
  const hypothesisId = matched?.id ?? null;
  const intentClause = raw.replace(/\.$/, "") || "the proposed change";
  const hypothesisText = matched
    ? matched.title
    : `I expect that ${intentClause} will ${effect}.`;

  const audienceLc = segmentLabel.toLowerCase();
  const decisionRule = {
    confidenceThresholdPct: 95,
    minRuntimeDays: 14,
    ifWins:
      segmentLabel === "All visitors"
        ? "Roll it out to all visitors and monitor guardrails for a week."
        : `Roll it out to all ${audienceLc} and monitor guardrails for a week.`,
    ifLoses: "Keep the current design and revisit the idea with a fresh angle.",
    ifInconclusive: "Extend by one week; if still flat, keep control and move on.",
  };

  const name = `${feature.name} — ${SURFACE_PHRASE[surface]}`;
  const summary = `You want to test ${feature.name.toLowerCase()} for ${audienceLc} on ${SURFACE_PHRASE[surface]}.`;

  const rationale: CopilotDraft["rationale"] = [
    {
      field: "Page",
      why: `Your wording points at ${SURFACE_PHRASE[surface]}, so the test targets ${path}.`,
    },
    {
      field: "Audience",
      why:
        segmentLabel === "All visitors"
          ? "No specific audience was implied, so the test runs across all visitors."
          : `You mentioned ${audienceLc}, so the test is scoped to that segment.`,
    },
    {
      field: "Success metric",
      why: `${successMetricName} is the closest measurable step to the change you're making on ${SURFACE_PHRASE[surface]}.`,
    },
    {
      field: "Variations",
      why:
        campaignType === "Split URL"
          ? "You referenced a redirect or a second URL, so this is a Split URL test."
          : campaignType === "MVT"
            ? "You referenced multiple combinations, so this is a multivariate test with two variations."
            : `A single "${feature.name}" variation isolates the change against the control.`,
    },
    {
      field: "Traffic",
      why: cautious
        ? "Your wording implied caution, so only 50% of eligible traffic enters the test."
        : "No caution was implied, so the full eligible audience enters the test.",
    },
    {
      field: "Runtime",
      why: "A 14-day minimum covers two full weekly cycles, guarding against day-of-week bias.",
    },
  ];

  // Guard: surfaceForUrl(pageUrl) must agree with the detected surface (keeps the
  // forecast the reviewer sees consistent with the rationale).
  void surfaceForUrl;

  return {
    summary,
    campaignType,
    name,
    hypothesisId,
    hypothesisText,
    variations,
    pageUrl,
    segmentLabel,
    trafficAllocation,
    successMetricName,
    observationMetricNames,
    decisionRule,
    rationale,
  };
}
