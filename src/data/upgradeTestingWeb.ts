/** Dummy catalog for Upgrade → Wingify Testing - Web (/upgrade/testing-web). */

export type UpgradePlanId = "starter" | "growth" | "pro" | "enterprise";

export type MtuTier = {
  id: string;
  label: string;
  value: number;
  /** Monthly Growth list / sale prices in USD when billed annually. */
  growthList: number | null;
  growthSale: number | null;
};

export const MTU_TIERS: MtuTier[] = [
  { id: "25k", label: "25K", value: 25_000, growthList: 799, growthSale: 639 },
  { id: "50k", label: "50K", value: 50_000, growthList: 1_199, growthSale: 959 },
  { id: "100k", label: "100K", value: 100_000, growthList: 1_388, growthSale: 1_118 },
  { id: "250k", label: "250K", value: 250_000, growthList: 2_199, growthSale: 1_759 },
  { id: "500k", label: "500K", value: 500_000, growthList: 3_499, growthSale: 2_799 },
  { id: "1m", label: "1M", value: 1_000_000, growthList: 5_499, growthSale: 4_399 },
  { id: "2m", label: "2M", value: 2_000_000, growthList: 8_999, growthSale: 7_199 },
  { id: "5m", label: "5M+", value: 5_000_000, growthList: null, growthSale: null },
];

export const DEFAULT_MTU_INDEX = 2; // 100k

export type PlanColumn = {
  id: UpgradePlanId;
  name: string;
  blurb: string;
  cta: "contact" | "add" | "request";
  ctaLabel: string;
  secondaryCta?: string;
  includes: string[];
};

export const PLAN_COLUMNS: PlanColumn[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "Businesses wanting to get started",
    cta: "contact",
    ctaLabel: "Contact Sales",
    includes: [],
  },
  {
    id: "growth",
    name: "Growth",
    blurb: "For small businesses",
    cta: "add",
    ctaLabel: "+ Add",
    secondaryCta: "Contact Sales",
    includes: ["Wingz Core Included"],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For mid-sized businesses",
    cta: "request",
    ctaLabel: "Request pricing",
    includes: ["Wingz Core Included"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    blurb: "For large teams, agencies & enterprises",
    cta: "request",
    ctaLabel: "Request pricing",
    includes: ["Wingz Core Included"],
  },
];

/** Active subscription callout sits over the Enterprise column. */
export const ACTIVE_SUBSCRIPTION_PLAN: UpgradePlanId = "enterprise";
export const ACTIVE_SUBSCRIPTION_LABEL =
  "Active Subscription: auto-renews in 15 days";

export type FeatureCell = boolean | "partial" | string;

export type FeatureRow = {
  id: string;
  label: string;
  cells: Record<UpgradePlanId, FeatureCell>;
};

export type FeatureCategory = {
  id: string;
  label: string;
  rows: FeatureRow[];
};

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: "campaign-types",
    label: "Campaign Types",
    rows: [
      {
        id: "ab",
        label: "A/B Testing",
        cells: { starter: false, growth: true, pro: true, enterprise: true },
      },
      {
        id: "split",
        label: "Split URL Testing",
        cells: { starter: false, growth: true, pro: true, enterprise: true },
      },
      {
        id: "rollout",
        label: "Rollout Campaigns",
        cells: { starter: false, growth: true, pro: true, enterprise: true },
      },
      {
        id: "mvt",
        label: "Multivariate (MVT) Testing",
        cells: { starter: false, growth: false, pro: true, enterprise: true },
      },
    ],
  },
  { id: "editor", label: "Editor", rows: [] },
  { id: "editor-library", label: "Editor Library", rows: [] },
  { id: "campaign-settings", label: "Campaign Settings", rows: [] },
  { id: "targeting", label: "Targeting", rows: [] },
  { id: "triggers", label: "Triggers", rows: [] },
  { id: "reports", label: "Reports", rows: [] },
  {
    id: "platform",
    label: "Platform & Account Management",
    rows: [],
  },
  { id: "asset-hub", label: "Asset Hub", rows: [] },
  { id: "wna", label: "Website and Apps", rows: [] },
  { id: "security", label: "Security & Compliance", rows: [] },
  { id: "support", label: "Support", rows: [] },
  { id: "cs", label: "Customer Success", rows: [] },
];

export type AddonCard = {
  id: string;
  name: string;
  priceLabel: string;
  availability: string;
};

export const PRODUCT_ADDONS: AddonCard[] = [
  {
    id: "social-proof",
    name: "Social Proof & Urgency Messaging",
    priceLabel: "$1,099 / month",
    availability: "Available in Pro, Enterprise",
  },
  {
    id: "mutex",
    name: "Mutually Exclusive Groups",
    priceLabel: "$250 / month",
    availability: "Available in Growth, Pro, Enterprise",
  },
  {
    id: "mtu-quota",
    name: "Additional MTU Quota",
    priceLabel: "$150 one-time",
    availability: "Available in Growth, Pro, Enterprise",
  },
];

export const ACCOUNT_ADDONS: AddonCard[] = [
  {
    id: "sso",
    name: "Single Sign-On (SSO)",
    priceLabel: "$499 / month",
    availability: "Available in Pro, Enterprise",
  },
  {
    id: "audit",
    name: "Advanced Audit Log",
    priceLabel: "$199 / month",
    availability: "Available in Growth, Pro, Enterprise",
  },
];

export const UPGRADE_FAQS: { id: string; q: string; a: string }[] = [
  {
    id: "cost",
    q: "How much does Wingify cost?",
    a: "Pricing depends on your Monthly Tracked Users (MTU) and plan. Starter is free; Growth starts from a discounted annual rate based on MTU. Pro and Enterprise are custom.",
  },
  {
    id: "traffic",
    q: "Is pricing based on traffic?",
    a: "Yes. Plans are sized by Monthly Tracked Users — unique visitors your SmartCode sees each month.",
  },
  {
    id: "mtu",
    q: "What is Monthly Tracked Users (MTU)?",
    a: "MTU is the monthly quota of unique visitors tracked across your connected websites and apps.",
  },
  {
    id: "annual",
    q: "Can I pay annually?",
    a: "Growth is billed annually in this mock. Pro and Enterprise billing is arranged with Sales.",
  },
  {
    id: "upgrade",
    q: "How do I upgrade my plan?",
    a: "Use Add on Growth, or Request pricing / Contact Sales for Pro and Enterprise.",
  },
  {
    id: "downgrade",
    q: "Can I downgrade later?",
    a: "Yes — contact Sales or manage renewals from Subscription settings in a live account.",
  },
  {
    id: "trial",
    q: "Is there a free trial?",
    a: "Starter is free forever for getting started. Higher plans can be trialed via Sales.",
  },
  {
    id: "addons",
    q: "What are add-ons?",
    a: "Optional capabilities billed on top of your base plan, such as Social Proof or extra MTU.",
  },
  {
    id: "overage",
    q: "What happens if I exceed MTU?",
    a: "You’ll be prompted to increase quota or purchase Additional MTU Quota before tracking continues uninterrupted.",
  },
  {
    id: "support",
    q: "What support is included?",
    a: "Support tier scales with plan — from docs & community on Starter to dedicated success on Enterprise.",
  },
];

export const AI_CORE = ["AI Analyzer", "Insight Data", "VWO Copilot"];
export const AI_ADVANCED = [
  "Narrative Data",
  "AI-controlled",
  "AI Web Care",
  "Predictive A/B Test",
];

export function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
