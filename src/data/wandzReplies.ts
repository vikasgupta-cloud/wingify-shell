import type { WandzContext } from "../store/wandz";

// NOTE: Everything here is scripted. No model, no network — replyFor() hashes
// the user's message and picks a plausible, context-shaped response so the same
// question always yields the same answer within a session.

export function greetingFor(ctx: WandzContext): string {
  switch (ctx.kind) {
    case "campaign":
      return "Hi — I can help with this campaign. Ask me about its setup, metrics, or what to try next.";
    case "section":
      return `Ask me anything about ${ctx.sectionLabel}. I can suggest options or explain what each setting does.`;
    case "general":
      return "Hi, I'm Wandz. Ask me about your campaigns, metrics, or experiments.";
  }
}

// Small, stable string hash → non-negative index.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Keyword-shaped pools, so a message that mentions a topic gets a topical reply;
// otherwise we fall back to the general pool. Kept generic — no invented numbers
// about the user's own data.
const HYPOTHESIS_POOL = [
  "A strong hypothesis frames an expectation and names the metric it should move — e.g. \"showing shipping cost earlier will reduce checkout drop-off.\" Tie it to your success metric so the result is unambiguous.",
  "Try the \"we believe / will result in / measured by\" shape. State the change, the outcome you expect, and the single metric that confirms it — that keeps the read at the end clean.",
  "Good hypotheses are falsifiable: if the metric doesn't move, you've learned something. Anchor it to one primary metric rather than a bundle, and note the audience it applies to.",
];

const METRIC_POOL = [
  "Three roles to keep straight:\n• Success — the one decisions are based on.\n• Observation — tracked for context, not for the call.\n• Protection — guardrails that flag regressions.\nPick exactly one success metric so the verdict stays clear.",
  "Your success metric drives the decision; observation metrics add colour; protection metrics catch collateral damage. If a variation wins on success but trips a protection metric, that's worth pausing on.",
  "Choose a success metric close to the behaviour you're changing — a step-level conversion beats a distant revenue number for sensitivity. Add protection metrics for anything you don't want to quietly break.",
];

const TRAFFIC_POOL = [
  "Two different dials: allocation is how much of eligible traffic enters the campaign at all; split is how that traffic divides across variations. Lower allocation derisks; even split maximises statistical power.",
  "If you're unsure, start with a full even split and moderate allocation, then adjust. Uneven splits are fine when you want to protect most users from an unproven variation.",
  "Allocation controls exposure, split controls comparison. Keep the split even unless you have a reason not to — it's the fastest route to significance.",
];

const NEXTSTEP_POOL = [
  "A sensible next step: confirm the hypothesis names one metric, check the split totals 100%, and make sure targeting matches where the change actually appears.",
  "Before launch, sanity-check three things — the success metric, the page targeting, and the traffic split. Those are where most misconfigured tests go wrong.",
  "If results look flat, widen the audience or run longer before concluding — underpowered tests read as \"no effect\" when they're really just early.",
];

const GENERAL_POOL = [
  "Happy to help. Tell me what you're trying to decide and I'll walk through the trade-offs.",
  "I can explain any setting on this page or suggest how to structure the experiment — what would be most useful?",
  "Good question. In general, keep one clear success metric and change one thing at a time so the result is easy to read.",
  "I can help you frame a hypothesis, pick metrics, or set traffic. Which would you like to start with?",
];

function pick(pool: string[], seed: string): string {
  return pool[hash(seed) % pool.length];
}

export function replyFor(ctx: WandzContext, userMessage: string): string {
  const m = userMessage.toLowerCase();
  const seed = contextSeed(ctx) + "|" + userMessage;

  if (/hypothes/.test(m)) return pick(HYPOTHESIS_POOL, seed);
  if (/metric|conversion|goal/.test(m)) return pick(METRIC_POOL, seed);
  if (/traffic|split|allocat|audience|segment/.test(m)) return pick(TRAFFIC_POOL, seed);
  if (/next|should|recommend|improve|suggest|what do/.test(m))
    return pick(NEXTSTEP_POOL, seed);

  return pick(GENERAL_POOL, seed);
}

function contextSeed(ctx: WandzContext): string {
  switch (ctx.kind) {
    case "campaign":
      return `c:${ctx.campaignId}`;
    case "section":
      return `s:${ctx.sectionLabel}`;
    case "general":
      return "g";
  }
}
