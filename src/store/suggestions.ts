import { create } from "zustand";
import type { Campaign } from "../data/campaigns";
import {
  campaignBestVariant,
  conclusionTitle,
} from "../data/campaignConclusion";

export type SuggestionCategory =
  | "traffic"
  | "hypothesis"
  | "metrics"
  | "targeting"
  | "learnings";

export type SuggestionStatus = "new" | "applied" | "dismissed";

export type CampaignSuggestion = {
  id: string;
  category: SuggestionCategory;
  title: string;
  body: string;
  status: SuggestionStatus;
  at: string; // ISO
};

export const SUGGESTION_CATEGORY_LABEL: Record<SuggestionCategory, string> = {
  traffic: "Traffic",
  hypothesis: "Hypothesis",
  metrics: "Metrics",
  targeting: "Targeting",
  learnings: "Learnings",
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

let idSeq = 0;
const uid = () => `sug-${(idSeq += 1)}`;

function fmtUplift(n: number | null): string {
  if (n === null) return "no lift yet";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

/**
 * Scripted top insights shaped by this campaign’s report — no model, no network.
 * Same campaign always gets a stable set for a given generation.
 */
export function generateSuggestionsFor(
  campaign: Campaign,
  generation = 0
): CampaignSuggestion[] {
  const best = campaignBestVariant(campaign);
  const decisionLabel = conclusionTitle(campaign);
  const seed = `${campaign.id}:${generation}`;
  const primary = campaign.primaryMetric;
  const variants = campaign.report.variants;
  const control = variants[0]?.name ?? "Control";
  const challenger =
    variants.find((v) => v.id !== variants[0]?.id)?.name ?? "Variation 1";
  const now = new Date().toISOString();
  const hasWinner = campaign.decision === "Winner";
  const visitors = campaign.visitors.toLocaleString();
  const bestConf =
    best.confidence !== null ? `${best.confidence}%` : "still collecting";
  const bestLift = fmtUplift(best.uplift);
  const status = campaign.status;

  const pools: Omit<CampaignSuggestion, "id" | "at" | "status">[] = [
    {
      category: "metrics",
      title: `${best.name} is ${bestLift} on ${primary}`,
      body: `On “${campaign.name}”, ${best.name} shows ${bestLift} vs ${control} for ${primary}, at ${bestConf} confidence. Decision so far: ${decisionLabel}. Keep ${primary} as the sole success metric so the read stays unambiguous.`,
    },
    {
      category: "traffic",
      title: `${visitors} visitors across ${variants.length} variations`,
      body: `“${campaign.name}” has logged ${visitors} visitors while ${status}. With ${variants.length} variations live, an even split maximises power. If you’re protecting users, lower total allocation rather than skewing the split.`,
    },
    {
      category: "hypothesis",
      title: `Does ${challenger} move ${primary}?`,
      body: `Frame the hypothesis for this campaign: we believe the change in ${challenger} will improve ${primary} vs ${control}. A falsifiable read makes a “${decisionLabel}” outcome easier to act on.`,
    },
    {
      category: "targeting",
      title: `Confirm targeting matches where ${challenger} changes`,
      body: `Audience for “${campaign.name}” should match the surfaces ${challenger} actually alters. Broad targeting with a narrow visual change underpowers the ${primary} comparison and slows time-to-read.`,
    },
    {
      category: "learnings",
      title: hasWinner
        ? `Ship ${best.name} and capture the learning`
        : `“${campaign.name}” read: ${decisionLabel}`,
      body: hasWinner
        ? `${best.name} leads on ${primary} (${bestLift}, ${bestConf}). Document why it won on this campaign, roll the change forward, then open a follow-up on the next funnel friction.`
        : `Current decision: ${decisionLabel}. Log sample size (${visitors} visitors), audience, and creative for “${campaign.name}”, then design the next test around the weakest funnel step.`,
    },
  ];

  const rotated = [...pools];
  const offset = hash(seed) % rotated.length;
  const ordered = [
    ...rotated.slice(offset),
    ...rotated.slice(0, offset),
  ];

  const count = 3 + (hash(seed + ":n") % 2);
  return ordered.slice(0, count).map((s, i) => ({
    ...s,
    id: uid(),
    status: "new" as const,
    at: new Date(Date.now() - i * 1000).toISOString() || now,
  }));
}

/** A/B testing accordion categories — questions interpolate campaign context. */
export type InsightCategoryId =
  | "variation"
  | "stats"
  | "traffic"
  | "metrics"
  | "audience"
  | "learnings";

export type InsightQuestion = {
  id: string;
  label: string;
  answer: string;
};

export type InsightCategory = {
  id: InsightCategoryId;
  title: string;
  questions: InsightQuestion[];
};

export function buildAbInsightCategories(
  campaign: Campaign
): InsightCategory[] {
  const best = campaignBestVariant(campaign);
  const decisionLabel = conclusionTitle(campaign);
  const primary = campaign.primaryMetric;
  const variants = campaign.report.variants;
  const control = variants[0]?.name ?? "Control";
  const challenger =
    variants.find((v) => v.id !== variants[0]?.id)?.name ?? "Variation 1";
  const visitors = campaign.visitors.toLocaleString();
  const bestConf =
    best.confidence !== null ? `${best.confidence}%` : "still collecting";
  const bestLift = fmtUplift(best.uplift);
  const name = campaign.name;

  return [
    {
      id: "variation",
      title: "Variation Performance",
      questions: [
        {
          id: "var-novelty",
          label: `Could ${challenger}’s lift on ${primary} be a novelty effect?`,
          answer: `${challenger} shows ${bestLift} on ${primary} vs ${control} (${bestConf}). Early lifts often fade once the change feels familiar — check whether the gap held in the second half of “${name}” before shipping.`,
        },
        {
          id: "var-loser",
          label: `Which variation is quietly dragging down ${primary}?`,
          answer: `Besides ${best.name} (${bestLift}), scan the other ${variants.length - 1} variations in “${name}” for negative or flat ${primary}. A single underperformer can mask a strong challenger if you only look at the winner.`,
        },
        {
          id: "var-interaction",
          label: `Are ${challenger} and ${control} competing for the same conversions?`,
          answer: `If visitors can see both experiences (flicker, multi-tab, or overlapping campaigns), ${primary} comparisons on “${name}” get noisy. Confirm mutually exclusive assignment before trusting ${bestLift}.`,
        },
      ],
    },
    {
      id: "stats",
      title: "Statistical Confidence",
      questions: [
        {
          id: "stat-peek",
          label: "Am I peeking too often and inflating false winners?",
          answer: `${best.name} is at ${bestConf} on ${primary} (${decisionLabel}). Repeated early looks raise false-positive risk — decide on a peeking policy or sequential method before treating “${name}” as shippable.`,
        },
        {
          id: "stat-mde",
          label: `Is the detectable lift on ${primary} smaller than we care about?`,
          answer: `With ${visitors} visitors across ${variants.length} variations, tiny ${primary} moves may never clear confidence. If the business needs more than ${bestLift} to matter, “${name}” may be underpowered for a useful decision.`,
        },
        {
          id: "stat-regression",
          label: "Could a winner on the primary hide a regression elsewhere?",
          answer: `${best.name} leads on ${primary}, but decision “${decisionLabel}” shouldn’t ignore guardrails. Check revenue, bounce, or next-step rates before calling “${name}” done.`,
        },
      ],
    },
    {
      id: "traffic",
      title: "Traffic & Allocation",
      questions: [
        {
          id: "traf-daypart",
          label: "Is weekday vs weekend traffic flipping the result?",
          answer: `“${name}” has ${visitors} visitors so far. If ${primary} behaves differently by day-of-week, stopping mid-cycle can crown the wrong variation — prefer full weekly cycles before locking ${decisionLabel}.`,
        },
        {
          id: "traf-bot",
          label: "How much of this sample might be bots or low-intent traffic?",
          answer: `Inflated sample size without real ${primary} events makes confidence look better than it is. Filter known bots and QA traffic on “${name}” so ${best.name}’s ${bestLift} reflects humans.`,
        },
        {
          id: "traf-ramp",
          label: "Should I ramp allocation instead of a hard 50/50?",
          answer: `For risky changes, start “${name}” at low allocation, then move to an even split across ${variants.length} variations once tracking looks clean — that protects users without permanently starving ${primary} power.`,
        },
      ],
    },
    {
      id: "metrics",
      title: "Metrics & Goals",
      questions: [
        {
          id: "met-proxy",
          label: `Is ${primary} a proxy that could win while revenue loses?`,
          answer: `Optimising only ${primary} on “${name}” can reward clicks or adds that don’t pay off. Pair ${primary} with a revenue or downstream guardrail before shipping ${best.name}.`,
        },
        {
          id: "met-lag",
          label: "Are delayed conversions making this look worse than it is?",
          answer: `If ${primary} can convert days later, early reads of “${name}” undercount ${challenger}. Extend the attribution window or wait for lag before trusting ${bestLift}.`,
        },
        {
          id: "met-srm",
          label: "Could a tracking bug be creating a fake lift?",
          answer: `Sample-ratio mismatch or uneven event firing between ${control} and ${challenger} can fake ${primary} wins. Validate event parity on “${name}” before acting on ${decisionLabel}.`,
        },
      ],
    },
    {
      id: "audience",
      title: "Audience & Targeting",
      questions: [
        {
          id: "aud-simpson",
          label: "Could a segment reverse the overall winner (Simpson’s paradox)?",
          answer: `${best.name} leads overall on ${primary}, but a large segment might prefer ${control}. Slice “${name}” by new vs returning (or device) before a blanket rollout.`,
        },
        {
          id: "aud-loyalty",
          label: "Are loyal visitors resisting the change while new ones love it?",
          answer: `Returning shoppers often stick to habits; new visitors may drive ${challenger}’s ${primary} lift. If loyalty and acquisition disagree on “${name}”, ship with audience-aware rollout.`,
        },
        {
          id: "aud-geo",
          label: "Is one region carrying the entire win?",
          answer: `A geo-heavy lift can make ${best.name} look universal. Confirm ${primary} holds outside the top region before rolling “${name}” everywhere.`,
        },
      ],
    },
    {
      id: "learnings",
      title: "Learnings & Next Steps",
      questions: [
        {
          id: "learn-mechanism",
          label: `Why did ${best.name} move ${primary} — mechanism or coincidence?`,
          answer: `Document the behavioural reason (clarity, trust, speed) behind ${bestLift} on “${name}”, not just the number. Mechanism-backed learnings transfer; coincident wins don’t.`,
        },
        {
          id: "learn-counter",
          label: "What would falsify this result in a follow-up?",
          answer: `Design the next test to stress the same claim: if ${challenger} helped ${primary} via X, remove or invert X. A result that can’t be falsified shouldn’t guide the roadmap after “${name}”.`,
        },
        {
          id: "learn-portfolio",
          label: "How does this fit the rest of the experiment backlog?",
          answer:
            campaign.decision === "Winner"
              ? `Ship ${best.name}, bank the ${primary} learning (${bestLift}), then prioritise the next highest-friction step — don’t stack overlapping tests on the same URL as “${name}”.`
              : `Treat “${decisionLabel}” as information: retire weak ideas, double down where qualitative signal aligned with ${primary}, and avoid retesting the same change without a new mechanism.`,
        },
      ],
    },
  ];
}

type CampaignSuggestionsSlice = {
  items: CampaignSuggestion[];
  generation: number;
  pending: boolean;
};

type SuggestionsState = {
  byCampaign: Record<string, CampaignSuggestionsSlice>;
  /** Kick off (or refresh) AI insights for a campaign. */
  generate: (campaign: Campaign, opts?: { refresh?: boolean }) => void;
  apply: (campaignId: string, suggestionId: string) => void;
  dismiss: (campaignId: string, suggestionId: string) => void;
  clearCampaign: (campaignId: string) => void;
};

const EMPTY_SLICE: CampaignSuggestionsSlice = {
  items: [],
  generation: 0,
  pending: false,
};

export const useSuggestionsStore = create<SuggestionsState>((set, get) => ({
  byCampaign: {},

  generate: (campaign, opts) => {
    const refresh = Boolean(opts?.refresh);
    const existing = get().byCampaign[campaign.id];
    if (existing?.pending) return;
    if (existing && existing.items.length > 0 && !refresh) return;

    const nextGen = (existing?.generation ?? 0) + (refresh ? 1 : 0);
    set((s) => ({
      byCampaign: {
        ...s.byCampaign,
        [campaign.id]: {
          items: refresh ? [] : existing?.items ?? [],
          generation: nextGen,
          pending: true,
        },
      },
    }));

    const delay = 900 + (hash(campaign.id + String(nextGen)) % 700);
    window.setTimeout(() => {
      const items = generateSuggestionsFor(campaign, nextGen);
      set((s) => ({
        byCampaign: {
          ...s.byCampaign,
          [campaign.id]: {
            items,
            generation: nextGen,
            pending: false,
          },
        },
      }));
    }, delay);
  },

  apply: (campaignId, suggestionId) =>
    set((s) => {
      const slice = s.byCampaign[campaignId];
      if (!slice) return s;
      return {
        byCampaign: {
          ...s.byCampaign,
          [campaignId]: {
            ...slice,
            items: slice.items.map((item) =>
              item.id === suggestionId
                ? { ...item, status: "applied" as const }
                : item
            ),
          },
        },
      };
    }),

  dismiss: (campaignId, suggestionId) =>
    set((s) => {
      const slice = s.byCampaign[campaignId];
      if (!slice) return s;
      return {
        byCampaign: {
          ...s.byCampaign,
          [campaignId]: {
            ...slice,
            items: slice.items.map((item) =>
              item.id === suggestionId
                ? { ...item, status: "dismissed" as const }
                : item
            ),
          },
        },
      };
    }),

  clearCampaign: (campaignId) =>
    set((s) => {
      const { [campaignId]: _removed, ...rest } = s.byCampaign;
      return { byCampaign: rest };
    }),
}));

export function useCampaignSuggestions(
  campaignId: string | undefined
): CampaignSuggestionsSlice {
  return useSuggestionsStore((s) =>
    campaignId ? s.byCampaign[campaignId] ?? EMPTY_SLICE : EMPTY_SLICE
  );
}
