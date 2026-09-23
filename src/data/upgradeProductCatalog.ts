/** Shared Upgrade product pricing page types + helpers.
 * Per-product catalogs live in upgrade*.ts; layout in UpgradeProductLayout.
 */

export type UpgradePlanId = "starter" | "growth" | "pro" | "enterprise";

export type MtuTier = {
  id: string;
  label: string;
  value: number;
  growthList: number | null;
  growthSale: number | null;
};

export type PlanColumn = {
  id: UpgradePlanId;
  name: string;
  blurb: string;
  cta: "contact" | "add" | "request";
  ctaLabel: string;
  secondaryCta?: string;
  includes: string[];
};

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

export type AddonCard = {
  id: string;
  name: string;
  priceLabel: string;
  availability: string;
};

export type UpgradeFaq = { id: string; q: string; a: string };

export type UpgradeProductCatalog = {
  productName: string;
  mtuBlurb: string;
  mtuTiers: MtuTier[];
  defaultMtuIndex: number;
  planColumns: PlanColumn[];
  activeSubscriptionPlan: UpgradePlanId;
  activeSubscriptionLabel: string;
  featureCategories: FeatureCategory[];
  /** Accordion default open category ids */
  defaultOpenCategories: string[];
  productAddons: AddonCard[];
  accountAddons: AddonCard[];
  faqs: UpgradeFaq[];
  aiCore: string[];
  aiAdvanced: string[];
};

export const SHARED_MTU_TIERS: MtuTier[] = [
  { id: "25k", label: "25K", value: 25_000, growthList: 799, growthSale: 639 },
  { id: "50k", label: "50K", value: 50_000, growthList: 1_199, growthSale: 959 },
  { id: "100k", label: "100K", value: 100_000, growthList: 1_388, growthSale: 1_118 },
  { id: "250k", label: "250K", value: 250_000, growthList: 2_199, growthSale: 1_759 },
  { id: "500k", label: "500K", value: 500_000, growthList: 3_499, growthSale: 2_799 },
  { id: "1m", label: "1M", value: 1_000_000, growthList: 5_499, growthSale: 4_399 },
  { id: "2m", label: "2M", value: 2_000_000, growthList: 8_999, growthSale: 7_199 },
  { id: "5m", label: "5M+", value: 5_000_000, growthList: null, growthSale: null },
];

export const SHARED_PLAN_COLUMNS: PlanColumn[] = [
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

export const SHARED_ACCOUNT_ADDONS: AddonCard[] = [
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

export const SHARED_AI_CORE = ["AI Analyzer", "Insight Data", "VWO Copilot"];
export const SHARED_AI_ADVANCED = [
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

/** Scale Growth list/sale prices; keep nulls. */
export function scaleMtuTiers(scale: number): MtuTier[] {
  return SHARED_MTU_TIERS.map((t) => ({
    ...t,
    growthList:
      t.growthList == null ? null : Math.round(t.growthList * scale),
    growthSale:
      t.growthSale == null ? null : Math.round(t.growthSale * scale),
  }));
}

export function sharedFaqs(productName: string): UpgradeFaq[] {
  return [
    {
      id: "cost",
      q: `How much does ${productName} cost?`,
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
      a: "Optional capabilities billed on top of your base plan for this product.",
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
}

export function buildCatalog(
  partial: Omit<
    UpgradeProductCatalog,
    | "mtuTiers"
    | "defaultMtuIndex"
    | "planColumns"
    | "activeSubscriptionPlan"
    | "activeSubscriptionLabel"
    | "accountAddons"
    | "aiCore"
    | "aiAdvanced"
    | "faqs"
    | "mtuBlurb"
  > &
    Partial<
      Pick<
        UpgradeProductCatalog,
        | "mtuTiers"
        | "defaultMtuIndex"
        | "planColumns"
        | "activeSubscriptionPlan"
        | "activeSubscriptionLabel"
        | "accountAddons"
        | "aiCore"
        | "aiAdvanced"
        | "faqs"
        | "mtuBlurb"
      >
    > & { priceScale?: number }
): UpgradeProductCatalog {
  const {
    priceScale = 1,
    productName,
    featureCategories,
    defaultOpenCategories,
    productAddons,
    ...rest
  } = partial;

  return {
    productName,
    mtuBlurb:
      rest.mtuBlurb ??
      "Select the number of unique visitors that you plan to test in a month. This will be set as your plan's visitor quota.",
    mtuTiers: rest.mtuTiers ?? scaleMtuTiers(priceScale),
    defaultMtuIndex: rest.defaultMtuIndex ?? 2,
    planColumns: rest.planColumns ?? SHARED_PLAN_COLUMNS,
    activeSubscriptionPlan: rest.activeSubscriptionPlan ?? "enterprise",
    activeSubscriptionLabel:
      rest.activeSubscriptionLabel ??
      "Active Subscription: auto-renews in 15 days",
    featureCategories,
    defaultOpenCategories,
    productAddons,
    accountAddons: rest.accountAddons ?? SHARED_ACCOUNT_ADDONS,
    faqs: rest.faqs ?? sharedFaqs(productName),
    aiCore: rest.aiCore ?? SHARED_AI_CORE,
    aiAdvanced: rest.aiAdvanced ?? SHARED_AI_ADVANCED,
  };
}
